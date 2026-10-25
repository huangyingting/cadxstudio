# System Architecture & Data Model — CADxStudio

## 1. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                        Next.js 16 App Router (React 19)                           |
|                                                                                   |
|  +----------------------------------+   +--------------------------------------+  |
|  | Marketing, Courses & CMS Surface |   | CADx Design Engine & Admin Surface   |  |
|  | - / (3D Hero, Workflow, Bento)   |   | - /engine (Studio Moodboard + 3D WB) |  |
|  | - /drawing, /enterprise, /api    |   | - /engine/drawing (2D ISO/ASME HLR)  |  |
|  | - /docs (12 Courses + 13 FAQs)   |   | - /view/[token] (Public 3D Viewer)   |  |
|  | - /blog, /blog/[slug] (11 Posts) |   | - /login, /register (Invite-Only)    |  |
|  | - /pricing, /pro-plan, /about    |   | - /admin (Invites, Users, AuditLog)  |  |
|  +-----------------+----------------+   +-------------------+------------------+  |
|                    |                                        |                     |
|                    v                                        v                     |
|  +-----------------------------------------------------------------------------+  |
|  | Client CAD & Graphics Subsystem                                             |  |
|  | - Parametric CAD Kernel (src/lib/cad-kernel.ts): Replicad/CSG + Annotations |  |
|  | - 3D Viewport (Three.js): B-Rep Mesh + Edges, Section Cut, Explode, Measure |  |
|  | - Studio Renderer: PBR Materials, HDRI Lighting, Progressive Ray-Trace Pass |  |
|  | - 2D Drawing Engine (src/lib/drawing-engine.ts): ISO/ASME SVG + PDF/DXF     |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  | Next.js Route Handlers (/api/*) + Auth.js JWT Session + RBAC Guard          |  |
|  | - /api/auth/[...nextauth], /api/auth/register, /api/invitations/validate    |  |
|  | - /api/admin/invitations, /api/admin/users, /api/admin/audit-logs           |  |
|  | - /api/projects, /api/projects/[id], /api/projects/[id]/share               |  |
|  | - /api/teams, /api/teams/[id], /api/teams/[id]/projects, /api/submissions   |  |
|  | - /api/engine/generate, /api/v1/generate (Developer API Playground)         |  |
|  | - /api/inquiries (Enterprise, API Access, Pro Plan forms), /api/blogs       |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|               Prisma 7 Data Access Layer (src/lib/prisma.ts)                      |
|   - Local Dev / E2E: @prisma/adapter-better-sqlite3 (SQLite file:./dev.db)        |
|   - Production:      @prisma/adapter-pg (PostgreSQL connection pool)              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Database Schema (`prisma/schema.prisma` & `prisma/schema.postgres.prisma`)

### 2.1 Identity, Invite-Only Access & Audit Governance
- **`User`**:
  - `id` (String, CUID PK)
  - `email` (String, Unique)
  - `name` (String)
  - `passwordHash` (String)
  - `role` (`ADMIN` | `ENGINEER` | `MEMBER` | `VIEWER`, default `MEMBER`)
  - `planTier` (`free` | `starter` | `pro` | `engineer` | `enterprise`, default `pro`)
  - `creditsBalance` (Int, default `200`)
  - `themeMode` (String, default `dark`)
  - `onboardingDone` (Boolean, default `false`)
  - `isActive` (Boolean, default `true`)
  - `lastLoginAt`, `createdAt`, `updatedAt`
- **`Invitation`**:
  - `id` (String, CUID PK)
  - `code` (String, Unique)
  - `email` (String?, optional email lock)
  - `role` (`ADMIN` | `ENGINEER` | `MEMBER` | `VIEWER`, default `MEMBER`)
  - `status` (`ACTIVE` | `USED` | `REVOKED` | `EXPIRED`, default `ACTIVE`)
  - `maxUses` (Int, default `1`)
  - `usedCount` (Int, default `0`)
  - `note` (String?)
  - `expiresAt` (DateTime)
  - `revokedAt` (DateTime?), `usedAt` (DateTime?)
  - `createdById` (String?, FK -> `User`), `usedById` (String?, FK -> `User`)
- **`InvitationRedemption`**:
  - `id`, `invitationId`, `userId`, `ipAddress`, `userAgent`, `redeemedAt`
- **`AuditLog`**:
  - `id`, `actorId`, `actorEmail`, `action`, `targetType`, `targetId`, `details` (JSON string), `ipAddress`, `createdAt`

### 2.2 CAD Projects, Moodboards, Sharing & Token Ledger
- **`DesignProject`**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User`)
  - `name` (String)
  - `code` (String — Replicad JS / Python CAD script)
  - `parameters` (String — JSON map of parameter values)
  - `messages` (String — JSON array of AI chat & checkpoint history)
  - `moodboardJson` (String — JSON state of Studio Moodboard tiles, brief, and guide todos)
  - `renderConfigJson` (String — JSON state of Studio Render materials & lighting)
  - `drawingConfigJson` (String — JSON state of 2D Drawing setup & manual dimensions)
  - `forkedFromTeamProjectId` (String?)
  - `forkedTeamId` (String?)
  - `createdAt`, `updatedAt`
- **`ProjectShare`** & **`ProjectShareLink`**:
  - Collaborator email shares (`permission`: `view` | `edit`) and public token links (`token`, `isActive`, `expiresAt`).
- **`TokenUsage`** & **`PaymentTransaction`**:
  - Tracks AI credit consumption (`operation`, `model`, `promptTokens`, `completionTokens`, `creditsDeducted`) and billing history (`planId`, `amountCents`, `currency`, `status`).

### 2.3 Git-for-CAD Teams Collaboration
- **`Team`**: `id`, `name`, `description`, `createdById`, `createdAt`, `updatedAt`
- **`TeamMember`**: `id`, `teamId`, `userId`, `role` (`owner` | `admin` | `editor` | `viewer`), `joinedAt`
- **`TeamProject`**: `id`, `teamId`, `sourceProjectId`, `sharedById`, `name`, `description`, `code`, `parameters`, `approvalStatus` (`approved` | `pending` | `rejected`), `createdAt`, `updatedAt`
- **`TeamProjectSubmission`** (Pull Request for CAD):
  - `id`, `teamProjectId`, `submittedById`, `title`, `description`, `proposedCode`, `proposedParameters`, `status` (`pending` | `approved` | `changes_requested` | `merged` | `rejected`), `reviewedById`, `createdAt`, `updatedAt`
- **`TeamSubmissionComment`**:
  - `id`, `submissionId`, `authorId`, `content`, `createdAt`

### 2.4 Marketing CMS & Lead Capture
- **`BlogPost`**: `id`, `slug` (Unique), `title`, `excerpt`, `content`, `category`, `author`, `readTime`, `coverImage`, `published`, `publishedAt`, `createdAt` (seeded with all 11 published articles from `cadxstudio.in`).
- **`LeadInquiry`**: `id`, `type` (`enterprise` | `api_access` | `pro_plan`), `name`, `email`, `company`, `role`, `payloadJson`, `status`, `createdAt`.

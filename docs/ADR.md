# Architecture Decision Records (ADR) — CADxStudio Platform & Design Engine

## ADR-001: Unified Full-Stack Next.js App Router Architecture
- **Status**: Accepted
- **Context**: The original deployment split the marketing/documentation site (`cadxstudio.in`) and the CAD application (`engine.cadxstudio.in`) into two separate Vite SPAs talking to a hosted Supabase backend. We need a self-contained, production-ready application in `/home/azadmin/cadxstudio` that serves all marketing, documentation/courses, blog, API showcase, and CADx Design Engine routes seamlessly with server-side rendering (SSR), API routes, and strict authentication governance.
- **Decision**: Consolidate both surfaces into a single **Next.js 16 (App Router, React 19, TypeScript)** application:
  - Marketing & Public routes: `/`, `/drawing` (showcase), `/enterprise`, `/enterprise-plan`, `/api` (developer docs & playground), `/api-access`, `/docs` (all 12 course modules & 13 FAQs), `/blog`, `/blog/[slug]`, `/pricing`, `/pro-plan`, `/about`, `/terms`, `/open-source-license`, and `/view/[token]` (public 3D model preview).
  - Authenticated Engine & Governance routes: `/engine` (Studio Moodboard + 3D Parametric CAD Workbench + Studio Photorealistic Renderer + Projects & Teams + Profile), `/engine/drawing` (Interactive 2D Engineering Drawing Generator), `/login`, `/register` (Invite-Only), and `/admin` (Invitation Management, User Role Governance, Audit Logs).
  - Note: For full URL compatibility with the original engine routes, `/engine/drawing` and `/drawing?mode=engine` (or direct navigation from the Engine top bar) open the interactive 2D Engineering Drawing Generator.
- **Consequences**: Single deployment unit, shared TypeScript domain types, zero CORS friction, unified session cookies, and complete feature parity across both sites.

---

## ADR-002: Dual-Database Prisma 7 ORM Strategy (SQLite Local Dev + PostgreSQL Production)
- **Status**: Accepted
- **Context**: The system must run out-of-the-box in local development using SQLite while supporting PostgreSQL in production without code changes, following the proven pattern in `../Arcade`.
- **Decision**:
  - Use **Prisma 7 (`prisma` / `@prisma/client`)** with driver adapters (`@prisma/adapter-better-sqlite3` for `file:` SQLite URLs and `@prisma/adapter-pg` with `pg.Pool` for `postgresql://` / `postgres://` URLs).
  - Maintain `prisma/schema.prisma` (SQLite default for local development and automated E2E tests) alongside `prisma/schema.postgres.prisma` (PostgreSQL production schema) and a runtime client factory (`src/lib/prisma.ts`) that inspects `DATABASE_URL` and instantiates the matching adapter.
- **Consequences**: Zero external database dependencies required for local development and CI/E2E testing, with seamless cutover to PostgreSQL in production.

---

## ADR-003: Invite-Only Registration, RBAC, Audit Logging & Zero Demo Accounts
- **Status**: Accepted
- **Context**: Production security requires that public registration be gated by administrator-issued invitation codes (single-use or configurable max-uses, expiration timestamps, pre-assigned roles, revocation), comprehensive audit logging of security/governance events, and **strictly zero hardcoded or seeded demo user accounts**.
- **Decision**:
  - Implement **Auth.js / NextAuth (`next-auth` v4 with JWT sessions)** and `bcryptjs` (12 salt rounds).
  - Gate `POST /api/auth/register` behind a transactional invitation validator (`src/lib/invitations.ts`):
    - Verifies invitation `code` exists, `status === 'ACTIVE'`, `revokedAt === null`, `expiresAt > now`, `usedCount < maxUses`, and optional email binding (`invitation.email === user.email`).
    - Atomically creates the `User` with `invitation.role` (`ADMIN`, `ENGINEER`, `MEMBER`, or `VIEWER`), increments `usedCount`, transitions status to `USED` when `usedCount >= maxUses`, records `InvitationRedemption`, credits initial starter tokens, and writes an immutable `AuditLog` entry.
  - Provide an idempotent CLI bootstrap script (`npm run bootstrap:admin` -> `scripts/bootstrap-admin.ts`) that creates or promotes the initial administrator account and optionally generates an initial invite code via environment variables or CLI flags.
  - Do **not** seed any demo users in database migrations or seed scripts.
- **Consequences**: Production-ready access control from day one, full traceability via `AuditLog`, and zero unauthorized signups.

---

## ADR-004: Hybrid Parametric B-Rep / CSG CAD Kernel & 2D HLR Drawing Pipeline
- **Status**: Accepted
- **Context**: `engine.cadxstudio.in` executes parametric Replicad / OpenCASCADE JS code (`defaultName`, `defaultParams`, `main(replicad, params)`, `@sketch` and `@feature` annotations, `__cadxDecorations`) to generate multi-part 3D solids, topological edge wireframes, STEP/STL/OBJ/GLTF/GLB/PLY exports, and 2D orthographic/isometric engineering drawings with automatic dimensions (`Ø`, `R`, linear).
- **Decision**:
  - Implement a deterministic **Parametric CAD Execution & Geometry Engine (`src/lib/cad-kernel.ts`)** that parses and executes Replicad-compatible parametric CAD scripts (`defaultName`, `defaultParams`, `function main(replicad, params)`, `@sketch` and `@feature` annotations, `__cadxDecorations`, and STEP/STL importers).
  - Provide a full in-memory Replicad-compatible modeling API (`drawRoundedRectangle`, `drawRectangle`, `drawCircle`, `drawPolygon`, `drawPolysides`, `Sketcher`, `.sketchOnPlane()`, `.extrude()`, `.revolve()`, `.fuse()`, `.cut()`, `.intersect()`, `.fillet()`, `.chamfer()`, `.shell()`, `.translate()`, `.rotate()`, `__cadxDecorations` embossing/engraving) that generates watertight triangulated part meshes (`positions`, `normals`, `indices`), sharp topological feature edges (`edgePositions`), bounding boxes, volume/surface-area mass properties, and parsed Feature Tree (`features`) + Live Parameters (`parameters`).
  - Implement a dedicated **2D HLR Orthographic & Isometric Projection Engine (`src/lib/drawing-engine.ts`)** that projects the 3D assembly/parts into `Front`, `Top`, `Right`, and `Isometric` views (supporting both **First-Angle ISO** and **Third-Angle ASME** standards), separates visible vs hidden lines, extracts automatic linear/radial/diameter dimensions (`Ø`, `R`), renders interactive ISO/ASME drawing sheets (`A4`, `A3`, `A2`, `A1`), and exports **PDF** and **AutoCAD R12/2000 DXF** files.
  - Support real CAD export across all 7 formats (`STEP AP214`, `STL ASCII`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, `PLY`) directly from the compiled solid geometry.
- **Consequences**: Instant (<50ms) deterministic parametric rebuilds when dragging sliders, 100% compatibility with the original Replicad code format and `@sketch`/`@feature` comments, and reliable 2D drawing + 7-format CAD export in any browser or headless test environment.

# CadxStudio — AI-Powered Parametric 3D CAD & 2D Engineering Drawing Platform

Production-ready full-stack engineering replica of **CadxStudio** (`cadxstudio.in` and `engine.cadxstudio.in`), built with **Next.js 16 (App Router)**, **Auth.js / NextAuth**, **Prisma 7** (SQLite for local development, PostgreSQL for production), **Three.js / OpenCASCADE B-Rep Parametric Engine** (`Replicad` JS & `build123d` Python), and **Automated ISO/ASME 2D Engineering Drawing Generator**.

## Key Capabilities

1. **Invite-Only Registration & Governance (Zero Demo Accounts)**:
   - No hardcoded or seeded demo user accounts exist in the database.
   - Public registration (`/register`) requires a valid, unrevoked, non-expired single-use or multi-use `Invitation` code.
   - Initial administrators are provisioned via the CLI bootstrap script (`npm run bootstrap:admin`).
   - Full Admin Governance Portal (`/admin`) for issuing/revoking invitation codes, managing user RBAC roles (`ADMIN`, `MEMBER`, `VIEWER`), and inspecting the immutable `AuditLog`.
2. **3D Parametric CAD Workbench (`/engine`)**:
   - **Studio Moodboard** & **3D CAD Workbench** with `CHAT`, `CODE`, `TREE` (`@sketch` & `@feature` parser), `PARAMS` (live zero-latency dimension sliders), and `PARTS` (multi-part assembly visibility & per-part RGB colors).
   - **Engineering Inspection Toolbar**: Perspective/Orthographic camera, Wireframe/Edges, X/Y/Z Section Plane clipping, Multi-Part Explode slider, Point-to-Point Measure, and 3D Annotation Pins.
   - **Studio Photorealistic Renderer**: Physical Material presets (`Brushed Steel`, `Anodized Aluminum`, `Polished Bronze`, `Matte Carbon`, `CNC Titanium`, `Injection ABS`), HDRI environment rigs, exposure controls, and high-DPI PNG snapshots.
   - **7-Format CAD Export**: `STEP (AP214)`, `STL (ASCII & Binary)`, `OBJ`, `glTF 2.0`, `GLB`, and `PLY`.
   - **Cloud Projects, Public 3D Share Links (`/view/[token]`) & Team PR Reviews**.
3. **2D ISO / ASME Engineering Drawing Generator (`/engine/drawing`)**:
   - Automated 4-view (`Front`, `Top`, `Right`, `Isometric`) projection with Hidden Line Removal (HLR), centerlines, auto-dimensioning (`Ø`, `R`, linear), customizable ISO/ASME title block, and `DXF`, `SVG`, and `PDF` export.
4. **Full Academy Courses (`/docs`) & Engineering Blog (`/blog`)**:
   - All 12 interactive Code-CAD course modules, 13 Docs FAQs, 8 Drawing FAQs, `b3d-sandbox-setup.py` download, and all 11 engineering blog articles.

## Quick Start (Local Development — SQLite)

```bash
npm install
npx prisma generate
npx prisma db push

# Bootstrap the initial ADMIN account and an optional invite code:
npm run bootstrap:admin -- \
  --email admin@organization.com \
  --password "StrongAdminPassword123!" \
  --name "System Admin" \
  --invite-code "CADX-INIT-2026"

npm run dev
```

## Production Deployment (PostgreSQL)

Use `prisma/schema.postgres.prisma` or `docker-compose up --build` with `DATABASE_URL="postgresql://..."`.

## Documentation Suite (`/docs`)

- `docs/EXPLORATION_COVERAGE.md`
- `docs/ADR.md`
- `docs/PRD.md`
- `docs/SPEC.md`
- `docs/ARCHITECTURE_AND_DATA_MODEL.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/TASK_BACKLOG.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/FEATURE_PARITY.md`

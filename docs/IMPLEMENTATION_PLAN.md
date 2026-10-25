# Implementation Plan — CADxStudio & CADx Design Engine

## Phase 1: Project Scaffolding, Prisma 7 Dual-DB Schema & Invite-Only Auth
1. Initialize Next.js 16 + React 19 + TypeScript + Tailwind CSS project in `/home/azadmin/cadxstudio`.
2. Configure Prisma 7 with `@prisma/adapter-better-sqlite3` (local SQLite `dev.db`) and `@prisma/adapter-pg` (production PostgreSQL), plus `prisma/schema.prisma` and `prisma/schema.postgres.prisma`.
3. Copy all reverse-engineered static assets (`logo.png`, `ksumlogo.png`, `render-after.png`, `workflow-3d-model.png`, `workflow-drawing.png`, `workflow-drawing-stand.png`, `models/keyboard.glb`, `models/mouse.glb`, `python/b3d-sandbox-setup.py`) into `public/`.
4. Implement Auth.js (`next-auth`) credentials provider, RBAC helpers, transactional invite-only registration (`src/lib/invitations.ts`), audit logger (`src/lib/audit.ts`), and CLI bootstrap script (`scripts/bootstrap-admin.ts` -> `npm run bootstrap:admin`).
5. Ensure **zero demo user accounts** are created by migrations or content seeds (only public blog posts are seeded automatically if the `BlogPost` table is empty).

## Phase 2: Public Marketing, Showcases, Interactive Courses (`/docs`) & Blog CMS
1. Build shared responsive navigation header (`Navbar`) and footer (`Footer`) matching `cadxstudio.in` dark industrial aesthetic (`#0a0a0c`, `#3b82f6` accents, glassmorphic cards).
2. Implement Home (`/`) with interactive Three.js GLB 3D Model Viewer (`keyboard.glb` / `mouse.glb`), 5-tab Workflow Showcase (`Prompt`, `Refine`, `3D Model`, `Render`, `2D Drawing`), Capabilities Bento Grid, Pricing preview, and CTA.
3. Implement `/drawing` (2D Engineering Drawings showcase), `/enterprise` & `/enterprise-plan` (Git-for-CAD enterprise showcase + inquiry form), `/api` & `/api-access` (REST API interactive playground + API key request form), `/pricing` & `/pro-plan`, `/about`, `/terms`, and `/open-source-license`.
4. Implement `/docs` with all 12 course/documentation modules and 13 FAQs extracted from `DocsPage-DXFKcrG8.js` (`src/data/docs-courses.ts`), including live search (`Ctrl+K` / `/`), section progress tracking, and interactive accordions.
5. Implement `/blog` and `/blog/[slug]` backed by the 11 reverse-engineered articles (`src/data/blog-posts.ts` + Prisma `BlogPost` table).

## Phase 3: Parametric CAD Kernel, 3D Workbench, Studio Moodboard & Studio Renderer (`/engine`)
1. Implement `src/lib/cad-kernel.ts`:
   - Full Replicad-compatible JS CAD runner (`drawRoundedRectangle`, `drawRectangle`, `drawCircle`, `drawPolygon`, `drawPolysides`, `Sketcher`, `.sketchOnPlane()`, `.extrude()`, `.revolve()`, `.fuse()`, `.cut()`, `.intersect()`, `.fillet()`, `.chamfer()`, `.shell()`, `.translate()`, `.rotate()`, `__cadxDecorations`).
   - Annotation parser (`x3` replica) extracting `@sketch` and `@feature` metadata into the Feature Tree (`features`) and Live Parameters (`parameters`).
   - Multi-part mesh tessellator + topological sharp edge extractor + 7-format exporter (`STEP`, `STL`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, `PLY`).
2. Implement `/engine` (`src/components/engine/CadxEngineApp.tsx`):
   - **Studio Infinite Moodboard**: Pan/zoom canvas, `Image`, `Note`, `Heading`, `Draw` freehand sketcher, `Project Brief`, `Model Guide & Plan`, `3D Model Preview` card, `Engineering Drawing` card, `Studio Render` card, and AI prompt bar.
   - **3D CAD Workbench**:
     - Left Panel (`TREE`, `PARAMS`, `PARTS`) with live parameter sliders that recompute the 3D solid in <50ms.
     - Central Three.js 3D Viewport with ViewCube, `VIEW` menu (`Perspective`, `Orthographic`, `Section` plane cut with X/Y/Z axis + spherical tilt + cross-hatch plane + offset slider, `Explode` assembly slider, `Measure` point-to-point distance, `Annotate` 3D markup modal), 2D Sketcher overlay, Manual Feature modals (`Extrude`, `Revolve`, `Fillet`, `Chamfer`, `Shell`, `Boolean`, `Pattern`, `Decorate`), Build Timeline Player, and Code Editor drawer.
     - Right AI Assistant Panel (`Brainstorm`, `Build`, `Studio`, quick chips `Analyse`, `Improvements`, `Dimensions`, checkpoint `Restore`).
   - **Studio Photorealistic Render Mode**: `Material`, `Studio`, and `Render` tabs with 24+ PBR presets, per-part material assignment, HDRI studio lighting, progressive `Ray Trace` pass, and PNG download.
   - **Projects & Teams Modal**: `My Projects` (Grid/List, Save, Load, New, Delete) + `Teams` (Create Team, Share Project, Fork, Submit PR, Review Thread & Merge).
   - **Share Modal & Public View (`/view/[token]`)**: Email collaborator shares + public 3D preview link generator and standalone `/view/[token]` viewer.
   - **Account Profile (`Account`, `Token Usage`, `Billing`), `Upgrade` Modal, Guided Tour Modal, and Light/Dark Mode Toggle**.

## Phase 4: 2D Engineering Drawing Engine (`/engine/drawing`) & Admin Governance (`/admin`)
1. Implement `src/lib/drawing-engine.ts` and `/engine/drawing`:
   - Drawing Setup modal (`Sheet Size` A4/A3/A2/A1, `First-Angle ISO` / `Third-Angle ASME`, `Front`/`Top`/`Right`/`Isometric` views, part selector, Title Block, General Notes).
   - Automated 4-view orthographic/isometric SVG sheet with `MEASURE`, `SELECT`, `HIDDEN LINES` toggle, and **PDF** / **DXF** export.
2. Implement `/login`, `/register` (with live invitation code verification badge), and `/admin` (Invitation Management, User Role & Credit Governance, Lead Inquiries, and Security Audit Logs).

## Phase 5: Verification, Unit/Integration Tests, Playwright E2E Suite & Production Build
1. Run `npx prisma db push` and unit/integration tests (`vitest`) covering Invite-Only Registration, RBAC, CAD Kernel compilation, STEP/STL export, and 2D Drawing projection.
2. Run `npm run build` and start production server; execute Playwright E2E suite verifying all routes, `/docs` courses, `/blog` posts, CLI admin bootstrap, invite-only registration, 3D CAD Workbench, Studio Render, 2D Drawing generator, Teams collaboration, and Admin portal.

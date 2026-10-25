# Acceptance Criteria — CADxStudio & CADx Design Engine

## AC-1: Invite-Only Registration, Security & Zero Demo Accounts
- [ ] **AC-1.1**: Database starts with **zero demo user accounts**; attempting to log in with uncreated credentials fails cleanly.
- [ ] **AC-1.2**: `npm run bootstrap:admin` creates or updates the initial `ADMIN` user and optionally creates a single-use/multi-use invitation code, logging `ADMIN_BOOTSTRAPPED` in `AuditLog`.
- [ ] **AC-1.3**: `/register` requires a valid invitation code; submitting an invalid, expired, revoked, exhausted, or email-mismatched code is rejected with a clear error message and logged in `AuditLog`.
- [ ] **AC-1.4**: Redeeming a valid single-use invitation code creates the user with the invitation's assigned role (`ADMIN`, `ENGINEER`, `MEMBER`, `VIEWER`), increments `usedCount`, marks the invitation `USED`, records `InvitationRedemption`, and prevents reuse of the same single-use code.
- [ ] **AC-1.5**: `/admin` is restricted to `ADMIN` users and allows creating new invitations (single-use or custom max uses, expiration hours, role, optional email lock), revoking active invitations, updating user roles/credits, and viewing the `AuditLog`.

## AC-2: Public Marketing, Showcases, Courses (`/docs`) & Blog (`/blog`)
- [ ] **AC-2.1**: All 14 public routes from `cadxstudio.in` (`/`, `/drawing`, `/enterprise`, `/enterprise-plan`, `/api`, `/api-access`, `/docs`, `/blog`, `/blog/[slug]`, `/pricing`, `/pro-plan`, `/about`, `/terms`, `/open-source-license`) render with responsive desktop and mobile layouts.
- [ ] **AC-2.2**: `/` features the interactive 3D GLB model viewer (`Keyboard` / `Mouse` switcher), 5-stage Workflow Showcase (`Prompt`, `Refine`, `3D Model`, `Render`, `2D Drawing`), and Capabilities Bento Grid.
- [ ] **AC-2.3**: `/docs` renders all 12 interactive course/documentation modules (`Overview`, `Getting Started`, `Interface Guide`, `AI Generation`, `Parametric Editing`, `3D Viewport & Inspection`, `2D Sketching & Manual Features`, `Engineering Drawings`, `Export Formats`, `Projects, Sharing & Teams`, `Keyboard Shortcuts`, `FAQ & Troubleshooting`) and all 13 expandable FAQs, with live search filtering.
- [ ] **AC-2.4**: `/blog` lists all 11 published articles from `cadxstudio.in` with category filter and search, and `/blog/[slug]` renders the full article content.
- [ ] **AC-2.5**: Lead forms on `/enterprise-plan`, `/api-access`, and `/pro-plan` validate inputs and persist submissions to the database (`LeadInquiry`).

## AC-3: CADx Design Engine (`/engine`), Studio Moodboard, 3D Workbench & Studio Render
- [ ] **AC-3.1**: Authenticated users opening `/engine` can switch seamlessly between the **Studio Infinite Moodboard** (`Prompt. Refine. Build.`, `Image`, `Note`, `Heading`, `Draw`, `Project Brief`, `Model Guide & Plan`, `3D Model Preview` card) and the **3D CAD Workbench**.
- [ ] **AC-3.2**: Compiling Replicad CAD code or generating a part via AI prompt builds the 3D multi-part assembly in the Three.js viewport and populates `TREE` (sketches & features), `PARAMS` (live sliders & numeric inputs), and `PARTS` (assembly solids with visibility/isolation toggles).
- [ ] **AC-3.3**: Adjusting any slider or numeric value in `PARAMS` immediately recomputes the 3D geometry and updates the viewport without consuming AI credits.
- [ ] **AC-3.4**: `VIEW` menu tools (`Perspective`, `Orthographic`, `Section` plane cut with X/Y/Z axis + tilt + offset slider, `Explode` assembly slider `0%–100%`, `Measure` point-to-point ruler, and `Annotate` 3D markup modal) work interactively on the 3D model.
- [ ] **AC-3.5**: `Export` menu downloads valid `STEP`, `STL`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, and `PLY` files.
- [ ] **AC-3.6**: `Render` mode opens the Studio Photorealistic Renderer with `Material`, `Studio`, and `Render` tabs, per-part PBR material presets, HDRI lighting controls, `Ray Trace` pass, and PNG download.
- [ ] **AC-3.7**: `Projects` modal supports saving/loading projects in Grid/List views and collaborating in `Teams` (creating a team, sharing a project, forking, submitting a Pull Request, commenting, and merging).
- [ ] **AC-3.8**: `Share` modal generates a public share token, and visiting `/view/[token]` renders the interactive read-only 3D model viewer (and displays a clean error state for invalid/revoked tokens).
- [ ] **AC-3.9**: Account menu toggles `Light mode` / `Dark mode` and opens the Profile view (`Account`, `Token Usage`, `Billing`) and `Upgrade` modal.

## AC-4: 2D Engineering Drawing Generator (`/engine/drawing`)
- [ ] **AC-4.1**: Opening `/engine/drawing` presents the Drawing Setup modal (`Sheet Size` A4/A3/A2/A1, `First-Angle ISO` / `Third-Angle ASME`, `Front`/`Top`/`Right`/`Isometric` views, part/assembly scope, Title Block, General Notes).
- [ ] **AC-4.2**: Clicking `Generate Drawing` projects the 3D model into a multi-view 2D engineering drawing sheet with visible edges, dashed hidden lines (`HIDDEN LINES` toggle), automated dimensions (`Ø`, `R`, linear), ISO title block, `MEASURE` and `SELECT` tools, and **PDF** / **DXF** export.

# Product Requirements Document (PRD) — CADxStudio & CADx Design Engine

## 1. Product Vision & Overview
**CADxStudio** is an AI-native, browser-based parametric CAD, 2D engineering drawing, photorealistic rendering, and hardware team collaboration platform. Engineers describe mechanical components or assemblies in natural language, refine specifications on an infinite **Studio Moodboard**, edit parametric sketches and 3D features in the **CADx Workbench**, generate manufacturing-ready **ISO/ASME 2D Engineering Drawings**, produce **Studio Photorealistic Renders**, export production **STEP/STL/OBJ/GLTF/GLB/PLY/DXF/PDF** files, and collaborate via **Git-for-CAD Teams** (Fork, Branch, Pull Request Submissions, and Review Threads).

## 2. Target Personas
1. **Mechanical & Hardware Engineers (`ENGINEER` / `MEMBER`)**: Need rapid concept-to-STEP generation, live parametric sliders, section cuts, exploded assembly views, and ISO/ASME 2D engineering drawings.
2. **Industrial Designers (`MEMBER`)**: Use the Infinite Studio Moodboard (images, notes, freehand sketches, project briefs) and Studio Photorealistic Renderer (PBR materials, HDRI studio lighting, ray tracing).
3. **Engineering Leads & Reviewers (`ADMIN` / `ENGINEER`)**: Manage team workspaces, approve shared models, review pull-request submissions with inline comments, and inspect 3D models via shared links.
4. **Platform Administrators (`ADMIN`)**: Govern platform access via single-use/expiring invitation codes, manage user roles and token balances, review security audit logs, and triage enterprise/API access requests.

## 3. Core Product Surfaces & Functional Requirements

### 3.1 Public Marketing, Showcases, Courses & CMS (`cadxstudio.in` Replica)
- **Home (`/`)**: Hero with interactive 3D GLB model viewer (`Keyboard` / `Mouse` switcher, wireframe/shaded modes, auto-rotate), 5-tab Interactive Workflow Showcase (`Prompt`, `Refine`, `3D Model`, `Render`, `2D Drawing`), Capabilities Bento Grid, Pricing preview, and CTA.
- **2D Engineering Drawings Showcase (`/drawing`)**: Interactive preview of automated orthographic/isometric drawing sheets, ISO vs ASME projection comparison, auto-dimensioning showcase, and direct launch into the Drawing Engine.
- **Enterprise & Git-for-CAD (`/enterprise` & `/enterprise-plan`)**: Showcase of CAD version control (branching, visual 3D diff, PR reviews), RBAC, SSO, on-premise deployment, and interactive Enterprise inquiry submission form.
- **Developer API (`/api` & `/api-access`)**: Interactive REST API explorer (`POST /v1/generate`, `POST /v1/drawing`, `POST /v1/export`, `POST /v1/render`) with multi-language code tabs (`cURL`, `Python`, `TypeScript`) and API key request form.
- **Documentation & Courses (`/docs`)**: Complete 12-module interactive curriculum (`Overview`, `Getting Started`, `Interface Guide`, `AI Generation`, `Parametric Editing`, `3D Viewport & Inspection`, `2D Sketching & Manual Features`, `Engineering Drawings`, `Export Formats`, `Projects, Sharing & Teams`, `Keyboard Shortcuts`, `FAQ & Troubleshooting`) with search (`Ctrl+K`), module navigation, and 13 expandable FAQs.
- **Engineering Blog (`/blog` & `/blog/[slug]`)**: All 11 published technical articles with category filters, search, reading time, and full article reader.
- **Pricing & Checkout (`/pricing` & `/pro-plan`)**: Starter Pack ($2 / 30 credits), Free ($0), Pro ($20/mo), Engineer ($49/mo), Enterprise (Custom), feature comparison table, and Pro plan onboarding form.
- **Company & Legal (`/about`, `/terms`, `/open-source-license`)**: Full company overview (KSUM backing), Terms/Privacy/Refund policies, and open-source attributions.

### 3.2 CADx Design Engine (`/engine`)
- **Studio Infinite Moodboard**: Pan/zoom dot-grid canvas with `Image`, `Note`, `Heading`, and `Draw` (freehand sketch canvas) tools, `Project Brief` card, `Model Guide & Plan` checklist card, `3D Model Preview` card, `Engineering Drawing` card, `Studio Render` card, and AI Chat pill.
- **3D Parametric CAD Workbench**:
  - **Left Design Panel**:
    - `TREE`: Hierarchical feature tree (`Origin`, `XY/XZ/YZ Planes`, `Sketches`, `Extrude`, `Revolve`, `Fillet`, `Chamfer`, `Shell`, `Boolean`, `Pattern`, `Decorate`) with search, visibility toggle, suppression, and double-click to edit feature parameters or Replicad code.
    - `PARAMS`: Live parametric controls grouped by feature (`width`, `depth`, `thickness`, `radius`, `height`, etc.) with real-time slider + numeric input updates and `Reset`.
    - `PARTS`: Multi-part assembly browser with color swatches, visibility toggles, and part isolation.
  - **Central 3D Viewport**:
    - Shaded B-Rep mesh + sharp topological edge overlay, interactive XYZ orientation gizmo / ViewCube, and bottom camera toolbar.
    - `VIEW` & Inspect Menu: `Perspective` / `Orthographic` camera, `Section` plane cut (`X`/`Y`/`Z` axis + spherical tilt pad + flip/center/reset + offset slider + cross-hatched cut shader), `Explode` assembly slider (`0%–100%`), `Measure` point-to-point distance/radius tool, and `Annotate` 3D viewport markup canvas.
    - **Build Timeline Player**: Step-by-step feature history playback (`Play/Pause`, step forward/backward, feature scrubber) and `Code Editor` drawer for direct Replicad JS / Python `build123d` editing.
    - **2D Sketcher & Feature Modals**: Interactive 2D sketch plane (`Line`, `Rectangle`, `Circle`, `Arc`) and manual feature creation modals (`Extrude`, `Revolve`, `Fillet`, `Chamfer`, `Shell`, `Boolean`, `Pattern`, `Surface Decoration`).
  - **Right AI Assistant Panel**:
    - `Brainstorm` vs `Build` modes, preset mechanical templates & AI prompt generator, quick action chips (`Analyse`, `Improvements`, `Dimensions`), image/annotation attachment, and one-click `Restore` checkpoints.

### 3.3 Studio Photorealistic Renderer (`Render` Mode)
- Per-part PBR material assignment across 6 categories (`Metal`, `Plastic`, `Glass`, `Wood`, `Painted`, `Surface`) and 24+ presets (`Anodized Aluminum`, `Brushed Steel`, `Polished Brass`, `Titanium`, `ABS Matte`, `ABS Gloss`, `Nylon`, `Delrin/POM`, `PTFE`, `Rubber`, `Silicone`, `TPU Flex`, `Clear Glass`, `Walnut`, `Carbon Fiber`, etc.) with custom color tint, roughness, and metalness sliders.
- `Studio` lighting controls (HDRI presets, exposure, yaw/pitch rotation, ground shadow, background gradient/color).
- `Render` settings & progressive `Ray Trace` pass with high-resolution PNG export.

### 3.4 2D Engineering Drawing Generator (`/engine/drawing`)
- Drawing Setup Modal: Sheet Size (`A4`, `A3`, `A2`, `A1`), Orientation, Projection Standard (`First-Angle ISO` / `Third-Angle ASME`), Views (`Front`, `Top`, `Right`, `Isometric`), Assembly vs Individual Part selection, Title Block metadata, and General Notes.
- Automated 2D HLR SVG Sheet: Orthographic & isometric projections, visible & dashed hidden lines (`HIDDEN LINES` toggle), auto-generated linear/radial/diameter dimensions (`Ø`, `R`), interactive `MEASURE` tool (click circle for radius/diameter or two lines for distance), `SELECT` tool (drag to reposition or `Delete` dimensions/callouts), and `Export` to **PDF** and **DXF**.

### 3.5 Projects, Git-for-CAD Teams & Public Sharing
- **My Projects**: Grid/List views, search, save, duplicate, rename, delete, and version history.
- **Teams Workspace**: Create teams, manage members & roles (`Owner`, `Admin`, `Editor`, `Viewer`), share projects to team (with Admin approval queue), fork team projects into personal workspace, submit Pull Request (`Submissions`) back to upstream with change summary, and collaborate in PR review threads (`Approve` / `Request Changes` / `Merge`).
- **Share & Public 3D View (`/view/[token]`)**: Invite collaborators by email or generate/revoke public read-only 3D preview links with interactive orbit, section cut, and part inspection.

### 3.6 Invite-Only Authentication & Admin Governance (`/login`, `/register`, `/admin`)
- Invite-only registration requiring a valid, unrevoked, non-expired invitation code.
- Admin dashboard (`/admin`) to create single-use or multi-use invitation codes with role assignment (`ADMIN`, `ENGINEER`, `MEMBER`, `VIEWER`) and optional email lock, revoke invitations, manage users & token balances, and inspect the security `AuditLog`.
- CLI bootstrap command (`npm run bootstrap:admin`) and strictly zero demo accounts.

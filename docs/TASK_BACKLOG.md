# Task Backlog — CADxStudio Platform & Design Engine

| ID | Epic | Task | Priority | Status |
|---|---|---|---|---|
| `T-01` | Exploration | Reverse-engineer `cadxstudio.in` and `engine.cadxstudio.in` bundles, workers, routes, courses, blogs, and scenarios via Playwright | P0 | Done |
| `T-02` | Documentation | Author Exploration Coverage, ADR, PRD, Spec, Architecture/Data Model, Implementation Plan, Task Backlog, Acceptance Criteria, and Feature Parity docs | P0 | Done |
| `T-03` | Database & Auth | Set up Prisma 7 dual-adapter (`SQLite` local + `PostgreSQL` prod) schema (`User`, `Invitation`, `InvitationRedemption`, `AuditLog`, `DesignProject`, `ProjectShareLink`, `Team`, `TeamMember`, `TeamProject`, `TeamProjectSubmission`, `TeamSubmissionComment`, `TokenUsage`, `PaymentTransaction`, `BlogPost`, `LeadInquiry`) | P0 | In Progress |
| `T-04` | Invite-Only Governance | Implement `src/lib/invitations.ts`, `src/lib/audit.ts`, Auth.js credentials provider, `/login`, `/register`, `/admin` portal, and `npm run bootstrap:admin` CLI with zero demo accounts | P0 | Pending |
| `T-05` | Marketing & Showcases | Implement `/`, `/drawing` (showcase), `/enterprise`, `/enterprise-plan`, `/api`, `/api-access`, `/pricing`, `/pro-plan`, `/about`, `/terms`, `/open-source-license` | P0 | Pending |
| `T-06` | Courses & Blog CMS | Implement `/docs` (all 12 course modules + 13 FAQs + search) and `/blog` + `/blog/[slug]` (all 11 technical blog posts) | P0 | Pending |
| `T-07` | Parametric CAD Kernel | Implement `src/lib/cad-kernel.ts` supporting Replicad code execution, `@sketch` & `@feature` parsing, CSG solids, multi-part assemblies, and 7-format export (`STEP`, `STL`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, `PLY`) | P0 | Pending |
| `T-08` | CADx Workbench & Moodboard | Implement `/engine` with Studio Infinite Moodboard (`Image`, `Note`, `Heading`, `Draw`, `Brief`, `Guide`), 3D Workbench (`TREE`, `PARAMS`, `PARTS`), `VIEW` tools (`Section`, `Explode`, `Measure`, `Annotate`), 2D Sketcher, Feature Modals, Build Timeline Player, and AI Assistant (`Brainstorm`, `Build`, `Studio`) | P0 | Pending |
| `T-09` | Studio Render & 2D Drawings | Implement Studio Photorealistic Renderer (`Material`, `Studio`, `Render` tabs + `Ray Trace`) and `/engine/drawing` (`src/lib/drawing-engine.ts` with ISO/ASME 4-view HLR sheet, auto-dimensions, `MEASURE`, `SELECT`, `HIDDEN LINES`, and `PDF`/`DXF` export) | P0 | Pending |
| `T-10` | Teams, Sharing & Verification | Implement Projects & Git-for-CAD Teams (`Fork`, `Submit PR`, `Review & Merge`), Public Share `/view/[token]`, Account/Token/Billing profile, Light/Dark mode, Vitest unit tests, and Playwright E2E test suite | P0 | Pending |

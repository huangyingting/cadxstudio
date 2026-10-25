# CADxStudio & CADx Design Engine — Exploration Coverage & Reverse-Engineering Report

## 1. Executive Summary
Using Playwright and static/dynamic bundle reverse-engineering, we systematically explored every public route, documentation/course module, blog post, interactive workflow, Web Worker, CAD kernel pipeline, and authenticated UI state across:
- **`https://cadxstudio.in/`** (Marketing, 2D Drawing Showcase, Enterprise & Git-for-CAD Showcase, Developer API Showcase, Interactive Documentation & Courses, Blog & CMS, Pricing & Checkout Forms, About, Legal)
- **`https://engine.cadxstudio.in/`** (CADx Design Engine: Studio Infinite Moodboard Canvas, 3D Parametric B-Rep CAD Workbench, 2D Sketcher & Feature Modals, Live Parameters, Assembly Parts, Section/Explode/Measure/Annotate tools, Studio Photorealistic GPU Ray-Traced Renderer, 2D ISO/ASME Engineering Drawing Generator `/drawing`, Projects & Teams Git-for-CAD Collaboration, Public Share `/view/:token`, Account/Token Usage/Billing Profile, and Light/Dark theming)

All client bundles, lazy-loaded route chunks, Web Workers (`DVGlpa3J.js` OpenCASCADE/Replicad worker, `tlBYXFpm.js` Three-Mesh-BVH worker, `B1hx20iP.js` Pyodide/build123d worker), and static 3D/image assets were archived locally under `/home/azadmin/cadxstudio/exploration/` and `/home/azadmin/cadxstudio/screenshots/`.

---

## 2. Explored Routes & Pages (`https://cadxstudio.in/`)

| Route | Component Chunk | Desktop & Mobile Screenshots | Key Observed Capabilities & Interactions |
|---|---|---|---|
| `/` | `main-index.js` (`R0`) | `screenshots/main/home-desktop.png`, `home-mobile.png` | Hero with interactive 3D GLB model switcher (`keyboard.glb`, `mouse.glb`), 5-stage Interactive Workflow Showcase (`Prompt` -> `Refine` -> `3D Model` -> `Render` -> `2D Drawing`), Capabilities Bento Grid, Pricing preview, and CTA. |
| `/drawing` | `DrawingPage-DK8lGh3F.js` | `screenshots/main/drawing-desktop.png`, `drawing-mobile.png` | 2D Engineering Drawings showcase: interactive multi-view orthographic/isometric sheet preview, First-Angle (ISO) vs Third-Angle (ASME) projection, Auto-Dimensioning (`Ø`, `R`, linear), STEP upload to 2D sheet, PDF & DXF export. |
| `/enterprise` | `EnterprisePage-CRvMIX_5.js` | `screenshots/main/enterprise-desktop.png`, `enterprise-mobile.png` | Enterprise & Team Workspace showcase: Git-style version control for CAD (Branch, Fork, Submit PR, Visual Diff, Merge, Audit Trail), SSO/SAML, On-Premise / VPC deployment, Role-Based Access Control. |
| `/enterprise-plan` | `EnterpriseForm-BXv4PkhC.js` | `screenshots/main/enterprise-plan-desktop.png`, `enterprise-plan-mobile.png` | Enterprise inquiry & custom deployment configuration form (`enterprise_inquiries` table). |
| `/api` | `ApiPage-BYrLgRSH.js` | `screenshots/main/api-desktop.png`, `api-mobile.png` | CADx REST & SDK API showcase: interactive endpoint playground (`POST /v1/generate`, `POST /v1/drawing`, `POST /v1/export`, `POST /v1/render`), multi-language code snippets (`cURL`, `Python`, `TypeScript`), webhook events, rate limits. |
| `/api-access` | `ApiAccessForm-CwLQDfOy.js` | `screenshots/main/api-access-desktop.png`, `api-access-mobile.png` | Developer API key request & use-case registration form (`api_access_requests` table). |
| `/docs` | `DocsPage-DXFKcrG8.js` | `screenshots/docs/01..13-*.png`, `screenshots/main/docs-desktop.png` | 12-module interactive course & documentation portal with live search (`Ctrl+K` / `/`), sidebar progress tracking, interactive callouts, keyboard shortcut tables, and 13 expandable FAQs. |
| `/blog` | `BlogPage-DsT2cs5f.js` | `screenshots/main/blog-desktop.png`, `blog-mobile.png` | Engineering blog index with category filtering, featured article banner, reading time, and search across 11 published articles (`blogs` table). |
| `/blog/:slug` | `BlogPostPage-C2GwjOi5.js` | `screenshots/main/blog-post-1..11-*.png` | All 11 published articles captured (`cad-to-production-ready-drawings`, `browser-based-parametric-cad`, `text-to-cad-engineering-workflows`, etc.) with rich HTML/Markdown typography, share links, and related articles. |
| `/pricing` | `Pricing-DjWlklig.js` | `screenshots/main/pricing-desktop.png`, `pricing-mobile.png` | Full pricing comparison: Starter Pack ($2 one-time / 30 credits), Free ($0/mo), Pro ($20/mo, 200 credits), Engineer ($49/mo, 400 credits), Enterprise (Custom), plus feature matrix & FAQ. |
| `/pro-plan` | `ProPlanForm-2GsLcN9i.js` | `screenshots/main/pro-plan-desktop.png`, `pro-plan-mobile.png` | Pro/Engineer subscription onboarding & billing checkout form (`pro_plan_requests` table). |
| `/about` | `AboutPage-DUe9t_ki.js` | `screenshots/main/about-desktop.png`, `about-mobile.png` | Company mission, Kerala Startup Mission (`ksumlogo.png`) incubation backing, engineering philosophy, and contact channels. |
| `/terms` | `TermsPage-CaDIp4In.js` | `screenshots/main/terms-desktop.png`, `terms-mobile.png` | Terms of Service, Privacy Policy, Refund Policy, and Acceptable Use Policy. |
| `/open-source-license` | `OpenSourceLicensePage-Sn8l7ppY.js` | `screenshots/main/open-source-license-desktop.png` | Open-source attributions (OpenCASCADE.js, Replicad, Three.js, React, Lucide, etc.). |
| `/404` | `NotFoundPage-B4KuQoWn.js` | `screenshots/main/404-desktop.png` | Custom 404 Not Found boundary with quick navigation links. |

---

## 3. Documentation & Course Curriculum Captured (`/docs`)

All 12 interactive course/documentation modules and 13 FAQs were extracted verbatim into `/home/azadmin/cadxstudio/exploration/docs-courses-dump.json` and screenshotted in `/home/azadmin/cadxstudio/screenshots/docs/`:

1. **Overview (`#overview`)** — `01-overview.png`: Platform architecture, B-Rep vs mesh modeling, and core pillars (AI Generation, Parametric Workbench, 2D Drawings, Studio Render, Teams).
2. **Getting Started (`#getting-started`)** — `02-getting-started.png`: Account setup, first prompt-to-CAD workflow, navigating between Studio Moodboard and 3D Workbench.
3. **Interface Guide (`#interface`)** — `03-interface.png`: Top toolbar, Left Design Panel (`TREE`, `PARAMS`, `PARTS`), Central 3D Viewport & ViewCube, Bottom Build Timeline Player, Right AI Assistant Panel (`Brainstorm`, `Build`, `Studio`).
4. **AI Generation (`#ai-generation`)** — `04-ai-generation.png`: Prompt engineering for mechanical parts, attaching reference images/sketches, Brainstorm vs Build modes, iterative refinement (`Analyse`, `Improvements`, `Dimensions`), and restoring historical checkpoints.
5. **Parametric Editing (`#parametric`)** — `05-parametric.png`: Live Parameters (`PARAMS` tab), feature-grouped sliders & numeric inputs, instant B-Rep recomputation without AI credit consumption.
6. **3D Viewport & Inspection (`#viewport`)** — `06-viewport.png`: Camera projection (`Perspective` / `Orthographic`), ViewCube navigation, `Section` plane cuts (`X`/`Y`/`Z` axis + spherical tilt orbit + offset slider), `Explode` assembly slider, point-to-point `Measure`, and 3D `Annotate` markup.
7. **2D Sketching & Manual Features (`#sketching`)** — `07-sketching.png`: Reference planes (`XY`, `XZ`, `YZ`), 2D sketch primitives (`Line`, `Rectangle`, `Circle`, `Arc`), constraints, and 3D feature operations (`Extrude`, `Revolve`, `Fillet`, `Chamfer`, `Shell`, `Boolean`, `Pattern`, `Surface Decoration`).
8. **Engineering Drawings (`#drawings`)** — `08-drawings.png`: ISO 128 / ASME Y14.5 2D drawing sheets (`A4`, `A3`, `A2`, `A1`), First-Angle vs Third-Angle projection, Front/Top/Right/Isometric HLR views, automatic & manual dimensioning, hidden line toggle, title block customization, PDF & DXF export.
9. **Export Formats (`#export`)** — `09-export.png`: B-Rep CAD exchange (`STEP AP214`, `BREP`) and tessellated mesh formats (`STL ASCII`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, `PLY`) for CNC machining, injection molding, 3D printing, and AR/VR.
10. **Projects, Sharing & Teams (`#projects`)** — `10-projects.png`: Cloud project library, public share links (`/view/:token`), Teams workspace, role-based permissions (`Owner`, `Admin`, `Editor`, `Viewer`), project forking, PR submissions, and review threads.
11. **Keyboard Shortcuts (`#shortcuts`)** — `11-shortcuts.png`: Complete shortcut reference for Viewport, Sketching, Feature Tree, and Drawing Sheet modes.
12. **FAQ & Troubleshooting (`#faq`)** — `12-faq.png`, `13-faq-all-expanded.png`: 13 detailed Q&As covering STEP compatibility, manufacturing tolerances, credit billing, IP ownership, offline export, and multi-part assemblies.

---

## 4. Authenticated Engine Scenarios & Reverse-Engineered Workflows (`https://engine.cadxstudio.in/`)

We registered and verified a live user account (`cadxtest_1792918812518@maxxspace.com`), seeded a 2-part parametric Replicad assembly (**Precision Flanged Bearing Housing** consisting of a `Flange Housing` and a `Bronze Bushing` with 7 parametric dimensions and mapped `@sketch`/`@feature` annotations), and executed 31 end-to-end Playwright scenarios (`exploration/explore-engine-scenarios.mjs` & `explore-engine-scenarios-part2.mjs`):

| Scenario ID | Screenshot Artifact | Observed Behavior & Reverse-Engineered Implementation |
|---|---|---|
| `00-guided-onboarding-tour` | `00-guided-onboarding-tour.png` | First-run modal ("Welcome to CadX Design Engine") offering a 3-step guided tour or "Skip — I'll explore on my own". |
| `01-studio-moodboard-home` | `01-studio-moodboard-home.png` | Full-screen Studio Moodboard (`fbt`) with "Prompt. Refine. Build." hero, prompt bar, reference attachment trigger, and mode pills (`Workbench`, `Drawing`, `Render`, `Projects`). |
| `02-workbench-empty` | `02-workbench-empty.png` | Empty 3D CAD Workbench (`D5t` + `UY`) with default `Origin` and `XY`/`XZ`/`YZ` datum planes in the Feature Tree. |
| `03-projects-modal-grid` | `03-projects-modal-grid.png` | `Projects` modal (`J0e`) showing `My Projects` in Grid view with search, sort, and `+ New Project`. |
| `04-projects-modal-list` | `04-projects-modal-list.png` | `Projects` modal switched to compact List view (`button[title="List"]`). |
| `05-teams-tab-initial` | `05-teams-tab-initial.png` | `Teams` collaboration tab (`EYe`) inside Projects modal with team list and `+ New Team`. |
| `06-teams-create-modal` | `06-teams-create-modal.png` | Team creation dialog ("Create a Team") with name and description inputs. |
| `08-workbench-3d-model-tree` | `08-workbench-3d-model-tree.png` | 2-part **Precision Flanged Bearing Housing** compiled in browser WASM (`DVGlpa3J.js`), showing shaded B-Rep mesh + sharp topological edge lines in Three.js and parsed `@sketch`/`@feature` nodes (`Base Flange Sketch`, `Base Flange Extrude`, `Bearing Boss Sketch`, `Bearing Boss Extrude`, `Center Bore Sketch`, `Center Bore Cut`) in the `TREE` tab (`GNe`). |
| `11-workbench-live-params` | `11-workbench-live-params.png` | `PARAMS` tab (`Tht`) displaying 7 live parametric controls (`baseWidth`, `baseDepth`, `baseThickness`, `bossRadius`, `bossHeight`, `boreRadius`, `filletRadius`) grouped by feature with sliders, numeric inputs, and Reset button. |
| `12-workbench-assembly-parts` | `12-workbench-assembly-parts.png` | `PARTS` tab (`W0e`) listing the 2 assembly solids (`Flange Housing` `#5b9bd5` and `Bronze Bushing` `#f59e0b`) with per-part visibility and isolation toggles. |
| `13-view-inspect-dropdown` | `13-view-inspect-dropdown.png` | `VIEW` menu (`vpt`) showing `Perspective`, `Orthographic`, `Section`, `Explode`, `Measure`, and `Annotate`. |
| `14-workbench-section-view` | `14-workbench-section-view.png` | Interactive `SECTION` cut panel (`X`/`Y`/`Z` axis selector, 2D spherical Orbit tilt pad, `Flip`/`Center`/`Reset` buttons, `Offset` slider) slicing through both the housing and bushing with diagonal cross-hatching on clipped faces. |
| `15-workbench-exploded-view` | `15-workbench-exploded-view.png` | `EXPLODE` slider (`0%` to `100%`) translating assembly components apart along their principal axes (`Bronze Bushing` lifted above `Flange Housing`). |
| `16-workbench-measure-tool` | `16-workbench-measure-tool.png` | Interactive 3D point-to-point / edge distance and radius measurement overlay (`Measure`). |
| `17-workbench-annotate-markup` | `17-workbench-annotate-markup.png` | 3D Viewport `Annotate` modal (`Goe`) capturing a live snapshot of the 3D canvas for freehand pen, arrow, rectangle, and text callout markup to attach directly to AI prompts. |
| `18-workbench-export-dropdown` | `18-workbench-export-dropdown.png` | `Export` dropdown offering `STEP`, `STL`, `STL Binary`, `OBJ`, `GLTF`, `GLB`, and `PLY` downloads. |
| `19-workbench-share-modal` | `19-workbench-share-modal.png` | `Share` modal (`Gnt`) supporting email collaborator invitations (`view` / `edit` permissions) and public read-only 3D preview link generation (`/view/:token`). |
| `20-studio-render-mode` | `20-studio-render-mode.png` | Studio Photorealistic Render Mode (`Ztt` + `jQe`) showing the `Material` tab with per-part material assignment (`Flange Housing` / `Bronze Bushing`), categories (`Metal`, `Plastic`, `Glass`, `Wood`, `Painted`, `Surface`), presets (`ABS Matte`, `ABS Gloss`, `Nylon`, `Delrin/POM`, `PTFE`, `Rubber`, `Silicone`, `TPU Flex`), colour tint picker, and `Ray Trace` button. |
| `20b-studio-render-lighting` | `20b-studio-render-lighting.png` | Studio Render `Studio` tab with HDRI environment presets, exposure, environment rotation (yaw/pitch), ground shadow, and backdrop controls. |
| `20c-studio-render-settings` | `20c-studio-render-settings.png` | Studio Render `Render` tab with resolution, sample count, aspect ratio, and PNG snapshot export. |
| `21-account-dropdown` | `21-account-dropdown.png` | Top-right user avatar dropdown (`View profile`, `Light mode` / `Dark mode` toggle, plan badge, `Sign out`). |
| `22-workbench-light-mode` | `22-workbench-light-mode.png` | Full 3D CAD Workbench rendered in Light Mode theme (`--t-bg: #f5f5f7`). |
| `23-profile-account-tab` | `23-profile-account-tab.png` | Account Profile view (`Yft`) showing user details, email, current plan tier, and credit balance. |
| `24-profile-token-usage-tab` | `24-profile-token-usage-tab.png` | Token Usage history table (`token_usage` / `token_balances`) tracking AI generation & drawing credits. |
| `25-profile-billing-tab` | `25-profile-billing-tab.png` | Billing & Purchase History tab (`payment_transactions`) with plan upgrade triggers. |
| `26-upgrade-modal` | `26-upgrade-modal.png` | Upgrade Account modal (`Ek` — "Start building something real") showcasing Starter Pack ($2 / 30 credits), Pro ($20/mo), and Engineer ($49/mo). |
| `27-drawing-setup-modal` | `27-drawing-setup-modal.png` | `/drawing` setup dialog (`ymt`) configuring Sheet Size (`A4`, `A3`, `A2`, `A1`), Orientation (`Landscape`/`Portrait`), Projection Standard (`First-Angle ISO` / `Third-Angle ASME`), View Selection (`Front`, `Top`, `Right`, `Isometric`), Part/Assembly scope, Title Block fields, and General Notes. |
| `28-drawing-sheet-generated` | `28-drawing-sheet-generated.png` | Generated 2D Engineering Drawing sheet (`W2t`) with 4 HLR views (Front, Top, Right, Shaded Isometric), automated linear & diameter/radius dimensions (`Ø`, `R`), centerlines, and ISO title block, plus top toolbar (`MEASURE`, `SELECT`, `HIDDEN LINES`, `Export` PDF/DXF, `Edit setup`, `Regenerate`). |
| `31-public-view-page` | `31-public-view-page.png` | `/view/:token` Public 3D Model View (`h8e`) handling valid shared models and invalid/expired link states cleanly. |

---

## 5. Edge Cases & Error States Observed

1. **Unauthenticated Access to Engine (`/`, `/drawing`)**: Redirects or renders the Auth Gate (`Sign In` / `Create Account`) while allowing public `/view/:token` access without login.
2. **Invalid or Revoked Public Share Token (`/view/demo-public-token`)**: Displays a dedicated error state ("Link not found or expired") without crashing the 3D canvas.
3. **Free Tier / Credit Exhaustion Guard**: Disables the `Build` tab (`title="Build is off for this project. Parameters and Brainstorm still work."`) and displays the `Upgrade Account` modal (`Ek`) when attempting credit-consuming AI actions with 0 credits, while keeping manual `PARAMS` editing, 3D inspection, and viewport tools 100% functional.
4. **CAD Worker Compilation Errors**: Malformed JS/Replicad or Python/build123d code returns `{ success: false, error: message }` from the Web Worker without freezing the UI thread, displaying an error banner in the viewport while preserving the last valid mesh.
5. **STEP Import / Drawing Generation Errors**: In `/drawing`, if a model has no valid solids or fails HLR projection, `p === "error"` displays a recovery panel ("Could not generate the drawing" + "Try again").

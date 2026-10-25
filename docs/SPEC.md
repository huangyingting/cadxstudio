# Technical & Functional Specification (SPEC) — CADxStudio

## 1. Authentication, Authorization & Invite-Only Registration

### 1.1 User Roles (`Role`)
- `ADMIN`: Full platform access, `/admin` governance portal (invitation generation/revocation, user management, token grant, audit log inspection, enterprise/API request triage), plus full CAD Engine & Teams capabilities.
- `ENGINEER`: Full access to CADx Design Engine, unlimited 2D Drawings, DXF/STEP/STL/GLTF exports, Studio Render, and Team administration.
- `MEMBER`: Standard authenticated access to CADx Design Engine, parametric editing, project saving, team collaboration, and credit-metered AI generation.
- `VIEWER`: Read-only access to shared projects and public `/view/[token]` links.

### 1.2 Invite-Only Registration Flow (`POST /api/auth/register`)
1. **Input Schema (Zod)**:
   - `invitationCode`: required string (normalized uppercase, trimmed)
   - `email`: required valid email (normalized lowercase)
   - `name`: required string (2–80 chars)
   - `password`: required string (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
2. **Validation Rules**:
   - Reject with `400/403` and record `USER_REGISTER_REJECTED_INVITE` in `AuditLog` if:
     - Invitation code does not exist
     - `invitation.status !== 'ACTIVE'` or `invitation.revokedAt !== null`
     - `invitation.expiresAt <= new Date()` (auto-transitions status to `EXPIRED`)
     - `invitation.usedCount >= invitation.maxUses`
     - `invitation.email` is set and does not match the registrant's `email` (case-insensitive)
3. **Atomic Redemption Transaction**:
   - Create `User` with `passwordHash = bcrypt.hash(password, 12)`, `role = invitation.role`, `planTier = invitation.role === 'ENGINEER' || invitation.role === 'ADMIN' ? 'engineer' : 'pro'`, `creditsBalance = 200`.
   - Create `InvitationRedemption` linking `invitationId` and `userId`.
   - Update `Invitation`: increment `usedCount`, set `usedById = user.id`, and if `usedCount + 1 >= maxUses`, set `status = 'USED'` and `usedAt = now()`.
   - Create `AuditLog` entries for `INVITATION_REDEEMED` and `USER_REGISTERED`.

### 1.3 Admin Bootstrap CLI (`npm run bootstrap:admin`)
- Executed via `tsx scripts/bootstrap-admin.ts`.
- Reads `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, and optional `BOOTSTRAP_INVITE_CODE` (or `--email`, `--password`, `--name`, `--invite-code` CLI flags).
- Upserts the administrator account with `role: 'ADMIN'`, `planTier: 'engineer'`, `creditsBalance: 1000`, and logs `ADMIN_BOOTSTRAPPED` in `AuditLog`.
- Never creates any demo or placeholder accounts unless explicitly invoked by the operator.

---

## 2. Parametric CAD Engine Specification (`src/lib/cad-kernel.ts`)

### 2.1 Code Format & Annotation Parser
The CAD kernel accepts standard CADx Replicad JavaScript code:
- Top-level `const <param> = <number>;` declarations
- `const defaultName = "<Model Name>";`
- `const defaultParams = { ... };`
- `function main(replicad, params = defaultParams) { ... }`
- Structured feature comments:
  - `// @sketch "<name>" plane=XY|XZ|YZ offset=<num> profile=roundedRectangle|rectangle|circle|polygon ... binding=<id>`
  - `// @feature extrude|revolve|fillet|chamfer|shell|boolean|pattern|decorate "<name>" binding=<id> ...`
- Surface decorations array: `const __cadxDecorations = [{ id, kind, face, depth, mode, ... }]`

### 2.2 Supported Solid & CSG Operations
- **2D Profiles**: `drawRoundedRectangle(w, h, r)`, `drawRectangle(w, h)`, `drawCircle(r)`, `drawPolysides(r, sides)`, `drawPolygon(points)`, and `new Sketcher(plane, offset)` (`movePointerTo`, `lineTo`, `line`, `threePointsArcTo`, `close`).
- **3D Solids & Booleans**: `.sketchOnPlane(plane, offset)`, `.extrude(height)`, `.revolve(axis, angle)`, `.fuse(other)`, `.cut(other)`, `.intersect(other)`, `.fillet(radius)`, `.chamfer(distance)`, `.shell(thickness)`, `.translate(x, y, z)`, `.rotate(angle, origin, axis)`.
- **Built-in Parametric Templates**:
  1. `Precision Flanged Bearing Housing` (2-part assembly: `Flange Housing` + `Bronze Bushing`)
  2. `Planetary Spur Gear & Hub` (involute-style gear teeth, lightened web holes, keyed center bore)
  3. `IP65 Electronics Enclosure & Lid` (2-part assembly: shelled housing with mounting bosses, PCB standoffs, ventilated lid)
  4. `CNC Machined Shaft Coupling Bracket` (L-bracket with gusset rib, clamping slot, and counterbored bolt pattern)
  5. `Heat Sink Extrusion Block` (base plate with parametric cooling fin array and mounting holes)
- **AI Text-to-CAD Synthesis (`/api/engine/generate`)**:
  - Parses natural language prompts (e.g., gear, bracket, enclosure, flange/bearing, heat sink, cylinder/bushing, plate, or custom specification with extracted millimeter dimensions) and synthesizes complete, runnable parametric Replicad code with `@sketch` and `@feature` annotations, updating the Feature Tree, Live Parameters, and 3D assembly in real time.

### 2.3 CAD Export Specification
- **STEP (`AP214 .step`)**: Generates valid ISO-10303-21 STEP file (`HEADER; FILE_DESCRIPTION... DATA; MANIFOLD_SOLID_BREP / ADVANCED_FACE /FACE_OUTER_BOUND / POLY_LOOP / CARTESIAN_POINT`) representing all solids and part names/colors.
- **STL (`.stl` ASCII & Binary)**: Exports triangulated facets with outward unit normals.
- **OBJ (`.obj`), GLTF (`.gltf`), GLB (`.glb`), PLY (`.ply`)**: Exports multi-part mesh geometry with vertex positions, normals, and material colors.

---

## 3. 2D Engineering Drawing Engine Specification (`src/lib/drawing-engine.ts`)
- Projects compiled 3D solids onto orthographic (`Front`, `Top`, `Right`, `Back`, `Bottom`, `Left`) and `Isometric` planes.
- Layout adheres to **First-Angle (ISO 128)** or **Third-Angle (ASME Y14.5)** arrangement on standard sheet sizes (`A4` 297×210mm, `A3` 420×297mm, `A2` 594×420mm, `A1` 841×594mm).
- Extracts visible silhouette/feature edges and dashed hidden edges (`showHidden` toggle).
- Automatically generates non-overlapping overall width, depth, height, and hole/boss diameter (`Ø`) & fillet radius (`R`) dimension callouts.
- Supports interactive **MEASURE** (click circle for `Ø`/`R`, click two lines for linear distance) and **SELECT** (drag to reposition or press `Delete` to remove dimensions).
- Exports vector **PDF** and **DXF** (`SECTION HEADER / TABLES / ENTITIES / LINE / CIRCLE / TEXT / EOF`).

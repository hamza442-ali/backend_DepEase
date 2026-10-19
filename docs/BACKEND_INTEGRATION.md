# Backend integration record

## Inputs

- Main originally contained only a placeholder at `2df312d`.
- Hamza: `d080512`, administrative student/teacher workflows, panels and assignments, evaluations/marks, announcements, resource requests, projects, groups and scheduling.
- Abdullah: `4ca2313`, project workflow, documents, email, modules/tasks/team members, Jenkins bridge, login and Docker packaging.
- Mahad: `d6f7793`, additional scheduler and model work on the Abdullah branch family.

The Hamza history and the Abdullah/Mahad history have different roots. Integration uses an explicit merge of unrelated histories, preserving all three contributor tips as ancestors. Shared model imports now forward to the canonical `src/models/` definitions; legacy controller and router entry points forward to `src/controllers/` and `src/routes/`. `LegacyProjectIdea` retains Mahad's unused alternative idea schema under a distinct model/collection name to avoid overwriting `ProjectIdea`. No records are automatically copied or migrated into that unused collection.

## Changes

- Separate validated configuration, app construction, route registration, server startup and shutdown.
- Combine both API families while retaining existing route names and response shapes where possible.
- Centralize CRUD error handling and enable update validation; repair false-success deletion checks, malformed imports, undefined variables, and requests that previously never completed.
- Share models across contributor paths to prevent Mongoose overwrite errors.
- Hash new/reset passwords, redact account password fields, upgrade eligible legacy plaintext credentials on login, validate JWT claims, and add role restrictions and login throttling.
- Bound JSON and multipart requests and reject client-supplied database operators.
- Validate schedule ranges, array inputs, module/project consistency, and Jenkins job and repository input.
- Move credentials to environment configuration and stop tracking `.env`; the developer's existing ignored local file is retained.
- Add upload compensation, safer deletion ordering, SMTP configuration and private Jenkins bridge authentication. Jenkins builds follow the actual queue item and use bounded polling.
- Replace colliding `DockerFile` / `Dockerfile` paths with one Dockerfile, use a non-root runtime, and add health endpoints, setup documentation and CI.

## Product fixes and compatibility

The contributor histories remain intact. The frontend now uses the unified bearer-token API and role-aware workspace. Project membership is enforced by `src/services/project-access.service.js` for both route aliases and child records. Student access comes from registered group membership; supervisors manage their projects; assigned panel members can review and grade but cannot change project work. Administrative APIs require the admin role. The configured product administrator is `admin@hamza.com`; other teacher accounts cannot access the admin portal.

Proposal submission uses one transactional, idempotent `/projects/submit-proposal` operation. The legacy group/proposal/project endpoints remain, with validated ownership and server-controlled fields. Panel rename/delete updates assignments transactionally. Marks use template bounds and preserve evaluator ownership when an administrator edits feedback. Resource approvals are restricted to the responsible role.

Deleting a project now archives it and removes panel assignments. Its public identifier remains reserved permanently, preventing another team from inheriting retained documents or tasks. Archived workspaces disappear from normal project lists and child access is closed. Historical orphan child records also reserve their identifiers. An administrator can create a new workspace with a new identifier and existing group/proposal references; archival does not erase academic records or release group enrollment.

Local documents are private, persistent files; legacy Cloudinary records keep their original provider. Messages between registered users persist in the in-app inbox even when SMTP is absent or unavailable. External recipients require SMTP. Jenkins stays visibly unavailable until a bridge token is configured; credentials alone do not prove connectivity.

The dependency lockfiles have been upgraded and dedicated MongoDB integration regressions cover cross-project requests, ownership spoofing, role boundaries, rollback/retry behavior, uploads, internal delivery, and panel cleanup. CI runs a MongoDB replica set for these tests. The local functional-test deferral from the earlier structural refactor has ended.

## Existing installations and deployment

1. Back up MongoDB and uploads before rollout. Preserve collection names and legacy import aliases. Unlinked historical proposals without a provable owner remain administrator-only; do not infer an owner from client input.
2. Check existing panel IDs and group enrollment for duplicates before creating indexes. Startup fails instead of serving without critical uniqueness constraints. Historical group rows without the derived `members` array remain readable; enrollment writes also check all three legacy registration fields.
3. Set `ADMIN_EMAILS=admin@hamza.com`, create/reset that account using the README operator commands, and sign in again. Never assign administrator rights through a browser-selected role.
4. Rotate credentials exposed in historical sources or tracked environment files. Historical commits and contributor branches are retained. Use fresh application and bridge secrets for a real deployment.
5. Configure and exercise real SMTP, Cloudinary (if selected), and the chosen publishing target separately. Local Jenkins now includes a separate agent and durable queue/build tracking. Builds resume status after the page or API restarts; publishing requires a repository-specific deployment stage.
6. The login limiter is process-local. A multi-replica deployment needs a shared limiter and an explicit trusted-proxy configuration. Configure HTTPS, backups, monitoring, and the actual frontend/API origins for the chosen hosting target.

The `depEase_Jenkins` repository remains separate and contains older demonstration/infrastructure files. It is not used by the tested local product stack. A real infrastructure rollout requires its deployment target and state configuration to be supplied.

# Backend integration record

## Inputs

- Main originally contained only a placeholder at `2df312d`.
- Hamza: `d080512`, administrative student/teacher workflows, panels and assignments, evaluations/marks, announcements, resource requests, projects, groups and scheduling.
- Abdullah: `4ca2313`, project workflow, documents, email, modules/tasks/team members, Jenkins bridge, login and Docker packaging.
- Mahad: `d6f7793`, additional scheduler and model work on the Abdullah branch family.

The Hamza history and the Abdullah/Mahad history have different roots. Integration uses an explicit merge of unrelated histories, preserving all three contributor tips as ancestors. Shared model imports now forward to the canonical `model/` definitions; legacy controller entry points forward to `controller/`. `LegacyProjectIdea` retains Mahad's unused alternative idea schema under a distinct model/collection name to avoid overwriting `ProjectIdea`. No records are automatically copied or migrated into that unused collection.

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

## Verification in this workspace

JavaScript syntax/local-import checks and eight dependency-free unit tests passed. Full npm installation was blocked by network EACCES failures. Express/Mongoose route tests, MongoDB integration tests, Python bridge tests and Docker image builds have been added but could not run locally: npm dependencies could not be downloaded, no Python interpreter is installed, and Docker daemon access is denied. Do not interpret the local unit pass as full integration validation.

GitHub SSH and HTTPS access are unavailable, and the GitHub connector is not connected. Remote branch freshness and publication could not be verified. Local history records the integration without rewriting contributor branches.

## Before deployment

1. Rotate MongoDB, SMTP, Cloudinary and Jenkins credentials that appeared in the old sources or tracked environment file. They remain in historical commits. Use a new JWT secret and bridge token. History cleanup, if desired, needs coordination with all collaborators and is not part of this merge.
2. Run all CI checks and live smoke tests against staging. Configure the admin teacher allowlist and create/reset accounts as described in the README. Existing browser sessions must sign in again.
3. Update the frontend's admin authentication and API client to send bearer tokens on Hamza's formerly open routes. Preserve the teacher-list path casing noted in the README. This backend change does not update either frontend branch.
4. Complete project-level authorization: several legacy project, task, resource, document, proposal and team routes still accept project IDs from any authenticated user. The new role guards do not establish team ownership across these models. Define student, team lead, supervisor, panel and admin permissions before exposing the merged service to untrusted users.
5. Audit and upgrade npm dependencies with a regenerated lockfile and regression runs. The original Node dependency versions are intentionally retained because package installation and dependency validation were unavailable here; this refactor is not a dependency vulnerability clearance.
6. Use isolated Jenkins agents with restricted IAM/network permissions for repository-controlled Jenkinsfiles. The bridge authenticates calls; it does not sandbox build code. Add durable build-status tracking and recovery for builds exceeding the synchronous polling window.
7. Add transactional handling for multi-document panel renames, persisted job operations, pagination and database indexes after checking existing data. The in-process login limiter needs a shared store and correctly configured proxy trust when deploying multiple API replicas.

## Next repository work

The frontend main branch also contains a placeholder. Compare and consolidate its three contributor branches, unify API configuration/auth state, remove hard-coded localhost URLs, redesign role-specific navigation and forms, add loading/error/empty states, and test complete workflows against this API.

The separate infrastructure repository contains a tracked Terraform state file and an older demonstration application. Review its real deployment target, move state to an appropriate backend, inspect secret handling, and align its Docker/Jenkins/Terraform pipeline with the consolidated backend and frontend. Keep these as separate repository integrations unless a monorepo is explicitly chosen.

# Backend architecture

## Source layout

All application implementations live in `src/`. Files in the original root-level `controller/`, `controllers/`, `model/`, `models/`, and `routes/` directories only forward imports to the canonical implementation. This keeps contributor imports compatible without maintaining duplicate application logic.

| Location | Responsibility |
| --- | --- |
| `src/app.js` | Build the Express application without opening a network listener |
| `src/server.js` | Connect infrastructure, start HTTP, and close resources on shutdown |
| `src/config/` | Read and validate environment settings |
| `src/constants/` | Shared role and workflow vocabulary |
| `src/routes/` | Map existing HTTP paths to middleware and controllers |
| `src/controllers/` | Adapt request input and service results to HTTP responses |
| `src/models/` | Define the existing MongoDB document schemas |
| `src/middleware/` | Request validation, authorization, headers, and error handling |
| `src/errors/` | Application error types |
| `src/security/` | Password hashing and credential handling |
| `src/integrations/` | External service clients |
| `src/utils/` | Small shared helpers with no startup side effects |

## Compatibility

Existing HTTP URLs, response field names, model registration names, and collection names remain part of the application contract. Database fields such as `ProjectId`, `projectid`, `Designation`, and the historical teacher password field `passoword` are intentionally preserved. Correcting source filenames does not rename stored fields.

Aliases such as `/project` and `/projects` mount the same canonical router. Case-sensitive teacher list paths retain their separate response shapes. Feature behavior and access policy changes should be separate from structural refactors.

## Conventions

- Use descriptive domain names: `ProjectModule`, `ScheduleSlot`, and `EvaluationMarks` rather than a generic `Model` in feature controllers.
- Use `kebab-case` filenames with an explicit suffix such as `.controller.js`, `.model.js`, or `.routes.js`.
- Keep shared CRUD mechanics in `controllers/crud-handlers.js`; keep feature-specific workflows explicit.
- Throw `HttpError` for expected application failures. Express async handlers forward failures to the common error middleware.
- Import canonical modules directly inside `src/`; do not import compatibility files from application implementations.
- Keep environment access and third-party SDK configuration out of feature controllers.
- Use Prettier and EditorConfig for consistent formatting. Avoid unrelated schema or API contract changes during a structural refactor.

All contributor branches are retained. Refactor commits are published in chunks on `refactor/backend-clean-architecture` before integration into `main`.

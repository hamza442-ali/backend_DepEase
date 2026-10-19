# DepEase backend

The backend combines the Hamza, Mahad, and Abdullah feature histories in one application. Node.js 22+ and MongoDB are required. The frontend and infrastructure remain separate repositories.

## Run the complete local product (Windows)

Clone `Frontend_DepEase` beside this backend directory. Start Docker Desktop, then run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

Open **http://localhost:8080**, select **Administrator**, and sign in as **admin@hamza.com**. The generated password is stored only in the ignored `.local/credentials.local.json` file. The script reuses that password on later runs; it does not reset accounts. The sole admin email is configured through `ADMIN_EMAILS`. Other teacher accounts receive the teacher role and cannot use administrator pages or APIs.

The stack creates a private MongoDB replica set, the API, and the production frontend. MongoDB data and document uploads persist in Docker volumes. Only the frontend (8080) and API (3001) are published, bound to the local computer. `scripts/stop-local.ps1` stops the stack and keeps its data. Running the start script again rebuilds changed code and starts it again. Keep the `.local` directory private and backed up with your local configuration.

Use **People** to create teacher and student accounts. Students select **Student** at sign-in and submit a proposal with two registered teammates. Teachers select **Teacher**. Start with Projects, Requirements, Task board, Documents, and Messages. Registered users can exchange internal messages without SMTP.

## Manual setup

1. Run `npm ci` using Node.js 22 or newer.
2. Copy `.env.example` to `.env`. Configure a MongoDB replica set or Atlas cluster; transactions are required for proposal submission, project archival, and panel updates.
3. Generate a fresh `SECRET_KEY` of at least 32 random bytes and set `ADMIN_EMAILS=admin@hamza.com`.
4. Create the administrator account using the operator instructions below, then run `npm start` (port 3001). Development mode: `npm run dev`.

Startup validates configuration, connects to MongoDB, and initializes the critical enrollment/idempotency indexes before accepting requests. SIGTERM and SIGINT close the HTTP server and database connection.

## First administrator

Create a local, ignored `admin-account.local.json` file with teacher fields: `name`, `employeeId`, `email`, `mobile`, `Designation`, and `password` (8-1024 characters). Use a strong, unique password. Add that email to `ADMIN_EMAILS` and run:

`Get-Content .\admin-account.local.json | node scripts/create-account.js teacher`

On Bash, use `node scripts/create-account.js teacher < admin-account.local.json`. Delete the local input file after use. The script hashes passwords and never prints the input. The same script accepts `student` with the fields in `src/models/student.model.js`.

For an existing account, supply a local JSON file containing `email` and `password` to `scripts/reset-password.js teacher` (or `student`) through standard input. Database access is required; this is an operator command, not a public registration API.

## Authentication and compatibility

- `POST /login`: `{ "email_address": "...", "password": "..." }`.
- `POST /loginT`: `{ "email": "...", "password": "..." }`. The old `passoword` request field is also accepted.
- Responses preserve the `student` / `teacher` and `token` fields and add `role`. Password fields are omitted.
- Send `Authorization: Bearer <token>` on feature requests. Tokens expire after eight hours. Previous tokens must be replaced by signing in again.
- Existing plaintext passwords upgrade to salted scrypt hashes on a successful login. Legacy passwords shorter than eight characters require an operator reset. Stored database field names and existing collection names remain compatible.
- Account creation/deletion, panel management, and administrator announcements require an admin account. Evaluations, marks and Jenkins require a teacher or admin account. Schedule changes, supervisor announcements, project-idea creation and resource approvals also require a teacher or admin. Students can read only their own student profile.
- The admin teacher list is `GET /teacher/getAll` (array); the general teacher list is `GET /teacher/getall` (`{ data: [...] }`). These two paths are case sensitive to preserve both branch contracts.
- Both `/project` and `/projects`, and `/scheduling` and `/schedule`, are available. Mahad's repaired scheduler CRUD is under `/scheduler/scheduler`.
- Empty lists return `[]`; missing individual records return 404. Malformed data returns 400 and duplicate unique fields return 409.

See [integration notes](docs/BACKEND_INTEGRATION.md) for branch provenance, rollout requirements, and remaining work.

## Optional services

Local document storage and internal messages work without external services. Cloudinary, SMTP, and Jenkins are optional. Configure their variables in your ignored `.env` when enabling them. The Node process reads `.env`; the Python bridge reads process environment variables and does not automatically load that file.

For the Docker stack, add optional service variables to the ignored `.local/compose.env` instead. SMTP uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Cloudinary uses the three `CLOUDINARY_*` values and `DOCUMENT_STORAGE=cloudinary`. For Jenkins, provide `JENKINS_URL`, `JENKINS_USER`, `JENKINS_API_TOKEN`, and a fresh `JENKINS_BRIDGE_TOKEN` of at least 32 characters, then start with `scripts/start-local.ps1 -WithJenkins`. Do not put credentials in frontend build variables.

Documents default to protected local storage (`DOCUMENT_STORAGE=local`, `UPLOAD_DIR=data/uploads`). Back up the uploads directory/volume with MongoDB. Downloads require a valid bearer token and project access; local files are never exposed as public static assets. Existing Cloudinary documents retain their provider and remain readable. To use Cloudinary for new uploads, set `DOCUMENT_STORAGE=cloudinary` and its credentials. Document uploads use a 10 MiB default memory limit, configurable with `UPLOAD_MAX_BYTES`. SMTP sends from `SMTP_FROM` and uses the authenticated email as Reply-To. No service credentials are stored in source.

The Jenkins bridge requires Python 3.12. Install `jenkinsScript/requirements.txt`, provide its environment variables, and run Gunicorn from that directory as configured in its Dockerfile. `python jenkins.py` binds to localhost for development. Use a dedicated Jenkins API token and the same fresh `JENKINS_BRIDGE_TOKEN` in Node and Python. Keep the bridge private. Jobs require a repository-hosted Jenkinsfile on main; GitHub, GitLab and Bitbucket HTTPS URLs are supported. Build polling follows the newly returned queue item for up to 90 seconds; long builds return 202. Console logs are not returned to clients. The frontend needs a later build-status view for long-running jobs.

## Source structure

The canonical implementation lives in `src/`. See [architecture](docs/ARCHITECTURE.md) for module responsibilities and contributor compatibility paths. Old root-level imports are supported through small forwarding files.

Use `npm run format` to format application code and `npm run format:check` to check formatting. This structural refactor preserves existing HTTP contracts and MongoDB fields.

## Checks

- `npm run check`: parse all JavaScript and verify local module paths, including filename case.
- `npm run test:unit`: dependency-free configuration, password, request validation and error-handling tests.
- `npm test`: unit tests plus Express route and model loading tests; requires installed npm dependencies.
- `npm run test:integration`: requires a local replica set and `TEST_MONGODB_URI=mongodb://127.0.0.1:27017/depease_test?directConnection=true`. Uses and drops an isolated process-specific database; refuses other hosts and database names.
- `python -m unittest discover -s jenkinsScript/tests`: bridge regressions using mocked Jenkins calls.

GitHub Actions installs dependencies, runs these checks against MongoDB, and builds both Docker images. Tests do not use the developer's `.env` or contact production services.

## Containers

Run `docker build -t depease-backend .`, then provide the runtime environment with `docker run --env-file .env -p 3001:3001 depease-backend`. Ensure the configured MongoDB host is reachable from the container; localhost inside a container refers to that container. The image runs as the node user and excludes environment files. Build the private bridge separately with `docker build -t depease-bridge jenkinsScript`.

Liveness: `GET /health/live`. Readiness: `GET /health/ready` (503 until MongoDB is connected). CORS origins must be explicitly listed in `CORS_ORIGINS`.

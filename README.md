# DepEase backend

The backend combines the Hamza, Mahad, and Abdullah feature histories in one application. Node.js 22+ and MongoDB are required. The frontend and infrastructure remain separate repositories.

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env`, set a MongoDB URI, and generate a fresh `SECRET_KEY` of at least 32 random bytes. Example: `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
3. Set `ADMIN_EMAILS` to the email addresses of teacher accounts that should administer the application.
4. Run `npm start`. The default port is 3001. Development mode: `npm run dev`.

Startup validates required configuration and connects to MongoDB before listening. SIGTERM and SIGINT close the HTTP server and database connection.

## First administrator

Create a local, ignored `admin-account.local.json` file with teacher fields: `name`, `employeeId`, `email`, `mobile`, `Designation`, and `password` (8?1024 characters). Use a strong, unique password. Add that email to `ADMIN_EMAILS` and run:

`Get-Content .\admin-account.local.json | node scripts/create-account.js teacher`

On Bash, use `node scripts/create-account.js teacher < admin-account.local.json`. Delete the local input file after use. The script hashes passwords and never prints the input. The same script accepts `student` with the fields in `model/studentModel.js`.

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

Cloudinary, SMTP, and Jenkins are optional. Populate their variables in `.env.example` when using those endpoints. The Node process reads `.env`; the Python bridge reads process environment variables and does not automatically load that file.

Document uploads use a 10 MiB default memory limit, configurable with `UPLOAD_MAX_BYTES`. SMTP sends from `SMTP_FROM` and uses the authenticated email as Reply-To. No service credentials are stored in source.

The Jenkins bridge requires Python 3.12. Install `jenkinsScript/requirements.txt`, provide its environment variables, and run Gunicorn from that directory as configured in its Dockerfile. `python jenkins.py` binds to localhost for development. Use a dedicated Jenkins API token and the same fresh `JENKINS_BRIDGE_TOKEN` in Node and Python. Keep the bridge private. Jobs require a repository-hosted Jenkinsfile on main; GitHub, GitLab and Bitbucket HTTPS URLs are supported. Build polling follows the newly returned queue item for up to 90 seconds; long builds return 202. Console logs are not returned to clients. The frontend needs a later build-status view for long-running jobs.

## Checks

- `npm run check`: parse all JavaScript and verify local module paths, including filename case.
- `npm run test:unit`: dependency-free configuration, password, request validation and error-handling tests.
- `npm test`: unit tests plus Express route and model loading tests; requires installed npm dependencies.
- `npm run test:integration`: requires `TEST_MONGODB_URI=mongodb://127.0.0.1:27017/depease_test`. Uses and drops an isolated process-specific database; refuses other hosts and database names.
- `python -m unittest discover -s jenkinsScript/tests`: bridge regressions using mocked Jenkins calls.

GitHub Actions installs dependencies, runs these checks against MongoDB, and builds both Docker images. Tests do not use the developer's `.env` or contact production services.

## Containers

Run `docker build -t depease-backend .`, then provide the runtime environment with `docker run --env-file .env -p 3001:3001 depease-backend`. Ensure the configured MongoDB host is reachable from the container; localhost inside a container refers to that container. The image runs as the node user and excludes environment files. Build the private bridge separately with `docker build -t depease-bridge jenkinsScript`.

Liveness: `GET /health/live`. Readiness: `GET /health/ready` (503 until MongoDB is connected). CORS origins must be explicitly listed in `CORS_ORIGINS`.

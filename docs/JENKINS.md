# Jenkins operations

Run `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-local.ps1 -WithJenkins` with Docker Desktop running. The application opens at http://localhost:8080 and Jenkins at http://localhost:8082. Subsequent ordinary starts include Jenkins automatically. `scripts/stop-local.ps1` stops the whole stack and preserves its data.

Jenkins operator credentials are in `.local/jenkins-credentials.local.json`. DepEase credentials remain in `.local/credentials.local.json`, with `admin@hamza.com` as its administrator. The controller creates a limited service account and shares its API token only with the bridge. The agent receives a separate agent secret. All credentials stay outside source control.

The controller has zero build executors. Work runs on the `depease-local` agent, with one executor, Node.js, npm, Git, Python and persistent dependency caches. The agent has neither a host Docker socket nor the application's MongoDB network. This setup is for trusted local development; it is not a production sandbox for hostile student code.

Connect a public GitHub, GitLab or Bitbucket repository from Deployments, choosing its branch and repository-relative Jenkinsfile. Only its supervisor or an administrator can manage jobs and builds; assigned panel members can inspect history. Private repositories need Jenkins-side SCM credentials; the default generator does not yet select a private credential ID.

The root Jenkinsfiles check the real backend and frontend source. Backend checks run syntax, formatting, unit/API and Python bridge tests. Database integration and Docker builds remain in GitHub Actions. Frontend checks run lint, formatting and its production build. These pipelines validate/build applications; add a publishing stage for your chosen host to deploy them.

Each build is persisted before submission. A transaction and unique active-run index prevent concurrent clicks from queuing multiple runs. A stable request key protects retries; Jenkins also receives a server-generated correlation ID. Short status requests follow queue/build numbers, recover evicted queue entries from recent history and retain progress during outages. Polling stops when the page closes and resumes on return. The page displays the last 20 runs.

After publishing, archive `depease-deployment.json` containing the actual address, for example `{"url":"https://your-application.example"}`. The bridge prefers this bounded artifact and supports the legacy `deployedLink:` marker. Logs are never returned to clients. A failed newer build does not erase the last published application link.

Cancellation stays pending until Jenkins confirms a terminal state. Finish or cancel active runs before removing a pipeline. Removal deletes the owned Jenkins job and saved history without running a teardown. New jobs have an ownership marker, so setup retries recover an already-created job and cleanup leaves unrelated jobs intact. Interrupted setup is visible and can be retried.

If the controller has lost both a queue item and its build history, the run stays Needs confirmation. Inspect Jenkins before an operator resolves that record; the application never guesses that it is safe to enqueue another run. Back up MongoDB, uploads, Jenkins home and its private token volumes together. Rebuilding containers preserves operator credentials; deleting volumes does not.

Existing installations must resolve duplicate job names and `(ProjectId, Type)` pairs before enabling their unique indexes. Legacy records default to ready pipelines on main with a root Jenkinsfile. No external database is migrated automatically. The old route spellings remain, with build submission now asynchronous.

For an external controller, omit `compose.jenkins.yml`, enable the base `jenkins` profile and configure `JENKINS_URL`, `JENKINS_USER`, `JENKINS_API_TOKEN` and a shared `JENKINS_BRIDGE_TOKEN`. `JENKINS_API_TOKEN_FILE` can supply a private token file instead. `JENKINS_PUBLIC_URL` supplies browser-facing links. Install the Pipeline/Git plugins and use an agent with the required label/tools. Keep the bridge private.

References: [Jenkins remote API](https://www.jenkins.io/doc/book/using/remote-access-api/), [official Docker setup](https://www.jenkins.io/doc/book/installing/docker/), and [Jenkinsfile stages](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/).

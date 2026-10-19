$repositoryPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
docker compose --project-directory $repositoryPath --env-file (Join-Path $repositoryPath '.local/compose.env') -f (Join-Path $repositoryPath 'compose.local.yml') -p depease-local stop
if ($LASTEXITCODE -ne 0) { throw 'Could not stop the local stack.' }
Write-Output 'DepEase stopped. Database records and uploaded files are retained.'

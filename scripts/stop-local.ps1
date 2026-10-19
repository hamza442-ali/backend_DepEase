$repositoryPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$composeArguments = @('-f', (Join-Path $repositoryPath 'compose.local.yml'))
if (Test-Path -LiteralPath (Join-Path $repositoryPath '.local/jenkins-credentials.local.json')) { $composeArguments += @('-f', (Join-Path $repositoryPath 'compose.jenkins.yml')) }
docker compose --project-directory $repositoryPath --env-file (Join-Path $repositoryPath '.local/compose.env') @composeArguments -p depease-local --profile jenkins stop
if ($LASTEXITCODE -ne 0) { throw 'Could not stop the local stack.' }
Write-Output 'DepEase stopped. Database records and uploaded files are retained.'

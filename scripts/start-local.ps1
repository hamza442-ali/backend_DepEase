param([string]$AdminEmail = 'admin@hamza.com', [switch]$WithJenkins)
$ErrorActionPreference = 'Stop'
$repositoryPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$frontendPath = Join-Path $repositoryPath '../Frontend_DepEase'
if (-not (Test-Path -LiteralPath (Join-Path $frontendPath 'package.json'))) { throw 'Clone Frontend_DepEase beside backend_DepEase first.' }
docker info --format '{{.ServerVersion}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Start Docker Desktop first.' }
if ($AdminEmail -notmatch '^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') { throw 'Provide a valid administrator email.' }
$localPath = Join-Path $repositoryPath '.local'
[IO.Directory]::CreateDirectory($localPath) | Out-Null
$environmentPath = Join-Path $localPath 'compose.env'
if (-not (Test-Path -LiteralPath $environmentPath)) {
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  $randomBytes = New-Object byte[] 48
  $rng.GetBytes($randomBytes)
  $secret = ([BitConverter]::ToString($randomBytes)).Replace('-','').ToLowerInvariant()
  $rng.GetBytes($randomBytes)
  $password = ([BitConverter]::ToString($randomBytes)).Replace('-','').ToLowerInvariant()
  $rng.Dispose()
  $email = $AdminEmail.ToLowerInvariant()
  $encoding = New-Object Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($environmentPath, "DEPEASE_SECRET_KEY=$secret`nDEPEASE_ADMIN_EMAIL=$email`nDEPEASE_ADMIN_PASSWORD=$password`n", $encoding)
  $credentials = @{ email=$email; password=$password; url='http://localhost:8080' } | ConvertTo-Json
  [IO.File]::WriteAllText((Join-Path $localPath 'credentials.local.json'), $credentials, $encoding)
}
$profileArguments = @()
$composeArguments = @('-f', (Join-Path $repositoryPath 'compose.local.yml'))
$jenkinsCredentialsPath = Join-Path $localPath 'jenkins-credentials.local.json'
$useLocalJenkins = $WithJenkins -or (Test-Path -LiteralPath $jenkinsCredentialsPath)
if ($useLocalJenkins) {
  $localEnvironment = [IO.File]::ReadAllText($environmentPath)
  $encoding = New-Object Text.UTF8Encoding($false)
  foreach ($key in @('JENKINS_BRIDGE_TOKEN', 'DEPEASE_JENKINS_ADMIN_PASSWORD')) {
    if ($localEnvironment -notmatch "(?m)^$key=") {
      $bytes = New-Object byte[] $(if ($key -eq 'DEPEASE_JENKINS_ADMIN_PASSWORD') {32} else {48})
      $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
      $rng.GetBytes($bytes)
      $rng.Dispose()
      $generated = ([BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()
      $localEnvironment += "`n$key=$generated`n"
    }
  }
  [IO.File]::WriteAllText($environmentPath, $localEnvironment, $encoding)
  $match = [regex]::Match($localEnvironment, '(?m)^DEPEASE_JENKINS_ADMIN_PASSWORD=([^\r\n]+)')
  $jenkinsCredentials = @{ username='depease-admin'; password=$match.Groups[1].Value; url='http://localhost:8082' } | ConvertTo-Json
  [IO.File]::WriteAllText($jenkinsCredentialsPath, $jenkinsCredentials, $encoding)
  $profileArguments = @('--profile', 'jenkins')
  $composeArguments += @('-f', (Join-Path $repositoryPath 'compose.jenkins.yml'))
}
docker compose --project-directory $repositoryPath --env-file $environmentPath @composeArguments -p depease-local @profileArguments up -d --build --wait
if ($LASTEXITCODE -ne 0) { throw 'Local startup failed. Inspect docker compose logs before retrying.' }
Write-Output 'DepEase is ready at http://localhost:8080'
Write-Output "Administrator credentials: $(Join-Path $localPath 'credentials.local.json')"
if ($useLocalJenkins) {
  Write-Output 'Local Jenkins: http://localhost:8082 (builds run on the separate development agent)'
  Write-Output "Jenkins administrator credentials: $jenkinsCredentialsPath"
}

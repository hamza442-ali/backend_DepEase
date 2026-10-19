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
if ($WithJenkins) { $profileArguments = @('--profile', 'jenkins') }
docker compose --project-directory $repositoryPath --env-file $environmentPath -f (Join-Path $repositoryPath 'compose.local.yml') -p depease-local @profileArguments up -d --build --wait
if ($LASTEXITCODE -ne 0) { throw 'Local startup failed. Inspect docker compose logs before retrying.' }
Write-Output 'DepEase is ready at http://localhost:8080'
Write-Output "Administrator credentials: $(Join-Path $localPath 'credentials.local.json')"

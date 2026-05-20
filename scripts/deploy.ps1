# deploy.ps1 — Build locally, upload artifacts, deploy on server
# Usage: .\scripts\deploy.ps1                           (uses defaults below)
#        .\scripts\deploy.ps1 -ServerIP 1.2.3.4 -User ubuntu

param(
    [string]$ServerIP   = "185.206.94.116",   # new server (demo.kurdnezambargh.ir)
    [string]$User       = "ubuntu",
    [string]$DeployPath = "/opt/vahedbargh-web",
    [string]$KeyFile    = ""          # optional: path to SSH private key
)

$ErrorActionPreference = "Stop"
$Server = "$User@$ServerIP"
$SshOpts = if ($KeyFile) { @("-i", $KeyFile) } else { @() }

function SSH([string]$Cmd) {
    & "C:\Program Files\PuTTY\plink.exe" -pw "P@33word@1234" -batch $Server $Cmd
    if ($LASTEXITCODE -ne 0) { throw "SSH command failed: $Cmd" }
}

function Step([string]$Msg) {
    Write-Host "`n$Msg" -ForegroundColor Cyan
}

# ── 1. Build ────────────────────────────────────────────────────────────────
Step "[1/4] npm run build:prod"
npm run build:prod
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# Verify standalone output was generated
if (-not (Test-Path ".next\standalone")) {
    throw "Standalone output not found. Ensure next.config.ts has output: 'standalone'."
}

# ── 2. Package ───────────────────────────────────────────────────────────────
Step "[2/4] Packaging artifacts"
$TmpDir = ".\deploy-tmp"
Remove-Item $TmpDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory "$TmpDir\.next" | Out-Null

Copy-Item -Recurse ".next\standalone" "$TmpDir\.next\standalone"
Copy-Item -Recurse ".next\static"    "$TmpDir\.next\static"
Copy-Item -Recurse "public"           "$TmpDir\public"
Copy-Item "Dockerfile"                "$TmpDir\"
Copy-Item "docker-compose.yml"        "$TmpDir\"

# Include .env.production if present locally
if (Test-Path ".env.production") {
    Copy-Item ".env.production" "$TmpDir\"
    Write-Host "  .env.production included" -ForegroundColor DarkGray
} else {
    Write-Host "  .env.production not found locally — make sure it exists on the server at $DeployPath/.env.production" -ForegroundColor Yellow
}

Compress-Archive -Path "$TmpDir\*" -DestinationPath "deploy.zip" -Force
Remove-Item $TmpDir -Recurse -Force
$Size = [math]::Round((Get-Item deploy.zip).Length / 1MB, 1)
Write-Host "  deploy.zip created ($Size MB)"

# ── 3. Upload ────────────────────────────────────────────────────────────────
Step "[3/4] Uploading to ${Server}:${DeployPath}"
SSH "sudo mkdir -p $DeployPath && sudo chown ubuntu:ubuntu $DeployPath"
& "C:\Program Files\PuTTY\pscp.exe" -pw "P@33word@1234" -batch deploy.zip "${Server}:${DeployPath}/deploy.zip"
Remove-Item deploy.zip

# ── 4. Deploy ────────────────────────────────────────────────────────────────
Step "[4/4] Deploying on server"
SSH "python3 -c ""import zipfile; zipfile.ZipFile('$DeployPath/deploy.zip').extractall('$DeployPath/')"" && rm $DeployPath/deploy.zip && cd $DeployPath && docker compose up -d --build"

Step "Done! App is live at https://demo.kurdnezambargh.ir"

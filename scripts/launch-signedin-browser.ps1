# PowerShell Helper: Launches Chrome (or Edge) with Remote Debugging on Port 9222
# This allows Puppeteer to attach directly to your existing browser with all your accounts signed in!

$ErrorActionPreference = "SilentlyContinue"

$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$browserExe = $null

foreach ($p in $chromePaths) {
    if (Test-Path $p) {
        $browserExe = $p
        break
    }
}

if (-not $browserExe) {
    foreach ($p in $edgePaths) {
        if (Test-Path $p) {
            $browserExe = $p
            break
        }
    }
}

if (-not $browserExe) {
    Write-Host "[ERROR] Could not find Google Chrome or Microsoft Edge installed." -ForegroundColor Red
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   CAVDAX Signed-In Browser Launcher (Port 9222)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Launching: $browserExe" -ForegroundColor Gray
Write-Host "Remote Debugging Port: 9222" -ForegroundColor Yellow
Write-Host "Log into your accounts here once — Puppeteer will attach to this live session!" -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor Gray

$profilePath = Join-Path $PSScriptRoot "..\.puppeteer-profile"

Start-Process -FilePath $browserExe -ArgumentList @(
    "--remote-debugging-port=9222",
    "--user-data-dir=`"$profilePath`"",
    "http://localhost:5173"
)

Write-Host "[SUCCESS] Browser launched! Puppeteer scripts can now attach automatically." -ForegroundColor Green

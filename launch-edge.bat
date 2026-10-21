@echo off
title CAVDAX - Microsoft Edge Persistent Browser Runner
color 0B
echo ======================================================================
echo    CAVDAX: Microsoft Edge Persistent Automation Browser Runner
echo ======================================================================
echo.
echo  Starting from: %~dp0
echo.
cd /d "%~dp0"

echo [1/2] Checking local dev server (http://localhost:5173)...
powershell -NoProfile -Command "try { $res = (Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 1).StatusCode; if ($res -eq 200) { Write-Host '  ✔ Dev server is LIVE on http://localhost:5173' -ForegroundColor Green } } catch { Write-Host '  ⚠ Notice: Dev server is not detected on port 5173. Start it in another terminal with: npm run client' -ForegroundColor Yellow }"

echo.
echo [2/2] Launching Microsoft Edge with Persistent Profile...
echo       (Log in once -- your logins & cookies are permanently saved!)
echo.
node scripts/browser-runner.js --edge

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Runner encountered an issue (Exit Code %ERRORLEVEL%).
    pause
)

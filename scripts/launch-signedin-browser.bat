@echo off
REM CAVDAX Signed-In Browser Launcher (Port 9222)
REM Launches Google Chrome or Microsoft Edge with remote debugging enabled.

powershell -ExecutionPolicy Bypass -File "%~dp0launch-signedin-browser.ps1"

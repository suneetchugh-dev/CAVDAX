<#
.SYNOPSIS
Publishes the Graphify interactive knowledge graph (graph.html) to GitHub Pages (gh-pages branch)
without polluting the main, frontend, backend, or docs branches.
#>

$ErrorActionPreference = "Stop"

# Locate graph.html
$parentGraph = Join-Path $PSScriptRoot "..\..\graphify-out\graph.html"
$localGraph = Join-Path $PSScriptRoot "..\graphify-out\graph.html"

$sourceHtml = $null
if (Test-Path $parentGraph) {
    $sourceHtml = (Resolve-Path $parentGraph).Path
} elseif (Test-Path $localGraph) {
    $sourceHtml = (Resolve-Path $localGraph).Path
} else {
    Write-Error "ERROR: graph.html not found! Run 'graphify' or 'graphify export html' first."
    exit 1
}

Write-Host "==> Found knowledge graph HTML at: $sourceHtml"

# Mandatory Pre-Publish Markup Integrity Guard
$verifyScript = Join-Path $PSScriptRoot "verify-graph-integrity.py"
if (Test-Path $verifyScript) {
    Write-Host "==> Executing Pre-Publish Graph Integrity Audit..." -ForegroundColor Yellow
    & python $verifyScript $sourceHtml
    if ($LASTEXITCODE -ne 0) {
        Write-Error "FATAL: Pre-publish integrity check failed! Halting publish to prevent deploying leaking/corrupted HTML."
        exit 1
    }
} else {
    Write-Warning "verify-graph-integrity.py not found in scripts directory; skipping integrity check."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("cavdax-gh-pages-" + [System.Guid]::NewGuid().ToString().Substring(0, 8))

try {
    Write-Host "==> Creating temporary workspace at: $tempDir"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # Copy graph.html as index.html
    $destIndex = Join-Path $tempDir "index.html"
    Copy-Item -Path $sourceHtml -Destination $destIndex -Force
    
    # Initialize git repo in temp workspace
    Push-Location $tempDir
    & git init -b gh-pages
    & git remote add origin (git -C $repoRoot remote get-url origin)
    & git add index.html
    & git commit -m "deploy: publish interactive knowledge graph to GitHub Pages [skip ci]"
    
    Write-Host "==> Pushing to origin/gh-pages..."
    & git push -f origin gh-pages
    
    Write-Host ""
    Write-Host "==========================================================================" -ForegroundColor Green
    Write-Host "SUCCESS: Interactive 3D Knowledge Graph published to gh-pages branch!" -ForegroundColor Green
    Write-Host "Live URL (when GitHub Pages is enabled):" -ForegroundColor Cyan
    Write-Host "  https://suneetchugh-dev.github.io/CAVDAX/" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Green
} finally {
    Pop-Location
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue $tempDir
    }
}

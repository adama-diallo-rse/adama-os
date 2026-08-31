param([switch]$SkipBuild)

# Local validation only. No dependency installation, Git push or CI action.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$webRoot = Join-Path $projectRoot 'apps/web'

function Invoke-LocalCheck {
    param([string]$Label, [string]$Entry, [string[]]$Arguments)
    Write-Host "`n$Label" -ForegroundColor Cyan
    & node $Entry @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Label a échoué. Corriger avant le push."
    }
}

Push-Location $webRoot
try {
    Invoke-LocalCheck 'TypeScript' '../../node_modules/typescript/bin/tsc' @('--noEmit')
    Invoke-LocalCheck 'Tests locaux' 'node_modules/vitest/vitest.mjs' @('run')
    Invoke-LocalCheck 'Lint' 'node_modules/eslint/bin/eslint.js' @('.')
    if (-not $SkipBuild) {
        Invoke-LocalCheck 'Build de production' 'node_modules/next/dist/bin/next' @('build')
    }
    Write-Host "`nVérifications terminées. Aucun push effectué." -ForegroundColor Green
} finally {
    Pop-Location
}

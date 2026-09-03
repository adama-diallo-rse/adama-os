param([switch]$SkipBuild)

# Verification locale uniquement. Aucune installation de dependance, aucun
# push git, aucune action d'integration continue.
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

# C0-T5 : l'inventaire est un artefact versionne. S'il a bouge sans etre
# regenere, la verification s'arrete ici, avant meme le typecheck : un depot
# dont l'inventaire ment n'a pas besoin d'etre construit.
Write-Host "`nInventaire" -ForegroundColor Cyan
& node (Join-Path $projectRoot 'scripts/inventory.mjs') --check
if ($LASTEXITCODE -ne 0) {
    throw "Inventaire périmé. Lancer 'pnpm inventory' puis committer docs/inventory.json et docs/INVENTORY.md."
}

# C12-T9 : le gel editorial. Pendant une campagne de candidature, un lien
# envoye le lundi doit montrer la meme chose le vendredi. Hors campagne ce
# controle ne dit rien et coute quelques millisecondes ; pendant une campagne
# il arrete la sequence, ce qui est exactement son role.
Write-Host "`nGel éditorial" -ForegroundColor Cyan
& node (Join-Path $projectRoot 'scripts/freeze.mjs') --check
if ($LASTEXITCODE -ne 0) {
    throw "Gel éditorial rompu. Trancher : 'pnpm freeze --renouveler' pour accepter le nouveau contenu, ou restaurer apps/web/content."
}

# C0-T4 : le balayage de secrets. Il lit l'historique git, donc il ne peut
# tourner qu'ici et pas dans un conteneur qui a recu des fichiers copies. Il
# sort en code 2 quand il n'a PAS pu s'executer, ce qui n'est pas un feu vert
# et ne doit donc pas etre confondu avec une reussite.
Write-Host "`nBalayage de secrets" -ForegroundColor Cyan
& node (Join-Path $projectRoot 'scripts/scan-secrets.mjs')
if ($LASTEXITCODE -eq 2) {
    throw "Le balayage de secrets n'a pas pu s'exécuter. Ce n'est pas un feu vert."
}
if ($LASTEXITCODE -ne 0) {
    throw "Le balayage de secrets a trouvé une valeur sensible. Suivre la procédure affichée avant tout push."
}

Push-Location $projectRoot
try {
    Invoke-LocalCheck 'Formatage' 'node_modules/prettier/bin/prettier.cjs' @('--check', '**/*.{ts,tsx,mjs,md,json}')
} finally {
    Pop-Location
}

Push-Location $webRoot
try {
    Invoke-LocalCheck 'TypeScript' '../../node_modules/typescript/bin/tsc' @('--noEmit')
    Invoke-LocalCheck 'Tests locaux' 'node_modules/vitest/vitest.mjs' @('run')
    Invoke-LocalCheck 'Lint' 'node_modules/eslint/bin/eslint.js' @('.')
    if (-not $SkipBuild) {
        Invoke-LocalCheck 'Build de production' 'node_modules/next/dist/bin/next' @('build')
    }
} finally {
    Pop-Location
}

# C3-T5 : la simulation des modes de panne. Elle compile les vrais fichiers
# de sante et les exerce sur neuf scenarios. Un ecart entre l'etat annonce et
# l'etat calcule arrete la sequence : la page des pannes promet un
# comportement, et ce controle est la seule chose qui le prouve.
Write-Host "`nSimulation des modes de panne" -ForegroundColor Cyan
& node (Join-Path $projectRoot 'scripts/failure-drill.mjs')
if ($LASTEXITCODE -ne 0) {
    throw "La simulation des modes de panne a trouvé un écart. La page /systeme/pannes ne dit plus la vérité."
}

Write-Host "`nVérifications terminées. Aucun push effectué." -ForegroundColor Green

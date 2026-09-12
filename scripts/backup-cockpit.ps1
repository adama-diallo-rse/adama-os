<#
.SYNOPSIS
  Export logique des tables du cockpit Adama OS (L12-T2).

.DESCRIPTION
  Le projet Supabase est PARTAGE avec STRATA Scope : un export global
  melangerait deux perimetres et embarquerait des donnees produit qui n'ont
  rien a faire dans une sauvegarde du cockpit. Ce script n'exporte donc que
  les tables du cockpit, nommement, et separe les embeddings du reste : ils
  pesent l'essentiel du volume et se reconstruisent, au prix d'un appel
  d'embeddings, a partir du corpus.

  Deux fichiers en sortie, DONNEES SEULES :
    adama-os_<horodatage>.sql          donnees des tables du cockpit, hors vecteurs
    adama-os_rag_<horodatage>.sql      rag_documents + rag_chunks (vecteurs)

  La structure n'est pas dans l'export, et c'est voulu. Un export par
  --table n'emporte pas les types enum (adr_status...) : il ne se rejoue pas
  sur une base vide. La structure vit dans packages/db/migrations, qui se
  jouent d'abord ; l'export se rejoue ensuite sur des tables videes. C'est la
  sequence de docs/CONTINUITE.md, sections 5 et 7. Constate le 12 septembre
  2026 (EC5).

.PARAMETER ConnectionString
  URL Postgres. Par defaut, la variable d'environnement DATABASE_URL.
  Utiliser une connexion en mode session (port 5432), pas le pooler en mode
  transaction (6543) : pg_dump ne fonctionne pas en mode transaction.

.PARAMETER Destination
  Dossier de sortie. Par defaut .\backups (ignore par git).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/backup-cockpit.ps1
  powershell -ExecutionPolicy Bypass -File scripts/backup-cockpit.ps1 -Destination D:\sauvegardes\adama-os
#>
[CmdletBinding()]
param(
  [string]$ConnectionString = $env:DATABASE_URL,
  [string]$Destination = ""
)

$ErrorActionPreference = "Stop"

# Windows PowerShell 5.1 laisse $PSScriptRoot vide dans les valeurs par
# defaut des parametres : le dossier se resout donc ici, pas dans param().
if (-not $Destination) {
  $Destination = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\backups"
}

if (-not $ConnectionString) {
  throw "DATABASE_URL absente. Passer -ConnectionString, ou renseigner packages\db\.env puis exporter la variable."
}

if ($ConnectionString -match ":6543/") {
  Write-Warning "Connexion pooler detectee (port 6543). pg_dump exige la connexion directe, port 5432."
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump introuvable. Installer les outils client PostgreSQL 17 : le serveur est en 17, et un pg_dump plus ancien refuse de s'y connecter."
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$horodatage = Get-Date -Format "yyyyMMdd-HHmmss"

# Tables du cockpit, hors corpus vectoriel. Meme liste que TABLES_COCKPIT dans
# scripts/restore-drill.mjs : le test ignore une table absente sans echouer,
# donc un oubli ici produirait une restauration verte et incomplete.
$tables = @(
  "system_metrics",
  "decisions_log",
  "trajectory",
  "ecosystem_products",
  "ecosystem_analytics",
  "ecosystem_probes",
  "proof_claims",
  "proof_evidence",
  "leads"
)
$argsTables = $tables | ForEach-Object { "--table=public.$_" }

$sortieBase = Join-Path $Destination "adama-os_$horodatage.sql"
$sortieRag  = Join-Path $Destination "adama-os_rag_$horodatage.sql"

Write-Host "-> Export des tables du cockpit vers $sortieBase"
pg_dump $ConnectionString --data-only --no-owner --no-privileges @argsTables --file=$sortieBase
if ($LASTEXITCODE -ne 0) { throw "pg_dump a echoue sur les tables du cockpit (code $LASTEXITCODE)." }

Write-Host "-> Export du corpus vectoriel vers $sortieRag"
pg_dump $ConnectionString --data-only --no-owner --no-privileges `
  --table=public.rag_documents --table=public.rag_chunks --file=$sortieRag
if ($LASTEXITCODE -ne 0) { throw "pg_dump a echoue sur le corpus vectoriel (code $LASTEXITCODE)." }

$poids = [math]::Round(((Get-Item $sortieBase).Length + (Get-Item $sortieRag).Length) / 1MB, 2)
Write-Host "OK. Deux fichiers ecrits, $poids Mo au total."
Write-Host "Restauration : voir docs\CONTINUITE.md, section Restaurer."

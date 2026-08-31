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

  Deux fichiers en sortie :
    adama-os_<horodatage>.sql          structure + donnees, hors vecteurs
    adama-os_rag_<horodatage>.sql      rag_documents + rag_chunks (vecteurs)

.PARAMETER ConnectionString
  URL Postgres. Par defaut, la variable d'environnement DATABASE_URL.
  Utiliser la connexion DIRECTE (port 5432), pas le pooler : pg_dump ne
  fonctionne pas en mode transaction.

.PARAMETER Destination
  Dossier de sortie. Par defaut .\backups (ignore par git).

.EXAMPLE
  pwsh -File scripts/backup-cockpit.ps1
  pwsh -File scripts/backup-cockpit.ps1 -Destination D:\sauvegardes\adama-os
#>
[CmdletBinding()]
param(
  [string]$ConnectionString = $env:DATABASE_URL,
  [string]$Destination = (Join-Path $PSScriptRoot "..\backups")
)

$ErrorActionPreference = "Stop"

if (-not $ConnectionString) {
  throw "DATABASE_URL absente. Passer -ConnectionString, ou renseigner packages\db\.env puis exporter la variable."
}

if ($ConnectionString -match ":6543/") {
  Write-Warning "Connexion pooler detectee (port 6543). pg_dump exige la connexion directe, port 5432."
}

if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
  throw "pg_dump introuvable. Installer les outils client PostgreSQL 16 ou superieur."
}

New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$horodatage = Get-Date -Format "yyyyMMdd-HHmmss"

# Tables du cockpit, hors corpus vectoriel.
$tables = @(
  "system_metrics",
  "decisions_log",
  "trajectory",
  "ecosystem_analytics",
  "ecosystem_products",
  "leads"
)
$argsTables = $tables | ForEach-Object { "--table=public.$_" }

$sortieBase = Join-Path $Destination "adama-os_$horodatage.sql"
$sortieRag  = Join-Path $Destination "adama-os_rag_$horodatage.sql"

Write-Host "-> Export des tables du cockpit vers $sortieBase"
pg_dump $ConnectionString --no-owner --no-privileges @argsTables --file=$sortieBase

Write-Host "-> Export du corpus vectoriel vers $sortieRag"
pg_dump $ConnectionString --no-owner --no-privileges `
  --table=public.rag_documents --table=public.rag_chunks --file=$sortieRag

$poids = [math]::Round(((Get-Item $sortieBase).Length + (Get-Item $sortieRag).Length) / 1MB, 2)
Write-Host "OK. Deux fichiers ecrits, $poids Mo au total."
Write-Host "Restauration : voir docs\CONTINUITE.md, section Restaurer."

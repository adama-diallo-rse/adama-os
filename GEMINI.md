# Adama OS

Les règles communes de `~/.gemini/GEMINI.md` s'appliquent en premier (sécurité du poste, Git en lecture seule, rédaction). Ce fichier les complète pour ce projet.

## Ce qu'est ce projet

Cockpit personnel du fondateur d'IROKO SOFTWARE GROUP : statut système, journal de décisions, trajectoire, preuve d'exécution. Il lit les produits du groupe, il n'en héberge aucun. Plan dans `ROADMAP.md`, cartographie dans `docs/ECOSYSTEME-STRATA.md`, blueprint dans `ADAMA_OS_BLUEPRINT.md`.

## Stack

- Monorepo pnpm + Turborepo. `apps/web` : Next.js 16, Tailwind v4, TypeScript strict. Paquets partagés dans `packages/`.

## Commandes de vérification (à lancer depuis la racine du projet)

- `pnpm type-check ; pnpm lint ; pnpm test`
- Contrôles maison : `pnpm integrity ; pnpm audit:secrets`

## Périmètre

Tu ne travailles que dans ce dossier. Aucune écriture dans un autre projet de C:\Dev, même pour « harmoniser ».

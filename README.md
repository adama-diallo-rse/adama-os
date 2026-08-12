# Adama OS

Cockpit personnel du fondateur d'IROKO SOFTWARE GROUP. Dashboard build-in-public : statut système en direct, journal de décisions, trajectoire, preuve d'exécution, agent RAG réglementaire.

Ce repo n'héberge aucun produit du groupe. Il les lit et les affiche. Voir `ROADMAP.md` pour le plan d'exécution et `docs/ECOSYSTEME-STRATA.md` pour la cartographie des produits.

## Structure

```
adama-os/
├─ apps/
│  └─ web/            Next.js 16 + Tailwind v4 + TypeScript strict (Turbopack)
├─ packages/
│  ├─ ui/             Composants UI partagés (@adama/ui)
│  ├─ db/             Couche données Drizzle + Supabase (@adama/db)
│  └─ config/         eslint et tsconfig partagés (@adama/config)
├─ docs/
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

> `services/engine` (FastAPI sur Railway) a été supprimé le 13 juillet 2026. Il faisait doublon avec le moteur carbone de STRATA Scope et aucune route web ne l'appelait. Le calcul ESG lourd n'appartient pas à ce repo. Voir la couche L2 de `ROADMAP.md`.

## Stack

| Domaine | Choix |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Style | Tailwind v4, tokens OKLCH, shadcn/ui (new-york), Framer Motion |
| Données | Supabase (Postgres UE, Auth, Storage, pgvector), Drizzle ORM |
| Intelligence | OpenAI gpt-4o, text-embedding-3-small (1024 dim), Vercel AI SDK, unpdf |
| Observabilité | Sentry, PostHog (région UE), Better Stack |
| Déploiement | Vercel |

## Prérequis

- Node.js 20.9+ (idéalement 22, voir `.nvmrc`)
- pnpm 9+ (`corepack enable` puis `corepack prepare pnpm@9.15.4 --activate`)
- Un projet Supabase en région UE et une clé OpenAI (voir `.env.example` et `docs/SECRETS.md`)

## Commandes

```bash
pnpm install        # installe tout le monorepo
pnpm dev            # lance apps/web en dev (http://localhost:3000)
pnpm build          # build de prod
pnpm lint           # lint
pnpm type-check     # vérification TypeScript
pnpm format         # formatage Prettier
```

Côté base, depuis `packages/db` :

```bash
pnpm db:generate    # génère la migration Drizzle
pnpm db:migrate     # applique les migrations
pnpm db:seed        # seed de démo
pnpm rag:ingest     # ingestion du corpus RAG (ESRS, VSME, CV)
```

## Déploiement

Vercel, Root Directory = `apps/web`. Chaque PR génère un preview deploy, `main` déploie en production.

Domaine : à brancher (tâche L0-T6 de la roadmap). Tant que ce n'est pas fait, le dashboard tourne sur une URL `vercel.app`, ce qui n'est pas partageable à un recruteur.

## Documentation

- `ROADMAP.md` : plan d'exécution complet, 9 couches, 5 phases, un prompt expert par couche.
- `ADAMA_OS_BLUEPRINT.md` : blueprint d'origine du 24 juin 2026, conservé comme trace. Plusieurs choix de stack y sont périmés, un tableau en tête de fichier indique lesquels.
- `docs/ECOSYSTEME-STRATA.md` : cartographie des produits du groupe et de leurs liens avec ce dashboard.
- `docs/PHASE-0-SETUP.md` et `docs/PHASE-0-L1-DONNEES.md` : mise en place pas à pas.
- `docs/SECRETS.md` : gestion des variables d'environnement.

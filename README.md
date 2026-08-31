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

| Domaine       | Choix                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, Turbopack), React 19                                                                                                                                                                                |
| Style         | Tailwind v4, tokens hexadécimaux maison (navy `#0d1b2a`, signal teal `#2affd6`, or `#c9a96e`), composants maison `@adama/ui` sur clsx et tailwind-merge, Framer Motion, cmdk. Ni shadcn/ui, ni Radix, ni Tremor, ni lucide. |
| Données       | Supabase (Postgres UE, Auth, Storage, pgvector), Drizzle ORM                                                                                                                                                                |
| Intelligence  | OpenAI gpt-4o, text-embedding-3-small (1024 dim), Vercel AI SDK, unpdf                                                                                                                                                      |
| Observabilité | Sentry, PostHog (région UE), Better Stack                                                                                                                                                                                   |
| Tests         | Vitest, jsdom, Testing Library. Pas de CI : les tests se lancent en local.                                                                                                                                                  |
| Déploiement   | Vercel, région d'exécution cdg1 (Paris)                                                                                                                                                                                     |

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
pnpm test           # suite Vitest
pnpm format         # formatage Prettier
```

Côté base, depuis `packages/db` :

```bash
pnpm db:generate    # génère la migration Drizzle
pnpm db:migrate     # applique les migrations
pnpm db:seed        # seed de démo
pnpm rag:ingest     # ingestion du corpus RAG (ESRS, VSME, CV)
pnpm rag:verify     # garde-fou avant démonstration : 3 questions, sortie en erreur si une seule reste sans source
```

Les migrations SQL se passent dans l'éditeur SQL de Supabase, dans l'ordre :
`0000_init.sql`, `0001_ecosystem_products.sql`, `0002_ecosystem_analytics.sql`,
puis `seed_ecosystem_products.sql`.

## Déploiement

Vercel, Root Directory = `apps/web`. Chaque PR génère un preview deploy, `main` déploie en production.

Domaine : **adamesg-os.fr**. L'origine du site a une source unique,
`apps/web/lib/site.ts`, qui lit `NEXT_PUBLIC_SITE_URL`. Cette variable se pose
sur le seul environnement Production : inlinée au build, elle ferait sinon
annoncer l'origine de production par chaque preview deploy. Détail dans
`docs/SECRETS.md`.

Une tâche cron Vercel appelle `/api/ecosystem/sync` chaque jour à 06:00 UTC
pour relever la disponibilité des produits (couche L9). Elle est protégée par
`CRON_SECRET`.

## Documentation

- `ROADMAP.md` : état réel du dépôt, couche par couche, dérivé du code. La roadmap stratégique et les prompts par couche vivent dans Notion.
- `ADAMA_OS_BLUEPRINT.md` : blueprint d'origine du 24 juin 2026, conservé comme trace. Plusieurs choix de stack y sont périmés, un tableau en tête de fichier indique lesquels.
- `docs/ECOSYSTEME-STRATA.md` : cartographie des produits du groupe et de leurs liens avec ce dashboard.
- `docs/PHASE-0-SETUP.md` et `docs/PHASE-0-L1-DONNEES.md` : mise en place pas à pas.
- `docs/SECRETS.md` : inventaire des variables d'environnement, portées du jeton GitHub, calendrier de rotation.
- `docs/CONTINUITE.md` : sauvegarde, restauration, accès de secours, note de reprise (couche L12).
- `docs/MARQUAGE-MACHINE.md` : préparation à l'échéance du 2 décembre 2026 (couche L10).
- `corpus/README.md` : ce qu'il faut déposer pour alimenter adama.ai, et ce que coûte l'ingestion.

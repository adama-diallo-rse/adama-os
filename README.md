# Adama OS

Monorepo pnpm + Turborepo. Web sur Vercel, engine FastAPI sur Railway.

## Structure

```
adama-os/
├─ apps/
│  └─ web/            Next.js 16 + Tailwind v4 + TypeScript strict (Turbopack)
├─ packages/
│  ├─ ui/             Composants UI partagés (@adama/ui)
│  ├─ db/             Couche données (@adama/db)
│  └─ config/         tsconfig partagés (@adama/config)
├─ services/
│  └─ engine/         API FastAPI (déployée sur Railway)
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

## Prérequis

- Node.js 20.9+ (idéalement 22, voir `.nvmrc`)
- pnpm 9+ (`corepack enable` puis `corepack prepare pnpm@9.15.4 --activate`)
- Python 3.12 (pour `services/engine`)

## Commandes

```bash
pnpm install        # installe tout le monorepo
pnpm dev            # lance apps/web en dev (http://localhost:3000)
pnpm build          # build de prod
pnpm lint           # lint
pnpm type-check     # vérification TypeScript
```

## Déploiement

- **Web** : Vercel, Root Directory = `apps/web`. Chaque PR génère un preview deploy ; `main` déploie en prod.
- **Engine** : Railway, Root Directory = `services/engine`.

Voir `docs/PHASE-0-SETUP.md` pour la mise en place complète pas à pas.

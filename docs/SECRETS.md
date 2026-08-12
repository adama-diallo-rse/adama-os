# Secrets et variables d'environnement

> Mis a jour le 19 juillet 2026. `services/engine` a ete supprime le 13 juillet, la section Railway a ete retiree.

Regle unique : aucun secret dans git. Les `.env.example` documentent les cles
attendues (valeurs vides ou factices) ; les vraies valeurs vivent en local dans
des `.env` ignores, et en production dans le dashboard Vercel.

## Ou se trouve quoi

| Workspace     | Fichier local         | Production            |
| ------------- | --------------------- | --------------------- |
| `apps/web`    | `apps/web/.env.local` | Vercel (Variables)    |
| `packages/db` | `packages/db/.env`    | local / CI uniquement |

`.gitignore` ignore deja tous les `.env*` sauf les `.env.example`.

## Mise en place locale

```powershell
copy "apps\web\.env.example" "apps\web\.env.local"
copy "packages\db\.env.example" "packages\db\.env"
```

Puis renseigner les valeurs manquantes.

## Cles cote web (Vercel)

| Variable                        | Expose au navigateur | Role                                          |
| ------------------------------- | -------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | oui                  | origine canonique (metadonnees, sitemap, robots, JSON-LD) |
| `NEXT_PUBLIC_SUPABASE_URL`      | oui                  | URL du projet Supabase (region UE)            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui                  | cle publique (RLS)                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | non                  | cle serveur (contourne RLS)                   |
| `OPENAI_API_KEY`                | non                  | generation gpt-4o + embeddings de requete     |
| `ADAMA_AI_MODEL`                | non                  | modele adama.ai, optionnel (defaut gpt-4o)    |
| `DATABASE_URL`                  | non                  | retrieval RAG pgvector via Drizzle            |
| `GITHUB_REPOS`                  | non                  | L5-T2, depots agreges dans le feed Shipped    |
| `GITHUB_TOKEN`                  | non                  | feed Shipped, optionnel (60 req/h sans token) |
| `NEXT_PUBLIC_CAL_LINK`          | oui                  | Cal.com dans le modal recruteur               |
| `NEXT_PUBLIC_POSTHOG_KEY`       | oui                  | analytics, requis pour les funnels (L8-T7)    |
| `NEXT_PUBLIC_POSTHOG_HOST`      | oui                  | defaut `https://eu.i.posthog.com`             |
| `BETTERSTACK_API_TOKEN`         | non                  | statut systeme reel                           |
| `BETTERSTACK_MONITOR_ID`        | non                  | identifiant du monitor uptime                 |
| `NEXT_PUBLIC_SENTRY_DSN`        | oui                  | DSN Sentry (client + serveur)                 |
| `SENTRY_ORG` / `SENTRY_PROJECT` | non                  | upload source maps                            |
| `SENTRY_AUTH_TOKEN`             | non                  | upload source maps (build/CI uniquement)      |

Regle : tout ce qui est prefixe `NEXT_PUBLIC_` finit dans le bundle client.
Ne jamais prefixer une cle secrete avec `NEXT_PUBLIC_`.

## Le jeton GitHub du feed Shipped (L5-T2)

Les depots du groupe sont repartis sur **trois perimetres**, pas un. Un jeton
limite a l'organisation ne verra ni STRATA Scope ni le cockpit lui-meme.

| Perimetre | Depots concernes |
| --- | --- |
| `iroko-software-group` | esg-optimizer, strata-platform, strata-foundation, strata-watch, strata-esg-academy, iroko-platform |
| `adama-diallo-rse` (compte perso) | strata-scope, adama-os |
| `strata-esg` (ancienne organisation) | historique, a verifier |

Jeton **fine-grained, lecture seule**, permissions `Contents: Read-only` et
`Metadata: Read-only`. Un jeton fine-grained ne couvre qu'un proprietaire a la
fois : il en faut donc un par perimetre, ou un jeton classique a portee
`repo` si l'on accepte une portee plus large. Sans jeton, seuls les depots
publics remontent, ce qui suffit pour la vitrine.

## Cles cote base (`packages/db`)

| Variable       | Role                                                          |
| -------------- | ------------------------------------------------------------- |
| `DATABASE_URL` | connexion Supabase, Transaction pooler. Migrations et seed.    |
| `OPENAI_API_KEY` | embeddings a l'ingestion du corpus RAG (`pnpm rag:ingest`)   |

## Quand le domaine sera branche (L0-T6)

L'origine du site est deja centralisee dans `apps/web/lib/site.ts`, qui lit
`NEXT_PUBLIC_SITE_URL` et retombe sur le domaine Vercel si la variable est
absente. Brancher le domaine se limite donc a deux gestes :

1. poser `NEXT_PUBLIC_SITE_URL=https://mon-domaine.fr` dans Vercel (Production,
   Preview et Development) ;
2. redeployer, puis verifier `/robots.txt` et `/sitemap.xml`.

Aucune URL n'est ecrite en dur dans le code.

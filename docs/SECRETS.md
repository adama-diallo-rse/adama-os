# Secrets et variables d'environnement

Regle unique : aucun secret dans git. Les `.env.example` documentent les cles
attendues (valeurs vides ou factices) ; les vraies valeurs vivent en local dans
des `.env` ignores, et en production dans les dashboards Vercel / Railway.

## Ou se trouve quoi

| Workspace         | Fichier local          | Production            |
| ----------------- | ---------------------- | --------------------- |
| `apps/web`        | `apps/web/.env.local`  | Vercel (Variables)    |
| `packages/db`     | `packages/db/.env`     | local / CI uniquement |
| `services/engine` | `services/engine/.env` | Railway (Variables)   |

`.gitignore` ignore deja tous les `.env*` sauf les `.env.example`.

## Mise en place locale

```powershell
copy "apps\web\.env.example" "apps\web\.env.local"
copy "packages\db\.env.example" "packages\db\.env"
copy "services\engine\.env.example" "services\engine\.env"
```

Puis renseigner les valeurs manquantes (cles Supabase, OpenAI, Sentry, mot de
passe DB).

## Cles cote web (Vercel)

| Variable                        | Expose au navigateur | Role                          |
| ------------------------------- | -------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | oui                  | URL du projet Supabase        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui                  | cle publique (RLS)            |
| `SUPABASE_SERVICE_ROLE_KEY`     | non                  | cle serveur (contourne RLS)   |
| `OPENAI_API_KEY`                | non                  | generation adama.ai           |
| `NEXT_PUBLIC_SENTRY_DSN`        | oui                  | DSN Sentry (client + serveur) |
| `SENTRY_ORG` / `SENTRY_PROJECT` | non                  | upload source maps            |
| `SENTRY_AUTH_TOKEN`             | non                  | upload source maps (build)    |

Regle : tout ce qui est prefixe `NEXT_PUBLIC_` finit dans le bundle client.
Ne jamais prefixer une cle secrete avec `NEXT_PUBLIC_`.

## Cles cote engine (Railway)

| Variable       | Role                                |
| -------------- | ----------------------------------- |
| `PORT`         | injecte automatiquement par Railway |
| `ENVIRONMENT`  | `development` / `production`        |
| `DATABASE_URL` | connexion Supabase (a venir)        |
| `SENTRY_DSN`   | observabilite Python (a venir)      |

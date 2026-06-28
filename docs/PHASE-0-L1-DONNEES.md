# Phase 0, L1 Données, runbook d'exécution

Guide pas à pas pour brancher la couche Données. Tout le code est déjà écrit dans le repo. Il te reste 7 actions, dans cet ordre. Compte 20 à 30 minutes.

Fichiers livrés :

```
packages/db/
  drizzle.config.ts            config Drizzle Kit
  .env.example                 modèle de connection string
  migrations/0000_init.sql     schéma + pgvector + RLS + policies (L1-T3, L1-T4)
  src/schema.ts                8 tables typées (L1-T2)
  src/client.ts                client Drizzle (postgres-js)
  src/seed.ts                  seed de démo (L1-T6)
  src/index.ts                 exports du package

apps/web/
  middleware.ts                rafraîchit la session, protège /admin
  lib/supabase/client.ts       client navigateur
  lib/supabase/server.ts       client serveur
  lib/supabase/middleware.ts   logique de session
  app/login/page.tsx           page de connexion admin
  app/login/actions.ts         server actions login / logout
  app/admin/page.tsx           page admin protégée (L1-T5)
  .env.example                 variables Supabase ajoutées
```

---

## Étape 1, L1-T1 : projet Supabase (réutilisation de strata-scope)

On ne crée pas de nouveau projet (plan gratuit limité à 2). On réutilise **strata-scope** (`yccnnlasjcjuukithguk`), déjà en région **eu-west-1 (UE)**. Les 8 tables d'Adama OS cohabitent dans le schéma `public` sans collision avec les tables ESG existantes (`emission_factor`, `live_emission_value`, etc.).

Récupère 3 secrets dans le dashboard du projet strata-scope :

- **Project Settings, API Keys** : `anon public key` et `service_role key`.
- **Mot de passe DB** : si tu ne l'as plus, Project Settings, Database, Reset database password. Il sert à la connection string déjà pré-remplie dans `packages/db/.env.example`.

> Attention, ne touche pas aux tables ESG existantes. L'Advisor signale 14 issues (RLS désactivée sur les tables `emission_*`), c'est le périmètre ESG Optimizer, pas le tien. Ma migration n'active la RLS que sur mes 8 tables. Si tu veux, je t'aide à corriger la RLS de STRATA dans un second temps, séparément.

---

## Étape 2 : installer les dépendances

Depuis la racine du repo. Les nouvelles dépendances (`drizzle-orm`, `postgres`, `@supabase/ssr`, etc.) sont déjà déclarées, un simple install suffit.

```powershell
cd "C:\DEV\Adama OS"
pnpm install
```

---

## Étape 3 : renseigner les variables d'environnement

Deux fichiers à créer (jamais commités, déjà couverts par `.gitignore`).

**a) `packages/db/.env`** (sert au seed et à Drizzle Kit) :

```
DATABASE_URL=postgresql://postgres.<ref>:TON_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Colle l'URL "Transaction pooler" récupérée à l'étape 1, mot de passe inclus.

**b) `apps/web/.env.local`** (sert à l'app Next.js) :

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ENGINE_URL=http://localhost:8000
```

PowerShell pour créer les fichiers vides à éditer ensuite :

```powershell
ni "C:\DEV\Adama OS\packages\db\.env" -ItemType File -Force
ni "C:\DEV\Adama OS\apps\web\.env.local" -ItemType File -Force
```

---

## Étape 4, L1-T3 et L1-T4 : appliquer le schéma + la RLS

C'est l'étape qui crée pgvector, les 8 tables et toutes les policies. La méthode la plus fiable et la plus visible :

1. Ouvre `packages/db/migrations/0000_init.sql` dans ton éditeur, sélectionne tout, copie.
2. Dans Supabase, va dans **SQL Editor**, colle, clique **Run**.
3. Le script est idempotent : tu peux le relancer sans risque.

Vérifie dans **Table Editor** que les 8 tables existent, et dans **Database, Extensions** que `vector` est bien activée.

> Alternative en ligne de commande, si tu préfères : `pnpm --filter @adama/db exec drizzle-kit push`. Attention, cette commande crée les tables mais pas l'extension `vector` ni la RLS, qui sont propres au SQL. Le SQL Editor reste la voie recommandée pour cette première migration.

---

## Étape 5, L1-T6 : injecter les données de démo

```powershell
pnpm --filter @adama/db db:seed
```

Sortie attendue : `system_metrics : 8 clés à jour`, `decisions_log : 3 décisions insérées`, `trajectory : 4 entrées`, `strata_analytics : 3 métriques`. Le seed est rejouable (les métriques sont mises à jour, le reste n'est inséré que si la table est vide).

---

## Étape 6, L1-T5 : créer ton compte admin et tester l'auth

1. Dans Supabase, **Authentication, Users, Add user, Create new user**.
2. Mets ton email et un mot de passe, coche **Auto Confirm User** (sinon tu devras confirmer par email).
3. Lance l'app :

```powershell
pnpm dev
```

4. Ouvre http://localhost:3000/admin. Tu dois être redirigé vers `/login`.
5. Connecte-toi avec le compte créé. Tu arrives sur `/admin` et tu vois la liste des `system_metrics` lues via ta session. Si tu vois les clés, l'auth et la RLS fonctionnent de bout en bout.

---

## Étape 7 : vérifications finales

Type-check des deux packages touchés :

```powershell
pnpm --filter @adama/db type-check
pnpm --filter @adama/web type-check
```

Contrôle des données, dans le **SQL Editor** Supabase :

```sql
select key, coalesce(value_text, value_num::text) as val, unit from system_metrics order by key;
select title, category, is_published from decisions_log order by date desc;
select status, type, title from trajectory order by status;
select metric, value from strata_analytics;
```

Contrôle de la RLS (doit retourner 8 lignes, toutes en `rowsecurity = true`) :

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Si tout est vert : L1-T1 à L1-T6 sont done. Tu peux cocher ces cases dans `ROADMAP.md`.

---

## Évolutions futures du schéma

Pour cette première migration, le SQL appliqué dans le SQL Editor fait foi. Pour les changements suivants :

```powershell
# génère un nouveau fichier SQL de diff dans packages/db/migrations
pnpm --filter @adama/db db:generate
```

Relis le SQL généré, puis applique-le dans le SQL Editor (ou via `db:migrate` une fois la baseline en place). Garde le SQL comme source d'application : c'est lui qui gère pgvector et la RLS, que Drizzle ne régénère pas.

---

## Sécurité, rappel

- Ne commite jamais `.env` ni `.env.local`. Le `service_role` contourne la RLS, il ne doit vivre que côté serveur.
- En production (Vercel), mets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans les Environment Variables du projet.
- Le modèle RLS : lecture publique pour le dashboard (metrics, décisions publiées, trajectory, analytics), insertion publique pour les leads et les audits, tout le reste réservé à l'admin. Le RAG (`rag_documents`, `rag_chunks`) est privé.

```

```

# Secrets et variables d'environnement

> Mis a jour le 31 aout 2026. Ajout des variables des passerelles ecosysteme (L9), du garde-fou de debit d'adama.ai (L8-T12) et du secret de cron. Domaine propre : adamesg-os.fr.

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

| Variable                          | Expose au navigateur | Role                                                                                  |
| --------------------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | oui                  | origine canonique (metadonnees, sitemap, robots, JSON-LD)                             |
| `NEXT_PUBLIC_SUPABASE_URL`        | oui                  | URL du projet Supabase (region UE)                                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | oui                  | cle publique (RLS)                                                                    |
| `SUPABASE_SERVICE_ROLE_KEY`       | non                  | cle serveur (contourne RLS)                                                           |
| `OPENAI_API_KEY`                  | non                  | generation gpt-4o + embeddings de requete                                             |
| `ADAMA_AI_MODEL`                  | non                  | modele adama.ai, optionnel (defaut gpt-4o)                                            |
| `ADAMA_AI_RATE_LIMIT`             | non                  | L8-T12, requetes /api/chat par fenetre (defaut 12)                                    |
| `ADAMA_AI_RATE_WINDOW_S`          | non                  | L8-T12, duree de la fenetre en secondes (defaut 300)                                  |
| `DATABASE_URL`                    | non                  | retrieval RAG pgvector via Drizzle                                                    |
| `GITHUB_REPOS`                    | non                  | L5-T2, depots agreges dans le feed Shipped                                            |
| `GITHUB_TOKEN`                    | non                  | feed Shipped, optionnel (60 req/h sans token)                                         |
| `ECOSYSTEM_SCOPE_API_URL`         | non                  | L9, origine de l'API STRATA Scope, lecture seule                                      |
| `ECOSYSTEM_ESG_OPTIMIZER_API_URL` | non                  | L9, origine de l'API ESG Optimizer, lecture seule                                     |
| `CRON_SECRET`                     | non                  | L9, protege `/api/ecosystem/sync`. Pose par Vercel Cron dans l'en-tete Authorization  |
| `NEXT_PUBLIC_CAL_LINK`            | oui                  | Cal.com dans le modal recruteur                                                       |
| `NEXT_PUBLIC_POSTHOG_KEY`         | oui                  | analytics, requis pour les funnels (L8-T7)                                            |
| `NEXT_PUBLIC_POSTHOG_HOST`        | oui                  | defaut `https://eu.i.posthog.com`                                                     |
| `BETTERSTACK_API_TOKEN`           | non                  | statut systeme reel                                                                   |
| `BETTERSTACK_MONITOR_ID`          | non                  | identifiant du monitor uptime                                                         |
| `NEXT_PUBLIC_SENTRY_DSN`          | oui                  | DSN Sentry (client + serveur)                                                         |
| `SENTRY_ORG` / `SENTRY_PROJECT`   | non                  | upload source maps                                                                    |
| `SENTRY_AUTH_TOKEN`               | non                  | upload source maps (build/CI uniquement)                                              |
| `ADAMA_HIDE_DEMO`                 | non                  | C1, retire du rendu tout contenu de classe demonstration. Lue par `lib/proof/demo.ts` |

Regle : tout ce qui est prefixe `NEXT_PUBLIC_` finit dans le bundle client.
Ne jamais prefixer une cle secrete avec `NEXT_PUBLIC_`.

## Le jeton GitHub du feed Shipped (L5-T2)

Les depots du groupe sont repartis sur **trois perimetres**, pas un. Un jeton
limite a l'organisation ne verra ni STRATA Scope ni le cockpit lui-meme.

| Perimetre                            | Depots concernes                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `iroko-software-group`               | esg-optimizer, strata-platform, strata-foundation, strata-watch, strata-esg-academy, iroko-platform |
| `adama-diallo-rse` (compte perso)    | strata-scope, adama-os                                                                              |
| `strata-esg` (ancienne organisation) | historique, a verifier                                                                              |

Jeton **fine-grained, lecture seule**, permissions `Contents: Read-only` et
`Metadata: Read-only`. Un jeton fine-grained ne couvre qu'un proprietaire a la
fois : il en faut donc un par perimetre, ou un jeton classique a portee
`repo` si l'on accepte une portee plus large. Sans jeton, seuls les depots
publics remontent, ce qui suffit pour la vitrine.

## Cles cote base (`packages/db`)

| Variable         | Role                                                        |
| ---------------- | ----------------------------------------------------------- |
| `DATABASE_URL`   | connexion Supabase, Transaction pooler. Migrations et seed. |
| `OPENAI_API_KEY` | embeddings a l'ingestion du corpus RAG (`pnpm rag:ingest`)  |

## Domaine propre (L0-T6)

Le domaine est **adamesg-os.fr**, achete le 31 aout 2026. C'est un nom
personnel : il ne depend pas de l'arbitrage d'architecture de marque du groupe.

L'origine du site est centralisee dans `apps/web/lib/site.ts`, qui lit
`NEXT_PUBLIC_SITE_URL`, retombe sur `VERCEL_URL` en preview, puis sur le
domaine propre. Aucune URL n'est ecrite en dur ailleurs.

`NEXT_PUBLIC_SITE_URL` se pose sur le **seul environnement Production**. La
variable est inlinee au build : posee aussi en Preview, chaque preview deploy
annoncerait l'origine de production dans ses metadonnees, son sitemap et son
JSON-LD. Preview et Development restent vides, le repli `VERCEL_URL` s'en
charge. Changer la variable exige un redeploiement, un simple enregistrement
ne suffit pas.

## Rotation et acces de secours (L12)

| Secret                      | Ou il vit                             | Rotation                                           |
| --------------------------- | ------------------------------------- | -------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Production, `packages/db/.env` | a la demande, immediatement si un `.env` a circule |
| `OPENAI_API_KEY`            | Vercel, `packages/db/.env`            | tous les 6 mois, ou apres tout partage d'ecran     |
| `GITHUB_TOKEN`              | Vercel                                | expiration 90 jours, a recreer a echeance          |
| `CRON_SECRET`               | Vercel                                | tous les 12 mois                                   |
| `SENTRY_AUTH_TOKEN`         | Vercel (build)                        | tous les 12 mois                                   |
| `BETTERSTACK_API_TOKEN`     | Vercel                                | tous les 12 mois                                   |

Verification a faire une fois : qu'aucun `.env.local` reel ne se trouve dans un
dossier synchronise sur un service de stockage en ligne, historique de versions
compris. Procedure complete et note de reprise : `docs/CONTINUITE.md`.

## Balayage de l'historique git (C0-T4)

Commande, depuis la racine du depot :

```powershell
pnpm audit:secrets
```

`scripts/scan-secrets.mjs` parcourt tous les commits de toutes les branches et
l'arbre de travail, a la recherche de formes de cle : `sk-`, jeton JWT `eyJ`,
`ghp_`, `github_pat_`, mention `service_role`, et chaine de connexion Postgres
portant un mot de passe. Le script ne reproduit jamais la valeur trouvee, ni a
l'ecran ni dans un fichier : il donne le motif, le commit, le fichier et la
ligne. Un rapport d'audit qui recopie le secret le republie. Il sort en code 1
des qu'une correspondance apparait, ce qui le rend utilisable comme garde-fou.

Emplacements exclus, parce que la forme y est attendue et documentaire :
`docs/`, les `.env.example`, les migrations SQL, les tests, et le script
lui-meme.

### Resultat du balayage du 1er septembre 2026

161 fichiers suivis, 49 commits parcourus, toutes branches confondues.
**Aucune correspondance.** Aucune valeur ressemblant a une cle n'a jamais ete
commitee, ni dans l'arbre de travail ni dans l'historique.

Trois chaines de connexion Postgres existent bien dans le depot, toutes dans
des emplacements exclus du balayage parce que la forme y est attendue et
documentaire. Verification manuelle du 1er septembre 2026, mot de passe par
mot de passe :

| Commit       | Date       | Fichier                        | Nature                                                          |
| ------------ | ---------- | ------------------------------ | --------------------------------------------------------------- |
| `ca27176330` | 2026-06-27 | `docs/PHASE-0-L1-DONNEES.md`   | mot de passe fictif en majuscules, de la forme TON-MOT-DE-PASSE |
| `ca27176330` | 2026-06-27 | `packages/db/.env.example`     | marqueur `[YOUR-PASSWORD]`                                      |
| `a6c175a179` | 2026-06-28 | `services/engine/.env.example` | marqueur, dossier disparu du depot depuis                       |

Les occurrences du mot `service_role` dans le code et la documentation sont
des mentions en prose ou en commentaire SQL expliquant que cette cle vit cote
serveur. Le motif du script ne les releve volontairement pas : il cherche la
FORME d'une valeur, `"role":"service_role"` dans une charge utile de jeton ou
une affectation `service_role_key = ...`, pas la mention du mot. Un motif
large aurait noye le rapport, et un rapport noye est un rapport qu'on cesse
de lire.

Aucune rotation n'est declenchee par ce balayage. La procedure de rotation,
si une vraie fuite apparaissait un jour, est rappelee par le script lui-meme :
revoquer chez l'emetteur d'abord, emettre une cle neuve, relire les journaux
d'usage sur la periode d'exposition, et ne considerer une reecriture
d'historique qu'apres. Une cle revoquee dans un historique public est
inoffensive ; une cle valide retiree d'un historique reste dans tous les clones
deja faits.

## Rotation, passe du 2 septembre 2026 (couche C12-T7)

### Ce qui a ete verifie

`node scripts/scan-secrets.mjs` : aucune valeur ressemblant a une cle dans
l'arbre de travail ni dans l'historique. Le script exige un depot git, il ne
tourne donc pas dans un conteneur de recette : il se lance sur le poste.

Etat reel de `packages/db/.env`, verifie fichier en main :

| Variable         | Etat au 2 septembre 2026                           |
| ---------------- | -------------------------------------------------- |
| `DATABASE_URL`   | encore le marqueur `[YOUR-PASSWORD]`, inutilisable |
| `OPENAI_API_KEY` | **valeur reelle**, 164 caracteres                  |

Cette ligne corrige une note devenue fausse. La documentation du 31 aout 2026
affirmait que ce fichier n'etait qu'une copie de `.env.example` avec deux
valeurs factices. Ce n'est plus vrai depuis : la cle du fournisseur de modele
y est reelle. Le fichier reste hors du depot, `.gitignore` couvrant `.env` a
toute profondeur, et la verification par balayage confirme qu'il n'a jamais
ete versionne.

Consequence pratique : `rag:ingest` et `rag:verify` fonctionneront des que
`DATABASE_URL` portera le vrai mot de passe. C'est le seul blocage restant
pour fermer le controle de pertinence documentaire de `pnpm integrity`.

### Regle ajoutee, et elle est structurelle

Jusqu'ici, la garantie « ce module ne descend jamais dans le navigateur »
reposait sur une liste d'importateurs relue a la main dans
`docs/CONTINUITE.md`. Trois modules lisaient un secret sans declarer
`server-only` : `lib/supabase/service.ts`, `lib/github.ts` et
`lib/uptime.ts`. Aucun n'etait importe par un composant client, donc aucun ne
fuyait ; mais rien n'empechait qu'il le soit un jour.

Les trois le declarent desormais, et `apps/web/tests/frontieres.test.ts`
verifie que **tout** module lisant un secret le declare. `server-only` leve a
l'import depuis un composant client : une importation fautive casse la
construction, au lieu de faire fuiter une cle en production.

Cinq noms sont surveilles par ce test : `GITHUB_TOKEN`,
`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `CRON_SECRET`,
`BETTERSTACK_API_TOKEN`. Ajouter un secret sans l'ajouter a cette liste est
possible ; c'est pourquoi la liste vit dans le test, ou elle se relit, et non
dans un commentaire.

### Calendrier de rotation

Aucune rotation n'est declenchee par cette passe : aucune fuite n'a ete
constatee. La cadence reste celle du haut de ce document, et la procedure ne
change pas : revoquer chez l'emetteur d'abord, emettre une cle neuve, relire
les journaux d'usage sur la periode d'exposition, et ne considerer une
reecriture d'historique qu'apres.

Un geste s'ajoute au moment de poser `GITHUB_TOKEN` : le jeton doit etre en
lecture seule sur les contenus. Un jeton classique de portee `repo` couvrirait
les huit depots au lieu de sept, mais il donnerait l'ecriture. Ce compromis
est refuse, et la limite est affichee publiquement au registre des limites
connues plutot que contournee.

# Continuité et reprise, périmètre adama-os

> Écrit le 31 août 2026 (couche L12). Ne traite QUE le cockpit. La base de
> production des produits relève du hub Chantiers techniques, ne rien
> dupliquer ici.

## 1. Correction d'un fait tenu pour acquis

La roadmap affirmait que le cockpit porte sa propre base Supabase. C'est faux :
`packages/db/.env.example` pointe le projet **strata-scope**, région UE
(Irlande). Le cockpit et STRATA Scope partagent donc le même projet, avec des
tables distinctes.

Trois conséquences, toutes structurantes :

1. la sauvegarde automatique du projet couvre déjà les tables du cockpit, il
   n'y a pas de trou béant à combler, mais il n'y a pas non plus de sauvegarde
   propre au cockpit qu'on pourrait restaurer sans toucher à Scope ;
2. une restauration complète du projet au niveau Supabase écraserait les
   données de Scope. Une restauration du cockpit doit donc être **sélective**,
   table par table, jamais globale ;
3. l'export logique de ce dossier ne prend nommément que les tables du
   cockpit. C'est la seule granularité sûre.

## 2. Ce qui est sauvegardé, et ce que coûte sa perte

| Données                       | Volume                | Coût de reconstitution                                                                                                    |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `decisions_log`, `trajectory` | faible                | élevé : écrit à la main, aucune autre source                                                                              |
| `leads`                       | faible                | total : un lead recruteur perdu est perdu                                                                                 |
| `ecosystem_products`          | 8 lignes              | faible : `packages/db/migrations/seed_ecosystem_products.sql`                                                             |
| `ecosystem_analytics`         | croissant             | moyen : la série historique ne se rejoue pas                                                                              |
| `system_metrics`              | 9 lignes              | nul : réécrites par le seed                                                                                               |
| `rag_documents`, `rag_chunks` | l'essentiel du volume | monétaire : une réingestion complète du corpus, soit quelques dizaines de centimes d'embeddings et une dizaine de minutes |

Objectif de point de reprise retenu : **24 heures** pour les tables écrites à
la main, **aucune contrainte** pour le corpus vectoriel, qui se reconstruit.

## 3. Ce que fournit déjà l'hébergeur

À vérifier dans le tableau de bord Supabase, projet strata-scope, section
Database puis Backups, avant de construire quoi que ce soit :

- plan gratuit : aucune sauvegarde automatique garantie ;
- plan Pro : sauvegardes quotidiennes conservées sept jours, restauration au
  niveau du projet entier.

Dans les deux cas, la restauration proposée est globale. C'est précisément ce
que le point 1.2 interdit. L'export logique ci-dessous n'est donc pas une
redondance de ce que l'hébergeur fournit, c'est le seul moyen de restaurer le
cockpit sans toucher à Scope.

## 4. Sauvegarder

```powershell
# Depuis la racine du dépôt, avec les outils client PostgreSQL 17 (le serveur
# est en 17, un pg_dump plus ancien refuse de s'y connecter).
# Pooler en mode SESSION, port 5432. Le port 6543 de packages/db/.env est le
# mode transaction, que pg_dump ne supporte pas.
$env:DATABASE_URL = "postgresql://postgres.<ref>:<mdp>@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
powershell -ExecutionPolicy Bypass -File scripts/backup-cockpit.ps1
Remove-Item Env:DATABASE_URL
```

Deux fichiers atterrissent dans `backups/`, ignoré par git. Ils ne contiennent
que des **données** : la structure vit dans `packages/db/migrations`. Un export
par table n'emporte pas les types enum et ne se rejouerait pas sur une base
vide (constaté le 12 septembre 2026). Cadence retenue :
**hebdomadaire**, le vendredi, plus une exécution avant toute migration.

Conservation : quatre exports glissants, plus un export mensuel gardé un an.
Les fichiers ne quittent pas un support chiffré ; ils contiennent des adresses
e-mail de leads.

## 5. Restaurer

```powershell
# 1. Vérifier ce que contient l'export : neuf lignes COPY attendues.
Select-String -Path backups\adama-os_<horodatage>.sql -Pattern "^COPY public\." | Select-Object Line

# 2. Vérifier la cible AVANT toute écriture. Toujours une variable dédiée,
#    jamais DATABASE_URL, qui pointe la base partagée avec deux produits.
psql $env:DATABASE_URL_CIBLE -tAc "select inet_server_addr(), current_database()"

# 3. Sur une base dont les migrations 0000 à 0006 sont jouées, vider les
#    tables du cockpit, puis rejouer les données.
psql $env:DATABASE_URL_CIBLE -c "truncate table system_metrics, decisions_log, trajectory, ecosystem_products, ecosystem_analytics, ecosystem_probes, proof_claims, proof_evidence, leads cascade;"
psql $env:DATABASE_URL_CIBLE -v ON_ERROR_STOP=1 -f backups\adama-os_<horodatage>.sql
```

**Ne jamais rejouer un export directement en production sans avoir lu son
en-tête et vérifié la cible à l'étape 2.** Un `truncate` lancé sur la mauvaise
variable efface des données écrites à la main.

### Test de restauration

| Date       | Opérateur               | Portée                                                                                     | Résultat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-31 | Adama                   | Répétition en schéma isolé, sans `pg_dump` ni `psql`                                       | Réussi. `decisions_log` capturée, cible de structure identique vidée puis rejouée : 3 lignes de part et d'autre, empreinte md5 identique `733d5e487e24e60e1bc6bc9b8c154a63`. Schéma `restore_rehearsal` supprimé après contrôle. La production n'a pas été touchée.                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-09-02 | Adama                   | Chaîne complète, 9 tables du cockpit, base de recette                                      | Réussi. `node scripts/restore-drill.mjs` : export `pg_dump --data-only` table par table, rejeu dans un schéma isolé de structure identique, puis comparaison du nombre de lignes ET d'une empreinte du contenu insensible à l'ordre. 9 tables sur 9 restaurées à l'identique. Rapport machine : `docs/restauration.json`.                                                                                                                                                                                                                                                                                                                                             |
| 2026-09-12 | Claude Code, pour Adama | Chaîne complète sur le poste, avec `backup-cockpit.ps1`, contre une copie de la production | Réussi (EC5). Export de production par `backup-cockpit.ps1` sous Windows PowerShell 5.1, `pg_dump` 17.6, pooler en mode session : 9 tables du cockpit. Base de recette Docker `pgvector/pgvector:pg17` isolée, migrations 0000 à 0006 jouées, puis données rejouées : 11 tables sur 11 aux mêmes comptes que la production, corpus compris (3 documents, 1 291 fragments). Puis `node scripts/restore-drill.mjs` : 8 tables sur 9 restaurées à empreinte identique, `leads` non exercée faute de ligne. Trois défauts corrigés pendant le test : trois tables absentes du script, `$PSScriptRoot` vide sous PowerShell 5.1, export non rejouable faute de types enum. |

La première ligne établissait la sémantique de restauration sans outillage
réel. La deuxième, du 2 septembre 2026, l'établit **avec** `pg_dump` et
`psql`, sur les neuf tables du cockpit, et elle est rejouable par une
commande. La troisième, du 12 septembre 2026, prouve que le fichier produit
par `scripts/backup-cockpit.ps1` sur le poste d'Adama, sous Windows, se rejoue
sur une base reconstruite par les migrations, avec les mêmes comptes que la
production.

Une sauvegarde non testée n'est pas une sauvegarde.

### Rejouer le test

```powershell
# Contre une base de RECETTE, jamais la production. Le script refuse une URL
# qui ressemble a un hote de production, et il ne lit jamais DATABASE_URL.
$env:DATABASE_URL_TEST = "postgresql://postgres@localhost:5433/postgres"
node scripts/restore-drill.mjs --operateur "Adama"
```

Trois garde-fous, dans cet ordre : refus d'une URL de production, restauration
**sélective** limitée aux neuf tables du cockpit, et écriture du résultat dans
`docs/restauration.json`, que la matrice de santé et `pnpm integrity` lisent.
Un test réussi mais non enregistré ne prouve rien à un lecteur.

## 6. Accès de secours

À vérifier une fois, et à noter ailleurs que dans ce dépôt :

- projet Supabase : au moins deux moyens d'accès (connexion principale plus
  méthode de récupération active) ;
- projet Vercel : idem ;
- registrar du domaine adamesg-os.fr : double authentification active et
  adresse de récupération à jour ;
- la clé `service_role` n'est utilisée que côté serveur. Cette garantie ne
  repose plus sur une liste d'importateurs relue à la main : depuis le
  2 septembre 2026, `lib/supabase/service.ts`, `lib/github.ts` et
  `lib/uptime.ts` déclarent `server-only`, qui **lève à l'import** depuis un
  composant client. Une importation fautive casse la construction au lieu de
  faire fuiter une clé en production, et `apps/web/tests/frontieres.test.ts`
  vérifie que tout module lisant un secret porte cette déclaration.

## 7. Note de reprise, tout est perdu sauf le dépôt

Séquence exacte, une heure environ :

1. créer un projet Supabase en région UE, récupérer l'URL et les clés ;
2. exécuter dans l'éditeur SQL, dans cet ordre :
   `0000_init.sql`, `0001_ecosystem_products.sql`,
   `0002_ecosystem_analytics.sql`, `0003_data_class.sql`, `0004_proof.sql`,
   `0005_adr.sql`, `0006_revirements.sql`, puis `seed_ecosystem_products.sql`.
   La sequence complete compte huit fichiers : s'arreter a `0002` reconstruirait
   une base sans les classes de donnee, sans le registre de preuve, sans les
   decisions, et surtout sans le correctif de privilege de `0003` qui a laisse
   le nom des depots prives lisible pendant vingt jours (voir `docs/RLS.md`) ;
3. renseigner `packages/db/.env`, puis `pnpm --filter @adama/db db:seed` ;
4. réingérer le corpus depuis `corpus/`, document par document
   (`pnpm --filter @adama/db rag:ingest -- ...`), puis vérifier avec
   `pnpm --filter @adama/db rag:verify` ;
5. recréer le projet Vercel depuis le dépôt GitHub, poser les variables
   listées dans `docs/SECRETS.md`, `NEXT_PUBLIC_SITE_URL` en Production seule ;
6. rebrancher le domaine adamesg-os.fr, vérifier `/robots.txt` et
   `/sitemap.xml` ;
7. restaurer `decisions_log`, `trajectory` et `leads` depuis le dernier export
   logique. Ce sont les seules données que le dépôt ne sait pas recréer.

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
# Depuis la racine du dépôt, avec les outils client PostgreSQL installés.
# Connexion DIRECTE (port 5432), pas le pooler.
$env:DATABASE_URL = "postgresql://postgres.<ref>:<mdp>@aws-0-eu-west-1.compute.amazonaws.com:5432/postgres"
pwsh -File scripts/backup-cockpit.ps1
```

Deux fichiers atterrissent dans `backups/`, ignoré par git. Cadence retenue :
**hebdomadaire**, le vendredi, plus une exécution avant toute migration.

Conservation : quatre exports glissants, plus un export mensuel gardé un an.
Les fichiers ne quittent pas un support chiffré ; ils contiennent des adresses
e-mail de leads.

## 5. Restaurer

```powershell
# 1. Vérifier ce que contient l'export avant de le rejouer.
Select-String -Path backups\adama-os_<horodatage>.sql -Pattern "^COPY public\." | Select-Object -First 20

# 2. Restaurer une table précise, après l'avoir vidée.
psql $env:DATABASE_URL -c "truncate table public.decisions_log;"
psql $env:DATABASE_URL -f backups\adama-os_<horodatage>.sql
```

`pg_dump` sans `--data-only` recrée la table : si elle existe déjà, purger la
table cible d'abord, ou passer par une base de recette. **Ne jamais rejouer un
export directement en production sans avoir lu son en-tête.**

### Test de restauration

| Date       | Opérateur | Portée                                                | Résultat                                                                                                                                                                                                              |
| ---------- | --------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-31 | Adama     | Répétition en schéma isolé, sans `pg_dump` ni `psql`  | Réussi. `decisions_log` capturée, cible de structure identique vidée puis rejouée : 3 lignes de part et d'autre, empreinte md5 identique `733d5e487e24e60e1bc6bc9b8c154a63`. Schéma `restore_rehearsal` supprimé après contrôle. La production n'a pas été touchée. |
| _à faire_  | Adama     | Chaîne complète `backup-cockpit.ps1` puis `psql`      | _avant le 30 septembre 2026, connexion directe port 5432_                                                                                                                                                              |

La première ligne établit que la sémantique de restauration tient sur ce projet :
vider une cible puis rejouer un export rend exactement le contenu d'origine, au
bit près. Elle n'établit pas que `pg_dump` et `psql` tournent sur le poste, ni
que le fichier produit par `scripts/backup-cockpit.ps1` se rejoue tel quel.
C'est l'objet de la seconde ligne, et elle seule ferme le sujet.

Une sauvegarde non testée n'est pas une sauvegarde.

## 6. Accès de secours

À vérifier une fois, et à noter ailleurs que dans ce dépôt :

- projet Supabase : au moins deux moyens d'accès (connexion principale plus
  méthode de récupération active) ;
- projet Vercel : idem ;
- registrar du domaine adamesg-os.fr : double authentification active et
  adresse de récupération à jour ;
- la clé `service_role` n'est utilisée que côté serveur. Vérification :
  `apps/web/lib/supabase/service.ts` n'est importé que par `lib/repos.ts` et
  `lib/ecosystem/index.ts`, deux modules serveur.

## 7. Note de reprise, tout est perdu sauf le dépôt

Séquence exacte, une heure environ :

1. créer un projet Supabase en région UE, récupérer l'URL et les clés ;
2. exécuter dans l'éditeur SQL, dans cet ordre :
   `0000_init.sql`, `0001_ecosystem_products.sql`, `0002_ecosystem_analytics.sql`,
   puis `seed_ecosystem_products.sql` ;
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

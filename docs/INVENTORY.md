# Inventaire d'Adama OS

Fichier produit par `pnpm inventory`. Ne pas le modifier a la main : toute
correction se fait dans le code ou dans `scripts/inventory.mjs`, puis on
regenere. `pnpm inventory --check` sort en code 1 si le depot a bouge sans
que l'inventaire ait ete regenere et committe.

Aucune date n'est ecrite ici : la date de reference d'un inventaire est
celle de son commit. Un horodatage rendrait le diff illisible et ferait
echouer `--check` a chaque seconde.

## Surface

| Mesure | Valeur |
| --- | --- |
| Routes de page | 40 |
| Routes d'API | 11 |
| Composants | 54 |
| Modules `lib` | 54 |
| Tables Drizzle | 11 |
| Types enumeres | 14 |
| Migrations SQL | 8 |
| Fichiers de test | 54 |
| Cas de test | 525 |
| Dependances directes declarees | 51 |

## Routes

| Page | Fichier | Lignes |
| --- | --- | --- |
| `/admin/demandes` | `apps/web/app/admin/demandes/page.tsx` | 176 |
| `/admin/lettre` | `apps/web/app/admin/lettre/page.tsx` | 299 |
| `/admin` | `apps/web/app/admin/page.tsx` | 94 |
| `/admin/relecture` | `apps/web/app/admin/relecture/page.tsx` | 227 |
| `/articles/architecture-donnee-esg-afrique-ouest` | `apps/web/app/articles/architecture-donnee-esg-afrique-ouest/page.tsx` | 53 |
| `/articles/methode-de-preuve` | `apps/web/app/articles/methode-de-preuve/page.tsx` | 53 |
| `/articles` | `apps/web/app/articles/page.tsx` | 94 |
| `/articles/sept-contraintes-donnee-esg-afrique-ouest` | `apps/web/app/articles/sept-contraintes-donnee-esg-afrique-ouest/page.tsx` | 53 |
| `/changelog` | `apps/web/app/changelog/page.tsx` | 81 |
| `/checkin` | `apps/web/app/checkin/page.tsx` | 326 |
| `/confiance` | `apps/web/app/confiance/page.tsx` | 300 |
| `/confidentialite` | `apps/web/app/confidentialite/page.tsx` | 219 |
| `/decisions/[adr]` | `apps/web/app/decisions/[adr]/page.tsx` | 305 |
| `/decisions` | `apps/web/app/decisions/page.tsx` | 148 |
| `/diagnostic` | `apps/web/app/diagnostic/page.tsx` | 211 |
| `/ecosysteme` | `apps/web/app/ecosysteme/page.tsx` | 178 |
| `/en/articles/proof-method` | `apps/web/app/en/articles/proof-method/page.tsx` | 53 |
| `/en/articles/seven-constraints-west-african-esg-data` | `apps/web/app/en/articles/seven-constraints-west-african-esg-data/page.tsx` | 53 |
| `/en/articles/west-african-esg-data-architecture` | `apps/web/app/en/articles/west-african-esg-data-architecture/page.tsx` | 53 |
| `/erreurs` | `apps/web/app/erreurs/page.tsx` | 215 |
| `/expansion` | `apps/web/app/expansion/page.tsx` | 207 |
| `/journal` | `apps/web/app/journal/page.tsx` | 123 |
| `/lettre` | `apps/web/app/lettre/page.tsx` | 259 |
| `/login` | `apps/web/app/login/page.tsx` | 84 |
| `/mentions-legales` | `apps/web/app/mentions-legales/page.tsx` | 118 |
| `/methode` | `apps/web/app/methode/page.tsx` | 113 |
| `/metrics` | `apps/web/app/metrics/page.tsx` | 253 |
| `/mot-de-passe` | `apps/web/app/mot-de-passe/page.tsx` | 38 |
| `/` | `apps/web/app/page.tsx` | 225 |
| `/preuves` | `apps/web/app/preuves/page.tsx` | 142 |
| `/principes` | `apps/web/app/principes/page.tsx` | 146 |
| `/projets/[slug]` | `apps/web/app/projets/[slug]/page.tsx` | 163 |
| `/recruteur` | `apps/web/app/recruteur/page.tsx` | 324 |
| `/revirements` | `apps/web/app/revirements/page.tsx` | 178 |
| `/revue-architecture` | `apps/web/app/revue-architecture/page.tsx` | 164 |
| `/systeme` | `apps/web/app/systeme/page.tsx` | 148 |
| `/systeme/pannes` | `apps/web/app/systeme/pannes/page.tsx` | 148 |
| `/technique` | `apps/web/app/technique/page.tsx` | 535 |
| `/travaillez-avec-moi` | `apps/web/app/travaillez-avec-moi/page.tsx` | 308 |
| `/verifier/[id]` | `apps/web/app/verifier/[id]/page.tsx` | 316 |

| API | Fichier | Lignes |
| --- | --- | --- |
| `/.well-known/adama-os.json` | `apps/web/app/.well-known/adama-os.json/route.ts` | 58 |
| `/api/chat` | `apps/web/app/api/chat/route.ts` | 199 |
| `/api/decisions` | `apps/web/app/api/decisions/route.ts` | 35 |
| `/api/ecosystem` | `apps/web/app/api/ecosystem/route.ts` | 36 |
| `/api/ecosystem/sync` | `apps/web/app/api/ecosystem/sync/route.ts` | 70 |
| `/api/lettre` | `apps/web/app/api/lettre/route.ts` | 138 |
| `/api/lettre/sync` | `apps/web/app/api/lettre/sync/route.ts` | 66 |
| `/api/metrics` | `apps/web/app/api/metrics/route.ts` | 34 |
| `/api/trajectory` | `apps/web/app/api/trajectory/route.ts` | 62 |
| `/auth/callback` | `apps/web/app/auth/callback/route.ts` | 76 |
| `/llms.txt` | `apps/web/app/llms.txt/route.ts` | 105 |

## Base de donnees

Tables : `decisions_log`, `ecosystem_analytics`, `ecosystem_probes`, `ecosystem_products`, `leads`, `proof_claims`, `proof_evidence`, `rag_chunks`, `rag_documents`, `system_metrics`, `trajectory`

Types enumeres : `adr_impact`, `adr_reversibility`, `adr_scope`, `adr_status`, `data_class`, `ecosystem_status`, `lead_source`, `probe_failure_kind`, `proof_evidence_kind`, `proof_subject_type`, `proof_verifiable_by`, `proof_visibility`, `trajectory_status`, `trajectory_type`

Migrations :

- `packages/db/migrations/0000_init.sql`
- `packages/db/migrations/0001_ecosystem_products.sql`
- `packages/db/migrations/0002_ecosystem_analytics.sql`
- `packages/db/migrations/0003_data_class.sql`
- `packages/db/migrations/0004_proof.sql`
- `packages/db/migrations/0005_adr.sql`
- `packages/db/migrations/0006_revirements.sql`
- `packages/db/migrations/seed_ecosystem_products.sql`

## Composants et modules

Les dix plus gros fichiers, toutes categories confondues :

| Fichier | Lignes |
| --- | --- |
| `apps/web/components/dashboard.tsx` | 615 |
| `apps/web/components/terminal.tsx` | 563 |
| `apps/web/components/vsme-simulator.tsx` | 550 |
| `apps/web/lib/health/criteria.ts` | 459 |
| `apps/web/components/ecosystem-map.tsx` | 443 |
| `apps/web/lib/vocabulaire.ts` | 425 |
| `apps/web/components/layer-d.tsx` | 395 |
| `apps/web/lib/lettre/messages.ts` | 390 |
| `apps/web/lib/lettre/registre.ts` | 381 |
| `apps/web/components/build-log.tsx` | 362 |

## Variables d'environnement lues dans le code

`ADAMA_AI_MODEL`, `ADAMA_AI_RATE_LIMIT`, `ADAMA_AI_RATE_WINDOW_S`, `ADAMA_HIDE_DEMO`, `BETTERSTACK_API_TOKEN`, `BETTERSTACK_MONITOR_ID`, `CI`, `CRON_SECRET`, `DATABASE_URL`, `ECOSYSTEM_ESG_OPTIMIZER_API_URL`, `ECOSYSTEM_SCOPE_API_URL`, `GITHUB_REPOS`, `GITHUB_TOKEN`, `GITHUB_TOKEN_ADAMA_DIALLO_RSE`, `GITHUB_TOKEN_IROKO_SOFTWARE_GROUP`, `GITHUB_TOKEN_STRATA_ESG`, `NEXT_PUBLIC_CAL_LINK`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_VERCEL_URL`, `NEXT_RUNTIME`, `NODE_ENV`, `OPENAI_API_KEY`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SUPABASE_SERVICE_ROLE_KEY`, `VERCEL_URL`

## Evenements analytiques emis

`adr_opened`, `build_log_raw`, `ecosystem_outbound`, `proof_pack_download`, `proof_verify_opened`, `recruiter_cal_opened`, `recruiter_cv_download`, `recruiter_intent`, `recruiter_modal_opened`, `recruiter_view_print`, `strata_outbound`, `technique_opened`

## Liens sortants

Hotes distincts appeles ou lies depuis le code :

`${vercel_host}`, `adamesg-os.fr`, `api.github.com`, `api.openai.com`, `api.resend.com`, `cal.com`, `esg-optimizer.fr`, `eu.i.posthog.com`, `github.com`, `schema.org`, `scope.esg-optimizer.fr`, `uptime.betterstack.com`, `www.strata-esg.fr`

### URL absolues du site ecrites en dur

Regle : l'origine du site vit dans `apps/web/lib/site.ts` et nulle part
ailleurs. Les origines d'API tierces ne sont pas concernees, elles n'ont
pas d'autre endroit ou vivre.

Aucune. Le controle passe.

## Marqueurs TODO et FIXME

Aucun.

## Tirets longs

Doctrine du projet : aucun tiret long ni demi-cadratin, dans le code
comme dans les textes produits. Mesure sur l'application, hors outillage
et hors tests.

- apps/web/lib/vocabulaire.ts : motif: /[–—]/g,

## Noms historiques

| Nom | Fichiers | Ou |
| --- | --- | --- |
| `strata_analytics` | 0 | aucune |
| `services/engine` | 1 | `packages/db/src/adr-catalogue.ts` |
| `adama-os-web.vercel.app` | 0 | aucune |
| `FALLBACK` | 2 | `apps/web/lib/repos.ts`, `apps/web/lib/site.ts` |

## Code mort

Detection par lecture du systeme de fichiers, sans analyseur tiers. Une
entree se ferme de deux facons : on retire le code, ou on la declare dans
`docs/inventory-allow.json` avec sa raison. Une entree sans justification
est un defaut ouvert.

| Nature | Entree | Justification declaree |
| --- | --- | --- |
| export | `apps/web/app/api/chat/route.ts#questionDeRecherche` | Regle de construction de la question envoyee a la recherche documentaire, dans la route qui l'emploie. Exportee pour etre verifiee directement : c'est une regle de comportement, pas un detail d'implementation, et la tester a travers une requete HTTP complete demanderait une base et une cle d'API. Voir tests/adama-moteur.test.ts. |
| export | `apps/web/components/build-log.tsx#JournalFiltres` | Forme des filtres du journal, produite par lireFiltres et consommee par BuildLog dans le meme fichier. Exportee parce que la page /journal la transporte entre les deux : c'est le contrat de l'etat porte par l'URL. |
| export | `apps/web/components/health-matrix.tsx#HealthMark` | Le marqueur d'etat de sante, seul endroit qui decide de son rendu. Exporte au meme titre que DataClassMark pour C1 : le jour ou un etat de sante s'affiche ailleurs, il doit venir d'ici et non d'une seconde composition. |
| export | `apps/web/components/types.ts#TrajectoryType` | Type du champ `type` de la table trajectory. Utilise dans ce meme fichier par TrajectoryRow, exporte pour rester citable par un composant a venir. Le retirer forcerait a reecrire l'union en clair a chaque usage. |
| export | `apps/web/content/cv.ts#AffirmationCv` | Forme d'une affirmation verifiable du CV. Contrat du contenu editorial, utilise par AFFIRMATIONS_CV dans ce meme fichier et par tests/cv.test.ts. |
| export | `apps/web/content/divisions.ts#LIBELLE_DIVISION` | Table des libelles editoriaux de division, lue par libelleDivision dans ce meme fichier. Exportee parce que c'est le contenu relu : une division renommee se corrige ici, et un test ou une page qui voudrait verifier la table doit pouvoir la citer sans passer par la fonction. |
| export | `apps/web/content/frontieres.ts#Flux` | Forme d'un flux de donnees entrant, sortant ou interdit. Contrat du contenu de la page /confiance. |
| export | `apps/web/content/frontieres.ts#Interdit` | Forme d'une regle de la liste « ce qui n'entre jamais », avec le test qui la verrouille ou son absence declaree. Contrat du contenu. |
| export | `apps/web/content/frontieres.ts#SensFlux` | Union des trois sens d'un flux. Utilisee par Flux dans ce meme fichier et par la mise en page du tableau. |
| export | `apps/web/content/pannes.ts#ModePanne` | Forme d'un mode de panne. Contrat du contenu de /systeme/pannes, relu par scripts/failure-drill.mjs qui refuse de tourner si un identifiant de simulation n'a pas de scenario. |
| export | `apps/web/content/projets/gabarit.ts#BlocRole` | Forme du bloc 02 d'une fiche projet, le plus important du gabarit. Utilise par FicheProjet dans ce meme fichier, exporte pour qu'un composant ou un test puisse typer ce bloc sans reecrire sa forme. Contrat public du gabarit. |
| export | `apps/web/lib/adr.ts#AdrPreuveKind` | Union des natures de trace d'une decision. Utilisee par AdrPreuve et par la table PREUVE_KIND_LABEL du meme fichier. Contrat public du module, au meme titre que EvidenceKind pour lib/proof/claims.ts. |
| export | `apps/web/lib/adr.ts#AdrReversibilite` | Union des trois niveaux de reversibilite. Miroir du type Postgres adr_reversibility, utilisee par AdrRow et par les deux tables de libelles du meme fichier. Contrat public du module. |
| export | `apps/web/lib/adr.ts#AdrRow` | Forme brute d'une ligne du journal d'architecture, telle que la cle anonyme la lit. Le type Adr, servi aux pages, l'etend. Exporte comme contrat de lecture : un appelant qui interrogerait decisions_log autrement doit pouvoir typer sa reponse de la meme facon. |
| export | `apps/web/lib/ai/retrieval.ts#RetrievalOptions` | Type des options publiques de la recherche vectorielle. Documente la signature au point d'appel, meme quand les appelants se contentent des valeurs par defaut. |
| export | `apps/web/lib/analytics-events.ts#EvenementConnu` | Union des noms d'evenements reellement emis. Contrat public du module, derive de EVENEMENTS. |
| export | `apps/web/lib/analytics.ts#CONSENT_KEY` | Nom de la cle de stockage du consentement. Exporte pour qu'un test ou un futur outil de purge n'ait jamais a la recopier en clair. |
| export | `apps/web/lib/analytics.ts#ConsentValue` | Union des deux valeurs de consentement. Contrat public du module, utilise dans ses propres signatures. |
| export | `apps/web/lib/chantiers.ts#MetriquesJournal` | Forme des trois mesures d'execution honnetes. Le test verifie la liste EXACTE de ses cles : l'ajout d'un indicateur de livraison non mesure fait echouer la suite, ce qui est exactement le garde-fou voulu. |
| export | `apps/web/lib/ecosystem/client.ts#GetJsonOptions` | Type des options du client des passerelles L9. Contrat public du module. |
| export | `apps/web/lib/ecosystem/client.ts#GetJsonResult` | Type de retour du client des passerelles L9. Contrat public du module. |
| export | `apps/web/lib/ecosystem/index.ts#PersistOutcome` | Compte rendu d'historisation renvoye par persistImportedMetrics, serialise tel quel par /api/ecosystem/sync. Contrat de la reponse. |
| export | `apps/web/lib/ecosystem/map.ts#MapEdge` | Forme d'une arete du graphe. Contrat du modele de carte, verifie par tests/ecosystem-map.test.tsx qui s'assure qu'aucune arete ne part du cockpit. |
| export | `apps/web/lib/ecosystem/map.ts#MapInput` | Forme des entrees du constructeur de carte. Contrat public du module, ecrit pour que la page nomme ce qu'elle fournit. |
| export | `apps/web/lib/ecosystem/map.ts#NodeKind` | Union des trois types de noeud. Utilisee par MapNode dans ce meme fichier, contrat du modele. |
| export | `apps/web/lib/github.ts#RepoFeedStatus` | Etat de lecture d'un depot, avec sa raison en francais courant. Contrat du journal et de la matrice de sante : c'est ce type qui rend impossible l'omission silencieuse d'un depot. |
| export | `apps/web/lib/health/collect.ts#FRAICHEUR_RESTAURATION_JOURS` | Age au dela duquel un test de restauration ne dit plus rien du present. Exporte pour etre cite dans un test plutot que recopie, comme la fraicheur d'integrite. |
| export | `apps/web/lib/health/collect.ts#observer` | La collecte seule, sans la deduction d'etat. Exportee comme couture : fetchHealthMatrix l'enchaine avec les regles, et un appelant qui voudrait observer sans conclure passe par la. |
| export | `apps/web/lib/health/criteria.ts#ageEnJours` | Calcul d'age en jours, employe par deux capacites de ce fichier. Exporte comme contrat : la fraicheur du corpus et celle de la restauration doivent se calculer de la meme facon. |
| export | `apps/web/lib/integrity.ts#IntegrityControl` | Forme d'un controle d'integrite tel que le rapport le porte. Contrat de lecture de docs/integrity.json. |
| export | `apps/web/lib/legal.ts#SousTraitant` | Forme d'un sous-traitant. Contrat de la source unique lue par /confidentialite et par /confiance : une seconde liste aurait diverge. |
| export | `apps/web/lib/og.tsx#tronquer` | Regle de debordement des images de partage, appliquee aux trois zones du gabarit dans ce meme fichier. Exportee comme contrat : c'est un ARBITRAGE, troncature au mot plutot que reduction de corps, et il doit rester citable et testable sans monter une image entiere. |
| export | `apps/web/lib/outbound.ts#OutboundContext` | Contexte d'un lien sortant, contrat du module de tracage. |
| export | `apps/web/lib/proof/claims.ts#EvidenceKind` | Union des natures de preuve. Miroir du type Postgres proof_evidence_kind, utilisee dans EvidenceRow et dans EVIDENCE_KIND_LABEL. Contrat public du module. |
| export | `apps/web/lib/proof/claims.ts#ProofSubjectType` | Union des natures de sujet d'une affirmation. Miroir du type Postgres proof_subject_type, utilisee dans ClaimRow et dans la table SUBJECT_LABEL du meme fichier. Contrat public du module. |
| export | `apps/web/lib/proof/claims.ts#ProofVisibility` | Union des visibilites d'une affirmation. Passee en option a listClaims par les appelants, sous forme litterale. Contrat public du module. |
| export | `apps/web/lib/proof/claims.ts#VerifiableBy` | Union des personnes pouvant refaire une verification. Miroir du type Postgres, utilisee dans EvidenceRow et dans VERIFIABLE_LABEL. Contrat public du module. |
| export | `apps/web/lib/proof/metrics.ts#DEFAULT_MAX_AGE_SECONDS` | Duree de validite par defaut d'un releve de passerelle, deux jours. Exportee pour etre citable par un test ou une migration a venir plutot que recopiee en clair : c'est une regle du projet, pas un detail d'implementation. |
| export | `apps/web/lib/proof/refresh.ts#RefreshOutcome` | Compte rendu de reevaluation renvoye par refreshEvidence, serialise tel quel dans la reponse de /api/ecosystem/sync. Contrat de la reponse, au meme titre que PersistOutcome. |
| export | `apps/web/lib/proof/types.ts#ProbeFailureKind` | Union des natures d'echec de sonde. Miroir du type Postgres probe_failure_kind, utilisee par Claim et par la table FAILURE_LABEL du meme fichier. Contrat public du module. |
| export | `apps/web/lib/proof/well-known.ts#WellKnownClaim` | Forme d'une affirmation dans le document machine. Partie du meme contrat que WellKnownDocument. |
| export | `apps/web/lib/proof/well-known.ts#WellKnownDocument` | Forme du document machine servi a /.well-known/adama-os.json. Type de retour de buildWellKnown, et contrat propose a un tiers qui consommerait le document. |
| export | `apps/web/lib/proof/well-known.ts#WellKnownEvidence` | Forme d'une preuve dans le document machine. Partie du meme contrat que WellKnownDocument. |
| export | `apps/web/lib/rate-limit.ts#RateLimiter` | Contrat du garde-fou de debit de /api/chat. |
| export | `apps/web/lib/rate-limit.ts#RateLimitVerdict` | Verdict rendu par le garde-fou de debit, contrat du module. |
| export | `apps/web/lib/repos.ts#TrackedRepos` | Liste des depots suivis AVEC la source qui l'a fournie. Contrat du resolveur : c'est ce champ qui a ferme le mode degrade muet du journal. |
| export | `apps/web/lib/terminal/inspect.ts#ContexteInspection` | Forme des donnees dont les commandes d'inspection ont besoin. Contrat du module pur, ecrit pour que le composant nomme ce qu'il fournit. |
| export | `apps/web/lib/terminal/inspect.ts#LigneTerminal` | Forme d'une ligne de sortie du terminal. Contrat du module pur. |
| export | `apps/web/lib/terminal/inspect.ts#SortieCommande` | Ce qu'une commande produit : des lignes, une destination, ou les deux. Contrat du module pur, et c'est lui qui garantit qu'une commande ne touche ni au DOM ni au routeur. |
| export | `apps/web/lib/terminal/inspect.ts#sujetsPreuve` | Sujets proposes a la commande proof, derives du registre. Exportee pour etre verifiable sans monter le terminal entier. |
| export | `apps/web/lib/uptime.ts#UptimeStatus` | Union des etats Better Stack, contrat du module. |
| dependency | `apps/web/package.json#@types/node` | Types Node consommes implicitement par TypeScript via `types` du tsconfig. Jamais importes par un fichier source, indispensables au typecheck. |
| dependency | `apps/web/package.json#@types/react` | Types React resolus implicitement par TypeScript. Meme raison. |
| dependency | `apps/web/package.json#@types/react-dom` | Types React DOM resolus implicitement par TypeScript. Meme raison. |
| export | `packages/db/src/adr-catalogue.ts#AdrPreuveKind` | Meme union que celle de apps/web/lib/adr.ts, cote catalogue. Le catalogue est la source de verite du contenu ADR : ses types forment son contrat, ils ne sont pas du code appele. |
| export | `packages/db/src/adr-catalogue.ts#AdrReversibilite` | Voir AdrPreuveKind du meme fichier. |
| export | `packages/db/src/client.ts#closeDb` | Fermeture explicite de la connexion, appelee par ingest.ts et verify-rag.ts a travers un import dynamique que la detection ne suit pas. Sans elle, process.exit laisse une poignee ouverte et le code de sortie ment sous Windows. |
| export | `packages/db/src/index.ts#DB_PACKAGE` | Marqueur d'identite du paquet, lu a l'oeil dans un journal ou une session Node pour verifier quel paquet est charge. |
| export | `packages/db/src/schema.ts#adrImpact` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#adrReversibility` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#adrScope` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#adrStatus` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#dataClass` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#Decision` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#EcosystemAnalytic` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#EcosystemProbe` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#ecosystemProbes` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#EcosystemProduct` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#ecosystemStatus` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#Lead` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#leads` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#leadSource` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewDecision` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewEcosystemAnalytic` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewEcosystemProbe` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewEcosystemProduct` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewLead` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewProofClaim` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewProofEvidence` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewRagChunk` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewRagDocument` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewSystemMetric` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#NewTrajectoryItem` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#probeFailureKind` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofClaimsRelations` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#ProofEvidence` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofEvidenceKind` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofEvidenceRelations` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofSubjectType` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofVerifiableBy` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#proofVisibility` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#RagChunk` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#ragChunksRelations` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#RagDocument` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#ragDocumentsRelations` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#SystemMetric` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#TrajectoryItem` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#trajectoryStatus` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| export | `packages/db/src/schema.ts#trajectoryType` | Surface publique du paquet @adama/db, reexportee par src/index.ts. Le schema Drizzle declare tables, types enumeres et types inferes de lecture et d'insertion : ils forment le contrat du paquet, pas du code appele. Retirer un type parce que le cockpit ne l'importe pas encore reviendrait a rendre la base moins typee que le SQL qu'elle decrit. |
| dependency | `packages/ui/package.json#@types/react` | Types React du paquet de composants, resolus implicitement par TypeScript. |
| export | `packages/ui/src/index.ts#UI_PACKAGE` | Meme role que DB_PACKAGE pour @adama/ui. |

Zero entree sans justification. Le controle passe.

## Avertissements ESLint

`eslint .` dans `apps/web` : 0 erreur, 4 avertissements.
La regle `react-hooks/set-state-in-effect` est passee d'erreur a
avertissement dans `apps/web/eslint.config.mjs`, avec sa raison. Chacun est
traite ci-dessous, aucun ne reste anonyme.

| Emplacement | Regle | Traitement |
| --- | --- | --- |
| `components/consent-banner.tsx` | `react-hooks/set-state-in-effect` | Maintenu. `setVisible(true)` depend de `localStorage`, illisible au rendu serveur. Le bandeau ne peut pas etre decide avant hydratation sans afficher un bandeau a quelqu'un qui a deja repondu. |
| `components/layer-a.tsx` | `react-hooks/set-state-in-effect` | Maintenu. Premiere valeur du compte a rebours, posee juste avant le `setInterval` qui la met a jour chaque seconde. Attendre le premier tick afficherait un vide d'une seconde au chargement. |
| `components/recruit-modal.tsx` | `react-hooks/set-state-in-effect` | Maintenu. Remise a zero de l'etape Cal.com a la fermeture de la modale. La fermeture peut venir de la touche Echap, d'un clic exterieur ou du parent : centraliser la remise a zero dans l'effet est la seule facon de ne pas en oublier un chemin. |
| `components/terminal.tsx` | `react-hooks/set-state-in-effect` | Maintenu. `setLogs([])` vide l'historique du terminal a la fermeture, meme raison que ci-dessus : trois chemins de fermeture, un seul point de remise a zero. |

## Budget de complexite

Plafonds declares dans `docs/budget.json`, expliques dans `docs/BUDGET.md`.
Severite actuelle : `error` (avertissement en vague V0, erreur a partir de V2).

| Niveau | Plafond | Mesure | Max | Etat |
| --- | --- | --- | --- | --- |
| N1 | Titres dans l'accroche de la home | 1 | 1 | tenu |
| N1 | Lignes de texte dans l'accroche de la home | 3 | 3 | tenu |
| N1 | Actions proposees dans l'accroche de la home | 3 | 3 | tenu |
| N1 | Cartes de competence sous l'accroche | 3 | 3 | tenu |
| N2 | Fiches projet mises en avant sur la home | 3 | 3 | tenu |
| N2 | Preuves sociales affichees d'un bloc dans la Couche D | 1 | 4 | tenu |
| N2 | Experiences citees dans le bandeau de la home | 4 | 4 | tenu |
| N2 | Marques d'organisation affichees sur le site | 4 | 5 | tenu |
| surface | Routes de page | 40 | 40 | tenu |
| surface | Routes d'API | 11 | 11 | tenu |
| surface | Composants | 54 | 54 | tenu |
| surface | Modules lib | 54 | 54 | tenu |
| surface | Lignes du plus gros composant | 615 | 700 | tenu |
| surface | Lignes du plus gros module lib | 459 | 460 | tenu |

Aucun depassement.

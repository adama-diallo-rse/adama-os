# ROADMAP COMPLÈTE, ADAMA OS

> Compagnon de `ADAMA_OS_BLUEPRINT.md`. Ici, le plan d'exécution complet, couche par couche.
> Rédigée le 24 juin 2026. Mises à jour : 13 juillet 2026 (recentrage atelier), **19 juillet 2026 (recentrage groupe)**.
> Deadline stage AG2R LA MONDIALE (Grenoble, Chargé de missions RSE, Data ESG & Solutions IA, du 1er mai au 31 octobre 2026). Push recrutement : novembre 2026, cible CDI / CDD en Île-de-France.
> **État au 19 juillet : P0 et P1 livrées. P2 livrée à 85 pour cent, en avance sur sa fenêtre (4 au 31 août). Trois restes visibles : le domaine (L0-T6), l'ingestion du corpus RAG (L3-T1), les funnels PostHog (L8-T7).**

---

## Les deux recentrages qui gouvernent ce document

**Recentrage du 13 juillet 2026, Adama OS est un ATELIER, pas un hébergeur de produits.**
Les modules audit, veille et formations ne sont pas développés ici. Ce sont des produits qui vivent dans leurs propres repos. Adama OS s'y connecte par des liens tracés. Les couches L5 (contenu) et L6 (conversion) sont réduites à ce qui relève vraiment du dashboard : preuve d'exécution et sortie recrutement.

**Recentrage du 19 juillet 2026, le périmètre n'est plus STRATA mais IROKO SOFTWARE GROUP.**
La holding s'est structurée en quatre divisions (voir `iroko-platform/docs/IROKO-ORG-MAP.md`). Adama OS n'est plus la vitrine d'une suite ESG européenne, c'est le **cockpit du fondateur d'un groupe logiciel à deux continents**. Conséquences concrètes sur cette roadmap :

- le hub `/strata` devient un **hub écosystème** qui couvre les quatre divisions ;
- la Couche D (preuve sociale) doit exposer IROKO au même titre que STRATA ;
- `strata_analytics` devient `ecosystem_analytics`, alimentée par plusieurs produits et non plus un seul ;
- le récit recruteur change de calibre : ce n'est plus « j'ai construit un outil ESG », c'est « je dirige la construction d'un groupe logiciel, voici le tableau de bord en direct ».

C'est un changement de narration, pas un changement de stack. Aucune couche technique n'est jetée.

---

## L'écosystème que ce dashboard reflète

```
IROKO SOFTWARE GROUP (holding, org GitHub iroko-software-group)
│
├── STRATA (Europe), Operating System de la Sustainability
│   ├── ESG Optimizer      prod, esg-optimizer.fr, refonte Sustainability OS en cours (Couche 12 atteinte)
│   ├── STRATA Scope       prod, paywall Stripe et API publique versionnée livrés
│   ├── STRATA Foundation  déployé (Vercel + Railway), Vague 1 en cours
│   ├── STRATA Watch       développement avancé (Phase 6, mode équipe)
│   ├── STRATA Academy     architecture et syllabus posés, premier commit
│   └── STRATA Platform    site corporate prêt, auth phase 2
│
├── IROKO (Afrique), Operating System des entreprises africaines
│   └── Business OS        monorepo iroko-platform, socle en construction
│
├── INFRASTRUCTURE          @iroko/payments (Iroko Pay), @iroko/core, @iroko/ui
│
└── SERVICES                Externalisation B2B, Compliance Africa
```

**Adama OS (`adama-diallo-rse/adama-os`) reste hors organisation, sous compte personnel.** C'est voulu : c'est le cockpit du fondateur, pas un actif du groupe. Il lit les produits, il n'en héberge aucun.

---

## Comment lire cette roadmap

Deux axes se croisent.

- **9 couches techniques (L0 à L8)** : les strates du système, du plus bas niveau (infra) au plus haut (média). C'est le QUOI.
- **5 phases temporelles (P0 à P4)** : le calendrier. C'est le QUAND.

Chaque phase fait avancer plusieurs couches en parallèle. La Partie 1 décrit les couches dans l'absolu. La Partie 2 découpe le travail phase par phase, avec des cases à cocher. La Partie 3 est la matrice de synthèse. La Partie 7 donne un prompt expert prêt à coller par couche.

Suivre en horizontal (finir une phase) plutôt qu'en vertical (finir une couche) : ça rend l'OS utilisable plus tôt.

Convention : `[ ]` à faire, `[~]` en cours, `[x]` fait. Les identifiants type `L1-T3` veulent dire couche 1, tâche 3.

---

# PARTIE 1 : LES 9 COUCHES DU SYSTÈME (vue verticale)

### L0, Infrastructure & DevOps

**Objectif** : un squelette déployé en continu, chaque push en ligne en moins de 2 minutes.
**Stack** : Monorepo pnpm + Turborepo, GitHub, Vercel (web), domaine + DNS.
**Contient** : repo, CI/CD, environnements (dev/prod), secrets, domaine, branches.
**État réel** : le monorepo tourne, Vercel déploie sur `main` avec preview deploys sur les PR. `services/engine` a été supprimé le 13 juillet (doublon du moteur carbone de STRATA Scope, plus appelé par le web). **Seul manque : le domaine.**

### L1, Données (le système nerveux)

**Objectif** : une source de vérité unique et sécurisée.
**Stack** : Supabase (Postgres UE + Auth + Realtime + Storage + pgvector), Drizzle ORM.
**Contient** : `system_metrics`, `decisions_log`, `trajectory`, `ecosystem_analytics` (ex `strata_analytics`), `leads` (recruteur), `rag_documents`, `rag_chunks`, RLS, migrations.
**État réel** : schéma migré, pgvector actif, RLS active, auth Supabase branchée, seed de démo en place, endpoints de lecture et route `/checkin` livrés.
**Reste à faire (recentrage groupe)** : élargir la table analytics pour porter plusieurs produits et deux divisions, et ajouter un registre `ecosystem_products` qui pilote le hub sans redéploiement.

### L2, Moteur de calcul

**Objectif** : aucun. Cette couche est volontairement vide.
**Décision du 13 juillet, confirmée le 19** : le calcul ESG lourd est le cœur de STRATA Scope (moteur pur, facteurs ADEME Base Empreinte, 15 catégories GHG Protocol) et d'ESG Optimizer. Le dupliquer dans Adama OS était une erreur d'architecture. `services/engine` est supprimé, cette couche reste fermée. Si un jour le dashboard a besoin d'un chiffre carbone, il appelle l'API publique versionnée de STRATA Scope, il ne recalcule rien.

### L3, Intelligence conversationnelle (RAG + adama.ai)

**Objectif** : un agent qui répond sur les textes de loi sans halluciner.
**Stack** : OpenAI (gpt-4o en génération, text-embedding-3-small 1024 dim), extraction PDF locale (unpdf), pgvector, Vercel AI SDK.
**Contient** : pipeline ingestion (extraction, chunking, embeddings), retrieval top-k, génération citée, chat streaming.
**État réel** : toute la chaîne est codée et branchée. Index hnsw en place, retrieval filtré par langue et source, génération citée avec refus hors contexte, route `api/chat` en streaming, composant `adama.ai` flottant, commande `ask adama` dans le terminal.
**Reste à faire** : ingérer le corpus. Le script existe, la base est vide. C'est le seul geste qui sépare un agent démontrable d'un agent muet.

### L4, Interface & Design System

**Objectif** : le ressenti terminal de vaisseau spatial, dark mode, accents émeraude.
**Stack** : Next.js 16, Tailwind v4, shadcn/ui (new-york), Framer Motion, Tremor, cmdk, Geist Mono.
**Contient** : design tokens OKLCH, layout dashboard, couches A/B/C/D, terminal Ctrl+K, widgets, modal recruteur.
**État réel** : complet. Les 4 couches, le terminal, les animations, le responsive, le simulateur VSME et la page Open Metrics sont livrés.
**Reste à faire (recentrage groupe)** : la Couche D montre encore un écosystème STRATA. Elle doit passer à une vue groupe, quatre divisions, avec l'état réel de chaque produit.

### L5, Contenu (preuve d'exécution)

**Objectif** : montrer la construction en public, sans dupliquer les produits.
**Stack** : API GitHub (feed Shipped), Open Metrics (Supabase).
**Contient** : feed « Shipped » branché sur les vrais commits, page Open Metrics, hub écosystème.
**État réel** : le feed Shipped tourne sur l'API GitHub, la page Open Metrics est publique.
**Point d'attention** : le feed ne lit qu'`adama-os`. Or l'essentiel du travail se fait dans `esg-optimizer`, `strata-scope`, `strata-watch`, `iroko-platform`. Le feed sous-représente massivement l'exécution réelle. C'est le plus gros gain de crédibilité disponible à faible coût.

### L6, Conversion (les sorties du dashboard)

**Objectif** : 2 sorties actives et mesurées, propres au dashboard fondateur.
**Stack** : Cal.com, PostHog.
**Contient** : modal « Recruter l'Architecte » (sortie recrutement), liens sortants tracés vers les produits.
**État réel** : modal, capture de lead, mode lecture recruteur, hub `/strata` et événements `strata_outbound` livrés.
**Reste à faire** : renommer et élargir le hub au groupe, définir les funnels dans PostHog.
La monétisation n'est pas ici. Elle est portée par les produits : Stripe sur STRATA Scope (paywall livré) et sur ESG Optimizer, Stripe Tax sur strata-platform.

### L7, Acquisition & Média

**Objectif** : remplir le tunnel via TikTok et YouTube (GreenDiadam).
**Stack** : OG images dynamiques (Satori), liens UTM, scripts et hooks, calendrier de contenu.
**Contient** : templates de partage, CTA branchés sur les sorties, cadence de publication.
**État réel** : rien de commencé. C'est normal, c'est du P4.

### L8, Qualité, Sécurité, SEO, Observabilité

**Objectif** : du solide, conforme RGPD, visible sur Google et les moteurs IA.
**Stack** : TypeScript strict, ESLint/Prettier, Sentry, Better Stack, next-sitemap, JSON-LD, next-intl.
**État réel** : lint et TypeScript strict en place, Sentry branché, PostHog UE avec bandeau de consentement, Better Stack pour un statut système réel, métadonnées et JSON-LD `Person`, sitemap et robots.
**Reste à faire** : funnels PostHog, bilingue, audits (a11y, perf, sécurité), SEO complet.

---

# PARTIE 2 : LES 5 PHASES (vue horizontale, le calendrier)

---

## PHASE 0, FONDATIONS, LIVRÉE

**Fenêtre** : 24 juin au 6 juillet. **Objectif** : un squelette en ligne, prêt à recevoir des features.

**L0, Infra**

- [x] L0-T1 Créer le repo GitHub privé `adama-os`.
- [x] L0-T2 Scaffolder le monorepo Turborepo (`apps/web`, `packages/ui`, `packages/db`, `packages/config`).
- [x] L0-T3 Créer `apps/web` avec Next.js 16 + Tailwind v4 + TypeScript strict + Turbopack.
- [x] L0-T4 Initialiser shadcn/ui (style new-york, base color zinc).
- [x] L0-T5 Connecter le repo à Vercel, activer les preview deploys.
- [ ] **L0-T6 Acheter le domaine, pointer les DNS vers Vercel, activer le HTTPS. SEUL RESTE DE P0, ET BLOQUANT POUR TOUT LE RESTE.**
- [x] ~~L0-T7 Créer le service Railway pour `services/engine`.~~ Annulé le 13 juillet, service supprimé.

**L1, Données**

- [x] L1-T1 Créer le projet Supabase en région UE (réutilisation de strata-scope, eu-west-1).
- [x] L1-T2 Définir le schéma Drizzle.
- [x] L1-T3 Première migration, activer pgvector.
- [x] L1-T4 Activer la RLS sur toutes les tables, policies de base.
- [x] L1-T5 Brancher l'auth Supabase (login admin).
- [x] L1-T6 Seed de données de démo.

**L4, Design System**

- [x] L4-T1 Design tokens (noir carbone, blanc, émeraude) en OKLCH dans `@theme`.
- [x] L4-T2 Police Geist Sans + Geist Mono.
- [x] L4-T3 Layout global dark mode, grille du dashboard.
- [x] L4-T4 Composants de base (Card, Badge, Button) au style terminal.

**L8, Qualité**

- [x] L8-T1 ESLint + Prettier + config TypeScript strict partagée.
- [x] L8-T2 `.env.example` complet, secrets dans Vercel, jamais commités.
- [x] L8-T3 Sentry branché sur web.

**Definition of Done P0** : le domaine affiche une page dashboard stylée, l'auth marche, la base est migrée, chaque push déploie. **Statut : 6 tâches sur 7, il manque le domaine.**

---

## PHASE 1, VITRINE RECRUTEMENT, LIVRÉE EN AVANCE

**Fenêtre** : 7 juillet au 3 août. **Objectif** : un dashboard qui impressionne un recruteur.

**L1, Données**

- [x] L1-T7 Endpoints de lecture pour `system_metrics`, `decisions_log`, `trajectory`.
- [x] L1-T8 Route privée `/checkin` pour mettre à jour les métriques en 1 clic (poids réel inclus).

**L4, Interface (les 4 couches)**

- [x] L4-T5 **Couche A, System Status** : statut, focus courant, compte à rebours vers le 31 octobre, barre lean bulk vers 80 kg, protocole minimaliste.
- [x] L4-T6 **Couche B, Decisions Log** : timeline ADR filtrable par catégorie.
- [x] L4-T7 **Couche C, Trajectory** : Now / Next / Later, avec risques et parades.
- [x] L4-T8 **Couche D, Sandbox** : preuve sociale (AG2R LA MONDIALE, Younivibe, AFEV, Ministère des Finances), métriques produit.
- [x] L4-T9 **Terminal Ctrl+K** (cmdk) : `download cv`, `ping strata`, `book call`, `navigate`, `theme`.
- [x] L4-T10 Animations Framer Motion.
- [x] L4-T11 Responsive complet.

**L5, Contenu**

- [x] L5-T1 Feed « Shipped » branché sur l'API GitHub.

**L6, Conversion (sortie 1)**

- [x] L6-T1 Bouton persistant `[ Recruter l'Architecte ]`.
- [x] L6-T2 Modal : proposition de valeur hybride (CDI / CDD dès novembre 2026), lien CV, Cal.com embarqué.
- [x] L6-T3 Capture du lead dans `leads`, événement PostHog `recruiter_intent`.
- [x] L6-T4 Mode lecture recruteur (`?for=recruiter`), layout simplifié et imprimable.

**L8, Qualité/SEO**

- [x] L8-T4 PostHog (région UE) + bandeau de consentement.
- [x] L8-T5 Métadonnées + OG statique, JSON-LD `Person`.
- [x] L8-T6 Better Stack (uptime) pour un System Status réel.

**Definition of Done P1** : un recruteur voit le statut live, les décisions, la roadmap, les commits réels, et réserve un RDV en 2 clics. **Statut : atteinte, sous réserve du domaine.**

---

## PHASE 2, INTELLIGENCE, EN COURS ET EN AVANCE

**Fenêtre** : 4 août au 31 août. **Objectif** : l'OS devient vivant et démontre le niveau technique.

**L0, Infra**

- [x] L0-T8 Trancher le sort de `services/engine`. **Tranché le 13 juillet : supprimé.** Motif : doublon du moteur carbone de STRATA Scope, plus aucune route web ne l'appelait, adama.ai fait son RAG directement via pgvector.

**L2, Moteur de calcul**

- [x] L2-T1 à T3 **Annulées.** Couche fermée par décision d'architecture. Voir L2 en Partie 1.

**L3, Intelligence (RAG + adama.ai)**

- [~] **L3-T1 Ingestion du corpus (ESRS, VSME, CV, notes méthodologiques). Le script `rag:ingest` est prêt, la base est vide. PRIORITÉ ABSOLUE DE LA SEMAINE.**
- [x] L3-T2 Chunking sémantique + embeddings text-embedding-3-small (1024 dim) vers `rag_chunks`.
- [x] L3-T3 Index pgvector (hnsw), retrieval top-k filtré par langue et source.
- [x] L3-T4 Génération citée (gpt-4o), réponses sourcées, refus hors contexte.
- [x] L3-T5 Route `api/chat` en streaming (Vercel AI SDK), composant `adama.ai` flottant.
- [x] L3-T6 Commande Ctrl+K vers `ask adama`.

**L4, Interface (widgets)**

- [x] L4-T12 Simulateur VSME interactif (saisie vers score ESG instantané).
- [x] L4-T13 Page Open Metrics publique.

**L5, Contenu**

- Veille réglementaire : **hors périmètre**, c'est STRATA Watch (déjà en Phase 6, mode équipe, commentaires, affectation d'alertes). Le dashboard s'y connectera par lien quand Watch sera en ligne.

**Nouveau, issu du recentrage du 19 juillet**

- [ ] **L5-T2 Élargir le feed Shipped au multi-repo.** Agréger les commits d'`adama-os`, `esg-optimizer`, `strata-scope`, `strata-watch`, `strata-foundation`, `iroko-platform`, avec le nom du produit et sa division en badge. Sans ça, le dashboard montre une fraction infime de l'exécution réelle.
- [ ] **L4-T14 Couche D en vue groupe.** Passer de « métriques STRATA » à une grille quatre divisions avec l'état réel par produit (prod, déployé, développement, architecture).

**Definition of Done P2** : adama.ai répond avec sources sur une question réglementaire, le simulateur VSME tourne, le feed reflète l'exécution sur tous les repos. **Jalon : OS vivant le 31 août.**

---

## PHASE 3, ÉCOSYSTÈME ET SORTIES

**Fenêtre** : 1er septembre au 28 septembre. Cale avec le lancement Africa d'ESG Optimizer annoncé pour septembre.
**Objectif, révisé** : ce n'était pas « monétisation ». Le tunnel de vente appartient aux produits, pas au cockpit. L'objectif réel de P3, c'est que le dashboard **raconte le groupe** et trace ses sorties.

**Monétisation, portée par les produits**

| Sortie commerciale | Produit qui la porte | État |
| --- | --- | --- |
| Audit CSRD payant | ESG Optimizer (`esg-optimizer.fr`) | Prod |
| Bilan carbone certifiable | STRATA Scope (`scope.esg-optimizer.fr`) | Prod, paywall Stripe livré |
| Formations VSME | STRATA Academy | Architecture posée |
| Veille réglementaire | STRATA Watch | Phase 6 |
| Facturation et encaissement Afrique | IROKO Business OS (Iroko Pay) | Socle en construction |
| Checkout, TVA UE, newsletter | strata-platform (Stripe Tax) | Auth phase 2 |

**L6, Conversion (ce qui reste sur Adama OS)**

- [x] L6-T7 Hub `/strata` : vitrine des produits avec leur statut.
- [x] L6-T12 Liens sortants tracés (event PostHog `strata_outbound` sur nav, Couche D, hub, terminal).
- [ ] **L6-T13 Transformer `/strata` en hub écosystème `/ecosysteme`.** Quatre divisions, chaque produit avec statut, lien si live, mention « à venir » sinon. Rediriger `/strata` en 301 vers `/ecosysteme#strata` pour ne pas casser les liens déjà partagés.
- [ ] **L6-T14 Renommer l'événement `strata_outbound` en `ecosystem_outbound`** avec les propriétés `division` et `product`. Conserver l'ancien événement 30 jours en double émission pour ne pas trouer l'historique PostHog.

**L1, Données**

- [ ] **L1-T9 Registre `ecosystem_products`** : slug, nom, division, statut, URL, description courte, ordre d'affichage. Le hub lit cette table. Ajouter un produit devient une ligne en base, pas un déploiement.
- [ ] **L1-T10 Renommer `strata_analytics` en `ecosystem_analytics`**, ajouter les colonnes `division` et `product_slug`. Migration avec vue de compatibilité sur l'ancien nom.

**L8, Funnel**

- [ ] **L8-T7 Définir les 2 funnels PostHog** : (1) recrutement `vue vers recruiter_intent vers RDV ou CV`, (2) intérêt produit `vue vers ecosystem_outbound`. Les événements sont déjà émis, il ne manque que la configuration dans l'UI PostHog. Nécessite `NEXT_PUBLIC_POSTHOG_KEY`.

**Definition of Done P3** : un recruteur réserve un RDV, un visiteur part vers un produit live, et les deux sorties sont mesurées. Le hub montre un groupe à quatre divisions, pas une suite ESG. **Jalon : 28 septembre.**

---

## PHASE 4, DURCISSEMENT & MÉDIA

**Fenêtre** : 29 septembre au 30 octobre (la deadline stage du 31 octobre tombe ici). **Objectif** : tout est solide pour le push de novembre.

**L7, Acquisition & Média**

- [ ] L7-T1 OG images dynamiques (Satori) par page et par produit.
- [ ] L7-T2 Liens UTM sur tous les CTA, suivi PostHog par source.
- [ ] L7-T3 Calendrier de contenu TikTok (hooks code et ESG) et YouTube (GreenDiadam), branché sur les sorties.
- [ ] **L7-T4 Angle éditorial groupe.** Le récit « un ingénieur qui construit un groupe logiciel sur deux continents » est nettement plus fort que « un outil ESG ». Il faut le structurer avant de publier.

**L8, Qualité/Sécurité/SEO/i18n**

- [ ] L8-T8 Bilingue FR/EN (next-intl) sur tout le site public. Priorité haute : la cible recruteur inclut des groupes internationaux, et la division Afrique impose l'anglais.
- [ ] L8-T9 SEO complet : next-sitemap, JSON-LD (`Person`, `Organization`, `SoftwareApplication`), métadonnées par page.
- [ ] L8-T10 Audit accessibilité WCAG AA.
- [ ] L8-T11 Audit perf (Web Vitals, images, cache components Next 16).
- [ ] L8-T12 Audit sécurité : revue RLS, secrets, permissions, rate limiting sur les endpoints publics.
- [ ] ~~L8-T13 Tests des fonctions de calcul carbone.~~ **Retiré.** Il n'y a plus de calcul carbone dans Adama OS. Ces tests appartiennent à STRATA Scope, où ils existent déjà.

**Definition of Done P4** : site bilingue, SEO et accessibilité validés, perf au vert, sécurité auditée, contenu média prêt. **Jalon : 30 octobre.**

---

## NOVEMBRE, LE PUSH RECRUTEMENT

- [ ] Diffuser le dashboard aux cibles (Directeurs RSE, cabinets, fonds, DSI de groupes).
- [ ] Lancer la cadence de contenu (frappe rapide TikTok, masterclass YouTube).
- [ ] Suivre les funnels, itérer sur les messages qui convertissent.
- [ ] Objectif : décrocher le poste d'élite, pendant que les produits du groupe continuent de tourner.

---

# PARTIE 3 : MATRICE COUCHES × PHASES (synthèse)

| Couche | P0 Fondations | P1 Vitrine | P2 Intelligence | P3 Écosystème | P4 Durcissement |
| --- | --- | --- | --- | --- | --- |
| L0 Infra | monorepo, CI/CD, **domaine** | preview deploys | engine supprimé | - | hardening |
| L1 Données | schéma, RLS, auth | endpoints, checkin | rag_chunks | registre produits, analytics groupe | revue RLS |
| L2 Moteur | - | - | **couche fermée** | - | - |
| L3 Intelligence | - | - | RAG + adama.ai, **ingestion** | - | - |
| L4 Interface | tokens, layout | 4 couches, Ctrl+K | VSME, Open Metrics, **Couche D groupe** | - | a11y, perf |
| L5 Contenu | - | feed GitHub | **feed multi-repo** | - | OG dynamiques |
| L6 Conversion | - | sortie recruteur | - | hub écosystème, sorties tracées | UTM |
| L7 Média | - | - | - | - | TikTok, YouTube, angle groupe |
| L8 Qualité | lint, Sentry | PostHog, SEO base | - | **funnels** | SEO, i18n, sécurité |

---

# PARTIE 4 : JALONS CLÉS

| Date | Jalon | Statut |
| --- | --- | --- |
| 6 juillet | Squelette en ligne | Atteint sauf domaine |
| 3 août | Dashboard recrutement-ready, envoyable | **Atteint en avance** |
| 31 août | OS vivant : RAG ingéré, feed multi-repo, Couche D groupe | En cours, 85 pour cent |
| 28 septembre | Hub écosystème et sorties tracées | À venir |
| 30 octobre | OS durci, bilingue, prêt pour le push | À venir |
| 31 octobre | Deadline stage AG2R | - |
| Novembre | Push recrutement | - |

---

# PARTIE 5 : DÉPENDANCES CRITIQUES & RISQUES

**Dépendances** (à ne pas inverser)

- **L0-T6 (domaine) avant tout partage externe.** Un dashboard sur une URL `.vercel.app` détruit une grande partie de l'effet auprès d'un recruteur. C'est le blocage le moins cher à lever et le plus coûteux à laisser traîner.
- L1 (données) avant L4 (interface) : les couches du dashboard lisent la base.
- L1-T9 (registre produits) avant L6-T13 (hub écosystème) : le hub lit la table.
- L3-T1 (ingestion) avant toute démo d'adama.ai : sans corpus, l'agent refuse de répondre, ce qui est correct mais indémontrable.

**Risques identifiés et parades**

- **Dispersion sur sept produits.** C'est le risque numéro un, aggravé par le passage à quatre divisions. Parade : Adama OS ne développe aucun produit, il les affiche. Toute tentation d'implémenter une feature produit ici est un signal d'alerte.
- **Le dashboard sous-vend l'exécution réelle.** Le feed ne lit qu'un repo sur sept. Parade : L5-T2, en priorité P2.
- **Surcharge du scope.** Parade : finir une phase avant la suivante. La vitrine recrutement seule justifie déjà l'effort.
- **Perfectionnisme sur le design.** Parade : le design est fait, ne plus y toucher avant P4.
- **RAG qui hallucine.** Parade déjà en place : citation obligatoire, refus hors contexte.
- **Temps M2 plus stage plus produits.** Parade : la roadmap suppose un rythme régulier, pas des sprints héroïques. Une couche avance à la fois.
- **Confusion de marque.** Trois noms circulent (Adama OS, STRATA, IROKO). Parade : Adama OS est le cockpit personnel, IROKO SOFTWARE GROUP est la holding, STRATA est une division. Cette hiérarchie doit être lisible en cinq secondes sur la page d'accueil.

---

# PARTIE 6 : RITUEL D'EXÉCUTION

**Cadence hebdomadaire** (cohérente avec les 4 séances de sport par semaine)

- Lundi : choisir 3 à 5 tâches de la phase en cours.
- En continu : une entrée Decisions Log par choix technique notable. Ça nourrit la Couche B et le contenu.
- Vendredi : push, mise à jour du checkin, un contenu court documentant la semaine.

**Métriques de suivi**

- Avancement : nombre de tâches `[x]` par phase.
- Recrutement : `recruiter_intent` et RDV Cal.com (PostHog).
- Écosystème : métriques d'usage publiques (`ecosystem_analytics`, page Open Metrics).
- Sorties : clics `ecosystem_outbound` par division et par produit.
- Média : trafic par source UTM.

---

# PARTIE 7 : PROMPTS EXPERTS PAR COUCHE

Un prompt par couche, prêt à coller dans Claude Code depuis la racine `adama-os`. Chacun est autonome : il rappelle le contexte, cadre le périmètre et interdit explicitement ce qui ne doit pas être fait.

**Règles communes à tous les prompts** : TypeScript strict, aucun secret en dur, aucun marqueur d'IA ni tiret long dans le code et les textes produits, français par défaut, et aucune duplication de logique appartenant à un produit du groupe.

---

### Prompt L0, Infrastructure

```
Contexte : monorepo pnpm + Turborepo `adama-os`, apps/web en Next.js 16 sur Vercel,
déploiement continu sur main avec preview deploys sur PR. services/engine a été
supprimé le 13 juillet 2026 (doublon du moteur carbone de STRATA Scope).

Tâche : finaliser L0-T6, la mise en ligne sur domaine propre.

1. Auditer `apps/web/next.config.ts`, `app/sitemap.ts`, `app/robots.ts` et toute
   URL en dur, et centraliser l'origine du site dans une seule variable
   d'environnement `NEXT_PUBLIC_SITE_URL`.
2. Lister précisément les enregistrements DNS à créer chez le registrar pour
   pointer sur Vercel (apex + www), et la redirection canonique à retenir.
3. Vérifier que les métadonnées Open Graph, le JSON-LD et le sitemap utilisent
   cette origine et non une URL vercel.app.
4. Nettoyer le README : il décrit encore services/engine et Railway, qui
   n'existent plus.

Interdits : ne pas réintroduire de service Python, ne pas ajouter de dépendance
d'infrastructure nouvelle, ne pas toucher au pipeline Vercel existant qui
fonctionne.

Livrable attendu : un diff, plus la liste exacte des actions manuelles à faire
dans le registrar et le dashboard Vercel.
```

---

### Prompt L1, Données

```
Contexte : Supabase Postgres en région UE, Drizzle ORM dans packages/db,
pgvector actif, RLS active sur toutes les tables. Schéma dans
packages/db/src/schema.ts, migrations dans packages/db/migrations.

Contexte stratégique : le périmètre du dashboard passe de la suite STRATA au
groupe IROKO SOFTWARE GROUP, qui compte quatre divisions (STRATA Europe, IROKO
Afrique, Infrastructure, Services).

Tâches L1-T9 et L1-T10 :

1. Créer la table `ecosystem_products` : slug (unique), nom, division (enum
   strata | iroko | infrastructure | services), statut (enum prod | deployed |
   development | architecture), url (nullable), description courte, ordre
   d'affichage, timestamps. RLS : lecture publique, écriture réservée à l'admin.
2. Renommer `strata_analytics` en `ecosystem_analytics` et ajouter les colonnes
   `division` et `product_slug` (clé étrangère vers ecosystem_products).
   Fournir une vue de compatibilité `strata_analytics` pour ne rien casser
   pendant la transition.
3. Écrire la migration Drizzle correspondante et mettre à jour le seed avec
   l'état réel au 19 juillet 2026 : ESG Optimizer et STRATA Scope en prod,
   STRATA Foundation déployé, STRATA Watch en développement, STRATA Academy et
   STRATA Platform en architecture, IROKO Business OS en développement.
4. Exposer un endpoint de lecture pour le hub.

Interdits : ne pas casser les endpoints de lecture existants
(system_metrics, decisions_log, trajectory), ne pas désactiver la RLS,
ne pas écrire de migration destructive sans vue de compatibilité.

Livrable : migration SQL, schéma Drizzle mis à jour, seed, endpoint, et la
commande exacte à lancer pour appliquer la migration.
```

---

### Prompt L2, Moteur de calcul

```
Cette couche est volontairement fermée. Aucun développement n'y est autorisé.

Décision d'architecture du 13 juillet 2026, confirmée le 19 juillet : tout
calcul ESG lourd (carbone Scopes 1-2-3, double matérialité, taxonomie) appartient
à STRATA Scope et ESG Optimizer, qui ont leurs propres moteurs testés et leurs
facteurs ADEME Base Empreinte. Le service `services/engine` d'Adama OS a été
supprimé pour cette raison.

Si un besoin de chiffre carbone apparaît dans le dashboard, la seule réponse
acceptable est : appeler l'API publique versionnée de STRATA Scope en lecture,
avec une clé cloisonnée par organisation, et afficher le résultat.

Toute demande d'implémentation de calcul dans ce repo doit être refusée et
renvoyée vers le repo produit concerné.
```

---

### Prompt L3, Intelligence conversationnelle

```
Contexte : le pipeline RAG d'Adama OS est entièrement codé et branché.
Extraction PDF locale via unpdf, chunking sémantique, embeddings OpenAI
text-embedding-3-small en 1024 dimensions, stockage dans rag_chunks, index
pgvector hnsw, retrieval top-k filtré par langue et source, génération citée
avec gpt-4o et refus hors contexte, route api/chat en streaming via Vercel AI
SDK, composant adama.ai flottant, commande `ask adama` dans le terminal Ctrl+K.
Le script d'ingestion est dans packages/db/src/ingest.ts.

Problème : la base vectorielle est vide. L'agent est fonctionnel mais muet.

Tâche L3-T1 :

1. Auditer le script d'ingestion : gestion des erreurs, idempotence (ne pas
   dupliquer un document déjà ingéré), coût des appels d'embedding, taille et
   chevauchement des chunks, métadonnées conservées (source, langue, page).
2. Proposer le corpus minimal viable pour une démonstration crédible en
   entretien : normes ESRS, standard VSME, CV, notice méthodologique
   ESG Optimizer. Estimer le nombre de chunks et le coût d'embedding.
3. Ajouter une commande de vérification qui, après ingestion, exécute trois
   questions types et affiche les sources retournées, pour prouver que le
   retrieval fonctionne avant toute démo.
4. Documenter la procédure d'ajout d'un document au corpus.

Interdits : ne pas changer le modèle d'embedding (la dimension 1024 est figée
dans le schéma et l'index), ne pas relâcher le garde-fou de refus hors contexte,
ne pas ingérer de document confidentiel client.

Livrable : script durci, commande de vérification, procédure documentée, et le
coût estimé de l'ingestion.
```

---

### Prompt L4, Interface & Design System

```
Contexte : dashboard Next.js 16 + Tailwind v4 + shadcn/ui new-york, tokens OKLCH
(noir carbone, blanc, émeraude), Geist Sans et Geist Mono, Framer Motion.
Quatre couches livrées dans apps/web/components : layer-a (System Status),
layer-b (Decisions Log), layer-c (Trajectory), layer-d (Sandbox), plus
terminal.tsx, vsme-simulator.tsx, recruit-modal.tsx, recruiter-view.tsx.

Contexte stratégique : la Couche D affiche encore un écosystème centré STRATA.
Le périmètre réel est le groupe IROKO SOFTWARE GROUP, quatre divisions.

Tâche L4-T14, refonte de la Couche D en vue groupe :

1. Lire les produits depuis la table ecosystem_products (voir prompt L1), pas
   depuis un tableau en dur dans le composant.
2. Grouper l'affichage par division, avec un badge de statut lisible
   (prod, déployé, développement, architecture) et un traitement visuel distinct
   pour les produits en ligne, qui seuls portent un lien cliquable.
3. Conserver la preuve sociale existante (AG2R LA MONDIALE, Younivibe, AFEV,
   Ministère des Finances) : elle est plus forte que les métriques produit
   auprès d'un recruteur, elle ne doit pas être noyée.
4. Chaque lien sortant passe par le composant outbound-link.tsx existant, avec
   les propriétés division et product.
5. Vérifier le rendu en mode recruteur (?for=recruiter) et à l'impression.

Interdits : ne pas modifier les tokens de design, ne pas introduire de
bibliothèque de composants supplémentaire, ne pas casser le responsive ni les
animations existantes, ne pas allonger le temps de rendu initial de la page.

Livrable : composant refondu, données lues en base, et la description précise du
rendu desktop et mobile.
```

---

### Prompt L5, Contenu et preuve d'exécution

```
Contexte : le feed « Shipped » (apps/web/components/shipped-feed.tsx, logique
dans apps/web/lib/github.ts) lit l'API GitHub et affiche les commits réels.
Il ne lit aujourd'hui que le repo adama-os.

Problème : l'essentiel de l'exécution se fait ailleurs. Les repos actifs sont
esg-optimizer, strata-scope, strata-watch, strata-foundation, strata-academy,
strata-platform (organisation iroko-software-group) et iroko-platform. Le
dashboard affiche donc une fraction infime du travail réel, ce qui affaiblit
directement l'argument recruteur.

Tâche L5-T2, feed multi-repo :

1. Rendre la liste des repos configurable (variable d'environnement ou table
   ecosystem_products), pas codée en dur.
2. Agréger les commits de tous les repos, trier par date décroissante, afficher
   pour chacun le nom du produit et sa division en badge.
3. Gérer proprement les contraintes de l'API GitHub : quota, pagination, repos
   privés (token à portée lecture uniquement), et mise en cache pour ne pas
   appeler l'API à chaque rendu.
4. Prévoir la dégradation : si un repo est inaccessible, le feed affiche les
   autres au lieu de tomber.
5. Filtrer le bruit : exclure les commits de merge et les commits de
   dépendances automatiques.

Interdits : ne pas exposer de token côté client, ne pas afficher le contenu des
commits de repos privés au-delà du message et de la date, ne pas bloquer le
rendu de la page sur cet appel réseau.

Livrable : feed multi-repo caché et résilient, configuration documentée, et la
liste des variables d'environnement à ajouter dans Vercel.
```

---

### Prompt L6, Conversion

```
Contexte : deux sorties existent. La sortie recrutement (bouton persistant,
modal avec CV et Cal.com, capture de lead, événement PostHog recruiter_intent,
mode lecture recruteur) est livrée et fonctionne. La sortie produit est le hub
/strata (apps/web/app/strata/page.tsx) avec l'événement strata_outbound émis
depuis la nav, la Couche D, le hub et le terminal via outbound-link.tsx.

Contexte stratégique : le périmètre passe de la suite STRATA au groupe
IROKO SOFTWARE GROUP, quatre divisions.

Tâches L6-T13 et L6-T14 :

1. Transformer /strata en /ecosysteme : présentation par division, produits lus
   depuis ecosystem_products, lien cliquable uniquement pour les produits en
   ligne, mention explicite de l'état pour les autres.
2. Mettre en place une redirection permanente 301 de /strata vers
   /ecosysteme#strata. Des liens ont déjà été partagés, ils ne doivent pas
   casser.
3. Renommer l'événement strata_outbound en ecosystem_outbound, avec les
   propriétés division et product. Émettre les deux événements en parallèle
   pendant 30 jours pour ne pas trouer l'historique PostHog, puis retirer
   l'ancien.
4. Mettre à jour la commande `ping strata` du terminal en conséquence, en
   gardant un alias sur l'ancien nom.

Interdits : ne pas toucher à la sortie recrutement, qui fonctionne et qui est la
sortie prioritaire. Ne pas ajouter de paiement, de checkout ou de tunnel de
vente : la monétisation appartient aux produits (Stripe sur STRATA Scope et
ESG Optimizer, Stripe Tax sur strata-platform).

Livrable : page /ecosysteme, redirection, événements renommés en double
émission, et la liste des funnels à créer côté PostHog.
```

---

### Prompt L7, Acquisition et média

```
Contexte : phase 4, à partir du 29 septembre 2026. Rien n'est commencé, c'est
normal. Canaux visés : TikTok (format court, hooks code et ESG) et YouTube
(chaîne GreenDiadam, format masterclass).

Contexte stratégique : l'angle éditorial a changé de calibre. Le récit n'est plus
« un consultant RSE qui code un outil ESG », c'est « un ingénieur qui construit
un groupe logiciel sur deux continents, sept produits, et documente tout en
public ». C'est un positionnement nettement plus rare et plus défendable.

Tâches L7-T1 à L7-T4 :

1. OG images dynamiques via Satori : un template par type de page (accueil,
   écosystème, produit, Open Metrics), avec le statut réel du produit affiché.
2. Ajouter des paramètres UTM cohérents sur tous les CTA sortants et vérifier
   que PostHog attribue correctement la source.
3. Structurer un calendrier éditorial sur huit semaines, chaque contenu pointant
   vers une sortie tracée. Un contenu, une sortie, jamais deux.
4. Formuler trois angles narratifs testables pour le récit groupe, avec pour
   chacun le hook, la preuve visuelle disponible dans le dashboard, et la sortie
   ciblée.

Interdits : aucune affirmation chiffrée qui ne soit pas vérifiable dans le
dashboard ou dans un produit en ligne. Le dashboard sert de preuve, il ne doit
jamais être contredit par le contenu.

Livrable : templates OG, convention UTM documentée, calendrier éditorial, et les
trois angles avec leur preuve associée.
```

---

### Prompt L8, Qualité, sécurité, SEO, observabilité

```
Contexte déjà en place : TypeScript strict, ESLint et Prettier partagés, Sentry
sur le web, PostHog en région UE avec bandeau de consentement, Better Stack pour
un statut système réel, métadonnées et JSON-LD Person, sitemap et robots.
RLS active sur toutes les tables Supabase.

Tâches restantes, par ordre de valeur :

1. L8-T7, funnels PostHog. Les événements sont déjà émis. Définir le funnel
   recrutement (vue vers recruiter_intent vers RDV ou téléchargement CV) et le
   funnel produit (vue vers ecosystem_outbound). Documenter la configuration
   exacte à reproduire dans l'interface PostHog.
2. L8-T8, bilingue FR/EN avec next-intl sur tout le site public. Priorité haute :
   la cible recruteur inclut des groupes internationaux et la division Afrique
   impose l'anglais. Extraire les chaînes, ne pas traduire à la volée.
3. L8-T9, SEO complet : JSON-LD Person, Organization (IROKO SOFTWARE GROUP) et
   SoftwareApplication par produit, métadonnées par page, sitemap à jour.
4. L8-T10, audit accessibilité WCAG AA, en priorité le contraste sur fond sombre
   et la navigation au clavier dans le terminal Ctrl+K.
5. L8-T11, audit performance : Web Vitals, images, cache components Next 16.
6. L8-T12, audit sécurité : revue des policies RLS, rotation des secrets,
   permissions du token GitHub, rate limiting sur les endpoints publics et sur
   api/chat, qui appelle un modèle payant.

Interdits : ne pas ajouter d'outil d'observabilité supplémentaire, la stack est
suffisante. Ne pas traduire automatiquement le contenu, la qualité de langue
fait partie de l'argument.

Livrable : pour chaque point, un diff ou une procédure, plus la liste des actions
manuelles à faire dans PostHog, Vercel et Supabase.
```

---

_La priorité qui débloque tout maintenant, c'est le trio domaine (L0-T6), corpus RAG (L3-T1), feed multi-repo (L5-T2). Trois gestes, et le dashboard passe d'une belle coquille à une preuve d'exécution qu'aucun CV ne peut concurrencer._

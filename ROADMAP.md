# ROADMAP COMPLÈTE, ADAMA OS

> Compagnon de `ADAMA_OS_BLUEPRINT.md`. Ici, le plan d'exécution complet, couche par couche.
> Rédigée le 24 juin 2026, mise à jour le 13 juillet 2026. Deadline stage AG2R LA MONDIALE (Grenoble, Chargé de missions RSE - Data ESG & Solutions IA, du 1er mai au 31 octobre 2026). Push recrutement : novembre 2026, cible CDI / CDD en Île-de-France.
> P0 et P1 sont livrées (dashboard recrutement-ready en avance sur le jalon du 3 août). Phase courante : P2.
>
> **Recentrage du 13 juillet 2026.** Adama OS est l'ATELIER du fondateur (dashboard build-in-public), pas un hébergeur de produits. Les modules audit, veille et formations NE sont PAS développés ici : ce sont des produits STRATA, dans leurs propres repos (ESG Optimizer et STRATA Scope en ligne ; STRATA Watch, Academy, Foundation à venir). Adama OS s'y connecte par des liens tracés. Les couches L5 (contenu) et L6 (conversion) sont donc réduites à ce qui relève vraiment du dashboard : preuve d'exécution et sortie recrutement.

---

## Comment lire cette roadmap

Deux axes se croisent.

- **9 couches techniques (L0 à L8)** : les strates du système, du plus bas niveau (infra) au plus haut (média). C'est le QUOI.
- **5 phases temporelles (P0 à P4)** : le calendrier. C'est le QUAND.

Chaque phase fait avancer plusieurs couches en parallèle. La Partie 1 décrit les couches dans l'absolu. La Partie 2 découpe le travail phase par phase, avec des cases à cocher. La Partie 3 est la matrice de synthèse. Tu peux suivre soit en vertical (finir une couche), soit en horizontal (finir une phase). Je recommande l'horizontal : terminer chaque phase rend l'OS utilisable plus tôt.

Convention : `[ ]` à faire, `[~]` en cours, `[x]` fait. Les identifiants type `L1-T3` veulent dire couche 1, tâche 3.

---

# PARTIE 1 : LES 9 COUCHES DU SYSTÈME (vue verticale)

### L0, Infrastructure & DevOps

**Objectif** : un squelette déployé en continu, chaque push en ligne en moins de 2 minutes.
**Stack** : Monorepo pnpm + Turborepo, GitHub, Vercel (web), Railway (FastAPI), domaine + DNS.
**Contient** : repo, CI/CD, environnements (dev/prod), secrets, domaine, branches.
**État cible** : `git push` sur `main` déploie web (Vercel), preview deploys sur les PR. (`services/engine` retiré le 13 juillet, voir L0-T8.)

### L1, Données (le système nerveux)

**Objectif** : une source de vérité unique et sécurisée.
**Stack** : Supabase (Postgres UE + Auth + Realtime + Storage + pgvector), Drizzle ORM.
**Contient** : `system_metrics`, `decisions_log`, `trajectory`, `strata_analytics`, `leads` (recruteur), `rag_documents`, `rag_chunks`, RLS, migrations. (`audit_requests` et `course_entitlements` retirés le 13 juillet : ils appartenaient aux modules audit/formations partis chez les produits STRATA.)
**État cible** : schéma migré, RLS active, auth fonctionnelle, seed de données de démo.

### L2, Moteur de calcul (l'intelligence brute)

**Objectif** : les calculs ESG lourds, isolés et testés.
**Stack** : FastAPI sur Railway, Python (uv), Pydantic.
**Contient** : modules `carbon` (Scopes 1-2-3), `materiality` (double matérialité), `taxonomy` (taxonomie UE), endpoints internes appelés par Next.js.
**État cible** : API documentée (OpenAPI), fonctions de calcul couvertes par des tests (zone zéro erreur).

### L3, Intelligence conversationnelle (RAG + adama.ai)

**Objectif** : un agent qui répond sur les textes de loi sans halluciner.
**Stack** : OpenAI (gpt-4o en génération, text-embedding-3-small 1024 dim), extraction PDF locale (unpdf), pgvector, Vercel AI SDK.
**Contient** : pipeline ingestion (OCR, chunking, embeddings), retrieval top-k, génération citée, chat streaming.
**État cible** : tu poses une question sur l'ESRS, l'agent répond avec sources, en français et anglais.

### L4, Interface & Design System

**Objectif** : le ressenti terminal de vaisseau spatial, dark mode, accents émeraude.
**Stack** : Next.js 16, Tailwind v4, shadcn/ui (new-york), Framer Motion, Tremor, cmdk, Geist Mono.
**Contient** : design tokens, layout dashboard, couches A/B/C/D, terminal Ctrl+K, widgets, modal recruteur.
**État cible** : dashboard complet, animé, responsive, accessible.

### L5, Contenu (preuve d'exécution)

**Objectif** : montrer la construction en public, sans dupliquer les produits STRATA.
**Stack** : API GitHub (feed Shipped), Open Metrics (Supabase).
**Contient** : feed "Shipped" (commits réels), page Open Metrics, hub `/strata` qui pointe vers les produits.
**État cible** : le dashboard prouve l'exécution en direct. La veille réglementaire est le produit STRATA Watch (repo `strata-watch`), les formations sont STRATA Academy (repo `strata-academy`) : aucune des deux n'est hébergée ici.

### L6, Conversion (les sorties du dashboard)

**Objectif** : 2 sorties actives et mesurées, propres au dashboard fondateur.
**Stack** : Cal.com, PostHog.
**Contient** : modal "Recruter l'Architecte" (sortie recrutement), liens sortants tracés vers les produits STRATA (hub `/strata`, nav, Couche D, terminal).
**État cible** : un recruteur réserve un RDV, un visiteur intéressé part vers ESG Optimizer / STRATA Scope, les deux sorties sont trackées. La monétisation (audit payant, achat formation, TVA UE) est gérée par les produits STRATA (Stripe sur strata-platform), pas ici.

### L7, Acquisition & Média

**Objectif** : remplir le tunnel via TikTok et YouTube (GreenDiadam).
**Stack** : OG images dynamiques (Satori), liens UTM, scripts et hooks, calendrier de contenu.
**Contient** : templates de partage, CTA branchés sur les sorties, cadence de publication.
**État cible** : chaque contenu pointe vers une sortie de conversion trackée.

### L8, Qualité, Sécurité, SEO, Observabilité

**Objectif** : du solide, conforme RGPD, visible sur Google et les moteurs IA.
**Stack** : TypeScript strict, ESLint/Prettier, Sentry, Better Stack, next-sitemap, JSON-LD, next-intl.
**Contient** : RLS, gestion des secrets, consentement cookies, tests, monitoring, métadonnées, bilingue.
**État cible** : zéro secret exposé, erreurs suivies, statut système réel, SEO complet, FR/EN.

---

# PARTIE 2 : LES 5 PHASES (vue horizontale, le calendrier)

---

## PHASE 0, FONDATIONS

**Fenêtre** : 24 juin → 6 juillet (2 semaines). **Objectif** : un squelette en ligne sur ton domaine, prêt à recevoir des features.

**L0, Infra**

- [x] L0-T1 Créer le repo GitHub privé `adama-os`.
- [x] L0-T2 Scaffolder le monorepo Turborepo (`apps/web`, `packages/ui`, `packages/db`, `packages/config`).
- [x] L0-T3 Créer `apps/web` avec Next.js 16 + Tailwind v4 + TypeScript strict + Turbopack.
- [x] L0-T4 Initialiser shadcn/ui (style new-york, base color zinc).
- [x] L0-T5 Connecter le repo à Vercel, activer les preview deploys.
- [ ] L0-T6 Acheter le domaine, pointer les DNS vers Vercel, activer le HTTPS.
- [x] ~~L0-T7 Créer le service Railway vide pour `services/engine`.~~ Annulé le 13 juillet : `services/engine` supprimé (doublon du moteur de STRATA Scope, plus appelé par le web).

**L1, Données**

- [x] L1-T1 Créer le projet Supabase en région UE (réutilisation de strata-scope, eu-west-1).
- [x] L1-T2 Définir le schéma Drizzle (les 8 tables du blueprint).
- [x] L1-T3 Première migration, activer pgvector.
- [x] L1-T4 Activer la RLS sur toutes les tables, policies de base.
- [x] L1-T5 Brancher l'auth Supabase (login admin pour toi).
- [x] L1-T6 Seed de données de démo (3 décisions, métriques actuelles).

**L4, Design System**

- [x] L4-T1 Définir les design tokens (noir carbone, blanc, émeraude) en OKLCH dans `@theme`.
- [x] L4-T2 Police Geist Sans + Geist Mono.
- [x] L4-T3 Layout global dark mode, grille du dashboard.
- [x] L4-T4 Composants de base (Card, Badge, Button) au style terminal.

**L8, Qualité**

- [x] L8-T1 ESLint + Prettier + config TypeScript strict partagée.
- [x] L8-T2 `.env.example` complet, secrets dans Vercel/Railway, jamais commités.
- [x] L8-T3 Sentry branché sur web (erreurs dès le départ).

**Definition of Done P0** : le domaine affiche une page dashboard vide mais stylée, l'auth marche, la base est migrée, chaque push déploie. **Jalon : squelette en ligne le 6 juillet.**

---

## PHASE 1, VITRINE RECRUTEMENT

**Fenêtre** : 7 juillet → 3 août. **Objectif** : un dashboard qui impressionne un recruteur, prêt à envoyer. C'est la phase la plus importante pour novembre.

**L1, Données**

- [x] L1-T7 Endpoints de lecture pour `system_metrics`, `decisions_log`, `trajectory`.
- [x] L1-T8 Route privée `/checkin` pour mettre à jour tes métriques en 1 clic (poids réel inclus).

**L4, Interface (les 4 couches)**

- [x] L4-T5 **Couche A, System Status** : statut, focus courant, compte à rebours live vers le 31 octobre, barre lean bulk vers 80 kg, protocole minimaliste.
- [x] L4-T6 **Couche B, Decisions Log** : timeline ADR, filtrable par catégorie, lisible.
- [x] L4-T7 **Couche C, Trajectory** : Now / Next / Later, avec risques et solutions.
- [x] L4-T8 **Couche D, Sandbox** : preuve sociale (AG2R LA MONDIALE, Younivibe, AFEV, Ministère des Finances), métriques STRATA.
- [x] L4-T9 **Terminal Ctrl+K** (cmdk) avec commandes : `download cv`, `ping strata`, `book call`, `navigate`, `theme`.
- [x] L4-T10 Animations Framer Motion (entrées, compteurs, transitions de couches).
- [x] L4-T11 Responsive complet (desktop, tablette, mobile).

**L5, Contenu (preuve d'exécution)**

- [x] L5-T1 Feed "Shipped" branché sur l'API GitHub (tes vrais commits en direct).

**L6, Conversion (sortie 1)**

- [x] L6-T1 Bouton persistant `[ Recruter l'Architecte ]`.
- [x] L6-T2 Modal : proposition de valeur hybride (CDI / CDD dès novembre 2026), lien CV (`CV_AdamaDiallo_RSE.pdf`), Cal.com embarqué.
- [x] L6-T3 Capture du lead recruteur dans `leads`, événement PostHog `recruiter_intent`.
- [x] L6-T4 Mode lecture recruteur (`?for=recruiter`), layout simplifié et imprimable.

**L8, Qualité/SEO**

- [x] L8-T4 PostHog branché (région UE) + bandeau de consentement.
- [x] L8-T5 Métadonnées + OG statique de la home, JSON-LD `Person` (AG2R + STRATA, cible CDI/CDD).
- [x] L8-T6 Better Stack (uptime) pour que le System Status reflète un vrai statut.

**Definition of Done P1** : tu envoies le lien à un recruteur, il voit ton statut live, tes décisions, ta roadmap, tes commits réels, et il peut réserver un RDV en 2 clics. **Jalon : dashboard recrutement-ready le 3 août. Première version envoyable.**

---

## PHASE 2, INTELLIGENCE

**Fenêtre** : 4 août → 31 août. **Objectif** : l'OS devient vivant et démontre ton génie technique (RAG, agent, simulateur).

**L0, Infra**

- [ ] L0-T8 `services/engine` (FastAPI) : **à réévaluer.** Depuis le retrait de l'Audit Express (13 juillet), plus aucune route web ne l'appelle (adama.ai fait son RAG directement via pgvector). Il fait probablement doublon avec le moteur carbone de STRATA Scope. Décision à prendre : le supprimer d'Adama OS ou le garder comme service partagé. Tant que non tranché, ne pas déployer.

**L2, Moteur de calcul — à réévaluer (voir L0-T8)**

- Le calcul ESG lourd (carbone, matérialité, audit-express) est le cœur des produits STRATA Scope et ESG Optimizer. Le moteur `services/engine` d'Adama OS fait doublon et n'est plus appelé par le web. À supprimer ou à convertir en service partagé, pas à re-développer ici.

**L3, Intelligence (RAG + adama.ai)**

- [~] L3-T1 Ingestion : extraction PDF locale (unpdf) sur tes PDF (ESRS, VSME, CV). (Script `rag:ingest` prêt ; reste à ingérer le corpus.)
- [x] L3-T2 Chunking sémantique + embeddings OpenAI text-embedding-3-small (1024 dim) → `rag_chunks`.
- [x] L3-T3 Index pgvector (hnsw), retrieval top-k filtré par langue/source.
- [x] L3-T4 Génération citée (gpt-4o), réponses avec sources, refus hors contexte.
- [x] L3-T5 Route `api/chat` en streaming (Vercel AI SDK), composant `adama.ai` flottant.
- [x] L3-T6 Commande Ctrl+K → `ask adama`.

**L4, Interface (widgets)**

- [x] L4-T12 Simulateur VSME interactif (saisie → score ESG instantané).
- [x] L4-T13 Page Open Metrics publique (depuis `strata_analytics`).

**L5, Contenu — DÉPLACÉ vers STRATA Watch**

- La veille réglementaire (scrape EFRAG / EUR-Lex / ADEME, synthèse IA, alertes) est le produit STRATA Watch (repo `strata-watch`, backend FastAPI + pgvector déjà en cours). Elle n'est plus développée dans Adama OS. Le dashboard s'y connectera par un lien quand STRATA Watch sera en ligne (Q3 2026).

**Definition of Done P2** : tu poses une question réglementaire à adama.ai et il répond avec sources, le simulateur VSME tourne. **Jalon : OS vivant le 31 août.**

---

## PHASE 3, MONÉTISATION

**Fenêtre** : 1 septembre → 28 septembre. **Objectif** : les 3 sorties de conversion actives. Cale avec l'expansion Afrique de l'Ouest annoncée pour septembre.

**Monétisation — DÉPLACÉE vers les produits STRATA**

Le tunnel de vente n'appartient pas au dashboard fondateur. Il est porté par les produits, chacun dans son repo :

- Audit CSRD payant → **ESG Optimizer** (`esg-optimizer.fr`, en ligne).
- Bilan carbone → **STRATA Scope** (`scope.esg-optimizer.fr`, en ligne).
- Formations → **STRATA Academy** (repo `strata-academy`, Q4 2026).
- Paiement, checkout, TVA UE, newsletter → **strata-platform** (Stripe / Stripe Tax) et les produits concernés.

Chaque produit trackera son propre funnel de vente, chez lui.

**L6, Conversion (ce qui reste sur Adama OS)**

- [x] L6-T7 Hub `/strata` : vitrine qui liste les produits STRATA avec leur statut (live = lien, autres = à venir).
- [x] L6-T12 Liens sortants tracés vers les produits live (event PostHog `strata_outbound` sur nav, Couche D, hub, terminal).

**L8, Funnel**

- [ ] L8-T7 Funnels PostHog du dashboard : (1) recrutement `vue → recruiter_intent → RDV/CV`, (2) intérêt produit `vue → strata_outbound`. Les événements sont déjà émis ; reste à définir les 2 funnels dans l'UI PostHog (nécessite `NEXT_PUBLIC_POSTHOG_KEY`).

**Definition of Done P3 (Adama OS)** : un recruteur réserve un RDV et un visiteur intéressé part vers ESG Optimizer / STRATA Scope, les deux sorties étant trackées. La DoD de vente (audit, formation, TVA) est portée par les produits STRATA. **Jalon : sorties du dashboard tracées le 28 septembre.**

---

## PHASE 4, DURCISSEMENT & MÉDIA

**Fenêtre** : 29 septembre → 30 octobre (la deadline stage du 31 octobre tombe ici). **Objectif** : tout est prêt et solide pour le push recrutement de novembre.

**L7, Acquisition & Média**

- [ ] L7-T1 OG images dynamiques (Satori) pour chaque article et formation.
- [ ] L7-T2 Liens UTM sur tous les CTA, suivi PostHog par source.
- [ ] L7-T3 Calendrier de contenu TikTok (hooks code + ESG) et YouTube (GreenDiadam), branché sur les sorties.

**L8, Qualité/Sécurité/SEO/i18n**

- [ ] L8-T8 Bilingue FR/EN (next-intl) sur tout le site public.
- [ ] L8-T9 SEO complet : next-sitemap, JSON-LD (Course, Article, SoftwareApplication), métadonnées par page.
- [ ] L8-T10 Audit accessibilité WCAG AA.
- [ ] L8-T11 Audit perf (Web Vitals, images, cache components Next 16).
- [ ] L8-T12 Audit sécurité : revue RLS, secrets, permissions, rate limiting sur les endpoints publics.
- [ ] L8-T13 Tests des fonctions de calcul carbone (couverture de la zone critique).

**L2, Expansion**

- [ ] L2-T4 Préparer l'architecture Afrique de l'Ouest (référentiels, langue, hypothèses).

**Definition of Done P4** : site bilingue, SEO et accessibilité validés, perf au vert, sécurité auditée, contenu média prêt à diffuser. **Jalon : OS prêt pour le push, fin octobre.**

---

## NOVEMBRE, LE PUSH RECRUTEMENT

- [ ] Diffuser le dashboard aux cibles (Directeurs RSE, cabinets, fonds).
- [ ] Lancer la cadence de contenu (frappe rapide TikTok + masterclass YouTube).
- [ ] Suivre les funnels, itérer sur les messages qui convertissent.
- [ ] Objectif : décrocher le poste d'élite, vendre STRATA, écouler les formations.

---

# PARTIE 3 : MATRICE COUCHES × PHASES (synthèse)

| Couche          | P0 Fondations            | P1 Vitrine                 | P2 Intelligence     | P3 Monétisation  | P4 Durcissement  |
| --------------- | ------------------------ | -------------------------- | ------------------- | ---------------- | ---------------- |
| L0 Infra        | Monorepo, CI/CD, domaine | preview deploys            | engine en prod      | webhooks         | hardening        |
| L1 Données      | schéma, RLS, auth        | endpoints lecture, checkin | rag_chunks          | leads, audit     | revue RLS        |
| L2 Moteur       | placeholder              | -                          | carbon, materiality | audit-express    | tests, expansion |
| L3 Intelligence | -                        | -                          | RAG + adama.ai      | -                | -                |
| L4 Interface    | tokens, layout           | 4 couches, Ctrl+K          | VSME, Open Metrics  | -                | a11y, perf       |
| L5 Contenu      | -                        | feed GitHub                | (STRATA Watch)      | (STRATA Academy) | OG dynamiques    |
| L6 Conversion   | -                        | sortie 1 recruteur         | -                   | hub + sorties tracées | UTM         |
| L7 Média        | -                        | -                          | -                   | -                | TikTok/YouTube   |
| L8 Qualité      | lint, Sentry             | PostHog, SEO base          | -                   | funnels          | SEO, i18n, sécu  |

---

# PARTIE 4 : JALONS CLÉS

| Date         | Jalon                                            |
| ------------ | ------------------------------------------------ |
| 6 juillet    | Squelette en ligne (P0 done)                     |
| 3 août       | Dashboard recrutement-ready, envoyable (P1 done) |
| 31 août      | OS vivant : RAG, adama.ai, veille auto (P2 done) |
| 28 septembre | Tunnel de conversion complet (P3 done)           |
| 30 octobre   | OS durci, bilingue, prêt pour le push (P4 done)  |
| 31 octobre   | Deadline stage                                   |
| Novembre     | Push recrutement                                 |

---

# PARTIE 5 : DÉPENDANCES CRITIQUES & RISQUES

**Dépendances** (à ne pas inverser)

- L1 (données) avant L4 (interface) : les couches du dashboard lisent la base.
- L1-T2 (schéma) avant tout le reste : c'est la fondation.
- (L0-T8 engine et la monétisation Polar/formations sont sortis du périmètre Adama OS : voir le recentrage du 13 juillet et les repos produits STRATA.)

**Risques identifiés et parades**

- **Surcharge du scope** (le risque que tu cites toi-même). Parade : finir P1 avant de toucher P2, ne jamais sauter de phase. La vitrine recrutement seule justifie déjà l'effort.
- **Perfectionnisme sur le design.** Parade : timeboxer L4 à 1 semaine en P1, polir en P4.
- **RAG qui hallucine.** Parade : forcer la citation des sources, refuser de répondre hors contexte.
- **Conformité TVA.** Gérée côté produits STRATA (Stripe Tax sur strata-platform), hors périmètre Adama OS.
- **Temps M2 + stage.** Parade : la roadmap suppose un rythme régulier, pas des sprints héroïques. 1 couche avance à la fois.

---

# PARTIE 6 : RITUEL D'EXÉCUTION

**Cadence hebdomadaire** (cohérente avec tes 4 séances de sport par semaine)

- Lundi : choisir 3 à 5 tâches de la phase en cours.
- En continu : 1 entrée Decisions Log par choix technique notable (ça nourrit ta couche B et ton contenu).
- Vendredi : push, mise à jour du checkin, 1 contenu court documentant la semaine.

**Métriques de suivi à regarder**

- Avancement : nombre de tâches `[x]` par phase.
- Recrutement : `recruiter_intent` et RDV Cal.com (PostHog).
- Produit STRATA : métriques d'usage publiques (`strata_analytics`, page Open Metrics).
- Sorties STRATA : clics `strata_outbound` par produit (PostHog).
- Média : trafic par source UTM.

---

_La phase qui débloque tout, c'est P1. Dès que tu valides les 4 décisions de la section 10.D du blueprint, je scaffolde P0 + le début de P1 directement dans le dossier._

# ADAMA OS, Blueprint d'architecture v2

> Document de référence pour construire Adama OS. Tu pars d'un dossier vide.
> Stack repensée pour la vélocité maximale, la conformité RGPD (argument de vente CSRD), et 3 sorties de conversion.
> Date de rédaction : 24 juin 2026. Deadline stage : 31 octobre 2026. Push recrutement : novembre 2026.

---

## 0. Ce qui change par rapport à ton manifeste

Ta vision est gardée à 100%. Ce que je modifie, c'est la plomberie technique, et j'ajoute des features qui servent directement tes 3 objectifs (recrutement, SaaS, formations).

| Couche            | Ton texte             | Ma reco v2                             | Pourquoi                                                                                                                                                                                                                                |
| ----------------- | --------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LLM ESG           | DeepSeek              | **Mistral (France)**                   | DeepSeek fait transiter les données par une infra chinoise. Injustifiable sous RGPD pour des clients CSRD. Mistral est le seul acteur frontier basé en UE. La résidence des données devient un argument commercial, pas une contrainte. |
| Base vectorielle  | Sous-entendue séparée | **pgvector dans Supabase**             | Tu as déjà Postgres. Pas besoin d'une 2e base vectorielle (Pinecone, etc.). Moins de coût, moins de surface à gérer.                                                                                                                    |
| Orchestration     | n8n / Make            | **Trigger.dev (code)** + n8n optionnel | Tes workflows de veille deviennent du code versionné dans le repo, cohérent avec ton ADN "build in public". Make reste utile pour le no-code ponctuel.                                                                                  |
| Paiement          | Non précisé           | **Polar (Merchant of Record)**         | 4% + 40¢, le MoR le moins cher. Il gère la TVA UE et le reverse charge B2B automatiquement. Tu ne touches pas à la compta TVA pour vendre tes formations dans toute l'UE.                                                               |
| Contenu / veille  | Tapé à la main        | **Sanity (CMS) + MDX**                 | La veille auto écrit dans Sanity. Les formations premium en MDX versionné. SEO server-rendered parfait.                                                                                                                                 |
| Ingestion PDF ESG | Non précisée          | **Mistral OCR 4**                      | Sorti le 23 juin 2026. Extrait texte + position + type de bloc des PDF réglementaires. Alimente directement ton RAG.                                                                                                                    |

Le reste de ta stack (Next.js, Tailwind, Framer Motion, Vercel, Supabase, FastAPI sur Railway) était déjà excellent. Je le précise et le durcis.

---

## 1. La stack upgradée, couche par couche

### Frontend (sur Vercel)

- **Next.js 16.2 LTS**, App Router, React Server Components, Server Actions. Turbopack par défaut (dev server très rapide, parfait sur ta machine Snapdragon X). Node 20+ requis.
- **React 19** + **TypeScript** en mode strict.
- **Tailwind CSS v4** (couleurs OKLCH, directive `@theme`).
- **shadcn/ui** style `new-york` pour le système de composants (basé sur Radix, accessible). `sonner` pour les toasts.
- **Framer Motion** (Motion) pour les animations du dashboard.
- **cmdk** pour le terminal Ctrl+K (la lib utilisée par Vercel et Linear).
- **Tremor** pour les widgets KPI et graphiques du dashboard. Recharts en complément si besoin.
- **Geist Sans + Geist Mono** (police monospace pour le ressenti terminal).
- **next-intl** pour le bilingue FR/EN (recruteurs internationaux + clients UE + expansion Afrique de l'Ouest).

### Backend & données

- **Supabase** comme système nerveux : Postgres + Auth + Realtime + Storage + **pgvector**.
- **Drizzle ORM** pour un accès typé à la base depuis Next.js (léger, idéal serverless). Prisma possible si tu préfères, mais Drizzle colle mieux à Supabase.
- **FastAPI sur Railway** pour le moteur lourd Python : calculs carbone (Scopes 1-2-3), matrices de double matérialité, taxonomie, et l'ingestion RAG. Exposé en API interne, appelé par Next.js.
- Séparation claire : Next.js fait l'app et l'UI, FastAPI fait le calcul et la science des données.

### Intelligence (adama.ai + RAG)

- **Mistral** pour la génération (résidence UE) et **Mistral Embed** (vecteurs 1024 dim) pour les embeddings.
- **Mistral OCR 4** pour ingérer les PDF (ESRS, VSME, ton CV, tes cours) dans le pipeline.
- **pgvector (Supabase)** comme stockage vectoriel.
- **Vercel AI SDK** côté frontend pour le streaming du chat et le tool calling de l'agent `adama.ai`.
- Architecture RAG (pas de fine-tuning) : zéro hallucination sur les textes de loi, coûts maîtrisés, mise à jour instantanée quand un texte réglementaire change.

### Automatisation

- **Trigger.dev** : jobs durables versionnés (scraping EFRAG / GHG Protocol, ingestion RAG, synthèse LLM, publication veille). Alternative : Inngest.
- **n8n auto-hébergé sur Railway** si tu veux du visuel pour certains flux.

### Monétisation & relation

- **Polar** (Merchant of Record) pour les formations et l'accès SaaS : gère TVA UE, factures, chargebacks.
- **Stripe** en option si tu veux un contrôle total sur l'abonnement SaaS B2B plus tard.
- **Cal.com** embarqué pour la prise de RDV recruteur.
- **Resend** + **React Email** pour l'email transactionnel (confirmations, livraison de formation, alertes lead).

### Observabilité, analytics, qualité

- **PostHog** : analytics produit + funnels des 3 sorties de conversion (clics recruteur, vues formations, essais SaaS).
- **Sentry** : suivi des erreurs.
- **Better Stack (Uptime)** : vrai monitoring pour donner du sens au panneau "System Status" (statut réel, pas décoratif).
- **Vercel Analytics** : Web Vitals.

### Repo & déploiement

- **Monorepo pnpm + Turborepo**, **GitHub**, déploiement continu Vercel (web) et Railway (FastAPI). Chaque `git push` met l'OS à jour.

---

## 2. Les features que j'ajoute (carte blanche)

Au-delà des 4 couches de ton manifeste, voici ce qui renforce tes objectifs.

1. **Feed "Shipped" branché sur l'API GitHub.** Tes vrais commits affichés en direct sur le dashboard. Preuve d'exécution irréfutable pour un recruteur, et carburant build in public. Couplé à ton Decisions Log.
2. **Open Metrics (transparence radicale).** Une page publique avec tes métriques SaaS (utilisateurs, requêtes API traitées, PME analysées) tirées de `strata_analytics`. Crédibilise STRATA et nourrit le contenu.
3. **Daily check-in (1 clic).** Une mini-route privée où tu mets à jour poids, sessions, deep work. Alimente le System Status en temps réel sans triche.
4. **OG images dynamiques (Satori / Vercel OG).** Chaque article de veille et chaque formation génère sa propre image de partage. Crucial pour le partage LinkedIn / TikTok.
5. **Bilingue FR/EN dès l'architecture.** Pas un ajout après coup. Recruteurs internationaux et clients UE.
6. **Newsletter (Resend Audiences).** Capture d'emails sur la veille et /learn. Tu possèdes ton audience, indépendamment de TikTok.
7. **Accessibilité WCAG AA.** Cohérent avec une marque durabilité, et bonus SEO. Radix t'en donne déjà 80%.
8. **Audit Express ESG en lead magnet.** Un formulaire court qui lance ton pipeline et renvoie un mini-rapport. Capture de lead SaaS et démonstration du produit en une étape.
9. **Mode "lecture recruteur".** Un layout simplifié et imprimable du dashboard, déclenché par `?for=recruiter`, qui met en avant CV, preuves et bouton RDV.
10. **Sitemap + JSON-LD structuré** générés automatiquement (Person, Course, Article, SoftwareApplication) pour Google et les moteurs IA.

---

## 3. Arborescence du monorepo

```
adama-os/
├─ apps/
│  ├─ web/                      # Next.js 16 (le dashboard + site public)
│  │  ├─ app/
│  │  │  ├─ (public)/
│  │  │  │  ├─ page.tsx               # Dashboard, couches A/B/C/D
│  │  │  │  ├─ veille/                # Veille auto (Sanity)
│  │  │  │  ├─ learn/                 # Formations 4 niveaux
│  │  │  │  ├─ strata/                # Landing SaaS + Audit Express
│  │  │  │  └─ metrics/               # Open Metrics public
│  │  │  ├─ (private)/
│  │  │  │  ├─ admin/                 # Edition Decisions Log, Trajectory
│  │  │  │  └─ checkin/               # Daily check-in
│  │  │  ├─ api/
│  │  │  │  ├─ chat/                  # adama.ai (Vercel AI SDK, stream)
│  │  │  │  ├─ audit-express/         # appel FastAPI
│  │  │  │  └─ webhooks/              # Polar, GitHub, Cal.com
│  │  │  └─ og/                       # images OG dynamiques
│  │  ├─ components/
│  │  │  ├─ dashboard/                # SystemStatus, DecisionsLog, Trajectory
│  │  │  ├─ command-menu/             # Ctrl+K (cmdk)
│  │  │  ├─ widgets/                  # VSME simulator, Shipped feed
│  │  │  └─ conversion/               # Modal "Recruter l'Architecte"
│  │  └─ lib/                         # supabase, drizzle, posthog, i18n
│  └─ studio/                   # Sanity Studio (veille + formations)
├─ services/
│  └─ engine/                   # FastAPI (Railway)
│     ├─ app/
│     │  ├─ carbon/                   # Scopes 1-2-3
│     │  ├─ materiality/              # double matérialité
│     │  ├─ taxonomy/                 # taxonomie UE
│     │  └─ rag/                      # OCR Mistral, embeddings, retrieval
│     └─ pyproject.toml
├─ packages/
│  ├─ ui/                       # composants shadcn partagés
│  ├─ db/                       # schéma Drizzle + migrations
│  └─ config/                   # tsconfig, eslint, tailwind preset
├─ trigger/                     # jobs Trigger.dev (veille, ingestion)
├─ turbo.json
└─ pnpm-workspace.yaml
```

Tu peux démarrer avec seulement `apps/web` + Supabase, et ajouter `services/engine` quand tu attaques le calcul ESG lourd. Ne monte pas tout le monorepo le jour 1.

---

## 4. Schéma de base de données (Supabase / Drizzle)

Tables principales :

- **`system_metrics`** : `id, key, value_num, value_text, unit, updated_at`. Stocke jours restants, progression lean bulk vers 80 kg, sessions foot, deep work. Mis à jour par le daily check-in.
- **`decisions_log`** : `id, title, date, category, reasoning, tags, is_published`. Le registre ADR public.
- **`trajectory`** : `id, title, status (now/next/later), type (feature/expansion/risk), eta, notes`.
- **`strata_analytics`** : `id, metric, value, period, source`. PME analysées, requêtes API. Remontées par le moteur FastAPI.
- **`leads`** : `id, email, source (recruiter/audit/newsletter), context jsonb, created_at`.
- **`rag_documents`** : `id, source, title, lang, created_at`.
- **`rag_chunks`** : `id, document_id, content, embedding vector(1024), metadata jsonb`. Index `ivfflat` ou `hnsw` sur `embedding`.
- **`audit_requests`** : `id, lead_id, company, sector, answers jsonb, result jsonb, status`.

Les cours et articles de veille vivent dans **Sanity**, pas dans Postgres (édition plus simple, le pipeline veille y écrit directement).

Active **Row Level Security** sur toutes les tables exposées. Les routes `(private)` passent par l'auth Supabase.

---

## 5. Pipeline RAG & adama.ai

1. **Ingestion** (Trigger.dev → FastAPI) : un PDF (ESRS, VSME, ton CV, un cours) passe par **Mistral OCR 4** qui sort le texte structuré.
2. **Chunking + embeddings** : découpage sémantique, vecteurs via **Mistral Embed** (1024 dim).
3. **Stockage** : `rag_chunks` dans pgvector, avec métadonnées (source, langue, type).
4. **Retrieval** : à chaque question, recherche de similarité top-k dans pgvector, filtrée par langue et source.
5. **Génération** : Mistral répond uniquement à partir des chunks récupérés, avec citation des sources. Zéro hallucination sur le droit.
6. **Front** : `api/chat` en streaming via Vercel AI SDK, composant `adama.ai` flottant (ouvrable aussi via Ctrl+K → `ask adama`).

---

## 6. Pipeline veille automatique

`Trigger.dev (cron) → scrape EFRAG / GHG Protocol → détection de nouveauté → synthèse Mistral → brouillon dans Sanity → (validation 1 clic ou auto-publish) → article live + image OG + entrée newsletter`.

Résultat : la section Veille se remplit sans que tu tapes une ligne, et chaque nouveauté réglementaire peut aussi déclencher une mise à jour du RAG.

---

## 7. Les 3 sorties de conversion (le tunnel)

- **Sortie 1, Recrutement.** Bouton persistant `[ Recruter l'Architecte ]` → modal avec proposition de valeur hybride, lien CV (`CV_AdamaDiallo_RSE.pdf`), Cal.com embarqué. Événement PostHog `recruiter_intent`. Accessible aussi via Ctrl+K → `book call` et `download cv`.
- **Sortie 2, SaaS STRATA / ESG Optimizer.** Landing `/strata` + **Audit Express** (lead magnet qui lance le pipeline). Essai gratuit géré par Polar. Métriques en prod affichées via Open Metrics.
- **Sortie 3, /learn (4 niveaux).** CSRD/ESG automatisé → Automatiser avec l'IA → Construire un agent IA métier → Build in Public SaaS. Paiement Polar (MoR, TVA UE gérée). Contenu en MDX + accès débloqué après achat.

---

## 8. Roadmap par phases (juin → novembre 2026)

Tu as environ 18 semaines. Priorité : être présentable à un recruteur le plus tôt possible, puis empiler le SaaS, le contenu et les formations.

- **Phase 0, Fondations (S1-S2, fin juin / début juillet).** Monorepo, design system dark mode + accents émeraude, auth Supabase, déploiement Vercel + Railway à vide, CI/CD. Objectif : un squelette en ligne sur ton domaine.
- **Phase 1, Vitrine recrutement (juillet).** Couches A (System Status), B (Decisions Log), C (Trajectory), terminal Ctrl+K, feed Shipped GitHub, CV, modal recruteur + Cal.com, preuve sociale. Objectif : dashboard qui impressionne, prêt à envoyer.
- **Phase 2, Intelligence (août).** Pipeline RAG + adama.ai, simulateur VSME, pipeline veille auto, Open Metrics. Objectif : l'OS devient vivant et démontre ton génie technique.
- **Phase 3, Monétisation (septembre).** /learn (4 niveaux), Polar, Audit Express, landing STRATA + essai. Objectif : les 3 sorties de conversion actives. Cale avec l'expansion Afrique de l'Ouest annoncée pour septembre.
- **Phase 4, Durcissement & média (octobre).** SEO complet, bilingue EN, OG dynamiques, newsletter, perf, accessibilité, contenu TikTok/YouTube branché sur les CTA. Objectif : tout est prêt pour le push recrutement de novembre, après la deadline stage du 31 octobre.

---

## 9. Sécurité, conformité, SEO, performance

- **RGPD** : LLM et embeddings en UE (Mistral), Supabase en région UE, bandeau cookies/consentement pour PostHog, RLS partout.
- **Secrets** : variables d'env dans Vercel et Railway, jamais commitées. `.env.local` en local, ignoré par git.
- **SEO** : SSR/RSC, `next-sitemap`, JSON-LD (Person, Course, Article, SoftwareApplication), métadonnées par page, OG dynamiques.
- **Perf** : Turbopack, images optimisées, cache components Next 16, Web Vitals suivis dans Vercel Analytics.
- **Qualité** : ESLint + Prettier + TypeScript strict, tests des fonctions de calcul carbone (zone à zéro erreur), Sentry en prod.

---

## 10. Ce que TU dois faire toi-même (checklist d'actions)

Ces étapes demandent tes identifiants ou des décisions perso, je ne peux pas les faire à ta place. Fais-les dans cet ordre.

### A. Comptes à créer ou confirmer

1. **GitHub** : crée un repo privé `adama-os`.
2. **Vercel** : connecte le repo (tu l'as déjà).
3. **Railway** : prépare un projet pour `services/engine` (tu l'as déjà).
4. **Supabase** : crée un projet en **région UE** (Frankfurt). Note `Project URL`, `anon key`, `service_role key`.
5. **Mistral** (console.mistral.ai) : crée une clé API. Active la facturation.
6. **Sanity** (sanity.io) : crée un projet, note `projectId` et `dataset`.
7. **Polar** (polar.sh) : crée un compte, vérifie l'organisation, prépare tes produits (formations).
8. **Cal.com** : crée ton type de RDV "Échange recrutement" et récupère le lien d'embed.
9. **Resend** : vérifie ton domaine d'envoi (enregistrements DNS).
10. **PostHog** (région UE), **Sentry**, **Better Stack** : crée les projets, note les clés.
11. **Trigger.dev** : crée un projet, note la clé.
12. **Domaine** : choisis et achète (`adama-os.dev` ou `strata-os.com`). Tu pointeras les DNS vers Vercel.

### B. Fichiers à me fournir

- Ton CV : dépose `CV_AdamaDiallo_RSE.pdf` dans le dossier Adama OS pour que je l'intègre et l'ingère dans le RAG.
- Tes logos de preuve sociale (AFEV, Ministère des Finances) si tu les as en image.
- Les textes sources VSME / ESRS que tu veux dans le RAG dès le départ.

### C. Variables d'environnement (à remplir, je te fournirai le `.env.example`)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Mistral
MISTRAL_API_KEY=
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
# Polar
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
# Resend / PostHog / Sentry / Trigger / GitHub
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
TRIGGER_SECRET_KEY=
GITHUB_TOKEN=
```

### D. Décisions que j'attends de toi

1. **Nom de domaine final** : `adama-os.dev` ou `strata-os.com` (ou autre) ?
2. **Vélocité ou cadrage** : tu veux que je scaffolde maintenant Phase 0 + Phase 1 (le vrai code Next.js dans le dossier), ou tu préfères ajuster ce blueprint d'abord ?
3. **CMS** : tu valides Sanity pour la veille et les cours, ou tu préfères tout en MDX versionné (plus "build in public", moins d'UI d'édition) ?
4. **Paiement** : Polar pour tout (recommandé), ou Polar formations + Stripe pour le SaaS ?

---

## 11. Commandes de démarrage (quand tu valides le scaffold)

Je les lancerai pour toi, mais voici ce qui sera fait, pour ta visibilité :

```bash
# Monorepo
pnpm dlx create-turbo@latest adama-os
cd adama-os

# App web Next.js 16 + Tailwind v4 + shadcn
pnpm dlx create-next-app@latest apps/web --ts --app --tailwind --turbopack
pnpm dlx shadcn@latest init        # style new-york, base color zinc

# Dépendances clés
pnpm add cmdk framer-motion @tremor/react ai @ai-sdk/mistral
pnpm add @supabase/supabase-js drizzle-orm postgres
pnpm add next-intl posthog-js @sentry/nextjs resend

# Studio Sanity
pnpm create sanity@latest -- --template clean --project <id> --dataset production

# Moteur FastAPI
# services/engine : uv init, fastapi, mistralai, supabase, pgvector
```

---

_Prochaine étape recommandée : tu réponds aux 4 décisions de la section 10.D, et je scaffolde directement Phase 0 + Phase 1 dans le dossier, prêt à `pnpm dev`._

---

## Annexe A. Manifeste original (source)

> Document de vision fondateur, conservé tel quel. Le blueprint ci-dessus en est la traduction technique.

### 🌐 LE MANIFESTE : QU'EST-CE QU'ADAMA OS ?

Adama OS n'est pas un site web. C'est un tableau de bord en direct qui rend ton cerveau, ta discipline et tes compétences instantanément observables. C'est l'hybridation totale entre :

1. Un produit SaaS en production.
2. Une documentation d'architecture technique (ADR).
3. Un tracker de performance athlétique et mental.
4. Une machine de conversion pour décrocher un poste d'élite, vendre tes logiciels et écouler tes formations.

### 🛠️ PARTIE 1 : L'ARCHITECTURE TECHNIQUE (Le Moteur)

Puisque tu vas tout construire en vibe coding pour aller vite, voici la stack exacte, pensée pour une vélocité maximale et optimisée pour tourner de manière fluide sur une machine ultra-mobile type Snapdragon X.

**1. La Base de Données & L'Authentification (Supabase)**
C'est le système nerveux central. Tu ne stockes pas que les datas de tes clients, tu stockes tes datas.

- Table `system_metrics` : Stocke tes variables en temps réel (Jours restants avant la fin du M2/Stage, progression de ton lean bulk vers les 80kg, nombre de sessions de foot ou de Deep Work).
- Table `decisions_log` : Un registre (titre, date, catégorie, raisonnement) pour publier tes choix techniques et business.
- Table `strata_analytics` : Remonte automatiquement le nombre de PME analysées via tes outils ou le nombre de requêtes API traitées.

**2. Le Backend & L'Intelligence (FastAPI sur Railway + DeepSeek)**
L'intelligence brute de ton OS.

- FastAPI : Gère la logique lourde, particulièrement l'ingestion des matrices de double matérialité et les calculs de taxonomie.
- Pipeline RAG : Vectorisation de l'intégralité des textes ESRS, du référentiel VSME, de tes cours de master, et de ton CV `"CV_AdamaDiallo_RSE.pdf.pdf"`.
- LLM (DeepSeek) : Branché à ta base vectorielle pour animer `adama.ai`, l'agent conversationnel intégré à ton OS.

**3. Le Frontend (Next.js + Tailwind CSS + Framer Motion sur Vercel)**
L'interface utilisateur pure, rapide et agressive.

- Server-Side Rendering pour un SEO parfait (indispensable pour tes articles de veille).
- Déploiement continu via GitHub. Chaque `git push` met l'OS à jour instantanément.
- Domaine personnalisé routé via Namecheap ou OVH (`adama-os.dev` ou `strata-os.com`).

**4. L'Orchestration (n8n / Make.com)**
Le travail de l'ombre en mode Advanced.

- Scraping automatisé des mises à jour de l'EFRAG ou du GHG Protocol.
- Envoi des textes au LLM pour synthèse automatique.
- Publication instantanée dans la section "Veille" d'Adama OS sans que tu n'aies à taper une seule ligne de texte.

### 🖥️ PARTIE 2 : L'INTERFACE ET LES 4 COUCHES (L'Expérience Visuelle)

Le design est en Dark Mode intégral (Noir carbone, typographie blanche épurée, accents vert émeraude). Le ressenti est celui d'un terminal de vaisseau spatial ou d'un dashboard de monitoring Cloud.

**Couche A : SYSTEM STATUS (L'Observabilité)**
Un panneau latéral fixe (ou un bloc d'en-tête massif).

- Status : `🟢 ONLINE - BUILDING MODE`
- Current Focus : `ESG Optimizer V5 - Sustainability OS`
- Deadline Stage : `31 Octobre 2026 - Compte à rebours [ XX Jours ]` (stage AG2R LA MONDIALE, Grenoble, Data ESG & Solutions IA)
- Physical Engine : `Lean Bulk Progress (71 kg → 80 kg) | Energy Level : Optimal`
- Minimalist Protocol : `Social Media : Locked | Deep Work : Active`

**Couche B : DECISIONS LOG (Le Raisonnement)**
Un flux façon "Timeline" où tu expliques tes choix de développeur et de stratège.

- [24 Juin 2026] ➡️ Transition de Node.js vers FastAPI. Raison : L'écosystème Python offre une scalabilité supérieure pour les algorithmes de calcul carbone (Scopes 1-2-3).
- [15 Juin 2026] ➡️ Architecture RAG vs Fine-Tuning. Raison : Le RAG garantit zéro hallucination sur les textes de loi CSRD et réduit les coûts d'API de 80%.

**Couche C : TRAJECTORY (La Roadmap)**
La transparence totale sur tes chantiers en cours.

- Next Update : Intégration du scoring OTI sur ESG Optimizer.
- Expansion : Lancement de l'architecture pour le marché Afrique de l'Ouest (Cible : Septembre 2026).
- Risques identifiés : Surcharge du scope technique. Solution : Délégation stricte des flux via Make.com.

**Couche D : THE SANDBOX & PROOFS (La Preuve par l'Action)**

- Terminal interactif : Un raccourci clavier (`Ctrl + K`) transforme le site en ligne de commande. Un recruteur peut taper `download cv` ou `ping strata`.
- Widgets en direct : Un mini-simulateur VSME testable directement sur la page.
- Preuve Sociale : Logos des structures accompagnées (AG2R LA MONDIALE, Younivibe, AFEV, Ministère des Finances) et métriques d'ESG Optimizer en production.

### 💰 PARTIE 3 : LA MACHINE DE CONVERSION (Le Tunnel)

L'OS a trois sorties de conversion extrêmement claires pour monétiser ton trafic.

**Sortie 1 : Le Recrutement Stratégique (Le Graal de Novembre 2026)**

- Cible : Directeurs RSE, Cabinets de Conseil, Fonds d'investissement.
- Mécanique : Un bouton persistant `[ Recruter l'Architecte ]` qui ouvre un modal avec ta proposition de valeur hybride, un lien vers ton fichier `"CV_AdamaDiallo_RSE.pdf.pdf"`, et un calendrier Cal.com intégré.

**Sortie 2 : Le Logiciel (STRATA / ESG Optimizer)**

- Cible : PME européennes sous le coup de la CSRD/VSME.
- Mécanique : Mise en avant de tes modules de reporting et d'analyse. Redirection directe vers le SaaS avec un essai gratuit ou un "Audit Express" généré par tes pipelines.

**Sortie 3 : L'Usine à Formations (Le Levier Financier)**
Une section `/learn` structurée en 4 niveaux d'expertise :

1. "CSRD / ESG Automatisé" : La vulgarisation de la réglementation, la double matérialité et la structuration d'un rapport pour les profils métiers.
2. "Automatiser avec l'IA (Niveau Pro)" : Connecter Make/n8n aux API LLM pour détruire la saisie manuelle et les tâches répétitives (ta zone de génie certifiée).
3. "Construire un Agent IA Métier" : Tutoriel hardcore sur la création d'un système RAG (Vector DB, Embeddings, Prompt Engineering) appliqué à un cas métier.
4. "Build in Public : Créer un SaaS de A à Z" : Ton playbook d'entrepreneur. De l'idée au MVP, la stack Next.js/FastAPI, et la méthodologie de livraison inarrêtable.

### 🎥 PARTIE 4 : L'ACQUISITION (Le Média TikTok / YouTube)

Pour remplir ce tunnel, tu vas documenter ton exécution avec une régularité de sportif de haut niveau (comme pour tes 4 séances hebdomadaires).

**La Frappe Rapide (TikTok / Shorts / Reels)**

- Le style : Face caméra direct, écran partagé avec ton éditeur de code ou tes workflows Make. Pas de fioritures, pas de danse. De l'ingénierie et de la valeur.
- Les Hooks : "Arrêtez de lire la CSRD à la main, voici le script Python que j'ai codé pour le faire en 2 minutes", ou "La routine d'un étudiant en Master qui gère un SaaS et prépare une transformation physique".
- Le CTA : "Allez voir le code et les logs sur Adama OS."

**La Masterclass (YouTube Long Format)**

- Le canal : GreenDiadam.
- Le style : Partage d'écran immersif, schémas d'architecture, deep dive réglementaire.
- Les thèmes : "Créer une base vectorielle RSE de zéro", "VSME : Le guide complet pour les PME en 2026".
- Le CTA : "Formations complètes et outils disponibles sur Adama OS."

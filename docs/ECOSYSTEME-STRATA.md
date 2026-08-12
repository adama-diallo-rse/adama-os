# Écosystème IROKO SOFTWARE GROUP : cartographie des produits

> Mis à jour le 19 juillet 2026. Remplace la cartographie du 3 juillet, qui ne connaissait que la suite STRATA.
> Repos du groupe dans l'organisation GitHub `iroko-software-group`. Source de vérité de la structure : `iroko-platform/docs/IROKO-ORG-MAP.md`.
> Adama OS (ce repo) vit sous compte personnel (`adama-diallo-rse/adama-os`), volontairement hors organisation : c'est le cockpit du fondateur, pas un actif du groupe.

## La hiérarchie

```
IROKO SOFTWARE GROUP (holding)
│
├── STRATA (Europe)          Operating System de la Sustainability
├── IROKO (Afrique)          Operating System des entreprises africaines
├── INFRASTRUCTURE           produits développeurs et packages partagés
└── SERVICES                 externalisation B2B et conseil, financent la construction
```

Règle d'organisation : STRATA et IROKO ne fusionnent pas au niveau du code. Ils s'emboîtent au niveau de l'organisation GitHub et de cette carte. Convention de nommage : `strata-*`, `iroko-*`, `iroko-infra-*`.

## Division STRATA (Europe)

| Repo | Produit | Rôle | Stack | État au 19 juillet |
| --- | --- | --- | --- | --- |
| `esg-optimizer` | ESG Optimizer (flagship) | Cockpit unifié du pilotage ESG. Refonte « Sustainability OS » en cours : 8 couches, coffre de preuves immuable, knowledge graph, workflow engine, control tower. Lancement Africa prévu septembre 2026. | Python FastAPI + Next.js, Stripe, Resend, RAG EFRAG | Prod (`esg-optimizer.fr`), refonte en cours, Couche 12 atteinte |
| `strata-scope` | STRATA Scope | Calculateur bilan carbone certifiable PME, Scopes 1-2-3 (15 catégories GHG Protocol), facteurs ADEME Base Empreinte. Moteur de calcul pur, testable, auditable. | FastAPI (moteur pur + tests), Supabase, front Next.js | Prod, paywall Stripe et API publique versionnée livrés, clés cloisonnées par organisation |
| `strata-foundation` | STRATA Foundation | Suite entièrement gratuite, porte d'entrée de l'écosystème : Navigator, Benchmark, Materiality Lite, VSME Builder, Resource Center, ESG Observatory. | Next.js 14 + FastAPI + SQLAlchemy async, Postgres pgvector, Redis, Clerk partagé | Déployé (Vercel + Railway), Vague 1 en cours |
| `strata-watch` | STRATA Watch | Veille réglementaire ESG : agrège EFRAG, EUR-Lex/JOUE, ADEME, AMF, BOFiP. Alertes, résumés IA, calendrier de conformité. | Next.js 14 + FastAPI + Celery/Redis, pgvector, Clerk partagé | Développement avancé, Phase 6 (mode équipe, commentaires, affectation d'alertes) |
| `strata-academy` | STRATA Academy | Couche éducation, acquisition et autorité : formation VSME opérationnelle pour PME francophones, financement OPCO. Cible `academy.strata-esg.fr`. Wedge consacré par Omnibus I. | Extension de l'écosystème STRATA, Stripe | Architecture, schéma SQL et syllabus 6 parcours posés, premier commit |
| `strata-platform` | STRATA (maison-mère) | Site corporate + squelette de la plateforme authentifiée qui chapeaute les produits. Bilingue FR/EN. | Next.js 14, Tailwind (tokens slate/gold/signal), Clerk prévu, Vercel | Site vitrine prêt, auth phase 2 |

## Division IROKO (Afrique)

| Repo | Produit | Rôle | Stack | État |
| --- | --- | --- | --- | --- |
| `iroko-platform` | Business OS | Facturation et encaissement en un clic via Wave et Orange Money, multi-tenant par entreprise. Premier produit du socle Afrique. | Monorepo pnpm + Turborepo, Next.js App Router, Prisma, Supabase, TypeScript strict | Socle en construction, MVP en cours |

À venir dans le même monorepo : RH & Paie, ERP Immobilier, Supply Chain, GovTech, Agritech, Énergie & Eau, Marketplace B2B.

## Division INFRASTRUCTURE

Packages partagés du socle, consommés par les deux divisions produit.

| Package | Rôle |
| --- | --- |
| `@iroko/payments` | Iroko Pay : Wave, Orange Money, Stripe Europe |
| `@iroko/core` | Schéma Prisma multi-tenant + client |
| `@iroko/ui` | Design system (tokens Brand Board + shadcn) |
| `@iroko/auth` | Identité de groupe et contexte de tenant |
| `@iroko/emails`, `@iroko/pdf`, `@iroko/config` | Transactionnel, documents, configuration partagée |

## Division SERVICES

Externalisation B2B (Europe vers Afrique) et Compliance Africa (conseil plus logiciel, pont vers STRATA). Ces activités financent la construction des produits.

## Liens avec Adama OS

Ce que le dashboard consomme, et ce qu'il ne fait surtout pas.

- **Il ne calcule rien.** Le calcul ESG lourd appartient à STRATA Scope et ESG Optimizer. La couche L2 d'Adama OS est fermée, `services/engine` a été supprimé le 13 juillet 2026. Si un chiffre carbone est nécessaire, le dashboard appelle l'API publique versionnée de STRATA Scope en lecture.
- **Il ne fait pas de veille.** C'est STRATA Watch. Le dashboard s'y connectera par un lien tracé quand Watch sera en ligne.
- **Il ne vend rien.** Stripe est sur STRATA Scope et ESG Optimizer, Stripe Tax sur strata-platform. Adama OS n'a pas de checkout.
- **Il affiche l'exécution.** Le feed « Shipped » doit agréger les commits de tous les repos actifs, pas seulement `adama-os` (tâche L5-T2). Aujourd'hui il ne lit qu'un repo sur sept, ce qui sous-représente massivement le travail réel.
- **Il agrège les métriques.** La table `strata_analytics` devient `ecosystem_analytics` avec les colonnes `division` et `product_slug` (tâche L1-T10), alimentée par plusieurs produits.
- **Il pilote un registre.** La table `ecosystem_products` (tâche L1-T9) porte slug, division, statut et URL. Le hub `/ecosysteme` et la Couche D la lisent. Ajouter un produit devient une ligne en base, pas un déploiement.
- **Le simulateur VSME** (L4-T12) réutilise la logique VSME Builder de Foundation, sans dupliquer le scoring d'ESG Optimizer.
- **Auth** : Clerk est partagée entre les produits STRATA. Adama OS reste sur Supabase Auth, usage personnel, pas de besoin de SSO groupe.

# Écosystème STRATA : cartographie des repos

> Mis à jour le 3 juillet 2026. Repos locaux dans `C:\DEV\github-repos\`.
> Adama OS (ce repo) est la vitrine personnelle ; les produits STRATA vivent dans leurs propres repos.

| Repo | Produit | Rôle | Stack | État |
| --- | --- | --- | --- | --- |
| `esg-optimizer` | ESG Optimizer (flagship) | Diagnostic CSRD/VSME, scoring OTI, pilotage auditable. **V5 en cours : refonte "Sustainability OS"** (moteur de centralisation, coffre de preuves immuable, workflows de validation terrain). Lancement Africa prévu septembre 2026. | Python FastAPI + Next.js, Railway, Stripe, Resend, RAG EFRAG | Prod (esg-optimizer.fr), V5 en refonte |
| `strata-platform` | STRATA (maison-mère) | Site corporate + squelette de la plateforme authentifiée qui chapeaute les 6 produits. Bilingue FR/EN. | Next.js 14, Tailwind (tokens slate/gold/signal), Clerk prévu, Vercel | Site vitrine prêt, auth phase 2 |
| `strata-foundation` | STRATA Foundation | Suite gratuite et open source, porte d'entrée de l'écosystème : Navigator, Benchmark, Materiality Lite, VSME Builder, Resource Center, ESG Observatory. | Next.js 14 + FastAPI + SQLAlchemy async, Postgres pgvector, Redis, Clerk partagé | Premiers blocs posés, build in public |
| `strata-scope` | STRATA Scope | Calculateur bilan carbone certifiable PME, Scopes 1-2-3 (15 catégories GHG Protocol), facteurs ADEME Base Empreinte. Moteur de calcul pur, testable, auditable. | FastAPI (moteur pur + tests), SQLite/Supabase, front Next.js à venir | Backend moteur + facteurs OK, front à venir |
| `strata-watch` | STRATA Watch | Veille réglementaire ESG : agrège EFRAG, EUR-Lex/JOUE, ADEME, AMF, BOFiP ; alertes, résumés IA, calendrier de conformité. | Next.js 14 + FastAPI + Celery/Redis, pgvector, Clerk partagé | En développement |
| `strata-academy` | STRATA Academy | Couche éducation, acquisition et autorité : formation VSME opérationnelle pour PME francophones, financement OPCO. Cible `academy.strata-esg.fr`. Wedge consacré par Omnibus I (le VSME devient le plafond officiel de la demande fournisseurs). | Extension de l'écosystème STRATA, Stripe | Architecture + syllabus posés |

## Liens avec Adama OS

- `strata_analytics` (Couche D, Open Metrics) doit à terme être alimentée par les vraies métriques d'ESG Optimizer V5.
- La veille auto d'Adama OS (L5, P2) partage les sources de STRATA Watch (EFRAG, GHG Protocol) : mutualiser le scraping.
- Le simulateur VSME (L4-T12) réutilise la logique VSME Builder de Foundation, sans dupliquer le scoring d'Optimizer.
- Auth Clerk partagée entre produits STRATA ; Adama OS reste sur Supabase Auth (usage perso).

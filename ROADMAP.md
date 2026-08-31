# Adama OS, état du dépôt

> **À jour au 31 août 2026**, vérifié par lecture du code, typecheck, suite de
> tests et build de production, pas par relecture d'une page.
>
> Ce fichier ne décrit QUE le dépôt `adama-os`. La stratégie, les arbitrages de
> périmètre et les prompts par couche vivent dans Notion, page « Roadmap
> d'implémentation, Adama OS (cockpit du fondateur) ». En cas de contradiction
> sur un fait produit, un prix ou une échéance, ce sont les pages de référence
> de Notion qui gagnent.

## Doctrine, ce que ce dépôt fait et ne fait pas

Trois décisions gouvernent le périmètre et ne se rediscutent pas ici.

- **13 juillet 2026, Adama OS est un ATELIER.** Audit, veille et formations ne
  sont pas développés ici. Ils vivent dans leurs propres dépôts. Le cockpit s'y
  connecte par des liens tracés et des lectures d'API.
- **19 juillet 2026, le périmètre est le groupe, pas la suite ESG.** Cockpit du
  fondateur d'un ensemble logiciel à deux continents, pas vitrine d'un produit.
- **7 août 2026, le cockpit consomme, il ne recalcule pas.** Toute donnée
  produit affichée vient d'une API du produit, en lecture seule. Si l'API
  n'existe pas, la métrique n'est pas affichée. Il n'y a pas de troisième voie.

Corollaires, à traiter comme des interdits :

- toute feature produit ajoutée ici est un signal d'alerte ;
- aucun calcul ESG dans ce dépôt (couche L2 fermée, `services/engine` supprimé
  le 13 juillet 2026) ;
- aucun paiement, checkout ou tunnel de vente ;
- **aucune métrique affichée sans source vérifiable.** Un repli codé en dur qui
  simule une donnée est un mensonge, pas une dégradation gracieuse ;
- le design est fait, ne plus y toucher avant P4. Les corrections de contraste
  ne sont pas du design, ce sont des corrections.

## État par couche

| Couche                        | Rôle                                                 | État au 31 août 2026                                                                                                                                                                                                                       |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **L0** Infrastructure         | Monorepo pnpm et Turborepo, Vercel, domaine, hygiène | **Livrée.** `vercel.json` versionné (en-têtes, région cdg1, cron), origine centralisée dans `lib/site.ts`, domaine `adamesg-os.fr`, `.gitattributes` et `*.tsbuildinfo` ignorés. Reste le branchement DNS, geste manuel.                   |
| **L1** Données                | Supabase UE, Drizzle, pgvector, RLS                  | **Livrée.** 3 migrations. `ecosystem_products` (0001), `ecosystem_analytics` avec provenance et vue de compatibilité (0002). Dettes résorbées : `audit_requests` tranchée, enum `lead_source` aligné.                                      |
| **L2** Moteur                 | Calcul ESG lourd                                     | **Fermée. Aucun développement autorisé.**                                                                                                                                                                                                  |
| **L3** Intelligence           | RAG, adama.ai                                        | **Chaîne complète et durcie.** Un incident de retrieval fait échouer la réponse au lieu de générer sans source. `rag:verify` sort en code 1 si une question ne trouve pas de source. **Reste : déposer et ingérer le corpus.**             |
| **L4** Interface              | Next.js 16, Tailwind v4, quatre couches, Ctrl+K      | **Livrée.** Couche D en vue groupe, lue en base, groupée par division, sans repli chiffré. Preuve sociale conservée au premier plan.                                                                                                       |
| **L5** Contenu et preuve      | Feed Shipped, Open Metrics                           | **Livrée.** Feed multi-dépôts, cache, dégradation par dépôt, filtrage du bruit. **Reste : poser le jeton GitHub à trois périmètres.**                                                                                                      |
| **L6** Conversion             | Sortie recrutement, sorties produits                 | **Livrée.** `/ecosysteme` lue en base, redirection permanente depuis `/strata`, événement `ecosystem_outbound` en double émission jusqu'au 30 septembre 2026. Sortie recrutement inchangée.                                                |
| **L7** Acquisition            | OG dynamiques, UTM                                   | **Partielle.** Gabarit OG commun et trois images générées, convention UTM posée en un seul endroit. Calendrier éditorial et angles narratifs : travail de contenu, hors dépôt, P4.                                                         |
| **L8** Qualité, SEO, sécurité | TS strict, Sentry, PostHog, SEO, a11y                | **Presque complète.** JSON-LD Person, WebSite, Organization et SoftwareApplication ; sitemap à jour ; garde-fou de débit sur `/api/chat` ; contraste WCAG AA corrigé. **Reste : les funnels PostHog (geste manuel) et le bilingue L8-T8.** |
| **L9** Passerelles écosystème | Lecture seule des API produit                        | **Livrée pour ce que les produits exposent.** Client générique, modèle de métrique avec provenance obligatoire, deux sondes branchées sur `GET /health`, historisation par cron quotidien, mode dégradé.                                   |
| **L10** Conformité            | Article 50, RGPD, marquage machine                   | **Livrée.** Mention de traitement automatisé verrouillée par test, `/mentions-legales`, `/confidentialite`, note de préparation au marquage machine, preuve de purge du consentement.                                                      |
| **L11** Tests                 | Filet minimal                                        | **Livrée.** Vitest, 53 tests verts, 6 tests d'intégration désactivés par défaut. Pas de CI : le quota GitHub Actions est épuisé, les tests se lancent en local.                                                                            |
| **L12** Continuité            | Sauvegarde, secrets, reprise                         | **Livrée, sauf le test de restauration.** Politique en une page, script d'export, inventaire des secrets, note de reprise.                                                                                                                 |

## Ce qui reste

Rien de tout cela n'est du code. Ce sont des gestes à faire dans une interface
tierce, listés dans l'ordre de ce qu'ils débloquent.

1. **Brancher le DNS de `adamesg-os.fr`** sur Vercel et poser
   `NEXT_PUBLIC_SITE_URL` en Production seule. Débloque tout partage externe.
2. **Passer les migrations 0001 puis 0002** dans Supabase, puis le seed produits.
3. **Déposer le corpus dans `corpus/`, l'ingérer, puis `rag:verify`.** Débloque
   toute démonstration d'adama.ai.
4. **Créer le jeton GitHub fine-grained** sur les trois périmètres et le poser
   en variable Vercel. Sans lui, le feed n'affiche que les dépôts publics.
5. **Configurer les deux funnels PostHog.** Les événements sont déjà émis.
6. **Faire le premier test de restauration** et dater la ligne dans
   `docs/CONTINUITE.md`.

## Dépendances critiques

- migration 0001 avant 0002, et les deux avant tout déploiement, sinon la
  Couche D et `/ecosysteme` affichent leur état vide ;
- `NEXT_PUBLIC_SITE_URL` avant tout partage externe ;
- jeton GitHub à trois périmètres avant que le feed ne prouve quoi que ce soit ;
- ingestion du corpus avant toute démonstration d'adama.ai ;
- une route publique de lecture côté produit avant toute nouvelle métrique
  produit affichée. Les contrats d'API ne se devinent pas, voir la règle de
  tenue en tête de `apps/web/lib/ecosystem/gateways.ts`.

## Vérifier l'état du dépôt

```powershell
pnpm install
pnpm --filter @adama/web type-check   # 0 erreur attendue
pnpm --filter @adama/web test         # 53 tests verts, 6 ignorés
pnpm --filter @adama/web build        # build de production
pnpm --filter @adama/db rag:verify    # après ingestion du corpus
```

Les six tests ignorés sont les tests d'intégration base de données. Ils ne
s'exécutent qu'avec `ADAMA_TEST_DB=1` et une base de test, jamais contre la
production.

## Règle de tenue de ce fichier

Ce fichier est dérivé du code, pas d'une page. À chaque fin de phase : relire
le code, relancer les quatre commandes ci-dessus, puis reprendre le tableau.
Ne jamais déduire l'avancement d'une tâche d'un document.

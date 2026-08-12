# ROADMAP, ADAMA OS

> **Fichier dérivé, ne pas éditer à la main.** La source de vérité est la page
> Notion « Roadmap d'implémentation, Adama OS (cockpit du fondateur) » :
> https://app.notion.com/p/3a2455fe99dd81bebf01d1d08e2fa0b7
>
> Ce fichier en est une copie générée le 12 août 2026. Toute modification se
> fait dans la page, puis on régénère ce fichier. Jamais l'inverse.
> Compagnon historique : `ADAMA_OS_BLUEPRINT.md`, conservé comme trace de la
> conception initiale et marqué comme non valide.

---

> **Statut : À JOUR au 7 août 2026.** Roadmap globale du cockpit Adama OS, couche par couche, avec un prompt expert par couche prêt à coller dans Claude Code.
> Vérifiée le 7 août 2026 par lecture directe du code de `C:\Dev\adama-os` et des onze autres dépôts de `C:\Dev`. Aucun statut de cette page n'est déduit d'une autre page.
> Dépôt `adama-diallo-rse/adama-os`, hors organisation, volontairement. Rédigée le 24 juin 2026. Mises à jour : 13 juillet (recentrage atelier), 19 juillet (recentrage groupe), **7 août (audit code, vague 0 de dégel, ouverture des couches L9 à L12)**.
> Règle cardinale héritée de l'espace STRATA : ne jamais déduire l'avancement d'une page, lire le code.
## 0. Ce que l'audit du 7 août a corrigé
Quatre constats changent la lecture de tout ce qui suit.
**1. Le dépôt est gelé depuis le 13 juillet, pas depuis le 19.** Dernier commit `56d1f7c`, 13 juillet 2026. Les 99 fichiers en attente sont un trompe-l'oeil : `git diff --stat --ignore-cr-at-eol` ne remonte que 10 fichiers réels, tous de la documentation. Les 88 autres sont du bruit de fin de ligne, le dépôt est commité en CRLF et le working tree est passé en LF, sans `.gitattributes`. **Aucun fichier ****`.ts`**** ou ****`.tsx`**** n'a de modification de contenu depuis le 13 juillet.**
**2. La phrase « P2 livrée à 85 pour cent, en avance sur sa fenêtre » n'est plus vraie.** La fenêtre P2 court du 4 au 31 août, nous sommes le 7, et aucune des deux tâches P2 issues du recentrage du 19 juillet (L5-T2 feed multi-repo, L4-T14 Couche D groupe) n'a une ligne de code. Le décompte réel du fichier `ROADMAP.md` est 48 cases cochées, 20 ouvertes, 1 en cours.
**3. Le dashboard peut afficher un chiffre faux.** `apps/web/components/layer-d.tsx:14-18` définit un `FALLBACK_METRICS` qui affiche `docs_rag: 340` dès que la table `strata_analytics` est vide, alors que la base vectorielle contient zéro document. Un recruteur qui pose la question tombe sur une preuve qui n'existe pas. C'est le seul défaut de la liste qui coûte de la crédibilité au lieu de coûter du temps.
**4. Le hub ****`/strata`**** est factuellement faux sur six lignes sur huit.** Il donne Foundation et Watch « à venir Q3 2026 » alors que leur code est livré, il invente trois produits qui n'existent nulle part sur le disque (STRATA Due, STRATA Taxonomy, GreenHR) et il ignore complètement la branche Afrique. Les produits sont un tableau en dur, `apps/web/app/strata/page.tsx:29-86`.
À cela s'ajoute le contexte de l'espace : le décalage à trois étages posé par la Revue d'ensemble du 4 août vaut aussi ici, à ceci près que pour Adama OS l'ordre est inversé. **Notion est en avance sur le code, et le code est en avance sur ce que le dashboard montre.**
## 1. Doctrine, ce que ce dépôt fait et ne fait pas
Trois décisions gouvernent le périmètre et ne se rediscutent pas dans cette roadmap.
**13 juillet 2026, Adama OS est un ATELIER.** Les modules audit, veille et formations ne sont pas développés ici. Ce sont des produits qui vivent dans leurs propres dépôts. Adama OS s'y connecte par des liens tracés et par des lectures d'API.
**19 juillet 2026, le périmètre est le groupe, pas la suite ESG.** Adama OS est le cockpit du fondateur d'un ensemble logiciel à deux continents, pas la vitrine d'ESG Optimizer. Changement de narration, pas de stack. Aucune couche technique n'est jetée.
**7 août 2026, le cockpit consomme, il ne recalcule pas.** Toute donnée produit affichée ici vient d'une API du produit concerné, en lecture seule. Si l'API n'existe pas, la métrique n'est pas affichée. Il n'y a pas de troisième voie.
Corollaires, à traiter comme des interdits :
- **Toute feature produit ajoutée ici est un signal d'alerte.** Adama OS ne développe aucun produit, il les affiche.
- **Aucun calcul ESG dans ce dépôt.** La couche L2 est fermée, `services/engine` a été supprimé le 13 juillet pour cette raison.
- **Aucun paiement, checkout ou tunnel de vente.** La monétisation appartient aux produits.
- **Aucune métrique affichée sans source vérifiable.** Un repli codé en dur qui simule une donnée est un mensonge, pas une dégradation gracieuse.
- **Le design est fait. Ne plus y toucher avant P4.**
## 2. Périmètre et sources de vérité
Ce document ne recopie plus l'état des produits du groupe. Le tableau qui figurait ici au 31 juillet a divergé en sept jours et faisait doublon avec trois pages. Il est remplacé par des renvois.
| Question | Page qui fait foi |
| --- | --- |
| État réel d'un produit du groupe | Hub STRATA, et Roadmap suite STRATA société produits et distribution (RÉFÉRENCE VISION) |
| Avancement du cockpit ESG Optimizer | Roadmap d'implémentation Cockpit ESG Optimizer et suite STRATA, tableau d'audit uniquement |
| Prix, plans, entitlements | Grille tarifaire canonique ESG Optimizer (RÉFÉRENCE PRIX). Ne recopier aucun chiffre. |
| Échéances légales, fiscales et de marque | Feuille de route administrative août à décembre 2026 |
| Écarts entre Notion et le code | Audit croisé du 4 août 2026, dossier complet |
| Chantiers, incidents, arbitrages en attente | Hub Chantiers techniques |
| Branche Afrique | Roadmap Afrique écosystème STRATA, et hub Branche Afrique |
**Règle d'arbitrage.** En cas de contradiction entre cette page et une des pages ci-dessus sur un fait produit, ce sont elles qui gagnent et cette page doit être reprise. Cette page ne fait foi que sur un seul objet : le dépôt `adama-os`.
**Deux points de vocabulaire à tenir dans le cockpit.**
1. **L'architecture des noms de marque n'est pas tranchée au 7 août 2026.** Elle est identifiée comme l'une des trois décisions qui bloquent plus que tout le code restant, et sa fenêtre utile se ferme le 14 août à cause de la recherche d'antériorité et du bon du fonds PME européen. Conséquence directe ici : **ne pas acheter ni configurer le domaine du cockpit sur un nom de groupe non arrêté.** Le domaine d'Adama OS est un nom personnel, il est indépendant de cet arbitrage, c'est ce qui permet de le poser tout de suite.
2. **Le garde-fou « aucune mention d'IA côté client » est amendé depuis le 2 août 2026.** L'article 50 impose la mention du traitement automatisé. Sur `adama.ai`, la mention est obligatoire, elle n'est plus interdite. Voir couche L10.
## 3. État réel du dépôt au 7 août 2026
Lu dans le code, chemins exacts.
| Objet | Ce qui est vrai |
| --- | --- |
| Dernier commit | `56d1f7c`, 13 juillet 2026. Branche `main`. 100 fichiers suivis. |
| En attente | 10 diffs réels (`ROADMAP.md` +636 lignes, `ADAMA_OS_BLUEPRINT.md`, `README.md`, 4 fichiers `docs/`, `.gitignore`, `.prettierignore`, `next-env.d.ts`) plus `docs/PLAN-ACTION.md` non suivi. Le reste est du CRLF. |
| Origine du site | `https://adama-os-web.vercel.app` en dur à trois endroits : `app/sitemap.ts:7`, `app/robots.ts:11`, `app/layout.tsx:12`. `NEXT_PUBLIC_SITE_URL` n'existe nulle part dans le code. |
| Base de données | 7 tables Drizzle, 8 tables en SQL (`audit_requests` est orpheline, en base, absente de `schema.ts`, plus aucun code ne la touche). Migration unique `0000_init.sql`, 238 lignes, idempotente, 17 policies RLS, index HNSW cosine. |
| Divergence de schéma | Enum `lead_source` : `('recruiter','audit','newsletter')` en SQL, `["recruiter"]` en Drizzle. |
| Corpus RAG | Inexistant. Aucun dossier `corpus/`, aucun PDF hors le CV de téléchargement. La chaîne d'ingestion est écrite et sérieuse, elle n'a rien à manger. |
| Stack d'interface réelle | Ni shadcn/ui, ni Tremor, ni Radix, ni lucide. `packages/ui` contient 3 composants écrits à la main sur `clsx` et `tailwind-merge`. Tokens en hexadécimal, pas en OKLCH : fond `#0d1b2a` bleu nuit, accent `#2affd6` cyan. La description « noir carbone et émeraude » du fichier `ROADMAP.md` est fausse. |
| Feed Shipped | Un seul dépôt, `adama-diallo-rse/adama-os`, constantes dans `components/types.ts`. Affiche donc un dernier commit du 13 juillet. |
| Événements PostHog | 7 sites d'appel. `strata_outbound` (`outbound-link.tsx:30` avec `produit` et `source`, `terminal.tsx:126`), plus 5 événements recruteur. Aucun `ecosystem_outbound`. |
| Observabilité | Sentry sur 4 fichiers, PostHog UE avec file d'attente et consentement, Better Stack avec repli sur `system_metrics`. Solide. |
| Tests | **Zéro.** Aucun fichier de test, aucune dépendance Vitest, Jest ou Playwright, aucune tâche `test` dans `turbo.json`. |
| Internationalisation | `next-intl` totalement absent. `lang="fr"` figé dans `app/layout.tsx`. |
| Configuration Vercel | Aucun `vercel.json`. Toute la configuration vit dans le tableau de bord, non versionnée. |
### Les dépôts que le cockpit devrait montrer
Relevé le 7 août 2026, avec la date du dernier commit. C'est la matière de la couche L5.
| Dépôt | Compte GitHub | Dernier commit |
| --- | --- | --- |
| esg-optimizer | iroko-software-group | **7 août 2026**, 462 commits, branche `chantier-promesses-II` |
| strata-scope | **adama-diallo-rse** (compte personnel) | 6 août 2026, 63 commits |
| strata-platform | iroko-software-group | 31 juillet 2026, 24 commits |
| strata-foundation | iroko-software-group | 29 juillet 2026, 17 commits |
| strata-esg-academy | iroko-software-group | 29 juillet 2026, 3 commits |
| iroko-platform | iroko-software-group | 28 juillet 2026, 26 commits |
| strata-watch | iroko-software-group | 24 juillet 2026, 6 commits, message « Phase 8 » |
| adama-os | **adama-diallo-rse** (compte personnel) | 13 juillet 2026 |
**Conséquence opérationnelle.** Le jeton GitHub du feed doit couvrir **trois périmètres**, pas un : l'organisation `iroko-software-group`, le compte personnel `adama-diallo-rse`, et l'ancienne organisation `strata-esg` si le dépôt Academy qui y reste doit être lu. Un jeton fine-grained limité à l'organisation ne verra ni Scope ni le cockpit lui-même.
## 4. Les couches, état réel
Neuf couches historiques, quatre couches nouvelles ouvertes le 7 août. La numérotation existante n'est pas touchée, pour que les identifiants de tâches déjà écrits restent valides.
| Couche | Rôle | État au 7 août 2026 |
| --- | --- | --- |
| **L0 Infrastructure et dépôt** | Monorepo pnpm et Turborepo, Vercel, déploiement continu, domaine, hygiène du dépôt | Déploiement continu opérationnel. Manque le domaine (L0-T6), le `.gitattributes`, la centralisation de l'origine et un `vercel.json` versionné. |
| **L1 Données** | Supabase UE, Drizzle, pgvector, RLS | Socle solide et testé en usage. Restent le registre produits (L1-T9), le renommage analytics (L1-T10) et deux dettes de schéma. |
| **L2 Moteur** | Calcul ESG lourd | **Couche fermée. Aucun développement autorisé.** |
| **L3 Intelligence** | RAG et [adama.ai](http://adama.ai) | Chaîne complète, propre, idempotente. Base vectorielle vide et corpus absent du disque. L'agent est fonctionnel et muet. |
| **L4 Interface** | Next.js 16, Tailwind v4, quatre couches, Ctrl+K | Complet et abouti. Deux dettes : le repli chiffré de la Couche D, et la Couche D en vue groupe (L4-T14). |
| **L5 Contenu et preuve** | Feed Shipped, Open Metrics | Livré mais lit un dépôt sur huit, et c'est le seul qui ne bouge plus. Plus gros écart entre l'exécution réelle et ce qui est montré. |
| **L6 Conversion** | Sortie recrutement, sorties produits tracées | Sortie recrutement livrée et efficace. Hub produits en dur et faux sur six lignes sur huit. |
| **L7 Acquisition et média** | OG dynamiques, UTM, calendrier éditorial | Rien de commencé. Normal, c'est du P4. |
| **L8 Qualité et observabilité** | TS strict, Sentry, PostHog, Better Stack, SEO | Base en place et bien faite. Restent funnels, bilingue, JSON-LD organisation, audits a11y, perf et sécurité. |
| **L9 Passerelles écosystème** (nouvelle) | Lecture seule des API des produits pour alimenter le cockpit | **Zéro.** Les API existent désormais côté produits, le cockpit ne les consomme pas. |
| **L10 Conformité et transparence** (nouvelle) | Article 50, marquage des contenus générés, RGPD, mentions légales | Bandeau de consentement en place, tout le reste absent. Échéance dure au 2 décembre 2026. |
| **L11 Tests et fiabilité** (nouvelle) | Filet minimal sur ce qui casse en silence | **Zéro test dans le dépôt.** Une régression sur le retrieval ou sur la RLS passerait inaperçue jusqu'à la démo. |
| **L12 Continuité** (nouvelle) | Sauvegarde, secrets, accès de secours du périmètre adama-os | Aucune politique de sauvegarde, aucun test de restauration. Même angle mort que celui relevé le 4 août sur la base de production. |
### Pourquoi ces quatre couches et pas d'autres
Elles ne sont pas ajoutées pour faire nombre. Chacune ferme un écart constaté dans le code, et aucune ne duplique un chantier de l'espace STRATA.
- **L9** existe parce que la matière est apparue de l'autre côté. STRATA Scope expose `POST /v1/ecosystem/push` et `POST /v1/ecosystem/webhook` depuis le 31 juillet, et l'ordonnanceur livré le 7 août expose l'état d'exécution des tâches. Le cockpit peut enfin afficher des chiffres produits sourcés au lieu de chiffres saisis. Sans cette couche, la doctrine du point 1.3 reste une intention.
- **L10** existe parce que l'obligation a changé le 2 août et que l'échéance du 2 décembre est datée, opposable, et déclarée non préparée dans l'espace. Le cockpit héberge un agent conversationnel et produira des images OG générées, il est dans le périmètre.
- **L11** existe parce que le dépôt le plus visible du parc est le seul sans aucun test, alors que les autres dépôts en comptent des milliers. C'est une asymétrie difficile à défendre devant un lecteur technique.
- **L12** existe parce que le cockpit porte sa propre base Supabase, distincte de celle des produits, et qu'elle n'est couverte par aucune des mesures discutées ailleurs.
## 5. Vagues et calendrier révisé
| Vague | Fenêtre | Contenu | Statut |
| --- | --- | --- | --- |
| **P0 Fondations** | 24 juin au 6 juillet | Squelette en ligne | Livrée sauf L0-T6 |
| **P1 Vitrine recrutement** | 7 juillet au 3 août | Dashboard envoyable à un recruteur | Livrée |
| **Vague 0, dégel** | **7 au 13 août** | Rendre le dépôt commitable et le dashboard honnête | **À faire maintenant** |
| **P2 Intelligence, solde** | 14 au 31 août | L3-T1 corpus, L5-T2 feed multi-repo, L4-T14 Couche D groupe, L8-T7 funnels | Bloquée par la vague 0 |
| **P3 Écosystème et sorties** | 1er au 28 septembre | L1-T9, L1-T10, L6-T13, L6-T14, première passerelle L9 | À venir |
| **P4 Durcissement et média** | 29 septembre au 30 octobre | L7 complet, L8-T8 à T12, L11 tests | À venir |
| **P5 Conformité et continuité** | 2 au 30 novembre | L10, L12, en parallèle du push recrutement | À venir |
| **Marquage machine** | avant le 2 décembre | Obligation datée, à cadrer en octobre au plus tard | Non commencé |
**Pourquoi P3 ne s'appelle plus « Monétisation ».** Le tunnel de vente appartient aux produits, pas au cockpit. Cette correction date du 19 juillet et tient.
## 6. Vague 0, dégel du dépôt
Six gestes, dans cet ordre. Aucun ne demande de réflexion, tous débloquent le reste. C'est un travail d'une demi-journée qui conditionne tout le mois d'août.
1. **Poser ****`.gitattributes`**** avec ****`* text=auto eol=lf`****, puis renormaliser.** Sans ce geste, tout `git add .` produit un commit de 98 fichiers illisible, et la revue de code devient impossible. La procédure exacte est déjà écrite dans `docs/PLAN-ACTION.md`, étape 6, elle n'a jamais été appliquée.
2. **Commiter les 10 fichiers de documentation réels**, en trois commits séparés : documentation de roadmap, documentation d'infrastructure, plan d'action. Ne pas les noyer dans la renormalisation.
3. **Retirer ****`FALLBACK_METRICS`**** de ****`layer-d.tsx`****.** Une carte vide qui dit « donnée non disponible » vaut mieux qu'un `docs_rag: 340` que rien ne justifie. C'est le seul geste de la liste qui protège la crédibilité.
4. **Centraliser l'origine du site dans ****`NEXT_PUBLIC_SITE_URL`** et retirer les trois occurrences en dur. Prépare L0-T6 sans le bloquer.
5. **Poser le domaine propre (L0-T6).** Nom personnel, indépendant de l'arbitrage de marque en cours. Une URL `.vercel.app` détruit une grande partie de l'effet auprès d'un recruteur.
6. **Régénérer ****`ROADMAP.md`**** depuis cette page**, et non l'inverse. Le fichier a divergé, il décrit une stack qui n'est pas installée. Ajouter en tête de `ADAMA_OS_BLUEPRINT.md` un renvoi vers cette page, le fichier porte déjà un avertissement de non validité.
## 7. Dépendances critiques
- **`.gitattributes`**** avant tout commit.** Sinon le premier commit de la reprise est un mur de 98 fichiers.
- **L0-T6 domaine avant tout partage externe.**
- **Retrait du repli chiffré avant toute démo.** Une seule question de recruteur sur les 340 documents suffit.
- **L1 avant L4.** Les couches d'interface lisent la base.
- **L1-T9 registre produits avant L6-T13 hub écosystème.** Le hub lit la table, sinon on recode un tableau en dur pour la deuxième fois.
- **L3-T1 ingestion avant toute démonstration d'**[**adama.ai**](http://adama.ai)**.**
- **L9 passerelles avant toute nouvelle métrique produit affichée.** Sinon on ressaisit à la main ce que les produits exposent déjà.
- **Jeton GitHub à trois périmètres avant L5-T2.** Un jeton limité à l'organisation ne verra pas `strata-scope`.
## 8. Risques et parades
| Risque | Parade |
| --- | --- |
| Le dépôt reste dormant et P2 se termine sans progression | Vague 0 en une demi-journée. Le blocage n'est pas la charge de travail, c'est l'état illisible du `git status`. |
| Le dashboard affiche une preuve qu'il ne peut pas justifier | Retrait du repli chiffré, geste 3 de la vague 0. Puis règle permanente : aucune métrique sans source. |
| Le dashboard sous-vend massivement l'exécution réelle | L5-T2. 462 commits sur ESG Optimizer contre 8 affichés sur un dépôt gelé, c'est l'écart le plus coûteux du dossier. |
| Le hub produits envoie un recruteur sur une information fausse | L6-T13, alimenté par L1-T9. En attendant, retirer les trois produits qui n'existent pas. |
| Dispersion sur huit dépôts | Adama OS ne développe aucun produit. Toute feature produit ici est un signal d'alerte. |
| Domaine posé sur un nom de marque non arrêté | Nom personnel pour le cockpit. L'arbitrage de marque du 14 août ne le concerne pas. |
| Régression silencieuse sur le retrieval ou la RLS | L11, filet minimal. Trois tests suffisent à couvrir ce qui casse vraiment. |
| Perte de la base du cockpit | L12. Le cockpit a sa propre base Supabase, elle n'est couverte par aucune mesure prise ailleurs. |
| Confusion de marque entre le cockpit, la société et les produits | Hiérarchie lisible en cinq secondes sur la page d'accueil. |
| Perfectionnisme sur le design | Le design est fait. Ne plus y toucher avant P4. |
## 9. Ce qui reste à la main d'Adama, hors code
Aucun de ces points ne peut être fait par un agent. Ils sont classés par ce qu'ils débloquent.
1. **Acheter le domaine et poser les enregistrements DNS chez le registrar**, puis l'ajouter dans le projet Vercel et choisir la redirection canonique. Débloque L0-T6, donc tout partage externe.
2. **Créer un jeton GitHub fine-grained en lecture seule couvrant les trois périmètres** (`iroko-software-group`, `adama-diallo-rse`, et `strata-esg` si besoin), et le poser en variable Vercel. Débloque L5-T2.
3. **Configurer les deux funnels dans l'interface PostHog.** Les événements sont déjà émis, il n'y a rien à coder. Débloque L8-T7.
4. **Rassembler les fichiers du corpus RAG dans un dossier** avant l'ingestion : normes ESRS, standard VSME, CV, notice méthodologique. Aucun n'est aujourd'hui sur le disque du dépôt. Débloque L3-T1.
5. **Trancher l'architecture des noms de marque avant le 14 août.** Ne bloque pas le cockpit, bloque tout le reste de l'espace.
6. **Décider si le dépôt ****`adama-os`**** reste sur le compte personnel.** Choix défendable, mais il a une conséquence technique sur la portée du jeton GitHub, et une conséquence de lecture pour un recruteur qui regarde l'organisation.
## 10. Prompts experts, couche par couche
Un prompt par couche, prêt à coller dans Claude Code depuis la racine `adama-os`. Chacun est autonome : il rappelle l'état réel vérifié le 7 août, cadre le périmètre, et interdit explicitement ce qui ne doit pas être fait.
**Règles communes à coller en tête si le contexte est perdu.** TypeScript strict. Aucun secret en dur. Aucun marqueur d'IA ni tiret long dans le code et dans les textes produits. Français par défaut. Aucune duplication de logique appartenant à un produit du groupe. Aucune métrique affichée sans source vérifiable. Ne jamais déduire l'état d'une tâche d'un fichier de documentation, lire le code.
### Vague 0, dégel du dépôt
```javascript
Contexte : le dépôt adama-os est gelé depuis le commit 56d1f7c du 13 juillet 2026.
git status affiche 99 fichiers, mais git diff --stat --ignore-cr-at-eol n'en
remonte que 10. Les 88 autres sont du bruit de fin de ligne : le dépôt est
commité en CRLF, le working tree est en LF, et il n'y a pas de .gitattributes.
Aucun fichier .ts ou .tsx n'a de modification de contenu.

Objectif : rendre le dépôt commitable et le dashboard honnête, en une session.

1. Créer .gitattributes à la racine avec `* text=auto eol=lf` et les exclusions
   binaires nécessaires (pdf, png, svg, ico, woff2). Donner ensuite la séquence
   exacte de renormalisation (git add --renormalize .) et le message de commit à
   utiliser, isolé, sans aucun autre changement dedans.
2. Répartir les 10 diffs réels en trois commits thématiques : documentation de
   roadmap (ROADMAP.md, ADAMA_OS_BLUEPRINT.md), documentation d'infrastructure
   (README.md, docs/SECRETS.md, docs/PHASE-0-SETUP.md, docs/PHASE-0-L1-DONNEES.md,
   docs/ECOSYSTEME-STRATA.md), hygiène (.gitignore, .prettierignore). Ajouter
   docs/PLAN-ACTION.md, non suivi. Ignorer apps/web/next-env.d.ts, il est généré.
3. Supprimer FALLBACK_METRICS dans apps/web/components/layer-d.tsx (lignes 14 à
   18, utilisé ligne 32). Quand strata_analytics est vide, la Couche D doit
   afficher un état "donnée non disponible" explicite, pas des chiffres inventés.
   Le repli actuel annonce docs_rag: 340 alors que la base vectorielle est vide.
4. Introduire NEXT_PUBLIC_SITE_URL et remplacer les trois occurrences en dur de
   https://adama-os-web.vercel.app : app/sitemap.ts ligne 7, app/robots.ts ligne
   11, app/layout.tsx ligne 12 (metadataBase et JSON-LD). Prévoir un repli sur
   VERCEL_URL en preview. Ajouter la variable aux deux .env.example.
5. Régénérer ROADMAP.md à partir de l'état réel du code, pas de l'ancien fichier.
   Corriger en particulier la description de la stack L4 : il n'y a ni shadcn/ui,
   ni Tremor, ni Radix, ni lucide, et les tokens sont en hexadécimal (#0d1b2a,
   #2affd6), pas en OKLCH.

Interdits : ne pas faire un seul commit fourre-tout. Ne pas modifier de logique
applicative en même temps que la renormalisation. Ne pas toucher aux composants
autres que layer-d.tsx.

Livrable : le fichier .gitattributes, la séquence de commandes git exacte dans
l'ordre, les diffs des points 3 et 4, et le nouveau ROADMAP.md.
```
### Couche L0, Infrastructure et dépôt
```javascript
Contexte : monorepo pnpm et Turborepo, apps/web en Next.js 16 sur Vercel,
déploiement continu sur main avec preview deploys sur PR. services/engine a été
supprimé le 13 juillet 2026, la suppression est effective sur le disque.
turbo.json déclare build, dev, lint, type-check, et aucune tâche test.
Il n'existe aucun vercel.json : toute la configuration vit dans le tableau de
bord et n'est pas versionnée.

Tâche L0-T6, mise en ligne sur domaine propre, et durcissement de l'infra.

1. Vérifier que NEXT_PUBLIC_SITE_URL est bien la seule source de l'origine du
   site après la vague 0, et qu'aucune URL vercel.app ne subsiste, y compris dans
   les métadonnées Open Graph, le JSON-LD et opengraph-image.tsx.
2. Lister précisément les enregistrements DNS à créer chez le registrar pour
   pointer sur Vercel (apex et www), et la redirection canonique à retenir.
   Le domaine est un nom personnel, il ne dépend pas de l'arbitrage de marque
   du groupe en cours : ne pas proposer de nom de société.
3. Créer un vercel.json versionné : en-têtes de sécurité (Strict-Transport-
   Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy),
   région d'exécution en Europe, et redirections. Ne pas y dupliquer ce que
   next.config.ts fait déjà.
4. Ajouter une tâche test dans turbo.json, même sans test encore écrit, pour que
   la couche L11 puisse s'y brancher sans retoucher le pipeline.
5. Nettoyer le README : il a déjà été corrigé en local mais n'est pas commité,
   vérifier qu'il ne décrit plus services/engine ni Railway.

Interdits : ne pas réintroduire de service Python. Ne pas ajouter de dépendance
d'infrastructure nouvelle. Ne pas migrer d'hébergeur.

Livrable : un diff, le vercel.json, et la liste exacte des actions manuelles à
faire dans le registrar et dans le tableau de bord Vercel, dans l'ordre.
```
### Couche L1, Données
```javascript
Contexte vérifié le 7 août 2026 : Supabase Postgres en région UE, Drizzle dans
packages/db, pgvector actif. packages/db/src/schema.ts déclare 7 tables
(system_metrics, decisions_log, trajectory, strata_analytics, leads,
rag_documents, rag_chunks). La migration unique packages/db/migrations/
0000_init.sql en crée 8, elle est idempotente, pose 17 policies RLS et un index
HNSW en vector_cosine_ops. Le seed packages/db/src/seed.ts est idempotent.

Deux dettes existent et doivent être traitées dans la même passe :
- audit_requests est créée en SQL avec ses policies, absente de schema.ts, et
  plus aucun code applicatif ne la touche depuis le recentrage du 13 juillet.
- L'enum lead_source vaut ('recruiter','audit','newsletter') en SQL contre
  ["recruiter"] en Drizzle.

Tâches L1-T9 et L1-T10, plus assainissement.

1. Créer la table ecosystem_products : slug unique, nom, division (enum), statut
   (enum prod | deploye | developpement | architecture), url nullable,
   description courte, repo_full_name (pour la couche L5), ordre d'affichage,
   timestamps. RLS : lecture publique anon, écriture réservée au service role.
2. Renommer strata_analytics en ecosystem_analytics, ajouter division et
   product_slug en clé étrangère vers ecosystem_products, et fournir une vue de
   compatibilité strata_analytics en lecture pour ne rien casser pendant la
   transition. Prévoir sa date de retrait.
3. Trancher audit_requests : soit la modéliser dans schema.ts si elle doit
   revivre, soit écrire une migration de suppression avec ses policies. Ne pas
   la laisser dans cet état. Recommander une option et la justifier.
4. Aligner l'enum lead_source entre SQL et Drizzle, dans le sens qui ne casse
   pas les données existantes.
5. Écrire la migration Drizzle 0001 et mettre à jour le seed. IMPORTANT : ne
   pas inventer les statuts produits. Le seed doit lire les valeurs depuis un
   fichier de données séparé (packages/db/src/data/ecosystem.ts) que l'humain
   remplit, avec un commentaire renvoyant vers le hub STRATA comme source. Un
   statut faux en base est pire qu'une table vide.
6. Exposer un endpoint de lecture apps/web/app/api/ecosystem/route.ts sur le
   même modèle que api/metrics.

Interdits : ne pas casser les endpoints existants (system_metrics, decisions_log,
trajectory). Ne pas désactiver la RLS. Ne pas écrire de migration destructive
sans vue de compatibilité. Ne pas recopier de prix ni de chiffre commercial dans
le seed.

Livrable : migration SQL, schéma Drizzle, fichier de données à remplir, seed,
endpoint, et la commande exacte pour appliquer la migration.
```
### Couche L2, Moteur de calcul
```javascript
Cette couche est volontairement fermée. Aucun développement n'y est autorisé.

Décision d'architecture du 13 juillet 2026, confirmée le 19 juillet et le 7 août :
tout calcul ESG lourd (empreinte carbone Scopes 1, 2 et 3, double matérialité,
taxonomie) appartient à STRATA Scope et à ESG Optimizer, qui ont leurs propres
moteurs testés et leurs facteurs Base Empreinte ADEME V23.11. Le service
services/engine d'Adama OS a été supprimé pour cette raison.

Si un besoin de chiffre carbone apparaît dans le dashboard, la seule réponse
acceptable est de passer par la couche L9 : appeler l'API publique versionnée de
STRATA Scope en lecture, avec une clé cloisonnée, et afficher le résultat avec sa
source et sa date.

Vocabulaire imposé si un chiffre est affiché : empreinte carbone ou bilan GES en
générique, jamais "bilan carbone" en nom commun, qui est une marque déposée.
Facteurs : Base Empreinte ADEME V23.11, jamais "3.1".

Toute demande d'implémentation de calcul dans ce dépôt doit être refusée et
renvoyée vers le dépôt produit concerné.
```
### Couche L3, Intelligence conversationnelle
```javascript
Contexte vérifié le 7 août 2026 : le pipeline RAG est entièrement codé, branché
et de bonne facture. packages/db/src/ingest.ts, 289 lignes : CLI, extraction PDF
locale via unpdf page par page, chunking par paragraphes (cible 1100 caractères,
chevauchement 180), redécoupe par phrases des paragraphes longs, filtrage des
chunks de moins de 80 caractères, embeddings text-embedding-3-small en 1024
dimensions par lots de 64, insertion par lots de 100, idempotence réelle par
couple source plus titre avec cascade. apps/web/lib/ai/retrieval.ts fait un
cosineDistance Drizzle avec minSimilarity 0.15. apps/web/app/api/chat/route.ts
streame via le Vercel AI SDK avec k=6 et laisse passer la génération sans
contexte si le retrieval échoue. Composant adama-ai.tsx branché sur useChat.

Problème unique : la base vectorielle est vide, et le corpus n'existe pas non
plus sur le disque. Le seul PDF du dépôt est le CV de téléchargement. L'agent
est fonctionnel et muet.

Tâche L3-T1.

1. Créer un dossier corpus/ à la racine, l'ajouter au .gitignore (les normes ne
   se redistribuent pas), et écrire corpus/README.md qui liste précisément les
   documents attendus, leur source de téléchargement et leur valeur d'usage.
2. Proposer le corpus minimal viable pour une démonstration crédible en
   entretien, et estimer pour chacun le nombre de chunks et le coût
   d'embedding, avec le total.
3. Durcir le comportement du point faible identifié : dans api/chat, le catch
   qui laisse passer la génération sans contexte transforme un incident de
   retrieval en réponse non sourcée. Faire échouer proprement avec un message
   explicite plutôt que de répondre sans source.
4. Ajouter une commande de vérification (packages/db, script verify-rag) qui,
   après ingestion, exécute trois questions types, affiche les sources et les
   scores de similarité, et sort en code non nul si une seule question ne
   ramène aucune source. C'est le garde-fou avant démonstration.
5. Documenter la procédure d'ajout d'un document au corpus, en trois lignes.

Interdits : ne pas changer le modèle d'embedding, la dimension 1024 est figée
dans le schéma et dans l'index HNSW. Ne pas relâcher le refus hors contexte. Ne
pas ingérer de document client ni de document confidentiel. Ne pas committer le
contenu du corpus.

Livrable : dossier corpus documenté, script d'ingestion durci, commande de
vérification, coût estimé, procédure.
```
### Couche L4, Interface et design system
```javascript
Contexte vérifié le 7 août 2026, et il ne correspond pas à ce que la
documentation annonçait. La stack réelle est Next.js 16, Tailwind v4, Framer
Motion et cmdk. Il n'y a NI shadcn/ui, NI Tremor, NI Radix, NI lucide-react.
packages/ui contient trois composants écrits à la main (badge, button, card) sur
clsx et tailwind-merge. Les tokens de apps/web/app/globals.css sont en
hexadécimal, pas en OKLCH : fond #0d1b2a bleu nuit, accent #2affd6 cyan
turquoise, plus un thème alternatif doré #c9a96e. oklch n'apparaît que dans
quatre color-mix.

Quatre couches livrées dans apps/web/components : layer-a (System Status, 200
lignes, compte à rebours live), layer-b (Decisions Log, 140), layer-c
(Trajectory, 98), layer-d (Sandbox, 126), plus dashboard.tsx (264), terminal.tsx
(359, palette Ctrl+K), vsme-simulator.tsx (376, calcul purement client),
recruit-modal.tsx (303), recruiter-view.tsx (227).

Tâche L4-T14, refonte de la Couche D en vue groupe.

1. Lire les produits depuis ecosystem_products (voir prompt L1), pas depuis un
   tableau en dur.
2. Grouper par division, avec un badge de statut lisible, et un lien cliquable
   uniquement pour les produits réellement en ligne. Pour les autres, afficher
   l'état sans lien, sans promesse de date.
3. Conserver la preuve sociale existante (AG2R LA MONDIALE, Younivibe, AFEV,
   Ministère des Finances), aujourd'hui en dur dans le JSX aux lignes 52 à 65.
   Elle est plus forte auprès d'un recruteur que n'importe quelle métrique
   produit, elle ne doit pas être noyée dans la nouvelle grille.
4. Vérifier que FALLBACK_METRICS a bien disparu (vague 0) et que l'état vide est
   explicite.
5. Chaque lien sortant passe par outbound-link.tsx, avec les propriétés division
   et product.
6. Vérifier le rendu en mode recruteur (?for=recruiter) et à l'impression.

Interdits : ne pas modifier les tokens de design. Ne pas introduire de
bibliothèque de composants, en particulier ne pas "réparer" l'absence de
shadcn/ui en l'installant, la base maison fonctionne et le design est figé
jusqu'à P4. Ne pas casser le responsive ni les animations. Ne pas allonger le
temps de rendu initial. Ne poser aucun transform, filter, perspective ni
backdrop-filter sur un ancêtre commun, cela casserait les éléments en position
fixed.

Livrable : composant refondu, données lues en base, description du rendu desktop,
mobile et impression.
```
### Couche L5, Contenu et preuve d'exécution
```javascript
Contexte vérifié le 7 août 2026 : apps/web/lib/github.ts fait 54 lignes et
n'interroge qu'un seul dépôt. Les constantes ne sont même pas locales, elles
viennent de apps/web/components/types.ts : GITHUB_OWNER = "adama-diallo-rse",
GITHUB_REPO = "adama-os". L'appel est per_page=8, cache next revalidate 300,
GITHUB_TOKEN optionnel, retour tableau vide en silence sur erreur. Aucune
agrégation, aucune pagination, aucun filtrage des commits de merge.

Problème : le dépôt lu est le seul du parc qui ne bouge plus depuis le 13
juillet. Pendant ce temps, esg-optimizer a 462 commits dont un aujourd'hui,
strata-scope 63 dont un le 6 août, strata-platform 24, strata-foundation 17,
iroko-platform 26, strata-watch 6, strata-esg-academy 3. Le dashboard affiche
donc une fraction infime du travail réel, ce qui affaiblit directement
l'argument recruteur. C'est l'écart le plus coûteux du dossier.

Tâche L5-T2, feed multi-repo.

1. Rendre la liste des dépôts configurable, de préférence via la colonne
   repo_full_name de ecosystem_products, avec repli sur une variable
   d'environnement. Ne rien coder en dur, et retirer GITHUB_OWNER et
   GITHUB_REPO de components/types.ts qui n'ont rien à y faire.
2. ATTENTION, point critique souvent manqué : les dépôts sont répartis sur
   TROIS périmètres GitHub, pas un. iroko-software-group (esg-optimizer,
   strata-platform, strata-foundation, strata-watch, strata-esg-academy,
   iroko-platform), le compte personnel adama-diallo-rse (strata-scope et
   adama-os), et l'ancienne organisation strata-esg. Un jeton fine-grained
   limité à l'organisation ne verra ni Scope ni le cockpit. Documenter
   exactement les portées à cocher.
3. Agréger, trier par date décroissante, afficher pour chaque commit le nom du
   produit et sa division en badge.
4. Gérer les contraintes de l'API : quota (60 requêtes par heure sans jeton,
   5000 avec), pagination, dépôts privés, mise en cache pour ne pas rappeler
   l'API à chaque rendu. Un appel par dépôt en parallèle avec un cache commun.
5. Dégradation : si un dépôt est inaccessible, le feed affiche les autres au
   lieu de retourner un tableau vide. L'erreur doit être visible en logs, pas
   avalée comme aujourd'hui.
6. Filtrer le bruit : exclure les commits de merge et les commits automatiques
   de dépendances. Exclure aussi les commits de renormalisation de fins de
   ligne, sinon la vague 0 noiera le feed.

Interdits : ne pas exposer de jeton côté client. Ne pas afficher le contenu des
commits de dépôts privés au-delà du message et de la date. Ne pas bloquer le
rendu de la page sur cet appel réseau.

Livrable : feed multi-repo caché et résilient, configuration documentée, liste
exacte des portées du jeton GitHub à créer, variables à poser dans Vercel.
```
### Couche L6, Conversion
```javascript
Contexte vérifié le 7 août 2026. Deux sorties existent.

La sortie recrutement fonctionne et n'est pas à toucher : bouton persistant,
recruit-modal.tsx (303 lignes) avec CV et Cal.com à la demande, capture de lead,
mode lecture recruteur imprimable. Cinq événements PostHog émis
(recruiter_modal_opened, recruiter_cv_download, recruiter_cal_opened,
recruiter_intent, recruiter_view_print).

La sortie produit est défaillante. apps/web/app/strata/page.tsx (232 lignes)
porte un tableau PRODUCTS en dur aux lignes 29 à 86, huit entrées, et il est faux
sur six d'entre elles : Foundation et Watch sont donnés "soon Q3 2026" alors que
leur code est livré (Watch en est à sa phase 8), Academy "soon Q4" alors qu'elle
est en production, et trois produits listés en roadmap 2027 (STRATA Due, STRATA
Taxonomy, GreenHR) n'existent nulle part, ni sur le disque ni dans les pages
courantes. Aucune mention de la branche Afrique. L'événement émis est
strata_outbound avec les propriétés produit et source (outbound-link.tsx ligne
30, et terminal.tsx ligne 126).

Tâches L6-T13 et L6-T14.

1. Transformer /strata en /ecosysteme : présentation par division, produits lus
   depuis ecosystem_products, lien cliquable uniquement pour ce qui est en ligne,
   état explicite pour le reste. Aucune date de disponibilité affichée si elle
   n'est pas engagée ailleurs.
2. Supprimer les trois produits qui n'existent pas. Si une intention doit rester
   visible, elle passe par une ligne "en réflexion" sans nom de produit et sans
   date, ou par rien du tout. Une promesse non tenue sur une page publique est
   un risque, pas un argument.
3. Redirection permanente 301 de /strata vers /ecosysteme#strata dans
   next.config.ts. Des liens ont déjà été partagés.
4. Renommer strata_outbound en ecosystem_outbound, avec les propriétés division
   et product en plus de source. Émettre les deux événements en parallèle
   pendant 30 jours pour ne pas trouer l'historique PostHog, avec une date de
   retrait écrite en commentaire.
5. Mettre à jour la commande `ping strata` du terminal en gardant un alias, et
   corriger PAGE_TARGETS (terminal.tsx lignes 51 à 55) qui porte aussi des URL
   en dur.

Interdits : ne pas toucher à la sortie recrutement, qui fonctionne et qui est
prioritaire. Ne pas ajouter de paiement, de checkout ou de tunnel de vente, la
monétisation appartient aux produits. Ne recopier aucun prix.

Livrable : page /ecosysteme, redirection, événements renommés en double
émission, et la liste des deux funnels à créer côté PostHog.
```
### Couche L7, Acquisition et média
```javascript
Contexte : phase P4, à partir du 29 septembre 2026. Rien n'est commencé, c'est
normal. apps/web/app/opengraph-image.tsx existe mais il est statique.

L'angle éditorial a changé de calibre. Le récit n'est plus celui d'un consultant
qui code un outil, c'est celui d'un ingénieur qui construit un ensemble logiciel
sur deux continents et documente tout en public. C'est un positionnement rare et
défendable, à condition que chaque affirmation soit vérifiable dans le dashboard.

Tâches L7-T1 à L7-T4.

1. Images OG dynamiques via Satori, un template par type de page (accueil,
   écosystème, produit, Open Metrics), avec le statut réel du produit lu en base.
   Contrainte de conformité : à partir du 2 décembre 2026, une image générée doit
   porter un marquage lisible par machine. Prévoir le champ de métadonnée dès
   maintenant plutôt que de refaire les templates (voir couche L10).
2. Paramètres UTM cohérents sur tous les liens sortants, et vérification que
   PostHog attribue correctement la source. Convention écrite une fois, appliquée
   par outbound-link.tsx, pas recopiée dans chaque appel.
3. Calendrier éditorial sur huit semaines. Un contenu, une sortie tracée, jamais
   deux.
4. Trois angles narratifs testables, avec pour chacun le hook, la preuve visuelle
   disponible dans le dashboard, et la sortie ciblée.

Interdits : aucune affirmation chiffrée qui ne soit pas vérifiable dans le
dashboard ou dans un produit en ligne. Le dashboard sert de preuve, il ne doit
jamais être contredit par le contenu. Ne citer aucun nom de client au delà de la
preuve sociale déjà publique.

Livrable : templates OG, convention UTM documentée, calendrier éditorial, trois
angles avec leur preuve associée.
```
### Couche L8, Qualité, sécurité, SEO, observabilité
```javascript
Contexte vérifié le 7 août 2026, et cette base est bonne. Sentry sur quatre
fichiers (instrumentation.ts avec onRequestError, instrumentation-client.ts,
sentry.server.config.ts, sentry.edge.config.ts, plus withSentryConfig).
PostHog en région UE via apps/web/lib/analytics.ts, 104 lignes, avec import
dynamique, file d'attente de 20 événements tant que le consentement est inconnu,
purge sur refus, et consent-banner.tsx monté dans le layout. Better Stack via
lib/uptime.ts avec cache 60 secondes et repli sur system_metrics. sitemap.ts,
robots.ts, JSON-LD Person complet dans layout.tsx.

Manques constatés : next-intl totalement absent, aucun JSON-LD Organization ni
SoftwareApplication, aucun test (voir couche L11), lang="fr" figé.

Tâches restantes, par ordre de valeur.

1. L8-T7, funnels PostHog. Les événements sont déjà émis, il n'y a rien à coder.
   Définir le funnel recrutement (vue vers recruiter_modal_opened vers
   recruiter_intent vers recruiter_cal_opened ou recruiter_cv_download) et le
   funnel produit (vue vers ecosystem_outbound). Livrer la configuration exacte
   à reproduire dans l'interface, écran par écran.
2. L8-T8, bilingue français et anglais avec next-intl sur tout le site public.
   Priorité haute : la cible recruteur inclut des groupes internationaux.
   Extraire les chaînes, ne pas traduire à la volée. Attention, le site n'a
   aujourd'hui aucune structure [locale], c'est une restructuration de routes,
   pas un ajout de fichier.
3. L8-T9, SEO complet : JSON-LD Organization et SoftwareApplication par produit
   lus depuis ecosystem_products, métadonnées par page, sitemap alimenté par la
   base au lieu du tableau de trois URL en dur.
4. L8-T10, audit accessibilité WCAG AA. Priorité au contraste sur fond sombre
   (le fond réel est #0d1b2a avec un accent #2affd6, à mesurer) et à la
   navigation clavier dans le terminal Ctrl+K.
5. L8-T11, audit performance : Web Vitals, images, cache components Next 16.
6. L8-T12, audit sécurité : revue des 17 policies RLS, rotation des secrets,
   portée du jeton GitHub, et surtout limitation de débit sur api/chat qui
   appelle un modèle payant sans aucune protection aujourd'hui.

Interdits : ne pas ajouter d'outil d'observabilité supplémentaire, la stack
suffit. Ne pas traduire automatiquement le contenu, la qualité de langue fait
partie de l'argument.

Livrable : pour chaque point, un diff ou une procédure, plus la liste des actions
manuelles à faire dans PostHog, Vercel et Supabase.
```
### Couche L9, Passerelles écosystème (nouvelle)
```javascript
Contexte et raison d'être. Adama OS affiche aujourd'hui des chiffres produits
saisis à la main dans la table strata_analytics, ou pire, repliés sur des
constantes. Depuis fin juillet, la matière existe de l'autre côté : STRATA Scope
expose un pont écosystème versionné, et un ordonnanceur a été livré côté
ESG Optimizer le 7 août 2026, qui rend enfin mesurables des indicateurs
d'exécution qui ne l'étaient pas.

Principe non négociable : le cockpit CONSOMME, il ne recalcule jamais, et il
n'écrit jamais dans un produit. Lecture seule, clé cloisonnée, résultat affiché
avec sa source et son horodatage.

Tâches L9-T1 à L9-T5.

1. Écrire un client de passerelle générique dans apps/web/lib/ecosystem/ :
   une fonction par produit, timeout court, cache Next avec revalidate explicite,
   jamais d'appel bloquant au rendu, dégradation silencieuse vers un état
   "source indisponible" et jamais vers une valeur inventée.
2. Modéliser le résultat : chaque métrique importée porte obligatoirement
   product_slug, source (nom de l'API), fetched_at, et value. Une métrique sans
   ces quatre champs ne s'affiche pas. Stocker dans ecosystem_analytics (voir
   couche L1), en insertion, jamais en écrasement, pour garder l'historique.
3. Brancher la première passerelle sur l'API publique versionnée de STRATA Scope,
   en lecture seule. AVANT d'écrire une ligne, lire la page Notion de référence
   du chantier Scope pour relever les noms de routes et de champs exacts. Ne
   jamais deviner un contrat d'API.
4. Brancher la seconde passerelle sur l'état de l'ordonnanceur, pour afficher
   dans la Couche A une preuve d'exploitation réelle : dernière exécution, santé
   des tâches planifiées. C'est le genre de détail qui distingue un dashboard de
   démonstration d'un dashboard d'opérateur.
5. Prévoir un mode dégradé global : si aucune passerelle ne répond, le dashboard
   reste entièrement fonctionnel et dit clairement que les métriques produits ne
   sont pas jointes.

Interdits : aucune écriture vers un produit, aucun webhook entrant, aucun appel
authentifié avec une clé d'administration. Ne pas recopier de logique métier du
produit dans le cockpit, y compris un simple calcul de pourcentage : si le
chiffre doit être dérivé, il est dérivé côté produit. Ne jamais afficher une
métrique dont la source n'a pas répondu.

Livrable : client de passerelle, schéma de la métrique importée, deux passerelles
branchées, comportement dégradé démontré, et la liste des variables
d'environnement et des clés à demander côté produit.
```
### Couche L10, Conformité et transparence (nouvelle)
```javascript
Contexte et raison d'être. Deux obligations concernent directement ce dépôt, et
une doctrine interne a changé.

1. Depuis le 2 août 2026, l'article 50 impose la mention du traitement
   automatisé. Le garde-fou historique de l'espace, "aucune mention d'IA côté
   client", est AMENDÉ : sur un agent conversationnel comme adama.ai, la mention
   est obligatoire. Un rédacteur qui applique l'ancienne doctrine retire une
   mention légale.
2. Au 2 décembre 2026, les contenus générés doivent porter un marquage lisible
   par machine. Le cockpit est concerné par les réponses de adama.ai et par les
   images OG générées de la couche L7. La préparation est déclarée nulle dans
   l'espace, donc il n'y a rien à reprendre ailleurs.

État actuel : consent-banner.tsx est en place et correct. Il n'y a en revanche
aucune page de politique de confidentialité, aucune mention légale, aucune page
de politique de cookies dans le dépôt.

Tâches L10-T1 à L10-T5.

1. Ajouter la mention de traitement automatisé sur le composant adama-ai.tsx, au
   premier contact et non enfouie dans un pied de page. Formulation sobre, en
   français et en anglais si la couche L8-T8 est faite. La verrouiller par un
   test (voir couche L11) pour qu'un futur nettoyage de texte ne la supprime pas.
2. Créer /mentions-legales et /confidentialite. Éditeur : personne physique,
   régime déclaré. Sous-traitants à lister honnêtement : Vercel, Supabase région
   UE, OpenAI, PostHog UE, Sentry, Better Stack, GitHub, Cal.com. Préciser pour
   chacun ce qui transite. Ne pas recopier les mentions d'un produit du groupe,
   le cockpit est un site personnel, l'éditeur et les finalités diffèrent.
3. Préparer le marquage machine avant le 2 décembre : métadonnée dans les images
   OG générées, et champ de provenance dans les réponses de adama.ai. Livrer une
   note technique d'une page en octobre au plus tard, la mise en oeuvre peut
   attendre novembre.
4. Vérifier la cohérence entre le bandeau de consentement et la réalité : la file
   d'attente de PostHog garde 20 événements avant consentement. S'assurer qu'ils
   sont bien purgés en cas de refus, et le prouver.
5. Vérifier que le CV téléchargeable et le formulaire de lead disent où vont les
   données et combien de temps elles sont conservées.

Interdits : ne pas copier les mentions légales d'ESG Optimizer ni de
strata-platform, l'éditeur n'est pas le même. Ne pas annoncer de certification,
de label ni de conformité que le site ne détient pas. Ne pas employer le
vocabulaire interdit de l'espace en matière de preuve : infalsifiable,
inaltérable, horodatage certifié, registre qualifié.

Livrable : mention en place et testée, deux pages légales, note de préparation au
marquage machine, preuve de purge du consentement.
```
### Couche L11, Tests et fiabilité (nouvelle)
```javascript
Contexte et raison d'être. Le dépôt adama-os ne contient AUCUN test : aucun
fichier test ou spec, aucune dépendance Vitest, Jest ou Playwright, aucune tâche
test dans turbo.json. C'est le dépôt le plus visible du parc, et c'est le seul
dans cet état, alors que les autres en comptent des milliers. Devant un lecteur
technique, l'asymétrie est difficile à défendre.

L'objectif n'est pas la couverture, c'est un filet minimal sur ce qui casse en
silence et se voit en démonstration.

Tâches L11-T1 à L11-T5.

1. Installer Vitest à la racine du monorepo, une configuration partagée dans
   packages/config, et brancher la tâche test dans turbo.json (créée en L0).
2. Écrire les quatre tests qui comptent, et pas davantage dans un premier temps :
   a. Retrieval : sur un jeu de chunks connu, une requête proche ramène la bonne
      source, une requête hors sujet ne ramène rien. C'est le test qui garantit
      qu'une démonstration de adama.ai ne s'effondre pas.
   b. RLS : un client anon ne peut lire ni rag_chunks ni rag_documents, et ne
      voit dans decisions_log que les lignes publiées. À exécuter contre une base
      de test, pas contre la production.
   c. Absence de repli chiffré : la Couche D ne rend aucun nombre quand la source
      est vide. Ce test verrouille le geste 3 de la vague 0.
   d. Mention article 50 : elle est présente dans le rendu de adama-ai.
3. Ajouter un test de contrat sur les endpoints publics (api/metrics,
   api/decisions, api/trajectory, api/ecosystem) : forme de la réponse, et code
   de statut en cas d'indisponibilité de la base.
4. Brancher un workflow GitHub Actions minimal : install, lint, type-check, test,
   sur pull request. Le déploiement reste géré par Vercel, ne pas le doubler.
5. Documenter en trois lignes comment lancer les tests en local, avec la base de
   test.

Interdits : ne pas viser un pourcentage de couverture. Ne pas écrire de test sur
l'animation, la mise en page ou le rendu visuel, cela casse à chaque retouche
pour aucun gain. Ne jamais faire tourner un test contre la base de production. Ne
pas ajouter Playwright tant que les quatre tests ci-dessus ne sont pas verts.

Livrable : configuration Vitest, les tests, le workflow CI, la procédure locale.
```
### Couche L12, Continuité et reprise (nouvelle)
```javascript
Contexte et raison d'être. Le cockpit porte sa PROPRE base Supabase, distincte de
la base de production des produits. Elle contient les décisions, la trajectoire,
les leads recruteurs et le corpus vectoriel, dont le coût de reconstitution n'est
pas nul (embeddings payants). Aucune politique de sauvegarde n'existe, aucun test
de restauration n'a été fait. C'est le même angle mort que celui relevé le 4 août
sur la base de production des produits, sur un périmètre que ce chantier là ne
couvre pas.

Ce prompt ne traite QUE le périmètre adama-os. Tout ce qui concerne la base de
production d'ESG Optimizer relève du hub Chantiers techniques, ne pas le
dupliquer ici.

Tâches L12-T1 à L12-T5.

1. Écrire, en une page, la politique de sauvegarde et de restauration de la base
   du cockpit : ce qui est sauvegardé, à quelle fréquence, où, combien de temps,
   et l'objectif de point de reprise accepté. Vérifier d'abord ce que le plan
   Supabase utilisé fournit déjà, ne pas construire ce qui existe.
2. Écrire un script d'export logique (pg_dump ciblé sur les tables du cockpit,
   plus un export séparé des embeddings) exécutable à la main, et documenter la
   commande de restauration. Faire un test de restauration réel et le dater dans
   la page. Une sauvegarde non testée n'est pas une sauvegarde.
3. Auditer les secrets du périmètre : lister toutes les variables, où elles
   vivent (Vercel, local, documentation), et lesquelles sont exposées au
   navigateur. Vérifier qu'aucune valeur réelle ne se trouve dans un fichier
   .env.local d'un dossier synchronisé sur un service de stockage en ligne, y
   compris dans l'historique de versions. Poser un calendrier de rotation.
4. Vérifier qu'il existe un second moyen d'accès au projet Supabase et au projet
   Vercel, et que la clé service role n'est utilisée que côté serveur.
5. Ajouter une note de reprise : si tout est perdu sauf le dépôt, quelle est la
   séquence exacte pour remonter le cockpit. Migration, seed, ingestion du
   corpus, variables. C'est le document qui rend la perte survivable.

Interdits : ne pas écrire de valeur de secret dans un fichier versionné ni dans
une page Notion. Ne pas mettre en place d'outil de sauvegarde payant sans
comparer d'abord à ce que l'hébergeur fournit. Ne pas traiter la base des
produits dans ce chantier.

Livrable : politique d'une page, script d'export, procédure de restauration
testée et datée, inventaire des secrets, note de reprise.
```
---
> **Tenue de cette page.** Elle ne fait foi que sur le dépôt `adama-os`. Sur tout fait produit, prix ou échéance, ce sont les pages de référence de la section 2 qui gagnent. Prochaine vérification à faire contre le code à la fin de la vague 0, et à chaque fin de phase. Le fichier `ROADMAP.md` du dépôt est dérivé de cette page, plus l'inverse.

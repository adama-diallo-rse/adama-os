# Portfolio Adama OS, refonte du 31 août 2026

## Direction

Un portfolio éditorial personnel : crème, bleu ardoise et or STRATA ESG,
grande typographie sans serif et contrepoint serif italique. Les illustrations
architecturales sont originales, construites en SVG et CSS. Aucun asset payant,
aucune police distante, aucun abonnement Webflow et aucune dépendance ajoutée.

Références consultées : [Mobbin](https://mobbin.com/) pour les parcours et la
lisibilité des interfaces ; [Pentagram / Digital](https://www.pentagram.com/digital-design)
pour la place accordée à la typographie et aux projets. Aucun écran ni asset copié.

Contexte : [roadmap Adama OS dans Notion](https://www.notion.so/3a2455fe99dd81bebf01d1d08e2fa0b7).
La demande explicite de refonte remplace l'ancien gel du design indiqué dans cette
roadmap. Les règles de provenance des données et de séparation des produits restent
appliquées. Aucune page Notion n'a été modifiée.

## Couleurs et rédaction

La composition éditoriale est conservée à la demande d’Adama. Les couleurs viennent
de la maison STRATA ESG, et non de la palette forest/leaf du produit ESG Optimizer :
bleu ardoise #0D1B2A, crème #F4EFE6, or #C9A96E et signal turquoise #2AFFD6.
Source locale : `C:\Dev\STRATA\brand\strata-tokens.css`.
Référence Notion : [Marque, site et identité](https://www.notion.so/3ad455fe99dd818190fdebdffd6d21f2).
L’or de texte #806332 est plus sombre pour rester lisible sur crème. Le turquoise
reste limité aux petits repères et aux éléments interactifs sur fond sombre.

Pas de tirets cadratins ou demi-cadratins dans les textes du frontend. Les textes
présentent des faits et des projets précis, sans slogans ni titres de poste inventés.
Les descriptions de STRATA Scope, STRATA Watch et IROKO Business OS s’appuient sur
leurs dépôts locaux. Le code présent ne vaut pas preuve de disponibilité en production.
La consigne de rédaction est également transmise à l’assistant du site.

## Parcours

1. Présentation personnelle, projets et CV dès le premier écran.
2. Expériences : AG2R LA MONDIALE, Younivibe, AFEV et Ministère des Finances.
3. Univers STRATA, IROKO et Adama OS, filtrables par thème.
4. Approche : demande métier, données et développement.
5. Parcours et accès à la version recruteur imprimable.
6. Atelier : contributions GitHub, terminal, puis cockpit dépliable.
7. Contact et liens utiles.

Les cartes d'univers sont des présentations éditoriales, pas un registre de
produits. Elles ne déclarent aucun statut de disponibilité et ne contiennent
aucune métrique. Les liens et statuts produit restent dans `ecosystem_products`.
Le registre ou le feed peuvent être vides si leurs sources ne répondent pas.
Le site l'indique explicitement, sans générer de fausses données.

## Modifier depuis VS Code

Ouvrir le dossier `C:\Dev\adama-os`.

- `apps/web/components/dashboard.tsx` : textes, sections, filtres, navigation.
- `apps/web/components/portfolio-art.tsx` : illustration SVG et visuels des projets.
- `apps/web/app/portfolio.css` : style du portfolio, responsive et réduction des animations.
- `apps/web/lib/og.tsx` et `apps/web/app/opengraph-image.tsx` : aperçu de partage.
- `apps/web/app/icon.svg` : favicon.
- `apps/web/components/recruit-modal.tsx` : contact, focus clavier et retours d'envoi.

Lancer `pnpm dev` à la racine. Si le lanceur pnpm de l'environnement tente une
réinstallation inutile, le serveur peut aussi être démarré depuis `apps/web` avec
`node node_modules/next/dist/bin/next dev --port 3010`.

## Vérifier sans CI

À la racine, dans PowerShell :

```powershell
.\scripts\check-frontend.ps1
```

Ce script utilise uniquement les outils déjà installés. Il lance TypeScript,
les tests, le lint et le build, et s'arrête à la première erreur. Option
`-SkipBuild` pour une vérification rapide. Il n'installe rien, ne pousse rien et
ne déclenche aucun workflow GitHub Actions. Les tests d'intégration base restent
désactivés par défaut selon la configuration existante.

Avant le push dans VS Code, relire le diff et sélectionner seulement les fichiers
voulus. Aucun commit ou push n'est effectué par cette refonte. Les changements de
documentation préexistants ou réalisés en parallèle restent indépendants.

## Points de vigilance

- Le formulaire ne confirme un envoi qu'après une sauvegarde réussie ; sans base
  configurée, en cas de refus ou de réseau indisponible, il affiche une erreur.
- L'envoi réel de contact, Cal.com et adama.ai nécessitent leurs services existants.
  Les contrôles de refonte n'envoient aucun message, contact ou requête IA payante.
- Le menu mobile, les filtres, les ancres et le terminal restent utilisables au clavier.
- Les liens directs vers les anciennes couches ouvrent le cockpit avant défilement.
- Le consentement, les événements de téléchargement du CV et les pages légales restent en place.

## Vérification de cette livraison

- TypeScript : aucune erreur.
- Tests : 57 réussis ; 6 tests d'intégration restent ignorés par défaut.
- Lint : aucune erreur ; 6 avertissements non bloquants subsistent dans les composants existants.
- Build de production : réussi, y compris les trois images de partage.
- Formatage des fichiers de la refonte et contrôle du diff : conformes.
- Navigateur : accueil compilé sans erreur console, pages écosystème, métriques,
  mentions légales, confidentialité et vue recruteur rendues.
- Écrans contrôlés : 320, 390, 1100 et 1440 pixels ; aucun débordement horizontal constaté.
- Palette STRATA ESG : or de texte / crème 4,89:1, texte secondaire / crème 5,07:1,
  légendes / fond d’illustration 4,62:1 ; textes courants contrôlés au-dessus de 4,5:1.
- Aucun tiret cadratin ou demi-cadratin dans les sources du frontend et les libellés
  de l’accueil contrôlés dans le navigateur. Les futures données externes ne sont
  pas réécrites automatiquement.
- Interactions contrôlées : navigation mobile, filtre Afrique et retour à Tout,
  ouverture du cockpit depuis le terminal, ouverture de l'assistant, fermeture
  du contact avec Échap, boucle Tab / Maj+Tab et retour du focus au déclencheur.

Le registre produits et le feed GitHub n'ont pas fourni de contenu pendant le
contrôle local : leurs états indisponibles sont visibles. Aucune donnée de
production n'a été écrite pour le test du formulaire : ses cas d'envoi sont
vérifiés avec des réponses simulées dans la suite locale.

# Refonte RV, 30 octobre 2026

Fichier de travail de la refonte complète d’ADAMA OS : identité, symbole, couleurs, typographie, mouvement et structure. Il consigne ce qui a été relevé chez les quatre références, ce qui en a été transposé, le plan de mouvement, la liste des routes, les mesures et ce qui reste ouvert.

## 1. Relevé des références

Relevé fait le 30 octobre 2026 dans Chrome, à 1440 et 390 pixels, premier écran puis trois profondeurs de défilement. Captures conservées hors dépôt (dossier de livrables de la session).

| Site             | Pile relevée                               | Structure                                                                                    | Typographie                                                                                | Ce qui est transposé                                                                                                                                                                                                                                                                                                                      |
| ---------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| oryzo.ai         | Astro, six canvas WebGL, page de 56 700 px | aucune balise `section`, une scène continue                                                  | Halyard Display variable, une seule famille                                                | l’objet protagoniste sur un plan de travail gradué ; le rideau de construction ; la navigation latérale fixe ; les sections numérotées ; le bloc « résumé, source, citation » ; le tableau comparatif ; les cartes « conditions, date, dommage »                                                                                          |
| complexlaw.co.uk | Webflow, 11 sections, 8 800 px             | héros illustré, bandeau de logos, trois portes, valeurs, FAQ, appel final                    | PT Serif pour les titres, un mot en italique souligné d’un trait main, Inter pour le texte | la scène isométrique dessinée, pièce par pièce ; le mot accentué souligné d’un trait qui se dessine ; le grand menu par public, devenu menu par rubrique et par branche ; les portes illustrées ; le double appel « Échanger » et « Explorer le catalogue » ; le bandeau défilant, limité aux organisations réelles ; la FAQ en accordéon |
| monologue.to     | 19 sections, fonds sombres alternés        | tuiles de tailles inégales montrant le produit en usage, étapes numérotées, tableau à coches | Geist Mono, Instrument Serif, une serif propre                                             | les tuiles de `/outils`, chacune une vraie interface réduite avec les valeurs servies ; le carrousel des étapes ; le tableau comparatif à coches                                                                                                                                                                                          |
| browserbase.com  | 11 sections, un canvas                     | démonstration à onglets où une tâche se déroule, compteurs                                   | GT Planar, GT Standard Mono                                                                | la démonstration du moteur à cinq onglets (pièce, classement, rattachement, sceau, vérification), jouée une fois, sur une affirmation réellement servie ; les compteurs, qui ne lisent que des nombres servis                                                                                                                             |

Ce qui n’est pas transposé : le ton parodique d’Oryzo, ses textures photographiques et son récit produit fictif ; les portraits défilants de Complex Law (une seule personne) ; tout vocabulaire de traitement automatique de Browserbase et de Monologue.

## 2. Identité

Voir `brand/ADAMA_OS_CHARTE_2026.md`, version 2.0. Symbole « Le Tissage », palette OKLCH indigo, latérite, ivoire, encre et un signal, Schibsted Grotesk, Newsreader italique, IBM Plex Mono. Contraste vérifié par `node scripts/contraste.mjs`.

## 3. Plan de mouvement

Tout est chargé après l’hydratation, au repos du navigateur, et rien sous réduction de mouvement. Un état de départ n’est posé que sur un élément hors de l’écran.

| Section                 | Effet                                                                                                                                                             | Déclencheur                                                       | Durée                                     | Téléphone                   | Mouvement réduit   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------- | --------------------------- | ------------------ |
| Rideau                  | le symbole se trace en épure, prend matière, le rideau se lève                                                                                                    | première visite seulement, script posé avant la première peinture | 1,2 s au total                            | identique                   | absent             |
| Premier écran           | trait main sous « mesurable » ; symbole 3D sur plan millimétré, balancement lent                                                                                  | chargement                                                        | 1,1 s pour le trait                       | symbole SVG fixe            | tout immobile      |
| Cinq actes              | scène collante ; le symbole 3D change d’état à chaque acte (sceau avancé, trois quarts, décomposition, recomposition, couché) ; l’acte lu porte un filet latérite | défilement, ScrollTrigger                                         | 0,7 s d’interpolation                     | suite verticale, sans scène | symbole SVG fixe   |
| Route de la preuve      | le rail se remplit, les étapes glissent en place                                                                                                                  | défilement lié                                                    | liée au défilement                        | rail vertical               | rempli             |
| Manifeste               | chaque mot passe du texte secondaire au texte principal, deux teintes qui passent le contraste                                                                    | défilement lié                                                    | liée au défilement                        | identique                   | texte plein        |
| Feuilles                | la feuille recouverte recule à 96 % quand la suivante monte                                                                                                       | défilement lié                                                    | liée au défilement                        | aucun recul                 | aucun recul        |
| Titres h2               | lignes sous masque                                                                                                                                                | entrée à l’écran                                                  | 0,9 s, décalage 0,08 s                    | identique                   | aucun              |
| Démonstration du moteur | cinq gestes joués une fois, journal et fiche JSON qui se remplissent                                                                                              | entrée à l’écran                                                  | 5,5 s, une seule fois, bouton « Rejouer » | onglets empilés             | état final affiché |
| Cartes                  | montée par vagues                                                                                                                                                 | entrée à l’écran                                                  | 0,8 s                                     | identique                   | aucune             |
| Défilés                 | bandeau en boucle, pause au survol, au focus et par bouton                                                                                                        | continu                                                           | 48 s et 70 s par tour                     | identique                   | figé, défilable    |
| Boutons principaux      | magnétiques                                                                                                                                                       | pointeur fin                                                      | 0,4 s                                     | aucun                       | aucun              |

## 4. Les routes, une par une

Toutes passent par le kit de page commun (`components/page-shell.tsx`) ou par l’accueil. Captures à 1440 et 390 pixels, en mouvement normal et réduit, avec contrôle axe-core.

| Route                                                                                           | Kit                                       | Capturée                                | axe |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------- | --- |
| `/`                                                                                             | accueil en cinq actes                     | oui                                     | 0   |
| `/os`                                                                                           | kit, cockpit complet                      | oui                                     | 0   |
| `/catalogue`                                                                                    | kit, rubriques, régimes, FAQ              | oui                                     | 0   |
| `/outils`                                                                                       | kit, tuiles, étapes, comparatif           | oui                                     | 0   |
| `/bibliotheque`                                                                                 | kit                                       | oui                                     | 0   |
| `/playbooks`                                                                                    | kit                                       | oui                                     | 0   |
| `/parcours`                                                                                     | kit                                       | oui                                     | 0   |
| `/travaillez-avec-moi`                                                                          | kit, portes illustrées                    | oui                                     | 0   |
| `/diagnostic`, `/revue-architecture`                                                            | kit                                       | oui                                     | 0   |
| `/preuves`                                                                                      | kit                                       | oui                                     | 0   |
| `/verifier/[id]`                                                                                | kit, bloc de citation                     | oui (404 en local sans base)            | 0   |
| `/decisions`, `/decisions/[adr]`                                                                | kit, bloc de citation                     | oui (404 en local sans base pour l’ADR) | 0   |
| `/revirements`, `/erreurs`, `/principes`, `/journal`                                            | kit                                       | oui                                     | 0   |
| `/systeme`, `/systeme/pannes`                                                                   | kit, cartes d’essai                       | oui                                     | 0   |
| `/technique`, `/metrics`, `/ecosysteme`, `/confiance`                                           | kit                                       | oui                                     | 0   |
| `/projets/[slug]`                                                                               | kit                                       | oui                                     | 0   |
| `/recruteur`                                                                                    | kit sobre, aucun catalogue dans l’en-tête | oui                                     | 0   |
| `/articles` et les trois articles, FR et EN                                                     | kit                                       | oui                                     | 0   |
| `/changelog`, `/ecriture`, `/expansion`, `/lettre`, `/methode`, `/methodes`, `/methodes/[code]` | kit                                       | oui                                     | 0   |
| `/en`                                                                                           | kit, racine anglaise                      | oui                                     | 0   |
| `/mentions-legales`, `/confidentialite`, `/checkin`                                             | kit                                       | oui                                     | 0   |
| page absente                                                                                    | kit                                       | oui                                     | 0   |

## 5. Mesures du 30 octobre 2026

Lighthouse 12.8, serveur de production local (`next start`, HTTP/1.1, sans brotli).

| Page         | Mobile perf. | Bureau perf. | Accessibilité | Bonnes pratiques | SEO | LCP mobile simulé |
| ------------ | ------------ | ------------ | ------------- | ---------------- | --- | ----------------- |
| `/`          | 72           | 98           | 100           | 100              | 100 | 4,3 s             |
| `/catalogue` | 86           | 100          | 100           | 100              | 100 | 3,6 s             |
| `/preuves`   | 88           | 100          | 100           | 100              | 100 | 3,6 s             |

Référence, site en production le même jour (Vercel, HTTP/2) : `/` 67 en mobile, LCP 6,3 s, 692 Ko de JavaScript ; `/preuves` 77, LCP 4,7 s.

Mesure réelle (Chrome, téléphone ralenti 4 fois, 4G lente) : LCP de l’accueil 1,6 s, CLS 0.

Remesure du 30 octobre 2026 au soir, après les quatre maisons (mêmes conditions) :

| Page         | Mobile perf. | Bureau perf. | Accessibilité | Bonnes pratiques | SEO | LCP mobile simulé |
| ------------ | ------------ | ------------ | ------------- | ---------------- | --- | ----------------- |
| `/`          | 74           | 99           | 100           | 100              | 100 | 4,2 s             |
| `/catalogue` | 85           | 100          | 100           | 100              | 100 | 3,6 s             |
| `/preuves`   | 88           | 100          | 100           | 100              | 100 | 3,6 s             |

Coût du rideau mesuré à cache vide, rideau déjà vu : l’accueil passe à 79 (LCP simulé 3,9 s). Le reste de l’écart tient au socle Next et React chargé avant le premier affichage, environ 175 Ko compressés, et à la simulation d’un serveur local en HTTP/1.1. Les 176 captures (44 routes, 1440 et 390 px, mouvement normal et réduit) ne relèvent aucune violation axe ; `/verifier/registre-de-preuve-tenu` et `/decisions/DEC-001` tombent en 404 en local faute de base joignable et répondent 200 en production.

## 6. Les quatre maisons (30 octobre 2026)

« Ce que j’ai construit » présente désormais quatre fiches, une par maison : STRATA ESG, Pharivo, ADAMA OS et Conhama.

- **STRATA ESG** réunit ses cinq produits dans une seule fiche (`content/projets/strata-esg.ts`) : ESG Optimizer, STRATA Scope, STRATA Foundation, STRATA Watch et STRATA Academy, chacun avec son adresse, son rôle et son état relevé. STRATA Academy reste « en développement » : la plateforme répond, son premier parcours n’est pas publié. La carte porte le mot-symbole réel de la marque (`components/marque/stratemark.tsx`, vectorisé depuis la Cormorant 500 du kit STRATA).
- Les anciennes adresses `/projets/esg-optimizer` et `/projets/strata-scope` redirigent de façon permanente vers l’ancre du produit dans la fiche STRATA ESG.
- **Conhama** entre avec sa fiche (`content/projets/conhama.ts`), sa marque (triangle de liens et trois nœuds, couleurs de sa charte), sa ligne au registre des produits (`packages/db/migrations/0010_conhama.sql`) et sa division sur `/ecosysteme`. Ses décisions vivent dans son propre registre, non publié : la fiche le dit au lieu d’emprunter un ADR.
- Rôles validés par Adama le 30 octobre 2026 : fondateur de STRATA ESG et de Conhama, co-fondateur de Pharivo. Ils sont lus depuis `content/profil.ts` par le JSON-LD, la situation de l’accueil, les images de partage, `/en`, la fenêtre de contact, le CV et `llms.txt`. Conhama entre dans les expériences et la bande des organisations.
- « STRATA ESG » partout dans les textes visibles, jamais « STRATA » seul : « Utiliser STRATA ESG », « Clause de renvoi STRATA ESG », les méthodes et l’article de méthode.
- Fiche projet : le sommaire automatique doublait la navigation « La fiche » et ses numéros (« 01 01 Problème ») ; il est coupé sur les fiches, et le sommaire ne reprend plus le numéro d’un titre sur les autres pages.
- Preuves ajoutées au catalogue de semis : `strata-foundation-en-ligne`, `strata-watch-en-ligne`, `strata-academy-en-ligne`, `conhama-en-ligne` (code HTTP de l’adresse publique, relevé par le cockpit).
- Vérifié : tests ciblés verts (projets 49, identité 92, catalogue de l’écosystème 6, CV 7, et dix autres fichiers), axe 0 violation sur `/`, `/projets/strata-esg`, `/projets/conhama`, `/projets/pharivo`, `/ecosysteme` à 1440 et 390 px.

## 7. Ce qui reste ouvert

- Performance mobile à 90 : non atteinte en local (72, 86, 88). Le premier affichage simulé est pénalisé par le serveur local en HTTP/1.1 ; à remesurer sur la prévisualisation Vercel avant la mise en ligne.
- Les textes déjà en base (une affirmation de preuve et le principe de DEC) portent encore l’ancienne formulation tant que les graines ne sont pas rejouées.
- Le fichier Figma porte encore la charte 1.1.
- Les blocs 02 des fiches STRATA ESG et Conhama sont des propositions à relire par Adama (questions listées dans chaque fiche).
- Conhama et les trois nouvelles preuves n’apparaissent en production qu’après `0010_conhama.sql` et `pnpm proof:seed`.

# Charte ADAMA OS 2026

Version 2.0, 30 octobre 2026. Remplace la version 1.1 du 9 septembre 2026, qui reprenait la charte de STRATA ESG.

## 0. Pourquoi cette révision

Jusqu’au 30 octobre 2026, ADAMA OS portait la charte de STRATA ESG : navy `#0D1B2A`, crème, or, signal teal `#2AFFD6`, Cormorant Garamond, Syne, DM Sans et Courier Prime. Le laboratoire public n’avait pas d’identité propre, et son logo, deux strates ouvertes et un point or, empruntait le vocabulaire du produit. Un visiteur ne pouvait pas dire, au premier regard, s’il lisait ADAMA OS ou STRATA ESG.

Cette version donne à ADAMA OS une identité qui ne se confond plus avec aucun produit du groupe. La frontière reste écrite : ADAMA OS montre comment construire, STRATA ESG livre le logiciel.

## 1. Idée directrice

ADAMA OS est un laboratoire public et un cockpit de preuve qui documentent la construction de systèmes numériques pour la donnée de durabilité, avec un catalogue de méthodes, d’outils, de parcours, de conseil et une lettre, qui s’ouvre par vagues.

Territoire : ESG · DATA · SYSTEMS

Proposition : Je conçois des systèmes numériques qui rendent la donnée de durabilité exploitable, vérifiable et opposable.

Sous-titre : Méthodes, systèmes et outils pour construire l’ESG numérique.

Signature : Construit par Adama. Chaque mot vérifiable en un clic.

## 2. Architecture de marque

ADAMA OS est la marque publique unique (AXP-90, option A). Ses branches organisent la production, mais le visiteur ne doit pas avoir à les comprendre pour avancer.

| Branche | Rôle                                               | Surface                       |
| ------- | -------------------------------------------------- | ----------------------------- |
| OPEN    | Travaux publics, décisions, expériences et erreurs | `/catalogue`, `/os`           |
| PRESS   | Notes de fond, titres, fiches vivantes             | `/bibliotheque`, `/playbooks` |
| FORGE   | Outils et systèmes réutilisables                   | `/outils`                     |
| ATELIER | Parcours et transmission                           | `/parcours`                   |
| CONSEIL | Revue d’architecture et second avis                | `/travaillez-avec-moi`        |
| SIGNAL  | Lettre et distribution régulière                   | `/lettre`                     |

Adama Diallo est l’interface humaine. ADAMA OS est la mémoire, le corpus et la méthode. STRATA ESG est le produit logiciel.

## 3. Le symbole, « Le Tissage »

### Ce qu’il raconte

Trois bandes étroites cousues bord à bord, comme les bandes de pagne tissé d’Afrique de l’Ouest, que l’on tisse sur un métier étroit puis que l’on assemble à la main. Chaque bande est un jeu de données ; la couture les assemble sans les fondre. La bande du milieu est décalée, comme le sont les bandes cousues à la main : le système est construit, pas moulé. Un motif carré monte d’une bande à l’autre, de la source vers l’affirmation, et le dernier est un sceau latérite : la preuve.

Le symbole dit en un signe ce que le site fait : assembler des sources hétérogènes, en garder la trace, et poser une preuve au bout. Il tient d’un savoir-faire de l’Afrique de l’Ouest, sans emprunter de motif traditionnel précis, et il se lit aussi bien à Dakar qu’à Paris.

### Pourquoi celui-ci, parmi cinq pistes

La planche `logo/exploration/planche.html` présente les cinq pistes, chacune à 16, 32 et 256 pixels.

| Piste                  | Idée                                                          | Verdict                                                                                                                      |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Le Poinçon             | La marque d’orfèvre qui authentifie qui a fait l’objet        | Écartée : forte sur la preuve, muette sur la donnée et l’origine                                                             |
| **Le Tissage**         | Trois bandes de données cousues, un motif qui monte, un sceau | **Retenue** : la seule qui dit à la fois l’assemblage, la provenance, la preuve et l’origine, et qui reste nette à 16 pixels |
| Le Glyphe sur cotes    | Un signe abstrait construit sur une grille cotée              | Écartée : juste en construction, sans récit                                                                                  |
| Le Monogramme en épure | Un A et un D tracés comme une épure d’ingénieur               | Écartée : un A reste un A générique                                                                                          |
| Le Méridien            | Dakar et Paris reliés par un arc mesuré                       | Écartée : se lit comme une carte ou un globe                                                                                 |

### Construction

Grille de 48 unités. Bandes de 12 unités de large et 32 de haut, coutures de 2 unités. Bande 1 en x 4, y 6 ; bande 2 en x 18, y 10 ; bande 3 en x 32, y 6. Motifs de 6 unités : jours en (7, 26) et (21, 19), sceau en (35, 12). Les centres des trois motifs sont alignés sur une droite de pente −1/2 : la ligne de provenance. La géométrie fait foi dans `apps/web/components/marque/symbole.tsx` ; un test vérifie que les motifs restent dans leur bande et que la ligne reste droite.

Le symbole se dessine en traits de construction (cotes, axes des bandes, cercle du sceau, ligne de provenance) avant d’être rempli. C’est la séquence du chargement de l’accueil, du fichier animé et de l’image Open Graph.

### Fichiers

| Fichier                                                                       | Usage                                                            |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `logo/adama-os-symbole.svg`                                                   | Symbole couleur, sur ivoire ou blanc                             |
| `logo/adama-os-symbole-sombre.svg`                                            | Symbole sur encre ou indigo                                      |
| `logo/adama-os-symbole-mono.svg`                                              | Impression une couleur, sceau évidé                              |
| `logo/adama-os-horizontal.svg`, `-horizontal-sombre.svg`                      | Symbole et mot-symbole côte à côte                               |
| `logo/adama-os-vertical.svg`                                                  | Symbole au-dessus du mot-symbole                                 |
| `logo/adama-os-mot-symbole.svg`                                               | Mot-symbole seul, vectorisé                                      |
| `logo/adama-os-anime.svg`                                                     | Construction en épure, puis remplissage, en moins de 1,2 seconde |
| `apps/web/app/icon.svg`, `favicon.ico`, `apple-icon.png`                      | Favicon et icône d’écran d’accueil                               |
| `apps/web/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icônes d’application, dont la version masquable                  |
| `youtube/adama-os-youtube-watermark.png`                                      | Filigrane vidéo                                                  |

Le favicon est une version ajustée à la grille des pixels : à 16 pixels, l’échelle exacte donnait des coutures d’un demi-pixel.

### Règles

- garder autour du symbole un espace au moins égal à la largeur d’une bande
- ne jamais ajouter d’ombre, de dégradé, de texture ou d’effet lumineux
- ne jamais déplacer le sceau, ni le colorer autrement qu’en latérite
- ne jamais refermer les jours, sauf dans la version monochrome où le sceau devient un jour
- sous 24 pixels, utiliser le favicon, pas le symbole réduit

## 4. Couleurs

Palette écrite en OKLCH, propre à ADAMA OS. Elle ne reprend aucune valeur de STRATA ESG. Source unique : `adama-os-tokens.css`, identique au site (`apps/web/app/identite.css`) ; `scripts/contraste.mjs` échoue si les deux divergent.

| Nom                | OKLCH                   | Hexadécimal | Usage                                                 |
| ------------------ | ----------------------- | ----------- | ----------------------------------------------------- |
| Ivoire             | `oklch(0.966 0.013 84)` | `#F8F3EA`   | fond principal                                        |
| Encre              | `oklch(0.2 0.03 268)`   | `#101524`   | texte, structure, feuilles sombres, boutons           |
| Indigo de teinture | `oklch(0.36 0.12 272)`  | `#29347B`   | liens, thème alternatif                               |
| Indigo profond     | `oklch(0.27 0.09 272)`  | `#182052`   | feuilles indigo, rideau                               |
| Latérite           | `oklch(0.6 0.15 40)`    | `#C85B32`   | sceau, traits, grands titres accentués                |
| Latérite texte     | `oklch(0.49 0.145 38)`  | `#A13A16`   | mot accentué et lien sur fond clair                   |
| Ocre               | `oklch(0.79 0.12 62)`   | `#F2A866`   | accent sur feuille sombre                             |
| Pierre             | `oklch(0.47 0.03 268)`  | `#535B6C`   | texte secondaire                                      |
| Signal             | `oklch(0.88 0.19 128)`  | `#B3EE55`   | états techniques sur feuille sombre, jamais décoratif |
| Signal texte       | `oklch(0.47 0.12 145)`  | `#256C2C`   | états techniques sur fond clair                       |

L’indigo vient de la teinture à l’indigo de l’Afrique de l’Ouest, la latérite de la terre rouge du Sahel et du Sénégal oriental. Le signal est la seule couleur vive, réservée à ce qui est en ligne, réussi ou actif.

### Rôles, clair et sombre

Les feuilles du site ne lisent jamais une couleur brute : elles lisent des rôles (`--fond`, `--texte`, `--texte-2`, `--accent-texte`, `--feuille`, `--sur-feuille`…). Le mode sombre ne redéfinit que les rôles : la page passe à l’encre profonde, et les feuilles sombres passent à l’indigo, pour que l’alternance reste lisible.

Les sections alternent en feuilles : ivoire, encre, indigo, creux. Chaque feuille monte sur la précédente, coins supérieurs arrondis.

### Contraste

Chaque paire texte et fond passe 4,5:1, et 3:1 pour les grands titres et les éléments d’interface, en clair, en sombre et dans le thème alternatif du terminal. Vérifié par `node scripts/contraste.mjs` et par `apps/web/tests/identite.test.ts`. La latérite vive ne porte jamais de petit texte sur ivoire.

### Thème alternatif

La commande `theme` du terminal bascule l’accent latérite vers l’indigo de teinture et le signal des feuilles vers l’ocre. Même palette, autre lecture, contrastes vérifiés.

## 5. Typographie

Trois familles autohébergées, licence SIL Open Font License 1.1, notées dans `apps/web/CREDITS.md`.

| Rôle      | Police                                | Usage                                                     |
| --------- | ------------------------------------- | --------------------------------------------------------- |
| Grotesque | Schibsted Grotesk, variable 400 à 900 | titres, interface, texte courant                          |
| Serif     | Newsreader italique, variable         | un seul mot accentué par titre, la question d’un acte     |
| Monospace | IBM Plex Mono 400 et 500              | identifiants de preuve, dates, mesures, cotes, sur-titres |

Un titre porte au plus un mot en Newsreader italique, en latérite texte. Le mot accentué du premier écran est souligné d’un trait tracé à la main, qui se dessine au chargement. IBM Plex Mono indique qu’une information est datée, mesurée ou traçable.

| Niveau     | Taille     | Jeton         |
| ---------- | ---------- | ------------- |
| Display    | 44 à 96 px | `--t-display` |
| Titre 1    | 36 à 68 px | `--t-h1`      |
| Titre 2    | 30 à 52 px | `--t-h2`      |
| Titre 3    | 20 à 25 px | `--t-h3`      |
| Corps      | 16 à 18 px | `--t-corps`   |
| Métadonnée | 12 px      | `--t-meta`    |

Toutes les tailles sont fluides (`clamp()`).

## 6. Mouvement

Le moteur de mouvement est porté du kit STRATA ESG et adapté : GSAP 3.15 (ScrollTrigger, SplitText), `@gsap/react`, Lenis 1.3.26 sur l’horloge de GSAP, OGL pour le symbole en trois dimensions.

- tout se charge après l’hydratation, au repos du navigateur, et rien sous réduction de mouvement ;
- un état de départ n’est posé que sur un élément hors de l’écran : rien d’affiché ne disparaît ;
- un seul rideau, le tracé en épure du symbole, moins de 1,2 seconde, seulement à la première visite ;
- le symbole en trois dimensions traverse l’accueil et se transforme à chaque acte ; il n’est rendu que lorsqu’il bouge et coupé hors de l’écran ;
- courbes `expo.out` et `quart.out`, aucune courbe élastique, aucun curseur personnalisé ;
- tout défilé en boucle a un bouton pause.

## 7. États de connaissance

Chaque actif possède un niveau de maturité : CONCEPT, RECHERCHE, TESTÉ, PROUVÉ ou ARCHIVÉ. Il est toujours écrit en toutes lettres, avec une forme, jamais par la seule couleur.

Chaque affirmation sensible reçoit si nécessaire une étiquette : OBSERVATION, HYPOTHÈSE, EXPÉRIENCE, RÉSULTAT ou RÉFUTÉ.

## 8. Mise en page

- commencer par une promesse précise
- limiter la navigation principale à cinq entrées ; le catalogue complet vit dans le grand menu
- numéroter les sections, façon publication de recherche
- faire apparaître une preuve avant la première longue explication
- chaque preuve et chaque décision portent un bloc de citation copiable
- conserver une grande respiration verticale
- terminer chaque page par une seule prochaine action principale

## 9. Images et illustrations

Les illustrations sont dessinées en SVG dans la grammaire du symbole : bandes, grille, sceau latérite. Elles montrent un système, un matériau ou une interface. Jamais de scène de bureau, de poignée de main, de globe, de feuille, de circuit, de silhouette ni de signe évoquant un traitement automatique.

## 10. Contrôle avant publication

1. La première phrase dit-elle clairement ce qui a été fait ou ce qui est proposé ?
2. La date, la source et les limites sont-elles visibles ?
3. Le visiteur sait-il quelle action accomplir ensuite ?
4. La frontière avec STRATA ESG est-elle claire ?
5. Les affirmations chiffrées indiquent-elles leur méthode ?
6. `node scripts/contraste.mjs` passe-t-il ?

# Budget de complexite

Ce document fixe les plafonds de surface d'Adama OS. Les valeurs vivent dans
`docs/budget.json`, `scripts/inventory.mjs` les mesure, `docs/INVENTORY.md`
publie le resultat.

Severite actuelle : **erreur** (vague V2, C9-T7). `pnpm inventory` sort en
code non nul sur un depassement, et `scripts/check-frontend.ps1` s'arrete avec
lui. En complement, `apps/web/tests/budget.test.ts` refait la mesure des trois
plafonds N1 : l'inventaire se lance a la main, et une commande qu'on oublie de
lancer ne protege rien le jour ou on est presse.

## Pourquoi un budget

Un site personnel ne meurt pas d'un defaut, il meurt d'accumulation. Chaque
ajout est defendable pris seul, et l'ensemble devient illisible. Le budget
retire la decision au moment de l'ajout : le plafond a ete fixe a froid, il
s'oppose a chaud.

Regle de tenue : **un plafond se releve par ecrit, jamais en silence.** Toute
modification de `docs/budget.json` s'accompagne d'une ligne dans la section
« Journal des plafonds » ci-dessous, et de sa raison dans le message de commit.
Un plafond qu'on releve a chaque fois qu'il gene ne mesure plus rien.

## Les niveaux de lecture

Le site s'adresse a trois profondeurs de lecture. Le budget porte sur les deux
premieres, celles qu'un lecteur presse traverse.

### N1, l'ecran d'accueil

Ce qu'un recruteur voit sans faire defiler la page. Il doit repondre a une
seule question : qui est cette personne, et que sait-elle faire.

| Plafond           | Max | Mesure                                                     |
| ----------------- | --- | ---------------------------------------------------------- |
| Un titre          | 1   | balises `<h1>` entre `hero-copy` et `hero-copy-lines`      |
| Trois lignes      | 3   | paragraphes entre `hero-copy-lines` et `hero-actions`      |
| Trois actions     | 3   | boutons et liens entre `hero-actions` et `hero-art`        |
| Trois competences | 3   | entrees de `COMPETENCES` dans `apps/web/content/profil.ts` |

Depuis la couche C9, l'ordre du premier ecran fait partie du plafond autant
que le compte : nom, trois domaines, une phrase de capacite, une phrase de
situation, une ligne de disponibilite autonome, puis trois actions.
`apps/web/tests/narrative.test.tsx` verrouille cet ordre. Un texte peut etre
reecrit, il ne peut plus etre redescendu.

Un quatrieme bouton dans l'accroche ne s'ajoute pas a trois autres : il les
affaiblit tous les quatre. C'est la raison du plafond, et elle ne se negocie
pas au motif que la nouvelle action est importante.

### N2, la premiere profondeur

Ce qu'un lecteur interesse parcourt : les projets, les preuves, le parcours.

| Plafond            | Max | Mesure                                               |
| ------------------ | --- | ---------------------------------------------------- |
| Trois fiches       | 3   | entrees de `FICHES` dans `apps/web/content/projets/` |
| Quatre preuves     | 4   | composants `ProofTile` de la Couche D                |
| Quatre experiences | 4   | entrees du bandeau `experience-name` de la home      |

Le plafond des preuves est a quatre et non a trois, contrairement a la doctrine
initiale. Raison ecrite : les quatre preuves sociales affichees (AG2R LA
MONDIALE, Younivibe, AFEV, ministere des Finances du Senegal) sont toutes
reelles et de natures differentes, entreprise, association, administration.
En retirer une pour tenir un plafond rond retirerait de l'information vraie,
ce qui est exactement le contraire de ce que la couche C1 installe. Le plafond
est donc pose a quatre et fige la : une cinquieme ne passe pas.

### N3, la profondeur technique

Le cockpit, les couches A a D, les preuves detaillees, `/verifier`. Pas de
plafond de contenu : c'est le niveau ou la densite est le service rendu. Le
budget y porte sur la surface de code, ci-dessous.

## Surface de code

| Plafond                          | Max |
| -------------------------------- | --- |
| Routes de page                   | 26  |
| Routes d'API                     | 10  |
| Composants                       | 50  |
| Modules `lib`                    | 46  |
| Lignes du plus gros composant    | 700 |
| Lignes du plus gros module `lib` | 460 |

Le plafond de 700 lignes par composant vise `dashboard.tsx`, qui compose la
home entiere. Le depasser voudra dire que la home a cesse d'etre une page pour
devenir une application, et qu'il faut la decouper avant d'y ajouter quoi que
ce soit.

## Quand la mesure elle-meme casse

Trois plafonds se mesurent en comptant un motif dans une region d'un fichier,
delimitee par deux ancrages de texte. Un simple reformatage peut faire
disparaitre un ancrage. La mesure rend alors `-1`, et `-1` est inferieur a
n'importe quel plafond : le budget passerait pour tenu alors que plus rien ne
serait mesure.

Une mesure impossible compte donc comme un depassement, et le rapport ecrit
`mesure cassee` plutot qu'un chiffre. Un plafond qu'on ne sait plus mesurer
n'est pas un plafond tenu, c'est un plafond perdu.

## Ce que le budget ne mesure pas

Nommer les angles morts fait partie du travail.

- **Le poids ressenti.** Un plafond de trois projets ne dit rien de la longueur
  de leurs descriptions. La densite se relit a l'oeil, pas a la machine.
- **La duplication d'idees.** Deux blocs qui disent la meme chose autrement
  tiennent le budget et fatiguent quand meme le lecteur.
- **Le poids reseau.** Ni les octets envoyes ni le temps de rendu ne sont
  mesures ici. Ils relevent d'une autre couche.

Aucun de ces trois points n'est mesure aujourd'hui. Aucun n'est mis sous un
plafond factice pour donner l'illusion de l'etre.

## Journal des plafonds

| Plafond                | Valeur | Raison                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `n2_preuves_cockpit`   | 4      | Ouverture C0. Quatre preuves reelles de natures differentes, voir la section N2. Fige a quatre.                                                                                                                                                                                                                                                                                                                                                            |
| `surface_pages`        | 20     | Vague V2. Les couches C5, C6, C7, C9 et C14 ajoutent huit routes : `/recruteur`, `/projets/[slug]`, `/decisions`, `/decisions/[adr]`, `/revirements`, `/principes`, `/systeme` et `/admin/relecture`. Aucune n'est une variante d'une autre : chacune repond a une question qu'aucune page existante ne traitait. Le depot en compte 18, le plafond est pose a 20, soit deux de marge et non un tiers : la surface de pages est ce qui dilue le plus vite. |
| `n1_cartes_competence` | 3      | Vague V2, C9-T2. Trois cartes, pas dix competences : un recruteur des ressources humaines doit pouvoir classer le profil sans comprendre l'architecture. Une quatrieme carte affaiblirait les quatre.                                                                                                                                                                                                                                                      |
| `severity`             | error  | Vague V2, C9-T7. Le budget cesse d'avertir et fait echouer. La regle etait annoncee depuis l'ouverture C0 ; elle prend effet ici.                                                                                                                                                                                                                                                                                                                          |
| Tous les autres        | ouv.   | Ouverture C0, valeurs posees a l'etat mesure du depot plus une marge de croissance d'environ un tiers.                                                                                                                                                                                                                                                                                                                                                     |

## Ce qui a change de mesure sans changer de plafond

Trois mesures ont ete reancrees a la vague V2, sans que leur plafond bouge.
Une mesure reancree n'est pas un plafond releve, mais elle se documente au
meme titre : sinon personne ne sait plus ce qui est compte.

- Les quatre plafonds N1 pointaient sur les ancres `hero-copy`, `hero-actions`
  et `hero-note`. La refonte du premier ecran a fait monter la ligne de
  disponibilite au dessus des actions, donc `hero-note` a disparu et l'ordre
  des ancres a change. Nouvelles ancres : `hero-copy`, `hero-copy-lines`,
  `hero-actions`, `hero-art`.
- `n2_projets_home` comptait les entrees d'un tableau `projects` ecrit dans
  `dashboard.tsx`. Ce tableau n'existe plus : les trois cartes de l'accueil
  sont projetees depuis les fiches versionnees de `apps/web/content/projets/`.
  La mesure compte donc les entrees de `FICHES`, ou vit desormais la verite.

Une quatrieme mesure a ete reancree le 2 septembre 2026, et une cinquieme
ajoutee.

- `n2_experiences_home` comptait les occurrences de `className="experience-name`
  dans `dashboard.tsx`. Le bandeau affiche desormais les marques des
  organisations, plus leurs noms composes en typographie : la chaine comptee
  ne decrivait plus rien, et une mesure qui ne mesure rien est pire que pas de
  mesure, parce qu'elle rassure. Le bandeau est projete depuis `EXPERIENCES`,
  la mesure compte donc les entrees de cette liste dans
  `apps/web/content/profil.ts`. Plafond inchange a quatre.
- `n2_marques_home`, plafond cinq, est nouveau. Une marque d'organisation est
  la chose la plus facile a ajouter et la plus difficile a retirer : chacune
  demande deux fichiers, une hauteur reglee a l'oeil, et elle occupe la
  largeur d'une ligne entiere sur telephone. Cinq, c'est les quatre
  experiences plus la formation. La sixieme se discute, elle ne se glisse
  pas.

## Quatre plafonds releves le 2 septembre 2026, vagues V4 a V8

Les couches C3, C4, C8, C10, C11, C12 et C13 ajoutent quatre pages publiques,
dix composants et onze modules. Aucune n'ajoute de capacite : elles rendent
visible ce qui existait deja et que rien ne montrait. Les quatre plafonds
ci-dessous sont releves par ecrit, avec leur raison, et pas d'un cran de plus
que ce que la vague a reellement consomme.

- **`surface_pages`, de 20 a 24.** Quatre routes ajoutees : `/technique`,
  `/confiance`, `/journal` et `/systeme/pannes`. Chacune ferme une question
  qu'un lecteur pose et que le site laissait sans reponse. Aucune n'est une
  variante d'une autre : les alias `?for=recruiter` et `?mode=technical`
  redirigent vers une page existante au lieu de rendre une seconde vue, ce
  qui est precisement la regle posee en C9 apres la suppression de
  `recruiter-view.tsx`. La marge restante, deux routes, est volontairement
  etroite : la cinquieme page se discutera.
- **`surface_composants`, de 44 a 50.** Dix composants : matrice de sante,
  carte de l'ecosysteme, journal de construction, frise d'ingenierie, schema
  d'architecture, schema des flux, panneau d'integrite, inventaire technique,
  limites connues et emetteur d'evenements. Deux d'entre eux existent
  precisement PARCE QUE le budget interdit de grossir : le journal a ete
  ecrit a part plutot que d'etre glisse dans `dashboard.tsx`, et la matrice a
  part plutot que dans la Couche A.

## Deux routes pour l’expansion du 9 septembre 2026

- **`surface_pages`, de 24 à 26.** `/methode` rend la chaîne de provenance
  utilisable sans connaître le cockpit. `/revue-architecture` isole l’entrée
  conseil du parcours recruteur. Ces deux pages répondent à deux tâches
  distinctes et gardent une page de marge.
- **`surface_lib`, de 40 a 46.** Onze modules, tous purs sauf un :
  `health/types`, `health/observations`, `health/criteria`, `health/collect`,
  `ecosystem/map`, `chantiers`, `inventory`, `integrity`, `analytics-events`,
  `ai/config` et `terminal/inspect`. La proportion compte plus que le nombre :
  un seul de ces modules lit quelque chose, les autres sont des regles pures,
  donc testables sans base et rejouables par `node scripts/failure-drill.mjs`.
  C'est cette separation qui a permis au drill de valider le VRAI module de
  sante au lieu d'une copie.
- **`taille_lib`, de 400 a 460.** `lib/health/criteria.ts` fait 446 lignes
  au compte de `wc -l`, 447 au compte de l'inventaire, qui ajoute la derniere
  ligne sans retour chariot.
  Sa decomposition structurelle est deja faite, et en quatre modules :
  les types, la forme de ce qui est observe, les regles, la collecte. Sa
  longueur n'est pas de la complexite, c'est de la PROSE : vingt-deux
  criteres qui portent chacun leur phrase de francais courant, parce que
  l'interdit de la couche C3 est qu'aucun code d'erreur technique n'atteigne
  l'ecran. Couper ces vingt-deux criteres en deux fichiers pour tenir un
  plafond aurait ete un decoupage de complaisance, et il aurait rendu la
  table des criteres plus difficile a relire, ce qui est exactement le
  contraire du but.

Deux mesures nouvelles accompagnent ces relevements, et elles ne portent pas
de plafond : le nombre de regles de securite au niveau des lignes, et le
nombre de regles declarees par l'historique des migrations. Les deux figurent
dans l'inventaire parce qu'un audit du 7 aout 2026 avait annonce dix-sept
regles quand il y en avait vingt et une, et qu'il a fallu recompter a la main
pour s'en apercevoir. Un chiffre qu'aucune commande ne mesure finit toujours
par mentir.

## La lettre SIGNAL, 13 septembre 2026 (EH0)

- **`surface_pages`, de 26 à 28.** `/lettre` est la surface de collecte
  exigée par EH0 : un seul champ, une case jamais précochée, la mention
  complète sur la page. `/admin/lettre` est la console privée qui tient la
  note trimestrielle et les demandes d'accès ou d'effacement. La
  confirmation et la désinscription ne créent aucune page de plus : ce sont
  des états de `/lettre`.
- **`surface_api`, de 10 à 11.** `/api/lettre` porte les liens des messages,
  parce qu'un en-tête List-Unsubscribe exige une adresse HTTP qui accepte
  POST (RFC 8058). `/api/lettre/sync` applique chaque jour la rétention que
  la mention annonce et rejoue les messages de bienvenue en attente. Elle
  finit par `/sync` pour être rangée parmi les routes protégées. Deux routes,
  un seul point d'entrée public.
- **`surface_lib`, de 46 à 52.** Sept modules : `vocabulaire`, qui rend enfin
  exécutable la liste fermée d'ADEC-19, et six sous `lettre/` : `config`,
  `jetons`, `messages`, `envoi`, `registre`, `parcours`. Quatre sont purs et
  testés sans réseau ; `envoi` et `registre` sont les deux seules sorties,
  l'une vers l'outil d'envoi, l'autre vers la base dédiée. Les fondre en deux
  fichiers aurait mélangé les refus de configuration, qui protègent XINV-22,
  avec le rendu des messages, et un refus noyé dans du HTML est un refus
  qu'on ne relit plus.

La lettre n'ajoute aucun composant : le formulaire vit sous `app/lettre/`, et
l'ancien formulaire de l'accueil est devenu un simple renvoi vers `/lettre`,
dans le même fichier.

- **`surface_composants`, de 50 à 51, régularisation.** Le relevé du
  13 septembre 2026 a trouvé l'inventaire périmé depuis le commit `ff049be`,
  qui a ajouté `components/open-strata-symbol.tsx` sans le régénérer. Le
  plafond était donc déjà franchi, sans que personne ne le voie, ce qui est
  exactement le défaut qu'un inventaire versionné doit empêcher. Le composant
  est justifié : il est le seul tracé du symbole Open Strata, partagé par
  l'en-tête, l'écosystème et les fiches projet, et le favicon comme les images
  de partage reprennent ses coordonnées. Le plafond est relevé par écrit, pas
  en silence.

## Trois plafonds relevés le 26 septembre 2026, vague X1

Le relevé du 26 septembre 2026 a de nouveau trouvé l'inventaire périmé :
les commits de l'article long (EH3), des deux publications africaines (EJ0),
du journal des versions et du registre des erreurs (EW1, EW3) ont ajouté
huit pages et deux composants sans régénérer `docs/inventory.json`. Le
contrôle d'intégrité les aurait vus au premier passage. Ces ajouts sont
régularisés ici, séparément de ceux de la vague X1, pour que chaque
relèvement garde sa raison.

- **`surface_pages`, de 28 à 40.**
  - Régularisation, huit pages déjà en ligne : les trois articles français
    sous `/articles/`, leurs trois versions anglaises sous `/en/articles/`,
    `/changelog` et `/erreurs`. Un article publié le même jour dans deux
    langues est deux adresses, par construction (EH3, critère de sortie).
  - Vague X1, quatre pages. `/articles` est le temps « Apprendre » du
    parcours en cinq temps (EC4) : sans lui, ce temps n'aurait mené nulle
    part, et la barre ne peut pas renvoyer à `/savoir`, chantier de la
    vague X3. `/travaillez-avec-moi` est la page des quatre portes (EG0).
    `/diagnostic` porte le seul format dont le prix sert de filtre (EG1), et
    la branche EG interdit tout prix sur la page des portes. `/admin/demandes`
    est privée : c'est la console des demandes recevables.
- **`surface_composants`, de 51 à 54.** Régularisation de
  `article-methode-preuve.tsx` et `article-afrique.tsx`, qui rendent les six
  pages d'articles, plus `signature.tsx` pour EC3 : la signature vérifiable
  est rendue par un seul composant, lu par le pied de page des sous-pages,
  l'accueil et la méthode. Trois recopies du même lien auraient divergé au
  premier changement de preuve.
- **`surface_lib`, de 52 à 54.** Deux modules sous `conseil/`.
  `qualification` est pur : la même règle d'acceptation tourne dans le
  navigateur, pour afficher le refus avant que la personne écrive, et sur le
  serveur, qui la rejoue. `registre` est la seule sortie, vers la base
  dédiée et vers l'outil d'envoi. La notification a été fondue dans le
  registre plutôt que tenue à part : les deux gestes vont ensemble, et un
  troisième module n'aurait rien isolé de plus.

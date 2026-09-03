# Bilingue français et anglais, plan de séance

> Écrit le 2 septembre 2026 (couche C13-T7). **Non fait, et volontairement
> non fait à l'aveugle.** Ce document est le plan de la séance dédiée.

## Pourquoi une séance dédiée et pas une passe de plus

C'est une restructuration de routes en `[locale]` qui touche **chaque page**
du site public. Elle ne se valide pas par un typecheck ni par une suite de
tests : elle se valide en navigation réelle, page par page, dans les deux
langues, avec le changement de langue en cours de lecture.

Le risque n'est pas de casser la construction, il est de livrer un site qui
compile et dont la moitié des liens renvoient à la version française depuis
la version anglaise. Ce défaut ne fait rougir aucun test, et il se voit
immédiatement à l'usage.

La priorité, elle, est réelle : la cible recruteur inclut des groupes
internationaux, et un dossier consultable en anglais élargit franchement le
lectorat.

## Ce qui rend la séance possible aujourd'hui, et ne l'était pas avant

Le contenu éditorial est **déjà sorti des composants**. Il vit dans
`apps/web/content/` : profil, fiches projet, décisions, principes, chantiers,
jalons, modes de panne, limites, frontières, divisions. C'est le travail des
couches C5, C9, C14 puis C3, C4 et C11, et c'est lui qui transforme la
traduction d'une réécriture en une extraction.

Ce qui reste dans les composants, ce sont des libellés d'interface courts :
état, bouton, en-tête de colonne. Ils sont nombreux mais ils sont brefs.

## La règle non négociable

**Aucune traduction automatique.** La qualité de langue fait partie de
l'argument du dossier : un site qui affirme ne rien publier sans l'avoir
relu ne peut pas publier une version anglaise que personne n'a lue. Chaque
chaîne anglaise est écrite et relue, ou elle n'existe pas.

Corollaire : une page dont la traduction n'est pas relue **ne se publie pas
en anglais**. Elle renvoie à sa version française avec un lien explicite,
plutôt que d'exister à moitié.

## Séquence, une séance de quatre à six heures

### 1. Extraction, sans traduire (environ 1 h)

Sortir toutes les chaînes d'interface des composants vers des fichiers de
messages, en gardant le français comme unique langue. Vérifier que le site est
**identique** à la fin de cette étape. C'est le seul moment où l'on peut
garantir qu'aucun texte n'a changé, parce que rien n'a été traduit.

Commande de contrôle : `pnpm --filter @adama/web test` et
`pnpm --filter @adama/web build` doivent passer, et le rendu doit être
inchangé à l'œil sur cinq pages tirées au sort.

### 2. Routes en `[locale]` (environ 1 h)

Déplacer les pages publiques sous un segment de langue, avec le français
comme langue par défaut **sans préfixe** : `/technique` reste `/technique`, et
l'anglais vit sous `/en/technique`.

Raison : les liens déjà envoyés par courriel ne doivent pas casser. Un
préfixe `/fr/` obligerait à une redirection permanente sur chaque adresse
existante, dont les pages de vérification citées dans un CV.

À reprendre dans la même étape :

- `apps/web/app/sitemap.ts`, avec les deux langues et les liens alternés ;
- `apps/web/app/robots.ts` ;
- les métadonnées `alternates.languages` de chaque page ;
- `/llms.txt` et le document machine, qui doivent annoncer les deux versions.

### 3. Traduction relue, page par page (2 à 3 h)

Dans cet ordre, et l'ordre est celui de la valeur pour un recruteur
international :

1. `/recruteur`, le parcours en 90 secondes ;
2. l'accueil ;
3. `/technique` ;
4. les trois fiches projet ;
5. `/confiance` ;
6. `/preuves` et une page de vérification ;
7. `/decisions` et `/journal`.

Les pages `/principes`, `/revirements` et `/systeme` peuvent rester
françaises dans un premier temps, avec un lien explicite. Ce sont des pages de
pensée : une traduction approximative y coûterait plus que leur absence.

### 4. Navigation réelle (environ 1 h)

Le contrôle qui justifie la séance dédiée. Dans les deux langues :

- ouvrir chaque page publique et suivre **tous** les enchaînements de fin de
  page ;
- basculer de langue depuis le milieu d'une page longue, et vérifier qu'on
  arrive sur la même page et non sur l'accueil ;
- vérifier qu'aucun lien anglais ne renvoie vers une page française sans le
  dire ;
- vérifier l'aperçu de partage dans les deux langues ;
- relancer `node scripts/audit-render.mjs` sur les deux langues : le contrôle
  de débordement trouvera les libellés anglais plus longs qui cassent une
  grille, ce qui est le défaut visuel le plus fréquent d'une mise en bilingue.

## Ce qu'il faudra ajouter au budget de complexité

Le nombre de routes double du point de vue de la mesure. `surface_pages`
devra être relevé, **par écrit**, dans `docs/BUDGET.md`, ou la mesure devra
compter les routes indépendamment de la langue. La seconde option est la
bonne : une page traduite n'est pas une page de plus à concevoir.

## Ce qu'il ne faut pas faire

- Ne pas traduire à la volée, ni au rendu, ni par un service.
- Ne pas publier une page anglaise non relue, même « en attendant ».
- Ne pas traduire les identifiants de décision, les noms de produits, les
  noms de dépôts ni les clés internes.
- Ne pas dupliquer le contenu éditorial dans deux fichiers parallèles sans
  garde-fou : un test doit vérifier que chaque clé française a sa
  contrepartie anglaise, sinon la version anglaise dérivera en silence.

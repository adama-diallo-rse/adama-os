# Cohérence des quatre surfaces publiques

> Écrit le 2 septembre 2026 (couche C13-T4). Liste de contrôle **manuelle**,
> à relire avant chaque campagne de candidature.

## Pourquoi une liste et pas un test

Trois des quatre surfaces vivent hors du dépôt : le CV en PDF, le profil en
ligne et les pages de dépôt. Aucun test ne peut les lire. Ce document est
donc une liste de contrôle, et elle se relit à la main.

Ce qui EST testé, en revanche, l'est vraiment :

- `apps/web/tests/profil.test.ts` refuse qu'un intitulé de poste, une zone ou
  une échéance soit écrit ailleurs que dans `apps/web/content/profil.ts` ;
- `apps/web/tests/cv.test.ts` refuse qu'une affirmation du CV n'ait pas de
  preuve correspondante dans le registre, et refuse que `content/cv.ts`
  recopie un intitulé au lieu de le lire ;
- `apps/web/tests/analytics-events.test.ts` refuse qu'un événement soit émis
  sans figurer dans la liste déclarée.

Le défaut que tout cela ferme est documenté : le 2 septembre 2026, quatre
intitulés de poste divergents cohabitaient dans le dépôt, et un agent qui
préfiltre une candidature lisait un intitulé que la page ne portait pas.

## Les quatre surfaces

| Surface         | Où                                          | Qui la met à jour |
| --------------- | ------------------------------------------- | ----------------- |
| Site            | ce dépôt                                    | une commande      |
| CV              | `apps/web/public/adama-diallo-cv.pdf`       | à la main         |
| Profil en ligne | le profil personnel du réseau professionnel | à la main         |
| Dépôts          | les pages publiques des dépôts              | à la main         |

Attention, page d'entreprise : celle du groupe est `company/strata-fr`. La
page `company/strata-esg` appartient à une société **tierce** et ne doit
jamais être citée, ni sur le site, ni sur le CV, ni dans un message.

## La liste de contrôle

Cocher les huit lignes avant d'envoyer la première candidature d'une
campagne. Une seule contradiction suffit à annuler le travail des douze
couches précédentes, parce qu'elle est la seule chose que le lecteur
retiendra.

### 1. Intitulé de poste actuel

La source est `POSTE_ACTUEL` dans `apps/web/content/profil.ts`.

- [ ] identique sur le CV
- [ ] identique sur le profil en ligne
- [ ] identique dans les données structurées du site (généré, donc automatique)

### 2. Postes recherchés

La source est `RECHERCHE.postes`. Trois intitulés, dans le même ordre.

- [ ] les trois figurent sur le CV, dans cet ordre
- [ ] le profil en ligne n'en annonce pas un quatrième
- [ ] aucun n'est reformulé « pour faire mieux » dans un message

### 3. Disponibilité et contrat

La source est `RECHERCHE.contrats`, `RECHERCHE.mois`, `RECHERCHE.annee`,
`RECHERCHE.zone`.

- [ ] le mois de prise de fonction est le même partout
- [ ] les types de contrat sont les mêmes partout
- [ ] la zone géographique porte ses accents partout, Île-de-France compris

### 4. Expériences

La source est `EXPERIENCES`. Quatre entrées, avec leur rôle exact.

- [ ] les quatre organisations figurent sur le CV, avec le même rôle
- [ ] aucune date ne diffère entre le CV et le profil en ligne
- [ ] aucun rôle n'est reformulé sur une seule des surfaces

### 5. Formation

La source est `FORMATION`, qui ne porte **que l'établissement**.

- [ ] aucun intitulé de diplôme n'apparaît sur le site tant qu'il n'a pas été
      dicté
- [ ] l'établissement est nommé de la même façon sur les trois surfaces

### 6. Produits et leur état

La source est la table du registre produits.

- [ ] aucun produit n'est annoncé « en ligne » sur le CV s'il ne l'est pas
      dans le registre
- [ ] STRATA Watch n'est cité qu'en projet, jamais comme en ligne
- [ ] aucun prix ni chiffre commercial n'est recopié depuis les pages produit

### 7. Technologies

La source est l'inventaire généré, `docs/inventory.json`.

- [ ] aucune technologie annoncée sur le CV qui ne figure pas dans les
      dépendances directes
- [ ] le précédent est documenté : la documentation du dépôt a annoncé quatre
      bibliothèques d'interface qui n'ont jamais été installées

### 8. Chiffres

- [ ] aucun chiffre du CV qui ne soit pas soit mesuré par une commande, soit
      adossé à une affirmation du registre de preuve
- [ ] aucun pourcentage de couverture de test, nulle part
- [ ] aucune fréquence de déploiement, aucun délai de mise en production :
      ce dépôt n'a pas d'intégration continue, ces valeurs ne sont pas
      mesurées

## Recherche du nom

L'objectif n'est pas le trafic. C'est qu'une recherche sur le nom trouve un
**ensemble cohérent**, et non trois personnes qui se ressemblent.

- [ ] une recherche sur le nom fait remonter le site, le profil et le dépôt
- [ ] les trois annoncent le même intitulé
- [ ] l'aperçu de partage du site affiche le bon titre et la bonne
      disponibilité
- [ ] `/llms.txt` et les données structurées disent la même chose que la page

## Après chaque relecture

Noter la date ci-dessous. Une liste de contrôle sans date de dernière
relecture est une intention.

| Date      | Relue par | Écarts trouvés                  |
| --------- | --------- | ------------------------------- |
| _à faire_ | Adama     | _avant la première candidature_ |

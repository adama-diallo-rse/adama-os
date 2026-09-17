# EW1, changelog hebdomadaire

Version 1, 17 septembre 2026.

La page publique est `/changelog`. Elle montre le plus récent en premier et
conserve toutes les semaines publiées.

## Gabarit de quinze minutes

Chaque édition comporte huit lignes courtes, réparties dans trois blocs.

### Fait

1. Ce qui a été livré.
2. La preuve disponible.
3. Ce qui est maintenant utilisable.

### Décidé

4. La décision prise.
5. L'option écartée.

### Appris

6. Ce qui a été compris.
7. Ce qui reste incertain.
8. La prochaine vérification.

Chaque ligne décrit un fait du dépôt ou une décision écrite. Aucun client,
prospect ou dossier n'est mentionné. Aucun chiffre d'audience n'est affiché.

## Alimentation

Les faits sont préparés depuis les commits réels du dépôt. La commande de
lecture hebdomadaire est :

```powershell
git log --since="monday 00:00" --until="next monday 00:00" --date=short --pretty=format:"%ad | %h | %s" --date-order
```

La commande fournit la matière. Elle ne rédige pas les lignes 4 à 8, qui
restent une relecture humaine. Les branches ne sont jamais publiées dans le
changelog.

## Semaine vide

Une semaine vide est publiée avec huit lignes honnêtes : aucun livrable, aucune
décision, aucune leçon nouvelle, et la prochaine vérification explicitement
datée. L'absence de progrès est une information. La page ne disparaît pas.

## Erreurs et corrections

Une erreur apparaît dans la ligne « appris » de la semaine où elle est
constatée. La correction apparaît dans la même édition ou dans l'édition
suivante, avec le lien vers la preuve. L'ancien texte reste visible.

## Première édition

La première édition couvre la semaine du 14 au 20 septembre 2026. Elle est
préparée à partir de la matière réellement présente dans le dépôt et attend la
vérification de la page en production avant d'être présentée comme publiée.

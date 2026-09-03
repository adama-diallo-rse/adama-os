# Marquage lisible par machine, note de préparation

> Écrit le 31 août 2026 (couche L10-T3). Échéance d'application :
> **2 décembre 2026**. Mise en œuvre prévue en novembre ; cette note existe
> pour que la décision technique soit prise avant, pas pendant.

## 1. Ce qui est concerné dans ce dépôt

Deux surfaces produisent du contenu généré, et deux seulement :

| Surface             | Fichier                                                 | Nature                        |
| ------------------- | ------------------------------------------------------- | ----------------------------- |
| Réponses d'adama.ai | `apps/web/app/api/chat/route.ts`                        | texte généré, diffusé en flux |
| Images de partage   | `apps/web/lib/og.tsx` et les onze `opengraph-image.tsx` | images générées au build      |

Le reste du site est écrit à la main ou lu en base : hors périmètre.

## 2. Ce qui est déjà fait

La mention **visible** exigée par l'article 50 est en place depuis le 31 août
2026 : `components/automation-notice.tsx`, montée au premier contact dans le
panneau adama.ai, plus une mention courte permanente dans son en-tête. Elle est
verrouillée par `apps/web/tests/legal.test.tsx`.

Le gabarit des images OG est centralisé dans `lib/og.tsx` : le marquage se
posera à un seul endroit pour les onze images.

## 3. Ce qui reste à trancher

**Pour le texte.** Le flux du Vercel AI SDK ne porte pas d'enveloppe où glisser
une provenance sans casser le contrat de `useChat`. Deux options :

1. en-tête de réponse HTTP `X-Content-Provenance: ai-generated` posé dans
   `toUIMessageStreamResponse`. Simple, invisible pour l'utilisateur, lisible
   par un agent qui appelle l'API. Ne survit pas à un copier-coller ;
2. bloc de provenance en fin de réponse, côté prompt, avec la source et la
   date. Survit au copier-coller, mais pollue la lecture et dépend du modèle.

Option retenue à instruire : la première, complétée par la mention visible
existante. Le texte d'un agent conversationnel n'est pas un média diffusable au
sens du règlement ; l'exigence porte d'abord sur les contenus synthétiques
publiés.

**Pour les images.** Les images OG de ce site sont composées par `satori` à
partir de formes et de texte : ce ne sont pas des images photoréalistes
générées par un modèle. L'obligation de marquage vise les contenus synthétiques
susceptibles d'induire en erreur sur leur nature. Une image de partage faite de
rectangles et d'un wordmark n'entre pas dans ce cas.

Décision proposée : **ne pas marquer** les images OG actuelles, documenter ce
raisonnement ici, et poser le marquage le jour où une image générée par modèle
entre dans le site. Si le marquage devenait exigé quand même, il se pose en
métadonnée PNG (chunk `iTXt`) dans `lib/og.tsx`, sur les onze images en une
seule modification.

## 4. Ce qu'il faut faire, et quand

| Échéance                 | Geste                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------- |
| ~~novembre 2026~~        | ~~poser l'en-tête `X-Content-Provenance` et son test~~ **fait le 2 septembre 2026** |
| octobre 2026             | relire le texte d'application publié d'ici là, confirmer ou infirmer la section 3   |
| avant le 2 décembre 2026 | vérifier qu'aucune image générée par modèle n'a été ajoutée sans marquage           |

### Ce qui a été posé le 2 septembre 2026 (couche C11-T5)

L'option 1 de la section 3 est appliquée. `app/api/chat/route.ts` pose un
en-tête `X-Content-Provenance` sur la réponse en flux, dont la valeur vit dans
`lib/legal.ts` sous le nom `PROVENANCE_HEADER` et nulle part ailleurs.

Ce n'est **pas** une preuve, et le vocabulaire interdit de ce dépôt s'applique
en premier : un en-tête HTTP et une métadonnée d'image sont des déclarations.
La mention visible reste ce qui informe la personne ; l'en-tête informe un
programme.

Les images de partage restent non marquées, pour la raison écrite en section 3
et non par omission : elles sont composées de rectangles et de texte, pas
générées par un modèle. La page `/confiance` porte ce raisonnement en clair,
avec la date d'échéance visible, plutôt que de le laisser dans un document
interne.

## 5. Vocabulaire

Interdits sur ce site, comme dans tout l'espace : infalsifiable, inaltérable,
horodatage certifié, registre qualifié. Un en-tête HTTP et une métadonnée PNG
sont des déclarations, pas des preuves.

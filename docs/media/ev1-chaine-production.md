# EV1, chaîne de production écrite

Version 1, 17 septembre 2026.

La chaîne fonctionne avec les deux créneaux du système média. Elle ne suppose
ni suivi quotidien, ni tableau supplémentaire.

## Les neuf étapes

| Étape                    | Où                                       | Déclencheur                               | Délai maximal |
| ------------------------ | ---------------------------------------- | ----------------------------------------- | ------------- |
| 1. Capturer              | `ADAMA_ARCHIVE/_inbox/`                  | Une idée apparaît, même en rendez-vous    | 0 jour        |
| 2. Qualifier             | `ADAMA_ARCHIVE/_inbox/` puis le journal  | Le dimanche de chantier                   | 7 jours       |
| 3. Rattacher             | Objet source AXP, AMS, XDEC, EXP ou FAIL | La qualification est acceptée             | 1 jour        |
| 4. Écrire la note        | `ADAMA_ARCHIVE/_work/`                   | Le chantier du dimanche                   | 7 jours       |
| 5. Produire le brouillon | `ADAMA_ARCHIVE/_work/`                   | La note contient une source et une sortie | 7 jours       |
| 6. Relire                | `ADAMA_ARCHIVE/_review/`                 | Le brouillon est complet                  | 7 jours       |
| 7. Publier               | Surface publique prévue par l'objet      | La relecture est validée                  | 3 jours       |
| 8. Archiver              | `ADAMA_ARCHIVE/publie/AAAA/`             | La publication est constatée              | 1 jour        |
| 9. Journaliser           | Changelog et `_journal.md`               | L'archive est vérifiée                    | 1 jour        |

## Capture en situation réelle

Une idée arrivée le mardi à 15 h entre dans `ADAMA_ARCHIVE/_inbox/` sous le
nom `PROV-YYYYMMDD-HHMM-titre-court.md`. Le fichier contient la date, la source
ou le contexte, l'idée brute et la prochaine question. Aucun brouillon public
n'est écrit à ce moment-là.

La qualification du dimanche décide une seule chose : continuer ou abandonner.
Une idée abandonnée reste dans `_inbox/` avec une ligne dans `_journal.md`.
Elle n'est pas supprimée silencieusement.

## Abandon

Un brouillon qui n'a pas changé pendant deux séances de dimanche est fermé. Il
est déplacé dans `ADAMA_ARCHIVE/_abandons/AAAA/` et reçoit une raison courte.
Si sa source reste utile, une nouvelle note peut repartir de la source, sans
réouvrir le brouillon comme s'il était vivant.

## Nommage normalisé

Le nom normalisé est posé à l'étape 8 :

`AAAA-MM-JJ_MEDIA-XXX_surface_titre-court_v01.ext`

Avant FB1, l'objet conserve son préfixe `PROV`. Après attribution du code
MEDIA, l'ancien nom est conservé dans la ligne du journal et le fichier est
renommé une seule fois.

## Mesure sans nouveau tableau

Chaque fichier porte les dates `captured_at`, `qualified_at`, `published_at` et
`archived_at` dans son en-tête. La conformité se lit dans le fichier et dans
`_journal.md`. Aucun compteur d'audience ne fait partie de la chaîne.

## Critère EV1

Le critère de sortie est franchi lorsque quatre objets consécutifs ont parcouru
les neuf étapes dans les délais ci-dessus. La fenêtre de quatre semaines court
à partir de la première capture validée.

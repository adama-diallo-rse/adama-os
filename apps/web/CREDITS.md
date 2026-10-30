# Crédits et licences des ressources tierces

Relevé du 30 octobre 2026, refonte de l’identité d’ADAMA OS.

## Polices

Les trois familles sont autohébergées dans `app/fonts/` et servies par `next/font/local`. Aucune requête ne part vers un service de polices tiers. Chaque fichier de licence est copié à côté de la police.

| Famille                                             | Fichier                                                                        | Rôle                                                    | Licence                                                | Source                                                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Schibsted Grotesk (variable, graisses 400 à 900)    | `schibsted-grotesk-latin-wght-normal.woff2`                                    | Toute la typographie : titres, interface, texte courant | SIL Open Font License 1.1, `schibsted-grotesk-OFL.txt` | The Schibsted-Grotesk Project Authors, github.com/schibsted/schibsted-grotesk, paquet `@fontsource-variable/schibsted-grotesk` 5.3.0 |
| Newsreader (variable, italique, graisses 200 à 800) | `newsreader-latin-wght-italic.woff2`                                           | Le seul mot accentué d’un titre, en italique            | SIL Open Font License 1.1, `newsreader-OFL.txt`        | The Newsreader Project Authors, github.com/productiontype/Newsreader, paquet `@fontsource-variable/newsreader` 5.3.0                 |
| IBM Plex Mono (400 et 500)                          | `ibm-plex-mono-latin-400-normal.woff2`, `ibm-plex-mono-latin-500-normal.woff2` | Identifiants de preuve, dates, mesures, cotes           | SIL Open Font License 1.1, `ibm-plex-mono-OFL.txt`     | IBM Corp., github.com/IBM/plex, paquet `@fontsource/ibm-plex-mono` 5.3.0                                                             |

Le mot-symbole de STRATA ESG est une marque produit, laissée intacte. Il n’utilise aucune police chargée : il est vectorisé depuis la police Cormorant 500 du kit STRATA (`C:\Dev\STRATA\site\kit\polices\cormorant-500.woff2`, SIL Open Font License 1.1, Christian Thalmann) dans `components/marque/stratemark.tsx`.

La licence SIL Open Font License 1.1 autorise l’usage, l’intégration dans un site et la redistribution avec le logiciel, à condition de conserver la licence et de ne pas vendre la police seule. Les fichiers ont été pris tels quels, sous-ensemble latin, sans modification.

## Bibliothèques de mouvement

| Bibliothèque                                      | Version | Licence                                                                            |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| GSAP, avec ScrollTrigger, SplitText et CustomEase | 3.15.0  | Licence standard « no charge » de GreenSock, tous les plugins gratuits depuis 2025 |
| @gsap/react                                       | 2.1.2   | MIT                                                                                |
| Lenis                                             | 1.3.26  | MIT                                                                                |
| OGL                                               | 1.0.11  | Unlicense                                                                          |

## Logos d’organisations

Les fichiers de `public/logos` sont dérivés des originaux fournis par Adama. Leurs versions « encre » ont été recolorées le 30 octobre 2026 dans l’encre de la nouvelle palette, à partir de la même couverture.

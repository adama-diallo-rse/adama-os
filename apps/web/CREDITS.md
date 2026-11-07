# Crédits et licences des ressources tierces

Relevé du 30 octobre 2026, refonte de l’identité d’ADAMA OS.

## Polices

Les trois familles sont autohébergées dans `app/fonts/` et servies par `next/font/local`. Aucune requête ne part vers un service de polices tiers. Chaque fichier de licence est copié à côté de la police.

| Famille                                    | Fichier                                                                        | Rôle                                                     | Licence                                            | Source                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Host Grotesk (variable, droit et italique) | `host-grotesk-latin-wght-normal.woff2`, `host-grotesk-latin-wght-italic.woff2` | Grands titres et premier écran, mot accentué en italique | SIL Open Font License 1.1, `host-grotesk-OFL.txt`  | The Host Grotesk Project Authors, github.com/Element-Type/HostGrotesk, paquet `@fontsource-variable/host-grotesk` 5.3.0 |
| Inter Tight (variable, droit et italique)  | `inter-tight-latin-wght-normal.woff2`, `inter-tight-latin-wght-italic.woff2`   | Interface, intertitres et commandes                      | SIL Open Font License 1.1, `inter-tight-OFL.txt`   | The Inter Project Authors, github.com/rsms/inter-tight, paquet `@fontsource-variable/inter-tight` 5.3.0                 |
| DM Sans (variable)                         | `dm-sans-latin-wght-normal.woff2`                                              | Texte courant                                            | SIL Open Font License 1.1, `dm-sans-OFL.txt`       | The DM Sans Project Authors, github.com/googlefonts/dm-fonts, paquet `@fontsource-variable/dm-sans` 5.3.0               |
| Courier Prime (400 et 700)                 | `courier-prime-latin-400-normal.woff2`, `courier-prime-latin-700-normal.woff2` | Identifiants de preuve, dates, mesures, cotes            | SIL Open Font License 1.1, `courier-prime-OFL.txt` | The Courier Prime Project Authors, paquet `@fontsource/courier-prime` 5.3.0                                             |

Ce sont les familles de STRATA ESG, relevées sur strata-esg.fr le 7 novembre 2026 : les maisons parlent d’une même voix. Elles remplacent Schibsted Grotesk, Newsreader et IBM Plex Mono, retirées le même jour.

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

Le 7 novembre 2026, quatre logos fournis par Adama ont été ajoutés, détourés par le même calcul de couverture d’encre, sans aucun tracé redessiné : le Ministère de l’Économie, des Finances et du Plan du Sénégal (`mefp-senegal.webp`, avec sa version encre), l’Institut de l’Engagement (`institut-engagement.webp`), Google for Startups (`google-for-startups.webp`) et la CCI Paris Île-de-France (`cci-paris-idf.webp`). Les trois derniers ne sont montrés qu’en couleur, sur une plaque claire, dans la bande des structures qui accompagnent les projets.

## Cartographie

La carte de Dakar à Paris (`components/kit/carte-donnees.ts`) est générée par `scripts/carte-afrique.mjs` depuis Natural Earth 1:50m, `ne_50m_admin_0_countries`, domaine public (naturalearthdata.com). Les tracés sont simplifiés pour l’illustration, ils ne valent pas mesure.

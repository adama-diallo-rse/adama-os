# ADAMA OS, kit de marque 2026

Ce dossier contient les règles et les fichiers utiles pour déployer ADAMA OS sans réinterpréter la marque à chaque support. Révision du 30 octobre 2026 : nouvelle identité, propre à ADAMA OS (symbole « Le Tissage », indigo, latérite, ivoire, encre).

## Fichiers

- `ADAMA_OS_CHARTE_2026.md` : identité, symbole, couleurs, typographie, mouvement et règles de mise en page
- `ADAMA_OS_PARCOURS_2026.md` : parcours publics, conversions et mesures
- `ADAMA_OS_MARKETING_2026.md` : messages, formats, cadence et plan de lancement
- `ADAMA_OS_VOIX_2026.md` : ton, vocabulaire et structure des contenus
- `adama-os-tokens.css` : source réutilisable des couleurs (OKLCH et hexadécimal), polices, rayons et espacements
- `logo/adama-os-symbole.svg`, `-sombre.svg`, `-mono.svg` : le symbole
- `logo/adama-os-horizontal.svg`, `-horizontal-sombre.svg`, `logo/adama-os-vertical.svg` : symbole et mot-symbole
- `logo/adama-os-mot-symbole.svg` : mot-symbole seul, vectorisé
- `logo/adama-os-anime.svg` : construction en épure, puis remplissage
- `logo/exploration/planche.html` : les cinq pistes explorées et le verdict de chacune
- `youtube/adama-os-youtube-watermark.png` : filigrane vidéo
- `ADAMA_OS_KIT_MARQUE_2026.zip` : tout ce qui précède, avec les polices et leurs licences

## Vérifier

```powershell
node scripts/contraste.mjs
```

Le script échoue si une paire texte et fond passe sous son seuil, ou si `adama-os-tokens.css` diverge de la feuille du site.

## Figma

Le fichier maître est : https://www.figma.com/design/HyhvnwwO2n0Tl2IVKOFlUc

Il porte encore l’identité de la version 1.1 : à mettre à jour depuis les fichiers de ce dossier.

## Règle de gouvernance

Toute nouvelle page publique doit répondre à trois questions : pour qui, pour faire quoi, avec quelle preuve. Si l’une manque, la page ne doit pas être publiée.

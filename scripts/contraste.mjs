// =====================================================================
// Contrôle de contraste de la palette ADAMA OS (révision du 30 octobre
// 2026).
//
// Lit apps/web/app/identite.css, résout les rôles en mode clair puis en
// mode sombre, convertit chaque couleur OKLCH en sRGB et calcule le
// rapport de contraste WCAG 2.2 de chaque paire texte et fond déclarée
// ci-dessous. Le script ÉCHOUE (code 1) si une paire passe sous son
// seuil : 4,5:1 pour le texte courant, 3:1 pour les grands titres et les
// éléments d'interface non textuels.
//
// Il vérifie aussi que brand/adama-os-tokens.css porte les mêmes valeurs
// brutes que la feuille du site : une charte qui diverge du site n'est
// plus une charte.
//
//   node scripts/contraste.mjs
// =====================================================================

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FEUILLE = join(RACINE, "apps/web/app/identite.css");
const JETONS = join(RACINE, "brand/adama-os-tokens.css");

// Paires [texte, fond, seuil, usage]. Les fonds sont des rôles.
export const PAIRES = [
  ["--texte", "--fond", 4.5, "texte courant sur la page"],
  ["--texte", "--fond-carte", 4.5, "texte courant sur une carte"],
  ["--texte", "--fond-creux", 4.5, "texte courant sur un fond creux"],
  ["--texte-doux", "--fond", 4.5, "texte adouci"],
  ["--texte-2", "--fond", 4.5, "texte secondaire, métadonnées"],
  ["--texte-2", "--fond-carte", 4.5, "texte secondaire sur une carte"],
  ["--texte-2", "--fond-creux", 4.5, "texte secondaire sur fond creux"],
  ["--accent-texte", "--fond", 4.5, "lien et mot accentué"],
  ["--accent-texte", "--fond-carte", 4.5, "lien sur une carte"],
  ["--lien", "--fond", 4.5, "lien indigo"],
  ["--etat", "--fond", 4.5, "état technique sur la page"],
  ["--alerte", "--fond", 4.5, "alerte sur la page"],
  ["--accent", "--fond", 3, "accent latérite, grand titre ou trait"],
  ["--filet-fort", "--fond", 3, "bordure de champ, élément d'interface"],
  ["--sur-feuille", "--feuille", 4.5, "texte sur feuille sombre"],
  ["--sur-feuille", "--feuille-2", 4.5, "texte sur surface sombre élevée"],
  ["--sur-feuille", "--feuille-indigo", 4.5, "texte sur feuille indigo"],
  ["--sur-feuille-2", "--feuille", 4.5, "texte secondaire sur feuille"],
  ["--sur-feuille-2", "--feuille-2", 4.5, "secondaire sur surface élevée"],
  ["--sur-feuille-2", "--feuille-indigo", 4.5, "secondaire sur indigo"],
  ["--accent-feuille", "--feuille", 4.5, "accent ocre sur feuille"],
  ["--accent-feuille", "--feuille-indigo", 4.5, "accent ocre sur indigo"],
  ["--etat-feuille", "--feuille", 4.5, "signal technique sur feuille"],
  ["--etat-feuille", "--feuille-2", 4.5, "signal sur surface élevée"],
  ["--alerte-feuille", "--feuille", 4.5, "alerte sur feuille"],
  ["--lien-feuille", "--feuille", 4.5, "lien sur feuille"],
  ["--feuille", "--sur-feuille", 4.5, "bouton plein : ivoire sur encre"],
  ["--fond", "--accent-texte", 4.5, "bouton latérite : texte clair"],
];

/** Extrait les déclarations `--nom: valeur;` d'un bloc. */
function declarations(bloc) {
  const map = new Map();
  for (const m of bloc.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

function blocApres(css, selecteur) {
  const i = css.indexOf(selecteur);
  if (i === -1) return "";
  const debut = css.indexOf("{", i);
  let profondeur = 0;
  for (let j = debut; j < css.length; j++) {
    if (css[j] === "{") profondeur++;
    if (css[j] === "}") {
      profondeur--;
      if (profondeur === 0) return css.slice(debut + 1, j);
    }
  }
  return "";
}

function resoudre(nom, vars, pile = []) {
  const v = vars.get(nom);
  if (v === undefined) throw new Error(`variable inconnue ${nom}`);
  const ref = v.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (ref) {
    if (pile.includes(ref[1])) throw new Error(`boucle sur ${ref[1]}`);
    return resoudre(ref[1], vars, [...pile, nom]);
  }
  return v;
}

/** oklch(L C H) vers sRGB linéaire puis luminance relative. */
export function oklchVersRgb(texte) {
  const m = texte.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/i);
  if (!m) throw new Error(`couleur non OKLCH : ${texte}`);
  const [L, C, H] = m.slice(1).map(Number);
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const mm = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ].map((c) => Math.min(1, Math.max(0, c)));
  return lin;
}

function luminance(lin) {
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function rapport(c1, c2) {
  const a = luminance(oklchVersRgb(c1));
  const b = luminance(oklchVersRgb(c2));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function hex(texte) {
  const lin = oklchVersRgb(texte);
  return (
    "#" +
    lin
      .map((c) => {
        const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
        return Math.round(s * 255)
          .toString(16)
          .padStart(2, "0");
      })
      .join("")
  );
}

export function modes(css) {
  const racine = declarations(blocApres(css, ":root {"));
  const sombre = new Map([
    ...racine,
    ...declarations(blocApres(css, ':root[data-mode="sombre"]')),
  ]);
  const ocre = new Map([
    ...racine,
    ...declarations(blocApres(css, ':root[data-theme="indigo"]')),
  ]);
  return { clair: racine, sombre, "thème indigo": ocre };
}

function principal() {
  const css = readFileSync(FEUILLE, "utf8");
  let echecs = 0;
  for (const [nomMode, vars] of Object.entries(modes(css))) {
    console.log(`\n${nomMode}`);
    for (const [t, f, seuil, usage] of PAIRES) {
      const r = rapport(resoudre(t, vars), resoudre(f, vars));
      const ok = r >= seuil;
      if (!ok) echecs++;
      console.log(
        `  ${ok ? "ok  " : "ÉCHEC"} ${r.toFixed(2).padStart(5)}:1  (seuil ${seuil})  ${t} sur ${f}, ${usage}`,
      );
    }
  }

  // La charte et le site portent la même palette brute.
  const marque = declarations(readFileSync(JETONS, "utf8"));
  const site = declarations(blocApres(css, ":root {"));
  for (const [nom, valeur] of marque) {
    const cle = nom.replace(/^--adama-/, "--");
    if (!valeur.startsWith("oklch")) continue;
    if (site.has(cle) && site.get(cle) !== valeur) {
      echecs++;
      console.log(
        `ÉCHEC charte et site divergent sur ${cle} : ${valeur} contre ${site.get(cle)}`,
      );
    }
  }

  if (echecs) {
    console.error(`\n${echecs} paire(s) sous le seuil ou divergente(s).`);
    process.exit(1);
  }
  console.log("\nToutes les paires passent leur seuil.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  principal();
}

#!/usr/bin/env node
// =====================================================================
// C12-T9, le gel editorial.
//
//   node scripts/freeze.mjs --on "campagne septembre"   ouvre un gel
//   node scripts/freeze.mjs --check                     verifie le gel
//   node scripts/freeze.mjs --off                       leve le gel
//   node scripts/freeze.mjs --renouveler                 accepte l'etat actuel
//
// A quoi ca sert, concretement. Pendant une campagne de candidature, un lien
// envoye le lundi doit montrer la meme chose le vendredi. Un recruteur qui
// ouvre une page, la met de cote, et la rouvre trois jours plus tard en
// trouvant un autre texte ne conclut pas que le site a evolue : il conclut
// qu'il avait mal lu, ou pire, que le contenu n'est pas stable.
//
// Ce que le gel couvre : le CONTENU EDITORIAL, c'est a dire les textes
// publies et relus qui vivent dans apps/web/content. Il ne couvre ni le code,
// ni les donnees lues en base, ni les artefacts generes : geler une metrique
// relevee reviendrait a figer une valeur du present, ce que la couche C1
// interdit explicitement.
//
// Ce que le gel FAIT : rien d'automatique et rien de silencieux. Il compare
// des empreintes et il sort en code non nul. C'est `pnpm integrity` et la
// verification locale qui s'en servent pour arreter la sequence.
// =====================================================================

import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FICHIER = join(ROOT, "docs/freeze.json");

/**
 * Le perimetre gele. Contenu editorial uniquement, et c'est le point : un
 * gel qui couvrirait le code empecherait de corriger un defaut pendant une
 * campagne, ce qui serait la pire des raisons de ne pas corriger.
 */
const PERIMETRE = ["apps/web/content"];

function fichiers(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const nom of readdirSync(dir).sort()) {
    const complet = join(dir, nom);
    if (statSync(complet).isDirectory()) {
      fichiers(complet, out);
    } else if (/\.(ts|tsx|md)$/.test(nom)) {
      out.push(complet);
    }
  }
  return out;
}

/** Empreinte du contenu editorial, fichier par fichier puis d'ensemble. */
function empreintes() {
  const par = {};
  for (const racine of PERIMETRE) {
    for (const f of fichiers(join(ROOT, racine))) {
      const chemin = relative(ROOT, f).split("\\").join("/");
      par[chemin] = createHash("sha256")
        .update(readFileSync(f, "utf8").replace(/\r\n/g, "\n"))
        .digest("hex")
        .slice(0, 16);
    }
  }
  const ensemble = createHash("sha256")
    .update(
      Object.entries(par)
        .map(([k, v]) => `${k}:${v}`)
        .join("\n"),
    )
    .digest("hex")
    .slice(0, 16);
  return { par, ensemble };
}

function lire() {
  if (!existsSync(FICHIER)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(FICHIER, "utf8"));
  } catch {
    return null;
  }
}

function ecrire(contenu) {
  writeFileSync(FICHIER, `${JSON.stringify(contenu, null, 2)}\n`, "utf8");
}

function arg(nom) {
  const i = process.argv.indexOf(`--${nom}`);
  return i !== -1 ? (process.argv[i + 1] ?? "") : null;
}

const actuel = empreintes();
const gel = lire();

// --- Ouvrir un gel ---------------------------------------------------------
if (process.argv.includes("--on")) {
  const libelle = arg("on") || "gel sans libelle";
  ecrire({
    $comment: [
      "C12-T9, gel editorial. Ecrit par `pnpm freeze`, jamais a la main.",
      "actif a false signifie qu'aucun gel n'est en cours : le contenu peut",
      "changer librement, et la verification locale ne dit rien.",
    ],
    schema_version: 1,
    actif: true,
    libelle,
    ouvert_le: new Date().toISOString(),
    perimetre: PERIMETRE,
    empreinte: actuel.ensemble,
    fichiers: actuel.par,
  });
  console.log(
    `✓ Gel ouvert : « ${libelle} ». Empreinte ${actuel.ensemble}, ${
      Object.keys(actuel.par).length
    } fichier(s) editoriaux.`,
  );
  console.log(
    "  Toute modification du contenu editorial fera desormais echouer `pnpm freeze --check`.",
  );
  process.exit(0);
}

// --- Lever un gel ----------------------------------------------------------
if (process.argv.includes("--off")) {
  ecrire({
    $comment: [
      "C12-T9, gel editorial. Ecrit par `pnpm freeze`, jamais a la main.",
      "actif a false signifie qu'aucun gel n'est en cours : le contenu peut",
      "changer librement, et la verification locale ne dit rien.",
    ],
    schema_version: 1,
    actif: false,
    libelle: null,
    ouvert_le: null,
    perimetre: PERIMETRE,
    empreinte: null,
    fichiers: {},
  });
  console.log("✓ Gel levé. Le contenu editorial peut de nouveau changer.");
  process.exit(0);
}

// --- Accepter l'etat actuel pendant un gel ---------------------------------
if (process.argv.includes("--renouveler")) {
  if (!gel?.actif) {
    console.error("✗ Aucun gel en cours : rien a renouveler.");
    process.exit(1);
  }
  ecrire({
    ...gel,
    empreinte: actuel.ensemble,
    fichiers: actuel.par,
    renouvele_le: new Date().toISOString(),
  });
  console.log(
    `✓ Gel renouvelé sur l'etat actuel. Nouvelle empreinte ${actuel.ensemble}.`,
  );
  process.exit(0);
}

// --- Verifier (comportement par defaut) ------------------------------------
if (!gel?.actif) {
  console.log(
    "Aucun gel editorial en cours. Le contenu peut changer librement.",
  );
  process.exit(0);
}

if (gel.empreinte === actuel.ensemble) {
  console.log(
    `✓ Gel « ${gel.libelle} » tenu depuis le ${String(gel.ouvert_le).slice(0, 10)}. Contenu editorial inchange.`,
  );
  process.exit(0);
}

const changes = Object.keys({ ...gel.fichiers, ...actuel.par }).filter(
  (f) => gel.fichiers[f] !== actuel.par[f],
);
console.error(
  `✗ Gel « ${gel.libelle} » rompu : ${changes.length} fichier(s) editoriaux ont change.`,
);
for (const f of changes.slice(0, 12)) {
  const avant = gel.fichiers[f];
  const apres = actuel.par[f];
  console.error(
    `    ${f} ${!avant ? "(ajouté)" : !apres ? "(retiré)" : "(modifié)"}`,
  );
}
console.error(
  "\n  Un lien envoye pendant la campagne ne montre plus la meme chose.\n" +
    "  Deux issues, et c'est un choix, pas une formalite :\n" +
    "    node scripts/freeze.mjs --renouveler   accepter le nouveau contenu\n" +
    "    git restore apps/web/content            revenir au contenu gele",
);
process.exit(1);

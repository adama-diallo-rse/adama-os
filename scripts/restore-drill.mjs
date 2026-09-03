#!/usr/bin/env node
// =====================================================================
// C12-T4, le test de restauration.
//
//   node scripts/restore-drill.mjs
//   node scripts/restore-drill.mjs --url postgresql://... --operateur "Adama"
//
// La ligne qui manquait depuis le debut du projet. Une sauvegarde non testee
// n'est pas une sauvegarde : c'est une intention, et une intention ne rend
// pas des donnees.
//
// TROIS GARDE-FOUS, dans cet ordre, et aucun n'est negociable.
//
//   1. JAMAIS contre la production. Le script refuse de tourner si l'URL
//      pointe sur un hote de production connu, et il exige une variable
//      dediee, DATABASE_URL_TEST, plutot que de reutiliser DATABASE_URL.
//      Confondre les deux couterait les donnees de deux produits voisins.
//   2. RESTAURATION SELECTIVE. Le projet de base est partage avec deux
//      produits du groupe. Le script ne touche QUE les tables du cockpit,
//      nommement listees ici, et il refuse toute operation globale.
//   3. Il ecrit docs/restauration.json, lu par la matrice de sante et par
//      pnpm integrity. Un test reussi mais non enregistre ne prouve rien a
//      un lecteur.
//
// Ce que le drill fait reellement, table par table : compte les lignes,
// calcule une empreinte du contenu, exporte, vide une cible de structure
// identique dans un schema isole, rejoue l'export, recompte et recompare
// l'empreinte. Une restauration qui rend un nombre de lignes different, ou
// la meme cardinalite avec un contenu different, est un echec.
// =====================================================================

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/**
 * Les tables du cockpit, et elles seules. Le projet de base est partage :
 * toute table absente de cette liste appartient a un produit voisin et ne
 * doit jamais etre touchee par ce script.
 */
const TABLES_COCKPIT = [
  "system_metrics",
  "decisions_log",
  "trajectory",
  "ecosystem_products",
  "ecosystem_analytics",
  "ecosystem_probes",
  "proof_claims",
  "proof_evidence",
  "leads",
];

const SCHEMA_CIBLE = "restore_drill";

function arg(nom, defaut = null) {
  const i = process.argv.indexOf(`--${nom}`);
  return i !== -1 ? (process.argv[i + 1] ?? defaut) : defaut;
}

const URL_TEST =
  arg("url") ?? process.env.DATABASE_URL_TEST ?? process.env.PGURL_TEST ?? "";
const OPERATEUR = arg("operateur", process.env.USER ?? "inconnu");

if (!URL_TEST) {
  console.error(
    "✗ Aucune base de test. Poser DATABASE_URL_TEST, ou passer --url.\n" +
      "  Ce script ne reutilise JAMAIS DATABASE_URL : la base de production\n" +
      "  est partagee avec deux produits du groupe.",
  );
  process.exit(1);
}

// Garde-fou 1. Une URL qui ressemble a de la production ne passe pas.
const INTERDITS = [/supabase\.co/i, /pooler\.supabase\.com/i, /prod/i];
if (INTERDITS.some((re) => re.test(URL_TEST))) {
  console.error(
    "✗ L'URL fournie ressemble a une base de production. Ce script ne\n" +
      "  s'execute que contre une base de recette, jamais contre la base\n" +
      "  partagee avec STRATA Scope et Academy.",
  );
  process.exit(1);
}

function psql(sql, { silencieux = false } = {}) {
  const r = spawnSync(
    "psql",
    [URL_TEST, "-v", "ON_ERROR_STOP=1", "-t", "-A", "-c", sql],
    { encoding: "utf8" },
  );
  if (r.status !== 0 && !silencieux) {
    throw new Error(`${sql.slice(0, 70)} : ${(r.stderr ?? "").trim()}`);
  }
  return (r.stdout ?? "").trim();
}

function pgDump(table, fichier) {
  const r = spawnSync(
    "pg_dump",
    ["--data-only", "--table", `public.${table}`, "--file", fichier, URL_TEST],
    { encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(`export de ${table} : ${(r.stderr ?? "").trim()}`);
  }
}

/**
 * Rejoue un export. Le chemin de recherche est pose sur la CONNEXION et non
 * par une commande : une commande `set search_path` passee en `-c` ne
 * traverse pas le fichier joue ensuite par `-f`, et l'export atterrirait
 * dans public, c'est a dire sur les donnees d'origine.
 */
function rejouer(fichier, schema) {
  const r = spawnSync(
    "psql",
    [URL_TEST, "-v", "ON_ERROR_STOP=1", "-f", fichier],
    {
      encoding: "utf8",
      env: { ...process.env, PGOPTIONS: `--search_path=${schema}` },
    },
  );
  if (r.status !== 0) {
    throw new Error(`rejeu de ${fichier} : ${(r.stderr ?? "").trim()}`);
  }
}

/** Empreinte du contenu d'une table, insensible a l'ordre des lignes. */
function empreinte(schema, table) {
  return psql(
    `select coalesce(md5(string_agg(t::text, '' order by t::text)), 'vide') from ${schema}.${table} t`,
  );
}

function compter(schema, table) {
  return Number(psql(`select count(*) from ${schema}.${table}`) || "0");
}

function tableExiste(schema, table) {
  return (
    psql(
      `select 1 from information_schema.tables where table_schema = '${schema}' and table_name = '${table}'`,
      { silencieux: true },
    ) === "1"
  );
}

const dossier = mkdtempSync(join(tmpdir(), "adama-restore-"));
const resultats = [];
let echecs = 0;
let nonExercees = 0;

console.log(
  `Test de restauration, base de recette, ${TABLES_COCKPIT.length} tables candidates.`,
);
console.log(
  `Schema de destination : ${SCHEMA_CIBLE}. La production n'est pas touchee.\n`,
);

try {
  psql(`drop schema if exists ${SCHEMA_CIBLE} cascade`);
  psql(`create schema ${SCHEMA_CIBLE}`);

  for (const table of TABLES_COCKPIT) {
    if (!tableExiste("public", table)) {
      console.log(`  · ${table.padEnd(22)} absente de cette base, ignorée`);
      continue;
    }

    const lignesAvant = compter("public", table);
    const md5Avant = empreinte("public", table);

    // Cible de structure identique, sans les donnees, dans le schema isole.
    psql(
      `create table ${SCHEMA_CIBLE}.${table} (like public.${table} including defaults)`,
    );

    const fichier = join(dossier, `${table}.sql`);
    pgDump(table, fichier);
    // L'export nomme les tables en public : on le redirige vers la cible.
    const contenu = readFileSync(fichier, "utf8")
      .replace(/\bpublic\.[a-z0-9_]+/g, `${SCHEMA_CIBLE}.${table}`)
      .replace(/^SET search_path.*$/gm, "");
    writeFileSync(fichier, contenu, "utf8");

    psql(`truncate table ${SCHEMA_CIBLE}.${table}`);
    rejouer(fichier, SCHEMA_CIBLE);

    const lignesApres = compter(SCHEMA_CIBLE, table);
    const md5Apres = empreinte(SCHEMA_CIBLE, table);
    const identique = lignesAvant === lignesApres && md5Avant === md5Apres;

    // Une table vide traversee de bout en bout ne restaure rien. La compter
    // comme reussie donne un vert que rien n'a merite : c'est exactement la
    // forme de faux vert que ce depot refuse ailleurs. Trois etats, donc,
    // comme pour les controles d'integrite.
    const exercee = lignesAvant > 0;
    const etat = !exercee ? "non_exerce" : identique ? "reussi" : "echoue";
    if (etat === "echoue") {
      echecs += 1;
    }
    if (etat === "non_exerce") {
      nonExercees += 1;
      console.log(
        `  · ${table.padEnd(22)} 0 ligne, restauration non exercée sur cette table`,
      );
    } else {
      console.log(
        `  ${identique ? "✓" : "✗"} ${table.padEnd(22)} ${lignesAvant} → ${lignesApres} ligne(s), empreinte ${
          md5Avant === md5Apres ? "identique" : "DIFFERENTE"
        }`,
      );
    }
    resultats.push({
      name: table,
      rows_before: lignesAvant,
      rows_after: lignesApres,
      md5: md5Apres,
      state: etat,
      ok: etat === "reussi",
    });
  }

  psql(`drop schema ${SCHEMA_CIBLE} cascade`);
} catch (error) {
  echecs += 1;
  console.error(
    `\n✗ Test interrompu : ${error instanceof Error ? error.message : error}`,
  );
} finally {
  rmSync(dossier, { recursive: true, force: true });
}

const exercees = resultats.filter((r) => r.state !== "non_exerce").length;
const reussies = resultats.filter((r) => r.state === "reussi").length;

// « partiel » n'est pas un echec : la restauration a bien traverse le chemin
// complet, mais aucune donnee n'a ete restauree, donc le test ne prouve rien
// du contenu. Le distinguer de « reussi » est ce qui empeche une base vide de
// produire une attestation de sauvegarde.
const verdict =
  resultats.length === 0 || echecs > 0
    ? "echoue"
    : exercees === 0
      ? "partiel"
      : "reussi";

const rapport = {
  $comment: [
    "C12-T4, dernier test de restauration reellement execute.",
    "Ecrit par `node scripts/restore-drill.mjs`, jamais a la main.",
    "executed_at a null signifie qu'aucun test n'a jamais eu lieu : la",
    "politique de sauvegarde est alors une intention, et le site le dit.",
    "result vaut partiel quand aucune table ne portait de ligne : le chemin a",
    "ete parcouru, mais rien n'a ete restaure, donc rien n'est prouve.",
  ],
  schema_version: 2,
  executed_at: new Date().toISOString(),
  result: verdict,
  operator: OPERATEUR,
  scope:
    "tables du cockpit uniquement, restauration sélective, jamais la base entière",
  target: "base de recette locale, schéma isolé",
  tables: resultats,
  tables_exercees: exercees,
  notes:
    "Pour chaque table : export des données seules, rejeu dans un schéma isolé de structure identique, puis comparaison du nombre de lignes et d'une empreinte du contenu insensible à l'ordre.",
};

writeFileSync(
  join(ROOT, "docs/restauration.json"),
  `${JSON.stringify(rapport, null, 2)}\n`,
  "utf8",
);

const marque = verdict === "echoue" ? "✗" : verdict === "partiel" ? "·" : "✓";
console.log(
  `\n${marque} ${reussies}/${resultats.length} table(s) restaurée(s) à l'identique` +
    (nonExercees > 0 ? `, ${nonExercees} non exercée(s) faute de ligne` : "") +
    `. Verdict : ${verdict}. Rapport : docs/restauration.json`,
);
process.exit(verdict === "echoue" ? 1 : 0);

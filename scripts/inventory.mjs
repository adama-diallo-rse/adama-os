#!/usr/bin/env node
// =====================================================================
// C0-T1 / C0-T2 / C0-T5 / C0-T6, inventaire machine d'Adama OS.
//
//   pnpm inventory           regenere docs/inventory.json et docs/INVENTORY.md
//   pnpm inventory --check   compare sans ecrire, sort en code 1 si different
//
// Node pur, aucune dependance. Aucun horodatage n'est ecrit dans les deux
// fichiers produits : sinon --check echouerait a chaque seconde qui passe et
// le diff cesserait de porter du sens. La date de reference d'un inventaire
// est celle de son commit.
// =====================================================================

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown } from "./inventory-report.mjs";
import { analyse } from "./inventory-analyse.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CHECK = process.argv.includes("--check");
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".git",
  "dist",
  "snapshots",
  "corpus",
  "backups",
]);
const CODE_EXT = /\.(ts|tsx|mjs|js)$/;
const SCHEMA_VERSION = 1;

const rel = (p) => relative(ROOT, p).split("\\").join("/");
const read = (p) => readFileSync(p, "utf8");
const uniq = (a) => Array.from(new Set(a)).sort();
const all = (text, re) => Array.from(text.matchAll(re));

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// --- Collecte des sources -------------------------------------------
const SOURCE_ROOTS = [
  "apps/web/app",
  "apps/web/components",
  "apps/web/lib",
  // C5 et C9 : le contenu editorial versionne (fiches projet, profil,
  // principes) fait partie de la surface du site. Sans cette racine, il
  // echapperait a la mesure du budget, a la detection de code mort et au
  // controle des tirets longs, alors qu'il porte des textes publies.
  "apps/web/content",
  "apps/web/tests",
  "packages/db/src",
  "packages/ui/src",
  "scripts",
];
const files = SOURCE_ROOTS.flatMap((d) => walk(join(ROOT, d))).filter((f) =>
  CODE_EXT.test(f),
);
for (const f of readdirSync(join(ROOT, "apps/web")).sort()) {
  if (CODE_EXT.test(f) && !f.endsWith(".d.ts")) {
    files.push(join(ROOT, "apps/web", f));
  }
}
const sources = files.map((f) => ({ path: rel(f), text: read(f), abs: f }));
const byPath = new Map(sources.map((s) => [s.path, s]));

// Texte de tout le depot, commentaires retires, pour les recherches d'usage.
const stripComments = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const CODE = sources.map((s) => ({ ...s, code: stripComments(s.text) }));
const CORPUS = CODE.map((s) => s.code).join("\n");
// Corpus des signaux : l'application seule. L'outillage du depot (scripts/)
// et les tests ne sont pas la matiere du site, et les citer ferait remonter
// l'inventaire lui-meme comme un usage de ce qu'il cherche.
const SIGNAL = CODE.filter(
  (s) => !s.path.startsWith("scripts/") && !/\.test\.tsx?$/.test(s.path),
);
const SIGNAL_CORPUS = SIGNAL.map((s) => s.code).join("\n");

// --- Surfaces --------------------------------------------------------
const pages = sources
  .filter(
    (s) =>
      /^apps\/web\/app\/.*\/page\.tsx$/.test(s.path) ||
      s.path === "apps/web/app/page.tsx",
  )
  .map((s) => ({
    file: s.path,
    route: routeOf(s.path),
    lines: s.text.split("\n").length,
  }));
const apiRoutes = sources
  .filter((s) => /^apps\/web\/app\/.*route\.ts$/.test(s.path))
  .map((s) => ({
    file: s.path,
    route: routeOf(s.path),
    lines: s.text.split("\n").length,
  }));
const components = sources
  .filter(
    (s) => s.path.startsWith("apps/web/components/") && s.path.endsWith(".tsx"),
  )
  .map((s) => ({ file: s.path, lines: s.text.split("\n").length }));
const libModules = sources
  .filter((s) => s.path.startsWith("apps/web/lib/"))
  .map((s) => ({ file: s.path, lines: s.text.split("\n").length }));

function routeOf(path) {
  const seg = path
    .replace(/^apps\/web\/app/, "")
    .replace(/\/(page\.tsx|route\.ts)$/, "")
    .replace(/\/\([^)]+\)/g, "");
  return seg === "" ? "/" : seg;
}

// --- Base de donnees --------------------------------------------------
const schemaText = read(join(ROOT, "packages/db/src/schema.ts"));
const tables = all(schemaText, /pgTable\(\s*"([a-z0-9_]+)"/g)
  .map((m) => m[1])
  .sort();
const enums = all(schemaText, /pgEnum\(\s*"([a-z0-9_]+)"/g)
  .map((m) => m[1])
  .sort();
const migrationFiles = walk(join(ROOT, "packages/db/migrations")).filter((f) =>
  f.endsWith(".sql"),
);
const migrations = migrationFiles.map((f) => rel(f));
// C10-T5 : le nombre de policies RLS est MESURE, pas recopie. Le chiffre de
// 17 qui circulait dans l'audit du 7 aout 2026 etait faux, et il a fallu
// recompter a la main pour s'en apercevoir. Une seule regle de comptage :
// une policy est nommee une fois par `create policy "<nom>" on <table>`, et
// le `drop policy if exists` qui la precede n'en cree pas une seconde.
const migrationSql = migrationFiles.map((f) => read(f)).join("\n");
const policiesDeclarees = uniq(
  all(migrationSql, /create policy\s+"([^"]+)"\s+on\s+([a-z0-9_]+)/gi).map(
    (m) => `${m[2]}.${m[1]}`,
  ),
);
// Deux nombres, parce qu'ils ne disent pas la meme chose. `policies` compte
// celles qui portent sur une table encore presente dans le schema : c'est le
// nombre qu'un lecteur veut. `policies_declared` compte tout ce que
// l'historique des migrations a cree, y compris sur des tables depuis
// supprimees ou devenues des vues. Publier le second en le nommant comme le
// premier gonflerait le chiffre de cinq unites, sans mentir formellement.
const policies = policiesDeclarees.filter((p) =>
  tables.includes(p.split(".")[0]),
);
const rlsTables = uniq(
  all(
    migrationSql,
    /alter table\s+([a-z0-9_]+)\s+enable row level security/gi,
  ).map((m) => m[1]),
);

// --- Tests -----------------------------------------------------------
const testFiles = sources.filter((s) => /\.test\.tsx?$/.test(s.path));
const testCases = testFiles.reduce(
  (n, s) => n + all(s.text, /^\s*(it|test)(\.\w+)?\s*\(/gm).length,
  0,
);

// --- Dependances directes --------------------------------------------
const manifests = [
  "package.json",
  "apps/web/package.json",
  "packages/db/package.json",
  "packages/ui/package.json",
  "packages/config/package.json",
].filter((p) => existsSync(join(ROOT, p)));
const dependencies = [];
for (const p of manifests) {
  const json = JSON.parse(read(join(ROOT, p)));
  for (const kind of ["dependencies", "devDependencies"]) {
    for (const [name, range] of Object.entries(json[kind] ?? {})) {
      dependencies.push({ workspace: p, name, range, kind });
    }
  }
}
dependencies.sort((a, b) =>
  (a.workspace + a.name).localeCompare(b.workspace + b.name),
);

// --- Signaux textuels -------------------------------------------------
/**
 * Les variables d'environnement lues par le code.
 *
 * Les deux premieres formes sont directes. La troisieme ne l'est pas : les
 * passerelles produit lisent `process.env[gateway.originEnv]`, ou le nom vit
 * dans une table. Sans elle, `ECOSYSTEM_SCOPE_API_URL` et
 * `ECOSYSTEM_ESG_OPTIMIZER_API_URL` etaient lues par le code et absentes de
 * l'inventaire, qui se presente pourtant comme la photographie de ce que le
 * depot lit vraiment.
 */
const envVars = uniq([
  ...all(SIGNAL_CORPUS, /process\.env\.([A-Z0-9_]+)/g).map((m) => m[1]),
  ...all(SIGNAL_CORPUS, /process\.env\[\s*["'`]([A-Z0-9_]+)/g).map((m) => m[1]),
  // Nom porte par une propriete, puis lu par indexation.
  ...all(SIGNAL_CORPUS, /[A-Za-z]*Env:\s*["'`]([A-Z][A-Z0-9_]+)["'`]/g).map(
    (m) => m[1],
  ),
]);
/**
 * C13-T2, les evenements REELLEMENT emis dans le code.
 *
 * La premiere version ne cherchait qu'un litteral de chaine au point d'appel,
 * `captureEvent("recruiter_intent")`. Depuis la couche C13 les noms vivent
 * dans une source unique et les points d'appel passent une CONSTANTE. Le
 * releve rendait donc une liste vide, l'inventaire publiait « Aucun » alors
 * que douze evenements etaient emis, et le test qui compare les deux listes
 * comparait deux listes vides : il ne pouvait plus rien attraper.
 *
 * Le releve suit donc les deux formes, et il RESOUT les constantes. Une
 * constante en capitales qui ne se resout pas est rendue telle quelle,
 * prefixee, pour qu'elle echoue au lieu de disparaitre.
 */
const NOM_EVENEMENT = /^[a-z][a-z0-9_]+$/;

/** Table des constantes d'evenement, litteraux puis alias. */
function tableEvenements() {
  const table = new Map();
  for (const [, nom, valeur] of SIGNAL_CORPUS.matchAll(
    /export const ([A-Z][A-Z0-9_]+)\s*=\s*["'`]([a-z][a-z0-9_]+)["'`]/g,
  )) {
    table.set(nom, valeur);
  }
  // Deux passes pour les alias, `export const OUTBOUND_EVENT = EVENT_OUTBOUND`.
  for (let i = 0; i < 2; i += 1) {
    for (const [, nom, cible] of SIGNAL_CORPUS.matchAll(
      /export const ([A-Z][A-Z0-9_]+)\s*=\s*([A-Z][A-Z0-9_]+)\s*;/g,
    )) {
      const valeur = table.get(cible);
      if (valeur && !table.has(nom)) table.set(nom, valeur);
    }
  }
  return table;
}

const TABLE_EVENEMENTS = tableEvenements();

const analyticsEvents = uniq([
  // Forme litterale, conservee : rien n'interdit d'ecrire un nom en clair.
  ...all(SIGNAL_CORPUS, /capture(?:Event)?\(\s*["'`]([a-z0-9_]+)["'`]/g).map(
    (m) => m[1],
  ),
  ...all(SIGNAL_CORPUS, /\bevent=\{\s*["'`]([a-z0-9_]+)["'`]\s*\}/g).map(
    (m) => m[1],
  ),
  // Forme constante, aux deux points d'emission : l'appel direct et la
  // propriete `event` des composants d'emission.
  ...[
    ...all(SIGNAL_CORPUS, /capture(?:Event)?\(\s*([A-Z][A-Z0-9_]+)/g),
    ...all(SIGNAL_CORPUS, /\bevent=\{\s*([A-Z][A-Z0-9_]+)\s*\}/g),
    ...all(SIGNAL_CORPUS, /\bevent:\s*([A-Z][A-Z0-9_]+)\s*[,}]/g),
  ].map((m) => TABLE_EVENEMENTS.get(m[1]) ?? `NON_RESOLU:${m[1]}`),
]).filter((e) => NOM_EVENEMENT.test(e) || e.startsWith("NON_RESOLU:"));
const urls = SIGNAL.flatMap((s) =>
  all(s.code, /https?:\/\/[^\s"'`)<>\\]+/g).map((m) => ({
    file: s.path,
    url: m[1] ?? m[0],
  })),
);
const SELF_HOSTS = ["adamesg-os.fr", "adama-os-web.vercel.app"];
const hardcodedSelfUrls = urls
  .filter((u) => SELF_HOSTS.some((h) => u.url.includes(h)))
  .filter((u) => u.file !== "apps/web/lib/site.ts")
  .map((u) => `${u.file} : ${u.url}`)
  .sort();
const outboundHosts = uniq(
  urls
    .map((u) => {
      try {
        return new URL(u.url).host;
      } catch {
        return null;
      }
    })
    .filter(Boolean),
);
const markers = SIGNAL.flatMap((s) =>
  all(s.code, /\b(TODO|FIXME)\b[^\n]*/g).map(
    (m) => `${s.path} : ${m[0].trim().slice(0, 100)}`,
  ),
).sort();
// Doctrine du projet : aucun tiret long ni demi-cadratin, dans le code comme
// dans les textes produits. Une regle enoncee et jamais mesuree se perd au
// troisieme contributeur, ou au troisieme copier-coller.
const longDashes = SIGNAL.flatMap((s) =>
  all(s.code, /[^\n]*[\u2014\u2013][^\n]*/g).map(
    (m) => `${s.path} : ${m[0].trim().slice(0, 100)}`,
  ),
).sort();

const LEGACY = [
  "strata_analytics",
  "services/engine",
  "adama-os-web.vercel.app",
  "FALLBACK",
];
const legacyNames = LEGACY.map((needle) => ({
  name: needle,
  hits: SIGNAL.filter((s) => s.code.includes(needle))
    .map((s) => s.path)
    .sort(),
}));

// --- Code mort et budget (C0-T2, C0-T6) ---------------------------------
const surfaces = {
  pages,
  api_routes: apiRoutes,
  components,
  lib_modules: libModules,
};
const { dead, budgets, severity } = analyse({
  ROOT,
  CODE,
  CORPUS,
  byPath,
  pages,
  dependencies,
  manifests,
  walk,
  surfaces,
});

// --- Audit de rendu (C12-T5 et C12-T6) ----------------------------------
// Le RESUME seul, jamais le rapport complet ni son horodatage : `--check`
// echouerait a chaque seconde. Absent tant que l'audit n'a pas tourne, ce qui
// est une information et non une valeur par defaut.
//
// `premier_rendu_max_ms` est ecarte pour la meme raison que l'horodatage : ce
// n'est pas une propriete du depot mais une mesure de la machine qui a lance
// l'audit. Elle variait de 600 a 720 ms d'une execution a l'autre et faisait
// echouer `--check` sans qu'aucune ligne de code n'ait bouge, donc faisait
// echouer le controle d'integrite qui le lit. Un rouge qui ne designe rien
// est aussi nuisible qu'un vert non merite. La mesure reste dans
// docs/audit-rendu.json, ou elle est a sa place.
const MESURES_VOLATILES = new Set(["premier_rendu_max_ms"]);
let rendu = null;
const auditPath = join(ROOT, "docs/audit-rendu.json");
if (existsSync(auditPath)) {
  try {
    const resume = JSON.parse(read(auditPath)).resume ?? null;
    rendu = resume
      ? Object.fromEntries(
          Object.entries(resume).filter(([cle]) => !MESURES_VOLATILES.has(cle)),
        )
      : null;
  } catch {
    rendu = null;
  }
}

// --- Sortie ------------------------------------------------------------
const inventory = {
  schema_version: SCHEMA_VERSION,
  surface: {
    pages: pages.length,
    api_routes: apiRoutes.length,
    components: components.length,
    lib_modules: libModules.length,
    tables: tables.length,
    enums: enums.length,
    migrations: migrations.length,
    policies: policies.length,
    test_files: testFiles.length,
    test_cases: testCases,
    dependencies: dependencies.length,
  },
  pages,
  api_routes: apiRoutes,
  components,
  lib_modules: libModules,
  database: {
    tables,
    enums,
    migrations,
    policies,
    policies_declared: policiesDeclarees,
    rls_tables: rlsTables,
  },
  tests: { files: testFiles.map((s) => s.path).sort(), cases: testCases },
  rendu,
  dependencies,
  env_vars: envVars,
  analytics_events: analyticsEvents,
  outbound_hosts: outboundHosts,
  hardcoded_self_urls: hardcodedSelfUrls,
  markers,
  long_dashes: longDashes,
  legacy_names: legacyNames,
  dead,
  budgets,
};

const json = JSON.stringify(inventory, null, 2) + "\n";
const md = renderMarkdown(inventory, severity);
const jsonPath = join(ROOT, "docs/inventory.json");
const mdPath = join(ROOT, "docs/INVENTORY.md");

if (CHECK) {
  const same =
    existsSync(jsonPath) &&
    read(jsonPath) === json &&
    existsSync(mdPath) &&
    read(mdPath) === md;
  if (!same) {
    console.error(
      "Inventaire perime. Lancer `pnpm inventory` puis committer docs/inventory.json et docs/INVENTORY.md.",
    );
    process.exit(1);
  }
  console.log("Inventaire a jour.");
} else {
  writeFileSync(jsonPath, json, "utf8");
  writeFileSync(mdPath, md, "utf8");
  console.log(`Inventaire ecrit : docs/inventory.json, docs/INVENTORY.md`);
}

const orphans = dead.filter((d) => !d.declared_intentional);
const over = budgets.filter((b) => b.over);
if (orphans.length > 0) {
  console.log(
    `  ${orphans.length} entree(s) morte(s) sans justification, voir la section « Code mort ».`,
  );
}
for (const b of over) {
  console.log(
    b.broken
      ? `  budget non mesurable : ${b.label}, l'ancrage de mesure ne correspond plus`
      : `  budget depasse : ${b.label} ${b.value} / ${b.max}`,
  );
}
if (severity === "error" && over.length > 0) process.exit(1);

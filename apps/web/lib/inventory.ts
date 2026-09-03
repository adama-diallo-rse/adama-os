// =====================================================================
// C10-T2, lecture de l'inventaire machine.
//
// La page /technique n'ecrit AUCUN chiffre. Elle lit celui-ci, produit par
// `pnpm inventory` et versionne dans le depot. Consequence directe : soit
// l'inventaire est a jour et la page est exacte, soit `pnpm inventory --check`
// echoue et la verification s'arrete avant meme le typecheck.
//
// C'est ce qui rend la page increvable au sens qui compte : elle ne peut pas
// annoncer trente-sept composants quand il y en a quarante-quatre, parce
// qu'aucun humain n'y ecrit un nombre. tests/technique.test.tsx echoue si un
// chiffre d'inventaire venait a etre ecrit en dur dans la page.
//
// Import et non lecture de fichier a l'execution : un import est trace par
// la construction et type, une lecture de fichier ne survit pas au
// deploiement sans serveur.
// =====================================================================

import inventaire from "../../../docs/inventory.json";

export type InventorySurface = {
  pages: number;
  api_routes: number;
  components: number;
  lib_modules: number;
  tables: number;
  enums: number;
  migrations: number;
  policies: number;
  test_files: number;
  test_cases: number;
  dependencies: number;
};

export type InventoryBudget = {
  id: string;
  level: string;
  label: string;
  max: number;
  value: number;
  over: boolean;
  broken: boolean;
};

type InventoryFile = {
  schema_version: number;
  surface: InventorySurface;
  pages: { file: string; route: string; lines: number }[];
  api_routes: { file: string; route: string; lines: number }[];
  components: { file: string; lines: number }[];
  lib_modules: { file: string; lines: number }[];
  database: {
    tables: string[];
    enums: string[];
    migrations: string[];
    policies: string[];
    policies_declared: string[];
    rls_tables: string[];
  };
  tests: { files: string[]; cases: number };
  dependencies: {
    workspace: string;
    name: string;
    range: string;
    kind: string;
  }[];
  env_vars: string[];
  analytics_events: string[];
  long_dashes: string[];
  markers: string[];
  dead: { id: string; kind: string; declared_intentional: string | null }[];
  budgets: InventoryBudget[];
};

const INVENTAIRE = inventaire as unknown as InventoryFile;

/** Les comptes de surface, tels que la commande les a mesures. */
export function surface(): InventorySurface {
  return INVENTAIRE.surface;
}

/** Les routes publiques d'API, hors routes protegees par un secret. */
export function routesPubliques(): { route: string; lines: number }[] {
  return INVENTAIRE.api_routes
    .filter((r) => !r.route.includes("/sync"))
    .map((r) => ({ route: r.route, lines: r.lines }));
}

/** Les dependances directes, dedupliquees par nom. */
export function dependancesDirectes(): { name: string; range: string }[] {
  const par = new Map<string, string>();
  for (const d of INVENTAIRE.dependencies) {
    if (d.kind === "dependencies" && !d.range.startsWith("workspace:")) {
      par.set(d.name, d.range);
    }
  }
  return Array.from(par, ([name, range]) => ({ name, range })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function tables(): string[] {
  return INVENTAIRE.database.tables;
}

export function migrations(): string[] {
  return INVENTAIRE.database.migrations;
}

/** Tables placees sous securite au niveau des lignes. */
export function tablesProtegees(): string[] {
  return INVENTAIRE.database.rls_tables.filter((t) =>
    INVENTAIRE.database.tables.includes(t),
  );
}

/** Regles de securite portant sur une table encore presente au schema. */
export function policies(): string[] {
  return INVENTAIRE.database.policies;
}

/** Regles creees par l'historique complet des migrations, tables mortes
 *  comprises. Publier ce nombre a la place du precedent gonflerait le
 *  chiffre sans mentir formellement : les deux existent, et ils sont
 *  nommes differemment. */
export function policiesDeclarees(): string[] {
  return INVENTAIRE.database.policies_declared;
}

export function budgets(): InventoryBudget[] {
  return INVENTAIRE.budgets;
}

/** Vrai quand la doctrine « aucun tiret long » est tenue dans le code. */
export function sansTiretLong(): boolean {
  return INVENTAIRE.long_dashes.length === 0;
}

/** Entrees mortes non justifiees. Une justification n'est pas un silence. */
export function codeMortNonJustifie(): number {
  return INVENTAIRE.dead.filter((d) => !d.declared_intentional).length;
}

export function evenementsAnalytiques(): string[] {
  return INVENTAIRE.analytics_events;
}

/** Le plus gros fichier d'une famille, pour la lecture de complexite. */
export function plusGros(
  famille: "components" | "lib_modules",
): { file: string; lines: number } | null {
  const liste = INVENTAIRE[famille];
  return [...liste].sort((a, b) => b.lines - a.lines)[0] ?? null;
}

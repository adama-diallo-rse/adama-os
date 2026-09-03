// C0-T2 / C0-T6, detection de code mort et mesure du budget.
// Extrait de scripts/inventory.mjs pour que le collecteur reste sous les 300
// lignes que la couche C0 s'impose. Aucune dependance, aucune analyse
// syntaxique : lecture de texte, comme le reste de l'inventaire.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(p, "utf8");
const uniq = (a) => Array.from(new Set(a)).sort();
const all = (text, re) => Array.from(text.matchAll(re));

export function analyse(ctx) {
  const {
    ROOT,
    CODE,
    CORPUS,
    byPath,
    pages,
    dependencies,
    manifests,
    walk,
    surfaces,
  } = ctx;
  const allowPath = join(ROOT, "docs/inventory-allow.json");
  const allow = existsSync(allowPath) ? JSON.parse(read(allowPath)) : {};
  // Une justification peut viser une entree precise ("fichier#nom") ou tout un
  // fichier ("fichier#*"), utile pour la surface publique d'un paquet.
  function allowed(kind, id) {
    const table = allow[kind] ?? {};
    if (table[id]) return table[id];
    const star = id.replace(/#.*$/, "#*");
    return table[star] ?? null;
  }

  const NEXT_EXPORTS = new Set([
    "default",
    "metadata",
    "generateMetadata",
    "generateStaticParams",
    "viewport",
    "dynamic",
    "revalidate",
    "runtime",
    "maxDuration",
    "fetchCache",
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
    "middleware",
    "proxy",
    "config",
    "register",
    "onRequestError",
    "generateViewport",
    "onRouterTransitionStart",
    "alt",
    "contentType",
    "size",
    "generateImageMetadata",
    "sitemap",
    "robots",
  ]);
  const importedNames = new Set();
  for (const s of CODE) {
    for (const m of all(s.code, /import\s*(?:type\s*)?\{([^}]+)\}\s*from/g)) {
      for (const part of m[1].split(",")) {
        const name = part
          .trim()
          .split(/\s+as\s+/)[0]
          .replace(/^type\s+/, "")
          .trim();
        if (name) importedNames.add(name);
      }
    }
    for (const m of all(s.code, /export\s*(?:type\s*)?\{([^}]+)\}\s*from/g)) {
      for (const part of m[1].split(",")) {
        const name = part
          .trim()
          .split(/\s+as\s+/)[0]
          .replace(/^type\s+/, "")
          .trim();
        if (name) importedNames.add(name);
      }
    }
    for (const m of all(s.code, /import\s+(\w+)\s*(?:,|from)/g))
      importedNames.add(m[1]);
    // Import dynamique destructure : const { a, b } = await import("...")
    for (const m of all(s.code, /\{([^}]+)\}\s*=\s*(?:await\s+)?import\(/g)) {
      for (const part of m[1].split(",")) {
        const name = part.trim().split(":")[0].trim();
        if (name) importedNames.add(name);
      }
    }
  }
  const deadExports = [];
  for (const s of CODE) {
    if (/\.test\.tsx?$/.test(s.path)) continue;
    const names = uniq(
      all(
        s.code,
        /export\s+(?:async\s+)?(?:function|const|class|type|interface|enum)\s+(\w+)/g,
      ).map((m) => m[1]),
    );
    for (const name of names) {
      if (NEXT_EXPORTS.has(name) || importedNames.has(name)) continue;
      const id = `${s.path}#${name}`;
      deadExports.push({
        id,
        kind: "export",
        declared_intentional: allowed("exports", id),
      });
    }
  }
  const deadComponents = [];
  for (const s of CODE.filter((c) =>
    c.path.startsWith("apps/web/components/"),
  )) {
    const names = all(s.code, /export\s+function\s+([A-Z]\w*)/g).map(
      (m) => m[1],
    );
    for (const name of names) {
      // Un composant monte dans son propre fichier n'est pas mort : la
      // declaration s'ecrit "function X(", jamais "<X", aucune confusion.
      const mounted = CODE.some((o) =>
        new RegExp(`<${name}[\\s/>]`).test(o.code),
      );
      if (mounted) continue;
      const id = `${s.path}#${name}`;
      deadComponents.push({
        id,
        kind: "component",
        declared_intentional: allowed("components", id),
      });
    }
  }
  const deadRoutes = [];
  for (const p of pages) {
    if (p.route === "/") continue;
    // Une route dynamique ne se cite jamais telle quelle : le lien s'ecrit
    // `/verifier/${id}`. On cherche donc le prefixe stable, avant le premier
    // segment entre crochets.
    const prefixe = p.route.replace(/\/\[[^\]]+\].*$/, "/");
    const cibles =
      prefixe === p.route
        ? [`"${p.route}"`, `"${p.route}#`, `"${p.route}/`]
        : [`"${prefixe}`, `\`${prefixe}`];
    const linked = CODE.some(
      (s) =>
        !s.path.startsWith("apps/web/app" + p.route) &&
        cibles.some((c) => s.code.includes(c)),
    );
    if (linked) continue;
    deadRoutes.push({
      id: p.route,
      kind: "route",
      declared_intentional: allowed("routes", p.route),
    });
  }
  // Une dependance peut n'etre jamais importee et rester indispensable : elle
  // est alors nommee dans un fichier de configuration ou dans un script npm.
  // Les package.json sont exclus du corpus (une dependance y figure toujours),
  // a l'exception de leur section "scripts".
  const CONFIG_CORPUS = [
    ...walk(join(ROOT, "apps/web")).filter((f) =>
      /\.(config|rc)\.(ts|mjs|js|json)$/.test(f),
    ),
    ...walk(join(ROOT, "packages")).filter((f) =>
      /\.(config|rc)\.(ts|mjs|js|json)$/.test(f),
    ),
    ...[
      "turbo.json",
      ".prettierrc.json",
      "apps/web/tsconfig.json",
      "packages/db/tsconfig.json",
      "packages/ui/tsconfig.json",
      "packages/config/tsconfig/base.json",
      "packages/config/tsconfig/nextjs.json",
      "packages/config/eslint/base.mjs",
    ]
      .map((p) => join(ROOT, p))
      .filter((p) => existsSync(p)),
  ]
    .map((f) => read(f))
    .concat(
      manifests.map((p) =>
        JSON.stringify(JSON.parse(read(join(ROOT, p))).scripts ?? {}),
      ),
    )
    .join("\n");

  const deadDependencies = [];
  for (const dep of dependencies) {
    const used =
      new RegExp(`from\\s+["'\`]${dep.name}(/[^"'\`]*)?["'\`]`).test(CORPUS) ||
      new RegExp(`require\\(["'\`]${dep.name}`).test(CORPUS) ||
      new RegExp(`import\\(["'\`]${dep.name}`).test(CORPUS) ||
      CONFIG_CORPUS.includes(dep.name);
    if (used) continue;
    const id = `${dep.workspace}#${dep.name}`;
    deadDependencies.push({
      id,
      kind: "dependency",
      declared_intentional: allowed("dependencies", id),
    });
  }
  const dead = [
    ...deadExports,
    ...deadComponents,
    ...deadRoutes,
    ...deadDependencies,
  ].sort((a, b) => a.id.localeCompare(b.id));

  // --- Budget de complexite (C0-T6) ---
  const BUDGET = JSON.parse(read(join(ROOT, "docs/budget.json")));
  function measure(m) {
    if (m.kind === "count") return surfaces[m.of].length;
    if (m.kind === "max_lines")
      return Math.max(...surfaces[m.of].map((f) => f.lines));
    const src = byPath.get(m.file);
    if (!src) return -1;
    let text = src.text;
    if (m.kind === "count_in_region") {
      const start = text.indexOf(m.from);
      const end = text.indexOf(m.to, start + 1);
      if (start === -1 || end === -1) return -1;
      text = text.slice(start, end);
    }
    return all(text, new RegExp(m.pattern, "gm")).length;
  }
  // Une mesure qui echoue rend -1. Sans ce traitement, un ancrage de region
  // devenu faux, apres un simple reformatage, ferait passer le budget pour
  // tenu alors que plus rien n'est mesure. Un plafond qu'on ne sait plus
  // mesurer est un plafond depasse.
  const budgets = BUDGET.budgets.map((b) => {
    const value = measure(b.measure);
    const broken = value < 0;
    return {
      id: b.id,
      level: b.level,
      label: b.label,
      max: b.max,
      value,
      broken,
      over: broken || value > b.max,
    };
  });

  return { dead, budgets, severity: BUDGET.severity };
}

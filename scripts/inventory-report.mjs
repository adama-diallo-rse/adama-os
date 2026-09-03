// C0-T1, rendu humain de l'inventaire (docs/INVENTORY.md).
// Separe de scripts/inventory.mjs pour que le collecteur reste sous 300
// lignes et que la mise en forme puisse changer sans toucher a la mesure.
// Aucune date ici : voir l'en-tete de inventory.mjs.

const fence = (rows, head) => {
  const all = [head, head.map(() => "---"), ...rows];
  return all.map((r) => `| ${r.join(" | ")} |`).join("\n");
};

// C0-T3, les avertissements ESLint, un par un. Mesures par execution de
// `eslint .` dans apps/web. Aucun ne reste anonyme : chacun porte soit sa
// correction, soit la raison ecrite de son maintien.
//
// Il y en avait cinq a l'ouverture de la couche C0. Le cinquieme,
// `components/animated-number.tsx:33`, a ete CORRIGE par la couche C1 : le
// compteur partait de zero, ce qui faisait afficher « 0 » au rendu serveur,
// a l'impression et a tout lecteur sans JavaScript, a la place de la valeur
// reelle. Un zero a la place d'une mesure est un chiffre faux, meme s'il ne
// le reste qu'une seconde. L'etat de depart est desormais la valeur, et
// l'avertissement a disparu avec la cause.
// Les positions de ces avertissements ne portent PAS de numero de ligne, et
// c'est deliberé. Le 2 septembre 2026, les quatre ancres ecrites a la main
// pointaient toutes a cote : layer-a.tsx:42 designait une declaration de
// fonction, terminal.tsx:150 une accolade. Un numero de ligne derive a chaque
// edition du fichier, et ce tableau est publie dans docs/INVENTORY.md, un
// document qui s'annonce genere. Une position fausse dans un document qui se
// presente comme mesure est pire qu'une position absente.
const ESLINT = [
  [
    "components/consent-banner.tsx",
    "react-hooks/set-state-in-effect",
    "Maintenu. `setVisible(true)` depend de `localStorage`, illisible au rendu serveur. Le bandeau ne peut pas etre decide avant hydratation sans afficher un bandeau a quelqu'un qui a deja repondu.",
  ],
  [
    "components/layer-a.tsx",
    "react-hooks/set-state-in-effect",
    "Maintenu. Premiere valeur du compte a rebours, posee juste avant le `setInterval` qui la met a jour chaque seconde. Attendre le premier tick afficherait un vide d'une seconde au chargement.",
  ],
  [
    "components/recruit-modal.tsx",
    "react-hooks/set-state-in-effect",
    "Maintenu. Remise a zero de l'etape Cal.com a la fermeture de la modale. La fermeture peut venir de la touche Echap, d'un clic exterieur ou du parent : centraliser la remise a zero dans l'effet est la seule facon de ne pas en oublier un chemin.",
  ],
  [
    "components/terminal.tsx",
    "react-hooks/set-state-in-effect",
    "Maintenu. `setLogs([])` vide l'historique du terminal a la fermeture, meme raison que ci-dessus : trois chemins de fermeture, un seul point de remise a zero.",
  ],
];

export function renderMarkdown(inv, severity) {
  const s = inv.surface;
  const orphans = inv.dead.filter((d) => !d.declared_intentional);
  const over = inv.budgets.filter((b) => b.over);
  const out = [];

  out.push("# Inventaire d'Adama OS");
  out.push("");
  out.push(
    "Fichier produit par `pnpm inventory`. Ne pas le modifier a la main : toute",
    "correction se fait dans le code ou dans `scripts/inventory.mjs`, puis on",
    "regenere. `pnpm inventory --check` sort en code 1 si le depot a bouge sans",
    "que l'inventaire ait ete regenere et committe.",
    "",
    "Aucune date n'est ecrite ici : la date de reference d'un inventaire est",
    "celle de son commit. Un horodatage rendrait le diff illisible et ferait",
    "echouer `--check` a chaque seconde.",
    "",
  );

  out.push("## Surface");
  out.push("");
  out.push(
    fence(
      [
        ["Routes de page", s.pages],
        ["Routes d'API", s.api_routes],
        ["Composants", s.components],
        ["Modules `lib`", s.lib_modules],
        ["Tables Drizzle", s.tables],
        ["Types enumeres", s.enums],
        ["Migrations SQL", s.migrations],
        ["Fichiers de test", s.test_files],
        ["Cas de test", s.test_cases],
        ["Dependances directes declarees", s.dependencies],
      ].map(([k, v]) => [k, String(v)]),
      ["Mesure", "Valeur"],
    ),
  );
  out.push("");

  out.push("## Routes");
  out.push("");
  out.push(
    fence(
      inv.pages.map((p) => [
        `\`${p.route}\``,
        `\`${p.file}\``,
        String(p.lines),
      ]),
      ["Page", "Fichier", "Lignes"],
    ),
  );
  out.push("");
  out.push(
    fence(
      inv.api_routes.map((p) => [
        `\`${p.route}\``,
        `\`${p.file}\``,
        String(p.lines),
      ]),
      ["API", "Fichier", "Lignes"],
    ),
  );
  out.push("");

  out.push("## Base de donnees");
  out.push("");
  out.push(`Tables : ${inv.database.tables.map((t) => `\`${t}\``).join(", ")}`);
  out.push("");
  out.push(
    `Types enumeres : ${inv.database.enums.map((t) => `\`${t}\``).join(", ")}`,
  );
  out.push("");
  out.push("Migrations :");
  out.push("");
  for (const m of inv.database.migrations) out.push(`- \`${m}\``);
  out.push("");

  out.push("## Composants et modules");
  out.push("");
  out.push("Les dix plus gros fichiers, toutes categories confondues :");
  out.push("");
  const gros = [...inv.components, ...inv.lib_modules]
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 10);
  out.push(
    fence(
      gros.map((f) => [`\`${f.file}\``, String(f.lines)]),
      ["Fichier", "Lignes"],
    ),
  );
  out.push("");

  out.push("## Variables d'environnement lues dans le code");
  out.push("");
  out.push(inv.env_vars.map((v) => `\`${v}\``).join(", ") || "Aucune.");
  out.push("");

  out.push("## Evenements analytiques emis");
  out.push("");
  out.push(inv.analytics_events.map((v) => `\`${v}\``).join(", ") || "Aucun.");
  out.push("");

  out.push("## Liens sortants");
  out.push("");
  out.push("Hotes distincts appeles ou lies depuis le code :");
  out.push("");
  out.push(inv.outbound_hosts.map((v) => `\`${v}\``).join(", ") || "Aucun.");
  out.push("");
  out.push(
    "### URL absolues du site ecrites en dur",
    "",
    "Regle : l'origine du site vit dans `apps/web/lib/site.ts` et nulle part",
    "ailleurs. Les origines d'API tierces ne sont pas concernees, elles n'ont",
    "pas d'autre endroit ou vivre.",
    "",
  );
  out.push(
    inv.hardcoded_self_urls.length === 0
      ? "Aucune. Le controle passe."
      : inv.hardcoded_self_urls.map((u) => `- ${u}`).join("\n"),
  );
  out.push("");

  out.push("## Marqueurs TODO et FIXME");
  out.push("");
  out.push(
    inv.markers.length === 0
      ? "Aucun."
      : inv.markers.map((m) => `- ${m}`).join("\n"),
  );
  out.push("");

  out.push("## Tirets longs");
  out.push("");
  out.push(
    "Doctrine du projet : aucun tiret long ni demi-cadratin, dans le code",
    "comme dans les textes produits. Mesure sur l'application, hors outillage",
    "et hors tests.",
    "",
  );
  out.push(
    inv.long_dashes.length === 0
      ? "Aucun. Le controle passe."
      : inv.long_dashes.map((m) => `- ${m}`).join("\n"),
  );
  out.push("");

  out.push("## Noms historiques");
  out.push("");
  out.push(
    fence(
      inv.legacy_names.map((n) => [
        `\`${n.name}\``,
        String(n.hits.length),
        n.hits.length === 0
          ? "aucune"
          : n.hits.map((h) => `\`${h}\``).join(", "),
      ]),
      ["Nom", "Fichiers", "Ou"],
    ),
  );
  out.push("");

  out.push("## Code mort");
  out.push("");
  out.push(
    "Detection par lecture du systeme de fichiers, sans analyseur tiers. Une",
    "entree se ferme de deux facons : on retire le code, ou on la declare dans",
    "`docs/inventory-allow.json` avec sa raison. Une entree sans justification",
    "est un defaut ouvert.",
    "",
  );
  if (inv.dead.length === 0) {
    out.push("Aucune entree.");
  } else {
    out.push(
      fence(
        inv.dead.map((d) => [
          d.kind,
          `\`${d.id}\``,
          d.declared_intentional ? d.declared_intentional : "**non justifiee**",
        ]),
        ["Nature", "Entree", "Justification declaree"],
      ),
    );
  }
  out.push("");
  out.push(
    orphans.length === 0
      ? "Zero entree sans justification. Le controle passe."
      : `${orphans.length} entree(s) sans justification.`,
  );
  out.push("");

  out.push("## Avertissements ESLint");
  out.push("");
  out.push(
    "`eslint .` dans `apps/web` : 0 erreur, " +
      ESLINT.length +
      " avertissements.",
    "La regle `react-hooks/set-state-in-effect` est passee d'erreur a",
    "avertissement dans `apps/web/eslint.config.mjs`, avec sa raison. Chacun est",
    "traite ci-dessous, aucun ne reste anonyme.",
    "",
  );
  out.push(
    fence(
      ESLINT.map(([f, r, d]) => [`\`${f}\``, `\`${r}\``, d]),
      ["Emplacement", "Regle", "Traitement"],
    ),
  );
  out.push("");

  out.push("## Budget de complexite");
  out.push("");
  out.push(
    "Plafonds declares dans `docs/budget.json`, expliques dans `docs/BUDGET.md`.",
    `Severite actuelle : \`${severity}\` (avertissement en vague V0, erreur a partir de V2).`,
    "",
  );
  out.push(
    fence(
      inv.budgets.map((b) => [
        b.level,
        b.label,
        b.broken ? "non mesurable" : String(b.value),
        String(b.max),
        b.broken ? "**mesure cassee**" : b.over ? "**depasse**" : "tenu",
      ]),
      ["Niveau", "Plafond", "Mesure", "Max", "Etat"],
    ),
  );
  out.push("");
  out.push(
    over.length === 0
      ? "Aucun depassement."
      : `${over.length} plafond(s) depasse(s).`,
  );
  out.push("");

  return out.join("\n");
}

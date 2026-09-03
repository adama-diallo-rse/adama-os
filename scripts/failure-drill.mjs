#!/usr/bin/env node
// =====================================================================
// C3-T5, simulation reproductible des modes de panne.
//
//   node scripts/failure-drill.mjs              rejoue les neuf scenarios
//   node scripts/failure-drill.mjs sortie-reseau  n'en rejoue qu'un
//
// Pourquoi ce script existe. La page /systeme/pannes promet un comportement
// pour chacune des huit facons dont ce site peut tomber. Une promesse qui
// n'est pas rejouable est une intention. Ce script rejoue chaque mode, en
// local, sans reseau et sans base, et il ECHOUE si le comportement observe
// n'est pas celui qui est promis a l'ecran.
//
// Comment il evite de recopier la logique. Le module de sante est ecrit en
// TypeScript et vit dans l'application. Le recopier ici en JavaScript
// creerait une seconde verite, qui divergerait au premier changement, et le
// drill validerait alors sa propre copie. Le script COMPILE donc les vrais
// fichiers avec le compilateur TypeScript deja present a la racine, puis les
// importe. Ce qui est teste ici est exactement ce qui tourne en production.
//
// Aucune dependance nouvelle. Aucun acces reseau. Aucune ecriture ailleurs
// que dans docs/failure-drill.json et un dossier temporaire.
// =====================================================================

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// --- Compilation des modules reels ------------------------------------

/**
 * Transpile une poignee de fichiers TypeScript vers un dossier temporaire et
 * renvoie le dossier. Seul le typage est retire : le code execute est le
 * meme, ligne pour ligne.
 */
function compiler(fichiers) {
  const dossier = mkdtempSync(join(tmpdir(), "adama-drill-"));
  for (const [source, cible] of fichiers) {
    const brut = readFileSync(join(ROOT, source), "utf8");
    const { outputText } = ts.transpileModule(brut, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        verbatimModuleSyntax: false,
      },
      fileName: source,
    });
    const chemin = join(dossier, cible);
    mkdirSync(dirname(chemin), { recursive: true });
    // Les imports relatifs sans extension ne se resolvent pas en ESM pur.
    writeFileSync(
      chemin,
      outputText.replace(/from "\.\/([a-z-]+)"/g, 'from "./$1.mjs"'),
      "utf8",
    );
  }
  return dossier;
}

const dossier = compiler([
  ["apps/web/lib/health/types.ts", "types.mjs"],
  ["apps/web/lib/health/criteria.ts", "criteria.mjs"],
  ["apps/web/content/pannes.ts", "pannes.mjs"],
]);

const { buildCapabilities } = await import(
  pathToFileURL(join(dossier, "criteria.mjs")).href
);
const { resolveHealthState, resolveHealthReason } = await import(
  pathToFileURL(join(dossier, "types.mjs")).href
);
const { MODES_PANNE } = await import(
  pathToFileURL(join(dossier, "pannes.mjs")).href
);

// --- Observations de reference ------------------------------------------

const MAINTENANT = new Date("2026-09-02T12:00:00.000Z");

/** Un systeme en parfait etat. Chaque scenario part de la et casse une chose. */
function nominal() {
  return {
    base: { configured: true, readOk: true, dataClassReady: true },
    github: {
      source: "registre",
      expected: 8,
      read: 8,
      missing: [],
      commits: 42,
    },
    rag: {
      documents: 2,
      chunks: 173,
      lastIngestionAt: "2026-08-31T10:00:00.000Z",
      verification: {
        executedAt: "2026-09-01T10:00:00.000Z",
        verdict: "ok",
        best: 0.61,
        worst: 0.53,
        seuilOk: 0.5,
        seuilEchec: 0.45,
      },
    },
    passerelles: {
      configured: 2,
      healthy: 2,
      unhealthy: [],
      unreachable: [],
    },
    analytique: {
      keyConfigured: true,
      region: "UE",
      regionAnnoncee: "UE",
      consentGate: true,
    },
    assistant: { modelKeyConfigured: true, refuseSansSource: true },
    sauvegarde: {
      procedure: true,
      restauration: {
        executedAt: "2026-09-02T08:00:00.000Z",
        result: "reussi",
        scope: "tables du cockpit uniquement, jamais la base entiere",
        tables: 5,
      },
      fraicheurJours: 180,
    },
  };
}

// --- Les scenarios --------------------------------------------------------
//
// `attendu` est la promesse faite a l'ecran, capacite par capacite. Une
// capacite absente de `attendu` doit rester OPERATIONNELLE : un mode de panne
// qui degrade une capacite qu'il ne devrait pas toucher est un defaut, pas
// une precaution.

const SCENARIOS = [
  {
    id: "nominal",
    titre: "Tout repond",
    attendu: {},
    casse: (o) => o,
  },
  {
    id: "github-indisponible",
    titre: "L'hebergeur des depots ne repond pas",
    attendu: { github: "degrade" },
    casse: (o) => {
      o.github.read = 6;
      o.github.missing = [
        {
          fullName: "iroko-software-group/strata-watch",
          reason: "l’hébergeur du dépôt n’a pas répondu",
        },
        {
          fullName: "iroko-software-group/iroko-platform",
          reason: "l’hébergeur du dépôt n’a pas répondu",
        },
      ];
      return o;
    },
  },
  {
    id: "jeton-github",
    titre: "Jeton expire ou de portee insuffisante",
    attendu: { github: "degrade" },
    casse: (o) => {
      o.github.read = 7;
      o.github.missing = [
        {
          fullName: "adama-diallo-rse/strata-scope",
          reason:
            "hors de portée du jeton : dépôt privé d’un autre propriétaire, ou renommé",
        },
      ];
      return o;
    },
  },
  {
    id: "base-indisponible",
    titre: "La base de donnees ne repond pas",
    attendu: { base: "degrade" },
    casse: (o) => {
      o.base.readOk = false;
      o.base.dataClassReady = false;
      return o;
    },
  },
  {
    id: "corpus-vide",
    titre: "Corpus documentaire vide ou hors sujet",
    attendu: { rag: "degrade", assistant: "degrade" },
    casse: (o) => {
      o.rag.documents = 0;
      o.rag.chunks = 0;
      o.rag.verification = {
        executedAt: "2026-09-01T10:00:00.000Z",
        verdict: "echec",
        best: 0.42,
        worst: 0.38,
        seuilOk: 0.5,
        seuilEchec: 0.45,
      };
      return o;
    },
  },
  {
    id: "api-produit",
    titre: "Un produit repond un etat non sain",
    attendu: { passerelles: "degrade" },
    casse: (o) => {
      o.passerelles.healthy = 1;
      o.passerelles.unhealthy = ["ESG Optimizer"];
      return o;
    },
  },
  {
    id: "sortie-reseau",
    titre: "La sortie reseau de ce site est coupee",
    // LE scenario de la couche. Une panne de ce site ne devient JAMAIS une
    // panne produit : l'etat attendu est INDETERMINE, pas DEGRADE.
    attendu: { passerelles: "indetermine" },
    casse: (o) => {
      o.passerelles.healthy = 0;
      o.passerelles.unreachable = ["STRATA Scope", "ESG Optimizer"];
      return o;
    },
  },
  {
    id: "produit-retire",
    titre: "Un produit est retire du registre",
    // Retirer un produit ne casse rien : il y a un depot de moins a lire, et
    // aucun depot manquant. Une capacite degradee ici serait un lien mort.
    attendu: {},
    casse: (o) => {
      o.github.expected = 7;
      o.github.read = 7;
      o.passerelles.configured = 1;
      o.passerelles.healthy = 1;
      return o;
    },
  },
  {
    id: "cle-modele",
    titre: "Acces au fournisseur de modele absent",
    attendu: { assistant: "degrade" },
    casse: (o) => {
      o.assistant.modelKeyConfigured = false;
      return o;
    },
  },
];

// --- Execution --------------------------------------------------------------

const demande = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const choisis =
  demande.length > 0
    ? SCENARIOS.filter((s) => demande.includes(s.id))
    : SCENARIOS;

if (choisis.length === 0) {
  console.error(
    `Scenario inconnu. Disponibles : ${SCENARIOS.map((s) => s.id).join(", ")}`,
  );
  process.exit(1);
}

// Garde-fou de coherence : la page promet un scenario par mode de panne.
const sansDrill = MODES_PANNE.filter(
  (m) => !SCENARIOS.some((s) => s.id === m.simulation),
);
if (sansDrill.length > 0) {
  console.error(
    `✗ ${sansDrill.length} mode(s) de panne annonce(s) a l'ecran sans scenario ici : ${sansDrill
      .map((m) => m.simulation)
      .join(", ")}`,
  );
  process.exit(1);
}

const rapport = [];
let echecs = 0;

for (const scenario of choisis) {
  const observations = scenario.casse(nominal());
  const capacites = buildCapabilities(observations, MAINTENANT);
  const etats = Object.fromEntries(
    capacites.map((c) => [c.id, resolveHealthState(c.criteria)]),
  );

  const ecarts = [];
  for (const capacite of capacites) {
    const attendu = scenario.attendu[capacite.id] ?? "operationnel";
    const obtenu = etats[capacite.id];
    if (attendu !== obtenu) {
      ecarts.push({ capacite: capacite.id, attendu, obtenu });
    }
  }

  const ok = ecarts.length === 0;
  if (!ok) {
    echecs += 1;
  }

  console.log(`\n${ok ? "✓" : "✗"} ${scenario.id} · ${scenario.titre}`);
  for (const capacite of capacites) {
    const etat = etats[capacite.id];
    if (etat === "operationnel") {
      continue;
    }
    console.log(
      `    ${etat.padEnd(13)} ${capacite.name} : ${resolveHealthReason(
        capacite.criteria,
      )}`,
    );
  }
  for (const e of ecarts) {
    console.error(
      `    ECART  ${e.capacite} : attendu ${e.attendu}, obtenu ${e.obtenu}`,
    );
  }

  rapport.push({
    id: scenario.id,
    titre: scenario.titre,
    ok,
    etats,
    ecarts,
    raisons: Object.fromEntries(
      capacites
        .filter((c) => resolveHealthState(c.criteria) !== "operationnel")
        .map((c) => [c.id, resolveHealthReason(c.criteria)]),
    ),
  });
}

rmSync(dossier, { recursive: true, force: true });

writeFileSync(
  join(ROOT, "docs/failure-drill.json"),
  `${JSON.stringify(
    {
      $comment: [
        "C3-T5, resultat de la derniere simulation des modes de panne.",
        "Ecrit par `node scripts/failure-drill.mjs`, jamais a la main.",
      ],
      schema_version: 1,
      executed_at: new Date().toISOString(),
      reference_time: MAINTENANT.toISOString(),
      scenarios: rapport,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  `\n${echecs === 0 ? "✓" : "✗"} ${choisis.length - echecs}/${
    choisis.length
  } scenario(s) conforme(s) a ce que la page promet. Rapport : docs/failure-drill.json`,
);
process.exit(echecs === 0 ? 0 : 1);

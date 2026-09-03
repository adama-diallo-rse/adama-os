#!/usr/bin/env node
// =====================================================================
// C12-T1, les dix controles d'integrite.
//
//   pnpm integrity                 les dix controles, construction comprise
//   pnpm integrity --sans-build    saute la construction de production
//   pnpm integrity --sans-reseau   saute ce qui a besoin de la base
//
// REGLE UNIQUE ET NON NEGOCIABLE DE LA COUCHE : le score d'integrite est la
// SORTIE d'une commande. S'il etait saisi a la main, il deviendrait
// exactement le probleme que tout ce chantier cherche a eliminer, avec en
// prime l'autorite d'un chiffre.
//
// Trois etats par controle, jamais deux :
//   reussi        la commande a tourne et elle a rendu 0
//   echoue        la commande a tourne et elle a rendu autre chose
//   non_execute   la commande n'a pas tourne, et on le dit
//
// « non_execute » n'est pas un echec deguise, et ce n'est pas non plus une
// reussite. C'est l'equivalent de l'etat INDETERMINE de la matrice de sante :
// une mesure qu'on n'a pas faite ne se convertit pas en conclusion.
//
// Sortie : docs/integrity.json, lu par la page technique. Le fichier est
// ecrit meme en cas d'echec, sinon un echec disparaitrait et l'ecran
// repasserait au vert tout seul.
// =====================================================================

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WEB = join(ROOT, "apps/web");
const SANS_BUILD = process.argv.includes("--sans-build");
const SANS_RESEAU = process.argv.includes("--sans-reseau");

const NODE = process.execPath;
const BIN = {
  tsc: join(ROOT, "node_modules/typescript/bin/tsc"),
  vitest: join(WEB, "node_modules/vitest/vitest.mjs"),
  eslint: join(WEB, "node_modules/eslint/bin/eslint.js"),
  next: join(WEB, "node_modules/next/dist/bin/next"),
  inventory: join(ROOT, "scripts/inventory.mjs"),
  drill: join(ROOT, "scripts/failure-drill.mjs"),
};

/** Age en jours d'un horodatage ISO. Null si absent ou illisible. */
function ageJours(iso) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

function lireJson(chemin) {
  const abs = join(ROOT, chemin);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8"));
  } catch {
    return null;
  }
}

/** Lance une commande et rend son code de sortie et sa derniere ligne utile. */
/**
 * Retire les sequences d'echappement de couleur. Sans ce nettoyage elles
 * finissent telles quelles dans docs/integrity.json, donc dans un artefact
 * versionne et sur la page technique qui le lit, et elles cassent au passage
 * toute lecture de la sortie par expression reguliere.
 */
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*m/g;

function lancer(args, cwd = ROOT) {
  const r = spawnSync(NODE, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
    maxBuffer: 64 * 1024 * 1024,
  });
  const sortie = `${r.stdout ?? ""}\n${r.stderr ?? ""}`
    .replace(ANSI, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return { code: r.status ?? 1, sortie };
}

function derniereLigne(sortie, defaut) {
  return sortie.length > 0 ? (sortie[sortie.length - 1] ?? defaut) : defaut;
}

/**
 * Resume d'une execution de tests, en francais.
 *
 * Ce texte n'est pas un journal technique : il est ECRIT DANS
 * docs/integrity.json, que la page /technique affiche telle quelle a un
 * lecteur. Deux raisons de ne pas y recopier la sortie brute. La derniere
 * ligne d'une sortie vitest est la duree, qui ne dit rien de ce qui a ete
 * verifie. Et la ligne de decompte est en anglais, sur un site qui porte ses
 * accents partout ailleurs.
 */
/**
 * Verdict d'une execution de tests, code de retour ET cas reellement executes.
 *
 * Un fichier de test qui se met en sommeil, parce qu'une variable
 * d'environnement manque, sort en code 0. Se fier au seul code de retour fait
 * donc annoncer « reussi » a un controle qui n'a rien exerce. C'est le
 * troisieme etat de cette couche qui convient alors, et pas le premier.
 */
function verdictVitest(code, sortie) {
  const resume = resumeVitest(sortie);
  const executes = Number(/(\d+)\s+cas vérifié/.exec(resume)?.[1] ?? 0);
  if (code === 0 && executes === 0) {
    return {
      status: "non_execute",
      message: `aucun cas n'a été exécuté, la garantie n'est pas vérifiée : ${resume}`,
    };
  }
  return { status: code === 0 ? "reussi" : "echoue", message: resume };
}

function resumeVitest(sortie) {
  const ligne = [...sortie].reverse().find((l) => /^Tests\s/.test(l));
  if (!ligne) {
    return derniereLigne(sortie, "aucune sortie");
  }
  const nombre = (mot) => {
    const m = new RegExp(`(\\d+)\\s+${mot}`).exec(ligne);
    return m ? Number(m[1]) : 0;
  };
  const reussis = nombre("passed");
  const echoues = nombre("failed");
  const ignores = nombre("skipped");
  const morceaux = [];
  if (reussis > 0) {
    morceaux.push(`${reussis} cas vérifié${reussis > 1 ? "s" : ""}`);
  }
  if (echoues > 0) {
    morceaux.push(`${echoues} en échec`);
  }
  if (ignores > 0) {
    morceaux.push(`${ignores} ignoré${ignores > 1 ? "s" : ""}`);
  }
  return morceaux.length > 0 ? morceaux.join(", ") : ligne;
}

// --- Les dix controles ------------------------------------------------------

const CONTROLES = [
  {
    id: "classe-portee",
    label: "Toute donnée affichée porte sa classe",
    detail:
      "Aucune valeur ne se rend sans son marqueur de provenance, nulle part.",
    executer: () => {
      const { code, sortie } = lancer(
        [
          BIN.vitest,
          "run",
          "tests/no-fabrication.test.ts",
          "tests/proof-render.test.tsx",
          "--reporter=dot",
        ],
        WEB,
      );
      return verdictVitest(code, sortie);
    },
  },
  {
    id: "aucune-metrique-fabriquee",
    label: "Aucune métrique fabriquée",
    detail:
      "Un repli chiffré, même bien intentionné, fait échouer ce contrôle.",
    executer: () => {
      const { code, sortie } = lancer(
        [BIN.vitest, "run", "tests/layer-d.test.tsx", "--reporter=dot"],
        WEB,
      );
      return verdictVitest(code, sortie);
    },
  },
  {
    id: "passerelles-lecture-seule",
    label: "Les passerelles produit sont en lecture seule",
    detail:
      "Aucune méthode d’écriture n’est appelée vers un produit du groupe.",
    executer: () => {
      const { code, sortie } = lancer(
        [
          BIN.vitest,
          "run",
          "tests/ecosystem-gateway.test.ts",
          "tests/frontieres.test.ts",
          "--reporter=dot",
        ],
        WEB,
      );
      return verdictVitest(code, sortie);
    },
  },
  {
    id: "rls",
    label: "Les règles de sécurité au niveau des lignes tiennent",
    detail: "Sur base de TEST uniquement. Jamais contre la base de production.",
    executer: () => {
      // Les trois variables sont exigees ensemble. Le fichier de test se met
      // en sommeil si l'adresse ou la cle manquent, et un fichier endormi
      // sort en code 0 : verifier la seule ADAMA_TEST_DB ferait passer la
      // garantie au vert sans avoir rien exerce.
      const manquantes = [
        "ADAMA_TEST_SUPABASE_URL",
        "ADAMA_TEST_SUPABASE_ANON_KEY",
      ].filter((v) => !process.env[v]);
      if (SANS_RESEAU || process.env.ADAMA_TEST_DB !== "1") {
        return {
          status: "non_execute",
          message:
            "base de test absente : monter le banc décrit dans docs/RLS.md, puis poser ADAMA_TEST_DB=1, ADAMA_TEST_SUPABASE_URL et ADAMA_TEST_SUPABASE_ANON_KEY",
        };
      }
      if (manquantes.length > 0) {
        return {
          status: "non_execute",
          message: `ADAMA_TEST_DB vaut 1 mais ${manquantes.join(" et ")} manque(nt) : le fichier serait ignoré et la garantie ne serait pas vérifiée, voir docs/RLS.md`,
        };
      }
      const { code, sortie } = lancer(
        [BIN.vitest, "run", "tests/rls.integration.test.ts", "--reporter=dot"],
        WEB,
      );
      // verdictVitest porte la garde commune : un fichier entierement ignore
      // sort en code 0 et ne prouve rien. Le 2 septembre 2026, sans elle, ce
      // controle annoncait « reussi » sur sept cas ignores.
      return verdictVitest(code, sortie);
    },
  },
  {
    id: "chaine-locale",
    label: "Typage, analyse statique, tests et construction passent",
    detail:
      "La séquence complète de vérification locale, celle qui remplace l’intégration continue absente.",
    executer: () => {
      const etapes = [
        ["typage", [BIN.tsc, "--noEmit"], WEB],
        ["tests", [BIN.vitest, "run", "--reporter=dot"], WEB],
        ["analyse statique", [BIN.eslint, "."], WEB],
      ];
      if (!SANS_BUILD) {
        etapes.push(["construction", [BIN.next, "build"], WEB]);
      }
      // Nombre de cas reellement executes par l'etape « tests ». Vitest sort
      // en 0 quand tous les fichiers sont ignores : sans ce compte, le
      // controle qui couvre le plus de surface annoncerait « reussi » sur une
      // execution vide. Meme defaut que celui corrige sur `rls`, sur le
      // controle ou il coute le plus cher.
      let casExecutes = null;
      for (const [nom, args, cwd] of etapes) {
        const { code, sortie } = lancer(args, cwd);
        if (nom === "tests") {
          const resume = resumeVitest(sortie);
          casExecutes = Number(/(\d+)\s+cas vérifié/.exec(resume)?.[1] ?? 0);
        }
        if (code !== 0) {
          // La derniere ligne d'un echec est souvent un trait de separation,
          // qui ne renseigne personne. On cherche d'abord une ligne qui dit
          // quelque chose : le decompte des cas, ou le premier message
          // d'erreur rencontre.
          const utile =
            [...sortie].reverse().find((l) => /^Tests\s/.test(l)) ??
            sortie.find((l) => /error|Error|échec|FAIL/.test(l)) ??
            derniereLigne(sortie, "échec sans sortie");
          return {
            status: "echoue",
            message: `${nom} : ${/^Tests\s/.test(utile) ? resumeVitest([utile]) : utile}`,
          };
        }
      }
      if (casExecutes === 0) {
        return {
          status: "non_execute",
          message:
            "typage et analyse statique passent, mais aucun cas de test n’a été exécuté : la suite entière a été ignorée",
        };
      }
      const combien =
        casExecutes === null ? "" : `, ${casExecutes} cas vérifiés`;
      if (SANS_BUILD) {
        return {
          status: "non_execute",
          message: `typage, tests et analyse statique passent${combien}, la construction de production n’a pas été lancée`,
        };
      }
      return {
        status: "reussi",
        message: `typage, tests, analyse statique et construction passent${combien}`,
      };
    },
  },
  {
    id: "inventaire",
    label: "L’inventaire du dépôt est à jour",
    detail: "Un dépôt dont l’inventaire ment n’a pas besoin d’être construit.",
    executer: () => {
      const { code, sortie } = lancer([BIN.inventory, "--check"]);
      // Ce controle ne lance pas de tests : il compare l'inventaire versionne
      // a l'etat du depot. Son verdict tient donc au seul code de retour.
      return {
        status: code === 0 ? "reussi" : "echoue",
        message: derniereLigne(sortie, "aucune sortie"),
      };
    },
  },
  {
    id: "pertinence-documentaire",
    label: "La récupération documentaire dépasse son seuil",
    detail:
      "Ramener une source ne suffit pas : elle doit être pertinente. Le seuil est mesuré, pas supposé.",
    executer: () => {
      const rapport = lireJson("docs/rag-verify.json");
      if (!rapport || !rapport.executed_at || !rapport.verdict) {
        return {
          status: "non_execute",
          message:
            "aucune vérification enregistrée : lancer pnpm --filter @adama/db rag:verify",
        };
      }
      const age = ageJours(rapport.executed_at);
      if (rapport.verdict === "echec") {
        return {
          status: "echoue",
          message: `au moins une question de contrôle est sous le seuil, vérification du jour ${String(rapport.executed_at).slice(0, 10)}`,
        };
      }
      return {
        status: "reussi",
        message: `${rapport.verdict === "avertissement" ? "passée avec avertissement" : "passée"}, il y a ${age} jour(s)`,
      };
    },
  },
  {
    id: "restauration",
    label: "La sauvegarde a été restaurée et datée",
    detail:
      "Une sauvegarde non testée n’est pas une sauvegarde. La restauration est sélective, jamais globale.",
    executer: () => {
      const r = lireJson("docs/restauration.json");
      if (!r || !r.executed_at || !r.result) {
        return {
          status: "echoue",
          message:
            "aucun test de restauration enregistré : la politique de sauvegarde est une intention",
        };
      }
      if (r.result === "partiel") {
        return {
          status: "non_execute",
          message:
            "le dernier test a parcouru le chemin complet mais aucune table ne portait de ligne : rien n’a été restauré, donc rien n’est prouvé",
        };
      }
      if (r.result !== "reussi") {
        return {
          status: "echoue",
          message: `dernier test de restauration en échec, le ${String(r.executed_at).slice(0, 10)}`,
        };
      }
      const age = ageJours(r.executed_at);
      if (age !== null && age > 180) {
        return {
          status: "non_execute",
          message: `dernier test de restauration il y a ${age} jours, il ne dit plus rien du présent`,
        };
      }
      return {
        status: "reussi",
        message: `restauration sélective réussie il y a ${age} jour(s), sur ${
          r.tables_exercees ??
          (r.tables ?? []).filter((t) => t.state !== "non_exerce").length
        } table(s) portant des lignes, ${(r.tables ?? []).length} candidate(s)`,
      };
    },
  },
  {
    id: "mention-automatisee",
    label: "La mention de traitement automatisé est présente",
    detail:
      "Au premier contact et en permanence dans l’en-tête de l’assistant.",
    executer: () => {
      const { code, sortie } = lancer(
        [BIN.vitest, "run", "tests/legal.test.tsx", "--reporter=dot"],
        WEB,
      );
      return verdictVitest(code, sortie);
    },
  },
  {
    id: "preuves-fraiches",
    // Le libelle disait « Aucune preuve publique n'est perimee », ce que ce
    // controle ne verifie pas : il n'interroge aucun registre, il exerce la
    // regle de peremption sur des observations simulees. Il etait de surcroit
    // ferme derriere NEXT_PUBLIC_SUPABASE_URL, une variable dont le test
    // exerce n'a aucun besoin : poser cette variable l'aurait fait passer au
    // vert sans rien prouver de plus. Un libelle qui promet plus que ce qui
    // est exerce est exactement la fabrication que cette couche combat.
    label: "La règle de péremption des preuves est exercée",
    detail:
      "Une affirmation dont la preuve a dépassé sa durée de validité se rend périmée, jamais fraîche. La règle est exercée sur des observations simulées, y compris les réponses qui ne confirment rien. Ce contrôle n’interroge pas le registre publié : l’état réel des preuves en ligne se lit sur la page des preuves, pas ici.",
    executer: () => {
      // Deux fichiers, et il en faut deux. `proof-refresh` exerce ce qui est
      // enregistre comme observation, une reponse qui ne confirme rien
      // n'ecrivant rien. `proof-claim` exerce la peremption elle-meme : une
      // valeur plus vieille que sa validite se rend perimee, une valeur sans
      // validite declaree ne se perime pas, une valeur historique non plus.
      // N'en lancer qu'un seul revenait a nommer le controle d'apres une
      // regle que sa commande n'exercait pas.
      const { code, sortie } = lancer(
        [
          BIN.vitest,
          "run",
          "tests/proof-refresh.test.ts",
          "tests/proof-claim.test.ts",
          "--reporter=dot",
        ],
        WEB,
      );
      return verdictVitest(code, sortie);
    },
  },
];

// --- Execution ---------------------------------------------------------------

console.log(`Contrôles d'intégrité, ${CONTROLES.length} au total.\n`);

const resultats = [];
for (const controle of CONTROLES) {
  process.stdout.write(`  ${controle.label} ... `);
  const debut = Date.now();
  let issue;
  try {
    issue = controle.executer();
  } catch (error) {
    issue = {
      status: "echoue",
      message: error instanceof Error ? error.message : String(error),
    };
  }
  const duree = Math.round((Date.now() - debut) / 100) / 10;
  const marque =
    issue.status === "reussi" ? "✓" : issue.status === "echoue" ? "✗" : "·";
  console.log(`${marque} ${issue.status} (${duree}s)`);
  if (issue.status !== "reussi") {
    console.log(`      ${issue.message}`);
  }
  resultats.push({
    id: controle.id,
    label: controle.label,
    detail: controle.detail,
    status: issue.status,
    message: issue.message,
    duree_secondes: duree,
  });
}

// Le drill des modes de panne est verifie a part : il ne fait pas partie des
// dix controles, il verifie que la PAGE des pannes ne promet rien de faux.
const drill = lancer([BIN.drill]);

const echecs = resultats.filter((r) => r.status === "echoue").length;
const nonExecutes = resultats.filter((r) => r.status === "non_execute").length;

const rapport = {
  $comment: [
    "C12-T1, resultat des dix controles d'integrite.",
    "Ecrit par `pnpm integrity`, JAMAIS a la main. Un score saisi serait",
    "exactement le probleme que ce fichier existe pour empecher.",
  ],
  schema_version: 1,
  executed_at: new Date().toISOString(),
  verdict: echecs > 0 ? "echec" : nonExecutes > 0 ? "partiel" : "ok",
  reussis: resultats.filter((r) => r.status === "reussi").length,
  echoues: echecs,
  non_executes: nonExecutes,
  build_inclus: !SANS_BUILD,
  modes_de_panne_conformes: drill.code === 0,
  controls: resultats,
};

writeFileSync(
  join(ROOT, "docs/integrity.json"),
  `${JSON.stringify(rapport, null, 2)}\n`,
  "utf8",
);

console.log(
  `\n${rapport.reussis} réussi(s), ${echecs} en échec, ${nonExecutes} non exécuté(s). Rapport : docs/integrity.json`,
);
console.log(
  drill.code === 0
    ? "Modes de panne : les neuf scénarios sont conformes à ce que la page promet."
    : "Modes de panne : au moins un scénario ne se comporte pas comme la page l'annonce.",
);

process.exit(echecs > 0 || drill.code !== 0 ? 1 : 0);

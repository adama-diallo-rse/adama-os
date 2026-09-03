#!/usr/bin/env node
// =====================================================================
// C0-T4, balayage de l'historique git a la recherche de valeurs
// ressemblant a une cle.
//
//   pnpm audit:secrets            historique complet + arbre de travail
//   pnpm audit:secrets --worktree arbre de travail seulement (plus rapide)
//
// Regle non negociable de ce script : il ne reproduit JAMAIS la valeur
// trouvee, ni a l'ecran, ni dans un fichier. Il donne le motif, le commit, le
// fichier et la ligne. Un rapport d'audit qui recopie le secret le republie.
//
// Sortie : code 0 si rien, code 1 si au moins une correspondance. Le code 1
// est volontaire, il rend le script utilisable comme garde-fou.
// =====================================================================

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const WORKTREE_ONLY = process.argv.includes("--worktree");

// Motifs volontairement etroits : on cherche des formes de cle, pas des mots.
// Un motif large ferait du bruit, et le bruit fait ignorer le rapport.
const PATTERNS = [
  { name: "cle OpenAI", re: /\bsk-[A-Za-z0-9_-]{20,}/g },
  {
    name: "jeton JWT (cle Supabase)",
    re: /\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\./g,
  },
  { name: "jeton GitHub classique", re: /\bghp_[A-Za-z0-9]{30,}/g },
  { name: "jeton GitHub fine-grained", re: /\bgithub_pat_[A-Za-z0-9_]{50,}/g },
  // Le mot "service_role" seul apparait dans des commentaires et de la
  // documentation qui expliquent, precisement, que cette cle ne doit pas
  // fuiter. Le signaler noierait le rapport et ferait ignorer le vrai signal.
  // On cherche donc la FORME d'une valeur, pas la mention du mot.
  {
    name: "charge utile de jeton service_role",
    re: /"role"\s*:\s*"service_role"/g,
  },
  {
    name: "cle service_role renseignee",
    re: /service[_-]?role[_-]?key\s*[=:]\s*["'`]?[A-Za-z0-9._-]{20,}/gi,
  },
  {
    name: "variable SUPABASE_SERVICE_ROLE renseignee",
    re: /SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*\S{10,}/g,
  },
  {
    name: "chaine de connexion avec mot de passe",
    re: /postgres(?:ql)?:\/\/[^\s:@/]+:[^\s@]{6,}@/g,
  },
];

// Emplacements ou la forme est attendue et ne constitue pas une fuite :
// documentation des variables, exemples, et ce script lui-meme.
const EXPECTED = [
  /^docs\//,
  /\.env\.example$/,
  /^scripts\/scan-secrets\.mjs$/,
  /^packages\/db\/migrations\//,
  /^apps\/web\/tests\//,
];
const isExpected = (file) => EXPECTED.some((re) => re.test(file));

function git(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
  });
}

// Ce balayage LIT l'historique git. Hors d'un depot, il ne peut pas s'executer,
// et il ne doit surtout pas se taire : un controle qui n'a pas tourne n'est ni
// un succes ni un echec, c'est le troisieme etat de la couche C12. Il le dit
// en clair et sort en code 2, distinct du code 1 qui signale une vraie
// trouvaille, pour qu'une chaine appelante puisse faire la difference.
try {
  execFileSync("git", ["rev-parse", "--git-dir"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "ignore", "ignore"],
  });
} catch {
  console.error(
    "NON EXECUTE : ce dossier n'est pas un depot git, ou git est absent.\n" +
      "  Le balayage lit l'historique des commits : sans historique, il n'a\n" +
      "  rien a lire. Ce n'est pas un feu vert.\n" +
      `  Dossier analyse : ${ROOT}`,
  );
  process.exit(2);
}

/** Analyse un texte ligne a ligne, sans jamais conserver la valeur trouvee. */
function scanText(text, locate) {
  const hits = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        hits.push({ pattern: name, ...locate(i, line) });
      }
    }
  }
  return hits;
}

const findings = [];

// --- 1. Arbre de travail (fichiers suivis par git) --------------------
//
// Le contenu est lu SUR LE DISQUE, et non par `git show HEAD:`. La difference
// est tout l'interet de cette passe avant un push : une cle collee dans un
// fichier suivi mais pas encore commitee n'existe pas dans HEAD. Jusqu'au
// 2 septembre 2026 cette passe s'appelait « arbre de travail » et lisait le
// dernier commit, donc elle ne voyait jamais ce qu'on s'apprete a committer.
const tracked = git(["ls-files"]).split("\n").filter(Boolean);
for (const file of tracked) {
  if (isExpected(file)) continue;
  let content;
  try {
    content = readFileSync(join(ROOT, file), "utf8");
  } catch {
    // Fichier suivi mais absent du disque : supprime et pas encore commite.
    continue;
  }
  findings.push(
    ...scanText(content, (i) => ({
      where: "arbre de travail",
      commit: "HEAD",
      file,
      line: i + 1,
    })),
  );
}

// --- 2. Historique complet --------------------------------------------
//
// Un depot sans aucun commit n'a pas d'historique a balayer. Le dire, plutot
// que de rendre un rapport vide qui ressemble a un rapport propre.
let historiqueLisible = true;
if (!WORKTREE_ONLY) {
  try {
    execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "ignore", "ignore"],
    });
  } catch {
    historiqueLisible = false;
  }
}
if (!WORKTREE_ONLY && !historiqueLisible) {
  console.error(
    "NON EXECUTE : le depot ne porte aucun commit, il n'y a pas d'historique\n" +
      "  a balayer. L'arbre de travail, lui, a bien ete analyse. Ce n'est pas\n" +
      "  un feu vert sur l'historique.",
  );
  process.exit(2);
}
if (!WORKTREE_ONLY) {
  const log = git([
    "log",
    "--all",
    "--full-history",
    "-p",
    "-U0",
    "--format=\u0001%H\u0002%ad",
    "--date=short",
  ]);
  let commit = "(inconnu)";
  let date = "";
  let file = "(inconnu)";
  const lines = log.split("\n");
  for (const line of lines) {
    if (line.startsWith("\u0001")) {
      const [h, d] = line.slice(1).split("\u0002");
      commit = h.slice(0, 10);
      date = d ?? "";
      continue;
    }
    if (line.startsWith("+++ b/")) {
      file = line.slice(6);
      continue;
    }
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    if (isExpected(file)) continue;
    for (const { name, re } of PATTERNS) {
      re.lastIndex = 0;
      if (re.test(line)) {
        findings.push({
          pattern: name,
          where: "historique",
          commit,
          date,
          file,
          line: null,
        });
      }
    }
  }
}

// --- 3. Rapport --------------------------------------------------------
// Deduplication : un meme motif, dans un meme fichier, sur un meme commit,
// compte pour une entree. On compte les occurrences, on ne les liste pas.
const groupes = new Map();
for (const f of findings) {
  const key = `${f.where}|${f.commit}|${f.file}|${f.pattern}`;
  const g = groupes.get(key) ?? { ...f, occurrences: 0 };
  g.occurrences += 1;
  groupes.set(key, g);
}
const rapport = Array.from(groupes.values()).sort((a, b) =>
  (a.file + a.pattern).localeCompare(b.file + b.pattern),
);

console.log("C0-T4, balayage de secrets");
console.log(`Fichiers suivis analyses : ${tracked.length}`);
console.log(
  `Perimetre : ${WORKTREE_ONLY ? "arbre de travail" : "arbre de travail et historique complet"}`,
);
console.log("");

if (rapport.length === 0) {
  console.log(
    "Aucune valeur ressemblant a une cle en dehors des emplacements attendus.",
  );
  console.log("Emplacements attendus, exclus du balayage :");
  for (const re of EXPECTED) console.log(`  ${re}`);
  process.exit(0);
}

console.log(
  `${rapport.length} correspondance(s). Aucune valeur n'est reproduite ci-dessous.`,
);
console.log("");
for (const f of rapport) {
  const ou = f.line ? `${f.file}:${f.line}` : f.file;
  console.log(`  [${f.pattern}] ${ou}`);
  console.log(
    `      ${f.where}, commit ${f.commit}${f.date ? ` du ${f.date}` : ""}, ${f.occurrences} occurrence(s)`,
  );
}
console.log("");
console.log("Procedure, dans cet ordre :");
console.log(
  "  1. revoquer la cle chez son emetteur (Supabase, OpenAI, GitHub), pas la modifier ;",
);
console.log(
  "  2. en emettre une neuve et la poser dans Vercel puis dans le .env local ;",
);
console.log(
  "  3. verifier les journaux d'usage de l'ancienne cle sur la periode d'exposition ;",
);
console.log(
  "  4. seulement ensuite, decider d'une reecriture d'historique. Une cle revoquee",
);
console.log(
  "     dans un historique public est inoffensive, une cle valide retiree d'un",
);
console.log("     historique reste dans les clones deja faits.");
process.exit(1);

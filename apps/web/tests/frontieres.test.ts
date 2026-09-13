import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { INTERDITS } from "../content/frontieres";
import { GATEWAYS } from "../lib/ecosystem/gateways";

// =====================================================================
// C11-T3, les interdits, verrouilles.
//
// La page /confiance annonce cinq regles et dit, pour chacune, si un test la
// verrouille. Ce fichier EST ce test. Le premier cas verifie que la page ne
// promet pas un verrou qui n'existe pas : une regle annoncee comme testee et
// dont le test n'existe pas serait le pire des trois etats possibles.
//
// Les trois derniers cas lisent le code source plutot que d'appeler des
// fonctions. C'est volontaire : ce qu'on veut interdire, c'est qu'une ligne
// APPARAISSE, pas seulement qu'un chemin d'execution particulier evite de la
// prendre.
// =====================================================================

const WEB = fileURLToPath(new URL("..", import.meta.url));

function fichiers(dir: string, out: string[] = []): string[] {
  for (const nom of readdirSync(dir)) {
    if (nom === "node_modules" || nom === ".next" || nom === ".turbo") continue;
    const complet = join(dir, nom);
    if (statSync(complet).isDirectory()) {
      fichiers(complet, out);
    } else if (/\.(ts|tsx)$/.test(nom) && !/\.test\.tsx?$/.test(nom)) {
      out.push(complet);
    }
  }
  return out;
}

/**
 * Retire les commentaires avant toute recherche.
 *
 * Sans cela, ce fichier de test echouerait sur les commentaires qui
 * EXPLIQUENT precisement ce qui est interdit. Le commentaire de
 * lib/ecosystem/gateways.ts dit qu'une route de webhook existe cote produit
 * et que le cockpit ne l'appelle pas : c'est exactement la discipline qu'on
 * veut, et un test qui la sanctionnerait pousserait a effacer l'explication.
 */
function sansCommentaires(texte: string): string {
  return texte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const SOURCES = [
  ...fichiers(join(WEB, "app")),
  ...fichiers(join(WEB, "components")),
  ...fichiers(join(WEB, "lib")),
].map((f) => {
  const brut = readFileSync(f, "utf8");
  return {
    chemin: f.slice(WEB.length).replace(/\\/g, "/"),
    texte: brut,
    code: sansCommentaires(brut),
  };
});

describe("C11-T3, la page ne promet pas un verrou qui n'existe pas", () => {
  it("chaque interdit annonce comme teste designe un test existant", () => {
    for (const interdit of INTERDITS) {
      if (!interdit.test) continue;
      expect(
        () => readFileSync(join(WEB, interdit.test as string), "utf8"),
        `l'interdit ${interdit.id} annonce ${interdit.test}, qui doit exister`,
      ).not.toThrow();
    }
  });

  it("au moins un interdit assume de n'etre tenu que par la discipline", () => {
    // Si tous les interdits etaient annonces comme testes, la distinction que
    // la page fait entre « verrouille » et « tenu » perdrait tout sens, et
    // c'est le genre d'uniformite qui finit par etre fausse.
    expect(INTERDITS.some((i) => i.test === null)).toBe(true);
  });
});

describe("C11, les passerelles produit sont en lecture seule", () => {
  it("aucune passerelle ne vise autre chose qu'une route de sante", () => {
    const gateways = readFileSync(
      join(WEB, "lib/ecosystem/gateways.ts"),
      "utf8",
    );
    // Le seul chemin appele, dans tout le fichier, est /health.
    const chemins = Array.from(
      gateways.matchAll(/\$\{origin\}(\/[\w/-]*)/g),
    ).map((m) => m[1]);
    expect(chemins.length).toBeGreaterThan(0);
    for (const chemin of chemins) {
      expect(chemin).toBe("/health");
    }
  });

  it("aucune methode d'ecriture n'est employee vers un produit", () => {
    const client = readFileSync(join(WEB, "lib/ecosystem/client.ts"), "utf8");
    const gateways = readFileSync(
      join(WEB, "lib/ecosystem/gateways.ts"),
      "utf8",
    );
    for (const texte of [client, gateways]) {
      expect(texte).not.toMatch(/method:\s*["'`](POST|PUT|PATCH|DELETE)/i);
    }
  });

  it("aucun en-tete d'autorisation ne part vers un produit", () => {
    const client = readFileSync(join(WEB, "lib/ecosystem/client.ts"), "utf8");
    const gateways = readFileSync(
      join(WEB, "lib/ecosystem/gateways.ts"),
      "utf8",
    );
    for (const texte of [client, gateways]) {
      expect(texte).not.toMatch(/Authorization/i);
      expect(texte).not.toMatch(/SERVICE_ROLE|SECRET_KEY|ADMIN_KEY/);
    }
  });

  it("chaque passerelle declaree lit son origine dans une variable dediee", () => {
    for (const gateway of GATEWAYS) {
      expect(gateway.originEnv).toMatch(/^ECOSYSTEM_[A-Z0-9_]+_API_URL$/);
    }
  });
});

describe("C11, aucun secret ne descend dans le navigateur", () => {
  it("aucun composant client ne lit une variable non publique", () => {
    const fautes: string[] = [];
    for (const { chemin, texte } of SOURCES) {
      if (!/^["']use client["']/m.test(texte)) continue;
      for (const m of texte.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
        const nom = m[1] ?? "";
        if (!nom.startsWith("NEXT_PUBLIC_") && nom !== "NODE_ENV") {
          fautes.push(`${chemin} lit ${nom}`);
        }
      }
    }
    expect(fautes).toEqual([]);
  });

  it("tout module qui lit un secret est un module serveur", () => {
    // La regle n'est pas « un seul fichier a le droit », qui vieillirait mal
    // au premier module legitime ajoute. La regle est : un module qui lit un
    // secret declare qu'il est serveur, ou vit dans une route serveur. Le
    // paquet `server-only` leve a l'import depuis un composant client, donc
    // cette declaration n'est pas decorative, elle casse la construction.
    const SECRETS = [
      "GITHUB_TOKEN",
      "GITHUB_TOKEN_IROKO_SOFTWARE_GROUP",
      "GITHUB_TOKEN_ADAMA_DIALLO_RSE",
      "GITHUB_TOKEN_STRATA_ESG",
      "SUPABASE_SERVICE_ROLE_KEY",
      "OPENAI_API_KEY",
      "CRON_SECRET",
      "BETTERSTACK_API_TOKEN",
      "LETTRE_SUPABASE_SERVICE_ROLE_KEY",
      "LETTRE_RESEND_API_KEY",
      "LETTRE_SECRET",
    ];
    const fautes: string[] = [];
    for (const { chemin, code } of SOURCES) {
      const lus = SECRETS.filter((s) => code.includes(s));
      if (lus.length === 0) continue;
      const serveur =
        /^import "server-only"/m.test(code) ||
        chemin.startsWith("app/api/") ||
        chemin.endsWith("/actions.ts");
      if (!serveur) {
        fautes.push(`${chemin} lit ${lus.join(", ")} sans etre serveur`);
      }
    }
    expect(fautes).toEqual([]);
  });
});

describe("C11, aucun appel authentifie vers une route d'administration", () => {
  it("aucune URL de produit ne vise un chemin d'administration", () => {
    const suspect = /https?:\/\/[^\s"'`]*\/(admin|v1\/admin|internal)\b/i;
    const fautes = SOURCES.filter(({ code }) => suspect.test(code)).map(
      (s) => s.chemin,
    );
    expect(fautes).toEqual([]);
  });

  it("aucun webhook produit n'est appele, meme pour un simple controle", () => {
    // Un webhook journalise un evenement, donc il ECRIT. Le fait qu'il
    // s'appelle « ping » ne change pas ce qu'il fait.
    const fautes = SOURCES.filter(({ code }) =>
      /\/v1\/ecosystem\/webhook/.test(code),
    ).map((s) => s.chemin);
    expect(fautes).toEqual([]);
  });
});

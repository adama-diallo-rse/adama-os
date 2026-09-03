import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// =====================================================================
// C1-T9, test anti fabrication.
//
// Le défaut que ce test rend impossible : quelqu'un, un jour, écrit « 1 287 »
// dans un composant parce que la source ne répond pas encore et qu'une case
// vide fait mauvais effet. Le chiffre reste. Personne ne se souvient qu'il
// est inventé. Le site ment sans que personne ait menti.
//
// Règle. Dans un composant qui affiche des métriques, aucun littéral
// numérique de plus de deux chiffres ne peut apparaître en clair. Les
// constantes de mise en page échappent à la règle à deux conditions : elles
// sont déclarées et nommées au niveau du module, ou elles figurent dans la
// liste d'exceptions ci-dessous avec leur raison écrite.
//
// Ce qu'un « composant d'affichage de métrique » veut dire ici, et pourquoi
// c'est détecté plutôt que listé : un fichier qui importe lib/metrics,
// lib/proof ou un composant de rendu de valeur. Une liste écrite à la main
// vieillirait mal, et le composant ajouté demain y échapperait.
// =====================================================================

const WEB = fileURLToPath(new URL("..", import.meta.url));

/** Marqueurs d'import qui font entrer un fichier dans le périmètre. */
const MARQUEURS = [
  "lib/metrics",
  "lib/proof",
  "./proof/claim-value",
  "./proof/data-class",
  "./animated-number",
  "AnimatedNumber",
  "ClaimNumber",
];

/**
 * Exceptions déclarées. Chaque entrée porte sa raison, relue au même titre
 * que le code. Une exception sans raison n'existe pas.
 */
const EXCEPTIONS: Record<string, { valeur: string; raison: string }[]> = {
  "app/metrics/page.tsx": [
    {
      valeur: "120",
      raison:
        "Borne de la requête Supabase (limit). Ce n'est pas une valeur affichée, c'est le nombre de lignes lues.",
    },
  ],
};

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/** Retire commentaires et chaînes : une classe Tailwind n'est pas un chiffre
 *  affiché, et un commentaire encore moins. */
function nettoyer(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1 ")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
}

/** Nombres déclarés et nommés au niveau du module : constantes assumées. */
function constantesDeclarees(source: string): Set<string> {
  const set = new Set<string>();
  for (const m of source.matchAll(
    /^\s*(?:export\s+)?const\s+[A-Za-z_$][\w$]*\s*(?::[^=]+)?=\s*(\d{3,})\s*[;,]?\s*$/gm,
  )) {
    set.add(m[1] as string);
  }
  return set;
}

const fichiers = [
  ...walk(join(WEB, "components")),
  ...walk(join(WEB, "app")).filter((f) => /page\.tsx$/.test(f)),
];

const cibles = fichiers.filter((f) => {
  const source = readFileSync(f, "utf8");
  return MARQUEURS.some((m) => source.includes(m));
});

describe("test anti fabrication", () => {
  it("trouve bien des composants d'affichage de métrique à surveiller", () => {
    // Si ce test tombe à zéro, c'est que la détection est cassée, pas que le
    // dépôt est propre. Sans lui, tout le reste passerait en silence.
    expect(cibles.length).toBeGreaterThan(2);
  });

  for (const fichier of cibles) {
    const relatif = fichier.slice(WEB.length).split("\\").join("/");
    it(`ne fabrique aucun chiffre dans ${relatif}`, () => {
      const source = readFileSync(fichier, "utf8");
      const nettoye = nettoyer(source);
      const declarees = constantesDeclarees(source);
      const tolerees = new Set(
        (EXCEPTIONS[relatif] ?? []).map((e) => e.valeur),
      );

      const suspects = Array.from(
        nettoye.matchAll(/(?<![\w.])(\d{3,})(?![\w.])/g),
      )
        .map((m) => m[1] as string)
        .filter((n) => !declarees.has(n) && !tolerees.has(n));

      expect(
        suspects,
        `Littéral(aux) numérique(s) de plus de deux chiffres dans ${relatif} : ${suspects.join(
          ", ",
        )}. Une métrique s'affiche depuis un Claim, jamais depuis une valeur écrite dans le composant. Si c'est une constante de mise en page, nommez-la au niveau du module ou déclarez-la dans EXCEPTIONS avec sa raison.`,
      ).toEqual([]);
    });
  }
});

describe("le détecteur lui-même", () => {
  // Un garde-fou qui ne se vérifie pas est un garde-fou qu'on croit avoir.
  const detecte = (source: string) => {
    const declarees = constantesDeclarees(source);
    return Array.from(nettoyer(source).matchAll(/(?<![\w.])(\d{3,})(?![\w.])/g))
      .map((m) => m[1] as string)
      .filter((n) => !declarees.has(n));
  };

  it("repère un chiffre fabriqué en clair dans du JSX", () => {
    expect(detecte("const T = () => <p>{1287}</p>;")).toEqual(["1287"]);
  });

  it("laisse passer une constante de mise en page nommée", () => {
    expect(
      detecte("const HAUTEUR = 120;\nconst T = () => <p>{HAUTEUR}</p>;"),
    ).toEqual([]);
  });

  it("ne confond pas une classe utilitaire avec un chiffre affiché", () => {
    expect(
      detecte('const T = () => <p className="mt-[420px]">ok</p>;'),
    ).toEqual([]);
  });

  it("ne compte pas un nombre cité dans un commentaire", () => {
    expect(
      detecte("// on affichait 1287 avant la couche C1\nconst a = 1;"),
    ).toEqual([]);
  });

  it("ne s'arrête pas aux nombres de deux chiffres", () => {
    expect(detecte("const T = () => <p>{42}</p>;")).toEqual([]);
  });
});

describe("exceptions déclarées", () => {
  it("porte une raison écrite pour chaque exception", () => {
    for (const [fichier, entrees] of Object.entries(EXCEPTIONS)) {
      for (const entree of entrees) {
        expect(
          entree.raison.length,
          `${fichier} ${entree.valeur}`,
        ).toBeGreaterThan(20);
      }
    }
  });
});

// =====================================================================
// C1, suite. Toute écriture dans une table porteuse de classe la déclare.
//
// Le défaut que ce test rend impossible, et qui s'est produit pour de vrai le
// 3 septembre 2026 : la migration 0003 a rendu `data_class` obligatoire, et le
// chemin d'écriture de la synchronisation des passerelles ne la passait pas.
// Résultat en production, `insertion refusée : null value in column
// "data_class"`, deux relevés de disponibilité perdus par appel, et une page
// de métriques qui vieillissait sans que rien ne soit en panne à l'écran.
//
// Le semis avait eu le même défaut au même endroit et avait été corrigé seul.
// Corriger un seul chemin laisse la faille aux autres : la règle porte donc
// sur TOUS les fichiers, et sur les deux tables qui portent une classe.
// =====================================================================

/** Tables dont la colonne data_class est NOT NULL depuis la migration 0003. */
const TABLES_A_CLASSE = ["ecosystem_analytics", "system_metrics"];

/** Fenêtre de lecture après l'appel d'écriture, en caractères. */
const FENETRE = 2500;

describe("écriture en base, la classe de donnée est déclarée", () => {
  it("aucune insertion dans une table à classe n'omet data_class", () => {
    const manquants: string[] = [];

    const aScanner = [
      ...walk(join(WEB, "lib")),
      ...walk(join(WEB, "app")),
      ...walk(join(WEB, "components")),
    ];

    for (const fichier of aScanner) {
      const contenu = readFileSync(fichier, "utf8");

      for (const table of TABLES_A_CLASSE) {
        const marqueur = `.from("${table}")`;
        let depuis = 0;

        for (;;) {
          const i = contenu.indexOf(marqueur, depuis);
          if (i === -1) {
            break;
          }
          depuis = i + marqueur.length;

          // On ne regarde que les écritures. Une lecture n'a rien à classer.
          const suite = contenu.slice(i, i + FENETRE);
          const ecrit = /\.(insert|upsert|update)\s*\(/.test(suite);
          if (!ecrit) {
            continue;
          }
          // La construction des lignes précède souvent l'appel : on lit aussi
          // en amont, sinon un `rows` monté plus haut échapperait à la règle.
          const amont = contenu.slice(Math.max(0, i - FENETRE), i);
          if (!/data_class/.test(suite) && !/data_class/.test(amont)) {
            manquants.push(
              `${fichier.slice(WEB.length)} → ${table}, écriture sans data_class`,
            );
          }
        }
      }
    }

    expect(manquants).toEqual([]);
  });
});

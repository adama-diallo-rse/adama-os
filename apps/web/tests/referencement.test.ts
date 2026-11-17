import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACTIVITE,
  IDENTITE,
  LANGUES,
  METIER,
  REFERENCEMENT,
} from "../content/profil";
import { QUESTIONS_ACCUEIL } from "../content/accueil";
import { ARTICLES } from "../content/articles";
import { CONTACT_EMAIL, LINKEDIN_PROFILE_URL } from "../components/types";
import { BOITE_RECEPTION, EDITEUR } from "../lib/legal";
import {
  ID_PERSONNE,
  MAISONS,
  grapheRacine,
  noeudQuestions,
  serialiser,
} from "../lib/entites";
import { PAGES, filAriane, filArianeJsonLd } from "../lib/fil-ariane";

// =====================================================================
// Référencement, passe du 14 novembre 2026.
//
// Ce que ces tests rendent impossible :
//   - un titre ou une description que le moteur coupe au milieu d'un mot ;
//   - un accueil dont le h1 ne nomme ni la personne ni son métier ;
//   - une page qui écrit sa propre personne, sans identifiant, à côté du
//     graphe d'entités ;
//   - une page publique sans nom dans le fil d'Ariane ;
//   - une adresse de messagerie grand public affichée sur une surface.
// =====================================================================

const RACINE = join(__dirname, "..");
const SUFFIXE_MARQUE = " · ADAMA OS";
/** Au-delà, un moteur coupe le titre ; la marque en fin de ligne y passe. */
const TITRE_MAX = 64;
/** Au-delà, un moteur coupe la description et choisit lui-même la suite. */
const DESCRIPTION_MAX = 160;

function lister(dossier: string, motif: RegExp): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin, motif);
    return motif.test(nom) ? [chemin] : [];
  });
}

const lire = (relatif: string) => readFileSync(join(RACINE, relatif), "utf8");

/** Les pages du dossier app/, avec leur adresse. */
const PAGES_APP = lister(join(RACINE, "app"), /^page\.tsx$/).map((chemin) => {
  const dossier = relative(join(RACINE, "app"), join(chemin, ".."));
  return {
    fichier: chemin,
    route: `/${dossier.replace(/\\/g, "/")}`.replace(/\/$/, "") || "/",
    code: readFileSync(chemin, "utf8"),
  };
});

const PRIVEES = ["/admin", "/checkin", "/login", "/mot-de-passe", "/auth"];
const estPrivee = (route: string) =>
  PRIVEES.some((p) => route === p || route.startsWith(`${p}/`));
const estDynamique = (route: string) => route.includes("[");

const PAGES_PUBLIQUES_FIXES = PAGES_APP.filter(
  (p) => !estPrivee(p.route) && !estDynamique(p.route) && p.route !== "/",
);

describe("l'accueil dit qui, quel métier et où", () => {
  it("porte le nom, le métier et les deux villes dans son titre", () => {
    const titre = REFERENCEMENT.accueil.titre;
    expect(titre).toContain(IDENTITE.nom);
    expect(titre).toMatch(/logiciels ESG/i);
    for (const ville of ACTIVITE.villes) expect(titre).toContain(ville);
    // La marque ferme le titre : si le moteur coupe, c'est elle qui part.
    expect(titre.endsWith("| ADAMA OS")).toBe(true);
    expect(titre.replace(" | ADAMA OS", "").length).toBeLessThanOrEqual(60);
  });

  it("tient sa description dans ce qu'un moteur affiche", () => {
    const description = REFERENCEMENT.accueil.description;
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(description).toContain(IDENTITE.nom);
    for (const maison of ACTIVITE.maisons) {
      expect(description).toContain(maison);
    }
    for (const ville of ACTIVITE.villes) expect(description).toContain(ville);
  });

  it("ouvre son h1 unique par la ligne de métier", () => {
    const accueil = lire("components/dashboard.tsx");
    expect(accueil.match(/<h1\b/g)).toHaveLength(1);
    const h1 = accueil.slice(accueil.indexOf("<h1"), accueil.indexOf("</h1>"));
    expect(h1).toContain("{METIER.fr}");
    expect(h1).toContain("TITRE_HERO");
    expect(METIER.fr).toContain(IDENTITE.nom);
    for (const ville of ACTIVITE.villes) {
      expect(METIER.fr).toContain(ville);
      expect(METIER.en).toContain(ville);
    }
  });

  it("lit ses balises dans la source du profil, sans les recopier", () => {
    const page = lire("app/page.tsx");
    expect(page).toContain("REFERENCEMENT.accueil.titre");
    expect(page).toContain("REFERENCEMENT.accueil.description");
    expect(lire("app/layout.tsx")).toContain("REFERENCEMENT.accueil.titre");
  });

  it("ne porte ni tiret long ni superlatif dans ses balises", () => {
    for (const texte of [
      REFERENCEMENT.accueil.titre,
      REFERENCEMENT.accueil.description,
      REFERENCEMENT.aPropos.titre,
      REFERENCEMENT.aPropos.description,
      REFERENCEMENT.anglais.titre,
      METIER.fr,
      METIER.en,
    ]) {
      expect(texte, texte).not.toMatch(/[–—]/);
      expect(texte, texte).not.toMatch(
        /\b(meilleur|leader|unique|best|leading|expert)\b/i,
      );
    }
  });
});

describe("chaque page publique a un titre et une description entiers", () => {
  it("garde les titres écrits en dur sous la limite, marque comprise", () => {
    for (const p of PAGES_PUBLIQUES_FIXES) {
      const bloc = p.code.match(
        /export const metadata[^=]*=\s*\{([\s\S]*?)\n\};/,
      );
      const titre = bloc?.[1]?.match(/\n {2}title:\s*"([^"\n]*)"/)?.[1];
      // Un titre lu dans une source (article, profil) se mesure à sa source.
      if (!titre) continue;
      expect(
        titre.length + SUFFIXE_MARQUE.length,
        `${p.route} : « ${titre} »`,
      ).toBeLessThanOrEqual(TITRE_MAX);
    }
  });

  it("garde les descriptions écrites en dur sous la limite", () => {
    for (const p of PAGES_PUBLIQUES_FIXES) {
      const bloc = p.code.match(
        /export const metadata[^=]*=\s*\{([\s\S]*?)\n\};/,
      );
      const description = bloc?.[1]?.match(
        /\n {2}description:\s*"([^"\n]*)"/,
      )?.[1];
      if (!description) continue;
      expect(
        description.length,
        `${p.route} : ${description}`,
      ).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it("ne laisse aucune page publique avec un titre d'un seul mot", () => {
    for (const p of PAGES_PUBLIQUES_FIXES) {
      const bloc = p.code.match(
        /export const metadata[^=]*=\s*\{([\s\S]*?)\n\};/,
      );
      const titre = bloc?.[1]?.match(/\n {2}title:\s*"([^"\n]*)"/)?.[1];
      if (!titre) continue;
      // Les deux pages légales gardent leur nom d'usage.
      if (["/mentions-legales", "/confidentialite"].includes(p.route)) continue;
      expect(
        titre.trim().split(/\s+/).length,
        `${p.route} : « ${titre} »`,
      ).toBeGreaterThan(2);
    }
  });

  it("mesure les titres composés du profil", () => {
    expect(REFERENCEMENT.aPropos.titre.length).toBeLessThanOrEqual(TITRE_MAX);
    expect(REFERENCEMENT.aPropos.description.length).toBeLessThanOrEqual(
      DESCRIPTION_MAX,
    );
    expect(
      REFERENCEMENT.anglais.titre.replace(" | ADAMA OS", "").length,
    ).toBeLessThanOrEqual(60);
  });
});

describe("le graphe d'entités", () => {
  const graphe = grapheRacine()["@graph"] as Record<string, unknown>[];
  const personne = graphe.find((n) => n["@type"] === "Person");
  const maisons = graphe.filter((n) => n["@type"] === "Organization");

  it("nomme exactement les maisons de l'activité", () => {
    expect(MAISONS.map((m) => m.nom)).toEqual([...ACTIVITE.maisons]);
    expect(maisons.map((m) => m.name)).toEqual([...ACTIVITE.maisons]);
  });

  it("décrit la personne une fois, avec son identifiant", () => {
    expect(personne?.["@id"]).toBe(ID_PERSONNE);
    expect(personne?.name).toBe(IDENTITE.nom);
    expect(personne?.email).toBe(`mailto:${CONTACT_EMAIL}`);
    expect(personne?.knowsLanguage).toEqual(LANGUES.map((l) => l.code));
    // Les profils publics de la même personne, LinkedIn en tête.
    expect(personne?.sameAs).toContain(LINKEDIN_PROFILE_URL);
    expect(lire("components/page-shell.tsx")).toContain("LINKEDIN_PROFILE_URL");
  });

  it("relie chaque maison à son fondateur par identifiant", () => {
    for (const maison of maisons) {
      expect(maison.founder, String(maison.name)).toEqual({
        "@id": ID_PERSONNE,
      });
      expect(String(maison.url)).toMatch(/^https:\/\//);
    }
    const emplois = personne?.worksFor as { "@id": string }[];
    expect(emplois.map((e) => e["@id"])).toEqual(maisons.map((m) => m["@id"]));
  });

  it("n'écrit plus de personne anonyme dans une page", () => {
    const coupables = [
      ...lister(join(RACINE, "app"), /\.tsx?$/),
      ...lister(join(RACINE, "components"), /\.tsx?$/),
    ]
      .filter((f) =>
        /"@type":\s*"Person",\s*name:/.test(readFileSync(f, "utf8")),
      )
      .map((f) => relative(RACINE, f).replace(/\\/g, "/"));
    expect(
      coupables,
      "Une personne sans identifiant est une autre personne pour une machine : utiliser refPersonne() de lib/entites.ts.",
    ).toEqual([]);
  });

  it("déclare les questions de l'accueil depuis la liste affichée", () => {
    const noeud = noeudQuestions(QUESTIONS_ACCUEIL, "/");
    expect(noeud["@type"]).toBe("FAQPage");
    expect(noeud.mainEntity).toHaveLength(QUESTIONS_ACCUEIL.length);
    expect(noeud.mainEntity[0]?.name).toBe(`Qui est ${IDENTITE.nom} ?`);
    expect(lire("app/page.tsx")).toContain("noeudQuestions(QUESTIONS_ACCUEIL");
    for (const q of QUESTIONS_ACCUEIL) {
      expect(q.r, q.q).not.toMatch(/[–—]/);
      expect(q.r.length, q.q).toBeGreaterThan(60);
    }
  });

  it("ne laisse aucune balise fermante dans un script de données", () => {
    expect(serialiser({ texte: "</script><b>" })).not.toContain("</script>");
  });
});

describe("le fil d'Ariane", () => {
  it("nomme chaque page publique fixe", () => {
    const sansNom = PAGES_PUBLIQUES_FIXES.map((p) => p.route).filter(
      (route) => !PAGES[route],
    );
    expect(
      sansNom,
      "Une nouvelle page publique demande sa ligne dans PAGES (lib/fil-ariane.ts).",
    ).toEqual([]);
  });

  it("ne nomme aucune page qui n'existe pas", () => {
    const routes = new Set(PAGES_APP.map((p) => p.route));
    for (const chemin of Object.keys(PAGES)) {
      expect(routes.has(chemin), chemin).toBe(true);
    }
  });

  it("nomme les notes de fond dans leurs deux langues", () => {
    for (const article of ARTICLES) {
      expect(PAGES[article.href], article.href).toBeDefined();
      expect(PAGES[article.en.href], article.en.href).toBeDefined();
    }
  });

  it("se tait sur l'accueil et sur les surfaces privées", () => {
    expect(filAriane("/")).toEqual([]);
    expect(filAriane(null)).toEqual([]);
    expect(filAriane("/admin/lettre")).toEqual([]);
    expect(filArianeJsonLd("/")).toBeNull();
  });

  it("saute les segments qui n'ont pas de page à eux", () => {
    expect(filAriane("/en/articles/proof-method").map((m) => m.chemin)).toEqual(
      ["/", "/en", "/en/articles/proof-method"],
    );
    expect(filAriane("/verifier/cockpit-code-public")).toEqual([
      { nom: "ADAMA OS", chemin: "/" },
      { nom: "Preuves", chemin: "/preuves" },
      {
        nom: "Cockpit code public",
        chemin: "/verifier/cockpit-code-public",
      },
    ]);
    expect(filAriane("/decisions/ADR-0007").at(-1)?.nom).toBe("ADR-0007");
    expect(filAriane("/methodes/m-001").at(-1)?.nom).toBe("M-001");
  });

  it("numérote ses maillons et leur donne une adresse entière", () => {
    const noeud = filArianeJsonLd("/systeme/pannes");
    expect(noeud?.itemListElement.map((e) => e.position)).toEqual([1, 2, 3]);
    for (const element of noeud?.itemListElement ?? []) {
      expect(element.item).toMatch(/^https?:\/\//);
    }
  });

  it("retrouve chaque page publique fixe dans le sitemap", () => {
    const sitemap = lire("app/sitemap.ts");
    const absentes = PAGES_PUBLIQUES_FIXES.map((p) => p.route).filter(
      (route) => !sitemap.includes(`"${route}"`),
    );
    expect(
      absentes,
      "Une page publique absente du sitemap n'est découverte que par ses liens.",
    ).toEqual([]);
  });

  it("est servi par le kit de page intérieure", () => {
    expect(lire("components/page-shell.tsx")).toContain("<FilAriane />");
  });
});

describe("l'adresse de contact", () => {
  it("vit sur le domaine du site", () => {
    expect(CONTACT_EMAIL).toMatch(/@adamesg-os\.fr$/);
    expect(EDITEUR.contact).toBe(CONTACT_EMAIL);
  });

  it("n'affiche aucune messagerie grand public sur une surface", () => {
    const motif = /@(gmail|yahoo|hotmail|outlook|live|icloud)\./i;
    const coupables = [
      ...lister(join(RACINE, "app"), /\.tsx?$/),
      ...lister(join(RACINE, "components"), /\.tsx?$/),
      ...lister(join(RACINE, "content"), /\.tsx?$/),
    ]
      .filter((f) => motif.test(readFileSync(f, "utf8")))
      .map((f) => relative(RACINE, f).replace(/\\/g, "/"));
    expect(coupables).toEqual([]);
  });

  it("garde une boîte de réception interne, hors des pages", () => {
    expect(BOITE_RECEPTION).not.toBe(CONTACT_EMAIL);
    expect(lire("lib/conseil/registre.ts")).toContain("to: [BOITE_RECEPTION]");
  });
});

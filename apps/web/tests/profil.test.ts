import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ACTIVITE,
  COMPETENCES,
  EXPERIENCES,
  IDENTITE,
  ORGANISATIONS_ACTUELLES,
  OUVERTURE,
  PORTES_ENTREE,
  POSTE_ACTUEL,
  FORMATION,
  type DomaineCompetence,
  type Experience,
  type Formation,
} from "../content/profil";

// =====================================================================
// C9-T8, cohérence des intitules de poste.
//
// Le defaut que ce test rend impossible : le hero annonce un intitule, le
// JSON-LD un autre, la modale un troisieme, et un recruteur qui compare la
// page et le resultat de recherche voit deux personnes differentes.
//
// La regle verrouillee ici : un titre, une maison ou une ligne d'ouverture
// ne s'ecrivent nulle part ailleurs que dans apps/web/content/profil.ts. Les
// endroits qui les portent, le hero, le JSON-LD, le profil professionnel et
// le CV, lisent la meme source.
//
// 23 octobre 2026. La recherche de poste est close depuis le 10 octobre.
// Les motifs d'intitule ci-dessous ne servent plus a garder une recherche
// coherente : ils verifient qu'elle a disparu PARTOUT, source comprise. Un
// « Disponible en CDI » oublie dans un coin du site contredirait le profil
// de fondateur que tout le reste affiche.
// =====================================================================

const WEB = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_PROFIL = "content/profil.ts";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/** Retire les commentaires. Un commentaire qui explique une correction a le
 *  droit de citer la formulation corrigee : sans ce nettoyage, documenter le
 *  defaut le ferait rouvrir. */
function sansCommentaires(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1 ");
}

const fichiers = [
  ...walk(join(WEB, "app")),
  ...walk(join(WEB, "components")),
  ...walk(join(WEB, "content")),
  ...walk(join(WEB, "lib")),
].map((f) => {
  const brut = readFileSync(f, "utf8");
  return {
    relatif: f.slice(WEB.length).split("\\").join("/"),
    source: brut,
    code: sansCommentaires(brut),
  };
});

/**
 * La forme d'une affirmation de profil, quelle que soit sa formulation.
 * On cherche le motif et non la chaine : c'est la divergence de formulation
 * qui est le defaut, pas la repetition a l'identique.
 */
const MOTIFS_DE_PROFIL: { motif: RegExp; quoi: string }[] = [
  { motif: /charg[ée]{1,2}e?s? de missions?/i, quoi: "Un intitule de poste" },
  { motif: /consultante?\s+RSE/i, quoi: "Un intitule de poste" },
  { motif: /chef(fe)?\s+de\s+projet/i, quoi: "Un intitule de poste" },
  { motif: /novembre\s+2026/i, quoi: "L'echeance de disponibilite" },
  { motif: /\bCDI\b/, quoi: "Le type de contrat recherche" },
  { motif: /open to work/i, quoi: "Le badge de recherche" },
  { motif: /prise de fonction/i, quoi: "L'echeance de disponibilite" },
  { motif: /je (re)?cherche un poste/i, quoi: "La recherche de poste" },
];

/**
 * Exceptions declarees. Chaque entree porte sa raison, relue au meme titre
 * que le code. Une exception sans raison n'existe pas.
 */
const EXCEPTIONS: Record<string, string> = {
  "components/vsme-simulator.tsx":
    "Le sigle CDI y designe un indicateur social du referentiel VSME, la part de contrats stables dans l'effectif. Il ne parle pas du contrat recherche par Adama, et le confondre avec lui serait une erreur de lecture, pas une divergence de profil.",
  "content/conseil.ts":
    "Les mois de 2026 y bornent les periodes du plafond de capacite EG9, ecrites dans la branche EG avant la premiere vente. Ils ne disent rien de la disponibilite recherchee par Adama, et les lire depuis le profil lierait deux regles qui changent pour des raisons differentes.",
};

describe("C9-T8, une seule source pour le profil", () => {
  it("n'ecrit le titre actuel qu'a un seul endroit", () => {
    const coupables = fichiers
      .filter((f) => f.relatif !== SOURCE_PROFIL)
      .filter((f) => f.code.includes(POSTE_ACTUEL))
      .map((f) => f.relatif);
    expect(
      coupables,
      `Le titre « ${POSTE_ACTUEL} » est ecrit en dur dans ${coupables.join(", ")}. Il doit etre lu depuis content/profil.ts.`,
    ).toEqual([]);
  });

  it("n'ecrit la ligne d'ouverture qu'a un seul endroit", () => {
    const coupables = fichiers
      .filter((f) => f.relatif !== SOURCE_PROFIL)
      .filter((f) => f.code.includes(OUVERTURE))
      .map((f) => f.relatif);
    expect(coupables).toEqual([]);
  });

  it("fait lire cette source par les endroits qui portent le profil", () => {
    const attendus = [
      "components/dashboard.tsx",
      "app/layout.tsx",
      "app/recruteur/page.tsx",
    ];
    for (const attendu of attendus) {
      const fichier = fichiers.find((f) => f.relatif === attendu);
      expect(fichier, `${attendu} introuvable`).toBeDefined();
      expect(
        fichier?.source,
        `${attendu} n'importe pas content/profil.ts`,
      ).toMatch(/from "\.{1,3}(\/\.\.)*\/content\/profil"/);
    }
  });

  it("ne garde aucune trace de la recherche de poste, source comprise", () => {
    // Ce cas existe parce que la premiere version du test ne cherchait que
    // les chaines EXACTES des intitules, et qu'elle a laisse passer quatre
    // variantes divergentes. On cherche donc la FORME d'un intitule, pas sa
    // formulation. Depuis le 23 octobre 2026, content/profil.ts n'est plus
    // exempte : la recherche est close, elle ne doit plus s'ecrire nulle part.
    for (const { motif, quoi } of MOTIFS_DE_PROFIL) {
      const coupables = fichiers
        .filter((f) => motif.test(f.code))
        .map((f) => f.relatif)
        .filter((relatif) => !EXCEPTIONS[relatif]);
      expect(
        coupables,
        `${quoi} ecrit dans ${coupables.join(", ")}. La recherche de poste est close depuis le 10 octobre 2026, ou declarer une exception avec sa raison.`,
      ).toEqual([]);
    }
  });

  it("porte une raison ecrite pour chaque exception", () => {
    for (const [fichier, raison] of Object.entries(EXCEPTIONS)) {
      expect(raison.length, fichier).toBeGreaterThan(40);
      expect(
        fichiers.some((f) => f.relatif === fichier),
        `${fichier} est declare en exception mais n'existe plus`,
      ).toBe(true);
    }
  });

  it("compose le titre et la situation depuis l'activite", () => {
    expect(POSTE_ACTUEL.startsWith(ACTIVITE.titre)).toBe(true);
    for (const maison of ACTIVITE.maisons) {
      expect(POSTE_ACTUEL).toContain(maison);
      expect(IDENTITE.situation).toContain(maison);
    }
    for (const ville of ACTIVITE.villes) {
      expect(IDENTITE.situation).toContain(ville);
    }
  });

  it("declare comme actuelles exactement les deux maisons", () => {
    // Le JSON-LD lit worksFor dans cette projection : une maison absente
    // d'ici disparaitrait des resultats de recherche sans que la page change.
    expect(ORGANISATIONS_ACTUELLES.map((o) => o.organisation).sort()).toEqual(
      [...ACTIVITE.maisons].sort(),
    );
  });

  it("ouvre trois portes, chacune adressee et sans prix", () => {
    expect(PORTES_ENTREE).toHaveLength(3);
    for (const porte of PORTES_ENTREE) {
      expect(porte.public.length).toBeGreaterThan(8);
      expect(porte.objet.length).toBeGreaterThan(30);
      // Un prix vit sur le site de la maison, qui en repond. Le recopier ici
      // le ferait diverger a la premiere revision tarifaire.
      expect(porte.objet).not.toMatch(/€|euros?\b|F\s?CFA|\bXOF\b|\d/i);
      if (porte.lien) {
        expect(porte.lien).toMatch(/^https:\/\//);
        expect(porte.libelleLien?.length ?? 0).toBeGreaterThan(3);
      } else {
        expect(porte.libelleLien).toBeNull();
      }
    }
  });
});

describe("C9, la matiere du profil", () => {
  it("porte trois domaines de competence, pas dix", () => {
    const domaines: readonly DomaineCompetence[] = COMPETENCES;
    expect(domaines).toHaveLength(3);
    for (const domaine of domaines) {
      expect(domaine.matieres.length).toBeGreaterThanOrEqual(3);
      expect(domaine.matieres.length).toBeLessThanOrEqual(4);
    }
  });

  // Cette verification a change le 2 septembre 2026. Elle demandait que le
  // nom de chaque organisation figure dans dashboard.tsx, et elle passait,
  // pendant que la liste du parcours recopiait les quatre roles et les
  // quatre categories a la main. Elle avait meme deja diverge : « Stage Data
  // ESG & Solutions IA » sur la page contre « Data ESG et solutions IA,
  // direction RSE » dans la source. Une verification qu'une duplication
  // satisfait ne verifie rien. Ce qui est verrouille ici, c'est que les deux
  // endroits de la home projettent la source, et qu'aucun role ni aucune
  // categorie ne soit recopie ailleurs.
  it("projette les experiences depuis la source, sans recopier role ni categorie", () => {
    const experiences: readonly Experience[] = EXPERIENCES;
    expect(experiences).toHaveLength(6);
    const dashboard = fichiers.find(
      (f) => f.relatif === "components/dashboard.tsx",
    );
    expect(dashboard).toBeDefined();
    const code = dashboard?.code ?? "";
    expect(code.match(/EXPERIENCES\.map\(/g) ?? []).toHaveLength(2);
  });

  // Le 2 septembre 2026, la verification ci-dessus ne lisait QUE
  // dashboard.tsx. layer-d.tsx, rendu sur la MEME page d'accueil, portait
  // encore les quatre organisations en dur et quatre roles reformules, dont
  // « Stage Data ESG & Solutions IA » contre « Data ESG et solutions IA,
  // direction RSE » dans la source. Une verification limitee au fichier ou le
  // defaut avait ete trouve ne verifie pas la regle : elle verifie le
  // precedent. Les deux cas suivants portent sur TOUS les fichiers.
  it("aucun fichier ne recopie un role ni une categorie d'experience", () => {
    for (const f of fichiers) {
      if (f.relatif.endsWith("content/profil.ts")) continue;
      for (const exp of EXPERIENCES) {
        expect(
          f.code,
          `${f.relatif} recopie le role de ${exp.organisation}`,
        ).not.toContain(exp.role);
        expect(
          f.code,
          `${f.relatif} recopie la categorie de ${exp.organisation}`,
        ).not.toContain(exp.categorie);
      }
    }
  });

  it("aucun fichier ne nomme une organisation dans une valeur de propriete", () => {
    // Une reformulation echappe a la comparaison de chaines ci-dessus, mais
    // pas a celle-ci : on ne construit pas une liste a la main sans NOMMER
    // l'organisation quelque part, en attribut JSX ou en propriete d'objet.
    // Le nom cite dans une phrase reste permis, c'est de la prose, pas une
    // seconde liste.
    //
    // Les deux maisons en sont sorties le 23 octobre 2026. « STRATA ESG » et
    // « Pharivo » sont aussi des noms de marque, de division du registre et
    // de fiche projet : les ecrire en valeur ne recopie pas le parcours, cela
    // nomme un produit. La regle reste entiere pour les quatre experiences
    // passees, qui ne sont rien d'autre qu'une ligne de parcours.
    const valeurs = /(?:\b[a-zA-Z]+=\{?|\b[a-zA-Z]+:\s*)"([^"]{2,60})"/g;
    const maisons: readonly string[] = ACTIVITE.maisons;
    const parcours = EXPERIENCES.filter(
      (exp) => !maisons.includes(exp.organisation),
    );
    expect(parcours).toHaveLength(EXPERIENCES.length - maisons.length);
    for (const f of fichiers) {
      if (f.relatif.endsWith("content/profil.ts")) continue;
      for (const [, valeur] of f.code.matchAll(valeurs)) {
        for (const exp of parcours) {
          expect(
            valeur,
            `${f.relatif} pose « ${valeur} » en valeur : la liste des experiences se projette, elle ne se recopie pas`,
          ).not.toBe(exp.organisation);
        }
      }
    }
  });

  it("cite la formation sans lui inventer de diplome", () => {
    const formation: readonly Formation[] = FORMATION;
    expect(formation).toHaveLength(1);
    for (const etape of formation) {
      expect(etape.organisation.length).toBeGreaterThan(1);
      expect(etape.precision.length).toBeGreaterThan(8);
      // Aucun intitule de diplome tant qu'Adama ne l'a pas dicte.
      expect(etape.precision).not.toMatch(
        /master|licence|bachelor|dipl[oô]me|bac\s*\+/i,
      );
    }
    const code =
      fichiers.find((f) => f.relatif === "components/dashboard.tsx")?.code ??
      "";
    expect(code).toContain("FORMATION.map(");
  });

  it("nomme la personne d'une seule facon", () => {
    expect(IDENTITE.nom).toBe(`${IDENTITE.prenom} ${IDENTITE.patronyme}`);
  });

  it("n'emploie aucun tiret long dans les textes publies", () => {
    const textes = [
      IDENTITE.capacite,
      IDENTITE.situation,
      OUVERTURE,
      ...PORTES_ENTREE.flatMap((p) => [p.public, p.objet]),
      ...COMPETENCES.map((c) => c.fait),
      ...EXPERIENCES.map((e) => e.role),
    ];
    for (const texte of textes) {
      expect(texte, texte).not.toMatch(/[\u2013\u2014]/);
    }
  });
});

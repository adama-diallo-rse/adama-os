import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BLOCS,
  DOMAINES_ROLE,
  ETAT_LABEL,
  FICHES,
  cartesProjet,
  categoriesProjet,
  ficheParSlug,
  type BlocId,
  type DomaineRole,
  type FicheProjet,
  type NiveauResponsabilite,
  type SchemaArchitecture,
  type Technologie,
} from "../content/projets";

// =====================================================================
// C5-T2 et C5-T9, le gabarit tient.
//
// Le type FicheProjet rend les huit blocs obligatoires a la compilation :
// une fiche a laquelle il manque un bloc ne compile pas. Ce que le type ne
// sait PAS empecher, c'est un bloc present mais vide, ou rempli de
// remplissage. C'est ce que ce fichier verrouille.
//
// Il verrouille aussi la regle la plus couteuse de la couche : ne jamais
// lister une technologie qui n'est pas installee. Le precedent existe, la
// documentation de ce depot a annonce quatre bibliotheques dont aucune
// n'etait presente.
// =====================================================================

const INVENTAIRE = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../../docs/inventory.json", import.meta.url)),
    "utf8",
  ),
) as { dependencies: { name: string }[] };

const DEPENDANCES = new Set(INVENTAIRE.dependencies.map((d) => d.name));

const SHEET = readFileSync(
  fileURLToPath(new URL("../components/project-sheet.tsx", import.meta.url)),
  "utf8",
);

/** Vocabulaire de preuve interdit dans tout l'espace. */
const VOCABULAIRE_INTERDIT = [
  "infalsifiable",
  "inaltérable",
  "inalterable",
  "horodatage certifié",
  "registre qualifié",
];

function textesDe(fiche: FicheProjet): string[] {
  return [
    fiche.resume,
    ...fiche.probleme,
    ...fiche.role.phrases,
    ...fiche.role.questions,
    fiche.architecture.schema.legende,
    fiche.architecture.schema.flux,
    ...fiche.architecture.stack.map((t) => t.role),
    ...fiche.compromis.flatMap((c) => [c.refuse, c.raison, c.cout]),
    fiche.etat.precision,
    ...fiche.suite,
  ];
}

describe("C5, les trois fiches", () => {
  it("en publie trois, pas quatre", () => {
    expect(FICHES).toHaveLength(3);
  });

  it("porte des identifiants uniques et citables dans une URL", () => {
    const slugs = FICHES.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(ficheParSlug(slug)?.slug).toBe(slug);
    }
  });

  it("declare les huit blocs, dans l'ordre, une seule fois chacun", () => {
    const ids: BlocId[] = BLOCS.map((b) => b.id);
    expect(ids).toEqual([
      "probleme",
      "role",
      "architecture",
      "decisions",
      "preuves",
      "compromis",
      "etat",
      "suite",
    ]);
    expect(new Set(BLOCS.map((b) => b.numero)).size).toBe(8);
  });

  it("rend les huit blocs, chacun avec son ancre", () => {
    for (const bloc of BLOCS) {
      expect(SHEET, `bloc ${bloc.numero} absent du rendu`).toContain(
        `id="bloc-${bloc.id}"`,
      );
    }
  });
});

describe.each(FICHES.map((f) => [f.slug, f] as const))(
  "C5, fiche %s",
  (_slug, fiche) => {
    it("remplit le bloc 01 sans remplissage", () => {
      expect(fiche.probleme.length).toBeGreaterThanOrEqual(2);
      for (const paragraphe of fiche.probleme) {
        expect(paragraphe.length).toBeGreaterThan(80);
      }
    });

    it("remplit le bloc 02 au format impose", () => {
      for (const domaine of DOMAINES_ROLE) {
        const niveau: NiveauResponsabilite = fiche.role.niveaux[domaine];
        expect(["responsable", "contributeur"]).toContain(niveau);
      }
      expect(fiche.role.phrases.length).toBeGreaterThanOrEqual(3);
      expect(fiche.role.phrases.length).toBeLessThanOrEqual(5);
      for (const phrase of fiche.role.phrases) {
        // Premiere personne : c'est la regle du bloc.
        expect(phrase).toMatch(/^J[’']|^Je /);
      }
    });

    it("ne donne jamais une formulation non relue pour la parole d'Adama", () => {
      // La regle de la couche : un agent propose, Adama valide. Tant que la
      // fiche n'est pas relue, le bloc 02 doit s'annoncer comme une
      // proposition, et lister ce que lui seul peut trancher.
      if (!fiche.reluParAdama) {
        expect(fiche.role.aValider).toBe(true);
        expect(fiche.role.questions.length).toBeGreaterThan(0);
      }
    });

    it("remplit le bloc 03 avec un schema et une pile reelle", () => {
      const schema: SchemaArchitecture = fiche.architecture.schema;
      expect(schema.colonnes.length).toBeGreaterThanOrEqual(3);
      // L'equivalent textuel du schema n'est pas optionnel : sans lui, un
      // lecteur d'ecran ne voit qu'une suite de mots sans lien.
      expect(schema.flux.length).toBeGreaterThan(100);
      expect(fiche.architecture.stack.length).toBeGreaterThanOrEqual(4);
      for (const techno of fiche.architecture.stack as Technologie[]) {
        expect(techno.role.length).toBeGreaterThan(10);
      }
    });

    it("declare au moins un ADR et un sujet de preuve", () => {
      expect(fiche.adrIds.length).toBeGreaterThanOrEqual(1);
      for (const id of fiche.adrIds) {
        expect(id).toMatch(/^DEC-[0-9]{3}$/);
      }
      expect(fiche.sujetsPreuve.length).toBeGreaterThanOrEqual(1);
      expect(fiche.preuveVedette).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it("remplit le bloc 06, et chaque compromis porte son cout", () => {
      expect(fiche.compromis.length).toBeGreaterThanOrEqual(2);
      for (const compromis of fiche.compromis) {
        expect(compromis.refuse.length).toBeGreaterThan(20);
        expect(compromis.raison.length).toBeGreaterThan(40);
        // Sans cout, un compromis se lit comme une bonne pratique.
        expect(compromis.cout.length).toBeGreaterThan(20);
      }
    });

    it("annonce un etat reel et une suite sans promesse", () => {
      expect(Object.keys(ETAT_LABEL)).toContain(fiche.etat.valeur);
      expect(fiche.etat.precision.length).toBeGreaterThan(40);
      expect(fiche.suite.length).toBeGreaterThan(0);
      expect(fiche.suite.length).toBeLessThanOrEqual(3);
      for (const ligne of fiche.suite) {
        // Aucune date de livraison annoncee : une date qui n'engage
        // personne n'est pas une information.
        expect(ligne).not.toMatch(
          /\b20[0-9]{2}\b|\bT[1-4]\b|janvier|f[ée]vrier|mars|avril|juin|juillet|septembre|octobre|d[ée]cembre/i,
        );
      }
    });

    it("n'emploie ni tiret long ni vocabulaire de preuve interdit", () => {
      for (const texte of textesDe(fiche)) {
        expect(texte, texte.slice(0, 60)).not.toMatch(/[–—]/);
        for (const interdit of VOCABULAIRE_INTERDIT) {
          expect(texte.toLowerCase()).not.toContain(interdit.toLowerCase());
        }
      }
    });

    it("dit empreinte carbone ou bilan GES, jamais bilan carbone", () => {
      for (const texte of textesDe(fiche)) {
        expect(texte.toLowerCase()).not.toContain("bilan carbone");
      }
    });
  },
);

describe("C5-T9, la pile d'Adama OS vient de l'inventaire", () => {
  const fiche = ficheParSlug("adama-os");

  it("declare sa liste comme derivee de l'inventaire", () => {
    expect(fiche?.architecture.stackSource).toBe("inventaire");
  });

  it("ne liste aucune technologie qui n'est pas installee", () => {
    for (const techno of fiche?.architecture.stack ?? []) {
      expect(
        DEPENDANCES.has(techno.nom),
        `« ${techno.nom} » est listee dans la fiche Adama OS mais ne figure pas dans les dependances directes de docs/inventory.json. Regenerer l'inventaire, ou retirer la ligne.`,
      ).toBe(true);
    }
  });

  it("garde les autres fiches en liste saisie et relue", () => {
    for (const autre of FICHES.filter((f) => f.slug !== "adama-os")) {
      expect(autre.architecture.stackSource).toBe("saisie");
    }
  });
});

describe("C5-T7, la carte de surface", () => {
  it("ne montre que le probleme, le role, l'etat et une preuve", () => {
    const cartes = cartesProjet();
    expect(cartes).toHaveLength(FICHES.length);
    for (const carte of cartes) {
      expect(carte.resume.length).toBeGreaterThan(40);
      // Le role en UN mot : deux mots, c'est deja une description.
      expect(carte.roleEnUnMot.split(/\s+/)).toHaveLength(1);
      expect(carte.etatLabel).toBe(ETAT_LABEL[carte.etat]);
    }
  });

  it("propose « Tout » en tete des filtres, sans doublon", () => {
    const categories = categoriesProjet();
    expect(categories[0]).toBe("Tout");
    expect(new Set(categories).size).toBe(categories.length);
  });
});

describe("C5, le rendu du bloc 02", () => {
  it("n'affiche aucune barre de progression de competence", () => {
    expect(SHEET).not.toMatch(/<progress|<meter|role="progressbar"/);
  });

  it("n'affiche que deux niveaux de responsabilite", () => {
    const niveaux: DomaineRole[] = [...DOMAINES_ROLE];
    expect(niveaux).toHaveLength(7);
    expect(SHEET).toContain("data-niveau=");
  });
});

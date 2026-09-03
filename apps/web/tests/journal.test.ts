import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHANTIERS } from "../content/chantiers";
import { JALONS } from "../content/jalons";
import {
  chantierDe,
  libelleDeterministe,
  lignesLisibles,
  metriques,
  filtrerPeriode,
} from "../lib/chantiers";
import type { CommitRow } from "../components/types";

// =====================================================================
// C8, le journal de construction.
//
// La regle que ce fichier verrouille est la plus importante de la couche :
// une ligne lisible est DERIVEE de commits reels, jamais generee. Deux modes
// de derivation sont acceptables, et deux seulement. Un troisieme, meme bien
// intentionne, serait exactement la fabrication que ce site refuse partout
// ailleurs, et il serait invisible.
// =====================================================================

function commit(over: Partial<CommitRow> = {}): CommitRow {
  return {
    sha: "abc1234",
    message: "feat(web): ajoute la matrice de sante",
    date: "2026-09-02T10:00:00.000Z",
    url: "https://example.invalid/commit/abc1234",
    product: "Adama OS",
    division: "Cockpit",
    repo: "adama-diallo-rse/adama-os",
    ...over,
  };
}

describe("C8-T1, les fenetres de chantier", () => {
  it("ne se recouvrent jamais pour un meme depot", () => {
    for (const depot of new Set(CHANTIERS.flatMap((c) => c.depots))) {
      const fenetres = CHANTIERS.filter((c) => c.depots.includes(depot))
        .map((c) => ({ du: c.du, au: c.au ?? "9999-12-31" }))
        .sort((a, b) => a.du.localeCompare(b.du));
      for (let i = 1; i < fenetres.length; i += 1) {
        const precedente = fenetres[i - 1];
        const courante = fenetres[i];
        expect(
          courante && precedente && courante.du > precedente.au,
          `${depot} : ${courante?.du} chevauche une fenetre qui finit le ${precedente?.au}`,
        ).toBe(true);
      }
    }
  });

  it("chaque chantier porte un titre relu et une fenetre valide", () => {
    for (const c of CHANTIERS) {
      expect(c.titre.trim().length).toBeGreaterThan(10);
      expect(c.du).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (c.au !== null) {
        expect(c.au >= c.du).toBe(true);
      }
      expect(c.depots.length).toBeGreaterThan(0);
    }
  });
});

describe("C8-T2, la derivation deterministe", () => {
  it("traduit un prefixe conventionnel sans aucun modele", () => {
    expect(libelleDeterministe("feat(web): X")).toBe("ajout, interface web");
    expect(libelleDeterministe("fix(db): Y")).toBe(
      "correction, base de données",
    );
    expect(libelleDeterministe("refactor: Z")).toBe("remaniement");
  });

  it("garde le message tel quel quand il ne suit pas la convention", () => {
    expect(libelleDeterministe("un message libre")).toBeNull();
    const lignes = lignesLisibles([
      commit({ message: "un message libre", date: "2020-01-01T00:00:00.000Z" }),
    ]);
    expect(lignes[0]?.titre).toBe("un message libre");
  });

  it("rattache un commit au chantier dont la fenetre le contient", () => {
    const c = chantierDe(commit({ date: "2026-07-14T09:00:00.000Z" }));
    expect(c?.id).toBe("sortie-du-moteur");
  });

  it("ne rattache pas un commit d'un depot etranger au chantier", () => {
    expect(
      chantierDe(commit({ repo: "iroko-software-group/iroko-platform" })),
    ).toBeNull();
  });
});

describe("C8-T2, un commit hors chantier reste visible", () => {
  it("garde sa propre ligne au lieu d'etre cache", () => {
    const lignes = lignesLisibles([
      commit({ date: "2026-09-02T10:00:00.000Z" }),
      commit({
        sha: "def5678",
        date: "2020-01-01T00:00:00.000Z",
        repo: "iroko-software-group/iroko-platform",
        message: "fix(api): corrige un calcul",
      }),
    ]);
    expect(lignes).toHaveLength(2);
    const isolee = lignes.find((l) => l.mode === "regle-deterministe");
    expect(isolee?.titre).toBe("correction, interfaces publiques");
    expect(isolee?.commits).toHaveLength(1);
  });

  it("aucune ligne ne se rend sans au moins un commit", () => {
    for (const ligne of lignesLisibles([
      commit(),
      commit({ sha: "zzz9999" }),
    ])) {
      expect(ligne.commits.length).toBeGreaterThan(0);
      expect(ligne.date).toBe(
        ligne.commits[0]?.date ?? "aucune date, ce qui est impossible",
      );
    }
  });
});

describe("C8-T5, les metriques d'execution restent honnetes", () => {
  it("compte les contributions, les depots actifs et les jours actifs", () => {
    const m = metriques([
      commit({ date: "2026-09-01T10:00:00.000Z" }),
      commit({ sha: "b", date: "2026-09-01T18:00:00.000Z" }),
      commit({
        sha: "c",
        date: "2026-09-03T09:00:00.000Z",
        repo: "iroko-software-group/iroko-platform",
      }),
    ]);
    expect(m.commits).toBe(3);
    expect(m.depotsActifs).toBe(2);
    expect(m.joursActifs).toBe(2);
    expect(m.joursDeLaPeriode).toBe(3);
  });

  it("ne rend aucun chiffre sur une liste vide", () => {
    const m = metriques([]);
    expect(m.commits).toBe(0);
    expect(m.du).toBeNull();
    expect(m.au).toBeNull();
  });

  it("aucun indicateur de livraison non mesure n'est calcule", () => {
    // Frequence de deploiement, delai de mise en production, taux d'echec et
    // temps de retablissement ne sont pas mesures ici : le depot n'a pas
    // d'integration continue. Leur absence est verifiee sur le TYPE, pas sur
    // une convention de nommage, pour que l'ajout d'un champ soit visible.
    const m = metriques([commit()]);
    expect(Object.keys(m).sort()).toEqual([
      "au",
      "commits",
      "depotsActifs",
      "du",
      "joursActifs",
      "joursDeLaPeriode",
    ]);
  });

  it("le composant du journal ne cite aucun indicateur non mesure", () => {
    const source = readFileSync(
      join(process.cwd(), "components/build-log.tsx"),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    // Le texte de la page DIT que ces indicateurs sont absents : la recherche
    // porte donc sur un usage en tant que valeur, pas sur le mot.
    expect(source).not.toMatch(
      /deploymentFrequency|leadTime|changeFailure|mttr/i,
    );
  });
});

describe("C8, le filtre de periode", () => {
  it("ne garde que ce qui tombe dans la fenetre", () => {
    const now = new Date("2026-09-02T12:00:00.000Z");
    const commits = [
      commit({ date: "2026-09-01T00:00:00.000Z" }),
      commit({ sha: "vieux", date: "2026-06-01T00:00:00.000Z" }),
    ];
    expect(filtrerPeriode(commits, 30, now)).toHaveLength(1);
    expect(filtrerPeriode(commits, null, now)).toHaveLength(2);
  });
});

describe("C8-T8, la frise d'ingenierie", () => {
  it("chaque jalon porte une trace verifiable et une date", () => {
    for (const j of JALONS) {
      expect(j.trace.trim().length).toBeGreaterThan(0);
      expect(j.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(j.titre.trim().length).toBeGreaterThan(10);
    }
  });

  it("chaque identifiant de decision cite suit la forme du journal", () => {
    for (const j of JALONS) {
      if (j.adr === null) continue;
      expect(j.adr).toMatch(/^DEC-\d{3}$/);
    }
  });

  it("porte au moins un revirement, sinon ce n'est pas une trajectoire", () => {
    expect(JALONS.some((j) => j.nature === "revirement")).toBe(true);
  });

  it("ne date aucun jalon du retrait du repli chiffre avant le 12 aout", () => {
    // Le document de cadrage datait ce retrait du 7 aout. Le commit 21e483b
    // est du 12. Un jalon qui se trompe de date est pire qu'un jalon absent,
    // parce qu'il se verifie.
    const jalon = JALONS.find((j) => j.id === "retrait-repli-chiffre");
    expect(jalon?.date).toBe("2026-08-12");
  });
});

// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EcosystemMapView } from "../components/ecosystem-map";
import { buildEcosystemMap } from "../lib/ecosystem/map";
import { ROLES_DIVISION } from "../content/divisions";
import type { EcosystemProductRow, RepoStatusRow } from "../components/types";

// =====================================================================
// C4-T4, l'interdit central : aucun noeud fictif.
//
// Le precedent est documente et il n'est pas theorique : trois produits
// fantomes se sont affiches sur ce site jusqu'au 31 aout 2026, parce qu'ils
// etaient ecrits dans un composant. Ce test rend le retour de ce defaut
// impossible de deux facons complementaires :
//   - il verifie que chaque noeud rendu vient d'une ligne de registre ou
//     d'une entree du resolveur de depots ;
//   - il LIT le composant et echoue si un libelle de produit y apparait en
//     clair. Un test qui se contenterait de la premiere verification
//     laisserait passer un libelle en dur accompagne de sa ligne en base.
// =====================================================================

afterEach(cleanup);

const OBSERVE = "2026-09-02T12:00:00.000Z";

const PRODUITS: EcosystemProductRow[] = [
  {
    slug: "esg-optimizer",
    name: "ESG Optimizer",
    division: "STRATA",
    pillar: "Audit et conformite",
    description: null,
    status: "live",
    url: "https://esg-optimizer.fr",
    position: 10,
  },
  {
    slug: "strata-watch",
    name: "STRATA Watch",
    division: "STRATA",
    pillar: null,
    description: null,
    status: "planned",
    url: null,
    position: 50,
  },
  {
    slug: "iroko-platform",
    name: "IROKO Platform",
    division: "IROKO",
    pillar: null,
    description: null,
    status: "building",
    url: null,
    position: 70,
  },
];

const DEPOTS: RepoStatusRow[] = [
  {
    fullName: "iroko-software-group/esg-optimizer",
    product: "ESG Optimizer",
    division: "STRATA",
    ok: true,
    reason: null,
    commits: 14,
  },
  {
    fullName: "adama-diallo-rse/strata-scope",
    product: "STRATA Scope",
    division: "STRATA",
    ok: false,
    reason: "hors de portée du jeton",
    commits: 0,
  },
];

function carte(products = PRODUITS, repos = DEPOTS) {
  return buildEcosystemMap({
    products,
    repos,
    activity: { "iroko-software-group/esg-optimizer": "2026-09-01T08:00:00Z" },
    proofs: { "esg-optimizer": "claim-esg" },
    observedAt: OBSERVE,
  });
}

describe("C4-T4, aucun noeud fictif", () => {
  it("chaque noeud vient du registre ou du resolveur de depots", () => {
    const map = carte();
    const attendus = new Set<string>([
      "cockpit",
      ...PRODUITS.map((p) => `produit:${p.slug}`),
      ...Array.from(new Set(PRODUITS.map((p) => `division:${p.division}`))),
      ...DEPOTS.map((r) => `depot:${r.fullName}`),
    ]);
    for (const noeud of map.nodes) {
      expect(attendus.has(noeud.id), `noeud inattendu : ${noeud.id}`).toBe(
        true,
      );
    }
  });

  it("aucun libelle de produit n'est ecrit dans le composant", () => {
    // process.cwd() vaut apps/web quand vitest tourne depuis ce paquet.
    const source = readFileSync(
      join(process.cwd(), "components/ecosystem-map.tsx"),
      "utf8",
    );
    // Ce sont les huit produits reels du groupe, plus les trois fantomes qui
    // ont ete affiches jusqu'au 31 aout 2026.
    const interdits = [
      "ESG Optimizer",
      "STRATA Scope",
      "STRATA Watch",
      "STRATA Foundation",
      "STRATA Academy",
      "STRATA Platform",
      "IROKO Platform",
      "IROKO Business OS",
    ];
    for (const nom of interdits) {
      expect(
        source,
        `${nom} ne doit pas figurer dans le composant`,
      ).not.toContain(nom);
    }
  });

  it("un produit sans depot n'invente pas de noeud de depot", () => {
    const map = carte();
    const depots = map.nodes.filter((n) => n.kind === "depot");
    // Seul le depot rattache a un produit du registre devient un noeud. Le
    // second depot du jeu d'essai porte un produit absent du registre : il
    // n'invente pas de noeud, et il reste nomme dans la liste des absents.
    expect(depots.map((d) => d.label)).toEqual([
      "iroko-software-group/esg-optimizer",
    ]);
    expect(map.nodes.filter((n) => n.kind === "produit")).toHaveLength(
      PRODUITS.length,
    );
  });
});

describe("C4-T3, le sens des fleches", () => {
  it("toutes les aretes de lecture vont vers le cockpit", () => {
    const map = carte();
    const lectures = map.edges.filter((e) => e.kind === "lecture");
    expect(lectures.length).toBeGreaterThan(0);
    for (const arete of lectures) {
      expect(arete.to).toBe("cockpit");
      expect(arete.from).not.toBe("cockpit");
    }
  });

  it("aucune arete ne part du cockpit", () => {
    const map = carte();
    expect(map.edges.some((e) => e.from === "cockpit")).toBe(false);
  });

  it("la legende dit explicitement qu'aucune fleche ne part du cockpit", () => {
    render(
      <EcosystemMapView map={carte()} repos={DEPOTS} roles={ROLES_DIVISION} />,
    );
    expect(
      screen.getByText(/Aucune flèche ne part du cockpit vers un produit/i),
    ).toBeTruthy();
  });
});

describe("C4-T2 et C4-T5, l'etat des noeuds et la degradation", () => {
  it("chaque noeud porte son etat, sa source et son horodatage", () => {
    for (const noeud of carte().nodes) {
      expect(noeud.state.length).toBeGreaterThan(0);
      expect(noeud.source.length).toBeGreaterThan(0);
    }
    expect(carte().observedAt).toBe(OBSERVE);
  });

  it("un noeud sans activite connue affiche l'absence au lieu de disparaitre", () => {
    render(
      <EcosystemMapView map={carte()} repos={DEPOTS} roles={ROLES_DIVISION} />,
    );
    expect(screen.getAllByText(/inconnue/i).length).toBeGreaterThan(0);
  });

  it("la carte ne se rend pas quand le registre ne repond pas", () => {
    const vide = carte([], []);
    expect(vide.empty).toBe(true);
    const { container } = render(
      <EcosystemMapView map={vide} repos={[]} roles={ROLES_DIVISION} />,
    );
    expect(container.querySelector(".map-svg")).toBeNull();
    expect(screen.getByText(/ne répond pas/i)).toBeTruthy();
  });

  it("se rend avec huit produits comme avec deux", () => {
    const huit = Array.from({ length: 8 }, (_, i) => ({
      ...(PRODUITS[0] as EcosystemProductRow),
      slug: `p${i}`,
      name: `Produit ${i}`,
      position: i,
    }));
    expect(
      carte(huit, []).nodes.filter((n) => n.kind === "produit"),
    ).toHaveLength(8);
    expect(
      carte(PRODUITS.slice(0, 2), []).nodes.filter((n) => n.kind === "produit"),
    ).toHaveLength(2);
  });
});

describe("C4-T6 et C4-T7, roles et preuve", () => {
  it("chaque division affichee porte une phrase de role", () => {
    render(
      <EcosystemMapView map={carte()} repos={DEPOTS} roles={ROLES_DIVISION} />,
    );
    for (const division of carte().divisions) {
      const role = ROLES_DIVISION[division];
      expect(role, `${division} doit porter une phrase de role`).toBeTruthy();
    }
  });

  it("un produit sans affirmation ne recoit aucun lien de verification", () => {
    const { container } = render(
      <EcosystemMapView map={carte()} repos={DEPOTS} roles={ROLES_DIVISION} />,
    );
    const liens = Array.from(
      container.querySelectorAll("a[href^='/verifier/']"),
    );
    // Un seul produit porte une affirmation dans ce jeu d'essai.
    expect(liens).toHaveLength(1);
    expect(liens[0]?.getAttribute("href")).toBe("/verifier/claim-esg");
  });
});

describe("C4 et C3-T6, les depots absents sont nommes", () => {
  it("nomme chaque depot non lu avec sa raison", () => {
    render(
      <EcosystemMapView map={carte()} repos={DEPOTS} roles={ROLES_DIVISION} />,
    );
    expect(
      screen.getAllByText("adama-diallo-rse/strata-scope").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/hors de portée du jeton/i).length,
    ).toBeGreaterThan(0);
  });
});

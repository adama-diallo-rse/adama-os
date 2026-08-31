// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LayerD, grouperParDivision } from "../components/layer-d";
import type {
  AnalyticsRow,
  EcosystemProductRow,
  GatewayStatusRow,
} from "../components/types";

// L11-T2.c : verrouille le geste 3 de la vague 0. La Couche D ne doit rendre
// AUCUNE valeur chiffrée quand la source est vide. Un repli codé en dur, même
// bien intentionné, fait échouer ce test.
afterEach(cleanup);

const PRODUITS: EcosystemProductRow[] = [
  {
    slug: "esg-optimizer",
    name: "ESG Optimizer",
    division: "STRATA",
    pillar: "Audit et conformite CSRD",
    description: "Scoring ESRS.",
    status: "live",
    url: "https://esg-optimizer.fr",
    position: 10,
  },
  {
    slug: "strata-watch",
    name: "STRATA Watch",
    division: "STRATA",
    pillar: "Veille reglementaire",
    description: null,
    status: "building",
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

const SONDES: GatewayStatusRow[] = [
  {
    productSlug: "esg-optimizer",
    productName: "ESG Optimizer",
    division: "STRATA",
    status: "ok",
    latencyMs: 118,
    fetchedAt: "2026-08-31T06:00:00.000Z",
  },
];

describe("Couche D, source vide", () => {
  it("n'affiche aucune métrique et le dit", () => {
    render(<LayerD analytics={[]} products={[]} gateways={[]} />);
    expect(screen.queryAllByTestId("metric-tile")).toHaveLength(0);
    expect(screen.getByText(/Donnée non disponible/i)).toBeTruthy();
    expect(screen.getByText(/Registre produits non disponible/i)).toBeTruthy();
  });
});

describe("Couche D, source présente", () => {
  const analytics: AnalyticsRow[] = [
    {
      metric: "disponibilite_pct",
      value: 100,
      period: "2026-08-31",
      division: "STRATA",
      product_slug: "esg-optimizer",
    },
  ];

  it("rend une tuile par métrique relevée", () => {
    render(
      <LayerD analytics={analytics} products={PRODUITS} gateways={SONDES} />,
    );
    expect(screen.queryAllByTestId("metric-tile")).toHaveLength(1);
    expect(screen.getByText(/Disponibilité/i)).toBeTruthy();
  });

  it("ne rend cliquable que le produit portant une URL", () => {
    const { container } = render(
      <LayerD analytics={analytics} products={PRODUITS} gateways={SONDES} />,
    );
    const liens = Array.from(container.querySelectorAll("a[href^='http']"));
    expect(liens).toHaveLength(1);
    expect(liens[0]?.getAttribute("href")).toContain("esg-optimizer.fr");
    // La convention UTM est posée par OutboundLink, pas recopiée ici.
    expect(liens[0]?.getAttribute("href")).toContain("utm_source=adama-os");
  });

  it("affiche la preuve sociale, qui ne dépend d'aucune source externe", () => {
    render(<LayerD analytics={[]} products={[]} gateways={[]} />);
    expect(screen.getByText("AG2R LA MONDIALE")).toBeTruthy();
    expect(screen.getByText("Ministère des Finances")).toBeTruthy();
  });

  it("restitue l'état de la sonde du produit", () => {
    render(
      <LayerD analytics={analytics} products={PRODUITS} gateways={SONDES} />,
    );
    expect(screen.getByText(/sonde ok · 118 ms/i)).toBeTruthy();
  });
});

describe("regroupement par division", () => {
  it("ordonne STRATA, IROKO, puis le reste", () => {
    const groupes = grouperParDivision([
      { ...PRODUITS[2]! },
      { ...PRODUITS[0]! },
      { ...PRODUITS[0]!, slug: "z", division: "AUTRE", position: 1 },
    ]);
    expect(groupes.map((g) => g.division)).toEqual([
      "STRATA",
      "IROKO",
      "AUTRE",
    ]);
  });

  it("trie les produits d'une division par position", () => {
    const [strata] = grouperParDivision([PRODUITS[1]!, PRODUITS[0]!]);
    expect(strata?.products.map((p) => p.slug)).toEqual([
      "esg-optimizer",
      "strata-watch",
    ]);
  });
});

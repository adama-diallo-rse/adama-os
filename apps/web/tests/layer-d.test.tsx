// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// C1 puis C3. Ce fichier verifie qu'une metrique RELEVEE se rend avec l'etat
// « source », et cet etat depend de la fraicheur : la ligne d'essai est datee
// du 31 aout 2026 et sa duree de validite est de deux jours. Sans horloge
// figee, le test passait le 1er septembre et echouait le 3, c'est a dire
// qu'il devenait rouge sans qu'une seule ligne de code ait bouge.
//
// Un test qui depend de l'heure finit desactive, et c'est le pire des trois
// etats possibles : on croit couvrir un comportement qui ne l'est plus.
const MAINTENANT = new Date("2026-08-31T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(MAINTENANT);
});

afterEach(() => {
  vi.useRealTimers();
});

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
    failureKind: null,
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
      source: "GET /health",
      division: "STRATA",
      product_slug: "esg-optimizer",
      created_at: "2026-08-31T06:00:00.000Z",
      fetched_at: "2026-08-31T06:00:00.000Z",
      data_class: "real",
      method: "Sonde de disponibilité, appelée par le cron quotidien.",
      max_age_seconds: null,
      published_at: null,
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

  // C1 : la classe accompagne la valeur, partout, y compris dans le cockpit.
  it("rend le marqueur de classe avec la valeur", () => {
    const { container } = render(
      <LayerD analytics={analytics} products={PRODUITS} gateways={SONDES} />,
    );
    expect(
      container.querySelector(
        "[data-testid='metric-tile'][data-proof-state='real']",
      ),
    ).toBeTruthy();
    expect(container.querySelector(".proof-mark")).toBeTruthy();
  });

  // C1-T7 : « source indisponible » disait au lecteur que le produit était en
  // panne, alors que la moitié des cas décrivent une panne du cockpit.
  it("nomme la cause quand la sonde a échoué", () => {
    render(
      <LayerD
        analytics={[]}
        products={PRODUITS}
        gateways={[
          {
            ...SONDES[0]!,
            status: "unavailable",
            latencyMs: null,
            failureKind: "erreur_reseau",
          },
        ]}
      />,
    );
    expect(screen.getByText(/sortie réseau du cockpit/i)).toBeTruthy();
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

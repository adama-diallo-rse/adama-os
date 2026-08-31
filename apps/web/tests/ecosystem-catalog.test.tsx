// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EcosystemCatalog } from "../components/ecosystem-catalog";
import type { EcosystemProductRow } from "../components/types";

afterEach(cleanup);
const products: EcosystemProductRow[] = [
  {
    slug: "test-open",
    name: "Produit accessible",
    division: "STRATA",
    pillar: null,
    description: "Fiche de test.",
    status: "live",
    url: "https://example.com/product",
    position: 1,
  },
  {
    slug: "test-building",
    name: "Produit en développement",
    division: "STRATA ESG",
    pillar: null,
    description: null,
    status: "building",
    url: null,
    position: 2,
  },
  {
    slug: "test-no-link",
    name: "Produit sans URL",
    division: "IROKO",
    pillar: null,
    description: null,
    status: "live",
    url: null,
    position: 3,
  },
];

describe("catalogue public", () => {
  it("conserve les identités et les ancres sans inventer de liens produit quand le registre est vide", () => {
    render(<EcosystemCatalog products={[]} />);
    expect(screen.getByRole("status").textContent).toContain(
      "n’a pas pu être chargé",
    );
    expect(
      screen.getByRole("link", { name: "STRATA ESG" }).getAttribute("href"),
    ).toBe("#strata");
    expect(
      screen
        .queryAllByRole("link")
        .filter((a) => a.getAttribute("href")?.startsWith("http")),
    ).toHaveLength(0);
  });
  it("regroupe le nom historique et le nom complet sans changer les données", () => {
    render(<EcosystemCatalog products={products} />);
    const strata = screen.getByRole("region", {
      name: "Le reporting de durabilité.",
    });
    expect(
      within(strata).getByRole("heading", { name: "Produit accessible" }),
    ).toBeTruthy();
    expect(
      within(strata).getByRole("heading", { name: "Produit en développement" }),
    ).toBeTruthy();
    expect(products[0]?.division).toBe("STRATA");
  });
  it("ne propose en ligne que les produits accessibles et permet de revenir à la liste complète", () => {
    render(<EcosystemCatalog products={products} />);
    fireEvent.click(screen.getByRole("button", { name: "En ligne" }));
    expect(screen.getByRole("status").textContent).toBe("1 produit");
    expect(
      screen.queryByRole("heading", { name: "Produit sans URL" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "En développement" }));
    expect(
      screen.queryByRole("heading", { name: "Produit accessible" }),
    ).toBeNull();
    expect(
      screen.queryByRole("link", { name: /Produit en développement/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Tous les produits" }));
    expect(screen.getByRole("status").textContent).toBe("3 produits");
  });
});

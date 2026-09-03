// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DataClassMark } from "../components/proof/data-class";
import { ClaimNumber } from "../components/proof/claim-value";
import { Proof } from "../components/proof/proof";
import { ProofLineage, buildNodes } from "../components/proof/lineage";
import {
  assemblerClaims,
  type ClaimRow,
  type EvidenceRow,
} from "../lib/proof/claims";
import { resolveClaimState, type Claim } from "../lib/proof/types";

// =====================================================================
// C1-T4 et C2-T2 / C2-T4, le rendu.
//
// Ce que ces tests verrouillent : le marqueur de classe est toujours rendu,
// une valeur absente n'affiche jamais de chiffre, une affirmation porte
// toujours son chemin de vérification, et le lignage ne dessine aucun nœud
// qui n'existe pas.
// =====================================================================

afterEach(cleanup);

const MAINTENANT = new Date("2026-09-01T12:00:00.000Z");

function chiffre(partiel: Partial<Claim<number>>): Claim<number> {
  return {
    value: 100,
    dataClass: "real",
    source: "GET /health",
    method: "Sonde de disponibilité appelée par le cron quotidien.",
    fetchedAt: "2026-09-01T06:00:00.000Z",
    maxAgeSeconds: 172800,
    suffix: "%",
    ...partiel,
  };
}

describe("marqueur de classe", () => {
  it("écrit le libellé de chaque état en toutes lettres", () => {
    const cas = [
      { claim: chiffre({}), attendu: "SOURCE" },
      {
        claim: chiffre({ dataClass: "demo" }),
        attendu: "DÉMONSTRATION",
      },
      {
        claim: chiffre({
          dataClass: "historical",
          publishedAt: "2024-05-01T00:00:00.000Z",
        }),
        attendu: "VALEUR AU",
      },
      { claim: chiffre({ value: null }), attendu: "SOURCE INDISPONIBLE" },
      {
        claim: chiffre({ fetchedAt: "2026-01-01T00:00:00.000Z" }),
        attendu: "PÉRIMÉE",
      },
    ];

    for (const { claim, attendu } of cas) {
      cleanup();
      const state = resolveClaimState(claim, MAINTENANT);
      render(<DataClassMark claim={claim} state={state} />);
      expect(screen.getByText(attendu)).toBeTruthy();
    }
  });

  it("ne distingue pas les états par la seule couleur", () => {
    // Chaque état porte une forme dédiée en SVG et un attribut de données.
    // Retirer le glyphe casserait la lisibilité en niveaux de gris et à
    // l'impression : ce test le rend impossible sans s'en apercevoir.
    const claim = chiffre({ dataClass: "demo" });
    const { container } = render(<DataClassMark claim={claim} state="demo" />);
    expect(container.querySelector("[data-proof-state='demo']")).toBeTruthy();
    expect(container.querySelector("svg.proof-glyph")).toBeTruthy();
  });

  it("annonce l'état aux lecteurs d'écran, pas seulement à l'œil", () => {
    render(<DataClassMark claim={chiffre({ value: null })} state="absent" />);
    expect(screen.getByText(/n’a pas répondu/i)).toBeTruthy();
  });
});

describe("valeur chiffrée", () => {
  it("n'affiche aucun chiffre quand la valeur est absente", () => {
    const { container } = render(
      <ClaimNumber claim={chiffre({ value: null })} animate={false} />,
    );
    expect(container.textContent).not.toMatch(/\d/);
    expect(container.querySelector(".proof-value-absent")).toBeTruthy();
  });

  it("affiche la valeur et son suffixe quand elle existe", () => {
    const { container } = render(
      <ClaimNumber claim={chiffre({ value: 42 })} animate={false} />,
    );
    expect(container.textContent).toContain("42%");
  });
});

// --- C2 ---------------------------------------------------------------
const ROW: ClaimRow = {
  id: "strata-scope-en-ligne",
  statement: "STRATA Scope répond en production sur son adresse publique.",
  subject_type: "produit",
  subject_ref: "strata-scope",
  data_class: "real",
  max_age_seconds: 172800,
  visibility: "public",
  position: 10,
  updated_at: "2026-09-01T00:00:00.000Z",
};

const PREUVE: EvidenceRow = {
  id: "e1",
  claim_id: ROW.id,
  kind: "api",
  source: "Adresse publique de STRATA Scope",
  locator: "https://scope.esg-optimizer.fr",
  method: "Appel GET sur l'adresse publique du produit.",
  observed_at: "2026-09-01T06:00:00.000Z",
  observed_result: "HTTP 200 OK en 214 ms",
  verifiable_by: "visiteur",
  refresh_kind: "http_status",
  position: 10,
};

describe("affirmation", () => {
  const [proof] = assemblerClaims([ROW], [PREUVE], MAINTENANT);

  it("porte toujours un chemin vers sa vérification", () => {
    render(<Proof claim={proof!} />);
    const lien = screen.getByRole("link", { name: /vérifier/i });
    expect(lien.getAttribute("href")).toBe(`/verifier/${ROW.id}`);
  });

  it("rend l'affirmation avec son marqueur de classe", () => {
    const { container } = render(<Proof claim={proof!} />);
    expect(screen.getByText(ROW.statement)).toBeTruthy();
    expect(
      container.querySelector("article[data-proof-state='real']"),
    ).toBeTruthy();
  });
});

describe("lignage", () => {
  const [proof] = assemblerClaims([ROW], [PREUVE], MAINTENANT);

  it("dessine un nœud par preuve, plus l'affirmation, et rien d'autre", () => {
    const nodes = buildNodes(proof!, MAINTENANT);
    expect(nodes).toHaveLength(2);
    expect(nodes.at(-1)?.label).toBe(ROW.statement);
  });

  it("marque en échec un maillon jamais observé", () => {
    const [jamais] = assemblerClaims(
      [ROW],
      [{ ...PREUVE, observed_at: null, observed_result: null }],
      MAINTENANT,
    );
    const nodes = buildNodes(jamais!, MAINTENANT);
    expect(nodes[0]?.etat).toBe("failed");
    expect(nodes.at(-1)?.etat).toBe("failed");
  });

  it("marque périmé un maillon trop ancien", () => {
    const [vieille] = assemblerClaims(
      [ROW],
      [{ ...PREUVE, observed_at: "2026-01-01T00:00:00.000Z" }],
      MAINTENANT,
    );
    const nodes = buildNodes(vieille!, MAINTENANT);
    expect(nodes[0]?.etat).toBe("stale");
  });

  it("fournit un équivalent textuel, pas seulement un dessin", () => {
    render(<ProofLineage proof={proof!} now={MAINTENANT} />);
    expect(screen.getByText(/CHAÎNE DE VÉRIFICATION/i)).toBeTruthy();
    // L'affirmation apparait dans les deux traces et dans l'equivalent
    // textuel : c'est le meme contenu, rendu trois fois pour trois usages.
    const occurrences = screen.getAllByText(
      new RegExp(ROW.statement.slice(0, 20)),
    );
    expect(occurrences.length).toBeGreaterThan(0);
    const liste = screen.getByRole("list");
    expect(liste.textContent).toContain(ROW.statement);
  });

  it("masque les deux tracés aux lecteurs d'écran", () => {
    const { container } = render(
      <ProofLineage proof={proof!} now={MAINTENANT} />,
    );
    const svgs = Array.from(container.querySelectorAll("svg"));
    expect(svgs).toHaveLength(2);
    expect(svgs.every((s) => s.getAttribute("aria-hidden") === "true")).toBe(
      true,
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  aggregable,
  claimAgeSeconds,
  formatDuration,
  resolveClaimState,
  timeToStale,
  type Claim,
} from "../lib/proof/types";
import {
  assemblerClaims,
  claimOf,
  type ClaimRow,
  type EvidenceRow,
} from "../lib/proof/claims";

// =====================================================================
// C1-T3 et C2. Le contrat de la classe de donnée, verrouillé.
//
// Ce que ces tests empêchent, concrètement : qu'un jour une absence se mette
// à ressembler à un zéro, qu'une valeur de démonstration entre dans un total,
// qu'une valeur périmée soit présentée au présent, ou qu'une affirmation sans
// preuve arrive jusqu'à une page.
// =====================================================================

const MAINTENANT = new Date("2026-09-01T12:00:00.000Z");

function claim(partiel: Partial<Claim<number>>): Claim<number> {
  return {
    value: 100,
    dataClass: "real",
    source: "GET /health",
    method: "Sonde de disponibilité, appelée par le cron quotidien.",
    fetchedAt: "2026-09-01T06:00:00.000Z",
    maxAgeSeconds: 172800,
    ...partiel,
  };
}

describe("état d'une affirmation chiffrée", () => {
  it("rend une valeur réelle et fraîche comme réelle", () => {
    expect(resolveClaimState(claim({}), MAINTENANT)).toBe("real");
  });

  it("rend absente une valeur nulle, quelle que soit sa classe", () => {
    expect(resolveClaimState(claim({ value: null }), MAINTENANT)).toBe(
      "absent",
    );
    expect(
      resolveClaimState(claim({ value: null, dataClass: "demo" }), MAINTENANT),
    ).toBe("absent");
  });

  it("ne remplace jamais une absence par un zéro", () => {
    // Un zéro est une mesure. L'absence n'en est pas une. Si ce test tombe,
    // c'est que quelqu'un a rendu les deux indistinguables.
    const absente = claim({ value: null });
    const zero = claim({ value: 0 });
    expect(resolveClaimState(absente, MAINTENANT)).toBe("absent");
    expect(resolveClaimState(zero, MAINTENANT)).toBe("real");
  });

  it("rend périmée une valeur réelle plus vieille que sa validité", () => {
    const vieille = claim({
      fetchedAt: "2026-08-20T06:00:00.000Z",
      maxAgeSeconds: 172800,
    });
    expect(resolveClaimState(vieille, MAINTENANT)).toBe("stale");
  });

  it("ne périme pas une valeur sans durée de validité déclarée", () => {
    const sansEcheance = claim({
      fetchedAt: "2020-01-01T00:00:00.000Z",
      maxAgeSeconds: null,
    });
    expect(resolveClaimState(sansEcheance, MAINTENANT)).toBe("real");
  });

  it("garde une valeur de démonstration démonstrative, même toute fraîche", () => {
    const demo = claim({
      dataClass: "demo",
      fetchedAt: MAINTENANT.toISOString(),
    });
    expect(resolveClaimState(demo, MAINTENANT)).toBe("demo");
  });

  it("ne périme pas une valeur historique, elle est déjà datée au passé", () => {
    const histo = claim({
      dataClass: "historical",
      fetchedAt: "2024-01-01T00:00:00.000Z",
      publishedAt: "2024-01-01T00:00:00.000Z",
      maxAgeSeconds: 3600,
    });
    expect(resolveClaimState(histo, MAINTENANT)).toBe("historical");
  });

  it("exclut la démonstration de toute agrégation", () => {
    expect(aggregable(claim({}))).toBe(true);
    expect(aggregable(claim({ dataClass: "demo" }))).toBe(false);
    expect(aggregable(claim({ value: null }))).toBe(false);
  });

  it("calcule l'âge et le temps restant", () => {
    expect(claimAgeSeconds(claim({}), MAINTENANT)).toBe(21600);
    expect(timeToStale(claim({}), MAINTENANT)).toBe(151200);
    expect(claimAgeSeconds(claim({ fetchedAt: null }), MAINTENANT)).toBeNull();
  });

  it("formate une durée en français, sans unité anglaise", () => {
    expect(formatDuration(30)).toBe("30 s");
    expect(formatDuration(3000)).toBe("50 min");
    expect(formatDuration(3600)).toBe("1 h");
    expect(formatDuration(172800)).toBe("2 j");
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

function preuve(partiel: Partial<EvidenceRow>): EvidenceRow {
  return {
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
    ...partiel,
  };
}

describe("assemblage des affirmations", () => {
  it("écarte une affirmation sans aucune preuve", () => {
    // La règle dure de la couche C2. Pas de version grisée, pas de
    // dégradation : elle n'existe pas dans la liste rendue.
    expect(assemblerClaims([ROW], [], MAINTENANT)).toHaveLength(0);
  });

  it("garde une affirmation dès qu'elle porte une preuve", () => {
    const [assemblee] = assemblerClaims([ROW], [preuve({})], MAINTENANT);
    expect(assemblee?.state).toBe("real");
    expect(assemblee?.evidence).toHaveLength(1);
  });

  it("rend absente une affirmation dont aucune preuve n'a été observée", () => {
    const jamais = preuve({ observed_at: null, observed_result: null });
    const [assemblee] = assemblerClaims([ROW], [jamais], MAINTENANT);
    expect(assemblee?.state).toBe("absent");
    expect(assemblee?.claim.value).toBeNull();
  });

  it("rend périmée une affirmation dont la dernière observation a vieilli", () => {
    const vieille = preuve({ observed_at: "2026-08-01T06:00:00.000Z" });
    const [assemblee] = assemblerClaims([ROW], [vieille], MAINTENANT);
    expect(assemblee?.state).toBe("stale");
  });

  it("prend la plus récente des observations pour dater l'affirmation", () => {
    const claim = claimOf(ROW, [
      preuve({ id: "a", observed_at: "2026-08-01T06:00:00.000Z" }),
      preuve({ id: "b", observed_at: "2026-09-01T06:00:00.000Z" }),
    ]);
    expect(claim.fetchedAt).toBe("2026-09-01T06:00:00.000Z");
  });

  it("trie les preuves par position, pas par ordre d'arrivée", () => {
    const [assemblee] = assemblerClaims(
      [ROW],
      [preuve({ id: "b", position: 20 }), preuve({ id: "a", position: 10 })],
      MAINTENANT,
    );
    expect(assemblee?.evidence.map((e) => e.id)).toEqual(["a", "b"]);
  });
});

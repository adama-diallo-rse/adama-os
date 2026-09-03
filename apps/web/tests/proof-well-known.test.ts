import { describe, expect, it } from "vitest";
import {
  WELL_KNOWN_SCHEMA_VERSION,
  buildWellKnown,
  validateWellKnown,
} from "../lib/proof/well-known";
import {
  assemblerClaims,
  type ClaimRow,
  type EvidenceRow,
} from "../lib/proof/claims";

// =====================================================================
// C2-T5. Le document machine valide contre son propre schéma.
//
// Un document que personne ne peut valider n'est pas un contrat, c'est une
// promesse. Le validateur vit dans le même module que le constructeur : un
// tiers qui consomme le document peut l'importer et vérifier avant de lire.
// =====================================================================

const MAINTENANT = new Date("2026-09-01T12:00:00.000Z");

const ROW: ClaimRow = {
  id: "cockpit-code-public",
  statement: "Le code de ce site est public et versionné sur GitHub.",
  subject_type: "systeme",
  subject_ref: "adama-os",
  data_class: "real",
  max_age_seconds: 2592000,
  visibility: "public",
  position: 30,
  updated_at: "2026-09-01T00:00:00.000Z",
};

const PREUVE: EvidenceRow = {
  id: "e1",
  claim_id: ROW.id,
  kind: "depot",
  source: "Dépôt adama-diallo-rse/adama-os",
  locator: "adama-diallo-rse/adama-os",
  method: "Lecture du dernier commit via l'API publique de GitHub.",
  observed_at: "2026-09-01T06:00:00.000Z",
  observed_result: "dernier commit 1a2b3c4 du 2026-09-01",
  verifiable_by: "visiteur",
  refresh_kind: "github_commit",
  position: 10,
};

const PRODUITS = [
  {
    slug: "esg-optimizer",
    name: "ESG Optimizer",
    division: "STRATA",
    status: "live",
    url: "https://esg-optimizer.fr",
  },
];

describe("document machine", () => {
  const claims = assemblerClaims([ROW], [PREUVE], MAINTENANT);
  const doc = buildWellKnown(claims, PRODUITS, MAINTENANT);

  it("valide contre son propre schéma", () => {
    expect(validateWellKnown(doc)).toEqual([]);
  });

  it("annonce sa version de schéma", () => {
    expect(doc.schema_version).toBe(WELL_KNOWN_SCHEMA_VERSION);
  });

  it("donne une adresse de vérification cohérente avec l'identifiant", () => {
    expect(doc.claims[0]?.verify_url).toContain(`/verifier/${ROW.id}`);
  });

  it("reporte l'état dérivé, pas seulement la classe stockée", () => {
    expect(doc.claims[0]?.data_class).toBe("real");
    expect(doc.claims[0]?.state).toBe("real");

    const perimee = buildWellKnown(
      assemblerClaims(
        [ROW],
        [{ ...PREUVE, observed_at: "2026-01-01T00:00:00.000Z" }],
        MAINTENANT,
      ),
      PRODUITS,
      MAINTENANT,
    );
    expect(perimee.claims[0]?.state).toBe("stale");
  });

  it("date sa dernière observation à partir des preuves, pas de l'horloge", () => {
    expect(doc.last_verification).toBe(PREUVE.observed_at);
  });
});

describe("validateur", () => {
  const claims = assemblerClaims([ROW], [PREUVE], MAINTENANT);
  const doc = buildWellKnown(claims, PRODUITS, MAINTENANT);

  it("refuse une affirmation sans preuve", () => {
    const casse = { ...doc, claims: [{ ...doc.claims[0]!, evidence: [] }] };
    expect(validateWellKnown(casse)).toContain(
      `affirmation sans preuve : ${ROW.id}`,
    );
  });

  it("refuse une observation à moitié renseignée", () => {
    const casse = {
      ...doc,
      claims: [
        {
          ...doc.claims[0]!,
          evidence: [{ ...doc.claims[0]!.evidence[0]!, observed_result: null }],
        },
      ],
    };
    expect(validateWellKnown(casse)).toContain(
      `observation incomplète sur ${ROW.id}`,
    );
  });

  it("refuse un identifiant qui ne tiendrait pas dans une URL", () => {
    const casse = {
      ...doc,
      claims: [{ ...doc.claims[0]!, id: "Pas Un Identifiant" }],
    };
    expect(validateWellKnown(casse).join(" ")).toContain(
      "identifiant invalide",
    );
  });

  it("refuse un identifiant en double, qui casserait une URL citée", () => {
    const casse = { ...doc, claims: [doc.claims[0]!, doc.claims[0]!] };
    expect(validateWellKnown(casse)).toContain(
      `identifiant en double : ${ROW.id}`,
    );
  });

  it("refuse une version de schéma inattendue", () => {
    expect(
      validateWellKnown({ ...doc, schema_version: "0.9" }).length,
    ).toBeGreaterThan(0);
  });
});

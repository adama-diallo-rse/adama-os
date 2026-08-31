import { describe, expect, it } from "vitest";
import {
  LEGACY_OUTBOUND_EVENT,
  LEGACY_OUTBOUND_REMOVAL_DATE,
  OUTBOUND_EVENT,
  legacyOutboundProperties,
  outboundProperties,
  withUtm,
} from "../lib/outbound";

// L6-T14 et L7-T2 : la convention de sortie tracée est écrite une fois et
// vérifiée ici. Un changement de nom d'événement casse ce test avant de
// trouer l'historique PostHog.
describe("convention des sorties tracées", () => {
  it("émet le nom d'événement du périmètre groupe", () => {
    expect(OUTBOUND_EVENT).toBe("ecosystem_outbound");
    expect(LEGACY_OUTBOUND_EVENT).toBe("strata_outbound");
    expect(LEGACY_OUTBOUND_REMOVAL_DATE).toBe("2026-09-30");
  });

  it("porte division et product sur l'événement courant", () => {
    expect(
      outboundProperties({
        product: "esg-optimizer",
        division: "STRATA",
        source: "nav",
      }),
    ).toEqual({ product: "esg-optimizer", division: "STRATA", source: "nav" });
  });

  it("conserve le format historique pour la double émission", () => {
    expect(
      legacyOutboundProperties({
        product: "esg-optimizer",
        division: "STRATA",
        source: "nav",
      }),
    ).toEqual({ produit: "esg-optimizer", source: "nav" });
  });
});

describe("paramètres UTM", () => {
  it("pose source, medium et campagne sur un lien externe", () => {
    const url = new URL(withUtm("https://exemple.fr/produit", "layer-d"));
    expect(url.searchParams.get("utm_source")).toBe("adama-os");
    expect(url.searchParams.get("utm_medium")).toBe("cockpit");
    expect(url.searchParams.get("utm_campaign")).toBe("layer-d");
  });

  it("laisse un lien interne intact", () => {
    expect(withUtm("/ecosysteme", "nav")).toBe("/ecosysteme");
    expect(withUtm("#couche-d", "nav")).toBe("#couche-d");
  });

  it("ne remplace pas une attribution déjà posée", () => {
    const href = "https://exemple.fr/?utm_source=linkedin";
    const url = new URL(withUtm(href, "nav"));
    expect(url.searchParams.get("utm_source")).toBe("linkedin");
    expect(url.searchParams.get("utm_medium")).toBeNull();
  });

  it("conserve les paramètres existants", () => {
    const url = new URL(withUtm("https://exemple.fr/?plan=pro", "terminal"));
    expect(url.searchParams.get("plan")).toBe("pro");
    expect(url.searchParams.get("utm_campaign")).toBe("terminal");
  });

  it("rend l'URL telle quelle si elle est invalide", () => {
    expect(withUtm("https://", "nav")).toBe("https://");
  });
});

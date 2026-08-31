// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// L10-T4 : preuve que le refus purge bien la file d'attente.
// Avant tout choix, les événements sont gardés en mémoire et rien n'est
// envoyé. Un refus doit vider cette file et ignorer tout ce qui suit.
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe("consentement analytics", () => {
  it("met en file tant que le choix n'est pas fait, sans rien stocker", async () => {
    const { captureEvent, pendingEventsCount, getStoredConsent } =
      await import("../lib/analytics");
    expect(getStoredConsent()).toBeNull();
    captureEvent("ecosystem_outbound", { product: "esg-optimizer" });
    captureEvent("recruiter_intent");
    expect(pendingEventsCount()).toBe(2);
    expect(localStorage.getItem("adama-consent")).toBeNull();
  });

  it("vide la file au refus et ignore les captures suivantes", async () => {
    const { captureEvent, pendingEventsCount, setConsent } =
      await import("../lib/analytics");
    captureEvent("ecosystem_outbound");
    expect(pendingEventsCount()).toBe(1);

    setConsent("denied");
    expect(pendingEventsCount()).toBe(0);
    expect(localStorage.getItem("adama-consent")).toBe("denied");

    captureEvent("ecosystem_outbound");
    expect(pendingEventsCount()).toBe(0);
  });

  it("borne la file à vingt événements", async () => {
    const { captureEvent, pendingEventsCount } =
      await import("../lib/analytics");
    for (let i = 0; i < 40; i += 1) {
      captureEvent("evenement", { i });
    }
    expect(pendingEventsCount()).toBe(20);
  });

  it("relit un choix déjà posé lors d'une visite précédente", async () => {
    localStorage.setItem("adama-consent", "granted");
    const { getStoredConsent } = await import("../lib/analytics");
    expect(getStoredConsent()).toBe("granted");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observerHttp } from "../lib/proof/refresh";

// =====================================================================
// C2-T6. Une observation qui ne confirme pas n'est pas une observation.
//
// Le piège que ces tests ferment : enregistrer « HTTP 404 » comme observation
// d'une affirmation qui dit « le produit répond en production ». L'affirmation
// resterait affichée comme vérifiée, adossée à une preuve fraîche qui dit le
// contraire d'elle. Un échec n'écrit rien, l'observation précédente vieillit
// et l'affirmation finit par se déclarer périmée. C'est le résultat voulu.
// =====================================================================

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("observation par appel HTTP", () => {
  it("enregistre une observation quand la source répond correctement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200, statusText: "OK" })),
    );
    const resultat = await observerHttp("https://exemple.fr");
    expect(resultat).toContain("HTTP 200");
    expect(resultat).toMatch(/en \d+ ms/);
  });

  it("n'enregistre rien sur un code d'échec, plutôt qu'une preuve qui se contredit", async () => {
    for (const status of [404, 500, 502, 403]) {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response("non", { status })),
      );
      expect(await observerHttp("https://exemple.fr")).toBeNull();
    }
  });

  it("n'enregistre rien quand la source ne répond pas du tout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );
    expect(await observerHttp("https://exemple.fr")).toBeNull();
  });

  it("n'enregistre rien quand le délai est dépassé", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const erreur = new Error("aborted");
        erreur.name = "AbortError";
        throw erreur;
      }),
    );
    expect(await observerHttp("https://exemple.fr")).toBeNull();
  });
});

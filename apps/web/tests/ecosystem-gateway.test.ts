import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runGateway } from "../lib/ecosystem/gateways";
import { summarize } from "../lib/ecosystem";

// L9 : la dégradation est la partie qui compte. Une passerelle qui ne répond
// pas ne doit produire AUCUNE métrique, et surtout pas un zéro qui ferait
// croire à une panne du produit.
const PASSERELLE = {
  productSlug: "strata-scope",
  productName: "STRATA Scope",
  division: "STRATA",
  originEnv: "TEST_ECOSYSTEM_ORIGIN",
};

const ENV = { ...process.env };

beforeEach(() => {
  delete process.env.TEST_ECOSYSTEM_ORIGIN;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ENV };
  vi.unstubAllGlobals();
});

describe("passerelle produit", () => {
  it("est inactive sans origine configurée, et n'appelle rien", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("disabled");
    expect(resultat.metrics).toHaveLength(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("relève la disponibilité quand la source répond ok", async () => {
    process.env.TEST_ECOSYSTEM_ORIGIN = "https://api.exemple.fr/";
    const fetchMock = vi.fn(
      async (_url: string | URL) =>
        new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "https://api.exemple.fr/health",
    );
    expect(resultat.metrics).toHaveLength(1);
    const metrique = resultat.metrics[0];
    expect(metrique?.metric).toBe("disponibilite_pct");
    expect(metrique?.value).toBe(100);
    expect(metrique?.productSlug).toBe("strata-scope");
    expect(metrique?.division).toBe("STRATA");
    expect(metrique?.source).toBe("GET /health");
    expect(metrique?.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(metrique?.period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("enregistre zéro seulement si la source a répondu un état non sain", async () => {
    process.env.TEST_ECOSYSTEM_ORIGIN = "https://api.exemple.fr";
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "degraded" }), { status: 200 }),
      ),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("unavailable");
    expect(resultat.metrics[0]?.value).toBe(0);
  });

  it("ne produit aucune métrique quand la source ne répond pas", async () => {
    process.env.TEST_ECOSYSTEM_ORIGIN = "https://api.exemple.fr";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("unavailable");
    expect(resultat.latencyMs).toBeNull();
    expect(resultat.metrics).toHaveLength(0);
    // C1-T7 : le cockpit n'a pas pu sortir. Ce n'est pas une panne du produit,
    // et la base ne doit pas lui en attribuer une.
    expect(resultat.failureKind).toBe("erreur_reseau");
  });

  it("traite une réponse HTTP en erreur comme une source injoignable", async () => {
    process.env.TEST_ECOSYSTEM_ORIGIN = "https://api.exemple.fr";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 502 })),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("unavailable");
    expect(resultat.metrics).toHaveLength(0);
    // Le produit a répondu. Il va mal, et c'est une information sur lui.
    expect(resultat.failureKind).toBe("produit_non_sain");
    expect(resultat.httpStatus).toBe(502);
  });
});

// =====================================================================
// C1-T7. Quatre natures d'échec, quatre informations différentes.
// Sans cette distinction, une panne du produit et une panne de la sortie
// réseau du cockpit se lisaient comme la même absence, et le cockpit prêtait
// au produit des incidents qu'il n'avait pas eus.
// =====================================================================
describe("nature de l'échec", () => {
  beforeEach(() => {
    process.env.TEST_ECOSYSTEM_ORIGIN = "https://api.exemple.fr";
  });

  it("distingue un délai dépassé d'une coupure réseau", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const erreur = new Error("The operation was aborted");
        erreur.name = "AbortError";
        throw erreur;
      }),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.failureKind).toBe("delai_depasse");
    expect(resultat.metrics).toHaveLength(0);
  });

  it("distingue une réponse illisible d'un produit non sain", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response("<html>pas du json</html>", { status: 200 }),
      ),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.failureKind).toBe("reponse_illisible");
    expect(resultat.metrics).toHaveLength(0);
  });

  it("traite une réponse 200 sans champ status comme illisible, pas comme saine", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("unavailable");
    expect(resultat.failureKind).toBe("reponse_illisible");
    expect(resultat.metrics).toHaveLength(0);
  });

  it("ne porte aucune nature d'échec quand tout va bien", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
      ),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.status).toBe("ok");
    expect(resultat.failureKind).toBeNull();
    expect(resultat.httpStatus).toBe(200);
  });

  it("attribue produit_non_sain quand la source répond un état dégradé", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ status: "degraded" }), { status: 200 }),
      ),
    );

    const resultat = await runGateway(PASSERELLE);

    expect(resultat.failureKind).toBe("produit_non_sain");
    expect(resultat.metrics[0]?.value).toBe(0);
  });
});

describe("mode dégradé global", () => {
  const base = {
    productName: "X",
    division: "STRATA",
    latencyMs: null,
    fetchedAt: "2026-08-31T00:00:00.000Z",
    error: null,
    failureKind: null,
    httpStatus: null,
    metrics: [],
  };

  it("signale l'absence totale de configuration", () => {
    const vue = summarize([
      { ...base, productSlug: "a", status: "disabled" as const },
    ]);
    expect(vue.noneConfigured).toBe(true);
    expect(vue.allDown).toBe(false);
  });

  it("signale que plus rien ne répond", () => {
    const vue = summarize([
      { ...base, productSlug: "a", status: "unavailable" as const },
      { ...base, productSlug: "b", status: "disabled" as const },
    ]);
    expect(vue.allDown).toBe(true);
    expect(vue.noneConfigured).toBe(false);
  });

  it("ne déclare pas de panne globale dès qu'une source répond", () => {
    const vue = summarize([
      { ...base, productSlug: "a", status: "ok" as const },
      { ...base, productSlug: "b", status: "unavailable" as const },
    ]);
    expect(vue.allDown).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// L11-T3, contrat des endpoints publics.
//
// Ce qui est vérifié : la forme de la réponse, et surtout le comportement
// quand la base n'est pas configurée. Un endpoint qui répondrait 200 avec un
// tableau vide dans ce cas ferait passer une panne pour une absence de
// données, ce qui est exactement le mensonge que le projet refuse.
const ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ENV };
});

const ENDPOINTS = [
  { nom: "metrics", chemin: "../app/api/metrics/route" },
  { nom: "decisions", chemin: "../app/api/decisions/route" },
  { nom: "trajectory", chemin: "../app/api/trajectory/route" },
  { nom: "ecosystem", chemin: "../app/api/ecosystem/route" },
];

describe("endpoints publics, base non configurée", () => {
  for (const endpoint of ENDPOINTS) {
    it(`/api/${endpoint.nom} répond 503 et le dit`, async () => {
      const { GET } = (await import(endpoint.chemin)) as {
        GET: () => Promise<Response>;
      };
      const res = await GET();
      expect(res.status).toBe(503);
      const corps = (await res.json()) as { error?: string };
      expect(typeof corps.error).toBe("string");
      expect(corps.error?.length).toBeGreaterThan(0);
    });
  }
});

describe("synchronisation des passerelles", () => {
  it("refuse un appel non autorisé quand un secret est posé", async () => {
    process.env.CRON_SECRET = "secret-de-test";
    const { GET } = (await import("../app/api/ecosystem/sync/route")) as {
      GET: (req: Request) => Promise<Response>;
    };
    const res = await GET(new Request("https://exemple.fr/api/ecosystem/sync"));
    expect(res.status).toBe(401);
  });

  it("accepte l'en-tête attendu et rend un compte rendu", async () => {
    process.env.CRON_SECRET = "secret-de-test";
    delete process.env.ECOSYSTEM_SCOPE_API_URL;
    delete process.env.ECOSYSTEM_ESG_OPTIMIZER_API_URL;
    const { GET } = (await import("../app/api/ecosystem/sync/route")) as {
      GET: (req: Request) => Promise<Response>;
    };
    const res = await GET(
      new Request("https://exemple.fr/api/ecosystem/sync", {
        headers: { authorization: "Bearer secret-de-test" },
      }),
    );
    expect(res.status).toBe(200);
    const corps = (await res.json()) as {
      gateways: { status: string }[];
      persisted: { inserted: number };
    };
    // Aucune origine configurée : toutes les passerelles sont inactives et
    // rien n'est écrit en base.
    expect(corps.gateways.every((g) => g.status === "disabled")).toBe(true);
    expect(corps.persisted.inserted).toBe(0);
  });
});

describe("agent adama.ai", () => {
  it("refuse une requête illisible", async () => {
    const { POST } = (await import("../app/api/chat/route")) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await POST(
      new Request("https://exemple.fr/api/chat", {
        method: "POST",
        body: "pas du json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("échoue franchement plutôt que de répondre sans source", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.DATABASE_URL;
    const { POST } = (await import("../app/api/chat/route")) as {
      POST: (req: Request) => Promise<Response>;
    };
    const res = await POST(
      new Request("https://exemple.fr/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: "1",
              role: "user",
              parts: [{ type: "text", text: "Qu'est-ce que le VSME ?" }],
            },
          ],
        }),
      }),
    );
    expect(res.status).toBe(503);
    const corps = (await res.json()) as { error: string };
    expect(corps.error).toMatch(/source/i);
  });

  it("bloque au-delà de la limite de débit", async () => {
    process.env.ADAMA_AI_RATE_LIMIT = "2";
    process.env.ADAMA_AI_RATE_WINDOW_S = "300";
    vi.resetModules();
    const { POST } = (await import("../app/api/chat/route")) as {
      POST: (req: Request) => Promise<Response>;
    };
    // Corps volontairement illisible : le garde-fou de débit s'applique AVANT
    // la lecture du corps, donc ces appels comptent sans jamais atteindre le
    // modèle. Un test de débit ne doit rien coûter.
    const requete = () =>
      POST(
        new Request("https://exemple.fr/api/chat", {
          method: "POST",
          headers: { "x-forwarded-for": "203.0.113.7" },
          body: "pas du json",
        }),
      );

    expect((await requete()).status).toBe(400);
    expect((await requete()).status).toBe(400);
    const troisieme = await requete();
    expect(troisieme.status).toBe(429);
    expect(troisieme.headers.get("Retry-After")).toBeTruthy();
  });
});

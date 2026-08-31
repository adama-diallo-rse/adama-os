import { describe, expect, it } from "vitest";
import { formatContext, retrieveContext } from "../lib/ai/retrieval";
import type { RetrievedChunk } from "../lib/ai/retrieval";

// L11-T2.a, retrieval.
//
// Ce test parle à une vraie base et appelle l'API d'embeddings : il ne
// s'exécute que si on le demande explicitement, et jamais contre la
// production. Activation :
//   ADAMA_TEST_DB=1 DATABASE_URL=<base de test> OPENAI_API_KEY=... \
//   pnpm --filter @adama/web test
//
// Ce qu'il garantit : une question proche du corpus ramène la bonne source,
// une question hors sujet n'en ramène aucune. C'est ce qui évite qu'une
// démonstration d'adama.ai s'effondre en entretien.
const actif =
  process.env.ADAMA_TEST_DB === "1" &&
  !!process.env.DATABASE_URL &&
  !!process.env.OPENAI_API_KEY;

describe.skipIf(!actif)("retrieval pgvector, base de test", () => {
  it("ramène une source pertinente sur une question du corpus", async () => {
    const chunks = await retrieveContext(
      "Quelles entreprises sont concernees par le standard VSME ?",
      { k: 4 },
    );
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.similarity).toBeGreaterThan(0.15);
    const sources = chunks.map((c) => c.docSource.toUpperCase());
    expect(sources.some((s) => s.includes("VSME") || s.includes("ESRS"))).toBe(
      true,
    );
  }, 30_000);

  it("ne ramène rien sur une question hors sujet", async () => {
    const chunks = await retrieveContext(
      "zzzz qwerty plombier lasagnes 12345 asdfgh",
      { k: 4, minSimilarity: 0.35 },
    );
    expect(chunks).toHaveLength(0);
  }, 30_000);
});

// Le formatage des citations, lui, se teste sans base.
describe("formatage du contexte", () => {
  const chunk: RetrievedChunk = {
    content: "Le seuil est fixe a 250 salaries.",
    similarity: 0.82,
    page: 12,
    docTitle: "Standard VSME",
    docSource: "VSME",
    docLang: "fr",
  };

  it("numérote les références et porte la source", () => {
    const texte = formatContext([chunk, { ...chunk, page: null }]);
    expect(texte).toContain("[1] (VSME — Standard VSME, p. 12, fr)");
    expect(texte).toContain("[2] (VSME — Standard VSME, fr)");
    expect(texte).toContain("Le seuil est fixe a 250 salaries.");
  });

  it("rend une chaîne vide sans chunk, pour que le prompt bascule sans contexte", () => {
    expect(formatContext([])).toBe("");
  });
});

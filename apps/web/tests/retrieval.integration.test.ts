import { describe, expect, it } from "vitest";
import {
  diversifier,
  formatContext,
  preparerContexte,
  retrieveContext,
  sourcesDe,
} from "../lib/ai/retrieval";
import type { RetrievedChunk } from "../lib/ai/retrieval";
import { libelleSource } from "../lib/ai/sources";

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

// Le formatage des citations, la diversification et la liste des sources se
// testent sans base : ce sont des fonctions pures.
describe("preparation du contexte", () => {
  const extrait = (
    documentId: string,
    page: number | null,
    similarity = 0.82,
    content = "Le seuil est fixe a 250 salaries.",
  ): RetrievedChunk => ({
    content,
    similarity,
    page,
    documentId,
    docTitle: "Standard VSME",
    docSource: "VSME",
    docLang: "fr",
  });

  it("numérote par document et porte la source", () => {
    const texte = formatContext([extrait("doc-a", 12), extrait("doc-b", null)]);
    expect(texte).toContain("[1] (VSME, Standard VSME, fr)");
    expect(texte).toContain("p. 12 : Le seuil est fixe a 250 salaries.");
    expect(texte).toContain("[2] (VSME, Standard VSME, fr)");
  });

  it("regroupe deux extraits du meme document sous un seul renvoi", () => {
    const { texte, sources } = preparerContexte([
      extrait("doc-a", 12),
      extrait("doc-a", 13, 0.71),
      extrait("doc-b", 4, 0.66),
    ]);
    expect(texte.match(/^\[\d\]/gm)).toHaveLength(2);
    expect(sources).toHaveLength(2);
    expect(sources[0]?.rang).toBe(1);
    expect(sources[0]?.pages).toEqual([12, 13]);
    // La similarite affichee est la meilleure du document, pas la derniere.
    expect(sources[0]?.similarite).toBe(0.82);
    expect(sources[1]?.rang).toBe(2);
  });

  // Le defaut que cette verification rend impossible : le modele cite [2],
  // l'interface affiche un document different sous le numero 2, et le renvoi
  // se lit comme une verification alors qu'il pointe a cote.
  it("aligne la numerotation du contexte et celle des sources", () => {
    const chunks = [
      extrait("doc-a", 12),
      extrait("doc-b", 3),
      extrait("doc-a", 13),
      extrait("doc-c", null),
    ];
    const { texte, sources } = preparerContexte(chunks);
    for (const source of sources) {
      expect(texte).toContain(`[${source.rang}] (${source.source},`);
    }
    expect(sources.map((s) => s.rang)).toEqual([1, 2, 3]);
    expect(sourcesDe(chunks)).toEqual(sources);
  });

  it("rend une chaîne vide sans chunk, pour que le prompt bascule sans contexte", () => {
    expect(formatContext([])).toBe("");
    expect(sourcesDe([])).toEqual([]);
  });

  it("libelle une source avec ses pages", () => {
    expect(
      libelleSource({
        rang: 1,
        source: "VSME",
        titre: "Standard VSME",
        langue: "fr",
        pages: [12, 13],
        similarite: 0.82,
      }),
    ).toBe("VSME, Standard VSME, p. 12 et 13");
    expect(
      libelleSource({
        rang: 2,
        source: "CV",
        titre: "CV",
        langue: "fr",
        pages: [],
        similarite: 0.4,
      }),
    ).toBe("CV");
  });
});

// Diversification. Sur un corpus decoupe finement, les six meilleurs extraits
// sont souvent six tranches consecutives du meme document : le modele croit
// alors disposer de six sources et n'en a qu'une.
describe("diversification par document", () => {
  const faux = (documentId: string, i: number): RetrievedChunk => ({
    content: `extrait ${i}`,
    similarity: 1 - i / 100,
    page: i,
    documentId,
    docTitle: documentId,
    docSource: documentId,
    docLang: "fr",
  });

  it("plafonne le nombre d'extraits par document", () => {
    const chunks = [
      ...Array.from({ length: 6 }, (_, i) => faux("doc-a", i)),
      faux("doc-b", 10),
      faux("doc-c", 11),
    ];
    const retenus = diversifier(chunks, 4, 2);
    expect(retenus).toHaveLength(4);
    expect(retenus.filter((c) => c.documentId === "doc-a")).toHaveLength(2);
    expect(retenus.map((c) => c.documentId)).toContain("doc-b");
    expect(retenus.map((c) => c.documentId)).toContain("doc-c");
  });

  it("complete avec les meilleurs restants quand un seul document existe", () => {
    const chunks = Array.from({ length: 6 }, (_, i) => faux("doc-a", i));
    const retenus = diversifier(chunks, 4, 2);
    expect(retenus).toHaveLength(4);
    // L'ordre de pertinence est conserve : les deux premiers restent devant.
    expect(retenus.map((c) => c.page)).toEqual([0, 1, 2, 3]);
  });

  it("ne rend jamais plus de k extraits", () => {
    const chunks = Array.from({ length: 20 }, (_, i) => faux(`doc-${i}`, i));
    expect(diversifier(chunks, 6, 3)).toHaveLength(6);
  });
});

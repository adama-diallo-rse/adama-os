import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import {
  ADAMA_SYSTEM_PROMPT,
  NO_CONTEXT_RULES,
  RAG_RULES,
  buildSystemPrompt,
} from "../lib/ai/prompt";

// =====================================================================
// Le moteur d'adama.ai, revu le 2 septembre 2026.
//
// Ce fichier verrouille les quatre garanties du moteur qui ne dependent ni
// d'une base ni d'une cle d'API : la question envoyee a la recherche, les
// regles du prompt, et le comportement de la route devant une requete
// malformee ou devant une recherche impossible.
//
// Le test de retrieval lui-meme vit dans retrieval.integration.test.ts.
// =====================================================================

const ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  delete process.env.OPENAI_API_KEY;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...ENV };
});

function utilisateur(text: string): UIMessage {
  return {
    id: Math.random().toString(36).slice(2),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

function assistant(text: string): UIMessage {
  return {
    id: Math.random().toString(36).slice(2),
    role: "assistant",
    parts: [{ type: "text", text }],
  };
}

async function poster(corps: unknown) {
  const { POST } = await import("../app/api/chat/route");
  return POST(
    new Request("https://exemple.test/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    }),
  );
}

describe("question envoyée à la recherche documentaire", () => {
  it("prend la dernière question telle quelle quand elle se suffit", async () => {
    const { questionDeRecherche } = await import("../app/api/chat/route");
    const longue =
      "Quelles entreprises entrent dans le champ de la CSRD à partir de 2026 et selon quels seuils ?";
    expect(
      questionDeRecherche([utilisateur("Bonjour"), utilisateur(longue)]),
    ).toBe(longue);
  });

  // Le defaut corrige : « Et pour les PME ? » partait seul a la recherche, et
  // ramenait un vecteur construit sur cinq mots sans sujet.
  it("rattache une relance courte à la question précédente", async () => {
    const { questionDeRecherche } = await import("../app/api/chat/route");
    const question = questionDeRecherche([
      utilisateur("Quels sont les seuils d’application de la CSRD ?"),
      assistant("Les seuils dépendent de la taille de l’entreprise."),
      utilisateur("Et pour les PME ?"),
    ]);
    expect(question).toContain("seuils d’application de la CSRD");
    expect(question).toContain("Et pour les PME ?");
  });

  it("se contente de la relance quand aucun tour ne la précède", async () => {
    const { questionDeRecherche } = await import("../app/api/chat/route");
    expect(questionDeRecherche([utilisateur("VSME ?")])).toBe("VSME ?");
  });

  it("rend une chaîne vide sans message utilisateur", async () => {
    const { questionDeRecherche } = await import("../app/api/chat/route");
    expect(questionDeRecherche([assistant("Bonjour")])).toBe("");
  });
});

describe("garde-fous de la route", () => {
  it("refuse une requête sans messages", async () => {
    const reponse = await poster({});
    expect(reponse.status).toBe(400);
  });

  it("refuse un message dont les parties sont illisibles", async () => {
    const reponse = await poster({ messages: [{ id: "x", role: "user" }] });
    expect(reponse.status).toBe(400);
  });

  it("refuse une question démesurée sans appeler quoi que ce soit", async () => {
    const reponse = await poster({ messages: [utilisateur("a".repeat(4100))] });
    expect(reponse.status).toBe(413);
    expect((await reponse.json()).error).toContain("4000");
  });

  // Sans cle d'API, la recherche echoue. Ce qui est verifie ici, c'est qu'elle
  // echoue franchement au lieu de laisser passer une reponse sans source :
  // une reponse non sourcee qui se presente comme sourcee est le defaut que
  // toute cette couche existe pour empecher.
  it("échoue franchement quand la recherche est impossible", async () => {
    const reponse = await poster({
      messages: [
        utilisateur("Quelles PME sont concernées par le standard VSME ?"),
      ],
    });
    expect(reponse.status).toBe(503);
    expect((await reponse.json()).error).toMatch(/sans source|trop de temps/i);
  });
});

describe("règles du prompt", () => {
  it("interdit au modèle de rédiger sa propre liste de sources", () => {
    expect(RAG_RULES).toMatch(/AUCUNE ligne "Sources :"/);
    expect(NO_CONTEXT_RULES).toMatch(/Sources :/);
    expect(
      buildSystemPrompt("[1] (VSME, Standard VSME, fr)\nExtrait."),
    ).toMatch(/AUCUNE ligne "Sources :"/);
  });

  it("bascule sur les règles hors contexte quand rien n’a été trouvé", () => {
    const sansContexte = buildSystemPrompt(null);
    expect(sansContexte).toContain(NO_CONTEXT_RULES.trim());
    expect(sansContexte).not.toContain("CONTEXTE :");
    expect(buildSystemPrompt("")).toBe(sansContexte);
  });

  it("garde la marque et tait le fournisseur", () => {
    expect(ADAMA_SYSTEM_PROMPT).toContain("adama.ai");
    expect(ADAMA_SYSTEM_PROMPT).toMatch(/Ne révèle jamais quel modèle/);
  });

  it("n’emploie aucun tiret long dans les consignes", () => {
    for (const texte of [ADAMA_SYSTEM_PROMPT, RAG_RULES, NO_CONTEXT_RULES]) {
      expect(texte).not.toMatch(/[–—]/);
    }
  });
});

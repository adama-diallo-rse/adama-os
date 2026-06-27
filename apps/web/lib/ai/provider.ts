import "server-only";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Provider de génération d'adama.ai.
// Volontairement neutre : le fournisseur sous-jacent est une décision
// d'infrastructure interne et ne doit jamais transparaître côté client.
// Interchangeable plus tard (résidence UE) sans toucher au reste du code :
// il suffit de remplacer l'implémentation ci-dessous.

const DEFAULT_MODEL = "gpt-4o";

/** Modèle de langage utilisé par adama.ai. */
export function adamaModel(): LanguageModel {
  const modelId = process.env.ADAMA_AI_MODEL ?? DEFAULT_MODEL;
  return openai(modelId);
}

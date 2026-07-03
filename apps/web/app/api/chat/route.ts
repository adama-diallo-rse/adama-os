import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { adamaModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { formatContext, retrieveContext } from "@/lib/ai/retrieval";

// Endpoint de l'agent adama.ai (L3-T4 + L3-T5).
// Pipeline par requête : question → embedding → retrieval pgvector top-k →
// contexte numéroté injecté dans le prompt → génération citée en streaming.
// Exécuté uniquement côté serveur : clés, modèle et base ne quittent jamais
// l'infrastructure.
export const runtime = "nodejs";
export const maxDuration = 30;

/** Concatène les parties texte du dernier message utilisateur. */
function lastUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return "";
  }
  return lastUser.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export async function POST(req: Request) {
  const {
    messages,
    lang,
    source,
  }: { messages: UIMessage[]; lang?: string; source?: string } =
    await req.json();

  const question = lastUserText(messages);

  // Retrieval top-k. Le RAG ne doit jamais faire tomber le chat : en cas
  // d'erreur (base indisponible, table vide...), on répond sans contexte
  // et le prompt impose la prudence.
  let context: string | null = null;
  if (question.length > 0) {
    try {
      const chunks = await retrieveContext(question, { k: 6, lang, source });
      if (chunks.length > 0) {
        context = formatContext(chunks);
      }
    } catch (error) {
      console.error("[adama.ai] retrieval indisponible :", error);
    }
  }

  const result = streamText({
    model: adamaModel(),
    system: buildSystemPrompt(context),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onError(error) {
      console.error("[adama.ai]", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}

import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { adamaModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { formatContext, retrieveContext } from "@/lib/ai/retrieval";
import {
  clientKey,
  createRateLimiter,
  readPositiveInt,
} from "@/lib/rate-limit";

// Endpoint de l'agent adama.ai (L3-T4 + L3-T5).
// Pipeline par requête : question → embedding → retrieval pgvector top-k →
// contexte numéroté injecté dans le prompt → génération citée en streaming.
// Exécuté uniquement côté serveur : clés, modèle et base ne quittent jamais
// l'infrastructure.
export const runtime = "nodejs";
export const maxDuration = 30;

// L8-T12 : garde-fou de débit, par adresse IP. Réglable par variables
// d'environnement, voir apps/web/.env.example.
const limiteur = createRateLimiter({
  limit: readPositiveInt(process.env.ADAMA_AI_RATE_LIMIT, 12),
  windowMs: readPositiveInt(process.env.ADAMA_AI_RATE_WINDOW_S, 300) * 1000,
});

/** Concatène les parties texte du dernier message utilisateur. */
function lastUserText(messages: UIMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return "";
  }
  return lastUser.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function erreur(message: string, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function POST(req: Request) {
  const verdict = limiteur.check(clientKey(req.headers));
  if (!verdict.allowed) {
    return erreur(
      "Trop de questions d'affilée. Reprends dans un instant.",
      429,
      { "Retry-After": String(verdict.retryAfterS) },
    );
  }

  let corps: { messages?: UIMessage[]; lang?: string; source?: string };
  try {
    corps = await req.json();
  } catch {
    return erreur("Requête illisible.", 400);
  }

  const { messages, lang, source } = corps;
  if (!Array.isArray(messages)) {
    return erreur("Requête invalide : messages manquants.", 400);
  }

  const question = lastUserText(messages);

  // Retrieval top-k.
  //
  // Changement du 31 aout 2026 (L3-T3) : un incident de retrieval n'est plus
  // avalé. Avant, une base injoignable produisait une réponse générée sans
  // aucune source, indiscernable d'une réponse sourcée pour qui la lit. Une
  // réponse non sourcée qui se présente comme sourcée est pire qu'une erreur
  // affichée : on échoue franchement.
  //
  // Nuance volontaire : zéro chunk trouvé n'est PAS un incident. Le corpus ne
  // couvre pas tout, le prompt sans contexte impose alors de le dire.
  let context: string | null = null;
  if (question.length > 0) {
    try {
      const chunks = await retrieveContext(question, { k: 6, lang, source });
      if (chunks.length > 0) {
        context = formatContext(chunks);
      }
    } catch (error) {
      console.error("[adama.ai] retrieval indisponible :", error);
      return erreur(
        "Base documentaire injoignable : je préfère ne pas répondre sans source. Réessaie dans un instant.",
        503,
      );
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

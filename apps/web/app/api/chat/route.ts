import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { adamaModel } from "@/lib/ai/provider";
import { ADAMA_SYSTEM_PROMPT } from "@/lib/ai/prompt";

// Endpoint de l'agent adama.ai. Exécuté uniquement côté serveur :
// la clé et le modèle ne quittent jamais l'infrastructure.
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: adamaModel(),
    system: ADAMA_SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onError(error) {
      console.error("[adama.ai]", error);
      return error instanceof Error ? error.message : String(error);
    },
  });
}

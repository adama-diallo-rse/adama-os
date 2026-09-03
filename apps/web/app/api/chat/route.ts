import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { adamaModel } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import {
  preparerContexte,
  RechercheTropLente,
  retrieveContext,
} from "@/lib/ai/retrieval";
import type { AdamaUIMessage, SourceConsultee } from "@/lib/ai/sources";
import {
  clientKey,
  createRateLimiter,
  readPositiveInt,
} from "@/lib/rate-limit";
import { RETRIEVAL_K } from "@/lib/ai/config";
import { PROVENANCE_HEADER } from "@/lib/legal";

// Endpoint de l'agent adama.ai (L3-T4 + L3-T5), revu le 2 septembre 2026.
// Pipeline par requête : question → embedding → retrieval pgvector top-k →
// contexte numéroté injecté dans le prompt → sources émises comme donnée →
// génération citée en streaming.
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

/** Longueur maximale acceptee pour une question. Le champ de saisie pose la
 *  meme borne, mais un client n'est pas une garantie : la route ne fait
 *  confiance a personne. */
const LONGUEUR_MAX = 4000;

/** Tours de conversation transmis au modele. Au dela, le debut de l'echange
 *  coute plus qu'il n'apporte, et il fait deriver la recherche. */
const TOURS_MAX = 12;

/** Concatène les parties texte d'un message. */
function texteDe(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("\n")
    .trim();
}

/**
 * La question envoyee a la recherche documentaire.
 *
 * Defaut corrige : la recherche ne voyait que le dernier message. « Et pour
 * les PME ? », apres une question sur les seuils CSRD, partait donc chercher
 * un vecteur construit sur cinq mots sans sujet, et ramenait n'importe quoi.
 *
 * La regle est volontairement mecanique, sans appel de modele supplementaire :
 * en dessous de quatre-vingts caracteres, la question du tour precedent est
 * prefixee. Une reformulation par le modele couterait un aller-retour a
 * chaque message, pour un gain que le corpus actuel ne justifie pas.
 */
export function questionDeRecherche(messages: UIMessage[]): string {
  const tours = messages.filter((m) => m.role === "user");
  const derniere = texteDe(tours.at(-1));
  if (derniere.length === 0 || derniere.length >= 80) return derniere;
  const precedente = texteDe(tours.at(-2));
  return precedente ? `${precedente}\n${derniere}` : derniere;
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
  if (messages.length === 0 || messages.some((m) => !Array.isArray(m?.parts))) {
    return erreur("Requête invalide : messages illisibles.", 400);
  }

  const question = questionDeRecherche(messages);
  if (question.length > LONGUEUR_MAX) {
    return erreur(
      `Question trop longue : ${LONGUEUR_MAX} caractères au maximum.`,
      413,
    );
  }

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
  let sources: SourceConsultee[] = [];
  if (question.length > 0) {
    try {
      const chunks = await retrieveContext(question, {
        k: RETRIEVAL_K,
        lang,
        source,
      });
      if (chunks.length > 0) {
        const prepare = preparerContexte(chunks);
        context = prepare.texte;
        sources = prepare.sources;
      }
    } catch (error) {
      console.error("[adama.ai] retrieval indisponible :", error);
      return erreur(
        error instanceof RechercheTropLente
          ? "La recherche documentaire a mis trop de temps à répondre. Réessaie dans un instant."
          : "Base documentaire injoignable : je préfère ne pas répondre sans source. Réessaie dans un instant.",
        503,
      );
    }
  }

  // Les sources partent AVANT le premier mot de la reponse. Le panneau peut
  // ainsi annoncer sur quoi la reponse s'appuie pendant qu'elle s'ecrit,
  // plutot que de faire attendre la fin pour le dire.
  const flux = createUIMessageStream<AdamaUIMessage>({
    execute: ({ writer }) => {
      if (sources.length > 0) {
        writer.write({ type: "data-sources", id: "sources", data: sources });
      }
      const resultat = streamText({
        model: adamaModel(),
        system: buildSystemPrompt(context),
        messages: convertToModelMessages(messages.slice(-TOURS_MAX)),
        // Une conversation abandonnee cesse de couter : le navigateur coupe,
        // la generation s'arrete ici aussi.
        abortSignal: req.signal,
      });
      writer.merge(resultat.toUIMessageStream());
    },
    onError(error) {
      console.error("[adama.ai]", error);
      return "La réponse n’a pas pu être produite. Réessaie dans un instant.";
    },
  });

  // C11-T5, marquage lisible par machine.
  //
  // L'arbitrage de docs/MARQUAGE-MACHINE.md est applique ici : un en-tete de
  // reponse, et non un bloc de provenance ajoute au texte par le modele. Le
  // second survivrait au copier-coller mais dependrait du modele pour
  // l'ecrire, ce qui reviendrait a demander a un systeme generatif de
  // certifier sa propre nature. L'en-tete, lui, est pose par le code.
  //
  // Il complete la mention VISIBLE deja exigee par l'article 50, presente au
  // premier contact et en permanence dans l'en-tete du panneau. Ni l'un ni
  // l'autre n'est une preuve : ce sont des declarations, et le vocabulaire de
  // ce depot interdit de les appeler autrement.
  return createUIMessageStreamResponse({
    stream: flux,
    headers: {
      "X-Content-Provenance": PROVENANCE_HEADER,
    },
  });
}

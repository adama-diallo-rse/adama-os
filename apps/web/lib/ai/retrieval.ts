import "server-only";

// Retrieval top-k pgvector (L3-T3), revu le 2 septembre 2026.
// Similarite cosinus sur rag_chunks (index HNSW cree en migration 0000),
// jointure rag_documents pour les citations, filtres optionnels langue/source.
// Import dynamique de @adama/db : DATABASE_URL n'est lu qu'a la requete,
// jamais a l'evaluation du module (build Vercel sans env safe).
//
// Trois defauts corriges dans cette version.
//
// 1. La concentration. La requete prenait les k plus proches, sans regarder
//    d'ou ils venaient. Sur un corpus decoupe finement, les six meilleurs
//    extraits sont reguliement six tranches consecutives de la meme page :
//    le modele recoit alors six fois le meme paragraphe et croit avoir six
//    sources. On sur-recupere, puis on plafonne le nombre d'extraits par
//    document avant de couper a k.
// 2. L'absence de delai. Une base lente ou une API d'embeddings qui ne repond
//    pas laissaient la requete courir jusqu'a la coupure de la plateforme,
//    trente secondes plus tard, sans message. La recherche porte desormais
//    son propre delai et echoue franchement.
// 3. Les sources invisibles. Les extraits servaient a fabriquer un bloc de
//    texte, et rien d'autre ne sortait d'ici. La liste des documents
//    reellement consultes est maintenant une donnee, `sourcesDe`, que
//    l'interface affiche telle quelle au lieu de faire confiance a la ligne
//    « Sources : » que le modele redige lui-meme.

import { and, asc, cosineDistance, eq, gt, sql } from "drizzle-orm";
import { embedQuery } from "./embeddings";
import {
  RETRIEVAL_K,
  RETRIEVAL_MAX_PAR_DOCUMENT,
  RETRIEVAL_MIN_SIMILARITY,
} from "./config";
import type { SourceConsultee } from "./sources";

export type RetrievedChunk = {
  content: string;
  similarity: number;
  page: number | null;
  documentId: string;
  docTitle: string;
  docSource: string;
  docLang: string;
};

export type RetrievalOptions = {
  /** Nombre de chunks retournés (défaut 6). */
  k?: number;
  /** Filtre langue du document ("fr" | "en"). */
  lang?: string;
  /** Filtre source du document ("ESRS", "VSME", "CV"...). */
  source?: string;
  /** Similarité cosinus minimale (défaut 0.15, permissif volontairement). */
  minSimilarity?: number;
  /** Extraits retenus au maximum pour un meme document (défaut 3). */
  maxParDocument?: number;
  /** Délai maximal de la recherche, en millisecondes (défaut 12000). */
  delaiMs?: number;
};

/** Le delai est depasse. Distingue d'une base injoignable a l'appel. */
export class RechercheTropLente extends Error {
  constructor(delaiMs: number) {
    super(`Recherche documentaire interrompue apres ${delaiMs} ms.`);
    this.name = "RechercheTropLente";
  }
}

async function avecDelai<T>(travail: Promise<T>, delaiMs: number): Promise<T> {
  let minuterie: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      travail,
      new Promise<never>((_, rejeter) => {
        minuterie = setTimeout(
          () => rejeter(new RechercheTropLente(delaiMs)),
          delaiMs,
        );
      }),
    ]);
  } finally {
    if (minuterie) clearTimeout(minuterie);
  }
}

/**
 * Plafonne le nombre d'extraits par document sans casser l'ordre de
 * pertinence, puis complete avec les meilleurs restants si le plafond a
 * laisse des places libres. Un corpus qui n'a qu'un seul document reste donc
 * exploitable : la diversite est une preference, pas une obligation.
 */
export function diversifier(
  chunks: RetrievedChunk[],
  k: number,
  maxParDocument: number,
): RetrievedChunk[] {
  const retenus: RetrievedChunk[] = [];
  const reste: RetrievedChunk[] = [];
  const compte = new Map<string, number>();
  for (const chunk of chunks) {
    const deja = compte.get(chunk.documentId) ?? 0;
    if (deja < maxParDocument && retenus.length < k) {
      retenus.push(chunk);
      compte.set(chunk.documentId, deja + 1);
    } else {
      reste.push(chunk);
    }
  }
  for (const chunk of reste) {
    if (retenus.length >= k) break;
    retenus.push(chunk);
  }
  return retenus;
}

export async function retrieveContext(
  question: string,
  options: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const {
    k = RETRIEVAL_K,
    lang,
    source,
    minSimilarity = RETRIEVAL_MIN_SIMILARITY,
    maxParDocument = RETRIEVAL_MAX_PAR_DOCUMENT,
    delaiMs = 12_000,
  } = options;

  return avecDelai(
    (async () => {
      const [{ db, schema }, queryEmbedding] = await Promise.all([
        import("@adama/db"),
        embedQuery(question),
      ]);
      const { ragChunks, ragDocuments } = schema;

      const distance = cosineDistance(ragChunks.embedding, queryEmbedding);
      const similarity = sql<number>`1 - (${distance})`;

      const filters = [gt(similarity, minSimilarity)];
      if (lang) {
        filters.push(eq(ragDocuments.lang, lang));
      }
      if (source) {
        filters.push(eq(ragDocuments.source, source));
      }

      // Sur-recuperation : on demande trois fois k, plafonne a trente, pour
      // avoir de quoi diversifier. Sans cette marge, plafonner le nombre
      // d'extraits par document reviendrait a repondre avec moins de matiere.
      const rows = await db
        .select({
          content: ragChunks.content,
          similarity,
          metadata: ragChunks.metadata,
          documentId: ragChunks.documentId,
          docTitle: ragDocuments.title,
          docSource: ragDocuments.source,
          docLang: ragDocuments.lang,
        })
        .from(ragChunks)
        .innerJoin(ragDocuments, eq(ragChunks.documentId, ragDocuments.id))
        .where(and(...filters))
        // Tri par distance croissante : même ordre que similarité décroissante,
        // mais exploitable directement par l'index HNSW (vector_cosine_ops).
        .orderBy(asc(distance))
        .limit(Math.min(30, Math.max(k, k * 3)));

      const chunks = rows.map((row) => ({
        content: row.content,
        similarity: Number(row.similarity),
        page: typeof row.metadata.page === "number" ? row.metadata.page : null,
        documentId: row.documentId,
        docTitle: row.docTitle,
        docSource: row.docSource,
        docLang: row.docLang,
      }));
      return diversifier(chunks, k, maxParDocument);
    })(),
    delaiMs,
  );
}

/**
 * Prepare le bloc de contexte ET la liste des sources, d'un seul geste.
 *
 * Les deux sortaient de deux fonctions independantes, et c'etait un piege :
 * le modele citait un numero d'extrait, l'interface affichait un numero de
 * document, et les deux numerotations divergeaient des qu'un document
 * fournissait deux extraits. Un renvoi qui pointe a cote est pire qu'une
 * absence de renvoi, parce qu'il se lit comme une verification.
 *
 * La numerotation est donc unique et par DOCUMENT. Les extraits d'un meme
 * document sont regroupes sous son numero, chacun precede de sa page. Le
 * modele cite [2], le lecteur trouve la source 2, et c'est le meme document.
 */
export function preparerContexte(chunks: RetrievedChunk[]): {
  texte: string;
  sources: SourceConsultee[];
} {
  const ordre: string[] = [];
  const groupes = new Map<string, RetrievedChunk[]>();
  for (const chunk of chunks) {
    const groupe = groupes.get(chunk.documentId);
    if (groupe) {
      groupe.push(chunk);
    } else {
      ordre.push(chunk.documentId);
      groupes.set(chunk.documentId, [chunk]);
    }
  }

  const sources: SourceConsultee[] = [];
  const blocs: string[] = [];
  ordre.forEach((documentId, index) => {
    const extraits = groupes.get(documentId) ?? [];
    const premier = extraits[0];
    if (!premier) return;
    const rang = index + 1;
    const pages = [
      ...new Set(
        extraits
          .map((e) => e.page)
          .filter((page): page is number => page !== null),
      ),
    ].sort((a, b) => a - b);
    sources.push({
      rang,
      source: premier.docSource,
      titre: premier.docTitle,
      langue: premier.docLang,
      pages,
      similarite:
        Math.round(Math.max(...extraits.map((e) => e.similarity)) * 100) / 100,
    });
    const corps = extraits
      .map((e) => (e.page !== null ? `p. ${e.page} : ${e.content}` : e.content))
      .join("\n\n");
    blocs.push(
      `[${rang}] (${premier.docSource}, ${premier.docTitle}, ${premier.docLang})\n${corps}`,
    );
  });

  return { texte: blocs.join("\n\n---\n\n"), sources };
}

/** Le bloc de contexte seul. Meme numerotation que preparerContexte. */
export function formatContext(chunks: RetrievedChunk[]): string {
  return preparerContexte(chunks).texte;
}

/** La liste des sources seule. Meme numerotation que preparerContexte. */
export function sourcesDe(chunks: RetrievedChunk[]): SourceConsultee[] {
  return preparerContexte(chunks).sources;
}

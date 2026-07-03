import "server-only";

// Retrieval top-k pgvector (L3-T3).
// Similarité cosinus sur rag_chunks (index HNSW créé en migration 0000),
// jointure rag_documents pour les citations, filtres optionnels langue/source.
// Import dynamique de @adama/db : DATABASE_URL n'est lu qu'à la requête,
// jamais à l'évaluation du module (build Vercel sans env safe).

import { and, asc, cosineDistance, eq, gt, sql } from "drizzle-orm";
import { embedQuery } from "./embeddings";

export type RetrievedChunk = {
  content: string;
  similarity: number;
  page: number | null;
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
};

export async function retrieveContext(
  question: string,
  options: RetrievalOptions = {},
): Promise<RetrievedChunk[]> {
  const { k = 6, lang, source, minSimilarity = 0.15 } = options;

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

  const rows = await db
    .select({
      content: ragChunks.content,
      similarity,
      metadata: ragChunks.metadata,
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
    .limit(k);

  return rows.map((row) => ({
    content: row.content,
    similarity: Number(row.similarity),
    page: typeof row.metadata.page === "number" ? row.metadata.page : null,
    docTitle: row.docTitle,
    docSource: row.docSource,
    docLang: row.docLang,
  }));
}

/**
 * Formate les chunks en bloc de contexte numéroté, injecté dans le prompt.
 * La numérotation [n] sert de clé de citation dans la réponse.
 */
export function formatContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, i) => {
      const page = chunk.page !== null ? `, p. ${chunk.page}` : "";
      return `[${i + 1}] (${chunk.docSource} — ${chunk.docTitle}${page}, ${chunk.docLang})\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}

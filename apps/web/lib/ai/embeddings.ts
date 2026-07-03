import "server-only";

// Embeddings de requête pour le retrieval RAG (L3-T3).
// Même modèle et mêmes dimensions que l'ingestion (packages/db/src/ingest.ts) :
// text-embedding-3-small tronqué à 1024 dim, aligné sur vector(1024) en base.
// Appel REST direct : pas de dépendance supplémentaire, clé jamais côté client.

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1024;

export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant côté serveur.");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Embeddings API ${res.status} : ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

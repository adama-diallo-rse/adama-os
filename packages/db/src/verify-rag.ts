// =====================================================================
// Verification du RAG, Adama OS (L3-T1)
// Garde-fou a passer AVANT toute demonstration d'adama.ai : il prouve que la
// base vectorielle repond, avec les bonnes sources et des scores exploitables.
//
// Lancement :
//   pnpm --filter @adama/db rag:verify
//   pnpm --filter @adama/db rag:verify -- "ma question" "ma seconde question"
//
// Sort en code 1 des qu'une seule question ne ramene aucune source, ou que la
// base est vide. Un agent muet doit faire echouer une commande, pas sourire.
// =====================================================================

import { config } from "dotenv";

// Charger .env AVANT tout acces a DATABASE_URL / OPENAI_API_KEY.
config({ path: ".env" });

import { asc, cosineDistance, eq, gt, sql } from "drizzle-orm";
import { ragChunks, ragDocuments } from "./schema";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1024; // aligne sur vector(1024) et sur ingest.ts
const K = 4;
const MIN_SIMILARITY = 0.15; // identique a apps/web/lib/ai/retrieval.ts

// Questions de reference. Elles couvrent les trois familles du corpus decrit
// dans corpus/README.md : la norme PME, le socle CSRD, et le profil.
const QUESTIONS_PAR_DEFAUT = [
  "Quelles entreprises sont concernees par le standard VSME ?",
  "Qu'est-ce que la double materialite selon les ESRS ?",
  "Quel est le parcours professionnel d'Adama Diallo ?",
];

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY manquant dans packages/db/.env");
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
  const embedding = json.data[0]?.embedding;
  if (!embedding) {
    throw new Error("Reponse embeddings vide.");
  }
  return embedding;
}

async function verify() {
  const questions =
    process.argv.slice(2).length > 0
      ? process.argv.slice(2)
      : QUESTIONS_PAR_DEFAUT;

  const { db } = await import("./client");

  // 1. La base contient-elle quelque chose ?
  const [compte] = await db
    .select({
      documents: sql<number>`(select count(*)::int from rag_documents)`,
      chunks: sql<number>`count(*)::int`,
    })
    .from(ragChunks);

  const documents = compte?.documents ?? 0;
  const chunks = compte?.chunks ?? 0;
  console.log(
    `→ Corpus en base : ${documents} document(s), ${chunks} chunk(s)`,
  );

  if (chunks === 0) {
    console.error(
      "✗ Base vectorielle vide. Ingerer le corpus avant toute demonstration :",
    );
    console.error(
      '  pnpm --filter @adama/db rag:ingest -- corpus/vsme.pdf --source VSME --lang fr --title "Standard VSME"',
    );
    process.exit(1);
  }

  // 2. Chaque question ramene-t-elle des sources ?
  let echecs = 0;
  for (const question of questions) {
    const embedding = await embedQuery(question);
    const distance = cosineDistance(ragChunks.embedding, embedding);
    const similarity = sql<number>`1 - (${distance})`;

    const rows = await db
      .select({
        similarity,
        title: ragDocuments.title,
        source: ragDocuments.source,
        metadata: ragChunks.metadata,
      })
      .from(ragChunks)
      .innerJoin(ragDocuments, eq(ragChunks.documentId, ragDocuments.id))
      .where(gt(similarity, MIN_SIMILARITY))
      .orderBy(asc(distance))
      .limit(K);

    console.log(`\n? ${question}`);
    if (rows.length === 0) {
      echecs += 1;
      console.error("  ✗ aucune source au-dessus du seuil");
      continue;
    }
    for (const row of rows) {
      const page =
        typeof row.metadata.page === "number"
          ? `, p. ${row.metadata.page}`
          : "";
      console.log(
        `  ✓ ${Number(row.similarity).toFixed(3)}  ${row.source} — ${row.title}${page}`,
      );
    }
  }

  if (echecs > 0) {
    console.error(
      `\n✗ Verification echouee : ${echecs} question(s) sans source. Le corpus ne couvre pas ce qui est promis a l'ecran.`,
    );
    process.exit(1);
  }

  console.log(
    "\n✓ Verification RAG passee : chaque question trouve ses sources.",
  );
  process.exit(0);
}

verify().catch((error) => {
  console.error(
    "✗ Verification impossible :",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});

// =====================================================================
// Ingestion RAG, Adama OS (L3-T1 + L3-T2)
// Pipeline : PDF/MD/TXT → extraction texte (unpdf, local, aucune donnée
// envoyée pour l'extraction) → chunking sémantique → embeddings OpenAI
// text-embedding-3-small (1024 dim) → rag_documents + rag_chunks.
//
// Lancement :
//   pnpm --filter @adama/db rag:ingest -- <fichier> --source ESRS --lang fr [--title "..."]
//
// Idempotent : ré-ingérer un document (même source + même titre) remplace
// l'ancien (suppression en cascade des chunks).
// =====================================================================

import { config } from "dotenv";

// Charger .env AVANT tout accès à DATABASE_URL / OPENAI_API_KEY.
config({ path: ".env" });

import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { and, eq } from "drizzle-orm";
import { ragChunks, ragDocuments } from "./schema";

// --- Paramètres du pipeline ------------------------------------------
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1024; // aligné sur vector(1024) en base
const EMBEDDING_BATCH_SIZE = 64; // textes par appel API
const CHUNK_TARGET_CHARS = 1100; // ~275 tokens, bon compromis retrieval
const CHUNK_OVERLAP_CHARS = 180; // continuité entre chunks
const INSERT_BATCH_SIZE = 100;

// --- CLI ---------------------------------------------------------------
type CliArgs = {
  filePath: string;
  source: string;
  lang: string;
  title: string;
};

function parseArgs(argv: string[]): CliArgs {
  const positional: string[] = [];
  const flags = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Valeur manquante pour ${arg}`);
      }
      flags.set(arg.slice(2), value);
      i += 1;
    } else {
      positional.push(arg);
    }
  }

  const filePath = positional[0];
  const source = flags.get("source");
  if (!filePath || !source) {
    throw new Error(
      'Usage : pnpm --filter @adama/db rag:ingest -- <fichier> --source <ESRS|VSME|CV|...> [--lang fr|en] [--title "..."]',
    );
  }

  return {
    filePath,
    source,
    lang: flags.get("lang") ?? "fr",
    title: flags.get("title") ?? basename(filePath, extname(filePath)),
  };
}

// --- Extraction --------------------------------------------------------
type PageText = { page: number; text: string };

async function extractPages(filePath: string): Promise<PageText[]> {
  const ext = extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);

  if (ext === ".pdf") {
    // unpdf : extraction 100 % locale (pdf.js), pas d'appel réseau.
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: false });
    return (text as string[])
      .map((pageText, i) => ({ page: i + 1, text: normalize(pageText) }))
      .filter((p) => p.text.length > 0);
  }

  if (ext === ".md" || ext === ".txt") {
    return [{ page: 1, text: normalize(buffer.toString("utf-8")) }];
  }

  throw new Error(`Format non géré : ${ext} (accepte .pdf, .md, .txt)`);
}

function normalize(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Chunking sémantique ------------------------------------------------
// Découpe par paragraphes, regroupés jusqu'à ~CHUNK_TARGET_CHARS, avec un
// chevauchement de fin de chunk pour préserver le contexte.
type Chunk = { content: string; page: number; index: number };

function chunkPages(pages: PageText[]): Chunk[] {
  const chunks: Chunk[] = [];
  let index = 0;

  for (const { page, text } of pages) {
    const paragraphs = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      // Un paragraphe isolé trop long (tableaux OCR...) est redécoupé par phrases.
      .flatMap((p) =>
        p.length > CHUNK_TARGET_CHARS * 1.5 ? splitBySentence(p) : [p],
      );

    let current = "";
    for (const paragraph of paragraphs) {
      if (
        current.length > 0 &&
        current.length + paragraph.length + 2 > CHUNK_TARGET_CHARS
      ) {
        chunks.push({ content: current, page, index });
        index += 1;
        current = overlapTail(current) + paragraph;
      } else {
        current = current.length > 0 ? `${current}\n\n${paragraph}` : paragraph;
      }
    }
    if (current.trim().length > 0) {
      chunks.push({ content: current.trim(), page, index });
      index += 1;
    }
  }

  // Les fragments trop courts n'apportent rien au retrieval.
  return chunks.filter((c) => c.content.length >= 80);
}

function splitBySentence(paragraph: string): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [paragraph];
  const parts: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > CHUNK_TARGET_CHARS && current) {
      parts.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

function overlapTail(text: string): string {
  if (text.length <= CHUNK_OVERLAP_CHARS) {
    return `${text}\n\n`;
  }
  const tail = text.slice(-CHUNK_OVERLAP_CHARS);
  const cut = tail.indexOf(" ");
  return `...${tail.slice(cut < 0 ? 0 : cut)}\n\n`;
}

// --- Embeddings OpenAI ---------------------------------------------------
async function embedBatch(texts: string[]): Promise<number[][]> {
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
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Embeddings API ${res.status} : ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  // L'API préserve l'ordre, on trie par sécurité.
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// --- Main ----------------------------------------------------------------
async function ingest() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`→ Ingestion RAG : ${args.filePath}`);
  console.log(`  source=${args.source} lang=${args.lang} titre="${args.title}"`);

  const pages = await extractPages(args.filePath);
  const totalChars = pages.reduce((n, p) => n + p.text.length, 0);
  console.log(`  extraction : ${pages.length} page(s), ${totalChars} caractères`);

  const chunks = chunkPages(pages);
  if (chunks.length === 0) {
    throw new Error("Aucun chunk produit (document vide ou illisible).");
  }
  console.log(`  chunking : ${chunks.length} chunk(s)`);

  // Embeddings par lots.
  const embeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    embeddings.push(...(await embedBatch(batch.map((c) => c.content))));
    console.log(
      `  embeddings : ${Math.min(i + EMBEDDING_BATCH_SIZE, chunks.length)}/${chunks.length}`,
    );
  }

  // Import dynamique : le client lit DATABASE_URL après le chargement du .env.
  const { db } = await import("./client");

  // Remplacement idempotent (même source + même titre).
  const existing = await db
    .select({ id: ragDocuments.id })
    .from(ragDocuments)
    .where(
      and(eq(ragDocuments.source, args.source), eq(ragDocuments.title, args.title)),
    );
  if (existing.length > 0) {
    await db.delete(ragDocuments).where(eq(ragDocuments.id, existing[0].id));
    console.log("  document existant remplacé (cascade sur les chunks)");
  }

  const [doc] = await db
    .insert(ragDocuments)
    .values({ source: args.source, title: args.title, lang: args.lang })
    .returning({ id: ragDocuments.id });

  for (let i = 0; i < chunks.length; i += INSERT_BATCH_SIZE) {
    const batch = chunks.slice(i, i + INSERT_BATCH_SIZE);
    await db.insert(ragChunks).values(
      batch.map((chunk, j) => ({
        documentId: doc.id,
        content: chunk.content,
        embedding: embeddings[i + j],
        metadata: { page: chunk.page, index: chunk.index },
      })),
    );
  }

  console.log(`✓ Ingestion terminée : ${chunks.length} chunks → document ${doc.id}`);
  process.exit(0);
}

ingest().catch((error) => {
  console.error("✗ Ingestion échouée :", error instanceof Error ? error.message : error);
  process.exit(1);
});

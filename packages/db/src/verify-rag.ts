// =====================================================================
// Verification du RAG, Adama OS (L3-T1, corrigee par C3-T3)
//
// Garde-fou a passer AVANT toute demonstration d'adama.ai. Jusqu'au 2
// septembre 2026, il validait du BRUIT : il verifiait qu'une question ramene
// au moins une source, jamais que cette source est pertinente. Le 31 aout,
// une question sur la double importance est passee au vert en ne ramenant
// que des morceaux du CV, a des scores de 0,38 a 0,42.
//
// Un seuil de presence n'est pas un seuil de pertinence. Avec
// text-embedding-3-small en 1024 dimensions, sur ce corpus :
//   au-dessus de 0,50   correspondance exploitable
//   entre 0,45 et 0,50  zone grise, avertissement
//   en-dessous de 0,45  bruit, echec
//
// Le seuil de 0,15 conserve dans apps/web/lib/ai/retrieval.ts n'est pas le
// meme objet : la, il ecarte les fragments manifestement hors sujet avant
// que le modele ne voie quoi que ce soit. Ici, il s'agit de dire si le corpus
// couvre reellement ce que l'ecran promet.
//
// Lancement :
//   pnpm --filter @adama/db rag:verify
//   pnpm --filter @adama/db rag:verify -- "ma question" "ma seconde question"
//
// Sortie : docs/rag-verify.json, lu par la matrice de sante (C3-T2) et par
// pnpm integrity (C12). Le fichier est ecrit meme en cas d'echec : un echec
// non enregistre disparait, et la matrice repasserait au vert toute seule.
// =====================================================================

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Charger .env AVANT tout acces a DATABASE_URL / OPENAI_API_KEY.
config({ path: ".env" });

import { asc, cosineDistance, eq, gt, sql } from "drizzle-orm";
import { ragChunks, ragDocuments } from "./schema";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1024; // aligne sur vector(1024) et sur ingest.ts
const K = 4;
/** Plancher de recuperation, identique a apps/web/lib/ai/retrieval.ts. */
const MIN_SIMILARITY = 0.15;
/** C3-T3, seuils de PERTINENCE. Voir la note en tete de fichier. */
const SEUIL_OK = 0.5;
const SEUIL_ECHEC = 0.45;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const RAPPORT = join(ROOT, "docs/rag-verify.json");

// Questions de reference. Elles couvrent les trois familles du corpus decrit
// dans corpus/README.md : la norme PME, le socle CSRD, et le profil.
//
// La deuxieme a ete corrigee le 2 septembre 2026. Le texte francais officiel
// des ESRS ne dit JAMAIS « double materialite » : il dit « double
// importance », 22 occurrences dans le reglement delegue 2023/2772. Une
// question de controle qui emploie un terme absent du corpus mesure la
// tolerance du moteur, pas la couverture du corpus.
const QUESTIONS_PAR_DEFAUT = [
  "Quelles entreprises sont concernees par le standard VSME ?",
  "Qu'est-ce que la double importance selon les ESRS ?",
  "Quel est le parcours professionnel d'Adama Diallo ?",
];

type Resultat = {
  question: string;
  best: number | null;
  verdict: "ok" | "avertissement" | "echec";
  source: string | null;
  title: string | null;
};

async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-...") {
    throw new Error(
      "OPENAI_API_KEY manquant ou factice dans packages/db/.env. La verification ne peut pas etre faite, et elle ne sera pas simulee.",
    );
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

/** Verdict d'une question a partir de son MEILLEUR score. */
function verdictDe(best: number | null): Resultat["verdict"] {
  if (best === null || best < SEUIL_ECHEC) {
    return "echec";
  }
  return best >= SEUIL_OK ? "ok" : "avertissement";
}

/**
 * Ecrit le rapport machine. Toujours, y compris en cas d'echec.
 * `documents` et `chunks` a null decrivent une verification qui n'a meme pas
 * pu compter le corpus.
 */
function ecrireRapport(
  resultats: Resultat[],
  documents: number | null,
  chunks: number | null,
): void {
  const verdict: "ok" | "avertissement" | "echec" = resultats.some(
    (r) => r.verdict === "echec",
  )
    ? "echec"
    : resultats.some((r) => r.verdict === "avertissement")
      ? "avertissement"
      : "ok";

  const contenu = {
    $comment: [
      "C3-T3, resultat de la derniere verification de pertinence documentaire.",
      "Ecrit par `pnpm --filter @adama/db rag:verify`, jamais a la main.",
      "executed_at a null signifie que la verification n'a jamais tourne : la",
      "matrice de sante affiche alors NON MESURE, et surtout pas un vert.",
    ],
    schema_version: 1,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    seuil_ok: SEUIL_OK,
    seuil_echec: SEUIL_ECHEC,
    executed_at: new Date().toISOString(),
    verdict: resultats.length > 0 ? verdict : null,
    documents,
    chunks,
    questions: resultats,
  };
  writeFileSync(RAPPORT, `${JSON.stringify(contenu, null, 2)}\n`, "utf8");
  console.log("\n→ Rapport ecrit : docs/rag-verify.json");
}

async function verify(): Promise<number> {
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
  console.log(
    `→ Seuils de pertinence : echec sous ${SEUIL_ECHEC}, reussite a partir de ${SEUIL_OK}`,
  );

  if (chunks === 0) {
    console.error(
      "✗ Base vectorielle vide. Ingerer le corpus avant toute demonstration :",
    );
    console.error(
      '  pnpm --filter @adama/db rag:ingest -- corpus/vsme-standard.pdf --source VSME --lang fr --title "Standard VSME"',
    );
    ecrireRapport([], documents, chunks);
    return 1;
  }

  // 2. Chaque question ramene-t-elle une source PERTINENTE ?
  const resultats: Resultat[] = [];
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

    const meilleur = rows[0];
    const best = meilleur ? Number(meilleur.similarity) : null;
    const verdict = verdictDe(best);
    resultats.push({
      question,
      best,
      verdict,
      source: meilleur?.source ?? null,
      title: meilleur?.title ?? null,
    });

    console.log(`\n? ${question}`);
    if (rows.length === 0) {
      console.error("  ✗ aucune source au-dessus du plancher de recuperation");
      continue;
    }
    for (const row of rows) {
      const page =
        typeof row.metadata.page === "number"
          ? `, p. ${row.metadata.page}`
          : "";
      console.log(
        `  · ${Number(row.similarity).toFixed(3)}  ${row.source}, ${row.title}${page}`,
      );
    }
    const score = (best ?? 0).toFixed(3);
    if (verdict === "echec") {
      console.error(
        `  ✗ meilleur score ${score}, sous le seuil d'echec ${SEUIL_ECHEC} : c'est du bruit, pas une source.`,
      );
    } else if (verdict === "avertissement") {
      console.warn(
        `  ! meilleur score ${score}, entre ${SEUIL_ECHEC} et ${SEUIL_OK} : zone grise, le corpus couvre mal ce sujet.`,
      );
    } else {
      console.log(`  ✓ meilleur score ${score}, au-dessus de ${SEUIL_OK}.`);
    }
  }

  ecrireRapport(resultats, documents, chunks);

  const echecs = resultats.filter((r) => r.verdict === "echec").length;
  const avertissements = resultats.filter(
    (r) => r.verdict === "avertissement",
  ).length;

  if (echecs > 0) {
    console.error(
      `\n✗ Verification echouee : ${echecs} question(s) sous le seuil de pertinence. Le corpus ne couvre pas ce qui est promis a l'ecran.`,
    );
    return 1;
  }
  if (avertissements > 0) {
    console.warn(
      `\n! Verification passee avec ${avertissements} avertissement(s). Le corpus repond, mal.`,
    );
    return 0;
  }
  console.log(
    "\n✓ Verification RAG passee : chaque question trouve une source pertinente.",
  );
  return 0;
}

// Fermeture propre de la connexion AVANT de sortir. Sans elle, `process.exit`
// laisse une poignee libuv ouverte : sous Windows, cela produit une assertion
// et un code de sortie 3221226505 au lieu de 1, ce qui rend le script
// inutilisable dans un enchainement.
async function fermer(): Promise<void> {
  try {
    const { closeDb } = await import("./client");
    await closeDb();
  } catch {
    // Le client n'a jamais ete ouvert : rien a fermer.
  }
}

verify()
  .catch((error) => {
    console.error(
      "✗ Verification impossible :",
      error instanceof Error ? error.message : error,
    );
    return 1;
  })
  .then(async (code) => {
    await fermer();
    process.exit(code);
  });

// =====================================================================
// C10-T6, les reglages de la recherche documentaire, en un seul endroit.
//
// Ces quatre valeurs etaient jusqu'au 2 septembre 2026 ecrites a trois
// endroits : le modele et la dimension dans lib/ai/embeddings.ts et dans
// packages/db/src/ingest.ts, le plancher de similarite dans
// lib/ai/retrieval.ts, et le nombre de fragments dans la route de
// l'assistant. La page technique devait donc les RECOPIER pour les afficher,
// et une recopie qui decrit un reglage finit toujours par mentir sur lui.
//
// Module pur, sans acces serveur : il est lisible par une page, par un test
// et par la matrice de sante sans rien embarquer.
//
// Attention, la dimension n'est pas un reglage libre : elle est figee dans le
// schema (vector(1024)) et dans l'index HNSW. La changer ici sans migration
// rend la recherche silencieusement fausse.
// =====================================================================

/** Modele d'embedding, identique a l'ingestion et a la recherche. */
export const EMBEDDING_MODEL = "text-embedding-3-small";

/** Dimension des vecteurs. Figee dans le schema et dans l'index. */
export const EMBEDDING_DIMENSIONS = 1024;

/**
 * Plancher de recuperation. Ecarte les fragments manifestement hors sujet
 * avant que le modele ne voie quoi que ce soit. Ce n'est PAS un seuil de
 * pertinence : celui-la vit dans packages/db/src/verify-rag.ts, a 0,50, et
 * il sert a dire si le corpus couvre ce que l'ecran promet.
 */
export const RETRIEVAL_MIN_SIMILARITY = 0.15;

/** Nombre de fragments passes au modele pour une reponse. */
export const RETRIEVAL_K = 6;

/** Fragments maximum retenus par document, pour ne pas citer un seul texte. */
export const RETRIEVAL_MAX_PAR_DOCUMENT = 3;

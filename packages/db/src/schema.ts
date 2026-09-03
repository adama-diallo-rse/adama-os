// =====================================================================
// ADAMA OS, L1 Données, Schéma Drizzle (source de vérité typée)
// Dashboard fondateur : metrics, decisions, trajectory, analytics du groupe,
// capture de leads recruteur, et corpus RAG d'adama.ai. Les produits STRATA
// (audit, formations, paiements) vivent dans leurs propres repos et ne sont
// PAS modelises ici. Les index (dont l'index vectoriel HNSW) sont geres dans
// le SQL de migration, pas ici, pour rester sûr et lisible.
// =====================================================================

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// --- Types énumérés --------------------------------------------------
export const trajectoryStatus = pgEnum("trajectory_status", [
  "now",
  "next",
  "later",
  // C1-T8, ajoutee par la migration 0003. Une entree dont l'echeance est
  // passee ne peut plus rester "now" : soit elle bascule ici, soit elle
  // remonte comme incoherence. Une roadmap perimee est une donnee fausse
  // comme une autre.
  "done",
]);

export const trajectoryType = pgEnum("trajectory_type", [
  "feature",
  "expansion",
  "risk",
]);

// L1-T9. Etat reel d'un produit du groupe. Volontairement sans date : une
// date de disponibilite non engagee ailleurs n'a rien a faire en base.
export const ecosystemStatus = pgEnum("ecosystem_status", [
  "live",
  "building",
  "planned",
]);

// L1, dette de schema resorbee le 31 aout 2026. Le type Postgres cree par
// 0000_init.sql vaut ('recruiter', 'audit', 'newsletter') : Drizzle n'en
// declarait qu'une valeur, donc `drizzle-kit generate` proposait de recreer
// le type a chaque passage. On aligne dans le sens non destructif, Drizzle
// sur SQL : Postgres ne sait pas retirer une etiquette d'un enum sans
// recreer le type et reecrire la colonne.
// Regle applicative : seul "recruiter" est insere par le cockpit. Les deux
// autres etiquettes sont un heritage, elles ne doivent plus etre utilisees.
export const leadSource = pgEnum("lead_source", [
  "recruiter",
  "audit",
  "newsletter",
]);

// C1-T1, la classe de la donnee. Trois valeurs seulement, stockees en base.
// Les etats "absent" et "stale" ne sont PAS stockes : ils se derivent a la
// lecture, l'un de l'absence de valeur, l'autre de l'age du releve. Les figer
// en base reviendrait a garder une deduction qui doit se refaire a chaque
// affichage. Voir apps/web/lib/proof/types.ts, resolveClaimState.
export const dataClass = pgEnum("data_class", ["real", "historical", "demo"]);

// C1-T7, nature d'un echec de sonde L9. Une valeur 0 ecrite parce que le
// produit a repondu un etat non sain et une absence due a un delai depasse ne
// se ressemblent plus, ni en base ni a l'ecran.
export const probeFailureKind = pgEnum("probe_failure_kind", [
  "produit_non_sain",
  "delai_depasse",
  "erreur_reseau",
  "reponse_illisible",
]);

// --- system_metrics --------------------------------------------------
// Variables temps réel (compte à rebours, lean bulk, deep work...).
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  valueNum: doublePrecision("value_num"),
  valueText: text("value_text"),
  unit: text("unit"),
  // C1-T1, provenance. Ces valeurs sont saisies a la main depuis /checkin :
  // c'est une provenance comme une autre, et elle merite d'etre ecrite.
  dataClass: dataClass("data_class").notNull(),
  source: text("source"),
  method: text("method"),
  maxAgeSeconds: integer("max_age_seconds"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// C6, format ADR. Quatre types enumeres, ajoutes par la migration 0005.
// Un ADR au statut "remplace" n'est jamais supprime : il reste en ligne et
// pointe vers celui qui le remplace. On ne reecrit pas l'histoire, on la date.
export const adrStatus = pgEnum("adr_status", [
  "propose",
  "accepte",
  "remplace",
  "abandonne",
]);

export const adrScope = pgEnum("adr_scope", [
  "adama-os",
  "esg-optimizer",
  "strata-scope",
  "groupe",
]);

export const adrImpact = pgEnum("adr_impact", [
  "architecture",
  "conformite",
  "cout",
  "produit",
  "securite",
]);

export const adrReversibility = pgEnum("adr_reversibility", [
  "forte",
  "moyenne",
  "faible",
]);

// --- decisions_log ---------------------------------------------------
// Registre ADR public (Couche B), passe au format ADR complet par la
// migration 0005 et augmente des six champs narratifs de revirement par la
// migration 0006.
//
// Regle dure de la couche C6, tenue par la lecture et pas par l'affichage :
// un ADR dont reviewed_by_adama est faux ne se publie pas. Les affirmations
// d'un ADR portent sur le travail d'Adama, elles ne se publient pas sans
// qu'il les ait relues.
export const decisionsLog = pgTable("decisions_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  date: date("date")
    .notNull()
    .default(sql`current_date`),
  category: text("category").notNull(),
  reasoning: text("reasoning").notNull(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  isPublished: boolean("is_published").notNull().default(false),

  // --- C6, format ADR (migration 0005) ------------------------------
  /** Identifiant stable et cite, "DEC-014". Null sur les lignes anterieures
   *  au format ADR : la migration 0005 les backfille par titre. */
  adrId: text("adr_id").unique(),
  status: adrStatus("status"),
  scope: adrScope("scope"),
  impact: adrImpact("impact"),
  reversibility: adrReversibility("reversibility"),
  /** adr_id de la decision que celle-ci remplace. */
  supersedes: text("supersedes"),
  /** Le probleme reel, en trois phrases. Tableau de chaines. */
  context: jsonb("context").$type<string[]>(),
  /** Options serieusement envisagees, avec ce qui les qualifie ou les
   *  disqualifie. Tableau de { option, verdict, motif }. */
  options: jsonb("options").$type<Record<string, unknown>[]>(),
  decision: text("decision"),
  /** Les trois axes du raisonnement : technique, reglementaire, economique.
   *  La colonne reasoning, elle, garde la version d'un trait servie a la
   *  Couche B du cockpit, qui n'affiche que ce champ. */
  rationale: jsonb("rationale").$type<Record<string, string>>(),
  /** Ce qu'on perd, nomme sans etre minimise. */
  tradeoff: text("tradeoff"),
  /** Ce qui a ete OBSERVE dans le code, pas ce qui etait espere. */
  consequence: text("consequence"),
  /** Fichiers, commits, routes ou absences que la decision a produits. */
  evidenceRefs: jsonb("evidence_refs").$type<Record<string, unknown>[]>(),
  /** Vrai quand l'ADR a ete reconstruit a posteriori depuis le depot. La
   *  page l'affiche : un ADR reconstruit ne pretend pas decrire ce qui a
   *  ete envisage a l'epoque. */
  reconstructed: boolean("reconstructed").notNull().default(false),
  /** Ce que seul Adama peut trancher. Tableau de chaines. */
  openQuestions: jsonb("open_questions").$type<string[]>(),
  /** C6-T8. Un ADR non relu ne se publie pas. Verrouille par test. */
  reviewedByAdama: boolean("reviewed_by_adama").notNull().default(false),

  // --- C7, le revirement (migration 0006) ---------------------------
  /** Les six champs narratifs, portes par l'ADR au statut "remplace" :
   *  croyais, invalide, fait, cout, coutEstime, regle. Null sur un ADR qui
   *  n'est pas un revirement. Le champ cout est obligatoire des que l'objet
   *  existe : sans lui, un revirement ressemble a de l'amelioration
   *  continue et non a une correction. */
  revirement: jsonb("revirement").$type<Record<string, unknown>>(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- trajectory ------------------------------------------------------
// Roadmap Now / Next / Later (Couche C).
export const trajectory = pgTable("trajectory", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  status: trajectoryStatus("status").notNull().default("next"),
  type: trajectoryType("type").notNull().default("feature"),
  eta: text("eta"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- ecosystem_analytics ---------------------------------------------
// L1-T10. Métriques produit du groupe (Open Metrics), remontées par les
// produits eux-mêmes ou importées par les passerelles de la couche L9.
// Ancien nom : strata_analytics. Une vue de compatibilité porte encore ce nom
// en lecture jusqu'au 30 novembre 2026 (migration 0002).
//
// Provenance obligatoire : une métrique importée porte son produit
// (productSlug), la source qui l'a servie (source) et l'instant du relevé
// (fetchedAt). Sans ces champs, l'interface ne l'affiche pas. Insertion
// uniquement, jamais d'écrasement : l'historique est la matière de la courbe.
export const ecosystemAnalytics = pgTable("ecosystem_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metric: text("metric").notNull(),
  value: doublePrecision("value").notNull(),
  period: text("period"),
  /** Nom de l'API ou du relevé qui a produit la valeur. */
  source: text("source"),
  /** Division du groupe (STRATA, IROKO, Cockpit). */
  division: text("division"),
  /** Produit d'origine, clé étrangère vers ecosystem_products.slug. */
  productSlug: text("product_slug"),
  /** Instant du relevé côté produit, distinct de la date d'insertion. */
  fetchedAt: timestamp("fetched_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  /** C1-T1. Classe de la donnée. Sans valeur par défaut : classer est une
   *  décision, pas un remplissage. La contrainte SQL de la migration 0003
   *  exige source et method pour "real", published_at pour "historical". */
  dataClass: dataClass("data_class").notNull(),
  /** Comment la valeur a été obtenue, en une phrase lisible. */
  method: text("method"),
  /** Durée de validité. Au delà, la valeur reste lisible mais porte la
   *  mention PÉRIMÉE. Null : la valeur ne périme pas. */
  maxAgeSeconds: integer("max_age_seconds"),
  /** Date de publication d'une valeur historique. */
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- ecosystem_probes -------------------------------------------------
// C1-T7. Une ligne par tentative de sonde L9, avec la nature de l'échec.
// Sans cette table, le cockpit ne pouvait pas distinguer une panne du produit
// d'une panne de sa propre sortie réseau : les deux se lisaient comme une
// absence. C'était un angle mort, il est maintenant nommé et mesuré.
export const ecosystemProbes = pgTable("ecosystem_probes", {
  id: uuid("id").primaryKey().defaultRandom(),
  productSlug: text("product_slug"),
  division: text("division"),
  /** Route interrogée, ex. "GET /health". */
  source: text("source").notNull(),
  status: text("status").notNull(),
  /** Null quand la sonde a réussi ou n'était pas configurée. */
  failureKind: probeFailureKind("failure_kind"),
  httpStatus: integer("http_status"),
  latencyMs: integer("latency_ms"),
  /** Extrait technique court. Jamais un corps de réponse complet, jamais un
   *  en-tête : une sonde ne doit pas devenir un journal de fuite. Colonne
   *  révoquée pour la clé anonyme (migration 0003). */
  errorExcerpt: text("error_excerpt"),
  observedAt: timestamp("observed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- ecosystem_products ----------------------------------------------
// L1-T9, registre des produits du groupe. Source de verite unique du hub
// ecosysteme (L6-T13), de la Couche D en vue groupe (L4-T14) et de la liste
// des depots agreges par le feed Shipped (L5-T2).
// Regle de tenue : une ligne ici decrit un produit qui existe. Pas de produit
// d'intention, pas de date promise.
export const ecosystemProducts = pgTable("ecosystem_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // Division du groupe : STRATA, IROKO, Cockpit.
  division: text("division").notNull(),
  // Positionnement lisible ("Audit et conformite CSRD").
  pillar: text("pillar"),
  description: text("description"),
  status: ecosystemStatus("status").notNull().default("building"),
  // URL publique. NULL tant que le produit n'est pas ouvert : c'est cette
  // colonne, et elle seule, qui autorise un lien cliquable dans l'interface.
  url: text("url"),
  // "owner/repo" pour le feed Shipped. Non lisible par la cle anon (voir la
  // migration 0001, revoke au niveau colonne).
  repoFullName: text("repo_full_name"),
  // Affichage dans le hub public. Le cockpit lui-meme est suivi pour le feed
  // mais n'est pas un produit de la grille.
  isPublic: boolean("is_public").notNull().default(true),
  position: doublePrecision("position").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- leads -----------------------------------------------------------
// Capture de leads recruteur (modal "Recruter l'Architecte").
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  source: leadSource("source").notNull(),
  context: jsonb("context")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- proof_claims / proof_evidence -----------------------------------
// C2. La discipline de preuve de STRATA appliquee au portfolio lui-meme.
// Une affirmation publiee est un enregistrement, pas une phrase dans du JSX.
// Regle dure : une affirmation sans preuve NE SE REND PAS. Pas de version
// grisee, pas de degradation : elle est absente de la page.
export const proofSubjectType = pgEnum("proof_subject_type", [
  "produit",
  "projet",
  "competence",
  "experience",
  "systeme",
  "metrique",
]);

export const proofVisibility = pgEnum("proof_visibility", [
  "public",
  "technique",
  "interne",
]);

export const proofEvidenceKind = pgEnum("proof_evidence_kind", [
  "api",
  "depot",
  "commit",
  "deploiement",
  "base",
  "document",
  "attestation",
  "capture",
]);

export const proofVerifiableBy = pgEnum("proof_verifiable_by", [
  "visiteur",
  "adama",
  "tiers",
]);

export const proofClaims = pgTable("proof_claims", {
  /** Identifiant stable, jamais reattribue : il finit dans /verifier/<id>,
   *  et une URL citee dans un CV doit rester valide des annees. */
  id: text("id").primaryKey(),
  statement: text("statement").notNull(),
  subjectType: proofSubjectType("subject_type").notNull(),
  subjectRef: text("subject_ref"),
  dataClass: dataClass("data_class").notNull(),
  maxAgeSeconds: integer("max_age_seconds"),
  visibility: proofVisibility("visibility").notNull().default("interne"),
  position: doublePrecision("position").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const proofEvidence = pgTable("proof_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  claimId: text("claim_id")
    .notNull()
    .references(() => proofClaims.id, { onDelete: "cascade" }),
  kind: proofEvidenceKind("kind").notNull(),
  source: text("source").notNull(),
  locator: text("locator"),
  method: text("method").notNull(),
  /** Nul tant que l'observation n'a pas eu lieu. C'est le coeur de la
   *  doctrine : une preuve declaree mais jamais observee s'affiche comme
   *  absente, elle ne se remplit pas avec la date du jour. */
  observedAt: timestamp("observed_at", { withTimezone: true }),
  observedResult: text("observed_result"),
  verifiableBy: proofVerifiableBy("verifiable_by")
    .notNull()
    .default("visiteur"),
  /** C2-T6. http_status, github_commit ou db_count. Nul : preuve non
   *  reevaluable, elle garde sa date d'origine et perime a l'echeance. */
  refreshKind: text("refresh_kind"),
  position: doublePrecision("position").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- rag_documents ---------------------------------------------------
// Documents source du RAG (ESRS, VSME, CV...).
export const ragDocuments = pgTable("rag_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  title: text("title").notNull(),
  lang: text("lang").notNull().default("fr"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- rag_chunks ------------------------------------------------------
// Chunks vectorisés (OpenAI text-embedding-3-small tronqué à 1024 dim).
export const ragChunks = pgTable("rag_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => ragDocuments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1024 }),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- Relations -------------------------------------------------------
export const proofClaimsRelations = relations(proofClaims, ({ many }) => ({
  evidence: many(proofEvidence),
}));

export const proofEvidenceRelations = relations(proofEvidence, ({ one }) => ({
  claim: one(proofClaims, {
    fields: [proofEvidence.claimId],
    references: [proofClaims.id],
  }),
}));

export const ragDocumentsRelations = relations(ragDocuments, ({ many }) => ({
  chunks: many(ragChunks),
}));

export const ragChunksRelations = relations(ragChunks, ({ one }) => ({
  document: one(ragDocuments, {
    fields: [ragChunks.documentId],
    references: [ragDocuments.id],
  }),
}));

// --- Types inférés (lecture / insertion) -----------------------------
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type NewSystemMetric = typeof systemMetrics.$inferInsert;
export type Decision = typeof decisionsLog.$inferSelect;
export type NewDecision = typeof decisionsLog.$inferInsert;
export type TrajectoryItem = typeof trajectory.$inferSelect;
export type NewTrajectoryItem = typeof trajectory.$inferInsert;
export type EcosystemAnalytic = typeof ecosystemAnalytics.$inferSelect;
export type NewEcosystemAnalytic = typeof ecosystemAnalytics.$inferInsert;
export type EcosystemProbe = typeof ecosystemProbes.$inferSelect;
export type NewEcosystemProbe = typeof ecosystemProbes.$inferInsert;
export type EcosystemProduct = typeof ecosystemProducts.$inferSelect;
export type NewEcosystemProduct = typeof ecosystemProducts.$inferInsert;
export type ProofClaim = typeof proofClaims.$inferSelect;
export type NewProofClaim = typeof proofClaims.$inferInsert;
export type ProofEvidence = typeof proofEvidence.$inferSelect;
export type NewProofEvidence = typeof proofEvidence.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;
export type RagChunk = typeof ragChunks.$inferSelect;
export type NewRagChunk = typeof ragChunks.$inferInsert;

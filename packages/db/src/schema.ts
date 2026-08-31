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

// --- system_metrics --------------------------------------------------
// Variables temps réel (compte à rebours, lean bulk, deep work...).
export const systemMetrics = pgTable("system_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  valueNum: doublePrecision("value_num"),
  valueText: text("value_text"),
  unit: text("unit"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- decisions_log ---------------------------------------------------
// Registre ADR public (Couche B).
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
  createdAt: timestamp("created_at", { withTimezone: true })
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
export type EcosystemProduct = typeof ecosystemProducts.$inferSelect;
export type NewEcosystemProduct = typeof ecosystemProducts.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;
export type RagChunk = typeof ragChunks.$inferSelect;
export type NewRagChunk = typeof ragChunks.$inferInsert;

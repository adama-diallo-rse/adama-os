// =====================================================================
// ADAMA OS, L1 Données, Schéma Drizzle (source de vérité typée)
// 8 tables du blueprint (§4). Correspond 1:1 à migrations/0000_init.sql.
// Les index (dont l'index vectoriel HNSW) sont gérés dans le SQL de
// migration, pas ici, pour rester sûr et lisible.
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

export const leadSource = pgEnum("lead_source", [
  "recruiter",
  "audit",
  "newsletter",
]);

export const auditStatus = pgEnum("audit_status", [
  "pending",
  "processing",
  "done",
  "failed",
]);

// Origine d'un accès formation : achat Polar, essai gratuit, octroi manuel.
export const entitlementSource = pgEnum("entitlement_source", [
  "polar",
  "trial",
  "manual",
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

// --- strata_analytics ------------------------------------------------
// Métriques produit STRATA (Open Metrics), remontées par le moteur.
export const strataAnalytics = pgTable("strata_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  metric: text("metric").notNull(),
  value: doublePrecision("value").notNull(),
  period: text("period"),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- leads -----------------------------------------------------------
// Capture de leads (recruteur / audit / newsletter).
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

// --- audit_requests --------------------------------------------------
// Demandes d'Audit Express (lead magnet → moteur FastAPI).
export const auditRequests = pgTable("audit_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  company: text("company").notNull(),
  sector: text("sector"),
  answers: jsonb("answers")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  result: jsonb("result").$type<Record<string, unknown>>(),
  status: auditStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// --- course_entitlements ---------------------------------------------
// L5-T8 — Droit d'accès à une formation /learn. Une ligne = un email a débloqué
// un niveau. Alimentée par le webhook Polar (L6-T6), l'essai gratuit (L6-T9) ou
// un octroi manuel. La page /learn/acces vérifie l'existence d'une ligne pour
// (email, level) et pose le cookie signé. Unicité (email, level) pour rester
// idempotent face aux relances de webhook.
export const courseEntitlements = pgTable("course_entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  level: doublePrecision("level").notNull(),
  source: entitlementSource("source").notNull().default("polar"),
  reference: text("reference"),
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

export const leadsRelations = relations(leads, ({ many }) => ({
  auditRequests: many(auditRequests),
}));

export const auditRequestsRelations = relations(auditRequests, ({ one }) => ({
  lead: one(leads, {
    fields: [auditRequests.leadId],
    references: [leads.id],
  }),
}));

// --- Types inférés (lecture / insertion) -----------------------------
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type NewSystemMetric = typeof systemMetrics.$inferInsert;
export type Decision = typeof decisionsLog.$inferSelect;
export type NewDecision = typeof decisionsLog.$inferInsert;
export type TrajectoryItem = typeof trajectory.$inferSelect;
export type NewTrajectoryItem = typeof trajectory.$inferInsert;
export type StrataAnalytic = typeof strataAnalytics.$inferSelect;
export type NewStrataAnalytic = typeof strataAnalytics.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type RagDocument = typeof ragDocuments.$inferSelect;
export type NewRagDocument = typeof ragDocuments.$inferInsert;
export type RagChunk = typeof ragChunks.$inferSelect;
export type NewRagChunk = typeof ragChunks.$inferInsert;
export type AuditRequest = typeof auditRequests.$inferSelect;
export type NewAuditRequest = typeof auditRequests.$inferInsert;
export type CourseEntitlement = typeof courseEntitlements.$inferSelect;
export type NewCourseEntitlement = typeof courseEntitlements.$inferInsert;

// =====================================================================
// Seed de démo, Adama OS (L1-T6)
// Lancement : pnpm --filter @adama/db db:seed
// Idempotent : les métriques sont "upsertées" par clé ; les décisions,
// la trajectoire et les analytics ne sont insérées que si la table est vide.
// =====================================================================

import { config } from "dotenv";

// Charger .env AVANT tout accès à DATABASE_URL.
config({ path: ".env" });

import { sql } from "drizzle-orm";
import {
  decisionsLog,
  strataAnalytics,
  systemMetrics,
  trajectory,
} from "./schema";

type Metric = {
  key: string;
  valueNum?: number | null;
  valueText?: string | null;
  unit?: string | null;
};

async function seed() {
  console.log("→ Seed Adama OS : démarrage");

  // Import dynamique : le client lit DATABASE_URL à l'évaluation, donc
  // après le chargement de .env ci-dessus.
  const { db } = await import("./client");

  // --- system_metrics : upsert par clé (toujours à jour) -------------
  const metrics: Metric[] = [
    { key: "system_status", valueText: "ONLINE - BUILDING MODE" },
    { key: "current_focus", valueText: "Déploiement ESG Optimizer v2" },
    { key: "internship_deadline", valueText: "2026-10-31", unit: "date" },
    { key: "lean_bulk_progress", valueNum: 72, unit: "%" },
    { key: "target_weight", valueNum: 80, unit: "kg" },
    { key: "energy_level", valueText: "Optimal" },
    { key: "deep_work_status", valueText: "Active" },
    { key: "social_media_status", valueText: "Locked" },
  ];

  for (const m of metrics) {
    await db
      .insert(systemMetrics)
      .values({
        key: m.key,
        valueNum: m.valueNum ?? null,
        valueText: m.valueText ?? null,
        unit: m.unit ?? null,
      })
      .onConflictDoUpdate({
        target: systemMetrics.key,
        set: {
          valueNum: m.valueNum ?? null,
          valueText: m.valueText ?? null,
          unit: m.unit ?? null,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`  ✓ system_metrics : ${metrics.length} clés à jour`);

  // --- decisions_log : 3 décisions (si table vide) -------------------
  const decisionsCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(decisionsLog);
  if ((decisionsCount[0]?.n ?? 0) === 0) {
    await db.insert(decisionsLog).values([
      {
        title: "Transition de Node.js vers FastAPI pour le moteur de calcul",
        date: "2026-06-24",
        category: "Technique",
        reasoning:
          "L'écosystème Python offre une scalabilité supérieure pour les algorithmes de calcul carbone (Scopes 1-2-3) et l'ingestion RAG. Next.js reste sur l'app et l'UI, FastAPI prend la science des données.",
        tags: ["backend", "python", "carbone"],
        isPublished: true,
      },
      {
        title: "Architecture RAG plutôt que Fine-Tuning",
        date: "2026-06-15",
        category: "Technique",
        reasoning:
          "Le RAG garantit zéro hallucination sur les textes de loi CSRD, réduit les coûts d'API d'environ 80% et permet une mise à jour instantanée quand un texte réglementaire change.",
        tags: ["ia", "rag", "couts"],
        isPublished: true,
      },
      {
        title: "Mistral plutôt que DeepSeek pour le LLM ESG",
        date: "2026-06-24",
        category: "Conformité",
        reasoning:
          "DeepSeek fait transiter les données par une infrastructure hors UE, injustifiable sous RGPD pour des clients CSRD. Mistral est basé en UE : la résidence des données devient un argument commercial.",
        tags: ["rgpd", "llm", "ue"],
        isPublished: true,
      },
    ]);
    console.log("  ✓ decisions_log : 3 décisions insérées");
  } else {
    console.log("  • decisions_log : déjà peuplée, ignorée");
  }

  // --- trajectory : Now / Next / Later (si table vide) ---------------
  const trajectoryCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(trajectory);
  if ((trajectoryCount[0]?.n ?? 0) === 0) {
    await db.insert(trajectory).values([
      {
        title: "Phase 0, Fondations (monorepo, données, design system)",
        status: "now",
        type: "feature",
        eta: "6 juillet 2026",
        notes: "Squelette en ligne, base migrée, auth fonctionnelle.",
      },
      {
        title: "Intégration du scoring OTI sur ESG Optimizer",
        status: "next",
        type: "feature",
        eta: "Phase 2",
      },
      {
        title: "Lancement de l'architecture pour le marché Afrique de l'Ouest",
        status: "later",
        type: "expansion",
        eta: "Septembre 2026",
      },
      {
        title: "Surcharge du scope technique",
        status: "now",
        type: "risk",
        notes:
          "Parade : finir chaque phase avant la suivante, 1 couche à la fois.",
      },
    ]);
    console.log("  ✓ trajectory : 4 entrées insérées");
  } else {
    console.log("  • trajectory : déjà peuplée, ignorée");
  }

  // --- strata_analytics : métriques de démo (si table vide) ----------
  const strataCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(strataAnalytics);
  if ((strataCount[0]?.n ?? 0) === 0) {
    await db.insert(strataAnalytics).values([
      { metric: "pme_analysees", value: 12, period: "2026-06", source: "demo" },
      { metric: "requetes_api", value: 1287, period: "2026-06", source: "demo" },
      { metric: "audits_lances", value: 4, period: "2026-06", source: "demo" },
    ]);
    console.log("  ✓ strata_analytics : 3 métriques insérées");
  } else {
    console.log("  • strata_analytics : déjà peuplée, ignorée");
  }

  console.log("→ Seed terminé.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Échec du seed :", err);
    process.exit(1);
  });

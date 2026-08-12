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
  ecosystemProducts,
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
    { key: "current_focus", valueText: "ESG Optimizer V5 - Sustainability OS" },
    { key: "internship_deadline", valueText: "2026-10-31", unit: "date" },
    { key: "current_weight", valueNum: 71, unit: "kg" },
    { key: "lean_bulk_progress", valueNum: 89, unit: "%" },
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

  // --- strata_analytics : métriques de démo -------------------------
  // Sous drapeau explicite. Ces trois valeurs sont inventées : les insérer
  // dans la base de production les ferait remonter sur /metrics et sur la
  // Couche D comme si elles étaient mesurées, ce qui annulerait le geste 3
  // de la vague 0. Règle : aucune métrique affichée sans source réelle.
  //   pnpm --filter @adama/db db:seed -- --demo
  const withDemoMetrics = process.argv.slice(2).includes("--demo");
  if (!withDemoMetrics) {
    console.log(
      "  • strata_analytics : ignorée (métriques de démo, relancer avec --demo pour les insérer)",
    );
  }
  const strataCount = withDemoMetrics
    ? await db.select({ n: sql<number>`count(*)::int` }).from(strataAnalytics)
    : [{ n: 1 }];
  if (withDemoMetrics && (strataCount[0]?.n ?? 0) === 0) {
    await db.insert(strataAnalytics).values([
      { metric: "pme_analysees", value: 12, period: "2026-06", source: "demo" },
      {
        metric: "requetes_api",
        value: 1287,
        period: "2026-06",
        source: "demo",
      },
      { metric: "audits_lances", value: 4, period: "2026-06", source: "demo" },
    ]);
    console.log("  ✓ strata_analytics : 3 métriques insérées");
  } else if (withDemoMetrics) {
    console.log("  • strata_analytics : déjà peuplée, ignorée");
  }

  // --- ecosystem_products : registre reel du groupe (L1-T9) ---------
  // Ce n'est PAS de la donnee de demo. Seuls les produits reellement
  // ouverts portent une URL et le statut "live" ; les autres restent en
  // construction, sans date. Reexecutable : conflit sur slug ignore.
  const products = [
    {
      slug: "esg-optimizer",
      name: "ESG Optimizer",
      division: "STRATA",
      pillar: "Audit et conformite CSRD",
      description:
        "Deposez vos documents, obtenez un scoring sur les 10 standards ESRS et un rapport structure.",
      status: "live" as const,
      url: "https://esg-optimizer.fr",
      repoFullName: "iroko-software-group/esg-optimizer",
      position: 10,
    },
    {
      slug: "strata-scope",
      name: "STRATA Scope",
      division: "STRATA",
      pillar: "Empreinte carbone",
      description:
        "Bilan carbone Scopes 1, 2 et 3 sur les facteurs officiels de la Base Empreinte ADEME. Restitution BEGES, CSRD, SBTi.",
      status: "live" as const,
      url: "https://scope.esg-optimizer.fr",
      repoFullName: "adama-diallo-rse/strata-scope",
      position: 20,
    },
    {
      slug: "strata-platform",
      name: "STRATA Platform",
      division: "STRATA",
      pillar: "Site corporate du groupe",
      description:
        "La vitrine de la suite STRATA et son socle d'authentification.",
      status: "building" as const,
      url: null,
      repoFullName: "iroko-software-group/strata-platform",
      position: 30,
    },
    {
      slug: "strata-foundation",
      name: "STRATA Foundation",
      division: "STRATA",
      pillar: "Point de depart ESG",
      description:
        "Un premier diagnostic de maturite durable, gratuit, pour se situer en dix minutes.",
      status: "building" as const,
      url: null,
      repoFullName: "iroko-software-group/strata-foundation",
      position: 40,
    },
    {
      slug: "strata-watch",
      name: "STRATA Watch",
      division: "STRATA",
      pillar: "Veille reglementaire",
      description:
        "Veille automatisee sur les sources officielles (EFRAG, AMF, JOUE), transformee en alertes utiles.",
      status: "building" as const,
      url: null,
      repoFullName: "iroko-software-group/strata-watch",
      position: 50,
    },
    {
      slug: "strata-academy",
      name: "STRATA Academy",
      division: "STRATA",
      pillar: "Formation a la durabilite",
      description:
        "Des parcours courts sur la CSRD, la VSME et le carbone, penses pour les equipes de PME.",
      status: "building" as const,
      url: null,
      repoFullName: "iroko-software-group/strata-esg-academy",
      position: 60,
    },
    {
      slug: "iroko-platform",
      name: "IROKO Platform",
      division: "IROKO",
      pillar: "Operating system des entreprises africaines",
      description: "Le socle de la branche Afrique du groupe.",
      status: "building" as const,
      url: null,
      repoFullName: "iroko-software-group/iroko-platform",
      position: 70,
    },
    {
      slug: "adama-os",
      name: "Adama OS",
      division: "Cockpit",
      pillar: "Cockpit du fondateur",
      description:
        "Ce tableau de bord. Suivi pour le feed Shipped, mais ce n'est pas un produit de la grille.",
      status: "building" as const,
      url: null,
      repoFullName: "adama-diallo-rse/adama-os",
      isPublic: false,
      position: 999,
    },
  ];
  const inserted = await db
    .insert(ecosystemProducts)
    .values(products)
    .onConflictDoNothing({ target: ecosystemProducts.slug })
    .returning({ slug: ecosystemProducts.slug });
  console.log(
    `  ✓ ecosystem_products : ${inserted.length} produit(s) insere(s), ${products.length - inserted.length} deja present(s)`,
  );

  console.log("→ Seed terminé.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Échec du seed :", err);
    process.exit(1);
  });

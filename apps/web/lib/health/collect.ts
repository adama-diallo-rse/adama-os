import "server-only";

// =====================================================================
// C3-T1, la collecte des observations.
//
// Seul endroit du module de sante qui lit quelque chose. Il ne juge rien :
// il observe, et il passe le resultat a criteria.ts, qui decide. Cette
// separation est ce qui rend la matrice testable sans base et rejouable par
// scripts/failure-drill.mjs.
//
// Deux artefacts machine sont lus par IMPORT et non par le systeme de
// fichiers : docs/rag-verify.json et docs/restauration.json. C'est un
// arbitrage assume. Une lecture de fichier a l'execution ne survit pas au
// tracage de fichiers d'un deploiement sans serveur, alors qu'un import est
// embarque et type. Consequence voulue : supprimer un de ces artefacts fait
// echouer la construction, au lieu de faire disparaitre une information en
// silence. Les deux fichiers portent un etat « jamais executee » explicite,
// c'est cet etat qui remplace l'absence de fichier.
// =====================================================================

import ragVerify from "../../../../docs/rag-verify.json";
import restauration from "../../../../docs/restauration.json";
import { createPublicClient } from "../supabase/public";
import { createServiceClient } from "../supabase/service";
import { fetchShippedFeed } from "../github";
import { fetchEcosystemHealth } from "../ecosystem";
import type { HealthObservations, RagVerification } from "./criteria";
import { buildCapabilities } from "./criteria";
import { toCapabilityHealth, type HealthMatrix } from "./types";

/** Age au dela duquel un test de restauration ne dit plus rien, en jours. */
export const FRAICHEUR_RESTAURATION_JOURS = 180;

type RagVerifyFile = {
  executed_at: string | null;
  verdict: "ok" | "avertissement" | "echec" | null;
  seuil_ok: number;
  seuil_echec: number;
  questions: { question: string; best: number | null }[];
};

type RestaurationFile = {
  executed_at: string | null;
  result: "reussi" | "echoue" | "partiel" | null;
  scope: string;
  tables: { name: string; state?: string }[];
  tables_exercees?: number;
};

/** Verification de pertinence documentaire, telle qu'elle a ete enregistree. */
export function lireVerificationRag(): RagVerification | null {
  const f = ragVerify as RagVerifyFile;
  if (!f.executed_at || !f.verdict) {
    return null;
  }
  const scores = f.questions
    .map((q) => q.best)
    .filter((s): s is number => typeof s === "number");
  return {
    executedAt: f.executed_at,
    verdict: f.verdict,
    best: scores.length > 0 ? Math.max(...scores) : 0,
    worst: scores.length > 0 ? Math.min(...scores) : 0,
    seuilOk: f.seuil_ok,
    seuilEchec: f.seuil_echec,
  };
}

/** Dernier test de restauration enregistre. Null s'il n'y en a jamais eu. */
export function lireRestauration() {
  const f = restauration as RestaurationFile;
  if (!f.executed_at || !f.result) {
    return null;
  }
  return {
    executedAt: f.executed_at,
    result: f.result,
    scope: f.scope,
    tables: f.tables.length,
    exercees:
      f.tables_exercees ??
      f.tables.filter((t) => t.state !== "non_exerce").length,
  };
}

/**
 * Region de traitement de la mesure d'audience, deduite de l'hote configure.
 *
 * Deduite et non affirmee : c'est l'hote qui decide, pas le commentaire du
 * code. C'est precisement la contradiction que la couche C11 doit trancher,
 * et tant qu'elle dure, elle s'affiche.
 */
export function regionAnalytique(
  host: string | undefined,
  key: string | undefined,
): "UE" | "hors UE" | "inconnue" {
  if (!key?.trim()) {
    return "inconnue";
  }
  const h = (host ?? "https://eu.i.posthog.com").trim().toLowerCase();
  if (h.includes("eu.i.posthog.com") || h.includes("eu.posthog.com")) {
    return "UE";
  }
  return "hors UE";
}

/** Lecture de contrôle de la base, et présence des colonnes de provenance. */
async function observerBase(): Promise<HealthObservations["base"]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return { configured: false, readOk: null, dataClassReady: null };
  }
  const [lecture, classes] = await Promise.all([
    supabase.from("system_metrics").select("key").limit(1),
    supabase.from("ecosystem_analytics").select("data_class").limit(1),
  ]);
  return {
    configured: true,
    readOk: !lecture.error,
    dataClassReady: classes.error ? false : true,
  };
}

/** Contenu réel du corpus documentaire. Comptes seuls, aucun extrait. */
async function observerCorpus(): Promise<{
  documents: number | null;
  chunks: number | null;
  lastIngestionAt: string | null;
}> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { documents: null, chunks: null, lastIngestionAt: null };
  }
  const [docs, chunks, dernier] = await Promise.all([
    supabase.from("rag_documents").select("id", { count: "exact", head: true }),
    supabase.from("rag_chunks").select("id", { count: "exact", head: true }),
    supabase
      .from("rag_documents")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  const ligne = (dernier.data as { created_at: string }[] | null)?.[0];
  return {
    documents: docs.error ? null : (docs.count ?? 0),
    chunks: chunks.error ? null : (chunks.count ?? 0),
    lastIngestionAt: dernier.error ? null : (ligne?.created_at ?? null),
  };
}

/**
 * Toutes les observations, en parallele. Ne leve jamais : une observation
 * impossible devient un critere non mesure, pas une page en erreur.
 */
export async function observer(): Promise<HealthObservations> {
  const [base, corpus, feed, ecosysteme] = await Promise.all([
    observerBase().catch(() => ({
      configured: true,
      readOk: false,
      dataClassReady: null,
    })),
    observerCorpus().catch(() => ({
      documents: null,
      chunks: null,
      lastIngestionAt: null,
    })),
    fetchShippedFeed(30).catch(() => null),
    fetchEcosystemHealth(),
  ]);

  const configurees = ecosysteme.results.filter((r) => r.status !== "disabled");

  return {
    base,
    github: {
      source: feed?.source ?? "repli",
      expected: feed?.repos.length ?? 0,
      read: feed?.repos.filter((r) => r.ok).length ?? 0,
      missing:
        feed?.repos
          .filter((r) => !r.ok)
          .map((r) => ({
            fullName: r.fullName,
            reason: r.reason ?? "le dépôt n’a pas pu être lu",
          })) ?? [],
      commits: feed ? feed.commits.length : null,
    },
    rag: { ...corpus, verification: lireVerificationRag() },
    passerelles: {
      configured: configurees.length,
      healthy: configurees.filter((r) => r.status === "ok").length,
      unhealthy: configurees
        .filter((r) => r.failureKind === "produit_non_sain")
        .map((r) => r.productName),
      // Delai depasse et sortie reseau : on ne sait pas si le produit est en
      // panne. C'est l'angle mort que C3-T5 ferme, et il devient INDETERMINE.
      unreachable: configurees
        .filter(
          (r) =>
            r.failureKind === "erreur_reseau" ||
            r.failureKind === "delai_depasse",
        )
        .map((r) => r.productName),
    },
    analytique: {
      keyConfigured: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()),
      region: regionAnalytique(
        process.env.NEXT_PUBLIC_POSTHOG_HOST,
        process.env.NEXT_PUBLIC_POSTHOG_KEY,
      ),
      regionAnnoncee: "UE",
      // Verrouille par tests/analytics-consent.test.ts. Le jour ou ce test
      // disparait, ce booleen ment : c'est pourquoi pnpm integrity verifie
      // que le test existe et passe.
      consentGate: true,
    },
    assistant: {
      modelKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
      // Verrouille par tests/adama-moteur.test.ts et tests/api-contract.test.ts.
      refuseSansSource: true,
    },
    sauvegarde: {
      procedure: true,
      restauration: lireRestauration(),
      fraicheurJours: FRAICHEUR_RESTAURATION_JOURS,
    },
  };
}

/** La matrice complete, prete a rendre. */
export async function fetchHealthMatrix(
  now: Date = new Date(),
): Promise<HealthMatrix> {
  const observations = await observer();
  return {
    capabilities: buildCapabilities(observations, now).map(toCapabilityHealth),
    observedAt: now.toISOString(),
  };
}

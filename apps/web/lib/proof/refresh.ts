import "server-only";

// =====================================================================
// C2-T6, la fraîcheur des preuves.
//
// Greffé sur le cron quotidien /api/ecosystem/sync. Réévalue les preuves
// automatisables et met à jour leur observation. Une preuve non réévaluable
// garde sa date d'origine et bascule en périmée à l'échéance de sa durée de
// validité : elle n'est jamais rafraîchie par politesse.
//
// La règle qui gouverne tout ce fichier : NE JAMAIS INVENTER UNE
// OBSERVATION. Si l'appel échoue, l'observation précédente reste en place
// avec sa date d'origine, et vieillit. Écrire « observée aujourd'hui, échec »
// serait déjà une observation d'aujourd'hui, donc une fraîcheur imméritée.
// Un échec n'écrit rien.
//
// Trois natures réévaluables, et pas une de plus :
//   http_status    GET sur le localisateur, on garde le code renvoyé ;
//   github_commit  dernier commit du dépôt "owner/repo" ;
//   db_count       nombre de lignes d'une table de la liste blanche.
// =====================================================================

import { createPublicClient } from "../supabase/public";
import { createServiceClient } from "../supabase/service";

/** Tables dénombrables. Liste blanche fermée : le localisateur d'une preuve
 *  vient de la base, il ne choisit pas la table qu'il interroge. */
const TABLES_DENOMBRABLES = new Set([
  "ecosystem_products",
  "ecosystem_analytics",
  "ecosystem_probes",
  "decisions_log",
  "trajectory",
  "rag_documents",
  "rag_chunks",
  "proof_claims",
  "proof_evidence",
]);

const DELAI_MS = 4000;

export type RefreshOutcome = {
  candidates: number;
  updated: number;
  failed: number;
  reason: string | null;
};

type EvidenceRow = {
  id: string;
  refresh_kind: string | null;
  locator: string | null;
};

/**
 * GET borné, sans corps lu : seul le code de retour nous intéresse.
 *
 * Un code d'échec ne confirme rien, donc il n'écrit rien. Enregistrer
 * « HTTP 404 » comme observation d'une affirmation qui dit « le produit
 * répond en production » donnerait une preuve fraîche qui contredit ce
 * qu'elle est censée prouver, et l'affirmation resterait affichée comme
 * vérifiée. Une observation qui ne confirme pas est un échec d'observation :
 * la précédente garde sa date et vieillit, jusqu'à devenir périmée.
 */
export async function observerHttp(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DELAI_MS);
  const debut = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json, text/html" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(
        `[preuve] ${url} a repondu ${res.status}, observation non enregistree`,
      );
      return null;
    }
    return (
      `HTTP ${res.status} ${res.statusText || "OK"}`.trim() +
      ` en ${Date.now() - debut} ms`
    );
  } catch {
    // Rien n'est revenu. On n'écrit rien, pour la même raison.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Dernier commit d'un dépôt public. Renvoie le sha court et sa date. */
async function observerCommit(fullName: string): Promise<string | null> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(fullName)) {
    return null;
  }
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DELAI_MS);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/commits?per_page=1`,
      { headers, signal: controller.signal, cache: "no-store" },
    );
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      sha?: string;
      commit?: { author?: { date?: string } };
    }[];
    const dernier = data?.[0];
    if (!dernier?.sha) {
      return null;
    }
    const date = dernier.commit?.author?.date?.slice(0, 10) ?? "date inconnue";
    return `dernier commit ${dernier.sha.slice(0, 7)} du ${date}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Nombre de lignes lisibles publiquement dans une table de la liste. */
async function observerCompte(table: string): Promise<string | null> {
  if (!TABLES_DENOMBRABLES.has(table)) {
    return null;
  }
  const supabase = createPublicClient();
  if (!supabase) {
    return null;
  }
  // Comptage sur une colonne nommee et non sur `*` : depuis la correction de
  // la migration 0003, la cle anonyme n'a plus de privilege de table sur
  // ecosystem_products ni sur ecosystem_probes, seulement des privileges de
  // colonne. Un `select *` y serait refuse.
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error || count === null || count === undefined) {
    return null;
  }
  // Zéro ligne ne prouve rien. Une affirmation du type « le registre est tenu
  // en base » adossée à une table vide serait une preuve qui dit le contraire
  // de son affirmation. Le compte à zéro est donc un échec d'observation.
  if (count === 0) {
    console.error(
      `[preuve] ${table} est vide pour la cle anonyme, observation non enregistree`,
    );
    return null;
  }
  return `${count} ligne(s) lisibles publiquement dans ${table}`;
}

async function observer(row: EvidenceRow): Promise<string | null> {
  if (!row.locator) {
    return null;
  }
  if (row.refresh_kind === "http_status") {
    return observerHttp(row.locator);
  }
  if (row.refresh_kind === "github_commit") {
    return observerCommit(row.locator);
  }
  if (row.refresh_kind === "db_count") {
    return observerCompte(row.locator);
  }
  return null;
}

/**
 * Réévalue toutes les preuves automatisables.
 *
 * Ne lève jamais : appelée depuis une route de cron qui doit rendre son
 * compte rendu même quand une source est tombée.
 */
export async function refreshEvidence(): Promise<RefreshOutcome> {
  const service = createServiceClient();
  if (!service) {
    return {
      candidates: 0,
      updated: 0,
      failed: 0,
      reason: "SUPABASE_SERVICE_ROLE_KEY absente",
    };
  }

  const { data, error } = await service
    .from("proof_evidence")
    .select("id, refresh_kind, locator")
    .not("refresh_kind", "is", null);

  if (error) {
    return {
      candidates: 0,
      updated: 0,
      failed: 0,
      reason: `lecture impossible : ${error.message}`,
    };
  }

  const rows = (data as EvidenceRow[]) ?? [];
  const resultats = await Promise.all(
    rows.map(async (row) => ({ row, resultat: await observer(row) })),
  );

  const maintenant = new Date().toISOString();
  let updated = 0;
  let failed = 0;

  for (const { row, resultat } of resultats) {
    if (resultat === null) {
      failed += 1;
      continue;
    }
    const { error: majError } = await service
      .from("proof_evidence")
      .update({
        observed_at: maintenant,
        observed_result: resultat,
        updated_at: maintenant,
      })
      .eq("id", row.id);
    if (majError) {
      failed += 1;
      continue;
    }
    updated += 1;
  }

  return {
    candidates: rows.length,
    updated,
    failed,
    reason:
      failed > 0
        ? "les observations en échec gardent leur date précédente et vieillissent"
        : null,
  };
}

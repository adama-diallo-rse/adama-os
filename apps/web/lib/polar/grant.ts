import "server-only";

// L6-T6 — Octroi d'un droit d'accès formation en base (course_entitlements).
// Appelé par le webhook Polar (achat payé) et l'essai. Idempotent grâce à
// l'index unique (lower(email), level) : une relance de webhook ne crée pas de
// doublon. Import dynamique de @adama/db pour que DATABASE_URL ne soit lu qu'à
// la requête (build sans env sûr, cf. lib/learn/entitlements.ts).

export type EntitlementSource = "polar" | "trial" | "manual";

/**
 * Enregistre un droit (email, level). Ne lève jamais.
 * @returns true si l'octroi est effectif (ou déjà présent), false si DB absente.
 */
export async function grantEntitlement(
  email: string,
  level: number,
  source: EntitlementSource = "polar",
  reference?: string | null,
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized || !Number.isFinite(level)) return false;

  try {
    const { db, schema } = await import("@adama/db");
    const { courseEntitlements } = schema;
    await db
      .insert(courseEntitlements)
      .values({
        email: normalized,
        level,
        source,
        reference: reference ?? null,
      })
      .onConflictDoNothing();
    return true;
  } catch {
    return false;
  }
}

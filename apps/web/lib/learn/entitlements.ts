import "server-only";

// L5-T8 — Vérification serveur d'un droit d'accès formation.
// Interroge course_entitlements via Drizzle (DATABASE_URL, déjà utilisé par le
// RAG). Import dynamique de @adama/db pour que DATABASE_URL ne soit lu qu'à la
// requête (build Vercel sans env safe, cf. lib/ai/retrieval.ts).

/** Vrai s'il existe un droit (email, level) en base. false si DB absente. */
export async function hasEntitlement(
  email: string,
  level: number,
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const { db, schema } = await import("@adama/db");
  const { and, eq, sql } = await import("drizzle-orm");
  const { courseEntitlements } = schema;

  const rows = await db
    .select({ id: courseEntitlements.id })
    .from(courseEntitlements)
    .where(
      and(
        eq(sql`lower(${courseEntitlements.email})`, normalized),
        eq(courseEntitlements.level, level),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

// L5 Contenu — configuration Sanity partagée (Studio + clients de lecture/écriture).
// Valeurs volontairement tolérantes : si les variables ne sont pas définies au
// build (Vercel sans env), les modules ne lèvent pas et les pages retombent sur
// un état vide plutôt que de casser (même logique que lib/supabase/public.ts).

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

/** Vrai seulement si un projet Sanity est réellement configuré. */
export const isSanityConfigured = projectId.length > 0;

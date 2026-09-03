import "server-only";

// C11-T3. La garantie « ce module ne descend jamais dans le navigateur »
// etait tenue par convention et par le fait qu'aucun composant client ne
// l'importait. Elle est desormais STRUCTURELLE : `server-only` leve a
// l'import depuis un composant client, donc une importation fautive casse la
// construction au lieu de fuiter une cle en production.

// Client Supabase serveur, clé service_role. Contourne la RLS, donc il ne
// doit JAMAIS être importé depuis un composant client. Utilisé uniquement là
// où la clé anon est volontairement insuffisante, par exemple la colonne
// repo_full_name de ecosystem_products, révoquée pour anon (migration 0001).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let cached: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient | null {
  if (cached) {
    return cached;
  }

  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    return null;
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

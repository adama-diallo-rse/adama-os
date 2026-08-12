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

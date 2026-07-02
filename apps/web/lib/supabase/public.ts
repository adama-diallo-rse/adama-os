// Client Supabase public (clé anon) pour les endpoints de lecture du dashboard.
// Pas de cookies : ces routes servent des données publiques, filtrées par la
// RLS (policies *_public_read / decisions_public_read_published). Le service
// role n'est jamais utilisé ici.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let cached: SupabaseClient | null = null;

export function createPublicClient(): SupabaseClient | null {
  if (cached) {
    return cached;
  }

  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    return null;
  }

  cached = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}

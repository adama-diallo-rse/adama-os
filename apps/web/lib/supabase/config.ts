export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  return {
    url: url && /^https?:\/\//i.test(url) ? url : undefined,
    anonKey: anonKey ? anonKey : undefined,
  };
}

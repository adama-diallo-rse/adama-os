import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

// L11-T2.b, Row Level Security.
//
// Ce que la clé anon doit pouvoir faire, et surtout ne pas pouvoir faire.
// Comme le test précédent, il ne s'exécute que sur demande explicite et
// jamais contre la production :
//   ADAMA_TEST_DB=1 ADAMA_TEST_SUPABASE_URL=... ADAMA_TEST_SUPABASE_ANON_KEY=... \
//   pnpm --filter @adama/web test
const url = process.env.ADAMA_TEST_SUPABASE_URL;
const anon = process.env.ADAMA_TEST_SUPABASE_ANON_KEY;
const actif = process.env.ADAMA_TEST_DB === "1" && !!url && !!anon;

describe.skipIf(!actif)("RLS, clé anonyme", () => {
  const client = () =>
    createClient(url as string, anon as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  it("ne peut lire ni rag_documents ni rag_chunks", async () => {
    const supabase = client();
    for (const table of ["rag_documents", "rag_chunks"]) {
      const { data, error } = await supabase.from(table).select("id").limit(1);
      // Deux issues acceptables : refus explicite, ou zéro ligne visible.
      // Une ligne rendue serait une fuite du corpus.
      expect(error !== null || (data ?? []).length === 0).toBe(true);
    }
  }, 20_000);

  it("ne voit que les décisions publiées", async () => {
    const supabase = client();
    const { data, error } = await supabase
      .from("decisions_log")
      .select("id, is_published")
      .limit(50);
    expect(error).toBeNull();
    for (const ligne of (data as { is_published: boolean }[]) ?? []) {
      expect(ligne.is_published).toBe(true);
    }
  }, 20_000);

  it("lit les métriques produit et le registre public", async () => {
    const supabase = client();
    const analytics = await supabase
      .from("ecosystem_analytics")
      .select("metric")
      .limit(1);
    expect(analytics.error).toBeNull();

    const produits = await supabase
      .from("ecosystem_products")
      .select("slug, is_public")
      .limit(50);
    expect(produits.error).toBeNull();
    for (const ligne of (produits.data as { is_public: boolean }[]) ?? []) {
      expect(ligne.is_public).toBe(true);
    }
  }, 20_000);

  it("ne lit pas la colonne repo_full_name, révoquée pour anon", async () => {
    const supabase = client();
    const { error } = await supabase
      .from("ecosystem_products")
      .select("repo_full_name")
      .limit(1);
    expect(error).not.toBeNull();
  }, 20_000);
});

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

/**
 * Code PostgreSQL du refus de privilège. C'est LUI qu'on attend, et pas
 * simplement « une erreur ».
 *
 * Le 2 septembre 2026, ce fichier a été exécuté pour la première fois contre
 * un vrai PostgREST. Les trois cas de refus passaient au vert alors que rien
 * n'était refusé : l'adresse de base était mal formée, chaque requête rendait
 * un 404, et `error !== null` était satisfait par le 404. Une adresse fausse,
 * un service éteint ou un pare-feu produisaient donc exactement la même
 * conclusion qu'une politique de sécurité qui tient.
 *
 * C'est la deuxième fois que ce fichier affirme une garantie qu'il ne
 * vérifiait pas. La première, le `revoke` de colonne de la migration 0001,
 * avait laissé le nom des dépôts privés lisible pendant vingt jours.
 */
const REFUS_DE_PRIVILEGE = "42501";

describe.skipIf(!actif)("RLS, clé anonyme", () => {
  const client = () =>
    createClient(url as string, anon as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  /**
   * Garde de banc d'essai. Elle s'exécute avant les autres et échoue si le
   * point d'accès ne répond pas comme un PostgREST : sans elle, tout le reste
   * du fichier peut virer au vert sans avoir rien exercé.
   */
  it("le point d'accès répond bien comme une base, et elle est peuplée", async () => {
    const supabase = client();
    const produits = await supabase
      .from("ecosystem_products")
      .select("slug")
      .limit(5);
    expect(
      produits.error,
      `Le point d'accès ${url} ne rend pas de données lisibles. ` +
        "Tant que ce cas échoue, aucun refus constaté plus bas ne prouve quoi que ce soit.",
    ).toBeNull();

    // Une base VIDE ferait passer les cas suivants sans rien prouver : les
    // boucles n'itéreraient sur rien et la branche « zéro ligne » du corpus
    // serait satisfaite par l'absence de corpus. Le banc doit donc porter des
    // lignes, et docs/RLS.md dit lesquelles.
    expect(
      (produits.data ?? []).length,
      "la base du banc est vide : les cas suivants passeraient sans rien exercer",
    ).toBeGreaterThan(0);

    const decisions = await supabase
      .from("decisions_log")
      .select("id")
      .limit(5);
    expect(decisions.error).toBeNull();
    expect(
      (decisions.data ?? []).length,
      "aucune décision visible : le cas « ne voit que les décisions publiées » n’itérerait sur rien",
    ).toBeGreaterThan(0);
  }, 20_000);

  // Limite assumée de ce fichier, écrite plutôt que contournée : avec la seule
  // clé anonyme, on ne peut pas vérifier qu'il EXISTE des lignes cachées, par
  // construction. Que le banc porte un produit non public et une décision non
  // publiée est un geste d'opérateur, décrit à la section 3 de docs/RLS.md.
  // Le prétendre vérifié ici serait exactement le genre d'affirmation que ce
  // dépôt refuse ailleurs.

  it("ne peut lire ni rag_documents ni rag_chunks", async () => {
    const supabase = client();
    for (const table of ["rag_documents", "rag_chunks"]) {
      const { data, error } = await supabase.from(table).select("id").limit(1);
      // Deux issues acceptables, et deux seulement : le refus de privilège,
      // ou zéro ligne visible. Une ligne rendue serait une fuite du corpus,
      // et une erreur d'un autre genre, réseau ou route absente, ne prouve
      // rien du tout et ne doit donc pas satisfaire ce cas.
      const refuse = error?.code === REFUS_DE_PRIVILEGE;
      const vide = error === null && (data ?? []).length === 0;
      expect(
        refuse || vide,
        `${table} : attendu un refus ${REFUS_DE_PRIVILEGE} ou zéro ligne, ` +
          `obtenu code=${error?.code ?? "aucun"} lignes=${(data ?? []).length}`,
      ).toBe(true);
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

  // Ce test affirmait la vérité et décrivait le contraire de la réalité.
  // La migration 0001 posait `revoke select (repo_full_name) ... from anon`,
  // qui ne retire rien : PostgreSQL ne laisse pas un retrait de colonne
  // annuler un privilège de table, et Supabase accorde un select de table à
  // anon. La colonne était lisible depuis le 12 août 2026. Personne ne l'a vu
  // parce que ce fichier ne s'exécute que sur demande, avec des identifiants
  // de base. Corrigé par la migration 0003, section 7.
  it("ne lit pas la colonne repo_full_name, retirée à anon", async () => {
    const supabase = client();
    const { error } = await supabase
      .from("ecosystem_products")
      .select("repo_full_name")
      .limit(1);
    expect(
      error?.code,
      "attendu un refus de privilège, pas une erreur quelconque",
    ).toBe(REFUS_DE_PRIVILEGE);
  }, 20_000);

  it("ne lit pas l'extrait d'erreur des sondes, retiré à anon", async () => {
    const supabase = client();
    const { error } = await supabase
      .from("ecosystem_probes")
      .select("error_excerpt")
      .limit(1);
    expect(
      error?.code,
      "attendu un refus de privilège, pas une erreur quelconque",
    ).toBe(REFUS_DE_PRIVILEGE);
  }, 20_000);

  it("lit quand même les colonnes publiques de ces deux tables", async () => {
    // La contrepartie de la correction : plus de privilège de table, donc un
    // `select *` est refusé. Ce test verrouille le fait que les colonnes
    // nommées, elles, restent lisibles. Sans lui, quelqu'un pourrait
    // « réparer » le refus en rendant tout lisible à nouveau.
    const supabase = client();
    const produits = await supabase
      .from("ecosystem_products")
      .select("slug, name, status, url")
      .limit(1);
    expect(produits.error).toBeNull();

    const sondes = await supabase
      .from("ecosystem_probes")
      .select("product_slug, status, failure_kind, observed_at")
      .limit(1);
    expect(sondes.error).toBeNull();
  }, 20_000);
});

// L1-T9 / L6-T13, endpoint de lecture : ecosystem_products.
// GET /api/ecosystem -> registre public des produits du groupe, ordonné.
// Lecture publique via RLS (policy ecosystem_public_read, filtre is_public).
// La colonne repo_full_name n'est volontairement pas sélectionnée : elle est
// révoquée pour la clé anon (migration 0001) et n'a rien à faire dans une
// réponse publique.
import { NextResponse } from "next/server";
import { createPublicClient } from "../../../lib/supabase/public";

export const revalidate = 0;

export async function GET() {
  const supabase = createPublicClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase non configuré (clé anon manquante)." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("ecosystem_products")
    .select("slug, name, division, pillar, description, status, url, position")
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { products: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}

// L1-T7, endpoint de lecture : decisions_log (Couche B, registre ADR public).
// GET /api/decisions -> décisions PUBLIÉES uniquement, plus récentes d'abord.
// Le filtre "publiées" est garanti par la RLS anon
// (policy decisions_public_read_published), pas seulement par le WHERE ci-dessous.
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
    .from("decisions_log")
    .select("id, title, date, category, reasoning, tags")
    .eq("is_published", true)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { decisions: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}

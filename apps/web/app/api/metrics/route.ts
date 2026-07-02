// L1-T7, endpoint de lecture : system_metrics (Couche A, System Status).
// GET /api/metrics -> toutes les métriques temps réel, triées par clé.
// Lecture publique via RLS (policy system_metrics_public_read).
import { NextResponse } from "next/server";
import { createPublicClient } from "../../../lib/supabase/public";

// Toujours frais : le dashboard reflète les check-ins immédiatement.
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
    .from("system_metrics")
    .select("key, value_num, value_text, unit, updated_at")
    .order("key", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { metrics: data },
    { headers: { "Cache-Control": "no-store" } },
  );
}

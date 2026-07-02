// L1-T7, endpoint de lecture : trajectory (Couche C, roadmap Now / Next / Later).
// GET /api/trajectory -> entrées triées Now -> Next -> Later, puis par date.
// Lecture publique via RLS (policy trajectory_public_read).
import { NextResponse } from "next/server";
import { createPublicClient } from "../../../lib/supabase/public";

export const revalidate = 0;

// L'ordre logique (now, next, later) n'est pas l'ordre alphabétique, on trie
// donc côté serveur avec un rang explicite.
const RANK: Record<string, number> = { now: 0, next: 1, later: 2 };

type Row = {
  id: string;
  title: string;
  status: string;
  type: string;
  eta: string | null;
  notes: string | null;
  created_at: string;
};

export async function GET() {
  const supabase = createPublicClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase non configuré (clé anon manquante)." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("trajectory")
    .select("id, title, status, type, eta, notes, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = ((data as Row[]) ?? []).sort(
    (a, b) => (RANK[a.status] ?? 99) - (RANK[b.status] ?? 99),
  );

  return NextResponse.json(
    { trajectory: items },
    { headers: { "Cache-Control": "no-store" } },
  );
}

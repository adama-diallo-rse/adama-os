// L1-T7, endpoint de lecture : trajectory (Couche C, roadmap Now / Next /
// Later / Livré). GET /api/trajectory -> entrées triées, avec leur état
// dérivé. Lecture publique via RLS (policy trajectory_public_read).
//
// C1-T8 : chaque entrée porte `overdue` et `dueAt`. Une échéance passée ne se
// lit plus comme une échéance à venir, ni dans l'interface, ni ici.
import { NextResponse } from "next/server";
import { createPublicClient } from "../../../lib/supabase/public";
import { resolveTrajectory } from "../../../lib/trajectory";
import type { TrajectoryRow } from "../../../components/types";

export const revalidate = 0;

// L'ordre logique (now, next, later) n'est pas l'ordre alphabétique, on trie
// donc côté serveur avec un rang explicite.
const RANK: Record<string, number> = { now: 0, next: 1, later: 2, done: 3 };

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
  const vues = resolveTrajectory(items as unknown as TrajectoryRow[]);

  return NextResponse.json(
    {
      trajectory: vues,
      // Compte rendu de cohérence : une roadmap qui annonce une date passée
      // est une donnée fausse, elle se signale au lieu de se taire.
      overdue: vues.filter((v) => v.overdue).length,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

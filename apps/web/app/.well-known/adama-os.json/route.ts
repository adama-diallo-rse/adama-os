// C2-T5, la sortie machine. GET /.well-known/adama-os.json
//
// Le contenu est construit par lib/proof/well-known.ts, qui porte aussi le
// validateur du schema. La route ne fait que lire la base et servir.
//
// Aucune information qui ne soit pas deja publique sur le site : les
// affirmations internes sont ecartees par la RLS, les produits sont ceux du
// hub public, et les faits de la fiche personne sont ceux du JSON-LD de
// layout.tsx.
import { NextResponse } from "next/server";
import { createPublicClient } from "../../../lib/supabase/public";
import { listClaims } from "../../../lib/proof/claims";
import {
  buildWellKnown,
  type WellKnownProduct,
} from "../../../lib/proof/well-known";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function chargerProduits(): Promise<WellKnownProduct[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("ecosystem_products")
    .select("slug, name, division, status, url, is_public, position")
    .eq("is_public", true)
    .order("position", { ascending: true });

  return ((data as WellKnownProduct[]) ?? []).map((p) => ({
    slug: p.slug,
    name: p.name,
    division: p.division,
    status: p.status,
    url: p.url,
  }));
}

export async function GET() {
  const maintenant = new Date();
  const [claims, products] = await Promise.all([
    listClaims({ now: maintenant }),
    chargerProduits(),
  ]);

  return NextResponse.json(buildWellKnown(claims, products, maintenant), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Une heure : assez pour absorber un robot insistant, assez court pour
      // qu'une preuve reevaluee le matin soit visible dans la journee.
      "Cache-Control": "public, max-age=0, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

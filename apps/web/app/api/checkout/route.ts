import { NextResponse, type NextRequest } from "next/server";
import { CATALOG } from "../../../content/learn/catalog";
import { createCheckout } from "../../../lib/polar/checkout";
import { courseSuccessUrl, productIdForLevel } from "../../../lib/polar/config";

// L6-T6 — Point d'entrée du paiement d'une formation.
// GET /api/checkout?level=N&email=... → crée une session Polar et redirige
// vers la page de paiement hébergée. En cas d'indisponibilité (Polar non
// configuré, niveau inconnu, erreur API), on redirige vers /learn/acces sans
// jamais casser : l'acheteur peut toujours débloquer son accès manuellement.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const level = Number(url.searchParams.get("level"));
  const email = url.searchParams.get("email")?.trim() || null;

  const fallback = new URL("/learn/acces", req.url);

  const course = CATALOG.find((c) => c.level === level);
  if (!course) {
    fallback.searchParams.set("checkout", "invalid");
    return NextResponse.redirect(fallback, { status: 307 });
  }

  const productId = productIdForLevel(level);
  if (!productId) {
    fallback.searchParams.set("checkout", "unavailable");
    return NextResponse.redirect(fallback, { status: 307 });
  }

  const session = await createCheckout({
    productId,
    successUrl: courseSuccessUrl(),
    customerEmail: email,
    metadata: { level: String(level), kind: "course" },
  });

  if (!session) {
    fallback.searchParams.set("checkout", "error");
    return NextResponse.redirect(fallback, { status: 307 });
  }

  return NextResponse.redirect(session.url, { status: 307 });
}

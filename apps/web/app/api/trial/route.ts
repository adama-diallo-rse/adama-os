import { NextResponse, type NextRequest } from "next/server";
import { createCheckout } from "../../../lib/polar/checkout";
import { saasProductId, trialSuccessUrl } from "../../../lib/polar/config";

// L6-T9 — Démarrage de l'essai gratuit SaaS STRATA.
// La période d'essai elle-même est configurée sur le produit d'abonnement dans
// Polar (Product -> trial). Cette route crée simplement le checkout de cet
// abonnement et redirige. Sans produit configuré, on retombe sur /strata sans
// jamais casser.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim() || null;

  const fallback = new URL("/strata", req.url);

  const productId = saasProductId();
  if (!productId) {
    fallback.searchParams.set("trial", "unavailable");
    return NextResponse.redirect(fallback, { status: 307 });
  }

  const session = await createCheckout({
    productId,
    successUrl: trialSuccessUrl(),
    customerEmail: email,
    metadata: { kind: "saas" },
  });

  if (!session) {
    fallback.searchParams.set("trial", "error");
    return NextResponse.redirect(fallback, { status: 307 });
  }

  return NextResponse.redirect(session.url, { status: 307 });
}

// L9, déclencheur de synchronisation des passerelles écosystème.
//
// GET /api/ecosystem/sync
//   - exécute les passerelles déclarées (lecture seule) ;
//   - historise dans ecosystem_analytics les métriques marquées persistables ;
//   - répond par un compte rendu, sans jamais lever.
//
// Appelé par Vercel Cron (apps/web/vercel.json, 06:00 UTC), qui envoie
// "Authorization: Bearer $CRON_SECRET". Manuellement :
//   curl -H "Authorization: Bearer <CRON_SECRET>" https://adamesg-os.fr/api/ecosystem/sync
//
// Sans CRON_SECRET posé, la route est ouverte en développement et fermée en
// production : une route qui écrit en base ne reste pas publique par oubli.
import { NextResponse } from "next/server";
import {
  persistImportedMetrics,
  runAllGateways,
} from "../../../../lib/ecosystem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function autorise(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!autorise(req)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const results = await runAllGateways();
  const metrics = results.flatMap((r) => r.metrics);
  const outcome = await persistImportedMetrics(metrics);

  return NextResponse.json(
    {
      ranAt: new Date().toISOString(),
      gateways: results.map((r) => ({
        product: r.productSlug,
        status: r.status,
        latencyMs: r.latencyMs,
        metrics: r.metrics.length,
      })),
      persisted: outcome,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

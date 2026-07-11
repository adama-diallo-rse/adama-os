import { NextResponse, type NextRequest } from "next/server";
import { CATALOG } from "../../../../content/learn/catalog";
import { levelForProductId } from "../../../../lib/polar/config";
import { grantEntitlement } from "../../../../lib/polar/grant";
import { verifyPolarWebhook } from "../../../../lib/polar/webhook";
import { deliverCourse } from "../../../../lib/email/send";

// L6-T6 — Réception des webhooks Polar.
// À l'événement "order.paid", on débloque le(s) niveau(x) de formation
// correspondant(s) dans course_entitlements (idempotent). Les événements
// d'abonnement (essai SaaS, L6-T9) sont acceptés sans action de formation.
// Sécurité : signature Standard Webhooks obligatoire (401 si invalide/absente).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Unknown = Record<string, unknown>;

function asObject(v: unknown): Unknown | null {
  return v && typeof v === "object" ? (v as Unknown) : null;
}

/** Extrait un email de l'objet order/checkout, quelle que soit la forme. */
function extractEmail(data: Unknown): string | null {
  const customer = asObject(data.customer);
  const candidates = [
    customer?.email,
    data.customer_email,
    asObject(data.user)?.email,
    asObject(data.metadata)?.email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)) {
      return c;
    }
  }
  return null;
}

/** Récupère les IDs produits présents dans l'objet order/checkout. */
function extractProductIds(data: Unknown): string[] {
  const ids = new Set<string>();
  const direct = [data.product_id, asObject(data.product)?.id];
  for (const d of direct) {
    if (typeof d === "string") ids.add(d);
  }
  const items = Array.isArray(data.items) ? data.items : [];
  for (const raw of items) {
    const item = asObject(raw);
    if (!item) continue;
    if (typeof item.product_id === "string") ids.add(item.product_id);
    const prod = asObject(item.product);
    if (prod && typeof prod.id === "string") ids.add(prod.id);
  }
  return [...ids];
}

/** Niveaux de formation à débloquer : metadata.level en priorité, sinon mapping. */
function resolveLevels(data: Unknown): number[] {
  const meta = asObject(data.metadata);
  const metaLevel = meta ? Number(meta.level) : NaN;
  if (Number.isInteger(metaLevel) && metaLevel >= 1 && metaLevel <= 4) {
    return [metaLevel];
  }
  const levels = new Set<number>();
  for (const pid of extractProductIds(data)) {
    const lvl = levelForProductId(pid);
    if (lvl !== null) levels.add(lvl);
  }
  return [...levels];
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyPolarWebhook(req.headers, rawBody)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: Unknown;
  try {
    event = JSON.parse(rawBody) as Unknown;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const type = typeof event.type === "string" ? event.type : "";
  const data = asObject(event.data) ?? {};

  // Seul "order.paid" garantit l'encaissement. On l'utilise pour les formations.
  if (type === "order.paid") {
    const email = extractEmail(data);
    const levels = resolveLevels(data);
    const reference =
      typeof data.id === "string" ? data.id : null;
    if (email && levels.length > 0) {
      for (const level of levels) {
        await grantEntitlement(email, level, "polar", reference);
        // Livraison de l'accès par email (best-effort, T11).
        const course = CATALOG.find((c) => c.level === level);
        if (course) {
          await deliverCourse({ email, courseTitle: course.title });
        }
      }
    }
  }

  // Toujours 200 pour les événements valides (évite les relances inutiles).
  return NextResponse.json({ received: true });
}

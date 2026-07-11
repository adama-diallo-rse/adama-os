import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { confirmRdv } from "../../../../lib/email/send";

// L6-T11 — Webhook Cal.com (optionnel) : envoie un email de confirmation de
// rendez-vous, en complément de la confirmation native de Cal. Signature
// vérifiée (x-cal-signature-256 = HMAC-SHA256 hex du corps brut, secret
// CAL_WEBHOOK_SECRET). Sans secret : 401 (aucun traitement). Ne casse rien :
// si le secret n'est pas posé, il suffit de ne pas créer le webhook côté Cal.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Unknown = Record<string, unknown>;

function asObject(v: unknown): Unknown | null {
  return v && typeof v === "object" ? (v as Unknown) : null;
}

function verify(headers: Headers, rawBody: string): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const sig = headers.get("x-cal-signature-256");
  if (!sig) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verify(req.headers, rawBody)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: Unknown;
  try {
    event = JSON.parse(rawBody) as Unknown;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const trigger = typeof event.triggerEvent === "string" ? event.triggerEvent : "";
  const payload = asObject(event.payload) ?? {};

  if (trigger === "BOOKING_CREATED") {
    const attendees = Array.isArray(payload.attendees) ? payload.attendees : [];
    const first = asObject(attendees[0]);
    const email =
      first && typeof first.email === "string" ? first.email : null;
    const name = first && typeof first.name === "string" ? first.name : null;
    const when =
      typeof payload.startTime === "string" ? payload.startTime : null;
    const meta = asObject(payload.metadata);
    const joinUrl =
      meta && typeof meta.videoCallUrl === "string"
        ? meta.videoCallUrl
        : typeof payload.location === "string"
          ? payload.location
          : null;

    if (email) {
      await confirmRdv({ to: email, name, when, joinUrl });
    }
  }

  return NextResponse.json({ received: true });
}

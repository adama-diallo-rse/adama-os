import { NextResponse, type NextRequest } from "next/server";
import { addToAudience } from "../../../lib/email/resend";
import { notifyLead } from "../../../lib/email/send";

// L6-T10 — Inscription à la newsletter (Resend Audiences).
// Ajoute le contact à l'audience Resend, enregistre le lead (source newsletter)
// et notifie en interne. Tout est best-effort : sans clé Resend / base, la
// route renvoie quand même ok (l'UI ne casse jamais), mais tente au minimum de
// ne pas perdre l'adresse.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: unknown; context?: unknown };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const context = typeof body.context === "string" ? body.context : null;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }

  // 1. Audience Resend (best-effort).
  await addToAudience(email);

  // 2. Enregistrement du lead (best-effort).
  await persistLead(email, context);

  // 3. Notification interne (best-effort).
  await notifyLead({
    source: "newsletter",
    email,
    details: context ? `Inscrit depuis : ${context}` : null,
  });

  return NextResponse.json({ ok: true });
}

async function persistLead(
  email: string,
  context: string | null,
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { db, schema } = await import("@adama/db");
    const { leads } = schema;
    await db.insert(leads).values({
      email: email.toLowerCase(),
      source: "newsletter",
      context: context ? { from: context } : {},
    });
  } catch {
    // non bloquant
  }
}

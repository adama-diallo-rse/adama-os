import { NextResponse, type NextRequest } from "next/server";
import { notifyLead } from "../../../lib/email/send";

// L6-T8 — Audit Express (lead magnet).
// Reçoit un formulaire court, appelle le moteur FastAPI /audit-express, renvoie
// le mini-rapport et capture le lead (+ audit_requests) en base. Fail-safe :
// si le moteur est injoignable, on capture quand même l'intention (lead) et on
// renvoie un message clair ; si la base est absente, le rapport est renvoyé
// quand même. Runtime Node (Drizzle).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENGINE_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL?.trim() || "http://localhost:8000";

// Clés d'activité acceptées par le moteur (validation stricte côté FastAPI).
const SECTORS = ["services", "industrie", "commerce", "construction"] as const;

type Body = {
  email?: unknown;
  company?: unknown;
  sector?: unknown;
  employees?: unknown;
  diesel_l?: unknown;
  gaz_naturel_kwh?: unknown;
  electricite_fr_kwh?: unknown;
  purchases_eur?: unknown;
  voiture_km?: unknown;
  avion_km?: unknown;
};

/** Nombre positif ou undefined (les valeurs vides/nulles sont ignorées). */
function posNum(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function pick(
  entries: Record<string, number | undefined>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(entries)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const sector =
    typeof body.sector === "string" &&
    (SECTORS as readonly string[]).includes(body.sector)
      ? body.sector
      : undefined;
  const employees = posNum(body.employees);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }
  if (!company) {
    return NextResponse.json(
      { error: "Le nom de l'entreprise est requis." },
      { status: 400 },
    );
  }

  const scope1 = pick({
    diesel_l: posNum(body.diesel_l),
    gaz_naturel_kwh: posNum(body.gaz_naturel_kwh),
  });
  const scope2 = pick({ electricite_fr_kwh: posNum(body.electricite_fr_kwh) });
  const travel = pick({
    voiture_km: posNum(body.voiture_km),
    avion_km: posNum(body.avion_km),
  });
  const purchases_eur = posNum(body.purchases_eur) ?? 0;

  const enginePayload = {
    company: {
      name: company,
      sector: sector ?? null,
      employees: employees ?? null,
    },
    scope1,
    scope2,
    purchases_eur,
    travel,
  };

  const answers: Record<string, unknown> = {
    sector: sector ?? null,
    employees: employees ?? null,
    ...scope1,
    ...scope2,
    ...travel,
    purchases_eur,
  };

  // 1. Appel du moteur (timeout 15 s).
  let report: Record<string, unknown> | null = null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(`${ENGINE_URL}/audit-express`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enginePayload),
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      report = (await res.json()) as Record<string, unknown>;
    }
  } catch {
    report = null;
  }

  // 2. Capture du lead + audit_request (best-effort, jamais bloquant).
  await persist(email, company, answers, report);

  // 3. Alerte interne (best-effort, T11).
  await notifyLead({
    source: "audit",
    email,
    company,
    details: report
      ? "Audit Express complété avec succès."
      : "Audit demandé mais moteur indisponible au moment de la requête.",
  });

  if (!report) {
    return NextResponse.json(
      {
        error:
          "Le moteur d'analyse est momentanément indisponible. Votre demande est bien enregistrée, nous revenons vers vous.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, report });
}

async function persist(
  email: string,
  company: string,
  answers: Record<string, unknown>,
  report: Record<string, unknown> | null,
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { db, schema } = await import("@adama/db");
    const { leads, auditRequests } = schema;
    const inserted = await db
      .insert(leads)
      .values({
        email: email.toLowerCase(),
        source: "audit",
        context: { company },
      })
      .returning({ id: leads.id });
    const leadId = inserted[0]?.id ?? null;
    await db.insert(auditRequests).values({
      leadId,
      company,
      sector: typeof answers.sector === "string" ? answers.sector : null,
      answers,
      result: report,
      status: report ? "done" : "failed",
    });
  } catch {
    // La capture est secondaire : on n'échoue jamais le rapport pour ça.
  }
}

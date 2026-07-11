import { NextResponse, type NextRequest } from "next/server";
import { CATALOG } from "../../../../content/learn/catalog";
import { hasEntitlement } from "../../../../lib/learn/entitlements";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  decodeAccess,
  encodeAccess,
} from "../../../../lib/learn/token";

// L5-T8 — Débloque l'accès à une formation à partir de l'email d'achat.
// L'utilisateur saisit l'email utilisé au paiement ; si un droit existe en base
// (course_entitlements, posé par le webhook Polar L6-T6 ou l'essai L6-T9), on
// pose un cookie signé qui débloque le(s) niveau(x) correspondant(s).
// Runtime Node (crypto + Drizzle), jamais edge.
export const runtime = "nodejs";

type Body = { email?: unknown; level?: unknown };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const level =
    typeof body.level === "number" ? body.level : Number(body.level);

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse email invalide." },
      { status: 400 },
    );
  }
  if (!CATALOG.some((c) => c.level === level)) {
    return NextResponse.json(
      { error: "Niveau inconnu." },
      { status: 400 },
    );
  }

  const granted = await hasEntitlement(email, level);
  if (!granted) {
    return NextResponse.json(
      {
        error:
          "Aucun accès trouvé pour cet email. Vérifie l'adresse utilisée à l'achat.",
      },
      { status: 403 },
    );
  }

  // Union avec les niveaux déjà débloqués dans le cookie courant.
  const current = decodeAccess(req.cookies.get(ACCESS_COOKIE)?.value);
  const cookieValue = encodeAccess([...current, level]);
  if (!cookieValue) {
    return NextResponse.json(
      { error: "Accès non configuré côté serveur." },
      { status: 503 },
    );
  }

  const res = NextResponse.json({ ok: true, level });
  res.cookies.set(ACCESS_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return res;
}

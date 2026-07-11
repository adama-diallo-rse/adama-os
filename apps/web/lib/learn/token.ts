import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// L5-T8 — Jeton d'accès aux formations, signé HMAC-SHA256.
// Format : base64url(payload).base64url(signature). Le payload liste les niveaux
// débloqués et une expiration. Aucune donnée sensible : la signature garantit
// juste que le client n'a pas fabriqué le cookie lui-même. Secret côté serveur
// (LEARN_ACCESS_SECRET). Sans secret, la signature est désactivée : aucun accès
// premium n'est accordé (fail-closed), les leçons gratuites restent lisibles.

export const ACCESS_COOKIE = "adama_learn";
/** Durée de vie du jeton : 1 an (l'achat est définitif). */
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 365;

type Payload = { levels: number[]; exp: number };

function secret(): string | null {
  const s = process.env.LEARN_ACCESS_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string, key: string): string {
  return b64url(createHmac("sha256", key).update(data).digest());
}

/**
 * Fabrique la valeur de cookie pour les niveaux donnés. null si le secret n'est
 * pas configuré (on ne peut alors accorder aucun accès de façon sûre).
 */
export function encodeAccess(levels: number[]): string | null {
  const key = secret();
  if (!key) return null;
  const clean = [...new Set(levels)].filter(
    (n) => Number.isInteger(n) && n >= 1 && n <= 4,
  );
  const payload: Payload = {
    levels: clean,
    exp: Math.floor(Date.now() / 1000) + ACCESS_MAX_AGE,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body, key)}`;
}

/** Décode un cookie et renvoie les niveaux débloqués. [] si invalide/expiré. */
export function decodeAccess(cookie: string | undefined): number[] {
  const key = secret();
  if (!key || !cookie) return [];
  const dot = cookie.lastIndexOf(".");
  if (dot <= 0) return [];
  const body = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  const expected = sign(body, key);
  // Comparaison à temps constant, longueurs égales requises.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return [];
  try {
    const json = Buffer.from(
      body.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const payload = JSON.parse(json) as Payload;
    if (!Array.isArray(payload.levels)) return [];
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
      return [];
    }
    return payload.levels.filter(
      (n) => Number.isInteger(n) && n >= 1 && n <= 4,
    );
  } catch {
    return [];
  }
}

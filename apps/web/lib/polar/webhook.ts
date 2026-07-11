import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { polarWebhookSecret } from "./config";

// L6-T6 — Vérification de signature des webhooks Polar (norme Standard Webhooks).
// Contenu signé : `${webhook-id}.${webhook-timestamp}.${payload_brut}`.
// La signature est un HMAC-SHA256 encodé base64. Le secret du dashboard peut
// être préfixé "whsec_" (le reste est alors du base64) ou brut (utf8).
// L'en-tête webhook-signature liste une ou plusieurs signatures "v1,<sig>".
//
// On ne se fie qu'à la signature (preuve d'authenticité). Les relances sont
// gérées par l'idempotence de l'octroi (index unique (email, level)), donc on
// n'impose pas de tolérance d'horodatage qui pourrait rejeter une livraison
// légitime mais tardive.

function secretBytes(secret: string): Buffer {
  if (secret.startsWith("whsec_")) {
    return Buffer.from(secret.slice(6), "base64");
  }
  return Buffer.from(secret, "utf8");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Vérifie la signature d'un webhook Polar.
 * @param headers en-têtes de la requête (Headers de la requête Next).
 * @param rawBody corps brut (texte non modifié).
 * @returns true si la signature est valide. false sinon (dont secret absent).
 */
export function verifyPolarWebhook(headers: Headers, rawBody: string): boolean {
  const secret = polarWebhookSecret();
  if (!secret) return false;

  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestamp || !signatureHeader) return false;

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretBytes(secret))
    .update(signedContent)
    .digest("base64");

  // L'en-tête peut contenir plusieurs signatures séparées par des espaces.
  for (const part of signatureHeader.split(" ")) {
    const comma = part.indexOf(",");
    const candidate = comma >= 0 ? part.slice(comma + 1) : part;
    if (candidate && safeEqual(candidate, expected)) {
      return true;
    }
  }
  return false;
}

import "server-only";

// L6-T10/T11 — Intégration Resend via l'API REST (aucune dépendance SDK, donc
// aucun risque de build). Tout est fail-safe : sans RESEND_API_KEY / expéditeur,
// les fonctions renvoient false sans jamais lever. Serveur uniquement.

function apiKey(): string | null {
  const k = process.env.RESEND_API_KEY?.trim();
  return k ? k : null;
}

/** Adresse expéditrice vérifiée dans Resend, ex. "STRATA <no-reply@ton-domaine>". */
function fromAddress(): string | null {
  const f = process.env.RESEND_FROM?.trim();
  return f ? f : null;
}

function replyTo(): string | null {
  return process.env.RESEND_REPLY_TO?.trim() || null;
}

function audienceId(): string | null {
  const a = process.env.RESEND_AUDIENCE_ID?.trim();
  return a ? a : null;
}

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  /** Surcharge de l'expéditeur (sinon RESEND_FROM). */
  from?: string;
  replyTo?: string;
};

/** Envoie un email transactionnel. Renvoie true si accepté par Resend. */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const key = apiKey();
  const from = input.from ?? fromAddress();
  if (!key || !from) return false;

  const body: Record<string, unknown> = {
    from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
  };
  const reply = input.replyTo ?? replyTo();
  if (reply) body.reply_to = reply;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Ajoute un contact à l'audience newsletter Resend. Renvoie true si accepté. */
export async function addToAudience(email: string): Promise<boolean> {
  const key = apiKey();
  const audience = audienceId();
  if (!key || !audience) return false;

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audience}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase(), unsubscribed: false }),
        cache: "no-store",
      },
    );
    // 200 (créé) ou 409/422 (déjà présent) : dans tous les cas, non bloquant.
    return res.ok || res.status === 409 || res.status === 422;
  } catch {
    return false;
  }
}

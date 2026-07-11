import "server-only";

// L6-T11 — Templates d'emails transactionnels. Rendus en HTML par chaînes de
// caractères (pas de react-dom/server : Turbopack l'interdit dans le graphe
// serveur, et cela évite toute dépendance). Styles inline (contrainte des
// clients mail). Chaque fabrique renvoie { subject, html } prêt pour Resend.

const BRAND = "#0e9f6e";
const INK = "#111827";
const MUTED = "#4b5563";
const BORDER = "#e5e7eb";
const BG = "#f6f7f9";

const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** Échappe le texte destiné au HTML (anti-injection dans les valeurs). */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(header: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:24px 0;background-color:${BG};font-family:${FONT};color:${INK};">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid ${BORDER};font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND};font-weight:600;">${esc(header)}</div>
    <div style="padding:24px;">${inner}</div>
    <div style="padding:16px 24px;border-top:1px solid ${BORDER};font-size:12px;color:${MUTED};">Adama OS &middot; STRATA, reporting de durabilité automatisé.</div>
  </div>
</body></html>`;
}

const H1 = `margin:0 0 12px;font-size:18px;color:${INK};`;
const P = `margin:0 0 14px;font-size:14px;line-height:1.6;color:${MUTED};`;
const KV = `font-size:13px;color:${INK};margin:0 0 6px;`;
const BTN = `display:inline-block;padding:10px 20px;background-color:${BRAND};color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;`;

export type Email = { subject: string; html: string };

// --- Alerte lead (interne) -------------------------------------------------
export function leadAlertEmail(input: {
  source: string;
  email: string;
  company?: string | null;
  details?: string | null;
}): Email {
  const rows = [
    `<p style="${KV}"><strong>Source :</strong> ${esc(input.source)}</p>`,
    `<p style="${KV}"><strong>Email :</strong> ${esc(input.email)}</p>`,
    input.company
      ? `<p style="${KV}"><strong>Entreprise :</strong> ${esc(input.company)}</p>`
      : "",
    input.details ? `<p style="${P}">${esc(input.details)}</p>` : "",
  ].join("");
  return {
    subject: `Nouveau lead (${input.source}) - ${input.email}`,
    html: layout(
      "Nouveau lead",
      `<h1 style="${H1}">Un contact vient d'arriver</h1>${rows}`,
    ),
  };
}

// --- Livraison formation ---------------------------------------------------
export function courseDeliveryEmail(input: {
  courseTitle: string;
  accessUrl: string;
}): Email {
  const url = esc(input.accessUrl);
  return {
    subject: `Votre accès : ${input.courseTitle}`,
    html: layout(
      "Accès formation",
      `<h1 style="${H1}">Merci pour votre achat</h1>
       <p style="${P}">Votre accès à <strong>${esc(input.courseTitle)}</strong> est prêt. Cliquez ci-dessous et saisissez l'email utilisé lors de l'achat pour ouvrir toutes les leçons.</p>
       <p style="margin:18px 0;"><a href="${url}" style="${BTN}">Débloquer mon accès</a></p>
       <p style="${P}">Si le bouton ne fonctionne pas, copiez ce lien : ${url}</p>`,
    ),
  };
}

// --- Confirmation de rendez-vous -------------------------------------------
export function rdvConfirmationEmail(input: {
  name?: string | null;
  when?: string | null;
  joinUrl?: string | null;
}): Email {
  const hello = input.name ? `Bonjour ${esc(input.name)},` : "Bonjour,";
  const when = input.when ? ` pour le ${esc(input.when)}` : "";
  const join = input.joinUrl
    ? `<p style="margin:18px 0;"><a href="${esc(input.joinUrl)}" style="${BTN}">Rejoindre l'appel</a></p>`
    : "";
  return {
    subject: "Votre rendez-vous est confirmé",
    html: layout(
      "Rendez-vous confirmé",
      `<h1 style="${H1}">${hello}</h1>
       <p style="${P}">Votre rendez-vous est bien confirmé${when}. À très vite.</p>${join}`,
    ),
  };
}

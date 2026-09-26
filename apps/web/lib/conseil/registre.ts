import "server-only";

// =====================================================================
// EG0, le registre des demandes, dans le projet dedie (XDEC-48), et la
// notification qui accompagne chaque depot.
//
// Meme projet que la lettre, jamais celui du cockpit : lib/lettre/config.ts
// refuse deja la confusion, et ce module ne lit que cette configuration.
// Il n'ecrit dans aucune table directement : les fonctions de
// packages/db/migrations-lettre/0002_conseil.sql sont les seuls chemins.
// =====================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PORTES } from "../../content/conseil";
import { EDITEUR } from "../legal";
import type { ConfigLettre } from "../lettre/config";
import { verifierExpediteur } from "../lettre/envoi";
import { CHOIX_ECHEANCE, type Demande } from "./qualification";

let cache: { url: string; client: SupabaseClient } | null = null;

function client(config: ConfigLettre): SupabaseClient {
  if (cache?.url === config.supabaseUrl) return cache.client;
  const nouveau = createClient(config.supabaseUrl, config.supabaseCle, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application": "adama-os-conseil" } },
  });
  cache = { url: config.supabaseUrl, client: nouveau };
  return nouveau;
}

async function appel<T>(
  config: ConfigLettre,
  fonction: string,
  parametres: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await client(config).rpc(fonction, parametres);
  if (error) {
    throw new Error(`Registre du conseil, ${fonction} : ${error.message}`);
  }
  return data as T;
}

type Depot = {
  porte: string;
  echeance: string;
  organisation: string;
  nom: string;
  email: string;
  probleme: string;
  mentionVersion: string;
  ipEmpreinte: string | null;
  emailEmpreinte: string;
};

type ResultatDepot =
  | { resultat: "recue"; id: string; recueLe: string }
  | { resultat: "limite" | "doublon" };

export async function deposer(
  config: ConfigLettre,
  d: Depot,
): Promise<ResultatDepot> {
  const lignes = await appel<
    { resultat: string; demande_id: string | null; recue_le: string | null }[]
  >(config, "conseil_deposer", {
    p_porte: d.porte,
    p_echeance: d.echeance,
    p_organisation: d.organisation,
    p_nom: d.nom,
    p_email: d.email,
    p_probleme: d.probleme,
    p_mention_version: d.mentionVersion,
    p_ip_empreinte: d.ipEmpreinte,
    p_email_empreinte: d.emailEmpreinte,
  });
  const ligne = Array.isArray(lignes) ? lignes[0] : null;
  if (ligne?.resultat === "recue" && ligne.demande_id && ligne.recue_le) {
    return { resultat: "recue", id: ligne.demande_id, recueLe: ligne.recue_le };
  }
  if (ligne?.resultat === "doublon") return { resultat: "doublon" };
  return { resultat: "limite" };
}

export async function noterNotification(
  config: ConfigLettre,
  id: string,
  ok: boolean,
): Promise<void> {
  await appel(config, "conseil_notification", { p_id: id, p_ok: ok });
}

export type LigneDemande = {
  id: string;
  recue_le: string;
  porte: string;
  echeance: string;
  organisation: string | null;
  nom: string | null;
  email: string | null;
  probleme: string | null;
  mention_version: string;
  statut: "recue" | "acceptee" | "refusee" | "close";
  strata_verifie: boolean;
  condition_4_verifiee: boolean;
  note_interne: string | null;
  statut_le: string;
};

export async function listerDemandes(
  config: ConfigLettre,
  limite = 100,
): Promise<LigneDemande[]> {
  return (
    (await appel<LigneDemande[]>(config, "conseil_lister", {
      p_limite: limite,
    })) ?? []
  );
}

export async function statuer(
  config: ConfigLettre,
  p: {
    id: string;
    statut: LigneDemande["statut"];
    strataVerifie: boolean;
    condition4Verifiee: boolean;
    note: string;
  },
): Promise<string> {
  return appel<string>(config, "conseil_statuer", {
    p_id: p.id,
    p_statut: p.statut,
    p_strata_verifie: p.strataVerifie,
    p_condition_4_verifiee: p.condition4Verifiee,
    p_note: p.note,
  });
}

export async function effacer(
  config: ConfigLettre,
  id: string,
): Promise<string> {
  return appel<string>(config, "conseil_effacer", {
    p_id: id,
    p_motif: "demande",
  });
}

export async function purger(config: ConfigLettre): Promise<number> {
  return appel<number>(config, "conseil_purger");
}

// =====================================================================
// La notification d'une demande recevable, vers la seule boite de
// l'editeur. Meme module que le depot : les deux gestes vont ensemble, et
// l'un ne se fait jamais sans l'autre.
//
// Elle part du sous-domaine d'envoi d'ADAMA OS, par le compte d'envoi
// dedie (XDEC-37), jamais d'un domaine de STRATA. L'adresse de reponse est
// celle de la personne : repondre depuis la messagerie lui repond. Aucun
// accuse de reception ne part vers la personne : une adresse non verifiee
// ne recoit rien de ce site, sinon le formulaire servirait a ecrire a
// n'importe qui.
// =====================================================================

const API_ENVOI = "https://api.resend.com/emails";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Le message, fonction pure : il se teste sans reseau. */
export function messageNotification(
  demande: Demande,
  id: string,
  recueLe: string,
  origine: string,
) {
  const porte = PORTES.find((p) => p.code === demande.porte);
  const echeance = CHOIX_ECHEANCE.find((c) => c.valeur === demande.echeance);
  const lignes: [string, string][] = [
    ["Porte", porte ? `${porte.numero} ${porte.titre}` : demande.porte],
    ["Échéance", echeance?.libelle ?? demande.echeance],
    ["Organisation", demande.organisation],
    ["Nom", demande.nom],
    ["Adresse", demande.email],
    ["Reçue le", recueLe],
  ];
  const lienConsole = `${origine}/admin/demandes#${id}`;
  const texte = [
    "Une demande recevable vient d’arriver par /travaillez-avec-moi.",
    "",
    ...lignes.map(([l, v]) => `${l} : ${v}`),
    "",
    "Le problème, tel qu’écrit :",
    demande.probleme,
    "",
    "Avant toute réponse : vérifier que l’organisation n’est ni cliente ni prospect de STRATA ESG, et que la condition 4 tient.",
    `Console : ${lienConsole}`,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0d1b2a">
<p>Une demande recevable vient d’arriver par /travaillez-avec-moi.</p>
<table style="border-collapse:collapse">${lignes
    .map(
      ([l, v]) =>
        `<tr><td style="padding:2px 16px 2px 0;color:#536878">${echapper(l)}</td><td>${echapper(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin-top:16px;color:#536878">Le problème, tel qu’écrit :</p>
<p style="white-space:pre-wrap;border-left:2px solid #c9a96e;padding-left:12px">${echapper(demande.probleme)}</p>
<p>Avant toute réponse : vérifier que l’organisation n’est ni cliente ni prospect de STRATA ESG, et que la condition 4 tient.</p>
<p><a href="${echapper(lienConsole)}">Ouvrir la console des demandes</a></p>
</div>`;
  return {
    to: [EDITEUR.contact],
    reply_to: demande.email,
    subject: `Demande de conseil, porte ${porte?.titre ?? demande.porte}, ${demande.organisation}`,
    text: texte,
    html,
    tags: [{ name: "categorie", value: "conseil" }],
  };
}

export async function notifier(
  config: ConfigLettre,
  demande: Demande,
  id: string,
  recueLe: string,
  origine: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  if (verifierExpediteur(config)) return false;
  try {
    const reponse = await fetchImpl(API_ENVOI, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendCle}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `conseil-${id}`,
      },
      body: JSON.stringify({
        from: config.expediteur,
        ...messageNotification(demande, id, recueLe, origine),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return reponse.ok;
  } catch {
    return false;
  }
}

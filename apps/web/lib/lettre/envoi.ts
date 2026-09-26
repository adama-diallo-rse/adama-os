import "server-only";

// =====================================================================
// EH0, l'envoi par l'outil retenu (XDEC-37), Resend, en appel HTTP direct.
//
// Pas de SDK : deux routes, un en-tete d'autorisation et un corps JSON ne
// justifient pas une dependance de plus. Le module rejoue a l'envoi les
// refus de la configuration, parce qu'un appel direct a `envoyer` avec une
// configuration fabriquee a la main ne doit pas contourner la regle.
//
// Ce que chaque message porte :
//   - l'expediteur du sous-domaine dedie, et une adresse de reponse lue ;
//   - pour la bienvenue et les notes, List-Unsubscribe et
//     List-Unsubscribe-Post (RFC 8058) : la desinscription en un clic
//     depuis l'en-tete de la messagerie, en plus du lien dans le corps ;
//   - une cle d'idempotence : un envoi rejoue apres une coupure reseau ne
//     part pas deux fois.
// Aucun suivi d'ouverture ni de clic n'est demande, et le domaine doit
// l'avoir desactive cote Resend (etape manuelle de docs/LETTRE.md).
// =====================================================================

import {
  adresseDe,
  domaineDe,
  estDomaineStrata,
  estSousDomaineEnvoi,
  type ConfigLettre,
} from "./config";

const API = "https://api.resend.com";
const DELAI_MS = 10_000;
/** Plafond d'un appel groupe chez Resend. */
export const TAILLE_LOT = 100;

type Categorie = "confirmation" | "bienvenue" | "note" | "test";

export type Envoi = {
  destinataire: string;
  objet: string;
  texte: string;
  html: string;
  categorie: Categorie;
  /** URL de desinscription en un clic, obligatoire hors confirmation. */
  desinscription?: string;
};

type Resultat =
  | { ok: true; id: string }
  | { ok: false; raison: string; reessayable: boolean };

type Fetch = typeof fetch;

export function verifierExpediteur(config: ConfigLettre): string | null {
  const adresse = adresseDe(config.expediteur);
  if (!adresse) return "Expéditeur illisible.";
  const domaine = domaineDe(adresse);
  if (estDomaineStrata(domaine)) {
    return "Expéditeur sur un domaine de STRATA ESG.";
  }
  if (!estSousDomaineEnvoi(domaine)) {
    return "Expéditeur hors du sous-domaine dédié.";
  }
  return null;
}

/** Corps JSON d'un message, tel que Resend l'attend. Fonction pure. */
export function charge(config: ConfigLettre, envoi: Envoi) {
  if (envoi.categorie !== "confirmation" && !envoi.desinscription) {
    throw new Error(
      "EH0 : un message de liste part toujours avec sa désinscription en un clic.",
    );
  }
  const entetes: Record<string, string> = {};
  if (envoi.desinscription) {
    entetes["List-Unsubscribe"] = `<${envoi.desinscription}>`;
    entetes["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  return {
    from: config.expediteur,
    to: [envoi.destinataire],
    reply_to: config.reponse,
    subject: envoi.objet,
    html: envoi.html,
    text: envoi.texte,
    headers: entetes,
    tags: [
      { name: "liste", value: "adama_signal" },
      { name: "categorie", value: envoi.categorie },
    ],
  };
}

function raisonHttp(statut: number): Resultat {
  return {
    ok: false,
    raison: `Réponse ${statut} de l’outil d’envoi.`,
    reessayable: statut === 429 || statut >= 500,
  };
}

export async function envoyer(
  config: ConfigLettre,
  envoi: Envoi,
  idempotence: string,
  fetchImpl: Fetch = fetch,
): Promise<Resultat> {
  const refus = verifierExpediteur(config);
  if (refus) return { ok: false, raison: refus, reessayable: false };
  try {
    const reponse = await fetchImpl(`${API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendCle}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotence.slice(0, 256),
      },
      body: JSON.stringify(charge(config, envoi)),
      signal: AbortSignal.timeout(DELAI_MS),
    });
    if (!reponse.ok) return raisonHttp(reponse.status);
    const corps = (await reponse.json()) as { id?: unknown };
    return typeof corps.id === "string"
      ? { ok: true, id: corps.id }
      : { ok: false, raison: "Réponse sans identifiant.", reessayable: false };
  } catch {
    return {
      ok: false,
      raison: "L’outil d’envoi n’a pas répondu.",
      reessayable: true,
    };
  }
}

/**
 * Envoi groupe, cent messages au plus. Rend un resultat par message, dans
 * l'ordre. Un echec de l'appel entier rend le meme echec pour tous : rien
 * n'est alors marque comme envoye, et le lot se rejoue sans doublon grace a
 * la cle d'idempotence.
 */
export async function envoyerLot(
  config: ConfigLettre,
  envois: readonly Envoi[],
  idempotence: string,
  fetchImpl: Fetch = fetch,
): Promise<Resultat[]> {
  if (envois.length === 0) return [];
  if (envois.length > TAILLE_LOT) {
    throw new Error(`EH0 : un lot compte ${TAILLE_LOT} messages au plus.`);
  }
  const refus = verifierExpediteur(config);
  if (refus) {
    return envois.map(() => ({ ok: false, raison: refus, reessayable: false }));
  }
  const echecCommun = (r: Resultat) => envois.map(() => r);
  try {
    const reponse = await fetchImpl(`${API}/emails/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.resendCle}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotence.slice(0, 256),
      },
      body: JSON.stringify(envois.map((e) => charge(config, e))),
      signal: AbortSignal.timeout(DELAI_MS * 3),
    });
    if (!reponse.ok) return echecCommun(raisonHttp(reponse.status));
    const corps = (await reponse.json()) as { data?: { id?: unknown }[] };
    const ids = Array.isArray(corps.data) ? corps.data : [];
    return envois.map((_, i) => {
      const id = ids[i]?.id;
      return typeof id === "string"
        ? { ok: true as const, id }
        : {
            ok: false as const,
            raison: "Message absent de la réponse groupée.",
            reessayable: false,
          };
    });
  } catch {
    return echecCommun({
      ok: false,
      raison: "L’outil d’envoi n’a pas répondu.",
      reessayable: true,
    });
  }
}

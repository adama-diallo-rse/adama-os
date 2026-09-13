import "server-only";

// =====================================================================
// EH0, la configuration de la lettre, et les refus qui la protegent.
//
// Tout ce qui envoie passe par cette lecture. Elle ne se contente pas de
// verifier qu'une variable existe : elle refuse les configurations qui
// violeraient une regle du programme, meme si elles fonctionneraient.
//
//   - La base de la lettre doit etre DISTINCTE du projet partage du cockpit
//     (XINV-22, XDEC-38). Meme hote ou meme cle : refus.
//   - L'adresse d'expedition doit etre sur un SOUS-DOMAINE d'adamesg-os.fr,
//     jamais sur la racine, et jamais sur un domaine de STRATA (EH0, regle 6
//     de la page du noyau media).
//   - La collecte n'est ouverte que si LETTRE_COLLECTE vaut exactement
//     "ouverte". Une configuration complete ne suffit pas : l'ouverture est
//     un geste, pose le jour ou l'envoi est verifie de bout en bout
//     (XDEC-40).
// =====================================================================

import { readPositiveInt } from "../rate-limit";
import { EDITEUR } from "../legal";

const DOMAINE_RACINE = "adamesg-os.fr";

/** Domaines de STRATA ESG : jamais expediteur, jamais adresse de reponse. */
const DOMAINES_STRATA = ["strata-esg.fr", "esg-optimizer.fr"] as const;

/** Palier gratuit de l'outil d'envoi retenu (XDEC-37), par jour. */
const PLAFOND_JOUR_PAR_DEFAUT = 100;

/** Envois gardes chaque jour pour les confirmations, quand une note part. */
export const RESERVE_CONFIRMATIONS = 20;

export type ConfigLettre = {
  supabaseUrl: string;
  supabaseCle: string;
  resendCle: string;
  /** Valeur complete de l'en-tete From, nom compris. */
  expediteur: string;
  domaineEnvoi: string;
  reponse: string;
  secret: string;
  plafondJour: number;
  collecteOuverte: boolean;
  administrateurs: readonly string[];
};

type LectureConfig =
  | { ok: true; config: ConfigLettre }
  | { ok: false; manquants: string[]; refus: string[] };

type Env = Record<string, string | undefined>;

function valeur(env: Env, cle: string): string | undefined {
  const v = env[cle]?.trim();
  return v ? v : undefined;
}

function hote(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Adresse contenue dans un en-tete From, avec ou sans nom affiche. */
export function adresseDe(entete: string): string | null {
  const chevrons = entete.match(/<([^<>\s]+@[^<>\s]+)>\s*$/);
  const brute = (chevrons?.[1] ?? entete).trim().toLowerCase();
  return /^[^@\s]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(brute) ? brute : null;
}

export function domaineDe(adresse: string): string {
  return adresse.slice(adresse.lastIndexOf("@") + 1).toLowerCase();
}

export function estDomaineStrata(domaine: string): boolean {
  const d = domaine.toLowerCase();
  return DOMAINES_STRATA.some((s) => d === s || d.endsWith(`.${s}`));
}

/**
 * Un domaine d'envoi valable est un sous-domaine strict de la racine
 * d'ADAMA OS. La racine elle-meme porte la messagerie OVH : une lettre
 * signalee comme indesirable ne doit pas pouvoir l'atteindre.
 */
export function estSousDomaineEnvoi(domaine: string): boolean {
  const d = domaine.toLowerCase();
  return d.endsWith(`.${DOMAINE_RACINE}`) && d !== DOMAINE_RACINE;
}

export function lireConfigLettre(env: Env = process.env): LectureConfig {
  const manquants: string[] = [];
  const refus: string[] = [];

  const supabaseUrl = valeur(env, "LETTRE_SUPABASE_URL");
  const supabaseCle = valeur(env, "LETTRE_SUPABASE_SERVICE_ROLE_KEY");
  const resendCle = valeur(env, "LETTRE_RESEND_API_KEY");
  const expediteur = valeur(env, "LETTRE_EXPEDITEUR");
  const secret = valeur(env, "LETTRE_SECRET");
  const reponse = valeur(env, "LETTRE_REPONSE") ?? EDITEUR.contact;

  if (!supabaseUrl) manquants.push("LETTRE_SUPABASE_URL");
  if (!supabaseCle) manquants.push("LETTRE_SUPABASE_SERVICE_ROLE_KEY");
  if (!resendCle) manquants.push("LETTRE_RESEND_API_KEY");
  if (!expediteur) manquants.push("LETTRE_EXPEDITEUR");
  if (!secret) manquants.push("LETTRE_SECRET");

  if (supabaseUrl) {
    const hoteLettre = hote(supabaseUrl);
    if (!hoteLettre || !supabaseUrl.startsWith("https://")) {
      refus.push("LETTRE_SUPABASE_URL doit être une adresse https valide.");
    } else if (hoteLettre === hote(valeur(env, "NEXT_PUBLIC_SUPABASE_URL"))) {
      refus.push(
        "La base de la lettre est le projet partagé du cockpit. Elle doit vivre dans un projet dédié (XINV-22).",
      );
    }
  }
  if (supabaseCle && supabaseCle === valeur(env, "SUPABASE_SERVICE_ROLE_KEY")) {
    refus.push(
      "La clé de service de la lettre est celle du projet partagé. Elle doit être propre au projet dédié.",
    );
  }
  if (resendCle && !resendCle.startsWith("re_")) {
    refus.push("LETTRE_RESEND_API_KEY n’a pas la forme d’une clé Resend.");
  }

  let domaineEnvoi = "";
  if (expediteur) {
    const adresse = adresseDe(expediteur);
    if (!adresse) {
      refus.push("LETTRE_EXPEDITEUR n’est pas une adresse lisible.");
    } else {
      domaineEnvoi = domaineDe(adresse);
      if (estDomaineStrata(domaineEnvoi)) {
        refus.push(
          "L’expéditeur est sur un domaine de STRATA ESG. La lettre n’emprunte jamais un domaine de la prospection.",
        );
      } else if (!estSousDomaineEnvoi(domaineEnvoi)) {
        refus.push(
          `L’expéditeur doit être sur un sous-domaine dédié de ${DOMAINE_RACINE}, jamais sur la racine ni ailleurs.`,
        );
      }
    }
  }

  const adresseReponse = adresseDe(reponse);
  if (!adresseReponse) {
    refus.push("LETTRE_REPONSE n’est pas une adresse lisible.");
  } else if (estDomaineStrata(domaineDe(adresseReponse))) {
    refus.push("L’adresse de réponse est sur un domaine de STRATA ESG.");
  }

  if (secret && secret.length < 32) {
    refus.push("LETTRE_SECRET doit compter au moins 32 caractères.");
  }

  if (
    manquants.length > 0 ||
    refus.length > 0 ||
    !supabaseUrl ||
    !supabaseCle ||
    !resendCle ||
    !expediteur ||
    !secret ||
    !adresseReponse
  ) {
    return { ok: false, manquants, refus };
  }

  const administrateurs = (valeur(env, "LETTRE_ADMINISTRATEURS") ?? "")
    .split(",")
    .map((a) => a.trim().toLowerCase())
    .filter((a) => adresseDe(a) !== null);

  return {
    ok: true,
    config: {
      supabaseUrl,
      supabaseCle,
      resendCle,
      expediteur,
      domaineEnvoi,
      reponse: adresseReponse,
      secret,
      plafondJour: readPositiveInt(
        env.LETTRE_PLAFOND_JOUR,
        PLAFOND_JOUR_PAR_DEFAUT,
      ),
      collecteOuverte: valeur(env, "LETTRE_COLLECTE") === "ouverte",
      administrateurs,
    },
  };
}

/** Un compte authentifie n'administre la lettre que s'il est nomme. */
export function estAdministrateur(
  config: ConfigLettre,
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  return config.administrateurs.includes(email.trim().toLowerCase());
}

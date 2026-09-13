import "server-only";

// =====================================================================
// EH0, les parcours de la lettre, de bout en bout.
//
// Les actions de page, la route publique et la route d'entretien ne font
// que lire une requete et appeler ces fonctions. Toute la sequence vit ici,
// testable sans navigateur : demander, envoyer la confirmation, confirmer,
// accueillir, desinscrire, entretenir, envoyer une note par lots.
//
// Deux regles de sequence :
//   - rien n'est marque envoye avant que l'outil d'envoi ait rendu un
//     identifiant. Un message qui n'est pas parti se rejoue ;
//   - le plafond du jour est lu AVANT d'envoyer. Une note ne consomme jamais
//     la reserve gardee pour les confirmations des personnes qui arrivent.
// =====================================================================

import { CONSENTEMENT } from "../../content/lettre";
import { SITE_URL } from "../site";
import { RESERVE_CONFIRMATIONS, type ConfigLettre } from "./config";
import { envoyer, envoyerLot, TAILLE_LOT, type Envoi } from "./envoi";
import {
  DUREE_LIEN_CONFIRMATION_MS,
  empreinteAdresse,
  empreinteIp,
  empreinteJeton,
  jetonDesinscription,
  lireJetonDesinscription,
  nouveauJeton,
} from "./jetons";
import {
  messageBienvenue,
  messageConfirmation,
  messageNote,
  type Note,
} from "./messages";
import {
  type BilanPurge,
  type Destinataire,
  type EtatJeton,
  bienvenueEnvoyee,
  bienvenuesEnAttente,
  clore,
  confirmationEnvoyee,
  confirmer,
  demarrerNote,
  desinscrire,
  destinatairesNote,
  envoisDuJour,
  etatJeton,
  inscrire,
  noteEnvoyee,
  purger,
  testEnvoye,
} from "./registre";

const CHEMIN_ROUTE = "/api/lettre";

/** Cookie qui porte le jeton de confirmation, limite a /lettre. */
export const COOKIE_CONFIRMATION = "lettre_confirmation";

function lienConfirmation(jeton: string, site = SITE_URL): string {
  return `${site}${CHEMIN_ROUTE}?confirmation=${encodeURIComponent(jeton)}`;
}

function lienDesinscription(
  config: ConfigLettre,
  abonneId: string,
  site = SITE_URL,
): string {
  const jeton = jetonDesinscription(config.secret, abonneId);
  return `${site}${CHEMIN_ROUTE}?desinscription=${encodeURIComponent(jeton)}`;
}

// --- 1. Demande ------------------------------------------------------------

type IssueDemande =
  | "confirmation_partie"
  | "rien_a_envoyer"
  | "limite_ip"
  | "plafond_jour"
  | "echec_envoi";

export async function demanderInscription(
  config: ConfigLettre,
  demande: {
    adresse: string;
    ip: string;
    referentHote: string | null;
    campagne: Record<string, string>;
  },
): Promise<IssueDemande> {
  const deja = await envoisDuJour(config);
  if (deja >= config.plafondJour) return "plafond_jour";

  const { jeton, empreinte } = nouveauJeton();
  const { resultat, abonneId } = await inscrire(config, {
    email: demande.adresse,
    emailEmpreinte: empreinteAdresse(config.secret, demande.adresse),
    jetonEmpreinte: empreinte,
    jetonExpireLe: new Date(Date.now() + DUREE_LIEN_CONFIRMATION_MS),
    surface: "page_lettre",
    chemin: "/lettre",
    referentHote: demande.referentHote,
    campagne: demande.campagne,
    langue: "fr",
    consentementVersion: CONSENTEMENT.version,
    ipEmpreinte: empreinteIp(config.secret, demande.ip),
  });

  if (resultat === "limite_ip") return "limite_ip";
  if (resultat !== "envoyer_confirmation" || !abonneId) return "rien_a_envoyer";

  const contenu = messageConfirmation({
    lien: lienConfirmation(jeton),
    site: SITE_URL,
  });
  const envoi = await envoyer(
    config,
    { destinataire: demande.adresse, categorie: "confirmation", ...contenu },
    `confirmation-${abonneId}-${empreinte.slice(0, 24)}`,
  );
  if (!envoi.ok) return "echec_envoi";
  await confirmationEnvoyee(config, abonneId, envoi.id);
  return "confirmation_partie";
}

// --- 2. Confirmation et bienvenue -------------------------------------------

export async function verifierLien(
  config: ConfigLettre,
  jeton: string,
): Promise<EtatJeton> {
  const empreinte = empreinteJeton(jeton);
  if (!empreinte) return "invalide";
  return etatJeton(config, empreinte);
}

async function accueillir(
  config: ConfigLettre,
  destinataire: Destinataire,
): Promise<boolean> {
  const contenu = messageBienvenue({
    desinscription: lienDesinscription(config, destinataire.abonneId),
    site: SITE_URL,
  });
  const envoi = await envoyer(
    config,
    {
      destinataire: destinataire.email,
      categorie: "bienvenue",
      desinscription: lienDesinscription(config, destinataire.abonneId),
      ...contenu,
    },
    // Le cycle entre dans la cle : une personne qui se desinscrit puis se
    // reinscrit le meme jour recoit bien sa bienvenue, et un rejeu du meme
    // cycle ne la renvoie jamais.
    `bienvenue-${destinataire.abonneId}-c${destinataire.cycle ?? 1}`,
  );
  if (!envoi.ok) return false;
  await bienvenueEnvoyee(config, destinataire.abonneId, envoi.id);
  return true;
}

export async function confirmerInscription(
  config: ConfigLettre,
  jeton: string,
  ip: string,
): Promise<"confirme" | "expire" | "invalide"> {
  const empreinte = empreinteJeton(jeton);
  if (!empreinte) return "invalide";
  const { resultat, abonneId, email, cycle } = await confirmer(
    config,
    empreinte,
    empreinteIp(config.secret, ip),
  );
  if (resultat === "confirme" && abonneId && email) {
    // Un echec d'envoi ne defait pas la confirmation : le consentement est
    // donne. La route d'entretien rejoue chaque jour les bienvenues en
    // attente.
    try {
      await accueillir(config, { abonneId, email, cycle: cycle ?? 1 });
    } catch {
      // rejoue par /api/lettre/sync
    }
  }
  return resultat;
}

// --- 3. Desinscription ------------------------------------------------------

export async function desinscrireParJeton(
  config: ConfigLettre,
  jeton: string,
  motif: "lien" | "en_tete_un_clic",
): Promise<"desinscrit" | "deja" | "invalide"> {
  const abonneId = lireJetonDesinscription(config.secret, jeton);
  if (!abonneId) return "invalide";
  const resultat = await desinscrire(config, abonneId, motif);
  return resultat === "inconnu" ? "deja" : resultat;
}

// --- 4. Entretien quotidien -------------------------------------------------

export async function entretenir(config: ConfigLettre): Promise<{
  purge: BilanPurge;
  bienvenues: { envoyees: number; en_echec: number };
}> {
  const purge = await purger(config);
  const deja = await envoisDuJour(config);
  const disponible = Math.max(
    0,
    Math.min(20, config.plafondJour - RESERVE_CONFIRMATIONS - deja),
  );
  const attente = await bienvenuesEnAttente(config, disponible);
  let envoyees = 0;
  let enEchec = 0;
  for (const destinataire of attente) {
    if (await accueillir(config, destinataire)) envoyees += 1;
    else enEchec += 1;
  }
  return { purge, bienvenues: { envoyees, en_echec: enEchec } };
}

// --- 5. Note trimestrielle --------------------------------------------------

type BilanLot =
  | { etat: "refus"; raison: string }
  | {
      etat: "lot_envoye";
      envoyes: number;
      en_echec: number;
      reste: boolean;
    };

export async function envoyerLotNote(
  config: ConfigLettre,
  note: Note & { id: string; code: string },
): Promise<BilanLot> {
  const demarrage = await demarrerNote(config, note.id);
  if (demarrage === "envoyee") {
    return { etat: "refus", raison: "Cette note est déjà partie en entier." };
  }
  if (demarrage === "non_relue") {
    return {
      etat: "refus",
      raison: "La relecture de désidentification n’est pas cochée.",
    };
  }
  if (demarrage === "autre_note_en_cours") {
    return {
      etat: "refus",
      raison: "Une autre note est en cours d’envoi. Terminez-la d’abord.",
    };
  }
  if (demarrage === "inconnue") {
    return { etat: "refus", raison: "Note introuvable." };
  }

  const deja = await envoisDuJour(config);
  const disponible = Math.min(
    TAILLE_LOT,
    config.plafondJour - RESERVE_CONFIRMATIONS - deja,
  );
  if (disponible <= 0) {
    return {
      etat: "refus",
      raison:
        "Le plafond d’envoi du jour est atteint, réserve des confirmations comprise. Le lot suivant part demain.",
    };
  }

  const cibles = await destinatairesNote(config, note.id, disponible);
  const envois: Envoi[] = cibles.map((c) => {
    const desinscription = lienDesinscription(config, c.abonneId);
    return {
      destinataire: c.email,
      categorie: "note",
      desinscription,
      ...messageNote({ note, desinscription, site: SITE_URL }),
    };
  });
  const resultats = await envoyerLot(
    config,
    envois,
    `note-${note.code}-${cibles[0]?.abonneId ?? "vide"}-${cibles.length}`,
  );

  let envoyes = 0;
  let enEchec = 0;
  for (const [i, r] of resultats.entries()) {
    const cible = cibles[i];
    if (!cible) continue;
    if (r.ok) {
      await noteEnvoyee(config, note.id, cible.abonneId, r.id);
      envoyes += 1;
    } else {
      enEchec += 1;
    }
  }
  const cloture = await clore(config, note.id);
  return {
    etat: "lot_envoye",
    envoyes,
    en_echec: enEchec,
    reste: cloture === "reste",
  };
}

/** Un message de test, vers un administrateur, jamais vers la liste. */
export async function envoyerTest(
  config: ConfigLettre,
  note: Note,
  destinataire: string,
): Promise<{ ok: boolean; raison?: string }> {
  const deja = await envoisDuJour(config);
  if (deja >= config.plafondJour - RESERVE_CONFIRMATIONS) {
    return { ok: false, raison: "Plafond d’envoi du jour atteint." };
  }
  const desinscription = `${SITE_URL}/lettre#mention`;
  const contenu = messageNote({ note, desinscription, site: SITE_URL });
  const r = await envoyer(
    config,
    {
      destinataire,
      categorie: "test",
      desinscription,
      ...contenu,
      objet: `[Essai] ${contenu.objet}`,
    },
    `test-${Date.now()}`,
  );
  if (!r.ok) return { ok: false, raison: r.raison };
  await testEnvoye(config, r.id);
  return { ok: true };
}

import "server-only";

// =====================================================================
// EH4, l'envoi d'un numero de SIGNAL, de bout en bout.
//
// Memes regles de sequence que la note (lib/lettre/parcours.ts) : rien
// n'est marque envoye avant l'identifiant rendu par l'outil d'envoi, et le
// plafond du jour est lu avant d'envoyer, reserve des confirmations
// comprise. Chaque abonne recoit le numero dans sa langue.
// =====================================================================

import { SITE_URL } from "../site";
import { RESERVE_CONFIRMATIONS, type ConfigLettre } from "./config";
import { numeroAffiche, type ContenuEdition, type Langue } from "./editions";
import { envoyer, envoyerLot, TAILLE_LOT, type Envoi } from "./envoi";
import { messageEdition } from "./message-edition";
import { lienDesinscription, type BilanLot } from "./parcours";
import { envoisDuJour, testEnvoye } from "./registre";
import {
  cloreEdition,
  demarrerEdition,
  destinatairesEdition,
  editionEnvoyee,
} from "./registre-editions";

const RAISONS_DEMARRAGE_EDITION = {
  envoyee: "Ce numéro est déjà parti en entier.",
  non_relue: "La relecture de ce numéro n’est pas cochée.",
  inconnue: "Numéro introuvable.",
  autre_edition_en_cours:
    "Un autre numéro est en cours d’envoi. Terminez-le d’abord.",
  note_en_cours:
    "Une note trimestrielle est en cours d’envoi. Terminez-la d’abord.",
  numero_precedent_non_parti:
    "Un numéro plus petit n’est pas encore parti. Les numéros partent dans l’ordre.",
} as const;

/**
 * Un lot d'edition : chaque abonne recoit le numero dans sa langue. Meme
 * sequence que la note : demarrer, lire le plafond, envoyer, ne marquer
 * envoye qu'apres l'identifiant rendu, clore quand plus personne n'attend.
 */
export async function envoyerLotEdition(
  config: ConfigLettre,
  edition: { id: string; contenu: ContenuEdition },
): Promise<BilanLot> {
  const demarrage = await demarrerEdition(config, edition.id);
  if (demarrage !== "en_cours") {
    return { etat: "refus", raison: RAISONS_DEMARRAGE_EDITION[demarrage] };
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

  const cibles = await destinatairesEdition(config, edition.id, disponible);
  const envois: Envoi[] = cibles.map((c) => {
    const desinscription = lienDesinscription(config, c.abonneId);
    return {
      destinataire: c.email,
      categorie: "edition",
      desinscription,
      ...messageEdition({
        edition: edition.contenu,
        langue: c.langue,
        desinscription,
        site: SITE_URL,
      }),
    };
  });
  const resultats = await envoyerLot(
    config,
    envois,
    `signal-${numeroAffiche(edition.contenu.numero)}-${cibles[0]?.abonneId ?? "vide"}-${cibles.length}`,
  );

  let envoyes = 0;
  let enEchec = 0;
  for (const [i, r] of resultats.entries()) {
    const cible = cibles[i];
    if (!cible) continue;
    if (r.ok) {
      await editionEnvoyee(
        config,
        edition.id,
        cible.abonneId,
        cible.langue,
        r.id,
      );
      envoyes += 1;
    } else {
      enEchec += 1;
    }
  }
  const cloture = await cloreEdition(config, edition.id);
  return {
    etat: "lot_envoye",
    envoyes,
    en_echec: enEchec,
    reste: cloture === "reste",
  };
}

/** Les deux langues d'un numero, vers un administrateur seulement. */
export async function envoyerTestEdition(
  config: ConfigLettre,
  edition: ContenuEdition,
  destinataire: string,
): Promise<{ ok: boolean; raison?: string; envoyes: Langue[] }> {
  const deja = await envoisDuJour(config);
  if (deja + 2 > config.plafondJour - RESERVE_CONFIRMATIONS) {
    return {
      ok: false,
      raison: "Plafond d’envoi du jour atteint.",
      envoyes: [],
    };
  }
  const desinscription = `${SITE_URL}/lettre#mention`;
  const envoyes: Langue[] = [];
  for (const langue of ["fr", "en"] as const) {
    const contenu = messageEdition({
      edition,
      langue,
      desinscription,
      site: SITE_URL,
    });
    const r = await envoyer(
      config,
      {
        destinataire,
        categorie: "test",
        desinscription,
        ...contenu,
        objet: `[Essai ${langue.toUpperCase()}] ${contenu.objet}`,
      },
      `test-signal-${edition.numero}-${langue}-${Date.now()}`,
    );
    if (!r.ok) return { ok: false, raison: r.raison, envoyes };
    await testEnvoye(config, r.id);
    envoyes.push(langue);
  }
  return { ok: true, envoyes };
}

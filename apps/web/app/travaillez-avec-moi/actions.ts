"use server";

// =====================================================================
// EG0, l'action du formulaire commun des quatre portes.
//
// L'ordre ne se discute pas :
//   1. le champ piege et la limite de debit ;
//   2. la lecture bornee des champs ;
//   3. la qualification, rejouee ici quoi qu'ait affiche le navigateur ;
//   4. si la regle refuse : rien n'est enregistre, la reponse type revient ;
//   5. sinon : depot dans la base dediee, puis notification a l'editeur.
// Un echec de notification n'annule pas le depot : la demande est dans la
// console, et le journal dit que la notification n'est pas partie.
// =====================================================================

import { headers } from "next/headers";
import { MENTION_DEMANDE } from "../../content/conseil";
import {
  lireDemande,
  phraseRefus,
  qualifier,
  type ChampDemande,
  type MotifRefus,
} from "../../lib/conseil/qualification";
import {
  deposer,
  noterNotification,
  notifier,
} from "../../lib/conseil/registre";
import { lireConfigLettre } from "../../lib/lettre/config";
import { empreinteAdresse, empreinteIp } from "../../lib/lettre/jetons";
import { clientKey, createRateLimiter } from "../../lib/rate-limit";
import { SITE_URL } from "../../lib/site";

export type EtatDemande =
  | { statut: "repos" }
  | { statut: "erreur"; message: string; champ?: ChampDemande }
  | { statut: "refus"; motif: MotifRefus; reponse: string }
  | { statut: "recue"; recueLe: string };

const limiteur = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

const INDISPONIBLE: EtatDemande = {
  statut: "erreur",
  message:
    "Le formulaire n’est pas relié pour le moment. Rien n’a été enregistré.",
};

export async function deposerDemande(
  _precedent: EtatDemande,
  donnees: FormData,
): Promise<EtatDemande> {
  // Un robot qui remplit le champ piege recoit une reponse ordinaire, et
  // rien n'est enregistre.
  if (String(donnees.get("site_web") ?? "").length > 0) {
    return { statut: "recue", recueLe: new Date().toISOString() };
  }

  const ip = clientKey(await headers());
  if (!limiteur.check(ip).allowed) {
    return {
      statut: "erreur",
      message: "Trop de demandes depuis cette connexion. Réessayez plus tard.",
    };
  }

  const lecture = lireDemande((cle) => donnees.get(cle));
  if (!lecture.ok) {
    return { statut: "erreur", message: lecture.message, champ: lecture.champ };
  }
  if (donnees.get("version") !== MENTION_DEMANDE.version) {
    return {
      statut: "erreur",
      message:
        "La mention a changé depuis l’ouverture de la page. Rechargez-la pour lire la version en vigueur.",
    };
  }

  const demande = lecture.demande;
  const qualification = qualifier(demande);
  if (qualification.verdict === "refus") {
    return {
      statut: "refus",
      motif: qualification.principal,
      reponse: phraseRefus(qualification.principal),
    };
  }

  const config = lireConfigLettre();
  if (!config.ok) return INDISPONIBLE;

  try {
    const depot = await deposer(config.config, {
      porte: demande.porte,
      echeance: demande.echeance,
      organisation: demande.organisation,
      nom: demande.nom,
      email: demande.email,
      probleme: demande.probleme,
      mentionVersion: MENTION_DEMANDE.version,
      ipEmpreinte: empreinteIp(config.config.secret, ip),
      emailEmpreinte: empreinteAdresse(config.config.secret, demande.email),
    });
    if (depot.resultat === "doublon") {
      return {
        statut: "erreur",
        message:
          "Une demande depuis cette adresse est déjà arrivée aujourd’hui. Elle sera lue : inutile de la renvoyer.",
      };
    }
    if (depot.resultat !== "recue") {
      return {
        statut: "erreur",
        message: "Trop de demandes depuis cette connexion. Réessayez demain.",
      };
    }
    const partie = await notifier(
      config.config,
      demande,
      depot.id,
      depot.recueLe,
      SITE_URL,
    );
    await noterNotification(config.config, depot.id, partie).catch(() => {
      // Le journal est un confort de suivi : son echec ne remet pas en
      // cause une demande deja deposee.
    });
    return { statut: "recue", recueLe: depot.recueLe };
  } catch {
    return {
      statut: "erreur",
      message:
        "La demande n’a pas pu être enregistrée. Rien n’a été gardé. Réessayez dans quelques minutes.",
    };
  }
}

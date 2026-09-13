"use server";

// =====================================================================
// EH0, les deux actions publiques de /lettre.
//
// inscrire : le formulaire a un seul champ, l'adresse, et une case jamais
// precochee. Aucune adresse n'est acceptee sans la case, et la reponse
// visible est la meme que l'adresse soit nouvelle, en attente ou deja
// confirmee : la page ne sert pas a verifier qui est inscrit.
//
// confirmer : le jeton ne transite jamais par l'URL de la page. La route
// /api/lettre l'a pose dans un cookie limite a /lettre, et c'est le bouton
// qui confirme, pas l'ouverture du lien (XDEC-39).
// =====================================================================

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CONSENTEMENT } from "../../content/lettre";
import {
  campagneDepuis,
  hoteReferent,
  normaliserAdresse,
} from "../../lib/lettre/jetons";
import { lireConfigLettre } from "../../lib/lettre/config";
import {
  COOKIE_CONFIRMATION,
  confirmerInscription,
  demanderInscription,
} from "../../lib/lettre/parcours";
import { clientKey, createRateLimiter } from "../../lib/rate-limit";

export type EtatFormulaire = {
  statut: "repos" | "envoye" | "erreur";
  message?: string;
  champ?: "adresse" | "consentement";
};

const limiteur = createRateLimiter({ limit: 6, windowMs: 10 * 60 * 1000 });

const MESSAGE_ENVOYE =
  "Si cette adresse n’est pas déjà inscrite, un message de confirmation vient de partir. Ouvrez-le, puis appuyez sur le bouton de confirmation. Sans ce geste, rien d’autre n’arrivera. Pensez au dossier des indésirables.";

export async function inscrire(
  _precedent: EtatFormulaire,
  donnees: FormData,
): Promise<EtatFormulaire> {
  const lecture = lireConfigLettre();
  if (!lecture.ok || !lecture.config.collecteOuverte) {
    return {
      statut: "erreur",
      message:
        "La collecte n’est pas encore ouverte. Aucune adresse n’a été enregistrée.",
    };
  }
  const config = lecture.config;

  // Champ piege, invisible pour une personne. Un robot qui le remplit
  // recoit la reponse ordinaire, et rien n'est enregistre.
  if (String(donnees.get("site_web") ?? "").length > 0) {
    return { statut: "envoye", message: MESSAGE_ENVOYE };
  }

  const adresse = normaliserAdresse(donnees.get("adresse"));
  if (!adresse) {
    return {
      statut: "erreur",
      champ: "adresse",
      message: "Cette adresse ne semble pas valide. Vérifiez-la.",
    };
  }
  if (donnees.get("consentement") !== "oui") {
    return {
      statut: "erreur",
      champ: "consentement",
      message:
        "Cochez la case pour donner votre accord. Elle n’est jamais cochée d’avance.",
    };
  }
  if (donnees.get("version") !== CONSENTEMENT.version) {
    return {
      statut: "erreur",
      message:
        "Le texte de consentement a changé depuis l’ouverture de la page. Rechargez-la pour lire la version en vigueur.",
    };
  }

  const entetes = await headers();
  const ip = clientKey(entetes);
  if (!limiteur.check(ip).allowed) {
    return {
      statut: "erreur",
      message: "Trop de demandes depuis cette connexion. Réessayez plus tard.",
    };
  }

  try {
    const issue = await demanderInscription(config, {
      adresse,
      ip,
      referentHote: hoteReferent(donnees.get("referent")),
      campagne: campagneDepuis((cle) => donnees.get(cle)),
    });
    switch (issue) {
      case "confirmation_partie":
      case "rien_a_envoyer":
        return { statut: "envoye", message: MESSAGE_ENVOYE };
      case "limite_ip":
        return {
          statut: "erreur",
          message:
            "Trop de demandes depuis cette connexion. Réessayez plus tard.",
        };
      case "plafond_jour":
        return {
          statut: "erreur",
          message:
            "La lettre a atteint son plafond d’envoi pour aujourd’hui. Aucune adresse n’a été enregistrée. Réessayez demain.",
        };
      case "echec_envoi":
        return {
          statut: "erreur",
          message:
            "Le message de confirmation n’a pas pu partir. Réessayez dans quelques minutes.",
        };
    }
    return { statut: "envoye", message: MESSAGE_ENVOYE };
  } catch {
    return {
      statut: "erreur",
      message:
        "La demande n’a pas pu être traitée. Rien n’a été confirmé. Réessayez plus tard.",
    };
  }
}

export async function confirmer(): Promise<never> {
  const jar = await cookies();
  const jeton = jar.get(COOKIE_CONFIRMATION)?.value;
  const lecture = lireConfigLettre();
  if (!jeton) {
    redirect("/lettre?etat=lien-invalide");
  }
  if (!lecture.ok) {
    redirect("/lettre?etat=indisponible");
  }

  let issue: "confirme" | "expire" | "invalide" | "indisponible";
  try {
    issue = await confirmerInscription(
      lecture.config,
      jeton,
      clientKey(await headers()),
    );
  } catch {
    issue = "indisponible";
  }
  if (issue !== "indisponible") {
    jar.delete({ name: COOKIE_CONFIRMATION, path: "/lettre" });
  }
  const etat =
    issue === "confirme"
      ? "confirme"
      : issue === "expire"
        ? "lien-expire"
        : issue === "invalide"
          ? "lien-invalide"
          : "indisponible";
  redirect(`/lettre?etat=${etat}`);
}

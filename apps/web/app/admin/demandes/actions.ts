"use server";

// =====================================================================
// EG0, les actions de la console des demandes.
//
// Meme triple garde que la console de la lettre : une session du cockpit,
// une configuration dediee complete, et l'adresse du compte nommee dans
// LETTRE_ADMINISTRATEURS. Une action serveur est un point d'entree public.
// =====================================================================

import { revalidatePath } from "next/cache";
import {
  estAdministrateur,
  lireConfigLettre,
  type ConfigLettre,
} from "../../../lib/lettre/config";
import { effacer, purger, statuer } from "../../../lib/conseil/registre";
import { createClient } from "../../../lib/supabase/server";

export type EtatAction = {
  statut: "repos" | "ok" | "erreur";
  message?: string;
};

async function garder(): Promise<
  { ok: true; config: ConfigLettre } | { ok: false; etat: EtatAction }
> {
  const supabase = await createClient();
  const utilisateur = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;
  if (!utilisateur) {
    return {
      ok: false,
      etat: { statut: "erreur", message: "Session absente." },
    };
  }
  const lecture = lireConfigLettre();
  if (!lecture.ok) {
    return {
      ok: false,
      etat: { statut: "erreur", message: "Configuration dédiée incomplète." },
    };
  }
  if (!estAdministrateur(lecture.config, utilisateur.email)) {
    return {
      ok: false,
      etat: {
        statut: "erreur",
        message: "Ce compte n’administre pas les demandes.",
      },
    };
  }
  return { ok: true, config: lecture.config };
}

const STATUTS = ["recue", "acceptee", "refusee", "close"] as const;
type Statut = (typeof STATUTS)[number];

const MESSAGES: Record<string, string> = {
  ok: "Enregistré.",
  controles_manquants:
    "Une demande n’est acceptée qu’après les deux contrôles : STRATA ESG et condition 4.",
  introuvable: "Demande introuvable, peut-être déjà effacée.",
  statut_invalide: "Statut inconnu.",
};

export async function changerStatut(
  _p: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  const id = String(donnees.get("id") ?? "");
  const statut = String(donnees.get("statut") ?? "") as Statut;
  if (!/^[0-9a-f-]{36}$/.test(id) || !STATUTS.includes(statut)) {
    return { statut: "erreur", message: MESSAGES.statut_invalide };
  }
  try {
    const r = await statuer(garde.config, {
      id,
      statut,
      strataVerifie: donnees.get("strata_verifie") === "oui",
      condition4Verifiee: donnees.get("condition_4") === "oui",
      note: String(donnees.get("note") ?? "").slice(0, 2000),
    });
    revalidatePath("/admin/demandes");
    return {
      statut: r === "ok" ? "ok" : "erreur",
      message: MESSAGES[r] ?? r,
    };
  } catch {
    return { statut: "erreur", message: "La base n’a pas répondu." };
  }
}

export async function effacerDemande(
  _p: EtatAction,
  donnees: FormData,
): Promise<EtatAction> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  const id = String(donnees.get("id") ?? "");
  if (donnees.get("confirmer") !== "oui" || !/^[0-9a-f-]{36}$/.test(id)) {
    return {
      statut: "erreur",
      message: "Cochez la confirmation : un effacement ne se défait pas.",
    };
  }
  try {
    const r = await effacer(garde.config, id);
    revalidatePath("/admin/demandes");
    return { statut: r === "ok" ? "ok" : "erreur", message: MESSAGES[r] ?? r };
  } catch {
    return { statut: "erreur", message: "La base n’a pas répondu." };
  }
}

export async function lancerPurge(): Promise<EtatAction> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  try {
    const n = await purger(garde.config);
    revalidatePath("/admin/demandes");
    return {
      statut: "ok",
      message:
        n === 0
          ? "Aucune demande n’avait dépassé douze mois."
          : `${n} demande${n > 1 ? "s" : ""} effacée${n > 1 ? "s" : ""}.`,
    };
  } catch {
    return { statut: "erreur", message: "La base n’a pas répondu." };
  }
}

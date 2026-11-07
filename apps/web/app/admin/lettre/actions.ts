"use server";

// =====================================================================
// EH0, les actions de la console privee de la lettre.
//
// Triple garde, parce qu'une action serveur est un point d'entree public :
//   1. une session du cockpit, verifiee ici et pas seulement par le proxy ;
//   2. une configuration de la lettre complete et sans refus ;
//   3. l'adresse du compte nommee dans LETTRE_ADMINISTRATEURS. Le projet
//      d'authentification du cockpit est partage : une session valide ne
//      prouve pas qu'on est Adama.
//
// Quinze minutes par trimestre : rediger trois paragraphes, les faire
// relire par le controle, s'envoyer un essai, puis envoyer le lot du jour.
// Au-dela du plafond quotidien, le lot suivant part le lendemain, depuis le
// meme bouton, sans jamais renvoyer deux fois a la meme adresse.
// =====================================================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  estAdministrateur,
  lireConfigLettre,
  type ConfigLettre,
} from "../../../lib/lettre/config";
import {
  empreinteAdresse,
  normaliserAdresse,
} from "../../../lib/lettre/jetons";
import {
  CLES_BLOCS,
  differences,
  examinerEdition,
  numeroAffiche,
  type ContenuEdition,
  type VersionEdition,
} from "../../../lib/lettre/editions";
import { examinerNote, type Note } from "../../../lib/lettre/messages";
import { envoyerLotNote, envoyerTest } from "../../../lib/lettre/parcours";
import {
  envoyerLotEdition,
  envoyerTestEdition,
} from "../../../lib/lettre/parcours-editions";
import {
  desinscrireParEmpreinte,
  enregistrerNote as ecrireNote,
  exporter,
  listerNotes,
} from "../../../lib/lettre/registre";
import {
  corrigerEdition,
  enregistrerEdition as ecrireEdition,
  importerEditions,
  listerEditions,
  supprimerBrouillon,
} from "../../../lib/lettre/registre-editions";
import { STOCK_SIGNAL } from "../../../content/signal-stock";
import { createClient } from "../../../lib/supabase/server";

export type EtatConsole = {
  statut: "repos" | "ok" | "erreur";
  message?: string;
  details?: string[];
  noteId?: string;
  editionId?: string;
  export?: string;
};

type Garde =
  | { ok: true; config: ConfigLettre; email: string }
  | { ok: false; etat: EtatConsole };

async function garder(): Promise<Garde> {
  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      etat: { statut: "erreur", message: "Session indisponible." },
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect("/login?redirect=/admin/lettre");
  }
  const lecture = lireConfigLettre();
  if (!lecture.ok) {
    return {
      ok: false,
      etat: {
        statut: "erreur",
        message: "La lettre n’est pas configurée.",
        details: [...lecture.manquants, ...lecture.refus],
      },
    };
  }
  if (!estAdministrateur(lecture.config, user.email)) {
    return {
      ok: false,
      etat: {
        statut: "erreur",
        message: "Ce compte n’est pas nommé dans LETTRE_ADMINISTRATEURS.",
      },
    };
  }
  return { ok: true, config: lecture.config, email: user.email };
}

function lireNote(donnees: FormData): Note {
  return {
    objet: String(donnees.get("objet") ?? "").trim(),
    decide: String(donnees.get("decide") ?? "").trim(),
    echoue: String(donnees.get("echoue") ?? "").trim(),
    preparation: String(donnees.get("preparation") ?? "").trim(),
  };
}

function message(erreur: unknown): string {
  return erreur instanceof Error ? erreur.message : "Erreur inattendue.";
}

export async function enregistrerNote(
  _precedent: EtatConsole,
  donnees: FormData,
): Promise<EtatConsole> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;

  const note = lireNote(donnees);
  const verdict = examinerNote(note);
  if (verdict.bloquants.length > 0) {
    return {
      statut: "erreur",
      message: "La note n’est pas enregistrée.",
      details: verdict.bloquants,
    };
  }
  const relue = donnees.get("relue") === "oui";
  const idBrut = String(donnees.get("id") ?? "");
  try {
    const notes = await listerNotes(garde.config);
    const existante = notes.find((n) => n.id === idBrut) ?? null;
    if (existante && existante.statut !== "brouillon") {
      return {
        statut: "erreur",
        message: "Cette note est partie : son texte ne se modifie plus.",
      };
    }
    const code =
      existante?.code ?? `NOTE-${String(notes.length + 1).padStart(2, "0")}`;
    const id = await ecrireNote(garde.config, {
      id: existante?.id ?? null,
      code,
      ...note,
      relue,
    });
    revalidatePath("/admin/lettre");
    return {
      statut: "ok",
      message: relue
        ? `${code} enregistrée et marquée relue. Elle peut partir.`
        : `${code} enregistrée en brouillon. Cochez la relecture avant l’envoi.`,
      noteId: id,
    };
  } catch (erreur) {
    return { statut: "erreur", message: message(erreur) };
  }
}

export async function envoyerEssai(
  _precedent: EtatConsole,
  donnees: FormData,
): Promise<EtatConsole> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  const note = lireNote(donnees);
  const verdict = examinerNote(note);
  if (verdict.bloquants.length > 0) {
    return {
      statut: "erreur",
      message: "L’essai ne part pas tant que la note a des points bloquants.",
      details: verdict.bloquants,
    };
  }
  try {
    const r = await envoyerTest(garde.config, note, garde.email);
    return r.ok
      ? { statut: "ok", message: `Essai envoyé à ${garde.email}.` }
      : { statut: "erreur", message: r.raison ?? "Essai non envoyé." };
  } catch (erreur) {
    return { statut: "erreur", message: message(erreur) };
  }
}

export async function envoyerLotDuJour(donnees: FormData): Promise<void> {
  const garde = await garder();
  const issue = await (async (): Promise<Record<string, string>> => {
    if (!garde.ok) return { erreur: garde.etat.message ?? "Refus." };
    const id = String(donnees.get("id") ?? "");
    try {
      const note = (await listerNotes(garde.config)).find((n) => n.id === id);
      if (!note) return { erreur: "Note introuvable." };
      const verdict = examinerNote(note);
      if (verdict.bloquants.length > 0) {
        return { erreur: verdict.bloquants.join(" ") };
      }
      const bilan = await envoyerLotNote(garde.config, note);
      if (bilan.etat === "refus") return { erreur: bilan.raison };
      const pluriel = bilan.envoyes > 1 ? "s" : "";
      const suite = bilan.reste
        ? "Des destinataires restent : relancer le lot demain."
        : "La note est partie à toute la liste.";
      return {
        ok: `${bilan.envoyes} message${pluriel} parti${pluriel}, ${bilan.en_echec} en échec. ${suite}`,
      };
    } catch (erreur) {
      return { erreur: message(erreur) };
    }
  })();
  // redirect() leve une exception de controle : il vit hors de tout try.
  revalidatePath("/admin/lettre");
  redirect(`/admin/lettre?${new URLSearchParams(issue).toString()}`);
}

export async function exercerDroit(
  _precedent: EtatConsole,
  donnees: FormData,
): Promise<EtatConsole> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  const adresse = normaliserAdresse(donnees.get("adresse"));
  if (!adresse) {
    return { statut: "erreur", message: "Adresse illisible." };
  }
  const empreinte = empreinteAdresse(garde.config.secret, adresse);
  const droit = String(donnees.get("droit") ?? "");
  try {
    if (droit === "acces") {
      const donneesAdresse = await exporter(garde.config, empreinte);
      if (!donneesAdresse) {
        return {
          statut: "ok",
          message:
            "Aucune donnée pour cette adresse. C’est aussi une réponse à transmettre.",
        };
      }
      return {
        statut: "ok",
        message:
          "Données de l’adresse, à transmettre telles quelles à la personne qui les demande.",
        export: JSON.stringify(donneesAdresse, null, 2),
      };
    }
    if (droit === "effacement") {
      if (donnees.get("confirme") !== "oui") {
        return {
          statut: "erreur",
          message: "Cochez la confirmation avant d’effacer.",
        };
      }
      const r = await desinscrireParEmpreinte(
        garde.config,
        empreinte,
        "demande_ecrite",
      );
      revalidatePath("/admin/lettre");
      return {
        statut: "ok",
        message:
          r === "desinscrit"
            ? "Adresse effacée et désinscrite. Seules restent son empreinte et les dates, pour la preuve."
            : r === "deja"
              ? "Cette adresse était déjà désinscrite."
              : "Adresse inconnue de la liste.",
      };
    }
    return { statut: "erreur", message: "Droit inconnu." };
  } catch (erreur) {
    return { statut: "erreur", message: message(erreur) };
  }
}

// =====================================================================
// EH4, les editions SIGNAL.
//
// Un brouillon s'ecrit librement. Un numero parti ne se reecrit que par
// une correction motivee, que la base trace (lettre_edition_corriger). Le
// meme examen que dans le navigateur tourne ici avant toute ecriture.
// =====================================================================

function lireVersion(donnees: FormData, langue: "fr" | "en"): VersionEdition {
  const champ = (nom: string) =>
    String(donnees.get(`${nom}_${langue}`) ?? "")
      .replace(/\s*\n+\s*/g, " ")
      .trim();
  const version = {
    titre: champ("titre"),
    source: champ("source"),
  } as VersionEdition;
  for (const cle of CLES_BLOCS) version[cle] = champ(cle);
  return version;
}

function lireEdition(donnees: FormData): ContenuEdition {
  return {
    numero: Number.parseInt(String(donnees.get("numero") ?? ""), 10),
    fr: lireVersion(donnees, "fr"),
    en: lireVersion(donnees, "en"),
  };
}

function retour(issue: Record<string, string>): never {
  revalidatePath("/admin/lettre");
  revalidatePath("/lettre");
  redirect(`/admin/lettre?${new URLSearchParams(issue).toString()}#editions`);
}

export async function enregistrerEdition(
  _precedent: EtatConsole,
  donnees: FormData,
): Promise<EtatConsole> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;

  const edition = lireEdition(donnees);
  const verdict = examinerEdition(edition);
  if (verdict.bloquants.length > 0) {
    return {
      statut: "erreur",
      message: "Le numéro n’est pas enregistré.",
      details: verdict.bloquants,
    };
  }
  const relue = donnees.get("relue") === "oui";
  const idBrut = String(donnees.get("id") ?? "");
  const n = numeroAffiche(edition.numero);
  try {
    const editions = await listerEditions(garde.config);
    const existante = editions.find((e) => e.id === idBrut) ?? null;

    if (existante && existante.statut !== "brouillon") {
      const motif = String(donnees.get("motif") ?? "").trim();
      if (motif.length < 10 || motif.length > 400) {
        return {
          statut: "erreur",
          message:
            "Ce numéro est parti : une correction demande un motif de 10 à 400 caractères, publié avec elle.",
        };
      }
      if (edition.numero !== existante.contenu.numero) {
        return { statut: "erreur", message: "Un numéro est attribué à vie." };
      }
      const champs = differences(existante.contenu, edition);
      if (Object.keys(champs).length === 0) {
        return { statut: "erreur", message: "La correction ne change rien." };
      }
      const version = await corrigerEdition(
        garde.config,
        existante.id,
        champs,
        motif,
      );
      revalidatePath("/admin/lettre");
      revalidatePath("/lettre");
      revalidatePath(`/lettre/${n}`);
      return {
        statut: "ok",
        message: `SIGNAL #${n} corrigé, version ${version}. La correction et son motif sont publiés sur la page du numéro.`,
        editionId: existante.id,
      };
    }

    const doublon = editions.find(
      (e) => e.contenu.numero === edition.numero && e.id !== existante?.id,
    );
    if (doublon) {
      return {
        statut: "erreur",
        message: `Le numéro ${n} existe déjà. Un numéro ne se réutilise jamais.`,
      };
    }
    if (existante && existante.contenu.numero !== edition.numero) {
      return { statut: "erreur", message: "Un numéro est attribué à vie." };
    }
    const id = await ecrireEdition(garde.config, {
      id: existante?.id ?? null,
      contenu: edition,
      relue,
    });
    revalidatePath("/admin/lettre");
    return {
      statut: "ok",
      message: relue
        ? `SIGNAL #${n} enregistré et marqué relu. Il peut partir.`
        : `SIGNAL #${n} enregistré en brouillon. Cochez la relecture avant l’envoi.`,
      editionId: id,
    };
  } catch (erreur) {
    return { statut: "erreur", message: message(erreur) };
  }
}

export async function envoyerEssaiEdition(
  _precedent: EtatConsole,
  donnees: FormData,
): Promise<EtatConsole> {
  const garde = await garder();
  if (!garde.ok) return garde.etat;
  const edition = lireEdition(donnees);
  const verdict = examinerEdition(edition);
  if (verdict.bloquants.length > 0) {
    return {
      statut: "erreur",
      message: "L’essai ne part pas tant que le numéro a des points bloquants.",
      details: verdict.bloquants,
    };
  }
  try {
    const r = await envoyerTestEdition(garde.config, edition, garde.email);
    return r.ok
      ? {
          statut: "ok",
          message: `Deux essais envoyés à ${garde.email}, en français et en anglais.`,
        }
      : { statut: "erreur", message: r.raison ?? "Essai non envoyé." };
  } catch (erreur) {
    return { statut: "erreur", message: message(erreur) };
  }
}

export async function envoyerLotEditionDuJour(
  donnees: FormData,
): Promise<void> {
  const garde = await garder();
  const issue = await (async (): Promise<Record<string, string>> => {
    if (!garde.ok) return { erreur: garde.etat.message ?? "Refus." };
    const id = String(donnees.get("id") ?? "");
    try {
      const edition = (await listerEditions(garde.config)).find(
        (e) => e.id === id,
      );
      if (!edition) return { erreur: "Numéro introuvable." };
      const verdict = examinerEdition(edition.contenu);
      if (verdict.bloquants.length > 0) {
        return { erreur: verdict.bloquants.join(" ") };
      }
      const bilan = await envoyerLotEdition(garde.config, edition);
      if (bilan.etat === "refus") return { erreur: bilan.raison };
      const n = numeroAffiche(edition.contenu.numero);
      const pluriel = bilan.envoyes > 1 ? "s" : "";
      const suite = bilan.reste
        ? "Des abonnés restent : relancer le lot demain."
        : `SIGNAL #${n} est parti à toute la liste et sa page publique est en ligne.`;
      return {
        ok: `${bilan.envoyes} message${pluriel} parti${pluriel}, ${bilan.en_echec} en échec. ${suite}`,
      };
    } catch (erreur) {
      return { erreur: message(erreur) };
    }
  })();
  retour(issue);
}

export async function importerStockSignal(): Promise<void> {
  const garde = await garder();
  const issue = await (async (): Promise<Record<string, string>> => {
    if (!garde.ok) return { erreur: garde.etat.message ?? "Refus." };
    try {
      const presents = new Set(
        (await listerEditions(garde.config)).map((e) => e.contenu.numero),
      );
      const manquants = STOCK_SIGNAL.filter((e) => !presents.has(e.numero));
      const crees = await importerEditions(garde.config, manquants);
      return {
        ok:
          crees > 0
            ? `${crees} numéro${crees > 1 ? "s" : ""} du stock importé${crees > 1 ? "s" : ""} en brouillon, à relire un par un avant l’envoi.`
            : "Tout le stock est déjà dans la base. Rien n’a été importé.",
      };
    } catch (erreur) {
      return { erreur: message(erreur) };
    }
  })();
  retour(issue);
}

export async function supprimerBrouillonEdition(
  donnees: FormData,
): Promise<void> {
  const garde = await garder();
  const issue = await (async (): Promise<Record<string, string>> => {
    if (!garde.ok) return { erreur: garde.etat.message ?? "Refus." };
    if (donnees.get("confirme") !== "oui") {
      return { erreur: "Suppression non confirmée." };
    }
    try {
      await supprimerBrouillon(garde.config, String(donnees.get("id") ?? ""));
      return { ok: "Brouillon supprimé. Son numéro redevient libre." };
    } catch (erreur) {
      return { erreur: message(erreur) };
    }
  })();
  retour(issue);
}

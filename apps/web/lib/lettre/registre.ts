import "server-only";

// =====================================================================
// EH0, le registre de la liste, dans sa base dediee (XDEC-38).
//
// Ce module ne parle qu'aux fonctions de packages/db/migrations-lettre.
// Il n'ecrit dans aucune table directement : les transitions d'etat, la
// provenance et le journal sont tenus en base, dans une transaction, et un
// defaut de ce code ne peut donc pas produire une adresse confirmee sans
// preuve ni une adresse desinscrite qui garde son email.
//
// Le client est construit sur l'URL et la cle de la lettre, jamais sur
// celles du cockpit. lib/lettre/config.ts refuse deja la confusion ; ce
// module ne lit aucune autre variable.
// =====================================================================

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ConfigLettre } from "./config";

let cache: { url: string; client: SupabaseClient } | null = null;

function client(config: ConfigLettre): SupabaseClient {
  if (cache?.url === config.supabaseUrl) return cache.client;
  const nouveau = createClient(config.supabaseUrl, config.supabaseCle, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application": "adama-os-lettre" } },
  });
  cache = { url: config.supabaseUrl, client: nouveau };
  return nouveau;
}

class ErreurRegistre extends Error {
  constructor(operation: string, message: string) {
    super(`Registre de la lettre, ${operation} : ${message}`);
    this.name = "ErreurRegistre";
  }
}

async function appel<T>(
  config: ConfigLettre,
  fonction: string,
  parametres: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await client(config).rpc(fonction, parametres);
  if (error) throw new ErreurRegistre(fonction, error.message);
  return data as T;
}

function premiere<T>(lignes: T[] | T | null): T | null {
  if (Array.isArray(lignes)) return lignes[0] ?? null;
  return lignes ?? null;
}

// --- Inscription et confirmation ------------------------------------------

type ResultatInscription =
  | "envoyer_confirmation"
  | "deja_confirme"
  | "trop_de_demandes"
  | "limite_ip";

type DemandeInscription = {
  email: string;
  emailEmpreinte: string;
  jetonEmpreinte: string;
  jetonExpireLe: Date;
  surface: "page_lettre";
  chemin: string;
  referentHote: string | null;
  campagne: Record<string, string>;
  langue: "fr" | "en";
  consentementVersion: string;
  ipEmpreinte: string | null;
};

export async function inscrire(
  config: ConfigLettre,
  d: DemandeInscription,
): Promise<{ resultat: ResultatInscription; abonneId: string | null }> {
  const ligne = premiere(
    await appel<{ resultat: ResultatInscription; abonne_id: string | null }[]>(
      config,
      "lettre_inscrire",
      {
        p_email: d.email,
        p_email_empreinte: d.emailEmpreinte,
        p_jeton_empreinte: d.jetonEmpreinte,
        p_jeton_expire_le: d.jetonExpireLe.toISOString(),
        p_surface: d.surface,
        p_chemin: d.chemin,
        p_referent_hote: d.referentHote,
        p_campagne: d.campagne,
        p_langue: d.langue,
        p_consentement_version: d.consentementVersion,
        p_ip_empreinte: d.ipEmpreinte,
      },
    ),
  );
  if (!ligne)
    throw new ErreurRegistre("lettre_inscrire", "aucune ligne rendue");
  return { resultat: ligne.resultat, abonneId: ligne.abonne_id };
}

export function confirmationEnvoyee(
  config: ConfigLettre,
  abonneId: string,
  fournisseurId: string,
): Promise<void> {
  return appel(config, "lettre_confirmation_envoyee", {
    p_abonne_id: abonneId,
    p_fournisseur_id: fournisseurId,
  });
}

export type EtatJeton = "valide" | "expire" | "invalide";

export async function etatJeton(
  config: ConfigLettre,
  jetonEmpreinte: string,
): Promise<EtatJeton> {
  const etat = await appel<EtatJeton | null>(config, "lettre_etat_jeton", {
    p_jeton_empreinte: jetonEmpreinte,
  });
  return etat ?? "invalide";
}

export async function confirmer(
  config: ConfigLettre,
  jetonEmpreinte: string,
  ipEmpreinte: string | null,
): Promise<{
  resultat: "confirme" | "expire" | "invalide";
  abonneId: string | null;
  email: string | null;
  cycle: number | null;
}> {
  const ligne = premiere(
    await appel<
      {
        resultat: "confirme" | "expire" | "invalide";
        abonne_id: string | null;
        email: string | null;
        cycle: number | null;
      }[]
    >(config, "lettre_confirmer", {
      p_jeton_empreinte: jetonEmpreinte,
      p_ip_empreinte: ipEmpreinte,
    }),
  );
  return {
    resultat: ligne?.resultat ?? "invalide",
    abonneId: ligne?.abonne_id ?? null,
    email: ligne?.email ?? null,
    cycle: ligne?.cycle ?? null,
  };
}

export function bienvenueEnvoyee(
  config: ConfigLettre,
  abonneId: string,
  fournisseurId: string,
): Promise<void> {
  return appel(config, "lettre_bienvenue_envoyee", {
    p_abonne_id: abonneId,
    p_fournisseur_id: fournisseurId,
  });
}

export type Destinataire = { abonneId: string; email: string; cycle?: number };

function destinataires(
  lignes: { abonne_id: string; email: string | null; cycle?: number }[] | null,
): Destinataire[] {
  return (lignes ?? [])
    .filter((l) => typeof l.email === "string")
    .map((l) => ({
      abonneId: l.abonne_id,
      email: l.email as string,
      ...(typeof l.cycle === "number" ? { cycle: l.cycle } : {}),
    }));
}

export async function bienvenuesEnAttente(
  config: ConfigLettre,
  limite: number,
): Promise<Destinataire[]> {
  return destinataires(
    await appel(config, "lettre_bienvenues_en_attente", { p_limite: limite }),
  );
}

// --- Retrait, droits, retention -------------------------------------------

type Motif =
  | "lien"
  | "en_tete_un_clic"
  | "demande_ecrite"
  | "rebond"
  | "plainte";

export async function desinscrire(
  config: ConfigLettre,
  abonneId: string,
  motif: Motif,
): Promise<"desinscrit" | "deja" | "inconnu"> {
  return appel(config, "lettre_desinscrire", {
    p_abonne_id: abonneId,
    p_motif: motif,
  });
}

export async function desinscrireParEmpreinte(
  config: ConfigLettre,
  emailEmpreinte: string,
  motif: Motif,
): Promise<"desinscrit" | "deja" | "inconnu"> {
  return appel(config, "lettre_desinscrire_par_empreinte", {
    p_email_empreinte: emailEmpreinte,
    p_motif: motif,
  });
}

export function exporter(
  config: ConfigLettre,
  emailEmpreinte: string,
): Promise<Record<string, unknown> | null> {
  return appel(config, "lettre_exporter", {
    p_email_empreinte: emailEmpreinte,
  });
}

export type BilanPurge = {
  demandes_jamais_confirmees: number;
  reinscriptions_expirees: number;
  preuves_de_retrait_echues: number;
};

export function purger(config: ConfigLettre): Promise<BilanPurge> {
  return appel(config, "lettre_purger");
}

export function envoisDuJour(config: ConfigLettre): Promise<number> {
  return appel(config, "lettre_envois_du_jour");
}

export type EtatListe = {
  en_attente: number;
  confirmes: number;
  desinscrits: number;
  expires: number;
  bienvenues_en_attente: number;
  envois_du_jour: number;
  derniere_purge: string | null;
  consentement_version: string | null;
};

export function etatListe(config: ConfigLettre): Promise<EtatListe> {
  return appel(config, "lettre_etat");
}

// --- Notes trimestrielles --------------------------------------------------

export type LigneNote = {
  id: string;
  code: string;
  objet: string;
  decide: string;
  echoue: string;
  preparation: string;
  statut: "brouillon" | "envoi_en_cours" | "envoyee";
  relue_desidentification: boolean;
  cree_le: string;
  envoi_commence_le: string | null;
  envoi_termine_le: string | null;
  envois: number;
};

export async function listerNotes(config: ConfigLettre): Promise<LigneNote[]> {
  const { data, error } = await client(config)
    .from("lettre_notes")
    .select(
      "id, code, objet, decide, echoue, preparation, statut, relue_desidentification, cree_le, envoi_commence_le, envoi_termine_le, lettre_envois(count)",
    )
    .order("cree_le", { ascending: false });
  if (error) throw new ErreurRegistre("lister les notes", error.message);
  return (data ?? []).map((n) => {
    const { lettre_envois: compte, ...reste } = n as typeof n & {
      lettre_envois: { count: number }[];
    };
    return {
      ...(reste as Omit<LigneNote, "envois">),
      envois: compte?.[0]?.count ?? 0,
    };
  });
}

export async function enregistrerNote(
  config: ConfigLettre,
  note: {
    id: string | null;
    code: string;
    objet: string;
    decide: string;
    echoue: string;
    preparation: string;
    relue: boolean;
  },
): Promise<string> {
  const ligne = {
    code: note.code,
    objet: note.objet,
    decide: note.decide,
    echoue: note.echoue,
    preparation: note.preparation,
    relue_desidentification: note.relue,
  };
  const requete = note.id
    ? client(config)
        .from("lettre_notes")
        .update(ligne)
        .eq("id", note.id)
        .eq("statut", "brouillon")
        .select("id")
        .single()
    : client(config).from("lettre_notes").insert(ligne).select("id").single();
  const { data, error } = await requete;
  if (error) throw new ErreurRegistre("enregistrer la note", error.message);
  return (data as { id: string }).id;
}

export async function demarrerNote(
  config: ConfigLettre,
  noteId: string,
): Promise<
  "en_cours" | "envoyee" | "non_relue" | "inconnue" | "autre_note_en_cours"
> {
  return appel(config, "lettre_note_demarrer", { p_note_id: noteId });
}

export async function destinatairesNote(
  config: ConfigLettre,
  noteId: string,
  limite: number,
): Promise<Destinataire[]> {
  return destinataires(
    await appel(config, "lettre_destinataires_note", {
      p_note_id: noteId,
      p_limite: limite,
    }),
  );
}

export function noteEnvoyee(
  config: ConfigLettre,
  noteId: string,
  abonneId: string,
  fournisseurId: string,
): Promise<void> {
  return appel(config, "lettre_note_envoyee", {
    p_note_id: noteId,
    p_abonne_id: abonneId,
    p_fournisseur_id: fournisseurId,
  });
}

export function clore(
  config: ConfigLettre,
  noteId: string,
): Promise<"reste" | "close"> {
  return appel(config, "lettre_note_clore_si_complete", { p_note_id: noteId });
}

export function testEnvoye(
  config: ConfigLettre,
  fournisseurId: string,
): Promise<void> {
  return appel(config, "lettre_test_envoye", {
    p_fournisseur_id: fournisseurId,
  });
}

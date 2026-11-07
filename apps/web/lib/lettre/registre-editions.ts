import "server-only";

// =====================================================================
// EH4, le registre des numeros de SIGNAL (0003_editions).
//
// Meme regle que lib/lettre/registre.ts : les transitions d'etat passent
// par les fonctions de la base. Les lectures directes de tables ne servent
// qu'a lister, et les ecritures directes ne touchent que des brouillons,
// que le declencheur lettre_figer_edition protege de toute facon.
// =====================================================================

import type { ConfigLettre } from "./config";
import {
  depuisColonnes,
  versColonnes,
  type ColonnesEdition,
  type ContenuEdition,
  type Langue,
} from "./editions";
import { appel, client, ErreurRegistre } from "./registre";

type StatutEdition = "brouillon" | "envoi_en_cours" | "envoyee";

type Revision = {
  version: number;
  motif: string;
  revise_le: string;
  avant: ContenuEdition;
};

export type LigneEdition = {
  id: string;
  contenu: ContenuEdition;
  version: number;
  statut: StatutEdition;
  relue: boolean;
  cree_le: string;
  modifie_le: string;
  envoi_commence_le: string | null;
  envoi_termine_le: string | null;
  envois: number;
  revisions: Revision[];
};

const COLONNES_EDITION =
  "id, numero, version, statut, relue, cree_le, modifie_le, envoi_commence_le, envoi_termine_le, titre_fr, signal_fr, systeme_fr, decision_fr, construction_fr, idee_fr, source_fr, titre_en, signal_en, systeme_en, decision_en, construction_en, idee_en, source_en";

type LigneBrute = ColonnesEdition & {
  id: string;
  version: number;
  statut: StatutEdition;
  relue: boolean;
  cree_le: string;
  modifie_le: string;
  envoi_commence_le: string | null;
  envoi_termine_le: string | null;
  lettre_envois_editions?: { count: number }[];
  lettre_editions_revisions?: {
    version: number;
    motif: string;
    revise_le: string;
    avant: Omit<ColonnesEdition, "numero">;
  }[];
};

function lireLigne(l: LigneBrute): LigneEdition {
  return {
    id: l.id,
    contenu: depuisColonnes(l),
    version: l.version,
    statut: l.statut,
    relue: l.relue,
    cree_le: l.cree_le,
    modifie_le: l.modifie_le,
    envoi_commence_le: l.envoi_commence_le,
    envoi_termine_le: l.envoi_termine_le,
    envois: l.lettre_envois_editions?.[0]?.count ?? 0,
    revisions: (l.lettre_editions_revisions ?? [])
      .map((r) => ({
        version: r.version,
        motif: r.motif,
        revise_le: r.revise_le,
        avant: depuisColonnes({ ...r.avant, numero: l.numero }),
      }))
      .sort((a, b) => b.version - a.version),
  };
}

/** Toutes les editions, pour la console. */
export async function listerEditions(
  config: ConfigLettre,
): Promise<LigneEdition[]> {
  const { data, error } = await client(config)
    .from("lettre_editions")
    .select(
      `${COLONNES_EDITION}, lettre_envois_editions(count), lettre_editions_revisions(version, motif, revise_le, avant)`,
    )
    .order("numero", { ascending: true });
  if (error) throw new ErreurRegistre("lister les éditions", error.message);
  return ((data ?? []) as unknown as LigneBrute[]).map(lireLigne);
}

/**
 * Les numeros parus, pour les pages publiques. Seul le statut envoyee sort :
 * un brouillon ou un envoi en cours ne se lit jamais en public. Aucun
 * compteur d'envois ne sort non plus (XINV-21).
 */
export async function editionsParues(
  config: ConfigLettre,
): Promise<LigneEdition[]> {
  const { data, error } = await client(config)
    .from("lettre_editions")
    .select(
      `${COLONNES_EDITION}, lettre_editions_revisions(version, motif, revise_le, avant)`,
    )
    .eq("statut", "envoyee")
    .order("numero", { ascending: false });
  if (error) throw new ErreurRegistre("lire les numéros parus", error.message);
  return ((data ?? []) as unknown as LigneBrute[]).map((l) => ({
    ...lireLigne(l),
    envois: 0,
  }));
}

export async function enregistrerEdition(
  config: ConfigLettre,
  edition: { id: string | null; contenu: ContenuEdition; relue: boolean },
): Promise<string> {
  const ligne = { ...versColonnes(edition.contenu), relue: edition.relue };
  const requete = edition.id
    ? client(config)
        .from("lettre_editions")
        .update(ligne)
        .eq("id", edition.id)
        .eq("statut", "brouillon")
        .select("id")
        .single()
    : client(config)
        .from("lettre_editions")
        .insert(ligne)
        .select("id")
        .single();
  const { data, error } = await requete;
  if (error) throw new ErreurRegistre("enregistrer l’édition", error.message);
  return (data as { id: string }).id;
}

/** Importe des brouillons non relus, sans toucher un numero existant. */
export async function importerEditions(
  config: ConfigLettre,
  editions: readonly ContenuEdition[],
): Promise<number> {
  if (editions.length === 0) return 0;
  const { data, error } = await client(config)
    .from("lettre_editions")
    .upsert(
      editions.map((e) => ({ ...versColonnes(e), relue: false })),
      { onConflict: "numero", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw new ErreurRegistre("importer le stock", error.message);
  return (data ?? []).length;
}

export async function supprimerBrouillon(
  config: ConfigLettre,
  id: string,
): Promise<void> {
  const { error } = await client(config)
    .from("lettre_editions")
    .delete()
    .eq("id", id)
    .eq("statut", "brouillon");
  if (error) throw new ErreurRegistre("supprimer le brouillon", error.message);
}

type IssueDemarrageEdition =
  | "en_cours"
  | "envoyee"
  | "non_relue"
  | "inconnue"
  | "autre_edition_en_cours"
  | "note_en_cours"
  | "numero_precedent_non_parti";

export function demarrerEdition(
  config: ConfigLettre,
  editionId: string,
): Promise<IssueDemarrageEdition> {
  return appel(config, "lettre_edition_demarrer", {
    p_edition_id: editionId,
  });
}

type DestinataireEdition = { abonneId: string; email: string; langue: Langue };

export async function destinatairesEdition(
  config: ConfigLettre,
  editionId: string,
  limite: number,
): Promise<DestinataireEdition[]> {
  const lignes = await appel<
    { abonne_id: string; email: string | null; langue: string }[] | null
  >(config, "lettre_destinataires_edition", {
    p_edition_id: editionId,
    p_limite: limite,
  });
  return (lignes ?? [])
    .filter((l) => typeof l.email === "string")
    .map((l) => ({
      abonneId: l.abonne_id,
      email: l.email as string,
      langue: l.langue === "en" ? "en" : "fr",
    }));
}

export function editionEnvoyee(
  config: ConfigLettre,
  editionId: string,
  abonneId: string,
  langue: Langue,
  fournisseurId: string,
): Promise<void> {
  return appel(config, "lettre_edition_envoyee", {
    p_edition_id: editionId,
    p_abonne_id: abonneId,
    p_langue: langue,
    p_fournisseur_id: fournisseurId,
  });
}

export function cloreEdition(
  config: ConfigLettre,
  editionId: string,
): Promise<"reste" | "close"> {
  return appel(config, "lettre_edition_clore_si_complete", {
    p_edition_id: editionId,
  });
}

export function corrigerEdition(
  config: ConfigLettre,
  editionId: string,
  champs: Partial<Omit<ColonnesEdition, "numero">>,
  motif: string,
): Promise<number> {
  return appel(config, "lettre_edition_corriger", {
    p_edition_id: editionId,
    p_contenu: champs,
    p_motif: motif,
  });
}

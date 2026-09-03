// =====================================================================
// C6 et C7, lecture du journal d'architecture.
//
// Le contenu des ADR vit en base (decisions_log, format pose par les
// migrations 0005 et 0006). Ce module le lit avec la cle anonyme, donc
// filtre par la politique de securite : un ADR que Adama n'a pas relu n'est
// pas servi ici, la base elle-meme le refuse. Le filtre n'est pas dans ce
// fichier, et c'est voulu : une regle tenue par l'application se contourne
// par distraction, une regle tenue par la base ne se contourne pas.
//
// Une base injoignable et une base vide donnent le meme ecran. Le journal
// serveur les distingue. Cas le plus probable au premier deploiement : le
// code est en ligne avant que la migration 0005 ne soit passee.
// =====================================================================

import { createPublicClient } from "./supabase/public";

export type AdrStatut = "propose" | "accepte" | "remplace" | "abandonne";
export type AdrPortee =
  | "adama-os"
  | "esg-optimizer"
  | "strata-scope"
  | "groupe";
export type AdrImpact =
  | "architecture"
  | "conformite"
  | "cout"
  | "produit"
  | "securite";
export type AdrReversibilite = "forte" | "moyenne" | "faible";

export type AdrOption = {
  option: string;
  verdict: "retenue" | "ecartee";
  motif: string;
};

export type AdrPreuveKind =
  | "commit"
  | "fichier"
  | "route"
  | "test"
  | "migration"
  | "absence";

export type AdrPreuve = {
  kind: AdrPreuveKind;
  libelle: string;
  locator: string;
};

export type AdrRevirement = {
  croyais: string;
  invalide: string;
  fait: string;
  cout: string;
  coutEstime: boolean;
  regle: string;
};

export type AdrRow = {
  adr_id: string;
  title: string;
  date: string;
  status: AdrStatut;
  scope: AdrPortee;
  impact: AdrImpact;
  reversibility: AdrReversibilite;
  supersedes: string | null;
  context: string[] | null;
  options: AdrOption[] | null;
  decision: string | null;
  rationale: {
    technique: string;
    reglementaire: string;
    economique: string;
  } | null;
  tradeoff: string | null;
  consequence: string | null;
  evidence_refs: AdrPreuve[] | null;
  reconstructed: boolean;
  open_questions: string[] | null;
  revirement: AdrRevirement | null;
  tags: string[] | null;
  reasoning: string;
  updated_at: string;
};

/** Un ADR, augmente du lien vers celui qui le remplace. */
export type Adr = AdrRow & {
  /** adr_id de la decision qui remplace celle-ci. Null si aucune. */
  remplacePar: string | null;
  /** Titre de la decision remplacee, quand elle est servie. */
  remplaceTitre: string | null;
  remplaceParTitre: string | null;
};

const COLONNES =
  "adr_id, title, date, status, scope, impact, reversibility, supersedes, context, options, decision, rationale, tradeoff, consequence, evidence_refs, reconstructed, open_questions, revirement, tags, reasoning, updated_at";

// --- Libelles, un seul vocabulaire pour tout le site ------------------

export const STATUT_LABEL: Record<AdrStatut, string> = {
  propose: "Proposée",
  accepte: "Acceptée",
  remplace: "Remplacée",
  abandonne: "Abandonnée",
};

export const STATUT_DESCRIPTION: Record<AdrStatut, string> = {
  propose: "Écrite, pas encore tranchée.",
  accepte: "En vigueur aujourd’hui.",
  remplace:
    "Une décision ultérieure l’a remplacée. Elle reste en ligne, datée, et pointe vers celle qui la remplace.",
  abandonne: "Tranchée puis défaite, sans décision qui lui succède.",
};

export const PORTEE_LABEL: Record<AdrPortee, string> = {
  "adama-os": "Ce cockpit",
  "esg-optimizer": "ESG Optimizer",
  "strata-scope": "STRATA Scope",
  groupe: "Le groupe",
};

export const IMPACT_LABEL: Record<AdrImpact, string> = {
  architecture: "Architecture",
  conformite: "Conformité",
  cout: "Coût",
  produit: "Produit",
  securite: "Sécurité",
};

export const REVERSIBILITE_LABEL: Record<AdrReversibilite, string> = {
  forte: "Revenir en arrière est simple",
  moyenne: "Revenir en arrière demande un chantier",
  faible: "Revenir en arrière refait l’architecture",
};

export const REVERSIBILITE_COURT: Record<AdrReversibilite, string> = {
  forte: "réversible",
  moyenne: "réversible à un coût",
  faible: "difficilement réversible",
};

export const PREUVE_KIND_LABEL: Record<AdrPreuveKind, string> = {
  commit: "Commit",
  fichier: "Fichier",
  route: "Route",
  test: "Test",
  migration: "Migration",
  absence: "Absence vérifiable",
};

// --- Assemblage -------------------------------------------------------

/** Relie chaque decision a celle qui la remplace, dans les deux sens. */
function relier(rows: AdrRow[]): Adr[] {
  const parId = new Map(rows.map((r) => [r.adr_id, r]));
  const successeur = new Map<string, AdrRow>();
  for (const row of rows) {
    if (row.supersedes) {
      successeur.set(row.supersedes, row);
    }
  }
  return rows.map((row) => {
    const suivant = successeur.get(row.adr_id) ?? null;
    const remplace = row.supersedes ? parId.get(row.supersedes) : undefined;
    return {
      ...row,
      remplacePar: suivant?.adr_id ?? null,
      remplaceParTitre: suivant?.title ?? null,
      remplaceTitre: remplace?.title ?? null,
    };
  });
}

async function lire(): Promise<AdrRow[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("decisions_log")
    .select(COLONNES)
    .not("adr_id", "is", null)
    .order("date", { ascending: false })
    .order("adr_id", { ascending: true });

  if (error) {
    console.error("[decisions] journal illisible :", error.message);
    return [];
  }
  return (data as AdrRow[]) ?? [];
}

/** Toutes les decisions servies publiquement, reliees entre elles. */
export async function listAdr(): Promise<Adr[]> {
  return relier(await lire());
}

/** Une decision et ses liens. Null si inconnue ou non servie. */
export async function getAdr(adrId: string): Promise<Adr | null> {
  const toutes = await listAdr();
  return toutes.find((a) => a.adr_id === adrId) ?? null;
}

/**
 * C7. Les revirements : les decisions remplacees qui portent les six champs
 * narratifs. Une decision remplacee sans champ narratif n'est pas un
 * revirement, c'est une decision qui a vieilli.
 */
export async function listRevirements(): Promise<Adr[]> {
  const toutes = await listAdr();
  return toutes
    .filter((a) => a.revirement !== null)
    .sort((a, b) => a.adr_id.localeCompare(b.adr_id));
}

/** Index adr_id vers titre, pour un renvoi qui ne cite pas un titre faux. */
export async function titresAdr(): Promise<Map<string, string>> {
  const toutes = await listAdr();
  return new Map(toutes.map((a) => [a.adr_id, a.title]));
}

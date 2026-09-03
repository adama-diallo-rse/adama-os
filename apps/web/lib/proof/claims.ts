// =====================================================================
// C2, lecture des affirmations et de leurs preuves.
//
// Règle dure de la couche, tenue ici et pas ailleurs : une affirmation sans
// preuve NE SE REND PAS. Pas de version grisée, pas de dégradation polie.
// Elle est absente de la liste que ce module renvoie, donc absente de la
// page. Un composant ne peut pas la rendre par accident, il ne la reçoit
// jamais.
//
// Lecture par la clé anonyme, filtrée par la RLS (migration 0004) : les
// affirmations internes ne traversent pas, et les preuves d'une affirmation
// interne non plus.
// =====================================================================

import { createPublicClient } from "../supabase/public";
import {
  resolveClaimState,
  type Claim,
  type ClaimState,
  type DataClass,
} from "./types";

export type ProofSubjectType =
  | "produit"
  | "projet"
  | "competence"
  | "experience"
  | "systeme"
  | "metrique";

export type ProofVisibility = "public" | "technique" | "interne";

export type EvidenceKind =
  | "api"
  | "depot"
  | "commit"
  | "deploiement"
  | "base"
  | "document"
  | "attestation"
  | "capture";

export type VerifiableBy = "visiteur" | "adama" | "tiers";

export type EvidenceRow = {
  id: string;
  claim_id: string;
  kind: EvidenceKind;
  source: string;
  locator: string | null;
  method: string;
  observed_at: string | null;
  observed_result: string | null;
  verifiable_by: VerifiableBy;
  refresh_kind: string | null;
  position: number;
};

export type ClaimRow = {
  id: string;
  statement: string;
  subject_type: ProofSubjectType;
  subject_ref: string | null;
  data_class: DataClass;
  max_age_seconds: number | null;
  visibility: ProofVisibility;
  position: number;
  updated_at: string;
};

export type ProofClaim = {
  row: ClaimRow;
  evidence: EvidenceRow[];
  /** La provenance de l'affirmation, exprimée comme un Claim : c'est le même
   *  contrat que pour un chiffre, et donc le même marqueur à l'écran. */
  claim: Claim<string>;
  state: ClaimState;
};

const CLAIM_COLUMNS =
  "id, statement, subject_type, subject_ref, data_class, max_age_seconds, visibility, position, updated_at";
const EVIDENCE_COLUMNS =
  "id, claim_id, kind, source, locator, method, observed_at, observed_result, verifiable_by, refresh_kind, position";

/** Libellés lisibles. Un seul vocabulaire pour tout le site. */
export const EVIDENCE_KIND_LABEL: Record<EvidenceKind, string> = {
  api: "Appel d’API",
  depot: "Dépôt de code",
  commit: "Commit",
  deploiement: "Déploiement",
  base: "Lecture en base",
  document: "Document",
  attestation: "Attestation",
  capture: "Capture",
};

export const SUBJECT_LABEL: Record<ProofSubjectType, string> = {
  produit: "Produit",
  projet: "Projet",
  competence: "Compétence",
  experience: "Expérience",
  systeme: "Système",
  metrique: "Métrique",
};

export const VERIFIABLE_LABEL: Record<VerifiableBy, string> = {
  visiteur: "n’importe quel visiteur",
  adama: "Adama, sur demande",
  tiers: "un tiers nommé",
};

/**
 * La preuve la plus récemment observée d'une affirmation donne sa fraîcheur.
 * Une affirmation dont aucune preuve n'a jamais été observée reste absente,
 * quelle que soit la confiance qu'on lui porte.
 */
function derniereObservation(evidence: EvidenceRow[]): EvidenceRow | null {
  const observees = evidence.filter((e) => e.observed_at !== null);
  if (observees.length === 0) {
    return null;
  }
  return observees.reduce((a, b) =>
    (a.observed_at ?? "") >= (b.observed_at ?? "") ? a : b,
  );
}

/** Construit le Claim d'une affirmation à partir de ses preuves. */
export function claimOf(row: ClaimRow, evidence: EvidenceRow[]): Claim<string> {
  const derniere = derniereObservation(evidence);
  const sources = Array.from(new Set(evidence.map((e) => e.source)));
  return {
    // La valeur est l'affirmation elle-même. Elle n'existe que si quelque
    // chose a été observé : sinon l'état dérivé est "absent", et le marqueur
    // le dit au lieu de laisser croire à une vérification.
    value: derniere ? row.statement : null,
    dataClass: row.data_class,
    source: sources.join(", ") || "source non déclarée",
    method: derniere?.method ?? evidence[0]?.method ?? "Méthode non déclarée.",
    fetchedAt: derniere?.observed_at ?? null,
    publishedAt: row.data_class === "historical" ? derniere?.observed_at : null,
    maxAgeSeconds: row.max_age_seconds,
    lastAttemptAt: derniere?.observed_at ?? null,
  };
}

function assembler(
  rows: ClaimRow[],
  evidence: EvidenceRow[],
  now?: Date,
): ProofClaim[] {
  const parClaim = new Map<string, EvidenceRow[]>();
  for (const e of evidence) {
    const liste = parClaim.get(e.claim_id) ?? [];
    liste.push(e);
    parClaim.set(e.claim_id, liste);
  }
  return (
    rows
      .map((row) => {
        const preuves = (parClaim.get(row.id) ?? []).sort(
          (a, b) => a.position - b.position || a.id.localeCompare(b.id),
        );
        const claim = claimOf(row, preuves);
        return {
          row,
          evidence: preuves,
          claim,
          state: resolveClaimState(claim, now),
        };
      })
      // La règle dure. Aucune affirmation sans preuve ne sort d'ici.
      .filter((c) => c.evidence.length > 0)
      .sort(
        (a, b) =>
          a.row.position - b.row.position || a.row.id.localeCompare(b.row.id),
      )
  );
}

/** Toutes les affirmations servies publiquement, avec leurs preuves. */
export async function listClaims(options?: {
  visibility?: ProofVisibility[];
  now?: Date;
}): Promise<ProofClaim[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const visibilites = options?.visibility ?? ["public", "technique"];

  const { data: claims, error } = await supabase
    .from("proof_claims")
    .select(CLAIM_COLUMNS)
    .in("visibility", visibilites)
    .order("position", { ascending: true });

  // Un registre injoignable et un registre vide donnent le meme ecran. Le
  // journal serveur les distingue. Cas le plus probable : le code est deploye
  // avant que la migration 0004 ne soit passee.
  if (error) {
    console.error("[preuves] registre illisible :", error.message);
  }

  const rows = (claims as ClaimRow[]) ?? [];
  if (rows.length === 0) {
    return [];
  }

  const { data: evidence } = await supabase
    .from("proof_evidence")
    .select(EVIDENCE_COLUMNS)
    .in(
      "claim_id",
      rows.map((r) => r.id),
    )
    .order("position", { ascending: true });

  return assembler(rows, (evidence as EvidenceRow[]) ?? [], options?.now);
}

/** Une affirmation et ses preuves. Null si inconnue ou sans preuve. */
export async function getClaim(
  id: string,
  now?: Date,
): Promise<ProofClaim | null> {
  const supabase = createPublicClient();
  if (!supabase) {
    return null;
  }
  const { data: claims, error } = await supabase
    .from("proof_claims")
    .select(CLAIM_COLUMNS)
    .eq("id", id)
    .limit(1);

  if (error) {
    console.error("[preuves] registre illisible :", error.message);
  }

  const rows = (claims as ClaimRow[]) ?? [];
  if (rows.length === 0) {
    return null;
  }

  const { data: evidence } = await supabase
    .from("proof_evidence")
    .select(EVIDENCE_COLUMNS)
    .eq("claim_id", id)
    .order("position", { ascending: true });

  const assemblees = assembler(rows, (evidence as EvidenceRow[]) ?? [], now);
  return assemblees[0] ?? null;
}

export { assembler as assemblerClaims };

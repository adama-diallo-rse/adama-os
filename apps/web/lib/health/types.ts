// =====================================================================
// C3-T1 et C3-T2, la sante par capacite.
//
// Deux idees portent ce module, et rien d'autre.
//
// SANTE N'EST PAS DISPONIBILITE. Un service qui repond 200 avec un corpus
// vide n'est pas en bonne sante, il est disponible et inutile. Une capacite
// declare donc ses criteres METIER, et son etat se deduit d'eux, jamais d'un
// code HTTP.
//
// EXPOSER LE DEFAUT VAUT MIEUX QUE LE MASQUER. Trois etats seulement, et le
// troisieme est le plus important : INDETERMINE dit qu'on ne sait pas, et le
// dire est une information. Le convertir en DEGRADE serait inventer une
// panne ; le convertir en OPERATIONNEL serait inventer une sante.
//
// Module pur : aucune lecture de base, aucun acces reseau, aucun process.env.
// Il traverse donc sans risque vers un composant client, et il se teste sans
// rien brancher. La collecte vit dans ./collect.ts, qui est serveur.
// =====================================================================

/** Les sept capacites du systeme. L'ordre est celui de l'affichage. */
export const CAPABILITY_IDS = [
  "base",
  "github",
  "rag",
  "passerelles",
  "analytique",
  "assistant",
  "sauvegarde",
] as const;

export type CapabilityId = (typeof CAPABILITY_IDS)[number];

/** Trois etats, jamais davantage. */
export type HealthState = "operationnel" | "degrade" | "indetermine";

/** Verdict d'un critere. `inconnu` n'est pas un echec, c'est une absence. */
export type CriterionVerdict = "tenu" | "non_tenu" | "inconnu";

export type Criterion = {
  id: string;
  /** Ce que le critere exige, en francais courant. */
  label: string;
  verdict: CriterionVerdict;
  /** Ce qui a ete observe. Jamais un code d'erreur brut. */
  observed: string;
};

export type Capability = {
  id: CapabilityId;
  /** Nom lisible, celui qu'un visiteur non technique comprend. */
  name: string;
  /** Ce que la capacite rend possible, en une phrase. */
  purpose: string;
  criteria: Criterion[];
};

export type CapabilityHealth = Capability & {
  state: HealthState;
  /**
   * Raison de l'etat, en UNE phrase de francais. Null quand la capacite est
   * operationnelle. Jamais un code d'erreur, jamais un nom de service
   * technique non public, jamais une URL interne.
   */
  reason: string | null;
};

export type HealthMatrix = {
  capabilities: CapabilityHealth[];
  /** Instant de la lecture, ISO 8601. */
  observedAt: string;
};

export const HEALTH_LABEL: Record<HealthState, string> = {
  operationnel: "OPÉRATIONNEL",
  degrade: "DÉGRADÉ",
  indetermine: "INDÉTERMINÉ",
};

export const HEALTH_DESCRIPTION: Record<HealthState, string> = {
  operationnel: "La capacité remplit tous ses critères métier.",
  degrade:
    "La capacité répond, mais elle ne remplit pas l’un de ses critères. La raison est donnée.",
  indetermine:
    "L’état n’a pas pu être établi. Ce n’est pas une panne constatée, c’est une absence de mesure.",
};

export const VERDICT_LABEL: Record<CriterionVerdict, string> = {
  tenu: "TENU",
  non_tenu: "NON TENU",
  inconnu: "NON MESURÉ",
};

/**
 * Etat d'une capacite a partir de ses criteres.
 *
 * L'ordre des tests EST la doctrine de la couche :
 *   1. un critere non tenu domine tout. Un defaut constate ne s'efface pas
 *      derriere une mesure manquante ;
 *   2. sinon, un critere non mesure rend l'etat indetermine. On ne conclut
 *      pas a la sante sur une mesure qu'on n'a pas faite ;
 *   3. sinon, operationnel.
 *
 * Une capacite sans critere est indeterminee, jamais operationnelle : c'est
 * exactement le cas ou l'on ne sait rien.
 */
export function resolveHealthState(criteria: Criterion[]): HealthState {
  if (criteria.length === 0) {
    return "indetermine";
  }
  if (criteria.some((c) => c.verdict === "non_tenu")) {
    return "degrade";
  }
  if (criteria.some((c) => c.verdict === "inconnu")) {
    return "indetermine";
  }
  return "operationnel";
}

/**
 * Raison de l'etat, en une phrase. Elle est prise sur le PREMIER critere qui
 * l'explique, dans l'ordre declare : les criteres sont ranges du plus
 * structurant au plus fin, donc le premier defaut est le plus explicatif.
 */
export function resolveHealthReason(criteria: Criterion[]): string | null {
  const state = resolveHealthState(criteria);
  if (state === "operationnel") {
    return null;
  }
  if (criteria.length === 0) {
    return "Aucun critère n’est défini pour cette capacité.";
  }
  const cible =
    state === "degrade"
      ? criteria.find((c) => c.verdict === "non_tenu")
      : criteria.find((c) => c.verdict === "inconnu");
  return cible ? cible.observed : null;
}

/** Assemble une capacite complete a partir de sa definition et de ses criteres. */
export function toCapabilityHealth(capability: Capability): CapabilityHealth {
  return {
    ...capability,
    state: resolveHealthState(capability.criteria),
    reason: resolveHealthReason(capability.criteria),
  };
}

/**
 * Interdit de synthese, tenu par le type et par le test.
 *
 * Il n'existe volontairement AUCUNE fonction qui rende un etat global de la
 * matrice. Un vert unique qui agrege sept capacites dans des etats
 * differents est un mensonge de synthese, et c'est le premier interdit de la
 * couche C3. Ce compteur est le seul resume autorise : il compte, il ne
 * conclut pas.
 */
export function countByState(
  capabilities: CapabilityHealth[],
): Record<HealthState, number> {
  return {
    operationnel: capabilities.filter((c) => c.state === "operationnel").length,
    degrade: capabilities.filter((c) => c.state === "degrade").length,
    indetermine: capabilities.filter((c) => c.state === "indetermine").length,
  };
}

// =====================================================================
// C1-T3, le type Claim.
//
// Regle de la couche : aucun composant d'affichage de metrique n'accepte un
// `number`. Il accepte un `Claim<number>`. Le type rend donc impossible le
// rendu d'une valeur nue : pour afficher un chiffre, il faut avoir dit d'ou
// il vient, comment il a ete obtenu et quand.
//
// Trois classes stockees en base, deux etats derives a la lecture.
//
//   real        source reelle, lue maintenant. Exige source, method,
//               fetchedAt, et une duree de validite.
//   historical  valeur reelle publiee a une date passee, figee. Exige source
//               et publishedAt. Jamais presentee au present.
//   demo        jeu d'illustration. Ne decrit rien de reel. Le libelle
//               DEMONSTRATION est indetachable de la valeur, et exclu de
//               toute agregation.
//   absent      derive : il n'y a pas de valeur. On montre la source attendue
//               et la derniere tentative, jamais un zero de remplacement.
//   stale       derive : fetchedAt depasse maxAgeSeconds. La valeur reste
//               lisible mais porte la mention PERIMEE.
//
// Pourquoi absent et stale ne sont pas stockes : ce sont des deductions qui
// dependent de l'instant de lecture. Les ecrire en base reviendrait a garder
// une conclusion prise a un autre moment que celui de l'affichage.
// =====================================================================

/** Classe stockee en base (type Postgres data_class, migration 0003). */
export type DataClass = "real" | "historical" | "demo";

/** Etat rendu a l'ecran : les trois classes plus les deux etats derives. */
export type ClaimState = DataClass | "absent" | "stale";

/** C1-T7, nature d'un echec de sonde. Miroir du type Postgres. */
export type ProbeFailureKind =
  | "produit_non_sain"
  | "delai_depasse"
  | "erreur_reseau"
  | "reponse_illisible";

export type Claim<T> = {
  /** La valeur. `null` signifie absente, jamais zero par commodite. */
  value: T | null;
  dataClass: DataClass;
  /** Nom lisible de la source, attendue meme quand elle n'a pas repondu. */
  source: string;
  /** Comment la valeur est obtenue, en une phrase. */
  method: string;
  /** Instant du releve, ISO 8601. Null : jamais observee. */
  fetchedAt: string | null;
  /** Date de publication d'une valeur historique, ISO 8601. */
  publishedAt?: string | null;
  /** Duree de validite en secondes. Null : la valeur ne perime pas. */
  maxAgeSeconds?: number | null;
  /** Derniere tentative, pour l'etat absent. ISO 8601. */
  lastAttemptAt?: string | null;
  /** Nature de l'echec quand la valeur est absente. */
  failure?: ProbeFailureKind | null;
  /** Periode couverte, ex. "2026-08". Null pour un point instantane. */
  period?: string | null;
  /** Suffixe d'unite affiche apres la valeur, ex. "%". */
  suffix?: string;
};

/** Age d'un releve en secondes. Null si le releve n'a jamais eu lieu. */
export function claimAgeSeconds<T>(
  claim: Claim<T>,
  now: Date = new Date(),
): number | null {
  if (!claim.fetchedAt) {
    return null;
  }
  const t = Date.parse(claim.fetchedAt);
  if (Number.isNaN(t)) {
    return null;
  }
  return Math.max(0, Math.round((now.getTime() - t) / 1000));
}

/**
 * Etat a rendre pour une affirmation chiffree.
 *
 * L'ordre des tests est le contrat lui-meme :
 *   1. pas de valeur, donc absente. Aucune classe ne rattrape une absence ;
 *   2. demonstration, qui prime sur toute consideration de fraicheur : une
 *      valeur inventee ne devient pas plus vraie en vieillissant, et pas
 *      moins fausse en etant recente ;
 *   3. historique, qui ne perime pas : elle est deja datee au passe ;
 *   4. reelle mais trop vieille, donc perimee ;
 *   5. reelle.
 */
export function resolveClaimState<T>(
  claim: Claim<T>,
  now: Date = new Date(),
): ClaimState {
  if (claim.value === null || claim.value === undefined) {
    return "absent";
  }
  if (claim.dataClass === "demo") {
    return "demo";
  }
  if (claim.dataClass === "historical") {
    return "historical";
  }
  const max = claim.maxAgeSeconds;
  if (typeof max === "number" && max > 0) {
    const age = claimAgeSeconds(claim, now);
    if (age === null || age > max) {
      return "stale";
    }
  }
  return "real";
}

/** Libelle affiche pour chaque etat. Une seule table, un seul vocabulaire. */
export const CLAIM_STATE_LABEL: Record<ClaimState, string> = {
  real: "SOURCE",
  historical: "VALEUR AU",
  demo: "DÉMONSTRATION",
  absent: "SOURCE INDISPONIBLE",
  stale: "PÉRIMÉE",
};

/** Phrase complete, pour les lecteurs d'ecran et l'attribut title. */
export const CLAIM_STATE_DESCRIPTION: Record<ClaimState, string> = {
  real: "Donnée réelle, relevée à sa source.",
  historical: "Valeur réelle publiée à une date passée. Elle décrit le passé.",
  demo: "Donnée de démonstration. Elle ne décrit rien de réel et n’entre dans aucun total.",
  absent: "La source n’a pas répondu. Aucune valeur n’est affichée à la place.",
  stale: "Valeur réelle, plus ancienne que sa durée de validité.",
};

/** Libelle lisible d'une nature d'echec de sonde. */
export const FAILURE_LABEL: Record<ProbeFailureKind, string> = {
  produit_non_sain: "le produit a répondu un état non sain",
  delai_depasse: "le délai d’attente a été dépassé",
  erreur_reseau: "la sortie réseau du cockpit a échoué",
  reponse_illisible: "la réponse n’était pas exploitable",
};

/** Une classe demo n'entre dans aucun total. Garde-fou d'agregation. */
export function aggregable<T>(claim: Claim<T>): boolean {
  return claim.dataClass !== "demo" && claim.value !== null;
}

/** Formatage FR d'une duree en secondes, pour la fraicheur restante. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} j`;
}

/** Temps restant avant peremption. Null si la valeur ne perime pas. */
export function timeToStale<T>(
  claim: Claim<T>,
  now: Date = new Date(),
): number | null {
  const max = claim.maxAgeSeconds;
  const age = claimAgeSeconds(claim, now);
  if (typeof max !== "number" || max <= 0 || age === null) {
    return null;
  }
  return max - age;
}

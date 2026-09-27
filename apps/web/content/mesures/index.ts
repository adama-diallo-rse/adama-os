// =====================================================================
// EM2, les relevés publiés de la mesure de M-001.
//
// Un relevé est un fichier JSON écrit par `node scripts/mesure-m001.mjs
// --ecrire`, jamais à la main. Il n'est pas réécrit : un nouveau relevé
// ajoute un fichier daté et une ligne ici. Les totaux affichés sont recalculés
// depuis les preuves du fichier, jamais lus dans son champ « totaux » (XINV-25).
// =====================================================================

import releve20260927 from "./m001-2026-09-27.json";

type Verdict =
  | "concordant"
  | "valeur_changee"
  | "discordant"
  | "non_reproductible"
  | "hors_tiers";

type PreuveRelevee = {
  affirmation: string;
  nature: string;
  adresse: string;
  publie: string | null;
  publieLe: string | null;
  verifiablePar?: string;
  verdict: Verdict;
  reobserve: string;
};

type ReleveM001 = {
  mesure: string;
  protocole: string;
  site: string;
  releveLe: string;
  derniereVerificationDuSite: string;
  basePublique: string | null;
  affirmations: number;
  preuves: PreuveRelevee[];
  totaux: Record<string, number>;
};

/** Du plus récent au plus ancien. */
export const RELEVES_M001: readonly ReleveM001[] = [
  releve20260927 as ReleveM001,
];

export function totauxDe(releve: ReleveM001) {
  const compte = (v: Verdict) =>
    releve.preuves.filter((p) => p.verdict === v).length;
  const preuves = releve.preuves.length;
  const concordant = compte("concordant");
  return {
    preuves,
    concordant,
    valeurChangee: compte("valeur_changee"),
    discordant: compte("discordant"),
    nonReproductible: compte("non_reproductible"),
    horsTiers: compte("hors_tiers"),
    taux: preuves === 0 ? null : Math.round((concordant / preuves) * 100),
  };
}

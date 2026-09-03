// =====================================================================
// C12-T2, lecture du rapport d'integrite.
//
// Le site LIT docs/integrity.json, il ne le calcule pas. Trois consequences,
// toutes voulues :
//   - un controle en echec s'affiche en echec. Il n'est ni masque, ni
//     dramatise, ni converti en avertissement ;
//   - le rapport porte son age, et au-dela de sept jours l'age devient
//     l'information principale. Un resultat ancien ne dit plus rien du
//     present, meme quand il est vert ;
//   - un rapport jamais execute n'affiche aucun resultat. Pas un vert par
//     defaut, pas un zero : rien, et la raison.
//
// Import et non lecture de fichier a l'execution, pour la meme raison que
// l'inventaire : un import est trace par la construction, une lecture de
// fichier ne survit pas au deploiement sans serveur.
// =====================================================================

import rapport from "../../../docs/integrity.json";

export type ControlStatus = "reussi" | "echoue" | "non_execute";

export type IntegrityControl = {
  id: string;
  label: string;
  detail: string;
  status: ControlStatus;
  message: string;
};

export type IntegrityReport = {
  executedAt: string;
  verdict: "ok" | "partiel" | "echec";
  controls: IntegrityControl[];
  buildInclus: boolean;
  modesDePanneConformes: boolean;
  /** Age du rapport en jours, calcule a la lecture. */
  ageJours: number;
  /** Au-dela de ce seuil, l'age prime sur le resultat. */
  perime: boolean;
};

type IntegrityFile = {
  executed_at: string | null;
  verdict: "ok" | "partiel" | "echec" | null;
  build_inclus?: boolean;
  modes_de_panne_conformes?: boolean;
  controls: {
    id: string;
    label: string;
    detail: string;
    status: ControlStatus;
    message: string;
  }[];
};

/** Age au-dela duquel l'age devient l'information principale, en jours. */
export const FRAICHEUR_INTEGRITE_JOURS = 7;

export const CONTROL_LABEL: Record<ControlStatus, string> = {
  reussi: "RÉUSSI",
  echoue: "EN ÉCHEC",
  non_execute: "NON EXÉCUTÉ",
};

export const CONTROL_DESCRIPTION: Record<ControlStatus, string> = {
  reussi: "La commande a tourné et elle a rendu un succès.",
  echoue: "La commande a tourné et elle a rendu un échec.",
  non_execute:
    "La commande n’a pas tourné. Ce n’est pas un échec, et ce n’est pas une réussite.",
};

/**
 * Le rapport, ou null s'il n'a jamais ete produit.
 *
 * `now` est injectable pour que l'age soit testable sans dependre de
 * l'horloge : un test qui depend de l'heure passe le lundi et echoue le
 * mercredi, et on finit par le desactiver.
 */
export function lireIntegrite(now: Date = new Date()): IntegrityReport | null {
  const f = rapport as unknown as IntegrityFile;
  if (!f.executed_at || !f.verdict) {
    return null;
  }
  const t = Date.parse(f.executed_at);
  const age = Number.isNaN(t)
    ? 0
    : Math.max(0, Math.floor((now.getTime() - t) / 86400000));
  return {
    executedAt: f.executed_at,
    verdict: f.verdict,
    controls: f.controls,
    buildInclus: f.build_inclus ?? false,
    modesDePanneConformes: f.modes_de_panne_conformes ?? false,
    ageJours: age,
    perime: age > FRAICHEUR_INTEGRITE_JOURS,
  };
}

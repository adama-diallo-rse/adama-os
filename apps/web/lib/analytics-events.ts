// =====================================================================
// C13-T1 et C13-T2, les evenements, en un seul endroit.
//
// Les noms d'evenements etaient jusqu'ici ecrits en clair au point d'appel.
// Un entonnoir se configure a la main dans une interface, en recopiant ces
// noms : une faute de frappe produit un entonnoir vide, qui ressemble a un
// parcours que personne n'emprunte. C'est la pire des erreurs de mesure,
// parce qu'elle se conclut au lieu de s'apercevoir.
//
// Ce module est aussi la liste que docs/ENTONNOIRS.md recopie, et
// scripts/inventory.mjs releve les noms reellement emis dans le code : les
// trois se comparent.
//
// Module pur, sans acces au navigateur : il traverse vers le serveur comme
// vers le client.
// =====================================================================

/** Les evenements du parcours recruteur, poses en aout 2026. */
export const EVENT_RECRUITER_MODAL = "recruiter_modal_opened";
export const EVENT_RECRUITER_CV = "recruiter_cv_download";
export const EVENT_RECRUITER_CAL = "recruiter_cal_opened";
export const EVENT_RECRUITER_INTENT = "recruiter_intent";
export const EVENT_RECRUITER_PRINT = "recruiter_view_print";

/** Sorties vers un produit du groupe. Voir lib/outbound.ts. */
export const EVENT_OUTBOUND = "ecosystem_outbound";
export const EVENT_OUTBOUND_LEGACY = "strata_outbound";

/**
 * C13-T1, les evenements ouverts par les couches C2 a C10.
 *
 * `proof_verify_opened` est le plus interessant des cinq, et il est
 * specifique a ce site : il mesure combien de visiteurs prennent la peine de
 * VERIFIER une affirmation. Aucun portfolio ne mesure cela, parce qu'aucun
 * portfolio ne propose de le faire.
 */
export const EVENT_PROOF_VERIFY = "proof_verify_opened";
export const EVENT_ADR_OPENED = "adr_opened";
export const EVENT_BUILD_LOG_RAW = "build_log_raw";
export const EVENT_TECHNIQUE_OPENED = "technique_opened";
export const EVENT_PROOF_PACK = "proof_pack_download";

/**
 * Tous les evenements emis par ce site, dans l'ordre ou ils apparaissent
 * dans les entonnoirs. Sert de reference a docs/ENTONNOIRS.md et au test qui
 * verifie qu'aucun evenement n'est emis sans figurer ici.
 */
export const EVENEMENTS = [
  EVENT_RECRUITER_MODAL,
  EVENT_RECRUITER_INTENT,
  EVENT_RECRUITER_CV,
  EVENT_RECRUITER_CAL,
  EVENT_RECRUITER_PRINT,
  EVENT_OUTBOUND,
  EVENT_OUTBOUND_LEGACY,
  EVENT_PROOF_VERIFY,
  EVENT_ADR_OPENED,
  EVENT_BUILD_LOG_RAW,
  EVENT_TECHNIQUE_OPENED,
  EVENT_PROOF_PACK,
] as const;

export type EvenementConnu = (typeof EVENEMENTS)[number];

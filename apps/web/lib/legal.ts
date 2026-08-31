// L10, textes et constantes de conformité.
//
// Article 50 du règlement européen sur l'intelligence artificielle, applicable
// depuis le 2 août 2026 : une personne qui interagit avec un système
// automatisé doit en être informée, clairement et au premier contact.
// Le garde-fou historique du projet, « aucune mention d'IA côté client », est
// amendé sur ce point précis : sur adama.ai, la mention est obligatoire.
//
// Cette chaîne est verrouillée par un test (apps/web/tests/legal.test.tsx) :
// un nettoyage de texte ne peut pas la faire disparaître sans faire rougir la
// suite de tests.
export const AUTOMATED_PROCESSING_NOTICE =
  "Agent automatisé. Les réponses sont générées à partir de documents de référence et peuvent comporter des erreurs : vérifiez tout point réglementaire avant un usage engageant.";

/** Version courte, pour un espace contraint (en-tête du panneau). */
export const AUTOMATED_PROCESSING_SHORT = "Agent automatisé";

/** Date d'entrée en vigueur du marquage lisible par machine. */
export const MACHINE_MARKING_DEADLINE = "2026-12-02";

/** Éditeur du site, repris à l'identique par les deux pages légales. */
export const EDITEUR = {
  nom: "Adama Diallo",
  statut: "personne physique",
  objet: "site personnel, sans activité commerciale ni collecte de paiement",
  contact: "diadamflow@gmail.com",
} as const;

/** Date de dernière mise à jour des pages légales. */
export const LEGAL_UPDATED_AT = "2026-08-31";

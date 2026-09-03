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

/**
 * C11-T5, valeur de l'en-tête de provenance posé sur les réponses de
 * l'assistant. Une déclaration lisible par un programme, jamais présentée
 * comme une preuve : le vocabulaire interdit de ce dépôt s'applique ici en
 * premier (infalsifiable, inaltérable, horodatage certifié, registre
 * qualifié).
 */
export const PROVENANCE_HEADER = "ai-generated; model=llm; retrieval=corpus";

/** Éditeur du site, repris à l'identique par les deux pages légales. */
export const EDITEUR = {
  nom: "Adama Diallo",
  statut: "personne physique",
  objet: "site personnel, sans activité commerciale ni collecte de paiement",
  contact: "diadamflow@gmail.com",
} as const;

/** Date de dernière mise à jour des pages légales. */
export const LEGAL_UPDATED_AT = "2026-08-31";

/** Date d'echeance du marquage machine, en francais, pour l'affichage. */
export const ECHEANCE_MARQUAGE = "2 décembre 2026";

/**
 * C11-T1, les sous-traitants, source unique.
 *
 * Cette liste vivait dans /confidentialite. La page /confiance en avait
 * besoin aussi, et une seconde liste aurait diverge : c'est exactement le
 * defaut que la source unique de profil a ferme en septembre 2026, sur les
 * intitules de poste. Une seule liste, deux pages qui la lisent.
 *
 * `region` decrit ce qui est ANNONCE. La region reellement servie par la
 * mesure d'audience est deduite de la configuration, pas de cette table :
 * voir lib/health/collect.ts. Quand les deux different, la page le dit.
 */
export type SousTraitant = {
  id: string;
  nom: string;
  /** Ce qui transite chez lui, en une phrase. */
  donnees: string;
  /** Region annoncee. */
  region: string;
};

export const SOUS_TRAITANTS: readonly SousTraitant[] = [
  {
    id: "hebergement",
    nom: "Vercel",
    donnees: "hébergement du site, exécution des pages",
    region: "exécution en région Paris, société établie hors Union européenne",
  },
  {
    id: "base",
    nom: "Supabase",
    donnees: "base de données, partagée avec deux produits du groupe",
    region: "Union européenne, Irlande",
  },
  {
    id: "modele",
    nom: "OpenAI",
    donnees:
      "question posée à l’assistant et extraits de corpus qui la fondent",
    region: "États-Unis, clauses contractuelles types",
  },
  {
    id: "analytique",
    nom: "PostHog",
    donnees: "mesure d’audience, après consentement uniquement",
    region: "Union européenne",
  },
  {
    id: "erreurs",
    nom: "Sentry",
    donnees: "journalisation des erreurs applicatives",
    region: "Union européenne",
  },
  {
    id: "disponibilite",
    nom: "Better Stack",
    donnees: "supervision de disponibilité du site",
    region: "Union européenne",
  },
  {
    id: "depots",
    nom: "GitHub",
    donnees: "lecture des messages de commit affichés dans le journal",
    region: "États-Unis, lecture seule et sans donnée personnelle transmise",
  },
  {
    id: "rendez-vous",
    nom: "Cal.com",
    donnees: "prise de rendez-vous, ouverte à la demande",
    region: "Union européenne",
  },
];

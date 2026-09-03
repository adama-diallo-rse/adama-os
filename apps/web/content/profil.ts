// =====================================================================
// C9-T8, la source unique de profil.
//
// Le defaut que ce fichier rend impossible : le hero annonce un intitule de
// poste, le JSON-LD en annonce un autre, la modale de contact un troisieme,
// et personne ne s'en apercoit parce que les trois vivent dans trois
// fichiers. Un recruteur qui compare la page et le resultat de recherche
// voit alors deux personnes differentes.
//
// A partir d'ici, un intitule de poste, une echeance ou une zone
// geographique ne s'ecrivent plus dans un composant. Ils se lisent ici.
// tests/profil.test.ts verrouille la regle.
//
// Regle de tenue : ces chaines sont affichees telles quelles, elles portent
// donc leurs accents. Les commentaires suivent la convention du depot et
// n'en portent pas.
// =====================================================================

/** Etat civil et positionnement, au niveau ou cela reste vrai des mois. */
export const IDENTITE = {
  nom: "Adama Diallo",
  prenom: "Adama",
  patronyme: "Diallo",
  /** Les trois domaines, dans l'ordre ou ils se lisent partout. */
  domaines: ["RSE", "Data", "Systèmes"] as const,
  /** Ce que je sais faire. Vend une capacite, pas une situation. */
  capacite:
    "Je conçois et je construis des systèmes logiciels à l’intersection de la RSE, de la donnée et du logiciel.",
  /** Ou j'en suis. Vient apres la capacite, jamais avant. */
  situation:
    "Aujourd’hui data ESG et solutions IA chez AG2R LA MONDIALE, et en parallèle mon propre écosystème logiciel.",
} as const;

/**
 * Ce que je cherche. Une seule liste, reprise a l'identique dans le hero, le
 * JSON-LD, le mode recruteur, la modale et le CV.
 */
export const RECHERCHE = {
  contrats: ["CDI", "CDD"] as const,
  postes: [
    "Chargé de mission RSE et data ESG",
    "Consultant RSE",
    "Chef de projet conformité et automatisation",
  ] as const,
  zone: "Île-de-France",
  /** Mois de prise de fonction, en clair. */
  mois: "novembre",
  annee: "2026",
  /** Date ISO de fin du stage en cours. Sert au JSON-LD et au tri. */
  disponibleLe: "2026-11-01",
} as const;

/** La ligne de disponibilite, formulee une fois pour tout le site. */
export const DISPONIBILITE = `Disponible en ${RECHERCHE.contrats.join(
  " ou ",
)} dès ${RECHERCHE.mois} ${RECHERCHE.annee}, ${RECHERCHE.zone}.`;

/** La demande, en une phrase, pour le JSON-LD et le mode recruteur. */
export const DEMANDE = `${RECHERCHE.contrats.join(
  " / ",
)} : ${RECHERCHE.postes.join(
  ", ",
)}, ${RECHERCHE.zone}, à partir de ${RECHERCHE.mois} ${RECHERCHE.annee}.`;

/**
 * C9-T2, les trois domaines de competence.
 *
 * Trois cartes, pas dix competences. Chacune porte une preuve, jamais une
 * autoevaluation et jamais une barre de niveau : une barre de progression de
 * competence est arbitraire, et elle decredibilise ce qui l'entoure.
 *
 * `preuve` nomme l'affirmation du registre C2 qui adosse la carte, `verifier`
 * son adresse permanente. Si le registre ne repond pas, la carte s'affiche
 * sans son marqueur plutot que de fabriquer une verification.
 */
export type DomaineCompetence = {
  id: string;
  titre: string;
  /** Ce que le domaine recouvre, en trois entrees courtes. */
  matieres: readonly string[];
  /** Une phrase, ce que je fais reellement dans ce domaine. */
  fait: string;
  /** Identifiant d'affirmation dans proof_claims. */
  preuveId: string;
};

export const COMPETENCES: readonly DomaineCompetence[] = [
  {
    id: "esg",
    titre: "ESG et durabilité",
    matieres: ["cadre réglementaire", "donnée de durabilité", "conformité"],
    fait: "Je travaille la donnée ESG et les référentiels CSRD, ESRS et VSME, en stage à la direction RSE d’AG2R LA MONDIALE et sur mes propres produits.",
    preuveId: "esg-optimizer-en-ligne",
  },
  {
    id: "donnee",
    titre: "Donnée et IA",
    matieres: ["récupération documentaire", "pipelines", "agents", "API"],
    fait: "J’ai construit la chaîne de récupération documentaire de ce site, son agent conversationnel et les passerelles qui interrogent les produits du groupe.",
    preuveId: "metriques-portent-leur-provenance",
  },
  {
    id: "logiciel",
    titre: "Logiciel et systèmes",
    matieres: ["architecture", "intégration", "sécurité", "exploitation"],
    fait: "J’architecture, je déploie et j’exploite les logiciels du groupe : base de données, politiques de sécurité, sondes, tests et mise en production.",
    preuveId: "cockpit-code-public",
  },
] as const;

/**
 * Les experiences, dans l'ordre d'affichage. Preuve sociale deja publique :
 * ces quatre noms figurent sur le CV et sur LinkedIn.
 */
export type Experience = {
  id: string;
  organisation: string;
  /** Precision affichee en petit sous le nom. Vide quand inutile. */
  precision: string;
  role: string;
  categorie: string;
};

export const EXPERIENCES: readonly Experience[] = [
  {
    id: "ag2r",
    organisation: "AG2R LA MONDIALE",
    precision: "",
    role: "Data ESG et solutions IA, direction RSE",
    categorie: "RSE × DATA",
  },
  {
    id: "younivibe",
    organisation: "Younivibe",
    precision: "",
    role: "Coordination RSE et reporting",
    categorie: "COORDINATION × IMPACT",
  },
  {
    id: "afev",
    organisation: "AFEV",
    precision: "",
    role: "Engagement et mentorat étudiant",
    categorie: "ENGAGEMENT × TRANSMISSION",
  },
  {
    id: "ministere",
    organisation: "Ministère des Finances",
    precision: "Sénégal",
    role: "Reporting et données",
    categorie: "SECTEUR PUBLIC × DONNÉES",
  },
] as const;

/**
 * L'experience en cours. Elle sert au JSON-LD, qui declare l'employeur
 * actuel : sans cette projection, le nom serait recopie dans le balisage et
 * finirait par diverger de la page, ce qui montrerait deux personnes
 * differentes a un moteur de recherche et a un lecteur.
 */
export const EXPERIENCE_ACTUELLE: Experience = EXPERIENCES[0] as Experience;

/**
 * La formation, au meme niveau de detail que les experiences : l'etablissement
 * et rien de plus. Aucun intitule de diplome n'est ecrit ici tant qu'Adama ne
 * l'a pas dicte. Un diplome approxime sur une page qui promet de porter ses
 * preuves annulerait la promesse.
 */
export type Formation = {
  id: string;
  organisation: string;
  precision: string;
};

export const FORMATION: readonly Formation[] = [
  {
    id: "upec",
    organisation: "UPEC",
    precision: "Université Paris-Est Créteil",
  },
] as const;

/** Titre de poste actuel, pour le JSON-LD. Decrit le present, pas la cible. */
export const POSTE_ACTUEL = "Data ESG et solutions IA, direction RSE";

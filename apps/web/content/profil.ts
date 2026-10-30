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

// =====================================================================
// Fin de la recherche de poste, 10 octobre 2026.
//
// Jusqu'au 10 octobre 2026, ce fichier portait une recherche de CDI ou de
// CDD (intitules vises, zone, mois de prise de fonction) et le site la
// relayait partout : JSON-LD de type Demand, mode recruteur, modale « open
// to work », document machine, llms.txt. Adama a clos cette recherche ce
// jour-la et garde la voie de fondateur a plein temps. Le positionnement
// public a ete arrete le 22 octobre 2026 (une these commune, et une regle
// d'apparition : un projet n'est nomme publiquement qu'avec un produit en
// ligne ou un client), puis precise par Adama le 30 octobre 2026 : fondateur
// de STRATA ESG et de Conhama, co-fondateur de Pharivo.
//
// La recherche n'est donc plus une donnee du profil. A sa place, l'activite
// et les portes d'entree : a qui ces maisons s'adressent. Les memes
// surfaces les lisent, toujours depuis ce seul fichier.
// =====================================================================

/** L'activite, au niveau ou elle reste vraie. */
export const ACTIVITE = {
  titre: "Fondateur",
  /** Les maisons nommees publiquement, dans l'ordre du titre. */
  maisons: ["STRATA ESG", "Conhama", "Pharivo"] as const,
  /** Le role d'Adama dans chaque maison, valide le 30 octobre 2026. */
  roles: {
    "STRATA ESG": "Fondateur",
    Conhama: "Fondateur",
    Pharivo: "Co-fondateur",
  },
  villes: ["Paris", "Dakar"] as const,
} as const;

/** Titre de poste actuel, pour le JSON-LD. Decrit le present, et range
 *  les maisons par role : celles qu'il a fondees, puis celle qu'il
 *  co-fonde. */
export const POSTE_ACTUEL = `${ACTIVITE.titre} de STRATA ESG et de Conhama, co-fondateur de Pharivo`;

/** Etat civil et positionnement, au niveau ou cela reste vrai des mois. */
export const IDENTITE = {
  nom: "Adama Diallo",
  prenom: "Adama",
  patronyme: "Diallo",
  /** Les trois domaines, dans l'ordre ou ils se lisent partout. */
  domaines: ["RSE", "Data", "Systèmes"] as const,
  /** Ce que je sais faire. Vend une capacite, pas une situation. La these
   *  commune des maisons, validee par Adama le 22 octobre 2026. */
  capacite:
    "Je construis des logiciels qui rendent l’économie réelle mesurable et vérifiable, de la donnée de durabilité d’une entreprise au stock d’une officine.",
  /** Ou j'en suis. Vient apres la capacite, jamais avant. Composee depuis
   *  l'activite, pour que le titre et les maisons ne s'ecrivent qu'une fois. */
  situation: `${POSTE_ACTUEL}, entre ${ACTIVITE.villes.join(" et ")}.`,
} as const;

/**
 * La ligne d'ouverture, formulee une fois pour tout le site. Elle remplace
 * la ligne de disponibilite : elle dit a qui parler, pas quand embaucher.
 */
export const OUVERTURE =
  "Ouvert aux échanges avec les entreprises, les cabinets et les officines, comme avec les partenaires et les financeurs de ces maisons.";

/**
 * Les portes d'entree. Trois publics, chacun avec ce qu'il trouve et
 * l'adresse ou le trouver. Aucune porte ne promet un prix ni une date : les
 * conditions vivent sur le site de chaque maison, qui en repond.
 */
type PorteEntree = {
  id: string;
  public: string;
  objet: string;
  /** Adresse publique de la maison, ou null quand le contact passe par moi. */
  lien: string | null;
  libelleLien: string | null;
};

export const PORTES_ENTREE: readonly PorteEntree[] = [
  {
    id: "strata",
    public: "Entreprises, cabinets et consultants",
    objet:
      "Les logiciels et l’accompagnement de STRATA ESG pour le reporting de durabilité, la conformité et l’empreinte carbone.",
    lien: "https://www.strata-esg.fr",
    libelleLien: "strata-esg.fr",
  },
  {
    id: "pharivo",
    public: "Officines au Sénégal",
    objet:
      "Pharivo, le logiciel de l’officine sénégalaise, et son programme d’officines pilotes.",
    lien: "https://pharivo.com",
    libelleLien: "pharivo.com",
  },
  {
    id: "partenaires",
    public: "Réseaux, partenaires et financeurs",
    objet:
      "La distribution, les partenariats et le financement des deux maisons. Le contact passe par moi.",
    lien: null,
    libelleLien: null,
  },
] as const;

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
    fait: "Je travaille la donnée ESG et les référentiels CSRD, ESRS et VSME dans les logiciels de STRATA ESG, après un stage à la direction RSE d’AG2R LA MONDIALE.",
    preuveId: "esg-optimizer-en-ligne",
  },
  {
    id: "donnee",
    titre: "Donnée et moteur",
    matieres: ["récupération documentaire", "pipelines", "agents", "API"],
    fait: "J’ai construit la chaîne de récupération documentaire de ce site, son agent conversationnel et les passerelles qui interrogent les produits du groupe.",
    preuveId: "metriques-portent-leur-provenance",
  },
  {
    id: "logiciel",
    titre: "Logiciel et systèmes",
    matieres: ["architecture", "intégration", "sécurité", "exploitation"],
    fait: "J’architecture, je déploie et j’exploite les logiciels de STRATA ESG et de Pharivo : base de données, politiques de sécurité, sondes, tests et mise en production.",
    preuveId: "cockpit-code-public",
  },
] as const;

/**
 * Les experiences, dans l'ordre d'affichage. Preuve sociale deja publique :
 * ces noms figurent sur le CV et sur LinkedIn, dans cet ordre depuis le
 * 22 octobre 2026 : les deux maisons d'abord, puis le parcours.
 */
export type Experience = {
  id: string;
  organisation: string;
  /** Precision affichee en petit sous le nom. Vide quand inutile. */
  precision: string;
  role: string;
  categorie: string;
  /** Vrai pour une activite en cours, qui alimente worksFor du JSON-LD. */
  actuelle: boolean;
};

export const EXPERIENCES: readonly Experience[] = [
  {
    id: "pharivo",
    organisation: "Pharivo",
    precision: "Dakar",
    role: "Co-fondateur, logiciel de gestion d’officine",
    categorie: "SANTÉ × LOGICIEL",
    actuelle: true,
  },
  {
    id: "strata",
    organisation: "STRATA ESG",
    precision: "Paris",
    role: "Fondateur, logiciels et accompagnement de durabilité",
    categorie: "DURABILITÉ × LOGICIEL",
    actuelle: true,
  },
  {
    id: "conhama",
    organisation: "Conhama",
    precision: "Île-de-France",
    role: "Fondateur, carte vivante de l’économie durable",
    categorie: "DURABILITÉ × PLATEFORME",
    actuelle: true,
  },
  {
    id: "ag2r",
    organisation: "AG2R LA MONDIALE",
    precision: "Stage",
    role: "Data ESG, direction RSE",
    categorie: "RSE × DATA",
    actuelle: false,
  },
  {
    id: "younivibe",
    organisation: "Younivibe",
    precision: "Stage",
    role: "Coordination RSE et reporting",
    categorie: "COORDINATION × IMPACT",
    actuelle: false,
  },
  {
    id: "afev",
    organisation: "AFEV",
    precision: "Service civique",
    role: "Engagement et mentorat étudiant",
    categorie: "ENGAGEMENT × TRANSMISSION",
    actuelle: false,
  },
  {
    id: "ministere",
    organisation: "Ministère des Finances",
    precision: "Sénégal",
    role: "Reporting et données",
    categorie: "SECTEUR PUBLIC × DONNÉES",
    actuelle: false,
  },
] as const;

/**
 * Les activites en cours. Elles servent au JSON-LD, qui declare les
 * organisations actuelles : sans cette projection, les noms seraient
 * recopies dans le balisage et finiraient par diverger de la page.
 */
export const ORGANISATIONS_ACTUELLES: readonly Experience[] =
  EXPERIENCES.filter((e) => e.actuelle);

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

// =====================================================================
// EC0 a EC3, la marque en une seule source (XDEC-44 a XDEC-46).
//
// Une seule marque publique, ADAMA OS (option A de la branche EC). Son
// titre court, sa phrase de positionnement et sa signature se lisent ici
// et nulle part ailleurs : tests/marque.test.ts refuse toute copie en dur
// dans un composant ou une page.
// =====================================================================

/**
 * EC1, AXP-18. Le titre court, lu par quatre surfaces : la barre de
 * navigation, le surtitre de l'accueil, le balisage JSON-LD du site et
 * l'en-tete du mode recruteur.
 */
export const TITRE_COURT = {
  /** Forme affichee, avec ses points medians, telle que la charte l'ecrit. */
  affiche: "ESG · DATA · SYSTEMS",
  /** Forme lue par une machine ou une voix de synthese. */
  texte: "ESG Data Systems",
} as const;

/**
 * EC2, AXP-19 et AXP-159. Une seule phrase, tenue partout, dans les deux
 * langues. Elle est la capacite du profil : il n'en existe pas de seconde.
 * Les variantes sont gardees datees, jamais affichees.
 */
export const POSITIONNEMENT = {
  fr: IDENTITE.capacite,
  en: "I build software that makes the real economy measurable and verifiable, from a company’s sustainability data to a pharmacy’s stock.",
  /** Alternatives datees : elles ne s'affichent pas, elles se testent. */
  variantes: [
    {
      code: "AXP-19",
      fr: "Je construis des systèmes pour la donnée durable.",
      en: "I build systems for sustainable data.",
      gardeeLe: "2026-09-26",
    },
    {
      code: "AXP-159",
      fr: "Recherche, construction, systèmes. Un laboratoire public.",
      en: "Research. Build. Systems. A public laboratory.",
      gardeeLe: "2026-09-26",
    },
    {
      // La phrase affichee jusqu'au 23 octobre 2026. Elle ne disait que la
      // durabilite, et Pharivo n'y entrait pas.
      code: "EC2-0",
      fr: "Je conçois des systèmes numériques qui rendent la donnée de durabilité exploitable, vérifiable et opposable.",
      en: "I design digital systems that make sustainability data usable, verifiable and defensible.",
      gardeeLe: "2026-10-23",
    },
  ],
} as const;

/**
 * EC3, AXP-113. La signature, en pied de chaque surface. Chaque groupe de
 * mots qui affirme quelque chose porte le lien qui le prouve : un mot sans
 * preuve cliquable sort de la phrase (regle de retrait ecrite en XDEC-46).
 */
type SegmentSignature = {
  texte: string;
  /** Route interne qui prouve le segment. Absente pour la ponctuation. */
  preuve?: string;
  /** Ce que la preuve montre, pour le lecteur d'ecran et le survol. */
  montre?: string;
};

export const SIGNATURE: {
  segments: readonly SegmentSignature[];
  en: string;
} = {
  segments: [
    {
      texte: "Construit par Adama",
      preuve: "/journal",
      montre: "les commits réels des dépôts suivis, datés et attribués",
    },
    { texte: ", à partir de " },
    {
      texte: "systèmes réellement mis en ligne",
      preuve: "/ecosysteme",
      montre: "les produits en production, avec leur adresse et leur état",
    },
    { texte: "." },
  ],
  en: "Built by Adama, from systems actually shipped.",
};

/** La signature en texte continu, pour les metadonnees et les tests. */
export const SIGNATURE_TEXTE = SIGNATURE.segments.map((s) => s.texte).join("");

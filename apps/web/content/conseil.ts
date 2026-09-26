// =====================================================================
// EG0 a EG2, l'expertise appliquee, en une seule source.
//
// Tout ce qui se lit ici est repris de la branche EG et de la branche EK,
// sans reecriture : les quatre portes, les quatre conditions cumulatives,
// les quatre interdits, le plafond de capacite EG9, le rapport de revue en
// sept parties. Une page qui reformulerait l'une de ces listes finirait par
// dire autre chose que la regle qu'elle affiche.
//
// Deux verrous gouvernent ce qui s'ouvre, et ils se levent ici, par un
// commit date, jamais par une variable posee un soir :
//   - EK2, l'assurance de responsabilite civile professionnelle, bloque
//     toute revue vendue (XDEC-43) ;
//   - EK3, les conditions de vente, bloque tout encaissement.
// Tant qu'un verrou tient, une demande se recoit, se qualifie et se date.
// Elle ne se vend pas.
// =====================================================================

export type CodePorte = "construire" | "donnee" | "ia" | "systeme";

type Porte = {
  code: CodePorte;
  numero: string;
  titre: string;
  /** Le probleme du visiteur, dans ses mots, tel que la branche l'ecrit. */
  probleme: string;
  /** Ce qu'on lui propose en premier. */
  premierPas: string;
  livre: readonly string[];
  neLivrePas: string;
  /** Ordre de grandeur, aligne sur la grille de la branche. */
  duree: string;
  /** Vide quand la porte s'ouvre sur un format deja disponible. */
  ouverture?: string;
  suite: { libelle: string; href: string };
};

export const PORTES: readonly Porte[] = [
  {
    code: "construire",
    numero: "01",
    titre: "Construire",
    probleme:
      "Nous voulons construire un produit ESG et nous ne savons pas par où commencer.",
    premierPas: "Un diagnostic court, puis une revue.",
    livre: [
      "une lecture du système que vous voulez construire",
      "les trois décisions à prendre avant la première ligne de code",
      "ce qu’il vaut mieux ne pas construire du tout",
    ],
    neLivrePas: "Le produit lui-même, ni une ligne de code facturée.",
    duree: "90 minutes, puis deux jours si la revue se justifie.",
    suite: { libelle: "Lire le diagnostic court", href: "/diagnostic" },
  },
  {
    code: "donnee",
    numero: "02",
    titre: "Donnée",
    probleme:
      "Nos données ESG sont dispersées, on ne sait pas d’où vient un chiffre.",
    premierPas: "Une revue d’architecture de donnée et un modèle cible.",
    livre: [
      "la carte de provenance de vos chiffres, source par source",
      "les endroits qui disent deux choses différentes",
      "un modèle cible, avec les options rejetées et leur raison",
    ],
    neLivrePas: "Le calcul de vos indicateurs ni votre rapport de durabilité.",
    duree: "Deux à cinq jours.",
    suite: {
      libelle: "Lire la revue d’architecture",
      href: "/revue-architecture",
    },
  },
  {
    code: "ia",
    numero: "03",
    titre: "Intelligence artificielle",
    probleme:
      "Nous voulons mettre de l’IA dans nos processus ESG sans dire de bêtises.",
    premierPas:
      "Un atelier d’une journée, puis une architecture de validation.",
    livre: [
      "la frontière entre ce qu’un modèle peut proposer et ce qu’une chaîne de preuve doit trancher",
      "les points où un humain valide, et ce qu’il valide",
      "l’architecture de validation, avec ses cas de refus",
    ],
    neLivrePas: "Un agent ou un modèle déployé chez vous.",
    duree: "Une journée, puis deux à cinq jours.",
    suite: {
      libelle: "Lire la revue d’architecture",
      href: "/revue-architecture",
    },
  },
  {
    code: "systeme",
    numero: "04",
    titre: "Système",
    probleme:
      "Notre organisation produit du désordre, on refait les mêmes arbitrages tous les mois.",
    premierPas: "Un accompagnement de trois mois, ou un système installé.",
    livre: [
      "un registre des décisions qui cesse de les rejouer",
      "les invariants qui tranchent d’avance les arbitrages récurrents",
      "une méthode que l’équipe tient sans moi",
    ],
    neLivrePas: "Un logiciel, ni une présence dans vos équipes.",
    duree: "Trois mois, deux places au plus en même temps.",
    ouverture:
      "L’accompagnement ouvre après les premières revues livrées. D’ici là, cette porte commence par un diagnostic court.",
    suite: { libelle: "Lire le diagnostic court", href: "/diagnostic" },
  },
] as const;

// --- La regle d'acceptation, quatre conditions cumulatives ----------------

export type CodeCondition = "strata" | "conception" | "delai" | "contrat";

type Condition = {
  code: CodeCondition;
  numero: number;
  texte: string;
  /** Qui la verifie, et quand. */
  verification: string;
};

export const CONDITIONS: readonly Condition[] = [
  {
    code: "strata",
    numero: 1,
    texte: "Vous n’êtes ni client ni prospect de STRATA ESG.",
    verification:
      "Déclaré dans le formulaire, puis contrôlé à la main avant toute réponse.",
  },
  {
    code: "conception",
    numero: 2,
    texte:
      "Le sujet est la conception d’un système, pas la production d’un livrable ESG.",
    verification:
      "Déclaré dans le formulaire, par ce que vous attendez en sortie.",
  },
  {
    code: "delai",
    numero: 3,
    texte: "L’échéance laisse au moins deux semaines.",
    verification: "Déclaré dans le formulaire.",
  },
  {
    code: "contrat",
    numero: 4,
    texte:
      "Mon contrat de travail en cours, s’il en existe un, autorise la mission.",
    verification: "Vérifié de mon côté, avant toute proposition.",
  },
] as const;

export const INTERDITS = [
  {
    code: "juridique",
    titre: "Aucun conseil juridique nominatif",
    texte:
      "Interpréter un texte pour une entreprise donnée, et engager sa responsabilité sur cette interprétation, est hors du périmètre.",
  },
  {
    code: "verification",
    titre: "Aucune vérification par tiers indépendant",
    texte:
      "L’assurance des informations de durabilité suppose une indépendance qu’un éditeur d’outil n’a pas.",
  },
  {
    code: "livrable",
    titre: "Aucune production de livrable ESG pour vous",
    texte:
      "Un besoin de rapport ou de déclaration relève d’un produit, pas d’une revue.",
  },
  {
    code: "developpement",
    titre: "Aucun développement logiciel facturé",
    texte:
      "Une revue dit quoi construire et pourquoi. Elle ne se transforme pas en chantier de développement.",
  },
] as const;

// --- Le plafond de capacite, EG9 ----------------------------------------

type PeriodeCapacite = {
  debut: string;
  /** Exclue. Absente pour la periode ouverte. */
  fin?: string;
  libelle: string;
  plafond: string;
};

/** Ecrit avant la premiere vente, jamais apres (EG9). */
export const CAPACITE: readonly PeriodeCapacite[] = [
  {
    debut: "2026-09-01",
    fin: "2026-11-01",
    libelle: "Septembre et octobre 2026",
    plafond: "Aucune mission.",
  },
  {
    debut: "2026-11-01",
    fin: "2027-03-01",
    libelle: "Novembre 2026 à février 2027",
    plafond: "Une revue courte au plus sur un mois donné.",
  },
  {
    debut: "2027-03-01",
    libelle: "À partir de mars 2027",
    plafond: "Quatre jours vendus par mois au plus, tout format confondu.",
  },
] as const;

export function periodeCourante(
  maintenant: Date = new Date(),
): PeriodeCapacite {
  const jour = maintenant.toISOString().slice(0, 10);
  const trouvee = CAPACITE.find(
    (p) => jour >= p.debut && (p.fin === undefined || jour < p.fin),
  );
  return trouvee ?? (CAPACITE[CAPACITE.length - 1] as PeriodeCapacite);
}

// --- Les verrous ----------------------------------------------------------

type Verrou = {
  code: "EK2" | "EK3";
  objet: string;
  bloque: string;
  leve: boolean;
  /** Date ISO de la levee, ecrite avec le commit qui la leve. */
  leveLe?: string;
};

export const VERROUS: Record<"assurance" | "vente", Verrou> = {
  assurance: {
    code: "EK2",
    objet: "l’assurance de responsabilité civile professionnelle",
    bloque: "toute revue vendue",
    leve: false,
  },
  vente: {
    code: "EK3",
    objet: "les conditions de vente publiées",
    bloque: "tout encaissement",
    leve: false,
  },
};

// --- EG1, le diagnostic court -------------------------------------------

export const DIAGNOSTIC = {
  duree: "90 minutes",
  prix: { min: 250, max: 450 },
  avant: [
    "un schéma, même dessiné à la main, du système tel qu’il existe ou tel qu’il est imaginé",
    "la décision que vous devez prendre, en une phrase",
    "ce qui a déjà été essayé, et pourquoi cela n’a pas suffi",
    "aucun document confidentiel, aucune donnée de dossier",
  ],
  deroule: [
    {
      debut: 0,
      titre: "Le problème, dans vos mots",
      texte:
        "Vous racontez. Je ne propose rien. Je note les mots que vous employez pour la donnée, la preuve et la décision.",
    },
    {
      debut: 15,
      titre: "La carte du système",
      texte:
        "Nous dessinons ensemble les sources, les traitements, les sorties et les personnes qui signent.",
    },
    {
      debut: 30,
      titre: "Les frontières floues",
      texte:
        "Où la donnée change de mains sans propriétaire, où un chiffre perd sa source, où deux endroits disent deux choses.",
    },
    {
      debut: 45,
      titre: "Les décisions à prendre",
      texte:
        "Ce qui doit être tranché avant d’ajouter un outil, et ce qui peut attendre.",
    },
    {
      debut: 60,
      titre: "Ce qu’il ne faut pas faire",
      texte:
        "Les chantiers à ne pas ouvrir, les outils à ne pas acheter, la construction à ne pas lancer.",
    },
    {
      debut: 75,
      titre: "La suite, si elle existe",
      texte:
        "Rien, une revue courte, ou un produit existant. La conclusion peut être de ne rien acheter.",
    },
  ],
  note: {
    sections: [
      "Ce qui a été lu, et ce qui ne l’a pas été",
      "Le système tel qu’il a été décrit",
      "Les trois décisions à prendre d’abord",
      "Ce qu’il ne faut pas faire",
      "La suite proposée, ou l’absence de suite",
    ],
    jamais: [
      "un chiffre ESG calculé pour vous",
      "une interprétation réglementaire engageant votre entreprise",
      "une recommandation d’achat rémunérée",
      "une donnée d’un autre client",
    ],
  },
  /** La regle de prix a l'interieur de la fourchette. */
  prixRegle: [
    {
      prix: 250,
      quand: "Un seul système, une seule décision, et le schéma existe déjà.",
    },
    {
      prix: 350,
      quand:
        "Plusieurs sources ou plusieurs équipes, ou un schéma à construire pendant la séance.",
    },
    {
      prix: 450,
      quand:
        "Un système qui mêle donnée, preuve et intelligence artificielle, ou plus de deux décisions liées.",
    },
  ],
  filtre: [
    "la demande porte sur un rapport, une déclaration ou un calcul à produire",
    "la demande attend une interprétation réglementaire pour votre entreprise",
    "l’échéance tombe dans moins de deux semaines",
    "votre organisation est cliente ou en discussion avec STRATA ESG",
  ],
} as const;

// --- EG2, la revue d'architecture ----------------------------------------

export const RAPPORT_REVUE = [
  {
    titre: "Ce qui a été lu, et ce qui ne l’a pas été",
    raison:
      "Sans cette délimitation, vous croyez que tout a été examiné, et le premier angle mort devient une faute.",
  },
  {
    titre: "Les problèmes, classés par gravité",
    raison:
      "Chacun avec son effet concret. Un problème sans effet nommé n’en est pas un.",
  },
  {
    titre: "Les risques",
    raison:
      "Ce qui n’est pas encore un problème et le deviendra, que vous ne pouvez pas voir seul.",
  },
  {
    titre: "Les incohérences",
    raison:
      "Deux endroits qui disent deux choses différentes, le défaut le plus fréquent et le moins vu.",
  },
  {
    titre: "Les priorités",
    raison:
      "Trois à cinq, pas quinze. Une liste de quinze priorités n’en contient aucune.",
  },
  {
    titre: "L’architecture cible",
    raison:
      "Un schéma, et les options rejetées avec leur raison. Elles valent autant que la cible.",
  },
  {
    titre: "La feuille de route",
    raison:
      "Datable par vous, avec ses dépendances. Un rapport sans suite est un rapport classé.",
  },
] as const;

export const FORMATS_REVUE = [
  {
    code: "courte",
    titre: "Revue courte",
    perimetre: "Un seul sujet",
    duree: "2 jours",
    ouvre: "Proposée dès la levée des verrous.",
  },
  {
    code: "complete",
    titre: "Revue complète",
    perimetre: "Le système entier",
    duree: "5 jours",
    ouvre: "Proposée après une première revue livrée.",
  },
  {
    code: "suivi",
    titre: "Revue complète avec restitution et suivi à trois mois",
    perimetre: "Le système entier, restitué en équipe",
    duree: "7 jours",
    ouvre: "Proposée après une première revue livrée.",
  },
] as const;

/**
 * XDEC-08, la clause de renvoi obligatoire, pour une offre qui croise un
 * produit STRATA. Elle ne vend rien : elle dit ou aller quand le besoin est
 * un logiciel en service plutot qu'une conception.
 */
export const CLAUSE_RENVOI =
  "Si votre besoin est de produire un rapport de durabilité, pas de concevoir le système qui le produit, STRATA ESG édite les logiciels pour cela. Cette revue s’adresse à qui conçoit, construit ou fait évoluer le système.";

// --- Ce qui est fait d'une demande -----------------------------------------

/**
 * La mention du formulaire commun. Sa version est ecrite avec chaque
 * demande : un texte change, c'est une version nouvelle.
 */
export const MENTION_DEMANDE = {
  version: "EG0-1",
  texteCase:
    "J’accepte que ces informations servent uniquement à répondre à ma demande. Elles ne rejoignent aucune liste, ni celle de SIGNAL ni celle de STRATA ESG.",
  lignes: [
    {
      label: "Responsable",
      valeur:
        "Adama Diallo, entrepreneur individuel, SIREN 913518031, qui porte ADAMA OS EXPANSION.",
    },
    {
      label: "Finalité",
      valeur:
        "Lire votre demande, y répondre par écrit et, si elle aboutit, préparer une proposition.",
    },
    {
      label: "Base",
      valeur:
        "Mesures précontractuelles prises à votre demande. La case confirme que vous avez lu cette mention.",
    },
    {
      label: "Ce qui est gardé",
      valeur:
        "Les champs du formulaire, la version de cette mention, et une empreinte non réversible de votre adresse IP. Une demande que la règle refuse n’est pas enregistrée du tout.",
    },
    {
      label: "Durée",
      valeur:
        "Douze mois après le dernier échange si aucune mission ne suit. Effacement immédiat sur simple demande.",
    },
    {
      label: "Où",
      valeur:
        "Une base dédiée en Union européenne, distincte de celle du site et de tout produit STRATA ESG. Une notification part vers la seule boîte de l’éditeur.",
    },
  ],
} as const;

/**
 * La reponse de reception d'une demande recevable, ecrite pour partir telle
 * quelle depuis la messagerie. Tant que EK2 tient, elle date et ne vend pas.
 */
export function reponseReception(p: {
  nom: string;
  porte: string;
  recueLe: string;
  plafond: string;
  assuranceLevee: boolean;
}): string {
  return [
    `Bonjour ${p.nom},`,
    "",
    `Votre demande, arrivée par la porte ${p.porte} le ${p.recueLe}, est lue. Elle remplit les conditions que j’applique avant toute mission.`,
    "",
    p.assuranceLevee
      ? "Je peux vous adresser une proposition écrite, avec le périmètre, ce qui en est exclu, la durée, le livrable et le prix."
      : "Je ne propose aucune revue avant d’avoir souscrit l’assurance de responsabilité civile professionnelle qui la couvre. Votre demande est donc datée, pas vendue : je reviens vers vous par écrit dès que cette condition est remplie, sans engagement de votre part d’ici là.",
    "",
    `Pour la période en cours, mon plafond est le suivant : ${p.plafond.toLowerCase()}`,
    "",
    "Si un premier échange de trente minutes vous est utile pour préciser le problème, proposez-moi deux créneaux.",
    "",
    "Adama Diallo",
    "ADAMA OS",
  ].join("\n");
}

export type LangueArticleAfrique = "fr" | "en";

export type ContrainteArticleAfrique = {
  id: string;
  nom: string;
  consequence: string;
  voix: string;
  titre: string;
  paragraphes: string[];
  decision: string;
  limite: string;
};

type ChoixTraduction = {
  terme: string;
  choix: string;
  raison: string;
};

type SignalResonance = {
  nom: string;
  compte: string;
  exclut: string;
};

export type ArticleAfrique = {
  langue: LangueArticleAfrique;
  codeLangue: string;
  code: string;
  titre: string;
  sousTitre: string;
  date: string;
  dateIso: string;
  lecture: string;
  autreLangue: { libelle: string; href: string; hreflang: string };
  autrePublication: { libelle: string; href: string };
  introduction: string[];
  titreContraintes: string;
  introductionContraintes: string[];
  libelles: {
    source: string;
    voix: string;
    decision: string;
    limite: string;
  };
  contraintes: ContrainteArticleAfrique[];
  methode: {
    repere: string;
    titre: string;
    introduction: string[];
    etapes: { titre: string; texte: string }[];
  };
  traduction?: {
    repere: string;
    titre: string;
    introduction: string;
    choix: ChoixTraduction[];
  };
  resonance: {
    repere: string;
    titre: string;
    introduction: string[];
    signaux: SignalResonance[];
    registre: string[];
    decision: string;
  };
  clause: {
    repere: string;
    titre: string;
    texte: string;
    note: string;
  };
  conclusion: {
    repere: string;
    titre: string;
    paragraphes: string[];
  };
};

export const CLAUSE_RENVOI_FR =
  "Si votre besoin est de produire un rapport, pas de bâtir l’outil, ESG Optimizer Africa existe. Si votre besoin est de tenir votre gestion courante, les produits IROKO existent. Ce document s’adresse à qui construit.";

export const CLAUSE_RENVOI_EN =
  "If your need is to produce a report rather than build the tool, ESG Optimizer Africa exists. If your need is to run day-to-day operations, IROKO products exist. This document is for those who build the system.";

const CONTRAINTES_FR = [
  {
    id: "facteurs-emission",
    nom: "Absence de base nationale de facteurs d’émission",
    consequence:
      "Une méthode de choix, de justification et de versionnage des facteurs étrangers, avec la traçabilité de ce choix",
  },
  {
    id: "donnee-rare",
    nom: "Donnée rare, incomplète, parfois papier",
    consequence:
      "Un modèle qui traite l’absence comme une valeur, et une chaîne de preuve qui accepte la photo d’un registre",
  },
  {
    id: "electricite",
    nom: "Électricité intermittente, groupes électrogènes",
    consequence:
      "Des postes d’émission que les modèles européens traitent mal, et qui pèsent lourd localement",
  },
  {
    id: "connectivite",
    nom: "Connectivité coûteuse et discontinue",
    consequence:
      "Une architecture qui fonctionne hors ligne et se synchronise, ce qui change le modèle de donnée, pas seulement l’interface",
  },
  {
    id: "secteur-informel",
    nom: "Secteur informel dans la chaîne d’approvisionnement",
    consequence:
      "Une méthode de collecte auprès de fournisseurs sans comptabilité formelle, et une honnêteté sur ce qui n’est pas prouvable",
  },
  {
    id: "multi-devises",
    nom: "Multi-devises et paiement mobile",
    consequence:
      "Des flux dont la conversion et la période sont tracées dans le lignage",
  },
  {
    id: "langues",
    nom: "Plusieurs langues de travail, dont des langues orales",
    consequence:
      "Une collecte conçue pour être menée à l’oral et saisie ensuite",
  },
] as const;

const CONSTRAINTS_EN = [
  {
    id: "emission-factors",
    nom: "No national emission-factor database",
    consequence:
      "A method for selecting, justifying and versioning foreign factors, with a traceable record of that choice",
  },
  {
    id: "scarce-data",
    nom: "Scarce, incomplete and sometimes paper-based data",
    consequence:
      "A model that treats absence as a value and an evidence chain that can accept a photograph of a record",
  },
  {
    id: "electricity",
    nom: "Intermittent electricity and generators",
    consequence:
      "Emission categories that European models handle poorly and that carry significant local weight",
  },
  {
    id: "connectivity",
    nom: "Costly and intermittent connectivity",
    consequence:
      "An architecture that works offline and synchronises later, changing the data model rather than only the interface",
  },
  {
    id: "informal-sector",
    nom: "The informal sector in the supply chain",
    consequence:
      "A collection method for suppliers without formal accounting records, with a candid account of what cannot be evidenced",
  },
  {
    id: "currencies",
    nom: "Multiple currencies and mobile money",
    consequence:
      "Flows whose conversion and reference period are recorded in the data lineage",
  },
  {
    id: "languages",
    nom: "Several working languages, including languages used orally",
    consequence:
      "Collection designed to take place orally and to be entered into the system afterwards",
  },
] as const;

export const ARTICLE_CONTRAINTES_FR: ArticleAfrique = {
  langue: "fr",
  codeLangue: "fr-FR",
  code: "AXP-122 / PUBLICATION 1",
  titre:
    "Sept contraintes qui changent un système de données ESG en Afrique de l’Ouest",
  sousTitre:
    "La demande arrive par les donneurs d’ordre et les financeurs. Pour l’entreprise qui doit répondre, le problème n’est pas de raconter le terrain, mais de construire une donnée qui reste traçable malgré lui.",
  date: "18 septembre 2026",
  dateIso: "2026-09-18",
  lecture: "Lecture approfondie",
  autreLangue: {
    libelle: "Read in English",
    href: "/en/articles/seven-constraints-west-african-esg-data",
    hreflang: "en",
  },
  autrePublication: {
    libelle: "Lire la publication sur les décisions d’architecture",
    href: "/articles/architecture-donnee-esg-afrique-ouest",
  },
  introduction: [
    "Nous recevons une demande de données d’émissions, de politiques et de pièces justificatives. Elle ne vient pas d’une règle locale nouvellement apparue. Elle vient d’un donneur d’ordre qui doit suivre sa chaîne de valeur, d’une banque qui encadre son risque ou d’une institution de financement qui demande un suivi environnemental et social. La demande est extérieure au système que nous utilisons chaque jour, mais la réponse doit être produite depuis nos opérations réelles.",
    "C’est ici que la plupart des discussions prennent le mauvais point de départ. Elles décrivent l’Afrique de l’Ouest depuis l’extérieur, comme un ensemble de données manquantes à rapprocher d’un modèle déjà terminé ailleurs. Pour l’entreprise qui doit répondre, la question est différente. Nous avons des factures, des registres, des paiements, des groupes électrogènes, des fournisseurs et plusieurs langues de travail. Le matériau existe. Il n’a simplement pas été produit pour entrer sans friction dans un système de données ESG conçu sous d’autres hypothèses.",
    "Les sept contraintes ci-dessous ne sont donc ni une liste de retards ni une collection d’exceptions. Elles décrivent les conditions de fonctionnement auxquelles le système doit obéir. Chacune force une décision sur la source, la qualité, le temps, la synchronisation ou le lignage. Les ignorer ne rend pas le système plus simple. Cela déplace seulement l’incertitude jusqu’au moment où quelqu’un demande comment un chiffre a été obtenu.",
    "Le point de vue retenu est celui de l’entreprise qui subit la demande et doit organiser sa réponse. Aucun facteur d’émission n’est fourni. Aucune obligation locale inexistante n’est suggérée. Ce texte ne prépare aucun dossier pour un tiers et ne promet aucun accès à un financeur. Il cherche à rendre le problème assez précis pour qu’une personne qui construit puisse décider quoi modéliser.",
  ],
  titreContraintes: "Le terrain, vu depuis l’entreprise qui doit répondre",
  introductionContraintes: [
    "Chaque entrée reprend d’abord la contrainte et sa conséquence telles qu’elles sont arrêtées dans la branche EJ. La reformulation qui suit passe du constat extérieur au « nous » de l’entreprise. Le déplacement est volontaire : il révèle ce qui doit être conservé dans la donnée et ce qui doit rester déclaré comme incertain.",
  ],
  libelles: {
    source: "Reprise de la branche EJ",
    voix: "Depuis l’entreprise",
    decision: "Ce que le système doit préserver",
    limite: "Ce qu’il ne doit pas prétendre",
  },
  contraintes: [
    {
      ...CONTRAINTES_FR[0],
      voix: "Nous devons répondre sans disposer d’une base nationale unique sur laquelle appuyer chaque calcul. Si nous retenons un facteur étranger, nous devons pouvoir expliquer d’où il vient, pourquoi il a été choisi, quelle version a été utilisée et ce qu’une mise à jour changerait.",
      titre: "Le choix devient une donnée à part entière",
      paragraphes: [
        "Le facteur retenu ne peut pas rester une cellule isolée dans un tableur. Sa source, son périmètre géographique, sa technologie de référence, son unité, son année et sa version appartiennent au même objet. La justification doit survivre au départ de la personne qui a fait le choix. Sans cela, un recalcul ultérieur ne permet pas de distinguer une évolution de l’activité d’un simple changement de référence.",
        "La méthode commence donc avant la valeur. Elle définit l’ordre de recherche des sources, les critères d’écart acceptables, la personne qui tranche et la trace laissée par l’arbitrage. Le système doit aussi conserver l’ancienne version lorsqu’une référence change. La continuité du raisonnement compte autant que le résultat du calcul.",
      ],
      decision:
        "Source, version, périmètre, unité, date de choix, justification et règle de recalcul.",
      limite:
        "Ne pas présenter un facteur étranger comme une représentation naturelle du contexte local.",
    },
    {
      ...CONTRAINTES_FR[1],
      voix: "Nos pièces sont réparties entre fichiers, cahiers, reçus, messages et registres papier. Une case vide ne signifie pas toujours zéro. Elle peut signifier que la donnée n’a pas été produite, qu’elle n’a pas été reçue ou qu’elle existe sous une forme qui n’a pas encore été saisie.",
      titre:
        "L’absence a plusieurs causes et elles ne sont pas interchangeables",
      paragraphes: [
        "Un modèle utile distingue le zéro mesuré, la valeur inconnue, la pièce attendue, la pièce illisible et l’objet hors périmètre. Ces états commandent des actions différentes. Les réduire à une cellule vide crée une apparence de propreté au prix de la traçabilité. Une photographie de registre peut constituer une pièce recevable si son origine, sa date, son auteur de saisie et son lien avec l’enregistrement sont conservés.",
        "L’entreprise n’a pas besoin qu’un système fasse disparaître le papier. Elle a besoin qu’il sache relier une saisie numérique à la pièce qui l’a déclenchée, puis signaler ce que cette pièce permet et ne permet pas d’établir. La qualité naît ici de la qualification de l’absence, pas de son masquage.",
      ],
      decision:
        "États d’absence distincts, provenance de chaque saisie, pièce jointe et journal de correction.",
      limite:
        "Ne jamais transformer une donnée manquante en zéro ni une image disponible en donnée vérifiée par défaut.",
    },
    {
      ...CONTRAINTES_FR[2],
      voix: "Notre alimentation électrique alterne entre réseau, coupures et production sur site. Si le système ne voit que la facture du réseau, il raconte une activité différente de celle que nous avons réellement menée.",
      titre: "La continuité opérationnelle déplace les postes à suivre",
      paragraphes: [
        "Le groupe électrogène n’est pas une note de bas de page. Il possède un combustible, une quantité, une période d’usage, un équipement, parfois un compteur et souvent des pièces d’achat distinctes. Ces éléments doivent être rattachés à la période et au site concernés. Le passage du réseau au groupe ne doit pas créer un trou dans la série temporelle.",
        "Le système doit permettre de voir la combinaison des sources sans supposer que la disponibilité du réseau est continue. Cette structure rend aussi les corrections possibles : une facture reçue plus tard peut compléter la période sans écraser la trace de l’estimation précédente.",
      ],
      decision:
        "Source d’énergie, site, équipement, combustible, période d’usage, pièce et état de mesure.",
      limite:
        "Ne pas déduire une consommation complète d’une facture réseau lorsque la production sur site a pris le relais.",
    },
    {
      ...CONTRAINTES_FR[3],
      voix: "Nous ne pouvons pas organiser la collecte comme si chaque site disposait d’une connexion stable. La saisie doit continuer pendant la coupure, puis rejoindre le système sans créer de doublon ni effacer une correction faite ailleurs.",
      titre: "Le hors-ligne change le modèle, pas seulement l’écran",
      paragraphes: [
        "Une interface qui affiche une page sans connexion ne suffit pas. Chaque enregistrement a besoin d’un identifiant créé localement, d’un état de synchronisation, d’une heure d’observation distincte de l’heure d’envoi et d’une règle de conflit. Les pièces doivent pouvoir attendre sans être perdues ni envoyées plusieurs fois lorsque le réseau revient.",
        "Cette architecture impose aussi une sobriété de transfert. Les champs structurés passent avant les pièces lourdes, les reprises sont partielles et l’utilisateur voit ce qui reste en attente. La performance n’est pas un confort ajouté après coup. Elle conditionne la possibilité même de collecter.",
      ],
      decision:
        "Identifiant local, file d’attente, horodatages séparés, reprise partielle, détection des doublons et règle de conflit.",
      limite:
        "Ne pas afficher « envoyé » tant que le serveur n’a pas accusé réception de l’enregistrement et de ses pièces.",
    },
    {
      ...CONTRAINTES_FR[4],
      voix: "Une partie de nos fournisseurs travaille sans comptabilité formelle. Nous pouvons obtenir des quantités, des dates, des reçus ou une confirmation orale, mais pas toujours la pièce attendue par un modèle conçu pour une chaîne entièrement documentée.",
      titre: "Collecter sans inventer la pièce qui n’existe pas",
      paragraphes: [
        "Le système doit séparer ce qui a été déclaré, observé, photographié, rapproché d’un paiement ou confirmé par une seconde source. Ces catégories ne donnent pas la même force à l’information. Elles permettent pourtant de conserver un fait utile sans lui attribuer une qualité qu’il n’a pas.",
        "Une limite explicite fait partie du résultat. Si une quantité ne peut pas être reliée à une pièce, le système l’indique et conserve la méthode de collecte. L’entreprise peut alors répondre avec une frontière lisible, au lieu de combler le vide par une approximation silencieuse.",
      ],
      decision:
        "Mode de collecte, source, personne ayant saisi, date, recoupement disponible et niveau de traçabilité.",
      limite:
        "Ne pas fabriquer une continuité documentaire et ne pas confondre déclaration, observation et pièce comptable.",
    },
    {
      ...CONTRAINTES_FR[5],
      voix: "Nos achats et paiements peuvent traverser plusieurs devises et des services de paiement mobile. Pour relire un montant, nous devons retrouver la devise d’origine, la date, la règle de conversion et la période à laquelle l’opération appartient.",
      titre: "La conversion ne doit jamais effacer le flux d’origine",
      paragraphes: [
        "Un montant converti sans sa devise source devient impossible à contrôler. Le système conserve donc les deux valeurs, la source du taux, la date ou la période de référence et la règle d’arrondi. Il distingue aussi la date du paiement, celle de la facture et celle de la conversion. Ces dates répondent à des questions différentes.",
        "Le paiement mobile ajoute un identifiant de transaction et parfois un intermédiaire. Ces éléments appartiennent au lignage. Ils relient le flux financier à l’activité suivie sans transformer le service de paiement en preuve suffisante de la nature de la dépense.",
      ],
      decision:
        "Montant et devise d’origine, montant de restitution, source du taux, période, arrondi et identifiant de transaction.",
      limite:
        "Ne pas remplacer la valeur d’origine par la valeur convertie ni déduire l’objet d’une dépense du seul canal de paiement.",
    },
    {
      ...CONTRAINTES_FR[6],
      voix: "Le travail ne se déroule pas toujours dans la langue du formulaire. Une personne peut expliquer une opération en wolof ou en pular, puis une autre la saisir en français. Le système doit garder la séparation entre ce qui a été dit, ce qui a été compris et ce qui a été enregistré.",
      titre: "L’oral est un mode de collecte, pas un défaut à cacher",
      paragraphes: [
        "La saisie doit indiquer la langue de l’échange, la personne qui reformule, la date et le degré de fidélité possible. Un champ de note peut conserver un terme local difficile à traduire. Une validation immédiate par la personne interrogée peut confirmer le sens général sans prétendre produire une transcription.",
        "Les supports écrits restent en français ou en anglais. Le wolof et le pular servent à ouvrir l’échange et à débloquer une discussion technique à l’oral. Cette frontière protège la qualité : publier un support écrit non tenu dans le temps créerait une promesse que le système ne peut pas soutenir.",
      ],
      decision:
        "Langue de l’échange, langue de saisie, personne ayant reformulé, validation du sens et termes laissés dans la langue d’origine.",
      limite:
        "Ne pas présenter une reformulation comme une transcription ni publier de support écrit en wolof ou en pular.",
    },
  ],
  methode: {
    repere: "08 / UNE MÉTHODE AVANT UNE VALEUR",
    titre: "Choisir un facteur sans faire passer le choix pour une évidence",
    introduction: [
      "L’absence de base nationale n’autorise ni l’improvisation ni la copie d’une valeur trouvée ailleurs. Elle oblige à rendre la méthode visible. La séquence ci-dessous décrit le choix, pas les valeurs. Elle peut être relue lorsqu’une source change ou qu’un écart de contexte devient trop grand.",
    ],
    etapes: [
      {
        titre: "Définir l’usage",
        texte:
          "Nommer l’activité, le périmètre, l’unité attendue, la période et la précision réellement nécessaire avant de chercher une source.",
      },
      {
        titre: "Comparer les écarts",
        texte:
          "Lire la géographie, la technologie, l’année, le périmètre et l’unité de chaque source possible. Un écart reste écrit, il n’est pas absorbé dans la valeur.",
      },
      {
        titre: "Justifier le choix",
        texte:
          "Conserver les options écartées, la raison du choix, la personne qui tranche et la date de la décision.",
      },
      {
        titre: "Versionner",
        texte:
          "Figer la source et sa version avec le calcul. Une mise à jour future crée une nouvelle version au lieu de réécrire l’ancienne.",
      },
      {
        titre: "Préparer le recalcul",
        texte:
          "Séparer les données d’activité de la référence utilisée afin de pouvoir mesurer l’effet d’un changement de source.",
      },
    ],
  },
  resonance: {
    repere: "09 / RÉSONANCE UTILE",
    titre: "Mesurer une reconnaissance de problème, pas une audience",
    introduction: [
      "Cette première publication ne cherche pas à savoir combien de personnes l’ont vue. Elle cherche à savoir si les sept contraintes décrivent des situations que des personnes chargées de collecter, financer, acheter ou construire reconnaissent sans qu’on leur fournisse la réponse.",
      "Les signaux sont relevés en privé. Une réaction courte, une impression ou un nombre d’abonnés ne devient pas une preuve d’intérêt. Un partage ne compte que s’il revient avec une question précise ou une correction issue du terrain.",
    ],
    signaux: [
      {
        nom: "Reconnaissance située",
        compte:
          "Une réponse nomme une contrainte et décrit la décision qu’elle bloque, sans donnée de dossier.",
        exclut: "Une approbation générale ou un simple signe d’accord.",
      },
      {
        nom: "Correction utile",
        compte:
          "Une personne signale une nuance de vocabulaire, une condition de collecte ou une limite absente.",
        exclut: "Une préférence de style sans effet sur la méthode.",
      },
      {
        nom: "Question d’architecture",
        compte:
          "La publication déclenche une question sur le modèle, la synchronisation, le lignage ou la qualité.",
        exclut: "Une demande de valeur, de score ou d’accès à un financeur.",
      },
      {
        nom: "Passage à la seconde publication",
        compte:
          "Une personne demande comment transformer la contrainte reconnue en règle de système.",
        exclut: "Un clic isolé sans question ni retour.",
      },
    ],
    registre: [
      "Publication et langue",
      "Catégorie de lecteur, sans nom d’organisation",
      "Numéro de contrainte",
      "Type de signal",
      "Question normalisée, sans citation de dossier",
      "Suite : répondre, corriger, approfondir ou ne rien produire",
    ],
    decision:
      "La résonance existe si plusieurs catégories de lecteurs reviennent vers les mêmes contraintes avec des conséquences d’architecture distinctes. Elle n’est pas déduite d’un volume public et aucun seuil arbitraire n’est fixé avant les retours initiaux.",
  },
  clause: {
    repere: "10 / FRONTIÈRE",
    titre: "Ce texte porte sur la construction du système",
    texte: CLAUSE_RENVOI_FR,
    note: "La clause est reproduite à l’identique. Elle sépare la méthode de construction d’un logiciel de diagnostic, de reporting ou de gestion courante.",
  },
  conclusion: {
    repere: "11 / CONCLUSION",
    titre: "Une contrainte bien nommée devient une règle de conception",
    paragraphes: [
      "Les sept contraintes ne demandent pas un discours à part. Elles demandent un système qui sache distinguer une absence d’un zéro, un choix d’une évidence, une déclaration d’une pièce, une observation d’un envoi et une traduction d’une transcription. Ces distinctions sont modestes. Elles déterminent pourtant si la donnée pourra être relue quand la personne qui l’a saisie ne sera plus là.",
      "La suite ne consiste pas à produire immédiatement un nouvel outil. Elle consiste à écouter où les contraintes sont reconnues, lesquelles reviennent ensemble et quelles questions de construction elles font apparaître. La seconde publication prend ce point de départ et transforme chaque contrainte en décision d’architecture vérifiable.",
    ],
  },
};

export const ARTICLE_CONTRAINTES_EN: ArticleAfrique = {
  langue: "en",
  codeLangue: "en-GB",
  code: "AXP-122 / PUBLICATION 1",
  titre: "Seven constraints that change an ESG data system in West Africa",
  sousTitre:
    "Requests come from buyers and financing institutions. For the company expected to respond, the task is not to describe the field but to build data that remains traceable through it.",
  date: "18 September 2026",
  dateIso: "2026-09-18",
  lecture: "Long read",
  autreLangue: {
    libelle: "Lire en français",
    href: "/articles/sept-contraintes-donnee-esg-afrique-ouest",
    hreflang: "fr",
  },
  autrePublication: {
    libelle: "Read the publication on architecture decisions",
    href: "/en/articles/west-african-esg-data-architecture",
  },
  introduction: [
    "We receive a request for emissions data, policies and supporting records. It does not come from a newly created local rule. It comes from a buyer monitoring its value chain, a bank framing its risk or a financing institution asking for environmental and social monitoring. The request sits outside the system we use every day, but the answer must be assembled from our real operations.",
    "This is where many discussions begin from the wrong place. They describe West Africa from the outside, as a collection of missing data to be brought closer to a model already completed elsewhere. The company facing the request sees a different problem. We have invoices, records, payments, generators, suppliers and several working languages. The material exists. It was simply not produced to enter an ESG data system built on different assumptions without friction.",
    "The seven constraints below are neither a list of delays nor a set of exceptions. They describe the operating conditions the system must obey. Each one forces a decision about source, quality, time, synchronisation or lineage. Ignoring them does not simplify the system. It merely moves uncertainty to the moment when someone asks how a figure was obtained.",
    "The chosen point of view is that of the company expected to organise the response. No emission-factor values are supplied. No local legal duty is implied where none exists. This text does not assemble a financing application for a third party and does not promise access to a financing institution. Its purpose is to make the problem precise enough for a builder to decide what must be modelled.",
  ],
  titreContraintes: "The field, seen from the company expected to respond",
  introductionContraintes: [
    "Each entry begins with a controlled English rendering of the constraint and consequence fixed in branch EJ. The company voice then moves from outside observation to the operational “we”. That shift reveals what the data must preserve and what must remain stated as uncertain.",
  ],
  libelles: {
    source: "Controlled rendering of branch EJ",
    voix: "From the company",
    decision: "What the system must preserve",
    limite: "What it must not claim",
  },
  contraintes: [
    {
      ...CONSTRAINTS_EN[0],
      voix: "We must respond without a single national database on which every calculation can rely. If we select a foreign factor, we must be able to explain its source, why it was chosen, which version was used and what a later update would change.",
      titre: "The choice becomes data in its own right",
      paragraphes: [
        "The selected factor cannot remain an isolated spreadsheet cell. Its source, geographic scope, reference technology, unit, year and version belong to the same object. The rationale must survive the departure of the person who made the choice. Otherwise a later recalculation cannot separate a change in activity from a change in reference.",
        "The method therefore comes before the value. It sets the order in which sources are searched, the acceptable gaps, the person who decides and the trace left by the decision. The system must also preserve the previous version when a reference changes. Continuity of reasoning matters as much as the output of the calculation.",
      ],
      decision:
        "Source, version, scope, unit, decision date, rationale and recalculation rule.",
      limite:
        "Do not present a foreign factor as a natural representation of the local context.",
    },
    {
      ...CONSTRAINTS_EN[1],
      voix: "Our records are spread across files, notebooks, receipts, messages and paper logs. A blank field does not always mean zero. It may mean that the data was not produced, was not received or exists in a form that has not yet been entered.",
      titre: "Absence has several causes and they are not interchangeable",
      paragraphes: [
        "A useful model separates a measured zero, an unknown value, an expected record, an unreadable record and an object outside the boundary. These states lead to different actions. Reducing them to an empty cell creates apparent cleanliness at the cost of traceability. A photograph of a record can be accepted when its origin, date, entry author and link to the record are preserved.",
        "The company does not need a system that makes paper disappear. It needs one that links a digital entry to the material that triggered it, then states what that material can and cannot establish. Quality comes from qualifying absence rather than hiding it.",
      ],
      decision:
        "Distinct absence states, provenance for each entry, attached record and correction log.",
      limite:
        "Never turn missing data into zero or treat an available image as verified data by default.",
    },
    {
      ...CONSTRAINTS_EN[2],
      voix: "Our electricity supply alternates between the grid, outages and generation on site. If the system sees only the grid invoice, it describes operations different from those we actually ran.",
      titre: "Operational continuity changes the categories to be tracked",
      paragraphes: [
        "A generator is not a footnote. It has a fuel, a quantity, a period of use, a piece of equipment, sometimes a meter and often separate purchase records. These elements must be linked to the relevant period and site. A switch from the grid to a generator must not create a gap in the time series.",
        "The system must show the combination of sources without assuming continuous grid availability. That structure also makes corrections possible: an invoice received later can complete the period without erasing the trace of the earlier estimate.",
      ],
      decision:
        "Energy source, site, equipment, fuel, period of use, record and measurement state.",
      limite:
        "Do not infer complete consumption from a grid invoice when generation on site took over.",
    },
    {
      ...CONSTRAINTS_EN[3],
      voix: "We cannot organise collection as if every site had a stable connection. Entry must continue during an outage and later reach the system without creating a duplicate or erasing a correction made elsewhere.",
      titre: "Offline operation changes the model, not only the screen",
      paragraphes: [
        "An interface that merely displays a page without a connection is not enough. Every record needs an identifier created locally, a synchronisation state, an observation time separate from the transmission time and a conflict rule. Attachments must be able to wait without being lost or sent repeatedly when the network returns.",
        "This architecture also requires economical transfer. Structured fields move before large files, retries are partial and the user can see what remains pending. Performance is not a comfort added later. It determines whether collection is possible at all.",
      ],
      decision:
        "Local identifier, queue, separate timestamps, partial retry, duplicate detection and conflict rule.",
      limite:
        "Do not display “sent” until the server has acknowledged the record and its attachments.",
    },
    {
      ...CONSTRAINTS_EN[4],
      voix: "Some of our suppliers operate without formal accounting records. We may obtain quantities, dates, receipts or an oral confirmation, but not always the document expected by a model built for a fully documented chain.",
      titre: "Collect without inventing a record that does not exist",
      paragraphes: [
        "The system must separate what was declared, observed, photographed, matched to a payment or supported by a second source. These categories do not give information the same weight. They still preserve a useful fact without assigning it a quality it does not have.",
        "An explicit limitation is part of the result. If a quantity cannot be linked to a record, the system says so and preserves the collection method. The company can then respond with a readable boundary instead of filling the gap with a silent approximation.",
      ],
      decision:
        "Collection mode, source, person entering the data, date, available corroboration and traceability level.",
      limite:
        "Do not manufacture documentary continuity or confuse a statement, an observation and an accounting record.",
    },
    {
      ...CONSTRAINTS_EN[5],
      voix: "Our purchases and payments may cross several currencies and mobile-money services. To review an amount, we need the original currency, date, conversion rule and period to which the transaction belongs.",
      titre: "Conversion must never erase the original flow",
      paragraphes: [
        "A converted amount without its source currency cannot be reviewed. The system therefore preserves both values, the source of the rate, the reference date or period and the rounding rule. It also separates the payment date, invoice date and conversion date. Those dates answer different questions.",
        "Mobile money adds a transaction identifier and sometimes an intermediary. These elements belong in the lineage. They link the financial flow to the activity being tracked without turning the payment service into sufficient evidence of the nature of the expense.",
      ],
      decision:
        "Original amount and currency, reporting amount, rate source, period, rounding and transaction identifier.",
      limite:
        "Do not replace the original value with the converted value or infer the purpose of an expense from the payment channel alone.",
    },
    {
      ...CONSTRAINTS_EN[6],
      voix: "Work does not always take place in the language of the form. A person may explain an operation in Wolof or Pular before someone else enters it in French. The system must preserve the separation between what was said, what was understood and what was recorded.",
      titre: "Oral collection is a mode of work, not a defect to hide",
      paragraphes: [
        "The entry must show the language of the exchange, the person who reformulated it, the date and the attainable fidelity. A note field can preserve a local term that is difficult to translate. Immediate validation by the person interviewed can confirm the general meaning without claiming to produce a transcript.",
        "Written material remains in French or English. Wolof and Pular are used to open the exchange and unblock technical discussion orally. This boundary protects quality: publishing written material that cannot be maintained would create a commitment the system cannot sustain.",
      ],
      decision:
        "Language of the exchange, language of entry, person who reformulated it, validation of meaning and terms kept in the original language.",
      limite:
        "Do not present a reformulation as a transcript or publish written material in Wolof or Pular.",
    },
  ],
  methode: {
    repere: "08 / A METHOD BEFORE A VALUE",
    titre: "Select a factor without presenting the choice as self-evident",
    introduction: [
      "The absence of a national database permits neither improvisation nor the copying of a value found elsewhere. It requires the method to remain visible. The sequence below describes the choice, not factor values. It can be reviewed when a source changes or a contextual gap becomes too large.",
    ],
    etapes: [
      {
        titre: "Define the use",
        texte:
          "Name the activity, boundary, expected unit, period and precision actually required before searching for a source.",
      },
      {
        titre: "Compare gaps",
        texte:
          "Read the geography, technology, year, boundary and unit of each possible source. A gap remains written down rather than being absorbed into the value.",
      },
      {
        titre: "Record the rationale",
        texte:
          "Preserve rejected options, the reason for the choice, the person who decides and the date of the decision.",
      },
      {
        titre: "Version the choice",
        texte:
          "Freeze the source and its version with the calculation. A future update creates a new version rather than rewriting the old one.",
      },
      {
        titre: "Prepare recalculation",
        texte:
          "Separate activity data from the selected reference so that the effect of a source change can be measured.",
      },
    ],
  },
  traduction: {
    repere: "09 / TRANSLATION CONTROL",
    titre: "Words that carry a different weight in English",
    introduction:
      "The English text is not a literal copy. The choices below keep the operational meaning without adding legal weight, moral judgement or a claim that the French source does not make.",
    choix: [
      {
        terme: "Donneur d’ordre",
        choix: "Buyer or lead firm",
        raison:
          "Contracting authority would suggest a public-procurement role that is not stated here.",
      },
      {
        terme: "Financeur",
        choix: "Financing institution or lender",
        raison:
          "Funder can sound like a grant sponsor, while the source also covers banks and development-finance institutions.",
      },
      {
        terme: "Preuve",
        choix: "Evidence",
        raison:
          "Proof can imply legal certainty. Evidence better describes a trace that still carries a boundary and a method.",
      },
      {
        terme: "Secteur informel",
        choix:
          "Informal sector, then suppliers without formal accounting records",
        raison:
          "The phrase describes the absence of formal records. It does not state that an activity is illegal.",
      },
      {
        terme: "Lignage",
        choix: "Data lineage",
        raison:
          "Lineage is used in its technical data meaning, not to describe ownership or ancestry.",
      },
      {
        terme: "Langues orales",
        choix: "Languages used orally",
        raison:
          "The phrase describes the collection channel. It does not reduce a language to the absence of writing.",
      },
    ],
  },
  resonance: {
    repere: "10 / USEFUL RESONANCE",
    titre: "Measure recognition of a problem, not audience size",
    introduction: [
      "This first publication does not ask how many people saw it. It asks whether the seven constraints describe situations recognised by people who collect, finance, buy or build, before they are given an answer.",
      "Signals are recorded privately. A short reaction, an impression count or a follower count does not become evidence of interest. A share counts only when it returns with a precise question or a field correction.",
    ],
    signaux: [
      {
        nom: "Situated recognition",
        compte:
          "A response names one constraint and the decision it blocks, without case-file data.",
        exclut: "General approval or a simple sign of agreement.",
      },
      {
        nom: "Useful correction",
        compte:
          "A practitioner adds a language nuance, collection condition or missing limitation.",
        exclut: "A style preference with no effect on the method.",
      },
      {
        nom: "Architecture question",
        compte:
          "The publication triggers a question about the model, synchronisation, lineage or quality.",
        exclut:
          "A request for a value, a score or access to a financing institution.",
      },
      {
        nom: "Move to the second publication",
        compte:
          "A reader asks how to turn the recognised constraint into a system rule.",
        exclut: "An isolated click with no question or return.",
      },
    ],
    registre: [
      "Publication and language",
      "Reader category, without an organisation name",
      "Constraint number",
      "Signal type",
      "Normalised question, without case-file quotation",
      "Next step: answer, correct, deepen or produce nothing",
    ],
    decision:
      "Resonance exists when several reader categories return to the same constraints with distinct architecture consequences. It is not inferred from a public volume, and no arbitrary threshold is set before the first responses exist.",
  },
  clause: {
    repere: "11 / BOUNDARY",
    titre: "This text concerns the construction of the system",
    texte: CLAUSE_RENVOI_EN,
    note: "This controlled rendering preserves the routing of the French clause. It separates system-building method from reporting and day-to-day management software.",
  },
  conclusion: {
    repere: "12 / CONCLUSION",
    titre: "A constraint named precisely becomes a design rule",
    paragraphes: [
      "The seven constraints do not require a separate narrative. They require a system that can distinguish absence from zero, a choice from a given fact, a statement from a record, an observation from a transmission and a translation from a transcript. These distinctions are modest. They still determine whether the data can be reviewed after the person who entered it has left.",
      "The next step is not to produce another tool immediately. It is to listen for where the constraints are recognised, which ones return together and which building questions they create. The second publication starts there and turns each constraint into a reviewable architecture decision.",
    ],
  },
};

export const ARTICLE_ARCHITECTURE_FR: ArticleAfrique = {
  langue: "fr",
  codeLangue: "fr-FR",
  code: "AXP-122 / PUBLICATION 2",
  titre:
    "Concevoir une chaîne de preuve ESG pour les conditions réelles d’Afrique de l’Ouest",
  sousTitre:
    "Sept contraintes deviennent sept décisions d’architecture. L’objectif n’est pas de rendre le terrain plus propre qu’il ne l’est, mais de garder chaque transformation lisible, réversible et attribuable.",
  date: "18 septembre 2026",
  dateIso: "2026-09-18",
  lecture: "Lecture approfondie",
  autreLangue: {
    libelle: "Read in English",
    href: "/en/articles/west-african-esg-data-architecture",
    hreflang: "en",
  },
  autrePublication: {
    libelle: "Relire les sept contraintes depuis l’entreprise",
    href: "/articles/sept-contraintes-donnee-esg-afrique-ouest",
  },
  introduction: [
    "Une contrainte ne devient utile à une architecture que lorsqu’elle modifie une règle du système. Dire que la connexion est discontinue n’apporte rien si l’enregistrement ne possède pas d’identifiant local. Dire que la donnée est souvent sur papier n’apporte rien si le modèle ne distingue pas la saisie de la pièce. Dire que plusieurs devises circulent n’apporte rien si la conversion remplace la valeur d’origine.",
    "Le texte précédent a pris le point de vue de l’entreprise qui reçoit la demande. Celui-ci prend le point de vue de la personne qui construit. Les sept contraintes restent exactement les mêmes. Ce qui change est la question posée à chacune : quelle décision faut-il pouvoir tester dans le modèle, le parcours de collecte et le journal de preuve ?",
    "Le résultat recherché n’est pas un système qui ne connaît jamais d’incertitude. Un tel système mentirait dès qu’une donnée est absente. Le résultat recherché est un système qui sait localiser l’incertitude, conserver sa cause, montrer l’effet d’une correction et refuser de présenter comme prouvable ce qui ne l’est pas.",
    "Cette architecture n’est pas un logiciel livré à un client. C’est une méthode de construction destinée à celles et ceux qui conçoivent le modèle. Elle ne fournit aucune valeur de facteur d’émission, ne prépare aucun dossier de financement et ne transforme aucune pression de donneur d’ordre en obligation locale.",
  ],
  titreContraintes:
    "Sept contraintes, sept décisions qui doivent survivre au code",
  introductionContraintes: [
    "Chaque section relie la contrainte arrêtée dans la branche EJ à une décision observable. La règle est simple : une décision qui n’apparaît ni dans le schéma, ni dans les états, ni dans le journal ne tient pas. Elle reste une intention de conception.",
  ],
  libelles: {
    source: "Contrainte et conséquence arrêtées",
    voix: "Question posée au système",
    decision: "Décision testable",
    limite: "Échec à détecter",
  },
  contraintes: [
    {
      ...CONTRAINTES_FR[0],
      voix: "Pouvons-nous refaire le calcul avec une nouvelle référence sans perdre la source, la version et la justification de l’ancienne ?",
      titre: "Décision 1 : séparer l’activité de la référence",
      paragraphes: [
        "La donnée d’activité et le facteur ne sont pas le même objet. La donnée décrit ce qui s’est passé. Le facteur décrit la référence choisie pour transformer cette activité. Les fusionner dans une valeur finale rend le recalcul opaque. Les séparer permet de changer une référence, de mesurer l’écart et de conserver l’ancien résultat avec sa méthode.",
        "Le registre de facteurs contient les métadonnées du choix, jamais une bibliothèque présentée comme locale. Le calcul pointe vers une version figée. La décision de changer de version produit une nouvelle trace et ne modifie pas silencieusement les périodes déjà restituées.",
      ],
      decision:
        "Deux objets liés, activité et référence, plus un journal de choix versionné et une fonction de recalcul explicite.",
      limite:
        "Un test doit échouer si un résultat ne permet pas de retrouver la référence exacte et la donnée d’activité d’origine.",
    },
    {
      ...CONTRAINTES_FR[1],
      voix: "Le modèle sait-il expliquer pourquoi une valeur manque et relier une saisie à la pièce qui l’a déclenchée ?",
      titre: "Décision 2 : modéliser l’absence et la provenance",
      paragraphes: [
        "Une valeur nullable ne suffit pas. L’absence possède un code de raison, une date de constat, une personne responsable de la prochaine action et, lorsqu’elle existe, une pièce en attente de lecture. La photographie d’un registre n’est pas rangée comme une illustration. Elle devient une source reliée à la saisie, avec son empreinte, son origine et son état de lecture.",
        "La correction conserve l’avant et l’après. Si une image est relue ou si une facture arrive, le système crée une nouvelle version de la donnée et ferme l’état d’absence. Il devient possible de distinguer une amélioration de collecte d’une modification de l’activité.",
      ],
      decision:
        "Taxonomie d’absence, objet source, lien de provenance, état de lecture et historique de correction.",
      limite:
        "Un contrôle doit refuser une valeur sans source ou sans motif d’absence lorsque le champ appartient au périmètre attendu.",
    },
    {
      ...CONTRAINTES_FR[2],
      voix: "Le passage du réseau au groupe reste-t-il visible dans la période, avec les pièces et unités propres à chaque source ?",
      titre:
        "Décision 3 : représenter l’énergie comme une chronologie de sources",
      paragraphes: [
        "Le modèle ne commence pas par une facture mensuelle. Il commence par une période, un site et une source d’énergie active. Le réseau, le groupe et toute autre source occupent des intervalles qui peuvent se chevaucher. Les achats de combustible et les relevés viennent ensuite documenter ces intervalles.",
        "Cette représentation évite qu’une coupure devienne une absence inexpliquée. Elle permet aussi de déclarer une estimation lorsque l’heure de bascule n’a pas été enregistrée, sans confondre cette estimation avec une mesure. La distinction reste visible jusqu’à la restitution.",
      ],
      decision:
        "Événements de bascule, intervalles par source, état mesuré ou estimé, pièces et règles de rapprochement.",
      limite:
        "Un contrôle doit signaler toute période opérationnelle sans source d’énergie ou avec un chevauchement non expliqué.",
    },
    {
      ...CONTRAINTES_FR[3],
      voix: "Que se passe-t-il si deux appareils modifient le même objet avant le retour de la connexion ?",
      titre: "Décision 4 : faire de la synchronisation un protocole explicite",
      paragraphes: [
        "Chaque écriture locale reçoit un identifiant stable, une version attendue et deux temps : celui de l’observation et celui de la réception. Le serveur n’écrase pas automatiquement. Il compare les versions, accepte les ajouts indépendants et place les conflits réels dans une file de résolution.",
        "Les pièces suivent un cycle séparé. La saisie structurée peut être reçue avant l’image, puis passer d’un état incomplet à un état documenté. Une reprise échouée ne renvoie que le fragment manquant. Cette granularité réduit le coût de connexion et évite qu’un fichier lourd bloque tout le lot.",
      ],
      decision:
        "Identifiants stables, version attendue, journal local, accusé de réception, reprise partielle et résolution de conflit.",
      limite:
        "Un essai hors ligne doit provoquer un conflit contrôlé, jamais une perte silencieuse ni un doublon accepté.",
    },
    {
      ...CONTRAINTES_FR[4],
      voix: "Pouvons-nous conserver une information utile sans lui inventer une pièce comptable ou une force qu’elle n’a pas ?",
      titre: "Décision 5 : séparer les modes d’établissement d’un fait",
      paragraphes: [
        "Une quantité déclarée, une observation directe, un reçu, un paiement rapproché et une seconde confirmation sont cinq chemins différents. Le schéma conserve le chemin suivi. Il peut ensuite appliquer une règle de qualité sans transformer le résultat en jugement sur le fournisseur.",
        "Le champ « non prouvable » n’est pas une sortie exceptionnelle. Il appartient au modèle. Il nomme ce qui manque, pourquoi cela manque et ce qui pourrait faire évoluer l’état. Cette honnêteté empêche une agrégation finale de cacher les fragilités de la collecte amont.",
      ],
      decision:
        "Type de source, mode d’établissement, recoupements, limite explicite et condition éventuelle de révision.",
      limite:
        "Un contrôle doit empêcher qu’une déclaration seule soit affichée comme équivalente à une pièce ou à une observation.",
    },
    {
      ...CONTRAINTES_FR[5],
      voix: "Le système peut-il remonter du montant restitué au paiement d’origine et expliquer chaque conversion ?",
      titre: "Décision 6 : conserver les devises et les temps du flux",
      paragraphes: [
        "Le modèle stocke le montant d’origine comme fait immuable et ajoute une ou plusieurs conversions comme objets dérivés. Chaque conversion porte sa source de taux, sa période, sa règle d’arrondi et son usage. Une restitution peut ainsi choisir une conversion adaptée sans réécrire la transaction.",
        "La date comptable, la date de paiement, la date du service mobile et la période ESG ne sont pas fusionnées. Le lignage explicite leur relation. Cette structure rend visibles les décalages de période et les doubles conversions qui passeraient autrement inaperçus.",
      ],
      decision:
        "Transaction source immuable, conversions dérivées, quatre temps distincts et lien vers l’activité concernée.",
      limite:
        "Un contrôle doit refuser une conversion sans source de taux ou toute restitution qui a perdu le montant d’origine.",
    },
    {
      ...CONTRAINTES_FR[6],
      voix: "Pouvons-nous distinguer la parole recueillie, la reformulation, la saisie et la validation sans enregistrer plus que nécessaire ?",
      titre: "Décision 7 : traiter l’oral comme une chaîne de transformation",
      paragraphes: [
        "Le système n’a pas besoin d’enregistrer chaque échange. Il doit en revanche conserver la langue, le rôle de la personne qui reformule, le moment de la saisie et la manière dont le sens a été validé. Un terme conservé dans la langue d’origine peut être lié à une note sans produire un support entier dans cette langue.",
        "La minimisation compte autant que la traçabilité. Une donnée audio ne doit pas être gardée par défaut. Le système conserve seulement ce qui est nécessaire pour comprendre la transformation et attribuer la saisie. La personne interrogée reste visible comme source humaine sans que son propos devienne un matériau public.",
      ],
      decision:
        "Étapes de collecte, langue, rôles, validation du sens, minimisation et accès limité aux notes.",
      limite:
        "Un contrôle doit signaler une reformulation sans langue source, sans auteur ou sans mode de validation.",
    },
  ],
  methode: {
    repere: "08 / CONTRÔLE TRANSVERSE",
    titre: "Une chaîne de preuve minimale en neuf gestes",
    introduction: [
      "Les sept décisions partagent un même trajet. Le détail varie selon l’objet, mais aucune donnée destinée à être relue ne devrait sauter l’un des gestes ci-dessous sans laisser une raison explicite.",
    ],
    etapes: [
      { titre: "Observer", texte: "Dater le fait avant de le transformer." },
      {
        titre: "Attribuer",
        texte: "Nommer la source et le rôle de la personne qui saisit.",
      },
      {
        titre: "Qualifier",
        texte: "Distinguer mesure, déclaration, estimation, pièce et absence.",
      },
      {
        titre: "Relier",
        texte:
          "Attacher la donnée à son site, sa période, son activité et sa pièce.",
      },
      {
        titre: "Transformer",
        texte: "Appliquer une règle nommée, versionnée et réversible.",
      },
      {
        titre: "Synchroniser",
        texte:
          "Séparer observation, envoi, réception et résolution de conflit.",
      },
      {
        titre: "Contrôler",
        texte: "Faire échouer les états impossibles avant la restitution.",
      },
      {
        titre: "Restituer",
        texte: "Afficher le résultat avec sa méthode, sa date et sa limite.",
      },
      {
        titre: "Réviser",
        texte: "Conserver l’ancien état et expliquer la correction.",
      },
    ],
  },
  resonance: {
    repere: "09 / RÉSONANCE UTILE",
    titre: "Mesurer le passage d’un constat à une décision de système",
    introduction: [
      "La seconde publication ne mesure plus seulement la reconnaissance des contraintes. Elle observe si les lecteurs utilisent les décisions pour interroger leur propre architecture. Le signal utile n’est pas « ce sujet m’intéresse », mais « cette règle manque dans notre modèle » ou « ce contrôle échouerait chez nous ».",
      "Aucun compteur n’est rendu public. Le registre sert à décider s’il faut approfondir une méthode existante, corriger une décision ou ne rien produire. Il ne sert pas à donner une apparence d’audience.",
    ],
    signaux: [
      {
        nom: "Question de mise en œuvre",
        compte:
          "Une question porte sur un identifiant, un état, un conflit, une source ou un contrôle décrit dans le texte.",
        exclut: "Une demande générale de présentation du sujet.",
      },
      {
        nom: "Test appliqué",
        compte:
          "Une personne confronte l’un des contrôles à son système et revient avec un échec ou une nuance.",
        exclut: "Une déclaration d’intérêt sans essai ni question précise.",
      },
      {
        nom: "Réemploi de méthode",
        compte:
          "Une équipe demande à reprendre la grille de décision ou la chaîne en neuf gestes dans son travail.",
        exclut:
          "Une demande de produit fini, de valeur ou de montage de dossier.",
      },
      {
        nom: "Contradiction documentée",
        compte:
          "Un retour montre qu’une décision ne tient pas dans une condition réelle et propose le fait qui la contredit.",
        exclut: "Un désaccord de principe sans condition observable.",
      },
    ],
    registre: [
      "Publication et langue",
      "Catégorie de constructeur, sans identité d’organisation",
      "Décision concernée",
      "Type de signal",
      "Condition technique normalisée",
      "Effet : maintenir, corriger, diviser ou retirer la décision",
    ],
    decision:
      "Une suite devient justifiée lorsque des questions d’architecture récurrentes apparaissent sur une même décision et que leur traitement demande davantage qu’une réponse courte. Les réactions publiques seules n’ouvrent aucun nouveau produit.",
  },
  clause: {
    repere: "10 / FRONTIÈRE",
    titre: "La méthode s’arrête là où commence le logiciel livré",
    texte: CLAUSE_RENVOI_FR,
    note: "Cette clause ferme la confusion possible entre une méthode destinée aux constructeurs et les produits qui servent à produire un rapport ou à tenir la gestion courante.",
  },
  conclusion: {
    repere: "11 / CONCLUSION",
    titre: "L’architecture devient crédible lorsqu’elle sait montrer sa limite",
    paragraphes: [
      "Une chaîne de preuve ne se résume pas à accumuler des pièces. Elle organise les transformations entre une activité, une observation, une saisie, une référence et une restitution. Dans les conditions décrites ici, la robustesse vient de la possibilité de fonctionner hors ligne, de qualifier l’absence, de conserver la valeur d’origine et de dire ce qui n’est pas prouvable.",
      "Ces décisions peuvent être testées avant tout produit. Un conflit hors ligne peut être provoqué. Une conversion peut être remontée. Une photo de registre peut être reliée à sa saisie. Une période alimentée par plusieurs sources peut être reconstruite. Là où le test échoue, l’architecture possède enfin une question précise à résoudre.",
    ],
  },
};

export const ARTICLE_ARCHITECTURE_EN: ArticleAfrique = {
  langue: "en",
  codeLangue: "en-GB",
  code: "AXP-122 / PUBLICATION 2",
  titre:
    "Designing an ESG evidence chain for real operating conditions in West Africa",
  sousTitre:
    "Seven constraints become seven architecture decisions. The aim is not to make the field look cleaner than it is, but to keep every transformation readable, reversible and attributable.",
  date: "18 September 2026",
  dateIso: "2026-09-18",
  lecture: "Long read",
  autreLangue: {
    libelle: "Lire en français",
    href: "/articles/architecture-donnee-esg-afrique-ouest",
    hreflang: "fr",
  },
  autrePublication: {
    libelle: "Read the seven constraints from the company viewpoint",
    href: "/en/articles/seven-constraints-west-african-esg-data",
  },
  introduction: [
    "A constraint becomes useful to architecture only when it changes a system rule. Saying that connectivity is intermittent achieves nothing if a record has no local identifier. Saying that data is often on paper achieves nothing if the model does not separate an entry from its supporting record. Saying that several currencies circulate achieves nothing if conversion replaces the original value.",
    "The first publication took the viewpoint of the company receiving the request. This one takes the viewpoint of the builder. The seven constraints remain the same. The question changes: which decision must be testable in the model, the collection path and the evidence log?",
    "The intended outcome is not a system that never encounters uncertainty. Such a system would misrepresent the first missing value. The intended outcome is a system that can locate uncertainty, preserve its cause, show the effect of a correction and refuse to present as evidenced what cannot be evidenced.",
    "This architecture is not software delivered to a client. It is a building method for people designing the model. It supplies no emission-factor values, assembles no financing application and turns no buyer pressure into a local legal duty.",
  ],
  titreContraintes:
    "Seven constraints and seven decisions that must survive the code",
  introductionContraintes: [
    "Each section connects the constraint fixed in branch EJ to an observable decision. The rule is simple: a decision that appears neither in the schema, nor in the states, nor in the log does not hold. It remains an intention.",
  ],
  libelles: {
    source: "Fixed constraint and consequence",
    voix: "Question for the system",
    decision: "Testable decision",
    limite: "Failure to detect",
  },
  contraintes: [
    {
      ...CONSTRAINTS_EN[0],
      voix: "Can we run the calculation again with a new reference without losing the source, version and rationale of the previous one?",
      titre: "Decision 1: separate activity from reference",
      paragraphes: [
        "Activity data and the factor are not the same object. The first describes what happened. The second describes the selected reference used to transform that activity. Merging them into a final value makes recalculation opaque. Separating them makes it possible to change a reference, measure the difference and preserve the previous result with its method.",
        "The factor register contains the metadata of the choice, never a library presented as local. A calculation points to a frozen version. A decision to change version creates a new trace and does not silently alter periods already reported.",
      ],
      decision:
        "Two linked objects, activity and reference, plus a versioned choice log and an explicit recalculation function.",
      limite:
        "A test must fail when a result cannot recover the exact reference and the original activity data.",
    },
    {
      ...CONSTRAINTS_EN[1],
      voix: "Can the model explain why a value is missing and link an entry to the material that triggered it?",
      titre: "Decision 2: model absence and provenance",
      paragraphes: [
        "A nullable value is not enough. Absence carries a reason code, an observation date, a person responsible for the next action and, when it exists, material waiting to be read. A photograph of a record is not stored as an illustration. It becomes a source linked to the entry, with its fingerprint, origin and reading state.",
        "Correction preserves before and after. When an image is read again or an invoice arrives, the system creates a new version of the data and closes the absence state. It becomes possible to separate an improvement in collection from a change in activity.",
      ],
      decision:
        "Absence taxonomy, source object, provenance link, reading state and correction history.",
      limite:
        "A control must reject a value without a source or an absence reason when the field is expected within the boundary.",
    },
    {
      ...CONSTRAINTS_EN[2],
      voix: "Does the move from the grid to a generator remain visible in the period, with records and units specific to each source?",
      titre: "Decision 3: represent energy as a timeline of sources",
      paragraphes: [
        "The model does not begin with a monthly invoice. It begins with a period, a site and an active energy source. The grid, a generator and any other source occupy intervals that may overlap. Fuel purchases and readings then document those intervals.",
        "This representation prevents an outage from becoming an unexplained absence. It also allows an estimate when the switch time was not recorded, without confusing that estimate with a measurement. The distinction remains visible through reporting.",
      ],
      decision:
        "Switch events, intervals by source, measured or estimated state, records and matching rules.",
      limite:
        "A control must flag any operating period with no energy source or an unexplained overlap.",
    },
    {
      ...CONSTRAINTS_EN[3],
      voix: "What happens when two devices change the same object before connectivity returns?",
      titre: "Decision 4: make synchronisation an explicit protocol",
      paragraphes: [
        "Every local write receives a stable identifier, an expected version and two times: observation and receipt. The server does not overwrite automatically. It compares versions, accepts independent additions and places real conflicts in a resolution queue.",
        "Attachments follow a separate cycle. A structured entry can be received before its image, then move from incomplete to documented. A failed retry sends only the missing fragment. This granularity reduces connection cost and prevents one large file from blocking the whole batch.",
      ],
      decision:
        "Stable identifiers, expected version, local log, acknowledgement, partial retry and conflict resolution.",
      limite:
        "An offline test must cause a controlled conflict, never silent loss or an accepted duplicate.",
    },
    {
      ...CONSTRAINTS_EN[4],
      voix: "Can we preserve useful information without inventing an accounting record or a weight it does not have?",
      titre: "Decision 5: separate the ways a fact is established",
      paragraphes: [
        "A declared quantity, direct observation, a receipt, a matched payment and a second confirmation are five different paths. The schema preserves the path used. It can then apply a quality rule without turning the outcome into a judgement about the supplier.",
        "The “cannot be evidenced” field is not an exceptional exit. It belongs in the model. It names what is missing, why it is missing and what could change the state. This candour prevents a final aggregation from hiding weaknesses in upstream collection.",
      ],
      decision:
        "Source type, establishment mode, corroboration, explicit limitation and possible revision condition.",
      limite:
        "A control must prevent a statement alone from being displayed as equivalent to a record or an observation.",
    },
    {
      ...CONSTRAINTS_EN[5],
      voix: "Can the system trace a reported amount back to the original payment and explain every conversion?",
      titre: "Decision 6: preserve currencies and the times of the flow",
      paragraphes: [
        "The model stores the original amount as an immutable fact and adds one or more conversions as derived objects. Each conversion carries its rate source, period, rounding rule and use. A report can then select an appropriate conversion without rewriting the transaction.",
        "The accounting date, payment date, mobile-money date and ESG period are not merged. Their relationship is explicit in the lineage. This structure reveals period mismatches and double conversions that would otherwise pass unnoticed.",
      ],
      decision:
        "Immutable source transaction, derived conversions, four distinct times and a link to the relevant activity.",
      limite:
        "A control must reject a conversion without a rate source or any report that has lost the original amount.",
    },
    {
      ...CONSTRAINTS_EN[6],
      voix: "Can we distinguish collected speech, reformulation, entry and validation without recording more than necessary?",
      titre: "Decision 7: treat oral collection as a transformation chain",
      paragraphes: [
        "The system does not need to record every exchange. It does need to preserve the language, the role of the person reformulating, the time of entry and the way meaning was validated. A term kept in the original language can be linked to a note without producing an entire written resource in that language.",
        "Minimisation matters as much as traceability. Audio must not be kept by default. The system preserves only what is needed to understand the transformation and attribute the entry. The person interviewed remains visible as a human source without their words becoming public material.",
      ],
      decision:
        "Collection stages, language, roles, validation of meaning, minimisation and restricted access to notes.",
      limite:
        "A control must flag a reformulation with no source language, author or validation mode.",
    },
  ],
  methode: {
    repere: "08 / CROSS-CUTTING CONTROL",
    titre: "A minimal evidence chain in nine actions",
    introduction: [
      "The seven decisions share one path. The detail changes with the object, but data intended for later review should not skip one of the actions below without leaving an explicit reason.",
    ],
    etapes: [
      { titre: "Observe", texte: "Date the fact before transforming it." },
      {
        titre: "Attribute",
        texte: "Name the source and the role of the person entering it.",
      },
      {
        titre: "Qualify",
        texte: "Separate measurement, statement, estimate, record and absence.",
      },
      {
        titre: "Link",
        texte: "Attach the data to its site, period, activity and record.",
      },
      {
        titre: "Transform",
        texte: "Apply a named, versioned and reversible rule.",
      },
      {
        titre: "Synchronise",
        texte:
          "Separate observation, transmission, receipt and conflict resolution.",
      },
      { titre: "Control", texte: "Reject impossible states before reporting." },
      {
        titre: "Report",
        texte: "Display the result with its method, date and limitation.",
      },
      {
        titre: "Revise",
        texte: "Preserve the old state and explain the correction.",
      },
    ],
  },
  traduction: {
    repere: "09 / TRANSLATION CONTROL",
    titre: "The English version keeps method and legal weight separate",
    introduction:
      "The same choices apply here as in the first publication. Evidence is preferred when the French word does not claim legal certainty. Informal describes the absence of formal accounting records, not illegality. Buyer or lead firm avoids a public-procurement meaning, while financing institution includes lenders without turning the relationship into sponsorship.",
    choix: [
      {
        terme: "Chaîne de preuve",
        choix: "Evidence chain",
        raison:
          "The phrase describes linked sources, transformations and limitations. It does not claim certainty beyond those links.",
      },
      {
        terme: "Donnée prouvable",
        choix: "Data that can be evidenced",
        raison:
          "Provable would sound absolute. The method remains bounded by the available sources.",
      },
      {
        terme: "Paiement mobile",
        choix: "Mobile money",
        raison:
          "This is the operational term for wallet and operator-based transactions in the contexts discussed here.",
      },
      {
        terme: "Hors ligne",
        choix: "Offline operation",
        raison:
          "Offline-first can imply a full product doctrine. The text only states the behaviour the architecture must support.",
      },
    ],
  },
  resonance: {
    repere: "10 / USEFUL RESONANCE",
    titre: "Measure the move from observation to a system decision",
    introduction: [
      "The second publication no longer measures only recognition of the constraints. It observes whether readers use the decisions to question their own architecture. The useful signal is not “this interests me” but “this rule is missing from our model” or “this control would fail in our system”.",
      "No counter is made public. The register helps decide whether an existing method should be deepened, corrected or left alone. It is not used to create the appearance of an audience.",
    ],
    signaux: [
      {
        nom: "Implementation question",
        compte:
          "A question concerns an identifier, state, conflict, source or control described in the text.",
        exclut: "A general request for an introduction to the topic.",
      },
      {
        nom: "Applied test",
        compte:
          "A reader applies one control to a system and returns with a failure or nuance.",
        exclut: "A statement of interest with no test or precise question.",
      },
      {
        nom: "Method reuse",
        compte:
          "A team asks to reuse the decision grid or the nine-action chain in its work.",
        exclut:
          "A request for a finished product, a value or a financing application.",
      },
      {
        nom: "Documented contradiction",
        compte:
          "A response shows that a decision fails under a real condition and identifies the fact that contradicts it.",
        exclut: "A disagreement in principle with no observable condition.",
      },
    ],
    registre: [
      "Publication and language",
      "Builder category, without an organisation identity",
      "Relevant decision",
      "Signal type",
      "Normalised technical condition",
      "Effect: maintain, correct, split or withdraw the decision",
    ],
    decision:
      "A follow-up becomes justified when recurring architecture questions appear around the same decision and require more than a short answer. Public reactions alone open no new product.",
  },
  clause: {
    repere: "11 / BOUNDARY",
    titre: "The method stops where delivered software begins",
    texte: CLAUSE_RENVOI_EN,
    note: "This controlled rendering preserves the routing of the French clause and keeps a building method separate from reporting and day-to-day management software.",
  },
  conclusion: {
    repere: "12 / CONCLUSION",
    titre: "Architecture becomes credible when it can show its limit",
    paragraphes: [
      "An evidence chain is not a pile of records. It organises transformations between an activity, an observation, an entry, a reference and a report. Under the conditions described here, resilience comes from operating offline, qualifying absence, preserving the original value and stating what cannot be evidenced.",
      "These decisions can be tested before any product exists. An offline conflict can be triggered. A conversion can be traced back. A photograph of a record can be linked to its entry. A period supplied by several energy sources can be reconstructed. Where the test fails, the architecture finally has a precise question to solve.",
    ],
  },
};

export const ARTICLES_AFRIQUE = [
  ARTICLE_CONTRAINTES_FR,
  ARTICLE_CONTRAINTES_EN,
  ARTICLE_ARCHITECTURE_FR,
  ARTICLE_ARCHITECTURE_EN,
];

export function texteArticleAfrique(article: ArticleAfrique): string {
  return [
    article.code,
    article.titre,
    article.sousTitre,
    article.date,
    ...article.introduction,
    article.titreContraintes,
    ...article.introductionContraintes,
    ...article.contraintes.flatMap((contrainte) => [
      contrainte.nom,
      contrainte.consequence,
      contrainte.voix,
      contrainte.titre,
      ...contrainte.paragraphes,
      contrainte.decision,
      contrainte.limite,
    ]),
    article.methode.repere,
    article.methode.titre,
    ...article.methode.introduction,
    ...article.methode.etapes.flatMap((etape) => [etape.titre, etape.texte]),
    ...(article.traduction
      ? [
          article.traduction.repere,
          article.traduction.titre,
          article.traduction.introduction,
          ...article.traduction.choix.flatMap((choix) => [
            choix.terme,
            choix.choix,
            choix.raison,
          ]),
        ]
      : []),
    article.resonance.repere,
    article.resonance.titre,
    ...article.resonance.introduction,
    ...article.resonance.signaux.flatMap((signal) => [
      signal.nom,
      signal.compte,
      signal.exclut,
    ]),
    ...article.resonance.registre,
    article.resonance.decision,
    article.clause.repere,
    article.clause.titre,
    article.clause.texte,
    article.clause.note,
    article.conclusion.repere,
    article.conclusion.titre,
    ...article.conclusion.paragraphes,
  ].join("\n");
}

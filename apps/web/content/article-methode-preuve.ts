export type ArticleLangue = "fr" | "en";

type SectionArticle = {
  id: string;
  repere: string;
  titre: string;
  paragraphes: string[];
};

type DecisionRejetee = {
  titre: string;
  croyance: string;
  rupture: string;
  suite: string;
};

type PreuveCassee = {
  code: string;
  methode: string;
  retenu: string;
  rupture: string;
  manque: string;
};

export type ArticleMethodePreuve = {
  langue: ArticleLangue;
  codeLangue: string;
  surtitre: string;
  titre: string;
  sousTitre: string;
  date: string;
  dateIso: string;
  dureeLecture: string;
  autreLangue: { libelle: string; href: string; hreflang: string };
  introduction: string[];
  sectionsAvantDecisions: SectionArticle[];
  titreDecisions: string;
  introductionDecisions: string[];
  libellesDecision: {
    croyance: string;
    rupture: string;
    suite: string;
  };
  decisions: DecisionRejetee[];
  titrePreuves: string;
  introductionPreuves: string[];
  verdict: string;
  libellesPreuve: {
    retenu: string;
    rupture: string;
    manque: string;
  };
  preuves: PreuveCassee[];
  sectionsApresPreuves: SectionArticle[];
  titreSources: string;
  introductionSources: string;
  sources: { libelle: string; href: string }[];
  appel: {
    repere: string;
    titre: string;
    texte: string;
    lien: string;
    href: string;
  };
};

export const ARTICLE_PREUVE_FR: ArticleMethodePreuve = {
  langue: "fr",
  codeLangue: "fr-FR",
  surtitre: "AXP-71 / MÉTHODE DE PREUVE",
  titre: "La preuve commence quand le système accepte d’avoir tort",
  sousTitre:
    "Quatre méthodes ont perdu leur état, cinq décisions ont été rejetées et plusieurs chaînes de preuve ont cassé. Voici ce que cette passe a changé dans ADAMA OS.",
  date: "18 septembre 2026",
  dateIso: "2026-09-18",
  dureeLecture: "Lecture longue",
  autreLangue: {
    libelle: "Read in English",
    href: "/en/articles/proof-method",
    hreflang: "en",
  },
  introduction: [
    "Un système de preuve devient intéressant au moment où il produit un résultat que son auteur aurait préféré ne pas publier. Tant qu’il ne fait que confirmer ce qui était déjà raconté, il reste un décor méthodologique. Il peut être propre, documenté et rassurant. Il ne prouve pourtant pas qu’il sait résister à l’intérêt de la personne qui le tient.",
    "La passe de vérification menée sur ADAMA OS a produit ce résultat inconfortable. Au début de la lecture, quatre méthodes sur sept portaient l’état PROUVE. À la fin, aucune ne le portait encore. Les quatre méthodes n’avaient pas cessé de fonctionner. Le code, les registres, le cockpit et le journal public existaient toujours. Ce qui avait disparu était le droit de confondre un usage interne avec un résultat mesurable publié.",
    "Cette correction ne raconte donc pas un effondrement technique. Elle raconte une discipline qui accepte de perdre un mot lorsque les éléments disponibles ne le soutiennent plus. Elle montre aussi le coût réel d’une méthode de preuve : relire les affirmations qui arrangent, conserver les erreurs visibles, réparer les renvois, renoncer à des chiffres séduisants et retarder un état tant que son critère n’est pas rempli.",
    "L’article applique au portfolio d’ADAMA la règle qu’il défend pour les systèmes ESG : une affirmation doit avoir une source, une méthode, une date, une limite et une procédure de revirement. Les décisions rejetées ne sont pas reconstruites après coup. Elles viennent de la passe de vérification du programme. Les preuves cassées ne sont pas des scénarios pédagogiques. Ce sont les justifications qui figuraient réellement dans le système et qui n’ont pas tenu lorsqu’elles ont été comparées aux règles en vigueur.",
  ],
  sectionsAvantDecisions: [
    {
      id: "preuve-promesse",
      repere: "01 / PREUVE ET PROMESSE",
      titre: "Une preuve n’est pas un récit plus assuré",
      paragraphes: [
        "Un angle de la branche EH pose une règle simple : la preuve plutôt que la promesse. Il est facile de l’appliquer aux autres. Il est beaucoup plus exigeant de l’appliquer à son propre portfolio. Une page publique peut accumuler des captures, des journaux, des tests et des décisions sans démontrer le résultat qu’elle affirme. La quantité de traces ne transforme pas automatiquement une affirmation en preuve. Elle permet seulement de remonter le travail, à condition que les traces répondent à la bonne question.",
        "Pour une méthode, la question n’est pas seulement : a-t-elle été utilisée ? Il faut demander par qui, quand, sur quel objet, avec quel résultat, selon quelle mesure et où ce résultat peut être relu. Un cockpit utilisé par son auteur établit un usage. Un test exécuté établit un comportement dans un périmètre donné. Un journal public établit qu’une construction a été racontée et datée. Aucun de ces éléments, pris seul, ne démontre qu’une méthode produit un résultat observable au-delà de son propre contexte.",
        "La distinction paraît sévère parce qu’elle retire une récompense symbolique à un travail réel. C’est précisément pour cela qu’elle est utile. Si l’état le plus élevé peut être accordé dès qu’un système fonctionne pour son auteur, il ne décrit plus la maturité de la méthode. Il décrit la satisfaction de celui qui l’a construite. La preuve commence lorsque cette satisfaction ne suffit plus.",
        "ADAMA OS conserve donc plusieurs couches qui ne doivent pas être fusionnées. Une source permet de retrouver l’origine d’une affirmation. Une méthode explique comment cette source a été transformée. Un horodatage fixe le moment de l’observation. Une expiration indique quand il faut relire. Un revirement conserve la trace du changement. Le résultat mesurable vient ensuite. Il ne peut pas être remplacé par la propreté des couches précédentes.",
      ],
    },
    {
      id: "ia-decision",
      repere: "02 / FRONTIÈRE DE DÉCISION",
      titre: "Un modèle propose, la chaîne de preuve dispose",
      paragraphes: [
        "Un autre angle de EH2 affirme que l’IA n’a pas le droit de décider. Dans le système, cette phrase ne signifie pas que le modèle serait inutile. Elle signifie que sa sortie ne devient pas vraie simplement parce qu’elle a été formulée avec assurance. Le modèle peut chercher, rapprocher, résumer ou proposer. La chaîne doit encore retrouver une source, vérifier la pertinence, exposer la limite et refuser lorsque le matériau ne suffit pas.",
        "Cette frontière possède déjà des éléments mesurés. Le plancher de récupération est fixé à 0,15. La vérification publique considère l’échec sous 0,45 et la réussite à partir de 0,50. Ces nombres n’établissent pas une qualité générale de l’IA. Ils décrivent des portes précises dans une chaîne précise. Leur utilité vient de cette modestie : ils indiquent quand continuer, quand signaler une faiblesse et quand ne pas répondre.",
        "La passe a montré qu’une règle de refus peut elle-même être surévaluée. Dire que la chaîne échoue plutôt que d’inventer décrit un comportement de conception. Pour faire passer la méthode AI Decision Boundary de TESTE à PROUVE, il faut publier une mesure du taux de refus observé. Sans cette mesure, la frontière existe dans le code et dans les tests, mais son résultat réel n’est pas encore établi.",
        "Le même principe vaut pour l’article que vous lisez. Aucun nombre n’est ajouté pour rendre le récit plus impressionnant. Les comptes cités viennent de la passe. Lorsqu’un ordre de grandeur n’a pas été mesuré, il n’entre pas dans le texte. Une histoire moins spectaculaire mais remontable vaut davantage qu’une précision fabriquée.",
      ],
    },
    {
      id: "construire-seul",
      repere: "03 / DISCIPLINE DE CONSTRUCTION",
      titre: "Construire seul augmente le besoin de contradiction",
      paragraphes: [
        "Le troisième angle affirme que construire seul n’est pas construire petit. Une personne peut tenir une architecture étendue, plusieurs registres et une chaîne de publication. Mais la concentration des rôles crée un risque particulier : la même personne formule l’idée, construit le système, choisit le test, interprète le résultat et publie le verdict. Sans mécanisme de contradiction, cette continuité devient une machine à confirmer ses propres choix.",
        "Les registres, les invariants, les listes de contrôle et l’inventaire machine ne servent donc pas à donner une apparence industrielle au travail. Ils séparent des moments qui seraient autrement confondus. Une décision est écrite avec sa raison et sa condition de caducité. Un invariant peut faire tomber une décision plus récente. Un test peut retirer un état déjà affiché. Une limite fermée reste visible avec la preuve de sa fermeture. Le système gagne en surface parce qu’il doit compenser l’absence d’une équipe qui contredirait naturellement son auteur.",
        "La passe de vérification a joué ce rôle de contradiction. Elle n’a pas demandé si le programme était ambitieux ou cohérent dans son intention. Elle a recompilé les comptes, suivi les dépendances, comparé les textes en vigueur, vérifié les liens et opposé chaque état à son critère. Plusieurs éléments ont tenu. D’autres ont cassé. La valeur de la passe vient de l’absence de traitement préférentiel entre les deux catégories.",
        "Construire seul exige enfin de rendre la correction moins coûteuse que le déni. Un état doit pouvoir descendre sans effacer le travail déjà accompli. Une décision doit pouvoir être remplacée sans faire disparaître son ancienne raison. Une page publique doit pouvoir reconnaître une erreur sans devenir inutilisable. Cette réversibilité n’affaiblit pas le système. Elle évite qu’il défende une affirmation uniquement parce qu’elle est déjà visible.",
      ],
    },
    {
      id: "etats",
      repere: "04 / ÉTATS DE MATURITÉ",
      titre: "TESTE n’est pas une salle d’attente",
      paragraphes: [
        "Le programme utilise trois états principaux pour les méthodes : RECHERCHE, TESTE et PROUVE. RECHERCHE signifie que la question, l’hypothèse ou la structure existe, mais qu’un essai daté manque encore. TESTE signifie qu’un usage ou un essai a eu lieu et qu’il peut être remonté. PROUVE exige davantage : un résultat mesurable publié, rattaché à un usage réel et daté.",
        "Une autre échelle existait dans le laboratoire. La passe a fixé la correspondance : OBSERVÉ rejoint RECHERCHE, EXPÉRIMENTÉ rejoint TESTE et PROUVE reste PROUVE. CONCEPT et ARCHIVE n’ont pas d’équivalent dans le laboratoire. Cette correspondance empêche deux vocabulaires voisins de produire des maturités différentes pour le même objet.",
        "La correction de quatre méthodes ne doit pas être lue comme leur retour à zéro. TESTE reconnaît du travail réel. Il dit seulement ce que ce travail permet d’affirmer aujourd’hui. M-003 reste TESTE dans l’attente d’un second corpus extérieur. M-005 reste TESTE dans l’attente d’un second produit. M-007 reste RECHERCHE dans l’attente d’un essai daté. Chaque état contient ainsi sa prochaine condition sans annoncer le moment où elle sera remplie.",
      ],
    },
  ],
  titreDecisions: "Cinq décisions qui n’ont pas survécu à la passe",
  introductionDecisions: [
    "Une décision rejetée n’est pas une mauvaise idée rendue ridicule après coup. C’est une option qui paraissait tenable avec les informations disponibles, puis qui a rencontré une règle, un compte ou une frontière plus forte. Conserver ce trajet permet de comprendre le système actuel. L’effacer donnerait l’impression trompeuse que le choix juste avait toujours été évident.",
    "Les cinq décisions ci-dessous viennent directement de la passe de vérification. Elles couvrent la maturité des méthodes, le vocabulaire des niveaux, le tableau de bord, la frontière avec l’emploi et la durée du programme.",
  ],
  libellesDecision: {
    croyance: "Ce que le système croyait",
    rupture: "Ce qui l’a fait tomber",
    suite: "Ce qui fait foi",
  },
  decisions: [
    {
      titre: "Quatre méthodes pouvaient rester à l’état PROUVE",
      croyance:
        "Leur utilisation dans le cockpit, STRATA ou le journal public semblait établir une maturité suffisante. Les objets existaient, fonctionnaient et laissaient des traces consultables.",
      rupture:
        "XINV-39 exige un usage réel daté avec un résultat mesurable publié. Les justifications décrivaient des usages internes, pas les résultats demandés par la règle.",
      suite:
        "M-001, M-002, M-004 et M-006 passent à TESTE. Le tableau de bord passe de 4 sur 7 à 0 sur 7 pour l’état PROUVE.",
    },
    {
      titre: "Les niveaux de visibilité pouvaient rester N0 à N3",
      croyance:
        "La notation paraissait courte, lisible et déjà intégrée aux textes de diffusion.",
      rupture:
        "Elle entrait en collision avec N1 à N5, les niveaux du parcours ATELIER. Un même code pouvait alors désigner une visibilité ou une progression.",
      suite:
        "Les niveaux de visibilité deviennent NV0 à NV3 : public, contre une adresse, payant, puis sous licence.",
    },
    {
      titre: "Le tableau de bord devait garder six indicateurs",
      croyance:
        "AXP-88 fixait six indicateurs et continuait d’être repris dans les pages de pilotage.",
      rupture:
        "AXP-271 traite le même tableau et en impose huit. Deux prescriptions en vigueur ne pouvaient pas compter différemment le même objet.",
      suite:
        "AXP-271 révise AXP-88. Le tableau suit huit indicateurs, dont les méthodes à l’état PROUVE et les heures passées.",
    },
    {
      titre: "Un réseau d’employeurs pouvait rester au catalogue",
      croyance:
        "La famille M annonçait un réseau d’employeurs et un annuaire comme prolongements possibles du corpus.",
      rupture:
        "La mise en relation entre candidats et employeurs figure parmi les objets qui n’entrent jamais dans la branche. Le catalogue contredisait donc sa propre frontière.",
      suite:
        "Le réseau d’employeurs et l’annuaire de recrutement sortent. Un annuaire de praticiens reste possible seulement s’il ne met personne en relation avec un employeur.",
    },
    {
      titre: "Le programme durait six ans",
      croyance:
        "Cette durée était répétée dans plusieurs textes et avait fini par fonctionner comme une donnée acquise.",
      rupture:
        "Le programme compte 581 jours. Au rythme écrit de 7,2 jours par mois, cette charge représente 81 mois, soit près de sept ans.",
      suite:
        "La durée de six ans est retirée. Le programme conserve son rythme et sa charge mesurés, sans raccourcir le résultat du calcul.",
    },
  ],
  titrePreuves: "Quatre preuves qui ont cassé",
  introductionPreuves: [
    "Le défaut le plus lourd concernait le mot central de la branche. Quatre méthodes portaient l’état PROUVE alors que leurs propres fiches ne citaient aucun résultat mesurable publié. Les preuves invoquées n’étaient pas fictives. Elles répondaient simplement à une autre question que celle posée par XINV-39.",
    "La correction consiste donc à nommer ce que chaque élément établit réellement, puis à écrire ce qui manque. Rien n’est supprimé : ni l’usage, ni le code, ni le journal, ni les tests. Seul l’état descend.",
  ],
  verdict: "Zéro méthode n’est PROUVE.",
  libellesPreuve: {
    retenu: "Ce qui avait été retenu",
    rupture: "Pourquoi cela n’a pas tenu",
    manque: "Ce qu’il faut encore",
  },
  preuves: [
    {
      code: "M-001",
      methode: "Evidence-First ESG Architecture",
      retenu:
        "La méthode était utilisée dans le cockpit et sur les actifs d’ADAMA. Les sources, décisions et limites étaient reliées.",
      rupture:
        "Aucune mesure de résultat datée n’était publiée. La fiche indiquait même que rien ne manquait avant de reconnaître que cette mesure restait à produire.",
      manque: "Publier une mesure de résultat datée.",
    },
    {
      code: "M-002",
      methode: "Solo SaaS Build System",
      retenu:
        "Adama appliquait le système à ses propres constructions, avec des registres, des tests et un journal de travail.",
      rupture:
        "Un usage par l’auteur montre que le système peut être suivi par celui qui l’a conçu. Il ne montre pas encore qu’une autre personne peut l’appliquer.",
      manque: "Un usage daté par une autre personne.",
    },
    {
      code: "M-004",
      methode: "AI Decision Boundary",
      retenu:
        "La chaîne de recherche augmentée possédait des seuils et refusait de répondre lorsque le matériau récupéré ne suffisait pas.",
      rupture:
        "Le comportement était présent dans la conception et les tests, mais aucune mesure publiée ne décrivait le taux de refus observé.",
      manque: "Publier une mesure du taux de refus de la chaîne.",
    },
    {
      code: "M-006",
      methode: "Public Build System",
      retenu:
        "Le journal public exposait les constructions, les décisions, les corrections et la matière brute du dépôt.",
      rupture:
        "Publier son propre travail établit une pratique. Cela ne montre pas encore qu’un second praticien peut adopter la méthode et publier avec elle.",
      manque:
        "Un second praticien qui applique la méthode et publie son usage.",
    },
  ],
  sectionsApresPreuves: [
    {
      id: "autres-ruptures",
      repere: "07 / AUTRES RUPTURES",
      titre: "Le problème dépassait les quatre méthodes",
      paragraphes: [
        "La passe a trouvé neuf décisions citées mais jamais écrites. XDEC-09 à XDEC-17 apparaissaient comme une plage résumée, sans énoncé, sans raison et sans condition de caducité. Dans le même temps, une page annonçait que ces décisions restaient à rendre tandis que le registre disait que toutes les décisions étaient datées. Les deux affirmations ne pouvaient pas rester vraies. Les neuf décisions ont été écrites en entier.",
        "Quatre contradictions internes opposaient aussi des textes en vigueur. L’affiliation sortante et l’affiliation entrante étaient confondues. Le maintien du public entrait en conflit avec la possibilité de retirer une entrée fausse. Une sortie logicielle de méthode semblait autoriser ce que XINV-01 interdit à la branche. Chaque collision a reçu une règle de priorité et une lecture bornée.",
        "Le registre XDEC, cité par trois procédures, n’était atteignable depuis aucune page du programme. Il existait, mais le lecteur ne pouvait pas y arriver. Cette panne rappelle qu’une preuve inaccessible ne joue pas son rôle. Un identifiant ou un nom de registre ne remplace pas un chemin utilisable.",
        "Enfin, cinq chantiers, EH7 à EH11, restaient hors de toutes les vagues alors qu’ils portaient des idées identifiées. Le tableau distribuait 127 chantiers sur 132 et paraissait complet à la lecture. Le recompte a fait apparaître le trou. Les cinq chantiers ont rejoint la vague X3.",
      ],
    },
    {
      id: "ce-qui-tient",
      repere: "08 / CE QUI A TENU",
      titre: "Une passe honnête conserve aussi les résultats justes",
      paragraphes: [
        "Une vérification qui ne publie que les erreurs produit une autre déformation. Plusieurs structures ont résisté au recompte. Les additions de jours des branches du ratissage sont exactes. Les comptes de chantiers bouclent sur 208. Aucun code de chantier n’a de trou ni de doublon sur les dix-huit branches. Aucune dépendance ne pointe vers un chantier inexistant.",
        "Le registre XINV va de 01 à 60 sans rupture ni répétition. Les huit familles ajoutées couvrent AXP-223 à AXP-300 sans trou ni chevauchement. Les sept routes de l’interface sont bien sept et restent toutes en lecture. Le récapitulatif du registre XDEC couvre sa plage complète.",
        "Ces résultats comptent parce qu’ils donnent une forme au désaccord. La correction des méthodes ne signifie pas que tout le système est faux. Elle signifie que certains éléments ont passé leurs tests et que d’autres ont échoué. La méthode doit savoir publier les deux sans transformer les succès en immunité ni les échecs en condamnation générale.",
      ],
    },
    {
      id: "cout",
      repere: "09 / COÛT RÉEL",
      titre: "La preuve coûte surtout ce qu’elle oblige à abandonner",
      paragraphes: [
        "Le coût réel de la méthode n’est pas un prix de logiciel. Il apparaît dans les renoncements qu’elle impose. Il faut abandonner un état valorisant, reprendre un texte déjà publié, conserver une erreur dans l’historique, réparer un lien peu visible et retarder une affirmation que l’on voudrait utiliser immédiatement.",
        "Il apparaît aussi dans l’entretien. Une source peut changer, un chiffre peut diverger, un lien peut mourir et une règle peut être révisée. La preuve n’est donc pas un paquet constitué une fois pour toutes. C’est une relation maintenue entre une affirmation et les éléments qui permettent encore de la soutenir. La date et l’expiration ne sont pas des métadonnées décoratives. Elles empêchent une observation ancienne de continuer à parler au présent.",
        "La passe a montré un autre coût : résumer un invariant de mémoire est plus rapide que le copier, mais cette économie déforme la règle. Sept des dix-sept défauts observés sur les pages de branche venaient d’invariants raccourcis. Dans un cas, la version tronquée était devenue le critère de contrôle d’une interface. La règle corrigée est directe : un invariant se cite dans sa forme entière ou par un lien qui permet de le relire.",
        "Enfin, une preuve publique oblige à accepter une asymétrie. Le travail nécessaire pour retirer un mot peut être important, alors que la correction visible tient parfois en une ligne. Cette disproportion est normale. La fonction de la ligne n’est pas de montrer l’effort fourni. Elle est de dire exactement ce que les éléments permettent encore d’affirmer.",
      ],
    },
    {
      id: "methode-corrigee",
      repere: "10 / MÉTHODE CORRIGÉE",
      titre: "Cinq règles pour la prochaine passe",
      paragraphes: [
        "Première règle : un état se gagne, il ne se décerne pas. La fiche doit porter la condition observable qui ouvre l’état suivant. Tant que cette condition manque, le travail reste nommé à son niveau actuel.",
        "Deuxième règle : une citation d’invariant se copie ou se relie. Elle ne se recompose pas de mémoire. Le sens d’une règle tient souvent dans sa réserve, sa date ou son exception, exactement les morceaux qu’un résumé retire en premier.",
        "Troisième règle : un chiffre possède un relevé. S’il n’existe ni comptage, ni source, ni méthode de calcul, il reste un jugement et doit être écrit comme tel. La précision visuelle d’un nombre ne remplace pas son origine.",
        "Quatrième règle : un renvoi doit être parcourable. Un registre nommé mais inaccessible, une preuve sans URL stable ou une décision sans chemin depuis le texte qui la cite sont des objets incomplets.",
        "Cinquième règle : la correction reste visible. Une entrée fausse peut être retirée, mais une notice datée doit dire ce qui existait et pourquoi cela a changé. Le revirement devient alors une partie de la preuve, pas un défaut à cacher.",
      ],
    },
    {
      id: "conclusion",
      repere: "11 / CONCLUSION",
      titre: "Perdre un état pour retrouver une méthode",
      paragraphes: [
        "Après la passe, aucune des sept méthodes n’est à l’état PROUVE. Cette phrase n’annule ni le code ni les usages déjà observés. Elle remet chaque élément à sa place et rend les prochaines conditions vérifiables.",
        "La preuve commence ici : non pas lorsque le système accumule assez de traces pour paraître solide, mais lorsqu’il accepte qu’une règle puisse lui retirer une affirmation à laquelle son auteur tient. Un portfolio qui publie ce retrait ne devient pas infaillible. Il devient lisible, contestable et révisable. Cette base permet de continuer à construire sans masquer ce qui reste ouvert.",
      ],
    },
  ],
  titreSources: "Chemins de vérification",
  introductionSources:
    "Les pages ci-dessous exposent les traces publiques utilisées par les trois angles de EH2. La passe complète reste conservée dans le programme interne, sans donnée de client, de prix négocié ni de dossier.",
  sources: [
    { libelle: "Registre public des preuves", href: "/preuves" },
    { libelle: "Journal des revirements", href: "/revirements" },
    { libelle: "Pannes et limites", href: "/systeme/pannes" },
    { libelle: "Architecture technique", href: "/technique" },
    { libelle: "Décisions d’architecture", href: "/decisions" },
  ],
  appel: {
    repere: "SIGNAL",
    titre: "Recevoir les prochaines notes de construction",
    texte:
      "La lettre reprend les décisions, les échecs et l’avancement réel du système. La liste ADAMA reste séparée de toute liste commerciale.",
    lien: "Lire la page de SIGNAL",
    href: "/lettre",
  },
};

export const ARTICLE_PREUVE_EN: ArticleMethodePreuve = {
  langue: "en",
  codeLangue: "en-GB",
  surtitre: "AXP-71 / EVIDENCE METHOD",
  titre: "Proof begins when the system accepts that it can be wrong",
  sousTitre:
    "Four methods lost their status, five decisions were rejected, and several evidence chains broke. This is what the review changed inside ADAMA OS.",
  date: "18 September 2026",
  dateIso: "2026-09-18",
  dureeLecture: "Long read",
  autreLangue: {
    libelle: "Lire en français",
    href: "/articles/methode-de-preuve",
    hreflang: "fr",
  },
  introduction: [
    "An evidence system becomes interesting when it produces a result its author would rather not publish. As long as it merely confirms the story already being told, it remains methodological scenery. It may be tidy, documented, and reassuring. It still does not show that it can resist the interests of the person who maintains it.",
    "The review of ADAMA OS produced that uncomfortable result. At the start, four of seven methods carried the status PROVEN. At the end, none of them did. The methods had not stopped working. The code, registers, cockpit, and public build log still existed. What had disappeared was the right to treat internal use as a published, measurable result.",
    "This correction is not the story of a technical collapse. It is the story of a discipline willing to lose a word when the available material no longer supports it. It also reveals the real cost of an evidence method: rereading convenient claims, keeping errors visible, repairing references, withdrawing attractive figures, and postponing a status until its stated condition has been met.",
    "This article applies to Adama’s portfolio the rule it defends for ESG systems: a claim needs a source, a method, a timestamp, an expiry condition, and a reversal procedure. The rejected decisions were not reconstructed for teaching purposes. They come from the programme review. The broken evidence is not hypothetical. It consists of the arguments that were present in the system and failed when tested against the rules already in force.",
  ],
  sectionsAvantDecisions: [
    {
      id: "evidence-promise",
      repere: "01 / EVIDENCE AND PROMISE",
      titre: "Evidence is not a more confident story",
      paragraphes: [
        "The first angle of the EH branch is simple: evidence before promise. It is easy to apply that principle to other people. Applying it to one’s own portfolio is harder. A public page can accumulate screenshots, logs, tests, and decisions without demonstrating the result it claims. A large quantity of traces does not automatically turn a statement into evidence. It merely makes the work traceable, provided that the traces answer the right question.",
        "For a method, the question is not merely whether it has been used. We must ask by whom, when, on which object, with which result, under which measure, and where that result can be inspected. A cockpit used by its author establishes use. A test establishes behaviour within a stated perimeter. A public log establishes that construction was recorded and dated. None of these elements, on its own, demonstrates that a method produces an observable result outside its original context.",
        "The distinction feels severe because it removes a symbolic reward from real work. That is precisely why it matters. If the highest state can be granted as soon as a system works for its author, it no longer describes the maturity of the method. It describes the satisfaction of the person who built it. Proof begins when that satisfaction is no longer enough.",
        "ADAMA OS therefore keeps several layers separate. A source makes it possible to find the origin of a claim. A method explains how that source was transformed. A timestamp fixes the moment of observation. An expiry condition says when the claim must be reviewed. A reversal preserves the change. The measurable result comes afterwards. It cannot be replaced by the quality of the preceding layers.",
      ],
    },
    {
      id: "ai-decision",
      repere: "02 / DECISION BOUNDARY",
      titre: "A model proposes, the evidence chain decides",
      paragraphes: [
        "The second EH2 angle states that AI is not allowed to decide. In this system, the sentence does not make the model useless. It means that an output does not become true merely because it was expressed confidently. The model may search, connect, summarise, or propose. The chain must still recover a source, test relevance, expose the limit, and refuse when the material is insufficient.",
        "This boundary already has measured elements. The retrieval floor is 0.15. Public verification records failure below 0.45 and success from 0.50. These numbers do not establish the general quality of AI. They describe particular gates in a particular chain. Their value comes from that modest scope: they say when to continue, when to flag weakness, and when not to answer.",
        "The review showed that a refusal rule can itself be overstated. Saying that the chain fails rather than inventing describes a design behaviour. To move AI Decision Boundary from TESTED to PROVEN, a measured refusal rate must be published. Without that measure, the boundary exists in code and tests, but its real result has not yet been established.",
        "The same principle governs this article. No figure is added to make the story sound more impressive. The counts come from the review. Where no measurement exists, no numerical estimate appears. A quieter account that can be traced is worth more than fabricated precision.",
      ],
    },
    {
      id: "building-alone",
      repere: "03 / BUILDING DISCIPLINE",
      titre: "Building alone increases the need for contradiction",
      paragraphes: [
        "The third angle states that building alone does not mean building small. One person can maintain an extensive architecture, several registers, and a publication chain. The concentration of roles creates a particular risk: the same person frames the idea, builds the system, chooses the test, interprets the result, and publishes the verdict. Without a contradiction mechanism, that continuity becomes a machine for confirming its own choices.",
        "Registers, invariants, checklists, and the machine inventory are not there to give the work an industrial appearance. They separate moments that would otherwise merge. A decision is written with its reason and expiry condition. An invariant can overturn a later decision. A test can withdraw a status that is already visible. A closed limitation remains visible with the trace of its closure. The system grows in surface because it must compensate for the absence of a team that would naturally challenge its author.",
        "The review played that role. It did not ask whether the programme was ambitious or coherent in intention. It recalculated counts, followed dependencies, compared current texts, checked links, and tested every status against its criterion. Several elements held. Others broke. The value of the review comes from the absence of preferential treatment between those two categories.",
        "Building alone also requires correction to be cheaper than denial. A status must be able to move down without deleting the work already completed. A decision must be replaceable without erasing its former reason. A public page must be able to acknowledge an error without becoming unusable. This reversibility does not weaken the system. It prevents the system from defending a claim merely because the claim is already visible.",
      ],
    },
    {
      id: "states",
      repere: "04 / MATURITY STATES",
      titre: "TESTED is not a waiting room",
      paragraphes: [
        "The programme uses three main states for methods: RESEARCH, TESTED, and PROVEN. RESEARCH means that the question, hypothesis, or structure exists but a dated trial is still missing. TESTED means that a use or trial has taken place and can be traced. PROVEN asks for more: a published, measurable result attached to real, dated use.",
        "Another scale existed in the laboratory. The review fixed the mapping: OBSERVED maps to RESEARCH, EXPERIMENTED maps to TESTED, and PROVEN maps to PROVEN. CONCEPT and ARCHIVE have no laboratory equivalent. The mapping prevents two neighbouring vocabularies from producing different maturity states for the same object.",
        "Moving four methods down should not be read as sending them back to zero. TESTED recognises real work. It states only what that work supports today. M-003 remains TESTED while waiting for a second, external corpus. M-005 remains TESTED while waiting for a second product. M-007 remains RESEARCH while waiting for a dated trial. Each state contains its next condition without announcing when that condition will be met.",
      ],
    },
  ],
  titreDecisions: "Five decisions that did not survive the review",
  introductionDecisions: [
    "A rejected decision is not a bad idea made ridiculous after the event. It is an option that appeared tenable with the available information and later met a stronger rule, count, or boundary. Keeping that journey makes the current system understandable. Erasing it would create the false impression that the retained choice had always been obvious.",
    "The five decisions below come directly from the programme review. They concern method maturity, visibility vocabulary, the dashboard, the employment boundary, and programme duration.",
  ],
  libellesDecision: {
    croyance: "What the system believed",
    rupture: "What broke the decision",
    suite: "What now governs",
  },
  decisions: [
    {
      titre: "Four methods could remain PROVEN",
      croyance:
        "Their use in the cockpit, STRATA, or the public build log seemed to establish sufficient maturity. The objects existed, worked, and left readable traces.",
      rupture:
        "XINV-39 requires real, dated use with a published, measurable result. The arguments described internal use rather than the results required by the rule.",
      suite:
        "M-001, M-002, M-004, and M-006 move to TESTED. The dashboard moves from 4 of 7 to 0 of 7 methods in the PROVEN state.",
    },
    {
      titre: "Visibility levels could remain N0 to N3",
      croyance:
        "The notation appeared short, readable, and already embedded in distribution texts.",
      rupture:
        "It collided with N1 to N5, the levels of the ATELIER path. The same code could describe either visibility or progression.",
      suite:
        "Visibility levels become NV0 to NV3: public, in exchange for an address, paid, then licensed.",
    },
    {
      titre: "The dashboard should keep six indicators",
      croyance:
        "AXP-88 defined six indicators and continued to be repeated across steering pages.",
      rupture:
        "AXP-271 concerns the same dashboard and requires eight. Two current prescriptions could not count the same object differently.",
      suite:
        "AXP-271 revises AXP-88. The dashboard tracks eight indicators, including methods in the PROVEN state and time spent.",
    },
    {
      titre: "An employer network could remain in the catalogue",
      croyance:
        "Family M described an employer network and a directory as possible extensions of the corpus.",
      rupture:
        "Matching candidates with employers is among the objects that never enter this branch. The catalogue contradicted its own boundary.",
      suite:
        "The employer network and recruitment directory are removed. A practitioner directory remains possible only if it does not match anyone with an employer.",
    },
    {
      titre: "The programme lasted six years",
      croyance:
        "The duration was repeated in several texts and had started to function as an accepted fact.",
      rupture:
        "The programme contains 581 days. At the written pace of 7.2 days per month, that workload represents 81 months, which is close to seven years.",
      suite:
        "The six-year duration is withdrawn. The programme keeps its measured pace and workload without shortening the result of the calculation.",
    },
  ],
  titrePreuves: "Four pieces of evidence that broke",
  introductionPreuves: [
    "The heaviest defect concerned the central word of the branch. Four methods carried the PROVEN state although their own records cited no published, measurable result. The evidence was not imaginary. It simply answered a different question from the one asked by XINV-39.",
    "The correction names what each element actually establishes and then states what is missing. Nothing is deleted: not the use, the code, the log, or the tests. The status alone moves down.",
  ],
  verdict: "Zero methods are PROVEN.",
  libellesPreuve: {
    retenu: "What had been accepted",
    rupture: "Why it did not hold",
    manque: "What is still required",
  },
  preuves: [
    {
      code: "M-001",
      methode: "Evidence-First ESG Architecture",
      retenu:
        "The method was used in the cockpit and across Adama’s assets. Sources, decisions, and limitations were connected.",
      rupture:
        "No dated result measure had been published. The record even stated that nothing was missing before acknowledging that the measure still had to be produced.",
      manque: "Publish a dated result measure.",
    },
    {
      code: "M-002",
      methode: "Solo SaaS Build System",
      retenu:
        "Adama applied the system to his own builds, using registers, tests, and a work log.",
      rupture:
        "Use by the author shows that the system can be followed by the person who designed it. It does not yet show that another person can apply it.",
      manque: "Dated use by another person.",
    },
    {
      code: "M-004",
      methode: "AI Decision Boundary",
      retenu:
        "The retrieval chain had thresholds and refused to answer when the retrieved material was insufficient.",
      rupture:
        "The behaviour was present in the design and tests, but no published measure described the observed refusal rate.",
      manque: "Publish a measure of the chain’s refusal rate.",
    },
    {
      code: "M-006",
      methode: "Public Build System",
      retenu:
        "The public log exposed builds, decisions, corrections, and raw repository material.",
      rupture:
        "Publishing one’s own work establishes a practice. It does not yet show that a second practitioner can adopt the method and publish with it.",
      manque:
        "A second practitioner who applies the method and publishes the use.",
    },
  ],
  sectionsApresPreuves: [
    {
      id: "other-breaks",
      repere: "07 / OTHER BREAKS",
      titre: "The problem extended beyond four methods",
      paragraphes: [
        "The review found nine decisions that were cited but had never been written. XDEC-09 to XDEC-17 appeared as a summarised range, without a statement, reason, or expiry condition. At the same time, one page said that these decisions still had to be made while the register said that every decision was dated. Both claims could not remain true. The nine decisions were written in full.",
        "Four internal contradictions also opposed current texts. Outbound and inbound affiliation were confused. Keeping public material visible conflicted with the ability to remove a false entry. A software output from a method appeared to permit what XINV-01 forbids the branch to deliver. Each collision received a priority rule and a bounded interpretation.",
        "The XDEC register, cited by three procedures, could not be reached from any programme page. It existed, but a reader could not navigate to it. The failure is a reminder that inaccessible evidence cannot perform its function. An identifier or register name does not replace a usable path.",
        "Five work items, EH7 to EH11, were also outside every wave although they carried identified ideas. The table distributed 127 of 132 work items and looked complete when read. Recounting exposed the gap. The five items joined wave X3.",
      ],
    },
    {
      id: "what-held",
      repere: "08 / WHAT HELD",
      titre: "An honest review also preserves correct results",
      paragraphes: [
        "A review that publishes errors alone creates another distortion. Several structures survived recalculation. The day totals for the reviewed branches are correct. Work-item counts close at 208. No work-item code has a gap or duplicate across the eighteen branches. No dependency points to a missing work item.",
        "The XINV register runs from 01 to 60 without a break or repetition. The eight added families cover AXP-223 to AXP-300 without a gap or overlap. The seven interface routes are indeed seven and remain read-only. The XDEC summary covers its complete range.",
        "These results matter because they give disagreement a shape. Correcting the methods does not mean that the whole system is false. It means that some elements passed their tests and others failed. The method must publish both without turning success into immunity or failure into a general condemnation.",
      ],
    },
    {
      id: "cost",
      repere: "09 / REAL COST",
      titre: "Evidence costs what it forces us to abandon",
      paragraphes: [
        "The real cost of the method is not a software price. It appears in the concessions it requires. A valued status must be withdrawn, a published text must be revised, an error must remain in the history, a quiet link must be repaired, and a useful claim must wait until its condition is met.",
        "The cost also appears in maintenance. A source can change, a figure can diverge, a link can die, and a rule can be revised. Evidence is therefore not a package assembled once and kept forever. It is a maintained relationship between a claim and the elements that still support it. The timestamp and expiry condition are not decorative metadata. They prevent an old observation from continuing to speak in the present tense.",
        "The review exposed another cost. Summarising an invariant from memory is faster than copying it, but that saving distorts the rule. Seven of the seventeen defects observed in branch pages came from shortened invariants. In one case, the truncated version had become the control criterion for an interface. The corrected rule is direct: cite an invariant in full or provide a path that allows it to be read again.",
        "Public evidence also creates an asymmetry. The work required to remove one word may be substantial, while the visible correction may occupy a single line. That imbalance is normal. The line is not there to display effort. It is there to state exactly what the available material still supports.",
      ],
    },
    {
      id: "corrected-method",
      repere: "10 / CORRECTED METHOD",
      titre: "Five rules for the next review",
      paragraphes: [
        "Rule one: a state is earned, not awarded. The record must contain the observable condition that opens the next state. Until that condition is met, the work remains named at its current level.",
        "Rule two: an invariant is copied or linked. It is not rebuilt from memory. The meaning of a rule often lives in its reservation, date, or exception, which are the parts a summary tends to remove first.",
        "Rule three: a figure has a record. If no count, source, or calculation method exists, it remains a judgement and must be written as such. The visual precision of a number does not replace its origin.",
        "Rule four: a reference must be navigable. A named but unreachable register, evidence without a stable URL, or a decision without a path from the text that cites it is incomplete.",
        "Rule five: correction remains visible. A false entry may be removed, but a dated notice must state what existed and why it changed. The reversal then becomes part of the evidence rather than a defect to hide.",
      ],
    },
    {
      id: "conclusion",
      repere: "11 / CONCLUSION",
      titre: "Lose a status, recover a method",
      paragraphes: [
        "After the review, none of the seven methods is in the PROVEN state. That sentence does not erase the code or the uses already observed. It returns each element to its proper place and makes the next conditions testable.",
        "Proof begins here: not when the system has accumulated enough traces to look solid, but when it accepts that a rule can remove a claim its author values. A portfolio that publishes that withdrawal does not become infallible. It becomes readable, challengeable, and revisable. That is the useful basis for continuing to build.",
      ],
    },
  ],
  titreSources: "Verification paths",
  introductionSources:
    "The pages below expose the public traces used by the three EH2 angles. The full review remains in the internal programme, without client data, negotiated prices, or case-file material.",
  sources: [
    { libelle: "Public evidence register", href: "/preuves" },
    { libelle: "Reversal log", href: "/revirements" },
    { libelle: "Failures and limitations", href: "/systeme/pannes" },
    { libelle: "Technical architecture", href: "/technique" },
    { libelle: "Architecture decisions", href: "/decisions" },
  ],
  appel: {
    repere: "SIGNAL",
    titre: "Receive the next build notes",
    texte:
      "The letter covers decisions, failures, and real progress. The ADAMA list remains separate from every commercial list.",
    lien: "Read the SIGNAL page",
    href: "/lettre",
  },
};

export function texteArticle(article: ArticleMethodePreuve): string {
  return [
    article.surtitre,
    article.titre,
    article.sousTitre,
    article.date,
    ...article.introduction,
    ...article.sectionsAvantDecisions.flatMap((section) => [
      section.repere,
      section.titre,
      ...section.paragraphes,
    ]),
    article.titreDecisions,
    ...article.introductionDecisions,
    ...article.decisions.flatMap((decision) => [
      decision.titre,
      decision.croyance,
      decision.rupture,
      decision.suite,
    ]),
    article.titrePreuves,
    ...article.introductionPreuves,
    article.verdict,
    ...article.preuves.flatMap((preuve) => [
      preuve.code,
      preuve.methode,
      preuve.retenu,
      preuve.rupture,
      preuve.manque,
    ]),
    ...article.sectionsApresPreuves.flatMap((section) => [
      section.repere,
      section.titre,
      ...section.paragraphes,
    ]),
    article.titreSources,
    article.introductionSources,
    ...article.sources.map((source) => source.libelle),
    article.appel.repere,
    article.appel.titre,
    article.appel.texte,
    article.appel.lien,
  ].join("\n");
}

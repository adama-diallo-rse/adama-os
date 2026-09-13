// =====================================================================
// C6 et C7, le catalogue des decisions d'architecture.
//
// Source de verite du contenu des ADR. Ce fichier ne parle a personne : il
// est lu par src/seed-adr.ts, qui ecrit dans decisions_log. Le site, lui,
// lit la base, jamais ce fichier.
//
// Ce que ce catalogue garantit et ce qu'il ne garantit pas.
//
// Garanti : chaque ADR nomme un fichier, un commit ou une absence reelle du
// depot. Les traces ont ete verifiees une par une avant redaction, avec
// `git log`, et les chiffres de cout viennent de `git show --stat`.
//
// Non garanti : que les options listees soient celles qui ont ete
// reellement envisagees a l'epoque. Pour les ADR marques `reconstruit`,
// elles sont deduites de ce que le code demontre. Le champ `questions` porte
// ce que seul Adama peut trancher, et `reluParAdama` reste faux tant qu'il
// ne l'a pas fait. Un ADR non relu ne se publie pas.
//
// Regle de tenue : les chaines sont affichees telles quelles, elles portent
// leurs accents. Les commentaires n'en portent pas.
// =====================================================================

export type AdrStatut = "propose" | "accepte" | "remplace" | "abandonne";
export type AdrPortee =
  | "adama-os"
  | "esg-optimizer"
  | "strata-scope"
  | "groupe";
export type AdrImpact =
  | "architecture"
  | "conformite"
  | "cout"
  | "produit"
  | "securite";
export type AdrReversibilite = "forte" | "moyenne" | "faible";

export type AdrOption = {
  option: string;
  verdict: "retenue" | "ecartee";
  motif: string;
};

export type AdrPreuveKind =
  | "commit"
  | "fichier"
  | "route"
  | "test"
  | "migration"
  | "absence";

export type AdrPreuve = {
  kind: AdrPreuveKind;
  libelle: string;
  /** Chemin de fichier, empreinte de commit, route ou table. */
  locator: string;
};

/** C7. Les six champs d'un revirement. Portes par l'ADR REMPLACE. */
export type AdrRevirement = {
  croyais: string;
  invalide: string;
  fait: string;
  cout: string;
  /** Vrai quand le cout est estime a partir du diff et non chronometre. */
  coutEstime: boolean;
  /** La regle generale, en une phrase. Elle voyage seule vers /principes. */
  regle: string;
};

export type Adr = {
  adrId: string;
  titre: string;
  statut: AdrStatut;
  date: string;
  portee: AdrPortee;
  impact: AdrImpact;
  reversibilite: AdrReversibilite;
  /** Identifiant de l'ADR que celui-ci remplace. Null sinon. */
  remplace: string | null;
  contexte: readonly string[];
  options: readonly AdrOption[];
  decision: string;
  raisonnement: {
    technique: string;
    reglementaire: string;
    economique: string;
  };
  compromis: string;
  /** Ce qui a ete OBSERVE dans le code, pas ce qui etait espere. */
  consequence: string;
  preuves: readonly AdrPreuve[];
  tags: readonly string[];
  /** Vrai quand l'ADR a ete reconstruit a posteriori depuis le depot. */
  reconstruit: boolean;
  questions: readonly string[];
  revirement: AdrRevirement | null;
};

// ---------------------------------------------------------------------
// Les decisions acceptees
// ---------------------------------------------------------------------

const DEC_001: Adr = {
  adrId: "DEC-001",
  titre: "Récupération documentaire plutôt que réentraînement de modèle",
  statut: "accepte",
  date: "2026-06-15",
  portee: "groupe",
  impact: "architecture",
  reversibilite: "faible",
  remplace: null,
  contexte: [
    "Les produits du groupe doivent répondre sur des textes réglementaires : CSRD, ESRS, VSME. Ces textes changent, et une réponse fausse sur un texte de loi n’est pas une approximation, c’est une faute.",
    "Deux façons de faire tenir un texte dans un modèle de langage : le réentraîner sur le corpus, ou aller chercher les passages pertinents au moment de la question.",
    "Le choix engage tout le reste : l’ingestion, le stockage vectoriel, le coût par réponse et la capacité à citer une source.",
  ],
  options: [
    {
      option: "Réentraîner un modèle sur le corpus réglementaire",
      verdict: "ecartee",
      motif:
        "Un modèle réentraîné fige la réglementation à la date de son entraînement. Chaque évolution de texte imposerait un nouveau cycle, et le modèle ne saurait pas citer le passage sur lequel il s’appuie.",
    },
    {
      option: "Interroger un modèle sans corpus, avec des consignes détaillées",
      verdict: "ecartee",
      motif:
        "Aucune source citable, donc aucune vérification possible par le lecteur. C’est exactement la situation que le reste de ce site refuse.",
    },
    {
      option: "Récupérer les passages pertinents au moment de la question",
      verdict: "retenue",
      motif:
        "Le corpus se met à jour sans toucher au modèle, et chaque réponse peut nommer les passages qui la fondent.",
    },
  ],
  decision:
    "L’assistant du groupe s’appuie sur une récupération documentaire vectorielle, jamais sur un modèle réentraîné.",
  raisonnement: {
    technique:
      "Le corpus est ingéré et vectorisé une fois, puis interrogé à chaque question. Mettre à jour un texte revient à réingérer un document, pas à relancer un entraînement.",
    reglementaire:
      "Une réponse doit pouvoir nommer le passage sur lequel elle s’appuie. Un modèle réentraîné mélange le texte à ses paramètres et ne sait plus dire d’où vient ce qu’il affirme.",
    economique:
      "Pas de coût d’entraînement ni de réentraînement. Le coût se déplace vers l’appel de vectorisation et le stockage de l’index.",
  },
  compromis:
    "Chaque réponse coûte une recherche vectorielle avant la génération, donc de la latence et un appel de plus. Et l’assistant ne sait rien qui ne soit pas dans le corpus : sa qualité est plafonnée par celle de l’ingestion.",
  consequence:
    "Le corpus vit dans le dossier corpus/, l’ingestion dans packages/db/src/ingest.ts, la recherche dans apps/web/lib/ai/retrieval.ts. La table rag_chunks porte un vecteur de mille vingt-quatre dimensions, indexé côté SQL. La décision a rendu possible DEC-007 : sans passages récupérés, l’assistant refuse de répondre au lieu d’inventer.",
  preuves: [
    {
      kind: "fichier",
      libelle: "Recherche vectorielle",
      locator: "apps/web/lib/ai/retrieval.ts",
    },
    {
      kind: "fichier",
      libelle: "Ingestion du corpus",
      locator: "packages/db/src/ingest.ts",
    },
    {
      kind: "migration",
      libelle: "Table rag_chunks et index vectoriel",
      locator: "packages/db/migrations/0000_init.sql",
    },
  ],
  tags: ["ia", "rag", "couts"],
  reconstruit: true,
  questions: [
    "Le réentraînement a-t-il été essayé, ou écarté sur analyse ?",
    "La dimension de mille vingt-quatre est-elle une troncature choisie pour le coût de stockage, ou pour une autre raison ?",
  ],
  revirement: null,
};

const DEC_002: Adr = {
  adrId: "DEC-002",
  titre: "Python plutôt que Node.js pour les moteurs de calcul",
  statut: "accepte",
  date: "2026-06-24",
  portee: "groupe",
  impact: "architecture",
  reversibilite: "moyenne",
  remplace: null,
  contexte: [
    "Le groupe a deux moteurs de calcul à écrire : l’empreinte carbone sur les scopes 1, 2 et 3, et l’analyse documentaire des standards ESRS.",
    "L’interface était déjà en Next.js, donc en TypeScript. Écrire les moteurs dans le même langage aurait évité une deuxième plateforme d’exécution.",
    "Un moteur de calcul de durabilité doit être testable ligne à ligne et rejouable sur un jeu de données connu, parce que son résultat sera contesté sur sa méthode.",
  ],
  options: [
    {
      option: "Écrire les moteurs en TypeScript, dans la même application",
      verdict: "ecartee",
      motif:
        "Une seule plateforme, mais le calcul se mélange à l’interface, et l’outillage scientifique et documentaire disponible est plus pauvre.",
    },
    {
      option: "Écrire les moteurs en Python, exposés par une API séparée",
      verdict: "retenue",
      motif:
        "Le calcul reste isolé de l’interface, testable seul, et l’outillage de traitement documentaire est celui de son écosystème d’origine.",
    },
  ],
  decision:
    "Les moteurs de calcul et d’analyse du groupe sont écrits en Python et exposés par une API séparée. L’interface reste en Next.js.",
  raisonnement: {
    technique:
      "Un moteur sans interface et sans base se teste sur des entrées connues et se rejoue à volonté. Le séparer de l’application le rend remplaçable sans toucher au reste.",
    reglementaire:
      "Un résultat de durabilité doit être reconstituable. Un moteur isolé, testé, dont les entrées et les sorties sont explicites, se défend devant un tiers.",
    economique:
      "Deux plateformes d’exécution à déployer et à surveiller au lieu d’une, contre un temps de développement du calcul plus court.",
  },
  compromis:
    "Deux langages, deux chaînes de dépendances, deux déploiements et deux façons de gérer les erreurs. Pour une personne seule, c’est le double de surface à tenir à jour.",
  consequence:
    "STRATA Scope et ESG Optimizer exposent chacun une API Python, dont la seule surface publique en lecture est une route de santé. Ces deux routes sont ce que ce cockpit interroge, et rien d’autre : le contrat est décrit dans apps/web/lib/ecosystem/gateways.ts.",
  preuves: [
    {
      kind: "fichier",
      libelle: "Contrat des passerelles produit",
      locator: "apps/web/lib/ecosystem/gateways.ts",
    },
    {
      kind: "route",
      libelle: "Route de santé de STRATA Scope",
      locator: "GET /health sur scope.esg-optimizer.fr",
    },
    {
      kind: "route",
      libelle: "Route de santé d’ESG Optimizer",
      locator: "GET /health sur api.esg-optimizer.fr",
    },
  ],
  tags: ["backend", "python", "carbone"],
  reconstruit: true,
  questions: [
    "La bascule a-t-elle coûté une réécriture, ou le moteur Node n’avait-il jamais dépassé le prototype ?",
  ],
  revirement: null,
};

const DEC_003: Adr = {
  adrId: "DEC-003",
  titre:
    "Fournisseur de modèle établi dans l’Union européenne plutôt que hors Union",
  statut: "accepte",
  date: "2026-06-24",
  portee: "groupe",
  impact: "conformite",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "Les produits du groupe traitent des documents d’entreprises soumises à la CSRD. Ces documents contiennent des informations que le client considère comme sensibles avant publication.",
    "Le choix du fournisseur de modèle décide du lieu de traitement de ces documents.",
    "Un fournisseur moins cher faisait transiter les données par une infrastructure hors Union européenne.",
  ],
  options: [
    {
      option: "Fournisseur hors Union européenne, moins cher à l’appel",
      verdict: "ecartee",
      motif:
        "Le transfert hors Union impose une base légale et des garanties que le groupe ne peut pas documenter aujourd’hui. Injustifiable devant un client soumis à la CSRD.",
    },
    {
      option: "Fournisseur établi dans l’Union européenne",
      verdict: "retenue",
      motif:
        "Le lieu de traitement devient une réponse simple à une question que tous les prospects posent.",
    },
  ],
  decision:
    "Le groupe s’appuie sur un fournisseur de modèle établi dans l’Union européenne pour le traitement des documents clients.",
  raisonnement: {
    technique:
      "Les deux fournisseurs exposent une interface comparable. Le changement est une variable d’environnement, pas une réécriture.",
    reglementaire:
      "Un transfert hors Union se documente, se justifie et s’explique au client. À ce stade, le groupe n’a ni le besoin ni les moyens de le faire.",
    economique:
      "Le coût par appel est plus élevé. Il est compensé par le fait que la résidence des données cesse d’être une objection de vente.",
  },
  compromis:
    "Un coût d’appel supérieur, et une dépendance à un fournisseur dont le catalogue de modèles est plus étroit.",
  consequence:
    "Le fournisseur est configuré par variable d’environnement dans apps/web/lib/ai/provider.ts, donc remplaçable sans toucher au reste du code. La vectorisation du corpus, elle, utilise un autre fournisseur : cet écart est réel et reste à trancher.",
  preuves: [
    {
      kind: "fichier",
      libelle: "Choix du fournisseur par configuration",
      locator: "apps/web/lib/ai/provider.ts",
    },
    {
      kind: "fichier",
      libelle: "Vectorisation du corpus",
      locator: "apps/web/lib/ai/embeddings.ts",
    },
  ],
  tags: ["rgpd", "llm", "ue"],
  reconstruit: true,
  questions: [
    "La vectorisation du corpus passe par un fournisseur hors Union : est-ce assumé parce que le corpus est public, ou est-ce un reste à corriger ?",
  ],
  revirement: null,
};

const DEC_004: Adr = {
  adrId: "DEC-004",
  titre:
    "Consommer ce que les produits exposent plutôt que recalculer dans le cockpit",
  statut: "accepte",
  date: "2026-07-13",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "moyenne",
  remplace: "DEC-101",
  contexte: [
    "Un service de calcul avait été démarré dans ce dépôt, sous services/engine : empreinte carbone, matérialité, audit express, avec ses tests.",
    "Le même calcul existait déjà dans STRATA Scope, qui en est le produit responsable.",
    "Deux implémentations du même calcul divergent toujours. La question n’est pas de savoir si, mais quand, et laquelle des deux fera foi le jour où elles ne diront plus la même chose.",
  ],
  options: [
    {
      option:
        "Garder le moteur dans le cockpit et le synchroniser avec le produit",
      verdict: "ecartee",
      motif:
        "Une synchronisation manuelle entre deux implémentations n’est pas une architecture, c’est une dette qui porte un nom rassurant.",
    },
    {
      option:
        "Supprimer le moteur du cockpit et n’afficher que ce que les produits exposent",
      verdict: "retenue",
      motif:
        "Un seul calcul, un seul responsable, et un cockpit qui ne peut pas mentir sur un chiffre qu’il ne produit pas.",
    },
  ],
  decision:
    "Le cockpit ne calcule rien. Il lit ce que les produits exposent, en lecture seule, et affiche l’absence quand ils n’exposent rien.",
  raisonnement: {
    technique:
      "Un calcul appartient au système qui le teste. Le cockpit n’a ni les jeux d’essai, ni les facteurs, ni la responsabilité du résultat.",
    reglementaire:
      "Un chiffre de durabilité engage celui qui le publie. Le publier depuis deux sources rend impossible de dire laquelle fait foi.",
    economique:
      "Un moteur en moins à maintenir, à déployer et à surveiller, pour une personne seule.",
  },
  compromis:
    "Le cockpit ne peut afficher que ce que les produits exposent. Tant qu’ils n’exposent qu’une route de santé, il n’a aucune statistique d’usage à montrer, et cela se voit.",
  consequence:
    "Vingt-sept fichiers modifiés et mille cent quatre-vingt-deux lignes supprimées au commit 56d1f7c, dont le service de calcul entier et ses trois fichiers de tests. Le cockpit lit désormais les produits par apps/web/lib/ecosystem/gateways.ts, qui interdit explicitement tout appel écrivant.",
  preuves: [
    {
      kind: "commit",
      libelle: "Suppression du service de calcul du cockpit",
      locator: "56d1f7c",
    },
    {
      kind: "fichier",
      libelle: "Passerelles en lecture seule",
      locator: "apps/web/lib/ecosystem/gateways.ts",
    },
    {
      kind: "absence",
      libelle: "Aucun moteur de calcul dans ce dépôt",
      locator: "services/",
    },
  ],
  tags: ["architecture", "responsabilite", "cockpit"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_005: Adr = {
  adrId: "DEC-005",
  titre: "Aucune métrique sans source, plutôt qu’un repli chiffré",
  statut: "accepte",
  date: "2026-08-12",
  portee: "adama-os",
  impact: "produit",
  reversibilite: "forte",
  remplace: "DEC-102",
  contexte: [
    "La Couche D et la page des métriques affichaient des valeurs de repli quand la source ne répondait pas, pour éviter des cases vides.",
    "Ces valeurs étaient plausibles, et rien à l’écran ne les distinguait des valeurs relevées.",
    "Un chiffre inventé qui ne se signale pas devient vrai au bout de quelques semaines, y compris pour celui qui l’a écrit.",
  ],
  options: [
    {
      option: "Garder le repli en le signalant visuellement",
      verdict: "ecartee",
      motif:
        "Une mention discrète disparaît à la première capture d’écran, au premier partage et au premier export imprimé.",
    },
    {
      option: "Retirer le repli et afficher l’absence",
      verdict: "retenue",
      motif:
        "Une case vide dit quelque chose de vrai. Elle est désagréable, et c’est le prix.",
    },
  ],
  decision:
    "Aucune valeur chiffrée n’est affichée sans sa source, sa méthode et sa date de relevé. Quand la source ne répond pas, l’absence est affichée telle quelle.",
  raisonnement: {
    technique:
      "La règle est portée par le type et non par la discipline : un composant d’affichage n’accepte pas un nombre, il accepte une affirmation qui porte sa provenance.",
    reglementaire:
      "C’est la discipline que les produits du groupe appliquent à la donnée de durabilité. Ne pas se l’appliquer à soi-même aurait été un argument contre le groupe.",
    economique:
      "Aucun coût direct, un coût commercial réel : un tableau de bord troué se montre moins bien qu’un tableau plein.",
  },
  compromis:
    "Le tableau de bord est incomplet les jours où une source est indisponible, y compris quand un recruteur le regarde. Personne ne peut le rendre présentable en écrivant un chiffre.",
  consequence:
    "Cent lignes ajoutées et soixante-treize retirées au commit 21e483b, sur la Couche D et la page des métriques. L’absence du repli est verrouillée par apps/web/tests/layer-d.test.tsx, et la règle générale par apps/web/tests/no-fabrication.test.ts, qui refuse tout littéral numérique de plus de deux chiffres dans un composant d’affichage de métrique.",
  preuves: [
    {
      kind: "commit",
      libelle: "Retrait des métriques de repli",
      locator: "21e483b",
    },
    {
      kind: "test",
      libelle: "Verrou sur l’absence de repli",
      locator: "apps/web/tests/layer-d.test.tsx",
    },
    {
      kind: "test",
      libelle: "Verrou anti fabrication",
      locator: "apps/web/tests/no-fabrication.test.ts",
    },
    {
      kind: "fichier",
      libelle: "Le type qui porte la règle",
      locator: "apps/web/lib/proof/types.ts",
    },
  ],
  tags: ["preuve", "donnees", "produit"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_006: Adr = {
  adrId: "DEC-006",
  titre: "Registre de produits en base plutôt qu’un tableau écrit dans la page",
  statut: "accepte",
  date: "2026-08-12",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "moyenne",
  remplace: "DEC-103",
  contexte: [
    "La liste des produits du groupe était un tableau écrit dans une page du site. Elle servait aussi à décider quels dépôts alimentaient le journal des livraisons.",
    "Elle était fausse sur la majorité de ses lignes : des produits annoncés qui n’existaient pas, des états périmés, des liens vers des adresses fermées.",
    "Une liste écrite dans une page n’a pas de propriétaire : personne ne la relit, parce que personne ne sait qu’elle existe.",
  ],
  options: [
    {
      option: "Corriger le tableau et le relire régulièrement",
      verdict: "ecartee",
      motif:
        "Une relecture régulière tenue par une seule personne finit toujours par sauter un tour, et rien ne le signale.",
    },
    {
      option: "Tenir le registre en base, avec une règle vérifiable",
      verdict: "retenue",
      motif:
        "La base peut refuser une ligne incohérente. Un état ouvert au public exige une adresse, et l’absence d’adresse interdit le lien.",
    },
  ],
  decision:
    "Les produits du groupe sont tenus dans la table ecosystem_products. Aucune page du site ne connaît la liste, elles la lisent toutes au même endroit.",
  raisonnement: {
    technique:
      "Le registre alimente le hub public, la Couche D en vue groupe et la liste des dépôts suivis par le journal des livraisons. Une seule source pour trois usages.",
    reglementaire:
      "Annoncer un produit ouvert au public sans adresse est une affirmation invérifiable. La contrainte qui l’interdit est posée en base, pas dans une consigne.",
    economique:
      "Une migration et une table de plus, contre une catégorie entière d’erreurs qui ne peut plus se produire.",
  },
  compromis:
    "Le site ne peut plus afficher ses produits sans sa base. Quand Supabase ne répond pas, la grille est vide au lieu d’être fausse, et c’est un choix assumé.",
  consequence:
    "La migration 0001 crée la table, sa contrainte et ses politiques de sécurité au niveau ligne, et révoque la colonne du dépôt pour la clé anonyme. Le hub public /ecosysteme et la liste des dépôts suivis lisent la même table. Deux produits seulement portent une adresse, parce que deux seulement sont ouverts.",
  preuves: [
    {
      kind: "migration",
      libelle: "Création du registre produits",
      locator: "packages/db/migrations/0001_ecosystem_products.sql",
    },
    {
      kind: "commit",
      libelle: "Registre produits en base",
      locator: "24eb785",
    },
    {
      kind: "fichier",
      libelle: "Lecture unique de la liste des dépôts",
      locator: "apps/web/lib/repos.ts",
    },
    { kind: "route", libelle: "Hub public lu en base", locator: "/ecosysteme" },
  ],
  tags: ["base", "registre", "verite"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_007: Adr = {
  adrId: "DEC-007",
  titre: "Échouer explicitement plutôt que répondre sans source",
  statut: "accepte",
  date: "2026-08-31",
  portee: "adama-os",
  impact: "conformite",
  reversibilite: "forte",
  remplace: "DEC-104",
  contexte: [
    "L’assistant du site répond à partir des passages récupérés dans son corpus. Quand la récupération échouait, il générait quand même une réponse.",
    "Cette réponse était fluide, plausible, et fondée sur rien. Elle ressemblait exactement à une réponse fondée.",
    "Un assistant qui répond quand il ne sait pas est plus dangereux qu’un assistant qui tombe en panne, parce que sa panne ne se voit pas.",
  ],
  options: [
    {
      option: "Générer une réponse prudente sans contexte",
      verdict: "ecartee",
      motif:
        "La prudence d’une formulation ne compense pas l’absence de source. Le lecteur n’a aucun moyen de faire la différence.",
    },
    {
      option: "Répondre par une erreur explicite",
      verdict: "retenue",
      motif: "Une panne visible se corrige. Une réponse inventée se propage.",
    },
  ],
  decision:
    "Quand la récupération documentaire échoue, l’assistant renvoie une erreur explicite et ne génère rien.",
  raisonnement: {
    technique:
      "L’échec est renvoyé en code de service indisponible, avec un message lisible, plutôt qu’en réponse deux cents accompagnée d’un texte.",
    reglementaire:
      "Une réponse sur un texte réglementaire sans passage à l’appui n’a aucune valeur, et peut en avoir une négative si l’utilisateur s’y fie.",
    economique:
      "Un appel de génération économisé à chaque incident, et une conversation interrompue plutôt qu’une conversation trompeuse.",
  },
  compromis:
    "L’assistant paraît fragile : il refuse de répondre là où un concurrent aurait dit quelque chose. C’est le comportement voulu, et il faut l’expliquer.",
  consequence:
    "Soixante-six lignes modifiées dans la route de l’assistant au commit 3d10bef, plus un garde-fou de débit. La route renvoie un service indisponible assorti d’un message, et n’appelle pas le modèle.",
  preuves: [
    {
      kind: "commit",
      libelle: "Échec explicite sans source",
      locator: "3d10bef",
    },
    {
      kind: "fichier",
      libelle: "Route de l’assistant",
      locator: "apps/web/app/api/chat/route.ts",
    },
    {
      kind: "test",
      libelle: "Comportement vérifié",
      locator: "apps/web/tests/adama-ai.test.tsx",
    },
  ],
  tags: ["ia", "fiabilite", "produit"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_008: Adr = {
  adrId: "DEC-008",
  titre:
    "Vérification locale assumée plutôt qu’intégration continue décorative",
  statut: "accepte",
  date: "2026-08-31",
  portee: "adama-os",
  impact: "cout",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "Le quota d’exécution d’intégration continue disponible sur le compte était épuisé.",
    "Deux façons de faire : configurer un pipeline qui ne s’exécuterait pas, ou reconnaître qu’il n’y en a pas.",
    "Un pipeline configuré mais jamais exécuté donne l’illusion d’un filet. Un badge vert que personne ne regarde est pire que pas de badge.",
  ],
  options: [
    {
      option: "Configurer un pipeline malgré le quota épuisé",
      verdict: "ecartee",
      motif:
        "Un garde-fou qui ne peut pas s’exécuter ne protège de rien, et fait croire à une protection.",
    },
    {
      option: "Vérifier localement, par un script nommé, et le documenter",
      verdict: "retenue",
      motif:
        "La vérification a lieu réellement, et son absence d’automatisation est écrite plutôt que masquée.",
    },
  ],
  decision:
    "Le dépôt n’a pas d’intégration continue. La vérification est locale, scriptée, et le manque est documenté comme une décision.",
  raisonnement: {
    technique:
      "Le script enchaîne le contrôle de types, l’analyse statique, les tests et la construction. C’est la même séquence qu’un pipeline exécuterait.",
    reglementaire:
      "Le site affirme que ses règles sont verrouillées par des tests. Prétendre qu’elles le sont par un pipeline inexistant aurait été une affirmation fausse de plus.",
    economique: "Coût nul, contre un quota à racheter pour un dépôt personnel.",
  },
  compromis:
    "Rien n’empêche mécaniquement un commit non vérifié d’arriver sur la branche principale. La garantie repose sur une personne, et cette personne peut être pressée.",
  consequence:
    "Le dépôt ne contient aucun dossier de workflows. La séquence de vérification vit dans scripts/check-frontend.ps1, et l’inventaire mesure ce qui, sinon, ne serait vérifié par personne.",
  preuves: [
    {
      kind: "absence",
      libelle: "Aucun workflow d’intégration continue",
      locator: ".github/workflows",
    },
    {
      kind: "fichier",
      libelle: "Séquence de vérification locale",
      locator: "scripts/check-frontend.ps1",
    },
    {
      kind: "fichier",
      libelle: "Inventaire et budget mesurés",
      locator: "scripts/inventory.mjs",
    },
  ],
  tags: ["outillage", "cout", "honnetete"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_009: Adr = {
  adrId: "DEC-009",
  titre: "Cockpit d’un ensemble logiciel plutôt que vitrine d’un produit",
  statut: "accepte",
  date: "2026-07-19",
  portee: "groupe",
  impact: "produit",
  reversibilite: "moyenne",
  remplace: "DEC-105",
  contexte: [
    "Ce site avait été conçu comme la vitrine d’un produit, avec ses pages de vente, son parcours d’achat et sa promesse commerciale.",
    "Le produit avait sa propre adresse, sa propre interface et son propre parcours d’achat. Le site en dupliquait une partie, moins bien.",
    "Ce que ce site est réellement en position de montrer, ce n’est pas un produit : c’est la façon dont plusieurs produits sont construits et tenus par une seule personne.",
  ],
  options: [
    {
      option: "Rester la vitrine du produit principal",
      verdict: "ecartee",
      motif:
        "Deux vitrines pour un produit, dont une moins à jour. Le visiteur arrive sur la mauvaise, et la mauvaise est celle qui porte le nom de l’auteur.",
    },
    {
      option: "Devenir le cockpit de l’ensemble, et renvoyer vers les produits",
      verdict: "retenue",
      motif:
        "Un rôle que ni les produits ni un profil professionnel classique ne remplissent, et qui n’est en concurrence avec rien.",
    },
  ],
  decision:
    "Ce site est le cockpit de l’ensemble logiciel et le lieu où le travail se démontre. Les produits gardent leurs propres vitrines et leurs propres parcours d’achat.",
  raisonnement: {
    technique:
      "Le site n’expose plus de parcours d’achat ni de page produit dupliquée. Il lit un registre et des routes de santé, et renvoie vers les adresses réelles.",
    reglementaire:
      "Une page de vente engage sur une prestation. Un cockpit qui renvoie vers le produit responsable n’ajoute aucun engagement qui ne soit déjà pris ailleurs.",
    economique:
      "Une surface commerciale en moins à tenir à jour, et un contenu qui ne périme pas au rythme des tarifs.",
  },
  compromis:
    "Le site ne convertit plus directement. Il n’a plus de tunnel, plus de prix affiché, plus d’appel à l’achat : il envoie ailleurs, et une partie des visiteurs ne suivra pas.",
  consequence:
    "Les pages produit dupliquées ont été retirées aux commits c881705 et 56d1f7c, et l’ancienne adresse du hub redirige de façon permanente vers /ecosysteme. La roadmap et le blueprint ont été réalignés sur ce recentrage au commit 4116d14.",
  preuves: [
    {
      kind: "commit",
      libelle: "Retrait des pages produit dupliquées",
      locator: "c881705",
    },
    {
      kind: "commit",
      libelle: "Roadmap et blueprint réalignés sur le recentrage",
      locator: "4116d14",
    },
    {
      kind: "fichier",
      libelle: "Redirection permanente de l’ancien hub",
      locator: "apps/web/next.config.ts",
    },
    {
      kind: "test",
      libelle: "Verrou sur la redirection",
      locator: "apps/web/tests/config-redirects.test.ts",
    },
  ],
  tags: ["produit", "positionnement", "cockpit"],
  reconstruit: true,
  questions: [
    "La date du 19 juillet est celle du recentrage documenté ; le commit qui l’acte est du 12 août. Faut-il garder la date de la décision, ou celle de sa mise en oeuvre ?",
  ],
  revirement: null,
};

const DEC_010: Adr = {
  adrId: "DEC-010",
  titre: "Nommer la nature d’une panne plutôt que l’afficher comme une absence",
  statut: "accepte",
  date: "2026-08-31",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "Le cockpit interroge les produits du groupe par une route de santé. Quand l’appel échouait, la case restait vide.",
    "Trois situations très différentes donnaient exactement le même écran : le produit répond qu’il ne va pas bien, le délai d’attente est dépassé, ou la sortie réseau du cockpit elle-même a échoué.",
    "Tant que ces trois cas se ressemblent, le cockpit ne peut pas dire s’il diagnostique un produit ou sa propre panne.",
  ],
  options: [
    {
      option:
        "Garder une absence unique et lire les journaux serveur en cas de doute",
      verdict: "ecartee",
      motif:
        "Le journal serveur n’est pas visible du lecteur, et l’absence continue de mentir à l’écran.",
    },
    {
      option: "Enregistrer chaque tentative avec la nature de son échec",
      verdict: "retenue",
      motif:
        "La panne devient une donnée, avec sa date et sa cause, au lieu d’un blanc que chacun interprète.",
    },
  ],
  decision:
    "Chaque tentative de sonde est enregistrée avec la nature de son échec, et l’interface distingue une panne du produit d’une panne de la sortie réseau du cockpit.",
  raisonnement: {
    technique:
      "Un type énuméré en base porte les quatre natures d’échec. L’interface les traduit en une phrase lisible, sans jargon.",
    reglementaire:
      "Une absence non expliquée se lit comme une omission. Nommer la cause est la même discipline que nommer la source d’une valeur.",
    economique:
      "Une table de plus et une écriture par tentative, contre un diagnostic qui ne demande plus d’ouvrir un journal serveur.",
  },
  compromis:
    "Le cockpit écrit à chaque passage de sonde, y compris quand tout va bien. Cette table grossit, et personne ne la purge aujourd’hui.",
  consequence:
    "La table ecosystem_probes et le type énuméré des natures d’échec sont créés par la migration 0003. La nature de l’échec traverse jusqu’au client, elle est portée par le type des états de passerelle et affichée dans la Couche D. L’extrait technique d’erreur est révoqué pour la clé anonyme : une sonde ne doit pas devenir un journal de fuite.",
  preuves: [
    {
      kind: "migration",
      libelle: "Table des sondes et natures d’échec",
      locator: "packages/db/migrations/0003_data_class.sql",
    },
    {
      kind: "fichier",
      libelle: "Qualification de l’échec côté client",
      locator: "apps/web/lib/ecosystem/client.ts",
    },
    {
      kind: "test",
      libelle: "Comportement des passerelles vérifié",
      locator: "apps/web/tests/ecosystem-gateway.test.ts",
    },
  ],
  tags: ["observabilite", "panne", "cockpit"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

const DEC_011: Adr = {
  adrId: "DEC-011",
  titre: "Une couche commerciale isolée plutôt qu’une interdiction de dépôt",
  statut: "accepte",
  date: "2026-09-07",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "forte",
  remplace: "DEC-106",
  contexte: [
    "ADAMA OS EXPANSION vend des méthodes, des gabarits, des parcours et des avis qui ne sont pas des logiciels.",
    "La preuve publique et l’offre commerciale doivent partager leur réputation sans partager leurs dépendances.",
    "Le stock public au 7 septembre 2026 doit rester public et vérifiable sans compte ni paiement.",
  ],
  options: [
    {
      option: "Créer un autre dépôt et un autre domaine pour tout le commerce",
      verdict: "ecartee",
      motif:
        "Cette séparation imposerait de reconstruire une audience et une réputation sans mieux protéger la preuve.",
    },
    {
      option: "Créer une couche L13 isolée dans le dépôt existant",
      verdict: "retenue",
      motif:
        "La frontière est testable, conserve une seule réputation et interdit tout couplage depuis la preuve.",
    },
  ],
  decision:
    "Le commerce vit dans une couche L13 isolée. Aucune page de preuve ne l’importe et aucune clé de paiement n’est lue ailleurs.",
  raisonnement: {
    technique:
      "Un module isolé, un inventaire de secrets et un test de non-importation rendent la frontière vérifiable.",
    reglementaire:
      "Les conditions de vente et le traitement du paiement restent cantonnés à la surface qui en répond.",
    economique:
      "La preuve et l’offre partagent le même domaine, donc la même réputation, sans dupliquer l’acquisition.",
  },
  compromis:
    "La frontière doit être maintenue par des contrôles permanents, alors qu’une interdiction absolue ne demandait aucun test.",
  consequence:
    "ROADMAP.md autorise désormais le catalogue, le panier, l’abonnement et la facture uniquement dans L13. Aucun code commercial n’est encore livré par cette décision documentaire.",
  preuves: [
    {
      kind: "fichier",
      libelle: "Doctrine du dépôt révisée",
      locator: "ROADMAP.md",
    },
  ],
  tags: ["architecture", "commerce", "preuve"],
  reconstruit: false,
  questions: [],
  revirement: null,
};

// ---------------------------------------------------------------------
// Les decisions remplacees, qui portent les revirements (C7)
//
// Un revirement n'est pas une entree separee : c'est la decision initiale,
// au statut remplace, augmentee des six champs narratifs. Elle reste en
// ligne et pointe vers celle qui la remplace. On n'efface pas une decision,
// on la date.
//
// Les couts sont mesures sur le diff (`git show --stat`) et marques comme
// estimes : le depot dit combien de lignes ont ete jetees, il ne dit pas
// combien d'heures elles avaient coute.
// ---------------------------------------------------------------------

const DEC_101: Adr = {
  adrId: "DEC-101",
  titre: "Un moteur de calcul dans le cockpit plutôt que dans le produit",
  statut: "remplace",
  date: "2026-06-24",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "moyenne",
  remplace: null,
  contexte: [
    "Le cockpit devait afficher des indicateurs de durabilité. Le calcul existait dans STRATA Scope, mais l’appeler supposait une API stable que le produit n’exposait pas encore.",
    "Écrire le calcul directement dans le cockpit permettait d’avancer sans attendre le produit.",
    "La décision paraissait provisoire, et les décisions provisoires ne sont provisoires que pour celui qui les prend.",
  ],
  options: [
    {
      option: "Écrire le moteur dans le cockpit en attendant l’API du produit",
      verdict: "retenue",
      motif:
        "Permettait d’avancer immédiatement sur l’affichage, sans dépendre du calendrier du produit.",
    },
    {
      option: "Attendre que le produit expose une API de lecture",
      verdict: "ecartee",
      motif:
        "Aurait bloqué le cockpit sur un chantier qui n’était pas prioritaire côté produit.",
    },
  ],
  decision:
    "Le cockpit embarque son propre moteur de calcul, sous services/engine : empreinte carbone, matérialité, audit express, avec ses tests.",
  raisonnement: {
    technique:
      "Un moteur local évitait de dépendre d’une API qui n’existait pas, et permettait de tester l’affichage sur des résultats réels.",
    reglementaire:
      "Aucune donnée client ne transitait, le moteur ne servait qu’à des démonstrations.",
    economique:
      "Aucun coût d’infrastructure supplémentaire à court terme, le service étant déployé à côté du site.",
  },
  compromis: "Deux implémentations du même calcul, à tenir alignées à la main.",
  consequence:
    "Le moteur a vécu du 24 juin au 13 juillet 2026. Il n’a jamais servi ailleurs que dans le cockpit, et il a divergé de STRATA Scope avant d’avoir été utilisé une seule fois en conditions réelles.",
  preuves: [
    {
      kind: "commit",
      libelle: "Suppression du moteur du cockpit",
      locator: "56d1f7c",
    },
    {
      kind: "absence",
      libelle: "Le dossier n’existe plus dans le dépôt",
      locator: "services/engine",
    },
  ],
  tags: ["revirement", "architecture", "responsabilite"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais que le cockpit devait calculer lui-même ses indicateurs, parce que le produit n’exposait pas encore d’API de lecture et que je ne voulais pas attendre.",
    invalide:
      "Le même calcul existait déjà dans STRATA Scope, qui en est le produit responsable et qui le teste. Deux implémentations du même calcul divergent toujours, et rien n’aurait dit laquelle faisait foi le jour où elles auraient donné deux chiffres.",
    fait: "Le 13 juillet 2026, j’ai supprimé le service de calcul du cockpit, au commit 56d1f7c.",
    cout: "Neuf cent une lignes de Python et de tests supprimées, réparties sur seize fichiers : le moteur d’empreinte carbone, l’analyse de matérialité, l’audit express, leurs schémas et leurs trois fichiers de tests. Le commit total retire mille cent quatre-vingt-deux lignes sur vingt-sept fichiers, en comptant la reprise du site et de la documentation.",
    coutEstime: true,
    regle: "Un calcul appartient au système qui en est responsable.",
  },
};

const DEC_102: Adr = {
  adrId: "DEC-102",
  titre: "Un repli chiffré plutôt qu’une case vide",
  statut: "remplace",
  date: "2026-07-03",
  portee: "adama-os",
  impact: "produit",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "La Couche D et la page publique des métriques devaient être présentables avant que les sources ne remontent des valeurs.",
    "Une grille de cases vides donnait l’impression d’un site cassé plutôt que d’un site honnête.",
    "Des valeurs de repli ont donc été écrites dans les composants, en attendant les vraies.",
  ],
  options: [
    {
      option: "Afficher des valeurs de repli en attendant les sources",
      verdict: "retenue",
      motif:
        "Rendait la démonstration présentable immédiatement, sans attendre que les produits exposent quoi que ce soit.",
    },
    {
      option: "Afficher l’absence dès le premier jour",
      verdict: "ecartee",
      motif: "Un tableau de bord vide au lancement paraissait invendable.",
    },
  ],
  decision:
    "Les surfaces publiques affichent des valeurs de repli quand la source ne répond pas.",
  raisonnement: {
    technique:
      "Les valeurs étaient de simples constantes dans les composants, sans dépendance ni appel réseau.",
    reglementaire:
      "Aucune donnée client n’était concernée, il s’agissait de métriques d’activité.",
    economique: "Coût nul, et un site montrable tout de suite.",
  },
  compromis:
    "Rien à l’écran ne distingue un repli d’un relevé. Le lecteur n’a aucun moyen de savoir lequel il regarde, et l’auteur non plus au bout de quelques semaines.",
  consequence:
    "Le repli a survécu à l’arrivée des vraies sources. Il annonçait des volumes que rien ne justifiait, sur deux surfaces publiques, pendant plus d’un mois, et il avait cessé d’être lu comme provisoire, y compris par son auteur.",
  preuves: [
    {
      kind: "commit",
      libelle: "Retrait des métriques de repli",
      locator: "21e483b",
    },
    {
      kind: "test",
      libelle: "Verrou qui interdit son retour",
      locator: "apps/web/tests/layer-d.test.tsx",
    },
  ],
  tags: ["revirement", "preuve", "produit"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais qu’un tableau de bord vide était invendable, et qu’une valeur de repli tiendrait la place jusqu’à l’arrivée des vraies sources.",
    invalide:
      "Les sources sont arrivées et le repli est resté. Rien à l’écran ne le distinguait d’un relevé, et j’avais moi-même cessé de le lire comme provisoire.",
    fait: "Le 12 août 2026, au commit 21e483b, j’ai retiré les valeurs de repli des deux surfaces publiques, puis j’ai écrit deux tests pour que la question ne se repose pas : l’un vérifie que la Couche D n’affiche aucun chiffre sans source, l’autre refuse tout littéral numérique de plus de deux chiffres dans un composant d’affichage de métrique.",
    cout: "Soixante-treize lignes retirées et cent réécrites sur deux fichiers, puis deux fichiers de tests à écrire pour verrouiller la règle. Le coût réel n’est pas là : il est dans le mois pendant lequel deux pages publiques ont affiché des volumes que rien ne justifiait.",
    coutEstime: true,
    regle: "La source précède l’affirmation.",
  },
};

const DEC_103: Adr = {
  adrId: "DEC-103",
  titre:
    "Un tableau de produits écrit dans la page plutôt qu’un registre en base",
  statut: "remplace",
  date: "2026-07-11",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "moyenne",
  remplace: null,
  contexte: [
    "Le hub des produits du groupe devait exister vite, et la base ne portait alors aucune table de produits.",
    "Un tableau écrit dans la page suffisait à afficher huit lignes.",
    "La même liste servait aussi à décider quels dépôts alimentaient le journal des livraisons.",
  ],
  options: [
    {
      option: "Écrire la liste dans la page",
      verdict: "retenue",
      motif: "Immédiat, sans migration, sans dépendance à la base.",
    },
    {
      option: "Créer une table de registre dès le départ",
      verdict: "ecartee",
      motif:
        "Une migration et des politiques de sécurité à écrire pour huit lignes qui bougeaient peu.",
    },
  ],
  decision: "La liste des produits du groupe est écrite dans la page du hub.",
  raisonnement: {
    technique:
      "Huit entrées statiques, lisibles d’un coup d’oeil, modifiables en une ligne.",
    reglementaire:
      "Aucune donnée personnelle, aucune contrainte de conservation.",
    economique: "Aucun coût d’infrastructure, aucun temps de migration.",
  },
  compromis:
    "Rien ne vérifie qu’une ligne décrit un produit qui existe, ni qu’un lien mène quelque part. La justesse de la liste repose entièrement sur la mémoire de celui qui l’a écrite.",
  consequence:
    "La liste est devenue fausse sur la majorité de ses lignes : des produits annoncés qui n’existaient pas, des états périmés, des liens vers des adresses fermées. Personne ne la relisait, parce que personne ne savait qu’elle existait.",
  preuves: [
    {
      kind: "commit",
      libelle: "Registre produits créé en base",
      locator: "24eb785",
    },
    {
      kind: "migration",
      libelle: "Table, contrainte et politiques",
      locator: "packages/db/migrations/0001_ecosystem_products.sql",
    },
  ],
  tags: ["revirement", "base", "registre"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais qu’une liste de huit produits ne méritait pas une table, et qu’un tableau écrit dans la page serait plus simple à tenir à jour.",
    invalide:
      "En relisant le hub le 12 août 2026, la majorité des lignes étaient fausses : des produits annoncés qui n’existaient pas, des états périmés, des liens vers des adresses fermées. Un tableau dans une page n’a pas de propriétaire.",
    fait: "J’ai créé la table du registre produits par la migration 0001, avec une contrainte qui interdit d’annoncer un produit ouvert au public sans adresse, et j’ai fait lire cette table par le hub, par la Couche D et par la liste des dépôts suivis.",
    cout: "Une migration de quatre-vingt-quatre lignes et trois cent quarante-six lignes ajoutées sur six fichiers, plus la réécriture du hub. Le tableau supprimé, lui, tenait en une centaine de lignes.",
    coutEstime: true,
    regle: "Une liste que personne ne possède devient fausse.",
  },
};

const DEC_104: Adr = {
  adrId: "DEC-104",
  titre: "Générer une réponse sans contexte plutôt qu’échouer",
  statut: "remplace",
  date: "2026-06-27",
  portee: "adama-os",
  impact: "conformite",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "L’assistant du site répond à partir de passages récupérés dans son corpus.",
    "Quand la récupération ne renvoyait rien, il restait deux comportements possibles : générer quand même, ou refuser.",
    "Refuser paraissait dur pour un assistant de portfolio, dont le rôle est d’abord de dialoguer.",
  ],
  options: [
    {
      option: "Générer une réponse prudente sans passage à l’appui",
      verdict: "retenue",
      motif:
        "L’assistant reste conversationnel même quand le corpus ne répond pas, et la formulation prudente limite le risque.",
    },
    {
      option: "Renvoyer une erreur explicite",
      verdict: "ecartee",
      motif:
        "Un assistant qui tombe en panne paraissait pire qu’un assistant approximatif.",
    },
  ],
  decision:
    "L’assistant génère une réponse même quand la récupération documentaire ne renvoie aucun passage.",
  raisonnement: {
    technique:
      "La génération est appelée avec un contexte vide, le modèle répond à partir de ses seules connaissances.",
    reglementaire:
      "La formulation était prudente et l’assistant présenté comme non contractuel.",
    economique:
      "Aucun coût direct : la génération a lieu de toute façon, avec ou sans passages récupérés.",
  },
  compromis:
    "Une réponse sans source ressemble exactement à une réponse fondée.",
  consequence:
    "L’assistant a produit des réponses fluides et plausibles sur des sujets réglementaires, sans qu’aucun passage ne les fonde, et sans que le lecteur ait le moindre moyen de le voir.",
  preuves: [
    {
      kind: "commit",
      libelle: "Échec explicite sans source",
      locator: "3d10bef",
    },
    {
      kind: "fichier",
      libelle: "Route de l’assistant",
      locator: "apps/web/app/api/chat/route.ts",
    },
  ],
  tags: ["revirement", "ia", "fiabilite"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais qu’un assistant qui refuse de répondre serait perçu comme cassé, et qu’une réponse prudente sans source valait mieux qu’un message d’erreur.",
    invalide:
      "Une réponse sans source est indiscernable d’une réponse fondée. La prudence de la formulation ne change rien pour le lecteur : elle rend même l’erreur plus crédible.",
    fait: "Le 31 août 2026, au commit 3d10bef, j’ai fait échouer la route de l’assistant quand la récupération ne renvoie rien : service indisponible, message explicite, aucun appel au modèle.",
    cout: "Soixante-six lignes reprises dans la route, et un assistant qui paraît fragile chaque fois que le corpus ne répond pas. Cette fragilité est visible sur la page publique, y compris pour un recruteur.",
    coutEstime: true,
    regle: "L’IA propose, le système décide.",
  },
};

const DEC_105: Adr = {
  adrId: "DEC-105",
  titre: "La vitrine d’un produit plutôt que le cockpit d’un ensemble",
  statut: "remplace",
  date: "2026-07-11",
  portee: "groupe",
  impact: "produit",
  reversibilite: "moyenne",
  remplace: null,
  contexte: [
    "Le site devait servir à vendre, et le produit le plus avancé du groupe était le candidat évident.",
    "Un parcours d’achat, une page de vente et une offre d’audit ont donc été construits ici.",
    "Le produit avait déjà sa propre adresse et son propre parcours d’achat.",
  ],
  options: [
    {
      option: "Faire de ce site la vitrine du produit principal",
      verdict: "retenue",
      motif: "Une surface de vente de plus, sur un domaine déjà référencé.",
    },
    {
      option: "En faire le cockpit de l’ensemble et renvoyer vers les produits",
      verdict: "ecartee",
      motif:
        "Paraissait moins commercial, et sans effet direct sur les ventes.",
    },
  ],
  decision:
    "Ce site est la vitrine du produit principal, avec ses pages de vente et son parcours d’achat.",
  raisonnement: {
    technique:
      "Le parcours d’achat et les pages produit ont été construits ici, en réutilisant les composants du site.",
    reglementaire:
      "Les mentions et conditions de vente étaient à écrire deux fois, ici et sur le produit.",
    economique:
      "Une surface de vente de plus, sur un domaine qui portait déjà le nom de l’auteur.",
  },
  compromis:
    "Deux vitrines pour un même produit, dont une nécessairement moins à jour.",
  consequence:
    "Les pages du site ont dupliqué celles du produit, en moins complet et en moins à jour. Un visiteur arrivant par le nom de l’auteur atterrissait sur la moins bonne des deux.",
  preuves: [
    {
      kind: "commit",
      libelle: "Retrait des pages produit dupliquées",
      locator: "c881705",
    },
    {
      kind: "commit",
      libelle: "Recentrage acté dans la roadmap et le blueprint",
      locator: "4116d14",
    },
    {
      kind: "fichier",
      libelle: "Redirection permanente de l’ancien hub",
      locator: "apps/web/next.config.ts",
    },
  ],
  tags: ["revirement", "produit", "positionnement"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais que le site portant mon nom devait vendre le produit le plus avancé du groupe, et j’y ai construit un parcours d’achat et des pages de vente.",
    invalide:
      "Le produit avait déjà sa vitrine et son parcours d’achat. Le site en dupliquait une partie, moins bien et moins à jour, et le visiteur arrivait sur la moins bonne des deux.",
    fait: "Le 19 juillet 2026, j’ai recentré le site sur ce qu’il est seul à pouvoir montrer : la façon dont plusieurs produits sont construits et tenus par une seule personne. Les pages dupliquées ont été retirées aux commits c881705 et 56d1f7c, l’ancienne adresse du hub redirige de façon permanente, et le recentrage a été acté dans la roadmap au commit 4116d14.",
    cout: "Un parcours d’achat, une page de vente et une offre d’audit jetés, et la perte de toute conversion directe depuis ce site : plus de tunnel, plus de prix affiché, plus d’appel à l’achat.",
    coutEstime: true,
    regle: "L’architecture suit la responsabilité.",
  },
};

const DEC_106: Adr = {
  adrId: "DEC-106",
  titre: "Un cockpit sans commerce plutôt qu’une preuve et une offre séparées",
  statut: "remplace",
  date: "2026-07-19",
  portee: "adama-os",
  impact: "architecture",
  reversibilite: "forte",
  remplace: null,
  contexte: [
    "Le recentrage du 19 juillet 2026 retirait du cockpit les pages de vente qui dupliquaient un produit existant.",
    "Pour empêcher le doublon de revenir, la doctrine avait interdit tout paiement, tout passage en caisse et tout tunnel de vente dans le dépôt.",
    "Cette interdiction protégeait la preuve, mais elle confondait la vente d’un logiciel tiers avec la vente d’un actif de connaissance propre au cockpit.",
  ],
  options: [
    {
      option: "Maintenir une interdiction totale du commerce dans le dépôt",
      verdict: "retenue",
      motif:
        "La séparation par dépôt rendait le périmètre immédiatement lisible et empêchait le retour des pages produit dupliquées.",
    },
    {
      option:
        "Isoler le commerce dans une couche sans dépendance depuis la preuve",
      verdict: "ecartee",
      motif:
        "La branche de connaissance n’existait pas encore et aucun objet propre au cockpit ne justifiait cette complexité.",
    },
  ],
  decision:
    "Le dépôt ne contient aucun paiement, aucun passage en caisse et aucun tunnel de vente.",
  raisonnement: {
    technique:
      "Une interdiction de dépôt est plus simple à contrôler qu’une frontière entre modules.",
    reglementaire:
      "Sans commerce, le cockpit ne porte ni conditions de vente, ni facture, ni traitement de paiement.",
    economique:
      "Le cockpit reste une vitrine de preuve et renvoie toute conversion aux produits responsables.",
  },
  compromis:
    "Aucun actif intellectuel propre au cockpit ne peut être vendu là où sa preuve et son audience vivent.",
  consequence:
    "La doctrine est restée cohérente jusqu’à l’ouverture, le 7 septembre 2026, d’une branche de connaissance qui vend des méthodes, des gabarits, des parcours et des avis sans livrer de logiciel.",
  preuves: [
    {
      kind: "fichier",
      libelle: "Doctrine révisée et datée",
      locator: "ROADMAP.md",
    },
    {
      kind: "route",
      libelle: "Registre public du revirement",
      locator: "/revirements",
    },
  ],
  tags: ["revirement", "commerce", "preuve", "architecture"],
  reconstruit: false,
  questions: [],
  revirement: {
    croyais:
      "Je pensais qu’interdire tout commerce dans le cockpit était la seule manière durable d’empêcher le retour d’une vitrine produit dupliquée.",
    invalide:
      "Le 7 septembre 2026, la branche de connaissance a été arrêtée avec des objets propres, vendables sans logiciel, qui doivent vivre au même endroit que leur preuve et leur audience.",
    fait: "J’ai rouvert la monétisation du domaine et réécrit la doctrine du dépôt. Le commerce est cantonné à une couche L13 isolée, sans dépendance depuis les pages de preuve.",
    cout: "Le dépôt perd la simplicité d’une interdiction absolue. Il faut maintenant tenir une frontière testable, inventorier les secrets de paiement et maintenir public tout contenu qui l’était au 7 septembre 2026.",
    coutEstime: true,
    regle: "Le commerce ne gouverne jamais la preuve.",
  },
};

// ---------------------------------------------------------------------
// Le catalogue
// ---------------------------------------------------------------------

export const ADR_CATALOGUE: readonly Adr[] = [
  DEC_001,
  DEC_002,
  DEC_003,
  DEC_004,
  DEC_005,
  DEC_006,
  DEC_007,
  DEC_008,
  DEC_009,
  DEC_010,
  DEC_011,
  DEC_101,
  DEC_102,
  DEC_103,
  DEC_104,
  DEC_105,
  DEC_106,
];

/** Recherche par identifiant. Null si l'ADR n'existe pas dans le catalogue.
 *  Sert au controle d'integrite du semis : un ADR qui en remplace un autre
 *  doit pouvoir le nommer, sinon la page afficherait un renvoi vers rien.
 *
 *  Les quatre decisions restant a arbitrer avec Adama ne sont PAS ici : les
 *  rediger reviendrait a decider a sa place. Elles vivent dans
 *  apps/web/content/decisions.ts et s'affichent sur /admin/relecture, ou
 *  elles attendent qu'il tranche. */
export function adrParId(adrId: string): Adr | null {
  return ADR_CATALOGUE.find((a) => a.adrId === adrId) ?? null;
}

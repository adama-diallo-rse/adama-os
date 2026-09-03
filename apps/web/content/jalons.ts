// =====================================================================
// C8-T8, la frise d'ingenierie.
//
// Distincte du journal de construction, et complementaire. Le journal montre
// l'ACTIVITE, jour apres jour. La frise montre la TRAJECTOIRE : une dizaine
// de decisions datees qui expliquent pourquoi le systeme a la forme qu'il a.
//
// Regle de tenue, stricte : c'est un journal d'ingenierie, pas un journal
// intime. Aucun jalon qui ne soit pas une decision technique ou une
// livraison. Chaque jalon porte sa trace dans le depot, et l'identifiant de
// la decision d'architecture correspondante quand elle existe.
//
// Les empreintes de commit citees ici ont ete relues une par une le 2
// septembre 2026 contre l'historique du depot. Le document de cadrage datait
// le retrait du repli chiffre du 7 aout : c'est faux, le commit 21e483b est
// du 12 aout. Un jalon qui se trompe de date est pire qu'un jalon absent,
// parce qu'il se verifie.
// =====================================================================

export type Jalon = {
  id: string;
  /** Date de la decision ou de la livraison, ISO 8601. */
  date: string;
  titre: string;
  /** Ce qui a change, en une phrase. */
  quoi: string;
  /** Trace verifiable dans le depot : empreinte, fichier, migration. */
  trace: string;
  /** Identifiant d'ADR, quand la decision en porte un. */
  adr: string | null;
  /** Nature du jalon, pour la lecture en un coup d'oeil. */
  nature: "decision" | "livraison" | "revirement";
};

export const JALONS: readonly Jalon[] = [
  {
    id: "rag-plutot-que-reentrainement",
    date: "2026-06-15",
    titre: "Récupération documentaire plutôt que réentraînement",
    quoi: "L’assistant cite des passages retrouvés dans un corpus au lieu d’avoir appris le contenu. Une réponse devient vérifiable, et une source manquante devient un refus.",
    trace: "apps/web/lib/ai/retrieval.ts, migration 0000_init.sql",
    adr: "DEC-001",
    nature: "decision",
  },
  {
    id: "architecture-initiale",
    date: "2026-06-24",
    titre: "Architecture initiale du dépôt",
    quoi: "Monorépo, une application web, des paquets partagés, une base unique. Les moteurs de calcul restent en dehors, dans les produits qui les portent.",
    trace: "turbo.json, pnpm-workspace.yaml, packages/",
    adr: "DEC-002",
    nature: "decision",
  },
  {
    id: "repli-chiffre-adopte",
    date: "2026-07-03",
    titre: "Un repli chiffré plutôt qu’une case vide",
    quoi: "Position initiale : quand une source ne répond pas, afficher une valeur plausible pour ne pas laisser de trou dans l’interface.",
    trace: "position remplacée le 12 août 2026",
    adr: "DEC-102",
    nature: "decision",
  },
  {
    id: "sortie-du-moteur",
    date: "2026-07-13",
    titre: "Le moteur de calcul quitte le cockpit",
    quoi: "Neuf cent une lignes de calcul ESG et de tests retirées d’un site dont ce n’est pas le métier. Le calcul appartient au produit, pas à la vitrine.",
    trace: "commit 56d1f7c, 901 lignes retirées sur 1 182",
    adr: "DEC-004",
    nature: "revirement",
  },
  {
    id: "recentrage-groupe",
    date: "2026-07-19",
    titre: "Cockpit d’un ensemble plutôt que vitrine d’un produit",
    quoi: "Le site cesse de vendre un produit et se met à lire l’ensemble du groupe. Registre de produits, divisions, sorties tracées.",
    trace: "commits c881705 et 4116d14",
    adr: "DEC-009",
    nature: "revirement",
  },
  {
    id: "retrait-repli-chiffre",
    date: "2026-08-12",
    titre: "Retrait du repli chiffré",
    quoi: "Plus aucune valeur de remplacement. Une source qui ne répond pas produit une absence qui se nomme, et un test refuse désormais tout repli.",
    trace: "commit 21e483b, verrouillé par tests/layer-d.test.tsx",
    adr: "DEC-005",
    nature: "revirement",
  },
  {
    id: "registre-en-base",
    date: "2026-08-12",
    titre: "Registre de produits en base plutôt qu’en dur",
    quoi: "La liste des produits et de leurs dépôts quitte le code pour la base. Ajouter un produit cesse d’être un déploiement.",
    trace: "commit 24eb785, table ecosystem_products",
    adr: "DEC-006",
    nature: "decision",
  },
  {
    id: "echouer-sans-source",
    date: "2026-08-31",
    titre: "Échouer explicitement plutôt que répondre sans source",
    quoi: "L’assistant refuse de produire une réponse quand la recherche documentaire ne rend rien. Soixante-six lignes, et le comportement le plus important du site.",
    trace: "commit 3d10bef, apps/web/app/api/chat/route.ts",
    adr: "DEC-007",
    nature: "decision",
  },
  {
    id: "mise-en-ligne",
    date: "2026-08-31",
    titre: "Mise en ligne, migrations jouées, écosystème connecté",
    quoi: "Domaine branché, base migrée, registre semé, passerelles de santé actives vers les produits, mentions légales écrites depuis ce que le code fait.",
    trace: "migrations 0001 et 0002, apps/web/lib/ecosystem/gateways.ts",
    adr: "DEC-008",
    nature: "livraison",
  },
  {
    id: "nommer-la-panne",
    date: "2026-08-31",
    titre:
      "Nommer la nature d’une panne plutôt que l’afficher comme une absence",
    quoi: "Une panne d’un produit et une panne de la sortie réseau de ce site cessent de se ressembler. Chaque tentative de sonde porte sa nature d’échec.",
    trace: "table ecosystem_probes, migration 0003_data_class.sql",
    adr: "DEC-010",
    nature: "decision",
  },
  {
    id: "preuve-comme-donnee",
    date: "2026-09-01",
    titre: "La provenance devient inséparable de la valeur",
    quoi: "Aucun composant n’accepte plus un nombre nu. Il accepte une affirmation qui porte sa source, sa méthode et sa date. Le registre des preuves ouvre.",
    trace: "apps/web/lib/proof/, migrations 0003 et 0004",
    adr: "DEC-005",
    nature: "livraison",
  },
  {
    id: "robustesse-visible",
    date: "2026-09-02",
    titre: "La robustesse déjà présente devient visible",
    quoi: "Matrice de santé par capacité, huit modes de panne rejouables par une commande, frontières de données explicites, dix contrôles d’intégrité calculés.",
    trace:
      "apps/web/lib/health/, scripts/failure-drill.mjs, scripts/integrity.mjs",
    adr: "DEC-010",
    nature: "livraison",
  },
] as const;

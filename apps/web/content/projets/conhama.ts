import type { FicheProjet } from "./gabarit";

// =====================================================================
// Fiche Conhama (30 octobre 2026).
//
// Sources : C:\Dev\CONHAMA, GEMINI.md (§0, ce que la plateforme est et
// pour qui), docs/DECISIONS.md (RDX-02, RDX-05, RDX-08, RDX-09, RDX-21,
// RDX-23), package.json, backend/requirements.txt et GUIDE_DEPLOIEMENT.md ;
// appel HTTP sur https://conhama.com/fr le 30 octobre 2026, code 200.
//
// Les décisions de Conhama vivent dans son propre registre (RDX), qui n'est
// pas publié : la fiche le dit au lieu de rattacher une décision ADAMA OS
// qui n'en traite pas. Le bloc 02 est une proposition à valider.
// =====================================================================

export const CONHAMA: FicheProjet = {
  slug: "conhama",
  titre: "Conhama",
  division: "Conhama",
  categorie: "Écosystème",
  resume:
    "Les acteurs de l’économie durable travaillent côte à côte sans se voir, et chacun cherche ses partenaires dans un annuaire figé.",
  roleEnUnMot: "Fondateur",
  ordre: 40,
  reluParAdama: false,
  preuveVedette: "conhama-en-ligne",
  sujetsPreuve: ["conhama"],
  adrIds: [],
  registreDecisions:
    "Les décisions de Conhama sont tenues dans son propre registre (RDX), qui n’est pas encore publié.",

  probleme: [
    "Entreprises, cabinets RSE, consultants, directions RSE, experts-comptables, chercheurs, financeurs, clusters, collectivités et ONG : les acteurs de l’économie durable travaillent les uns à côté des autres sans se voir. Celui qui cherche un partenaire, un expert ou un financement part d’un annuaire figé ou de son carnet d’adresses.",
    "Une carte qui ne se tient pas à jour devient fausse en quelques mois, et une plateforme qui favorise un type d’acteur perd la confiance de tous les autres.",
    "Conhama est la carte vivante de l’économie durable : elle cartographie l’écosystème, relie ses acteurs par des espaces de collaboration et reste neutre entre eux. Trouver, relier, prouver.",
  ],

  role: {
    niveaux: {
      architecture: "responsable",
      produit: "responsable",
      backend: "responsable",
      donnees: "responsable",
      ia: "responsable",
      frontend: "responsable",
      commercial: "responsable",
    },
    phrases: [
      "J’ai lancé Conhama seul, et je le porte au sein de la SASU Adama OS, que je détiens entièrement.",
      "Je développe la plateforme moi-même, l’interface comme le service de données, sur des créneaux qui lui sont réservés.",
      "J’ai ouvert un démonstrateur limité à l’Île-de-France et à la filière plastiques et emballages, avant toute extension.",
      "J’ai rangé le graphe des acteurs dans PostgreSQL, avec pgvector, à côté du reste des données.",
    ],
    aValider: true,
    questions: [
      "Conhama peut-il être présenté publiquement comme porté par la SASU Adama OS ?",
      "Le démonstrateur couvre-t-il toujours l’Île-de-France et la filière plastiques et emballages ?",
      "Les trois compromis du bloc 06 sont-ils formulés comme tu les arbitrerais ?",
      "Quelle affirmation de preuve publier pour Conhama : l’adresse publique seule, ou aussi le dépôt ?",
    ],
  },

  architecture: {
    schema: {
      legende: "De la fiche d’un acteur à la carte vivante",
      colonnes: [
        {
          titre: "Entrée",
          noeuds: ["Fiches d’acteurs", "Recherche sur la carte"],
        },
        {
          titre: "Données",
          noeuds: ["Service FastAPI", "Graphe PostgreSQL", "Index pgvector"],
        },
        {
          titre: "Interface",
          noeuds: ["Carte MapLibre", "Espaces de collaboration"],
        },
        {
          titre: "Sortie",
          noeuds: ["Carte publique", "Acteurs reliés"],
        },
      ],
      flux: "Les fiches d’acteurs entrent par l’interface et sont rangées par un service FastAPI dans un graphe tenu dans PostgreSQL, avec un index pgvector pour la recherche. La carte MapLibre et les espaces de collaboration lisent ce graphe, et rendent une carte publique où les acteurs se trouvent et se relient.",
    },
    stack: [
      {
        nom: "Next.js",
        role: "interface publique et espaces de collaboration",
      },
      { nom: "React", role: "composants de la carte et des fiches d’acteurs" },
      { nom: "MapLibre GL", role: "rendu de la carte de l’écosystème" },
      { nom: "FastAPI", role: "service de données et règles du graphe" },
      {
        nom: "PostgreSQL",
        role: "graphe des acteurs, avec pgvector pour la recherche",
      },
      { nom: "Supabase", role: "base hébergée à Francfort et comptes" },
    ],
    stackSource: "saisie",
  },

  compromis: [
    {
      refuse: "Aucun classement qui avantage un type d’acteur sur un autre.",
      raison:
        "La carte n’a de valeur que si chaque acteur peut s’y fier. Une plateforme qui penche vers les cabinets, les financeurs ou les éditeurs perd la confiance de ceux qu’elle désavantage.",
      cout: "Aucun moyen de favoriser un premier partenaire pour accélérer le lancement.",
    },
    {
      refuse: "Aucun code ni aucune charte repris de STRATA ESG.",
      raison:
        "Conhama relie aussi des acteurs qui ne sont pas clients de STRATA ESG. La plateforme doit être visiblement indépendante de l’éditeur de logiciel.",
      cout: "Tout est construit une seconde fois, composants et identité compris.",
    },
    {
      refuse: "Pas de lancement national d’emblée.",
      raison:
        "Une carte vivante ne vaut que si elle est complète sur son périmètre. Un territoire et une filière bien tenus valent mieux qu’un pays rempli à moitié.",
      cout: "Un acteur hors d’Île-de-France ou hors de la filière ne trouve encore rien.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "Démonstrateur public en ligne sur conhama.com, limité à l’Île-de-France et à la filière plastiques et emballages. Relevé du 30 octobre 2026.",
  },

  suite: [
    "Publier le registre des décisions de Conhama, comme le journal des décisions de ce site.",
    "Ouvrir d’autres filières une fois la première tenue de bout en bout.",
  ],
};

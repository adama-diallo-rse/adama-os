import type { FicheProjet } from "./gabarit";

// =====================================================================
// C5-T3, fiche ESG Optimizer.
//
// Ce qui est ecrit ici vient du depot et du registre produits. Le bloc 02
// est une PROPOSITION de formulation, marquee a valider, construite a partir
// de ce que le code demontre. Les questions auxquelles seul Adama peut
// repondre sont listees dans `role.questions` : elles ne sont pas comblees.
// =====================================================================

export const ESG_OPTIMIZER: FicheProjet = {
  slug: "esg-optimizer",
  titre: "ESG Optimizer",
  division: "STRATA",
  categorie: "Durabilité",
  resume:
    "Une PME reçoit un questionnaire CSRD de son donneur d’ordre et ne sait ni par où commencer, ni ce qu’elle risque d’oublier.",
  roleEnUnMot: "Fondateur",
  ordre: 10,
  reluParAdama: false,
  preuveVedette: "esg-optimizer-en-ligne",
  sujetsPreuve: ["esg-optimizer"],
  adrIds: ["DEC-001", "DEC-002", "DEC-003"],

  probleme: [
    "La directive CSRD et les standards ESRS imposent des informations de durabilité à des entreprises qui n’ont ni direction RSE, ni analyste, ni budget de conseil. Le premier réflexe est de payer un cabinet quelques milliers d’euros pour un diagnostic qui aurait pu être outillé.",
    "Le problème n’est pas de calculer : c’est de savoir ce qui est attendu, à partir de quels documents, et où se situe l’entreprise sur chacun des dix standards. Tant que cette question reste ouverte, aucun chiffre ne sert à rien.",
    "ESG Optimizer prend les documents que l’entreprise possède déjà, les confronte aux standards et rend un état des lieux structuré. Il ne remplace pas un auditeur, il rend le premier tour de piste faisable seul.",
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
      "J’ai posé l’architecture : une interface Next.js pour le parcours, un moteur Python séparé pour l’analyse, et une base Supabase pour l’état des dossiers.",
      "J’ai arbitré la question de l’IA en faveur d’une architecture de récupération documentaire plutôt que d’un modèle réentraîné, parce qu’un texte réglementaire change et qu’un modèle réentraîné ne se met pas à jour.",
      "J’ai choisi un fournisseur de modèle établi dans l’Union européenne, pour que la résidence des données ne soit pas un angle mort au moment de vendre à une PME soumise à la CSRD.",
      "J’ai mis le produit en ligne sur son propre domaine et exposé une route de santé publique, qui est ce que ce site interroge pour affirmer qu’il répond.",
    ],
    aValider: true,
    questions: [
      "Le produit a-t-il des utilisateurs autres que des tests, et si oui peut-on le dire sans nommer personne ?",
      "Le paiement est-il ouvert au public à ce jour, ou reste-t-il derrière une liste d’attente ?",
    ],
  },

  architecture: {
    schema: {
      legende: "Du document déposé au rapport structuré",
      colonnes: [
        {
          titre: "Entrée",
          noeuds: ["Documents de l’entreprise", "Parcours web"],
        },
        {
          titre: "Traitement",
          noeuds: [
            "API Python",
            "Récupération documentaire",
            "Modèle de langage UE",
          ],
        },
        { titre: "Référence", noeuds: ["Standards ESRS", "Base de données"] },
        {
          titre: "Sortie",
          noeuds: [
            "Scoring par standard",
            "Rapport structuré",
            "Route de santé publique",
          ],
        },
      ],
      flux: "Les documents déposés par l’entreprise entrent par le parcours web, sont traités par une API Python qui les confronte aux standards ESRS par récupération documentaire, puis ressortent en un scoring par standard et un rapport structuré. Une route de santé publique permet à ce site de constater que le service répond.",
    },
    stack: [
      { nom: "FastAPI", role: "moteur d’analyse et route de santé publique" },
      { nom: "Python", role: "traitement documentaire et scoring" },
      { nom: "Next.js", role: "parcours de dépôt et restitution" },
      { nom: "Supabase", role: "comptes, dossiers et état d’avancement" },
      { nom: "pgvector", role: "index des passages de standards" },
    ],
    stackSource: "saisie",
  },

  compromis: [
    {
      refuse: "Aucun calcul d’empreinte carbone dans ce produit.",
      raison:
        "Le calcul appartient à STRATA Scope, qui en est responsable et qui le teste. Le dupliquer ici aurait donné deux résultats différents pour la même entreprise, et aucun moyen de dire lequel fait foi.",
      cout: "Une entreprise qui veut les deux doit passer par deux produits.",
    },
    {
      refuse: "Pas de modèle réentraîné sur le corpus réglementaire.",
      raison:
        "Un modèle réentraîné fige la réglementation au jour de son entraînement. Les textes ESRS bougent, la récupération documentaire suit, un modèle réentraîné non.",
      cout: "Chaque réponse coûte un appel de récupération, donc du temps de réponse et de l’argent à l’usage.",
    },
    {
      refuse: "Aucune restitution qui ressemble à un avis d’auditeur.",
      raison:
        "Le produit rend un état des lieux, pas une attestation. Laisser croire l’inverse exposerait l’utilisateur et serait faux.",
      cout: "Le produit se vend moins facilement qu’un outil qui promet la conformité.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "Ouvert au public sur son domaine. Son API expose une route de santé que ce site interroge, et le résultat de cette interrogation est visible dans la page de vérification de l’affirmation correspondante.",
  },

  suite: [
    "Exposer une route publique de statistiques agrégées, pour que ce cockpit affiche autre chose qu’un état de santé.",
    "Documenter le périmètre de l’analyse standard par standard, dans le produit lui-même.",
  ],
};

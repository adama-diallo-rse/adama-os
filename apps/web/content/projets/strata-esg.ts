import type { FicheProjet } from "./gabarit";

// =====================================================================
// Fiche STRATA ESG, la maison et ses cinq produits (30 octobre 2026).
//
// Remplace les deux fiches ESG Optimizer et STRATA Scope : la maison se
// présente d'un seul tenant, et chacun de ses produits y figure avec son
// adresse publique et son état relevé le 30 octobre 2026. Les anciennes
// adresses /projets/esg-optimizer et /projets/strata-scope redirigent ici
// (next.config.ts), vers l'ancre du produit.
//
// Sources des descriptions de produits : le fichier public llms.txt du
// site STRATA ESG (relevé du 24 octobre 2026), les dépôts de STRATA
// Foundation, STRATA Watch et STRATA Academy, et un appel HTTP sur chaque
// adresse le 30 octobre 2026 (code 200 pour les cinq). Le bloc 02 reprend
// les phrases des deux fiches qu'il remplace : il reste une proposition à
// valider, avec ses questions.
// =====================================================================

export const STRATA_ESG: FicheProjet = {
  slug: "strata-esg",
  titre: "STRATA ESG",
  division: "STRATA",
  categorie: "Durabilité",
  resume:
    "Une PME reçoit des demandes de durabilité de toutes parts et n’a ni direction RSE ni moyen de prouver ce qu’elle déclare.",
  roleEnUnMot: "Fondateur",
  ordre: 10,
  reluParAdama: false,
  preuveVedette: "esg-optimizer-en-ligne",
  sujetsPreuve: [
    "esg-optimizer",
    "strata-scope",
    "strata-foundation",
    "strata-watch",
    "strata-academy",
  ],
  adrIds: ["DEC-001", "DEC-002", "DEC-003", "DEC-004"],

  produits: [
    {
      slug: "esg-optimizer",
      nom: "ESG Optimizer",
      url: "https://www.esg-optimizer.fr/",
      role: "Le cockpit",
      resume:
        "Les documents que l’entreprise possède déjà, confrontés aux standards ESRS et VSME, rendus en un état des lieux structuré.",
      etat: "production",
    },
    {
      slug: "strata-scope",
      nom: "STRATA Scope",
      url: "https://scope.esg-optimizer.fr/",
      role: "Le module carbone",
      resume:
        "L’empreinte carbone des scopes 1, 2 et 3 sur les facteurs de l’ADEME, avec la chaîne de calcul conservée de la donnée au résultat.",
      etat: "production",
    },
    {
      slug: "strata-foundation",
      nom: "STRATA Foundation",
      url: "https://foundation.esg-optimizer.fr/",
      role: "La porte d’entrée gratuite",
      resume:
        "Les premiers pas d’une PME dans la durabilité, gratuitement et sans carte bancaire : repères, comparaison, matérialité et déclaration VSME.",
      etat: "production",
    },
    {
      slug: "strata-watch",
      nom: "STRATA Watch",
      url: "https://watch.esg-optimizer.fr/",
      role: "La veille réglementaire",
      resume:
        "Les textes officiels de durabilité suivis à la source, transformés en alertes ciblées, en résumés et en calendrier daté.",
      etat: "production",
    },
    {
      slug: "strata-academy",
      nom: "STRATA Academy",
      url: "https://academy.esg-optimizer.fr/",
      role: "La formation",
      resume:
        "La formation opérationnelle au VSME pour les PME francophones, en parcours vidéo hébergés par la maison.",
      etat: "developpement",
      precision: "plateforme en ligne, premier parcours pas encore publié.",
    },
  ],

  probleme: [
    "Une PME prise dans une chaîne de valeur reçoit des demandes de durabilité de toutes parts : un questionnaire CSRD ou VSME de son donneur d’ordre, une empreinte carbone à publier, des textes qui changent chaque mois. Chaque demande arrive seule, et chacune appelle un outil ou un cabinet différent.",
    "Le problème n’est pas de calculer : c’est de savoir ce qui est attendu, à partir de quels documents, et ce qui se défend devant un tiers. Un chiffre qu’on ne peut pas reconstituer ne vaut rien devant un donneur d’ordre ou un commissaire aux comptes.",
    "STRATA ESG réunit ces réponses dans un même système, cinq produits sur un même socle. Chaque donnée y garde sa source, et aucune affirmation n’en sort sans sa preuve.",
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
      "J’ai posé l’architecture commune : des interfaces Next.js pour les parcours, des services Python séparés pour l’analyse et le calcul, et une base PostgreSQL pour l’état des dossiers.",
      "J’ai arbitré la question du moteur en faveur d’une architecture de récupération documentaire plutôt que d’un modèle réentraîné, parce qu’un texte réglementaire change et qu’un modèle réentraîné ne se met pas à jour.",
      "J’ai isolé le moteur de calcul carbone dans un service à part, sans interface et sans base, pour qu’il reste testable ligne à ligne et rejouable sur un jeu de données connu.",
      "J’ai fait le choix de garder la chaîne source, donnée, période, facteur, calcul, résultat, plutôt que de ne stocker que le résultat : c’est ce qui rend le chiffre défendable.",
      "J’ai mis chaque produit en ligne sur son propre domaine, avec une route de santé publique que ce site interroge pour affirmer qu’il répond.",
    ],
    aValider: true,
    questions: [
      "Les cinq produits peuvent-ils être présentés dans une même fiche, avec ton rôle de fondateur sur chacun ?",
      "STRATA Academy peut-elle être dite en ligne, alors que le site de STRATA ESG la range encore parmi ce qui arrive ?",
      "Quelle version de la Base Empreinte est effectivement chargée dans STRATA Scope aujourd’hui ?",
      "Les produits ont-ils des utilisateurs autres que des tests, et peut-on le dire sans nommer personne ?",
    ],
  },

  architecture: {
    schema: {
      legende: "Cinq produits sur un même socle",
      colonnes: [
        {
          titre: "Entrée",
          noeuds: [
            "Documents de l’entreprise",
            "Données d’activité",
            "Textes officiels",
          ],
        },
        {
          titre: "Produits",
          noeuds: [
            "ESG Optimizer",
            "STRATA Scope",
            "STRATA Watch",
            "STRATA Foundation",
            "STRATA Academy",
          ],
        },
        {
          titre: "Socle",
          noeuds: ["Services Python", "Base PostgreSQL", "Index de passages"],
        },
        {
          titre: "Sortie",
          noeuds: [
            "État des lieux par standard",
            "Empreinte par scope",
            "Alertes datées",
            "Routes de santé publiques",
          ],
        },
      ],
      flux: "Les documents de l’entreprise, ses données d’activité et les textes officiels entrent par l’un des cinq produits. Chacun s’appuie sur des services Python, une base PostgreSQL et un index de passages réglementaires, et rend sa sortie propre : un état des lieux par standard, une empreinte par scope, des alertes datées. Chaque produit expose une route de santé publique que ce site interroge.",
    },
    stack: [
      {
        nom: "FastAPI",
        role: "services d’analyse et de calcul, routes de santé publiques",
      },
      {
        nom: "Python",
        role: "traitement documentaire, scoring et moteur d’émissions",
      },
      {
        nom: "Next.js",
        role: "parcours de dépôt, de saisie et de restitution",
      },
      {
        nom: "PostgreSQL",
        role: "dossiers, organisations, périodes et résultats conservés",
      },
      { nom: "pgvector", role: "index des passages de standards et de textes" },
      {
        nom: "Celery et Redis",
        role: "collecte de la veille et tâches de fond",
      },
    ],
    stackSource: "saisie",
  },

  compromis: [
    {
      refuse: "Aucun calcul d’empreinte carbone en dehors de STRATA Scope.",
      raison:
        "Le calcul appartient au produit qui en répond et qui le teste. Le dupliquer ailleurs aurait donné deux résultats différents pour la même entreprise, et aucun moyen de dire lequel fait foi.",
      cout: "Une entreprise qui veut l’état des lieux et l’empreinte passe par deux produits.",
    },
    {
      refuse: "Aucune estimation quand une donnée d’activité manque.",
      raison:
        "Un chiffre estimé se comporte exactement comme un chiffre mesuré dans un tableau. Personne, six mois plus tard, ne se souvient lequel était lequel.",
      cout: "Des périmètres incomplets, visibles comme tels, là où un concurrent affiche un total plein.",
    },
    {
      refuse: "Aucune restitution qui ressemble à un avis d’auditeur.",
      raison:
        "Les produits rendent un état des lieux et une méthode, pas une attestation. Laisser croire l’inverse exposerait l’utilisateur et serait faux.",
      cout: "Les produits se vendent moins facilement qu’un outil qui promet la conformité.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "Quatre produits répondent en production sur leur domaine : ESG Optimizer, STRATA Scope, STRATA Foundation et STRATA Watch. STRATA Academy est en ligne, son premier parcours n’est pas encore publié. Relevé du 30 octobre 2026.",
  },

  suite: [
    "Exposer une route publique de statistiques agrégées par produit, sans donnée client.",
    "Publier la version de la Base Empreinte chargée, dans STRATA Scope et dans ce cockpit.",
  ],
};

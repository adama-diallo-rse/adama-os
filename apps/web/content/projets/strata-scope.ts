import type { FicheProjet } from "./gabarit";

// =====================================================================
// C5-T3, fiche STRATA Scope.
//
// Vocabulaire tenu : empreinte carbone ou bilan GES, jamais « bilan
// carbone » en nom commun. Les facteurs cites sont ceux de la Base Empreinte
// de l'ADEME, sans numero de version : le depot ne demontre pas quelle
// version est chargee, et l'inventer serait exactement ce que ce site
// refuse.
// =====================================================================

export const STRATA_SCOPE: FicheProjet = {
  slug: "strata-scope",
  titre: "STRATA Scope",
  division: "STRATA",
  categorie: "Durabilité",
  resume:
    "Une PME doit publier son empreinte carbone, mais chaque prestataire lui rend un chiffre différent sans montrer d’où il vient.",
  roleEnUnMot: "Fondateur",
  ordre: 20,
  reluParAdama: false,
  preuveVedette: "strata-scope-en-ligne",
  sujetsPreuve: ["strata-scope"],
  adrIds: ["DEC-002", "DEC-004"],

  probleme: [
    "Un bilan GES se conteste rarement sur son résultat et presque toujours sur sa méthode : quel facteur d’émission, pour quelle période, appliqué à quelle donnée d’activité. Quand ces trois éléments ne sont pas restituables, le chiffre ne vaut rien devant un donneur d’ordre ou un commissaire aux comptes.",
    "La plupart des outils rendent un nombre et gardent la chaîne de calcul pour eux. L’entreprise se retrouve à défendre un résultat qu’elle ne peut pas reconstituer.",
    "STRATA Scope calcule les scopes 1, 2 et 3 sur les facteurs officiels de la Base Empreinte de l’ADEME, et conserve la chaîne qui mène de la donnée d’activité au résultat.",
  ],

  role: {
    niveaux: {
      architecture: "responsable",
      produit: "responsable",
      backend: "responsable",
      donnees: "responsable",
      ia: "contributeur",
      frontend: "responsable",
      commercial: "responsable",
    },
    phrases: [
      "J’ai isolé le moteur de calcul dans un service Python à part, sans interface et sans base, pour qu’il reste testable ligne à ligne et rejouable sur un jeu de données connu.",
      "J’ai fait le choix de garder la chaîne source, donnée, période, facteur, calcul, résultat, plutôt que de ne stocker que le résultat : c’est ce qui rend le chiffre défendable.",
      "J’ai mis le service en ligne sur son propre sous-domaine, avec une route de santé publique qui est la seule surface que ce cockpit s’autorise à interroger.",
      "J’ai refusé que le cockpit recalcule quoi que ce soit de son côté, et j’ai supprimé le moteur que j’y avais commencé.",
    ],
    aValider: true,
    questions: [
      "Quelle version de la Base Empreinte est effectivement chargée dans le produit aujourd’hui ?",
      "Le périmètre couvert va-t-il jusqu’aux quinze catégories du scope 3, ou à un sous-ensemble ?",
      "Le mot « certifiable » employé dans la documentation interne recouvre-t-il un référentiel précis, ou faut-il le retirer ?",
    ],
  },

  architecture: {
    schema: {
      legende: "De la donnée d’activité au résultat défendable",
      colonnes: [
        { titre: "Entrée", noeuds: ["Données d’activité", "Période déclarée"] },
        {
          titre: "Référence",
          noeuds: ["Facteurs Base Empreinte", "Règles par scope"],
        },
        {
          titre: "Moteur",
          noeuds: ["Service de calcul isolé", "Tests rejouables"],
        },
        {
          titre: "Sortie",
          noeuds: [
            "Résultat par scope",
            "Chaîne de calcul conservée",
            "Route de santé publique",
          ],
        },
      ],
      flux: "Les données d’activité et la période déclarée entrent dans un service de calcul isolé, qui applique les facteurs de la Base Empreinte et les règles propres à chaque scope. Il ressort un résultat par scope accompagné de la chaîne de calcul qui y mène. Une route de santé publique permet à ce site de constater que le service répond.",
    },
    stack: [
      { nom: "FastAPI", role: "service de calcul et route de santé publique" },
      { nom: "Python", role: "moteur d’émissions, sans effet de bord" },
      { nom: "Next.js", role: "interface de saisie et de restitution" },
      {
        nom: "Supabase",
        role: "organisations, périodes et résultats conservés",
      },
    ],
    stackSource: "saisie",
  },

  compromis: [
    {
      refuse: "Aucune estimation quand une donnée d’activité manque.",
      raison:
        "Un chiffre estimé se comporte exactement comme un chiffre mesuré dans un tableau. Personne, six mois plus tard, ne se souvient lequel était lequel.",
      cout: "Des périmètres incomplets, visibles comme tels, là où un concurrent affiche un total plein.",
    },
    {
      refuse: "Pas d’écriture depuis le cockpit vers ce produit.",
      raison:
        "Ce site lit un état de santé et rien d’autre. Une passerelle qui écrit devient une porte, et une porte se garde.",
      cout: "Le cockpit ne peut afficher aucune statistique d’usage tant que le produit n’expose pas une route de lecture dédiée.",
    },
    {
      refuse: "Aucun stockage du résultat sans sa chaîne de calcul.",
      raison:
        "Un résultat sans sa chaîne est un nombre qu’on ne peut plus défendre. Le conserver seul reviendrait à produire la dette qu’on prétend éviter.",
      cout: "Plus de données stockées, un modèle plus lourd et des migrations plus délicates.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "Ouvert au public sur son sous-domaine, avec une route de santé interrogée par ce site. Le périmètre fonctionnel exact reste à confirmer par Adama, il n’est donc pas affirmé ici.",
  },

  suite: [
    "Exposer une route publique de statistiques agrégées, sans donnée client.",
    "Publier la version de la Base Empreinte chargée, dans le produit et dans ce cockpit.",
  ],
};

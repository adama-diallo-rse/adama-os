import type { FicheProjet } from "./gabarit";

// =====================================================================
// Fiche Pharivo, ajoutee le 23 octobre 2026.
//
// Pharivo est la seconde maison nommee publiquement depuis le
// positionnement arrete le 22 octobre 2026 : un produit en ligne, en
// production depuis le 6 octobre 2026, et un site public depuis le
// 17 octobre 2026. Elle passe donc la regle d'apparition.
//
// Sources de cette fiche, et seulement elles : le hub Notion PHARIVO
// (decisions D1 a D7, pages 04, 06, 17 et 21), le site public pharivo.com
// et le dossier d'accompagnement des officines. Le depot Pharivo/pharivo est
// prive et n'est pas sur le poste qui a redige ces lignes : la pile listee
// ici est donc saisie, pas derivee d'un inventaire, et le bloc 02 reste une
// proposition tant qu'Adama ne l'a pas relu.
//
// Ce que la fiche refuse d'affirmer : un client payant, un nombre
// d'officines equipees, une donnee de patient. Le programme pilote cherche
// ses trois premieres officines, et la fiche le dit.
// =====================================================================

export const PHARIVO: FicheProjet = {
  slug: "pharivo",
  titre: "Pharivo",
  division: "Pharivo",
  categorie: "Santé",
  resume:
    "Une officine sénégalaise suit des milliers de lots au cahier ou au tableur, et découvre ses ruptures et ses péremptions quand elles ont déjà coûté.",
  roleEnUnMot: "Co-fondateur",
  ordre: 15,
  reluParAdama: false,
  preuveVedette: "pharivo-en-ligne",
  sujetsPreuve: ["pharivo"],
  adrIds: ["DEC-012", "DEC-013", "DEC-014"],

  probleme: [
    "Une officine gère des milliers de produits, chacun en plusieurs lots, chacun avec sa date de péremption. Au cahier, au tableur ou dans un logiciel conçu pour un autre marché, la perte se voit trop tard : une vente manquée faute de stock, une boîte périmée retrouvée au fond d’un tiroir, deux saisies qui ne disent plus la même chose.",
    "Au Sénégal, les prix d’une grande partie des médicaments sont administrés par l’État, les paiements passent par Wave et Orange Money, et le réseau coupe. Un logiciel générique ne contrôle pas le prix d’une vente, ne connaît pas le référentiel national et s’arrête quand la connexion tombe.",
    "Pharivo commence au comptoir, là où le stock change. Ventes, réceptions et comptages entrent dans un même journal, d’où se calculent le stock par lot, les péremptions, les alertes et les rapports, même sans réseau.",
  ],

  role: {
    niveaux: {
      architecture: "responsable",
      produit: "responsable",
      backend: "responsable",
      donnees: "responsable",
      ia: "contributeur",
      frontend: "responsable",
      commercial: "contributeur",
    },
    phrases: [
      "J’ai posé le stock comme un journal de mouvements plutôt qu’un compteur, pour que deux postes synchronisés après une coupure ne se contredisent jamais.",
      "J’ai refusé une version stock seul : le comptoir est dans la première version, parce qu’un stock que les ventes ne décomptent pas diverge en quelques jours.",
      "J’ai construit le contrôle des prix administrés sur le référentiel national, et j’ai gardé les registres de patients fermés par un drapeau tant que l’avis juridique n’est pas rendu.",
      "J’ai mené la mise en production de l’application et du site public, puis le parcours d’accompagnement des officines pilotes, de la convention au bilan de fin de pilote.",
      "Je construis le produit avec un associé qui apporte l’accès au terrain et au réseau des officines, et je porte le code, l’architecture et la mise en ligne.",
    ],
    aValider: true,
    questions: [
      "Le niveau « contributeur » sur le commercial reflète-t-il bien le partage avec l’associé, ou faut-il passer à « responsable » ?",
      "L’associé peut-il être nommé sur cette fiche publique, et sous quelle forme ?",
      "Les chiffres du référentiel affichés par le site public peuvent-ils être repris ici, avec leur date de mise à jour ?",
    ],
  },

  architecture: {
    schema: {
      legende: "Du geste au comptoir au chiffre recalculable",
      colonnes: [
        {
          titre: "Comptoir",
          noeuds: ["Vente au clavier ou à la douchette", "Réception par lot"],
        },
        {
          titre: "Journal",
          noeuds: [
            "Mouvements immuables",
            "File de synchronisation hors ligne",
          ],
        },
        {
          titre: "Référence",
          noeuds: ["Référentiel national", "Prix administrés"],
        },
        {
          titre: "Restitution",
          noeuds: [
            "Stock et péremptions par lot",
            "Alertes du jour",
            "Rapport mensuel",
          ],
        },
      ],
      flux: "Chaque vente, réception ou comptage saisi au comptoir devient un mouvement immuable, conservé sur le poste quand le réseau manque puis synchronisé à son retour. Le journal est confronté au référentiel national et aux prix administrés, ce qui permet de contrôler le prix de chaque vente. Du journal se calculent le stock et les péremptions par lot, les alertes de la journée et le rapport mensuel, chacun recalculable depuis ses mouvements.",
    },
    stack: [
      {
        nom: "Next.js",
        role: "application d’officine et site public, deux projets séparés",
      },
      {
        nom: "TypeScript",
        role: "un seul langage du schéma de données à l’interface",
      },
      {
        nom: "PostgreSQL",
        role: "journal de mouvements, lots et référentiel, isolés par officine",
      },
      {
        nom: "Prisma",
        role: "schéma multi officines et migrations versionnées",
      },
      {
        nom: "Tailwind CSS",
        role: "charte propre au produit, pensée pour un écran de comptoir",
      },
      {
        nom: "Vercel",
        role: "mise en production de l’application et du site public",
      },
    ],
    stackSource: "saisie",
  },

  compromis: [
    {
      refuse: "Aucune version stock seul, sans comptoir.",
      raison:
        "Un stock que les ventes ne décomptent pas automatiquement diverge en quelques jours, et l’officine revient à son cahier avant d’avoir mesuré quoi que ce soit.",
      cout: "Une première version plus longue à construire, et une interface de comptoir qui doit tenir sur un poste d’entrée de gamme.",
    },
    {
      refuse:
        "Aucun conseil thérapeutique ni donnée de patient ouverte avant l’avis juridique.",
      raison:
        "Le produit gère un stock et un prix, pas un traitement. Ouvrir des registres nominatifs sans cadre écrit ferait porter le risque à l’officine cliente.",
      cout: "L’ordonnancier et le registre des stupéfiants sont construits, mais restent fermés, alors que certaines officines les attendent.",
    },
    {
      refuse: "Aucune commission sur les ventes de l’officine.",
      raison:
        "Un éditeur payé sur le chiffre de son client a intérêt à ce que le client vende plus, pas à ce que son stock soit juste.",
      cout: "Un revenu limité à l’abonnement, sans part sur l’activité des officines qui grandissent.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "L’application d’officine est en production et le site public est en ligne. Le programme pilote cherche ses trois premières officines : aucune officine cliente n’est revendiquée ici.",
  },

  suite: [
    "Installer et accompagner les trois premières officines pilotes.",
    "Ouvrir les registres légaux une fois l’avis juridique rendu.",
    "Exposer une route publique de santé que ce cockpit pourra interroger.",
  ],
};

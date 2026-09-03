// =====================================================================
// C8-T1, les chantiers.
//
// LA regle de la couche, et elle n'admet aucune exception : une ligne
// lisible du journal n'est JAMAIS generee librement par un modele. Elle est
// derivee de commits reels, elle nomme le depot et la periode, et elle pointe
// vers les commits qui la fondent.
//
// Deux modes de derivation sont acceptables, et deux seulement :
//   1. la regle deterministe. Le prefixe conventionnel d'un commit donne son
//      libelle, sans aucun modele implique. C'est apps/web/lib/chantiers.ts
//      qui l'applique ;
//   2. le resume relu. Un regroupement de commits recoit un titre ecrit par
//      Adama, et ce titre vit dans ce fichier, versionne et relu.
//
// Ce qui est interdit : un modele qui resume un commit et publie son resume
// sans relecture. Ce serait exactement la fabrication que le site refuse
// partout ailleurs, et elle serait invisible.
//
// Consequence assumee : ce fichier ne couvre que le depot du cockpit, seul
// depot dont l'historique a ete relu commit par commit. Un commit d'un autre
// depot n'est pas cache pour autant, il s'affiche en mode brut. Ecrire ici
// des titres de chantiers pour des depots dont l'historique n'a pas ete relu
// serait une invention, meme bien intentionnee.
// =====================================================================

export type Chantier = {
  id: string;
  /** Titre humain, ecrit et relu par Adama. Jamais genere. */
  titre: string;
  /** Ce que le chantier a change, en une phrase. */
  resume: string;
  /** Depots concernes, en "owner/repo". */
  depots: readonly string[];
  /** Debut de la fenetre, ISO 8601, inclus. */
  du: string;
  /** Fin de la fenetre, ISO 8601, inclus. Null : chantier encore ouvert. */
  au: string | null;
  /** Identifiants d'ADR lies, tels qu'ils existent dans le journal. */
  adr: readonly string[];
  /** Slug de fiche projet liee, quand il y en a une. */
  projet: string | null;
};

/**
 * Les chantiers, du plus recent au plus ancien.
 *
 * Les fenetres ne se recouvrent pas, et tests/journal.test.ts le verrouille.
 * Le rattachement d'un commit prend le chantier dont la fenetre contient sa
 * date et dont la liste de depots contient le sien : sans cette regle, un
 * commit pourrait appartenir a deux chantiers, et le compte affiche serait
 * faux.
 *
 * Consequence assumee du 2 septembre 2026 : deux vagues de consolidation ont
 * ete livrees le meme jour. Elles ne peuvent donc pas etre separees par une
 * fenetre de dates, et les separer en decalant une date d'un jour aurait ete
 * une falsification pour la commodite d'un affichage. Elles forment un seul
 * chantier, et la frise d'ingenierie garde le detail de chaque decision.
 */
export const CHANTIERS: readonly Chantier[] = [
  {
    id: "consolidation-septembre",
    titre:
      "Vendre une capacité, montrer comment je décide, et rendre la robustesse visible",
    resume:
      "Deux vagues livrées le même jour. La première refond l’accroche autour d’une capacité, ouvre les fiches projet, le journal d’architecture et les revirements. La seconde rend visible la robustesse déjà présente : santé par capacité, modes de panne rejouables, carte de l’écosystème, inspection technique, frontières de données et contrôles d’intégrité.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-09-02",
    au: null,
    adr: ["DEC-009", "DEC-010", "DEC-008"],
    projet: "adama-os",
  },
  {
    id: "verite-et-preuve",
    titre: "Faire porter à chaque valeur sa provenance",
    resume:
      "Inventaire machine du dépôt, classe de donnée inséparable de la valeur, registre des affirmations et page de vérification par affirmation, document lisible par un programme.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-09-01",
    au: "2026-09-01",
    adr: ["DEC-005", "DEC-010"],
    projet: "adama-os",
  },
  {
    id: "mise-en-ligne",
    titre: "Mise en ligne sur le domaine, et branchement de l’écosystème",
    resume:
      "Migrations jouées en base, registre produits semé, domaine branché, passerelles de santé vers les produits, mentions légales écrites depuis ce que le code fait.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-08-25",
    au: "2026-08-31",
    adr: ["DEC-007", "DEC-008", "DEC-010"],
    projet: "adama-os",
  },
  {
    id: "retrait-repli-chiffre",
    titre: "Retrait du repli chiffré",
    resume:
      "Suppression de toute valeur de remplacement affichée quand une source ne répond pas. Une case vide qui dit pourquoi remplace un chiffre plausible.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-08-12",
    au: "2026-08-24",
    adr: ["DEC-005", "DEC-006"],
    projet: "adama-os",
  },
  {
    id: "recentrage-groupe",
    titre: "Recentrage du cockpit sur l’ensemble du groupe",
    resume:
      "Le site cesse d’être la vitrine d’un produit pour devenir le cockpit d’un ensemble : registre produits, divisions, sorties tracées vers les produits.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-07-19",
    au: "2026-08-11",
    adr: ["DEC-009"],
    projet: "adama-os",
  },
  {
    id: "sortie-du-moteur",
    titre: "Sortie du moteur de calcul hors du cockpit",
    resume:
      "Le moteur ESG quitte le cockpit pour le produit qui le porte. Neuf cents lignes de calcul et de tests retirées d’un site dont ce n’est pas le métier.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-07-13",
    au: "2026-07-18",
    adr: ["DEC-004", "DEC-002"],
    projet: "adama-os",
  },
  {
    id: "socle-initial",
    titre: "Socle initial du cockpit",
    resume:
      "Architecture du dépôt, base de données, recherche documentaire, premières couches d’interface.",
    depots: ["adama-diallo-rse/adama-os"],
    du: "2026-06-15",
    au: "2026-07-12",
    adr: ["DEC-001", "DEC-002", "DEC-003"],
    projet: "adama-os",
  },
] as const;

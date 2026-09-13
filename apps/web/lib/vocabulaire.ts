// =====================================================================
// ADEC-19 et XDEC-05, le vocabulaire ferme, en controle executable.
//
// La liste des mots interdits existait en prose dans la charte et dans le
// registre XDEC, et nulle part en code : c'etait la loi la plus citee du
// programme et la seule sans mecanisme de verification (constat de XINV-15).
// Ce module la rend executable pour tout texte qui part vers un lecteur, et
// d'abord pour la lettre SIGNAL.
//
// Trois niveaux :
//   - interdit : bloque. Les douze mots d'ADEC-19, leurs equivalents dans
//     les langues du catalogue, le mot certificat hors de ses trois formes
//     non couvertes, les tirets longs, la promesse de resultat datee ;
//   - relire : ne bloque pas, mais doit etre vu. Les cinq mots relus au cas
//     par cas, les superlatifs, le mot formation employe seul, les montants ;
//   - date : bloque seulement quand le texte doit rester sans date ni delai,
//     ce qui est le cas du message de bienvenue et de la note trimestrielle.
//
// ADEC-19 n'autorise rien, elle interdit seulement. Un texte sans constat
// n'est donc pas un texte valide, c'est un texte qui ne viole pas ce que ce
// module sait reconnaitre. La relecture humaine reste obligatoire.
// =====================================================================

type Niveau = "interdit" | "relire" | "date";

export type Constat = {
  niveau: Niveau;
  /** Le passage trouve, tel qu'il est ecrit. */
  terme: string;
  /** La regle, en une phrase lisible par la personne qui corrige. */
  regle: string;
};

type Regle = { niveau: Niveau; motif: RegExp; regle: string };

// Le texte est compare sans accents ni majuscules. Les motifs sont donc
// ecrits en ASCII minuscule.
const LETTRE = "a-z0-9";
const debut = `(?<![${LETTRE}])`;
const fin = `(?![${LETTRE}])`;
const mot = (corps: string) => new RegExp(`${debut}(?:${corps})${fin}`, "g");

const REGLES: readonly Regle[] = [
  // --- ADEC-19, douze mots, dans toutes les langues ---------------------
  {
    niveau: "interdit",
    motif: mot(
      "certif(?:ication|ications|iant|iante|iants|iantes|ie|iee|ies|iees|ier|y|ied|ies)",
    ),
    regle:
      "ADEC-19 : la famille de certification est fermée, dans toutes les langues.",
  },
  {
    niveau: "interdit",
    motif: mot(
      "zertifi[a-z]*|certificad[a-z]*|certifica[cç]ao|certificaz[a-z]*",
    ),
    regle: "ADEC-19 : équivalent étranger de certification.",
  },
  {
    niveau: "interdit",
    motif: mot("qualiopi"),
    regle: "ADEC-19 : Qualiopi est fermé.",
  },
  {
    niveau: "interdit",
    motif: mot("opco"),
    regle: "ADEC-19 : OPCO est fermé.",
  },
  {
    niveau: "interdit",
    motif: mot("rncp"),
    regle: "ADEC-19 : RNCP est fermé.",
  },
  {
    niveau: "interdit",
    motif: mot("diplom[a-z]*"),
    regle: "ADEC-19 : diplôme est fermé, avec ses dérivés et ses équivalents.",
  },
  {
    niveau: "interdit",
    motif: mot("titres? professionnels?"),
    regle: "ADEC-19 : titre professionnel est fermé.",
  },
  {
    niveau: "interdit",
    motif: mot("accredit[a-z]*|akkredit[a-z]*|acredit[a-z]*"),
    regle: "ADEC-19 : accréditation est fermée, avec ses équivalents.",
  },
  {
    niveau: "interdit",
    motif: mot("eligib[a-z]*|elegib[a-z]*"),
    regle: "ADEC-19 : éligible est fermé, avec ses dérivés.",
  },
  {
    niveau: "interdit",
    motif: mot("officiel[a-z]*|official[a-z]*|offiziell[a-z]*|oficial[a-z]*"),
    regle: "ADEC-19 : officiel est fermé, dans toutes les langues.",
  },
  {
    niveau: "interdit",
    motif: mot("certificat(?:e|es|s)?"),
    regle:
      "ADEC-19 : certificat n’est admis que sous trois formes, certificat de réalisation, certificat de fin de parcours vérifiable en ligne, certificat délivré.",
  },
  // --- Interdits propres a la branche -----------------------------------
  {
    niveau: "interdit",
    motif: /[–—]/g,
    regle: "Règle de rédaction : aucun tiret long.",
  },
  {
    niveau: "interdit",
    motif: mot("devenez|devenir [a-z]+ en \\d+"),
    regle: "Interdit de branche : promesse de résultat.",
  },
  {
    niveau: "interdit",
    motif: mot("en \\d+ (?:jours?|semaines?|mois)"),
    regle: "Interdit de branche : promesse de résultat datée.",
  },
  // --- Relus au cas par cas ---------------------------------------------
  {
    niveau: "relire",
    motif: mot("garanti[a-z]*"),
    regle: "ADEC-19, à relire : garanti engage un résultat.",
  },
  {
    niveau: "relire",
    motif: mot("conformes?"),
    regle: "ADEC-19, à relire : conforme suppose un référentiel nommé.",
  },
  {
    niveau: "relire",
    motif: mot("experts?|expertes?"),
    regle: "ADEC-19, à relire : expert se prouve, il ne se déclare pas.",
  },
  {
    niveau: "relire",
    motif: mot("reconnue? par l.etat"),
    regle: "ADEC-19, à relire : reconnu par l’État.",
  },
  {
    niveau: "relire",
    motif: mot("financement de la formation"),
    regle: "ADEC-19, à relire : financement de la formation.",
  },
  {
    niveau: "relire",
    motif: mot("(?:le|la|les) (?:seule?s?|premiere?s?|meilleure?s?)"),
    regle: "Interdit de branche : un superlatif invalidable ne s’écrit pas.",
  },
  {
    niveau: "relire",
    motif: mot("formations?"),
    regle:
      "Interdit de branche : formation seul, dans une vente à une entreprise, déclenche un régime non choisi.",
  },
  {
    niveau: "relire",
    motif: /\d[\d\s.,]*\s?(?:€|euros?|k€)/g,
    regle: "Interdit de branche : aucun montant de revenu personnel.",
  },
  // --- Dates et delais ----------------------------------------------------
  {
    niveau: "date",
    motif: /(?<!\d)(?:19|20)\d{2}(?!\d)/g,
    regle: "Sans date : aucune année.",
  },
  {
    niveau: "date",
    motif: mot(
      "janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche",
    ),
    regle: "Sans date : aucun mois ni jour de la semaine.",
  },
  {
    niveau: "date",
    motif: /(?<!\d)\d{1,2}\s?\/\s?\d{1,2}(?!\d)/g,
    regle: "Sans date : aucune date chiffrée.",
  },
  {
    niveau: "date",
    motif: mot(
      "(?:dans|d.ici|sous|avant|apres|d.ici a) (?:\\d+|un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|quelques) (?:jours?|semaines?|mois|ans?|annees?|trimestres?)",
    ),
    regle: "Sans délai : aucune échéance relative.",
  },
  {
    niveau: "date",
    motif: mot(
      "bientot|prochainement|tres vite|sous peu|(?:la semaine|le mois|le trimestre|l.an|l.annee) prochaine?",
    ),
    regle: "Sans délai : aucune promesse de proximité.",
  },
];

/** Les trois formes du mot certificat que l'interdiction ne couvre pas. */
const FORMES_CERTIFICAT = [
  "certificat de realisation",
  "certificat de fin de parcours verifiable en ligne",
  "certificat delivre",
];

/** Minuscules, sans accents, apostrophes typographiques ramenees a l'ASCII. */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .toLowerCase();
}

export function controlerTexte(
  texte: string,
  options: { sansDate?: boolean } = {},
): Constat[] {
  // La normalisation garde la longueur caractere par caractere pour les
  // lettres latines courantes : un accent retire par NFD est un caractere
  // combinant, supprime ensuite. On travaille donc sur le texte normalise et
  // on cite le passage normalise, ce qui reste lisible pour corriger.
  const propre = normaliser(texte);
  const constats: Constat[] = [];

  for (const regle of REGLES) {
    if (regle.niveau === "date" && !options.sansDate) {
      continue;
    }
    regle.motif.lastIndex = 0;
    for (const trouve of propre.matchAll(regle.motif)) {
      const terme = trouve[0];
      if (regle.regle.startsWith("ADEC-19 : certificat")) {
        const suite = propre.slice(trouve.index ?? 0);
        if (FORMES_CERTIFICAT.some((forme) => suite.startsWith(forme))) {
          continue;
        }
      }
      constats.push({ niveau: regle.niveau, terme, regle: regle.regle });
    }
  }
  return constats;
}

/** Vrai si le texte ne porte aucun constat bloquant pour son usage. */
export function texteAdmis(
  texte: string,
  options: { sansDate?: boolean } = {},
): boolean {
  return controlerTexte(texte, options).every((c) => c.niveau === "relire");
}

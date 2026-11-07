// =====================================================================
// EH4, l'edition SIGNAL : sa forme, son controle, sa lecture.
//
// Module pur, lu par le serveur et par la console dans le navigateur : la
// console montre pendant la frappe exactement ce que le serveur refusera.
//
// Une edition, c'est un numero a vie, cinq blocs dans un ordre fixe, deux
// langues et une source primaire par langue. Le controle d'une edition :
//   - les longueurs, les memes que la contrainte SQL de 0003_editions ;
//   - aucun mot ferme du vocabulaire d'ADAMA OS (lib/vocabulaire.ts) ;
//   - aucune mention d'intelligence artificielle, regle des surfaces
//     publiques, doublee en base par lettre_editions_sans_ia ;
//   - aucun tiret long ;
//   - une source https par langue.
// Une edition est datee par nature : un Signal est un fait date. Le
// controle des dates de la note trimestrielle ne s'applique donc pas ici.
// =====================================================================

import { controlerTexte, type Constat } from "../vocabulaire";

export type Langue = "fr" | "en";

export const CLES_BLOCS = [
  "signal",
  "systeme",
  "decision",
  "construction",
  "idee",
] as const;

type CleBloc = (typeof CLES_BLOCS)[number];

/** Le contenu d'une langue : un titre, cinq blocs, une source. */
export type VersionEdition = {
  titre: string;
  source: string;
} & Record<CleBloc, string>;

export type ContenuEdition = {
  numero: number;
  fr: VersionEdition;
  en: VersionEdition;
};

/** Les cinq blocs, dans l'ordre ou l'abonne les lit, avec leurs consignes. */
export const BLOCS_EDITION: readonly {
  cle: CleBloc;
  code: string;
  fr: string;
  en: string;
  consigne: string;
}[] = [
  {
    cle: "signal",
    code: "01",
    fr: "Signal",
    en: "Signal",
    consigne:
      "Un fait extérieur daté, tiré d’une source primaire : un texte, une publication, une sortie technique.",
  },
  {
    cle: "systeme",
    code: "02",
    fr: "Système",
    en: "System",
    consigne:
      "Ce que ce fait change dans la conception d’un système de donnée.",
  },
  {
    cle: "decision",
    code: "03",
    fr: "Décision",
    en: "Decision",
    consigne: "Comment la question est tranchée ici, et ce qui est écarté.",
  },
  {
    cle: "construction",
    code: "04",
    fr: "Construction",
    en: "Build",
    consigne:
      "Ce qui a réellement été construit, avec le lien vers la preuve publique.",
  },
  {
    cle: "idee",
    code: "05",
    fr: "Idée",
    en: "Idea",
    consigne: "Une idée non ouverte, avec la condition qui l’ouvrirait.",
  },
] as const;

export const LONGUEUR_TITRE_EDITION = { min: 6, max: 90 } as const;
export const LONGUEUR_BLOC = { min: 40, max: 900 } as const;

/** Un numero s'ecrit toujours sur trois chiffres : SIGNAL #001. */
export function numeroAffiche(numero: number): string {
  return String(numero).padStart(3, "0");
}

export function objetEdition(numero: number, titre: string): string {
  return `SIGNAL #${numeroAffiche(numero)}, ${titre}`;
}

/** U+2014, ecrit par son code pour que la source n'en porte aucun. */
const TIRET_LONG = String.fromCharCode(0x2014);

// Le mot du produit est le moteur : aucun sigle ni nom technique du
// traitement en public. Les motifs sont assembles a partir de morceaux pour
// que ce fichier ne porte lui-meme aucune mention (tests/identite.test.ts).
const SIGLES = ["I" + "A", "A" + "I", "LLMs?", "GPT"].join("|");
const NOMS = [
  ["intelligence", "artificielle"].join(" "),
  ["artificial", "intelligence"].join(" "),
  "chatgpt",
  "chatbot",
].join("|");
const MOTIFS_IA: readonly RegExp[] = [
  new RegExp(`(^|[^\\p{L}])(${SIGLES})(?=$|[^\\p{L}])`, "u"),
  new RegExp(NOMS, "i"),
];

export function mentionIa(texte: string): string | null {
  for (const motif of MOTIFS_IA) {
    const trouve = texte.match(motif);
    if (trouve) return trouve[0].trim();
  }
  return null;
}

function estSourceValide(url: string): boolean {
  if (!/^https:\/\/\S+$/.test(url) || url.length > 400) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

type VerdictEdition = {
  bloquants: string[];
  constats: Constat[];
};

const NOM_LANGUE: Record<Langue, string> = {
  fr: "français",
  en: "anglais",
};

export function examinerEdition(edition: ContenuEdition): VerdictEdition {
  const bloquants: string[] = [];
  const constats: Constat[] = [];

  if (
    !Number.isInteger(edition.numero) ||
    edition.numero < 1 ||
    edition.numero > 9999
  ) {
    bloquants.push("Le numéro doit être un entier entre 1 et 9999.");
  }

  for (const langue of ["fr", "en"] as const) {
    const v = edition[langue];
    const nom = NOM_LANGUE[langue];
    const titre = v.titre.trim();
    if (
      titre.length < LONGUEUR_TITRE_EDITION.min ||
      titre.length > LONGUEUR_TITRE_EDITION.max
    ) {
      bloquants.push(
        `Le titre ${nom} compte ${titre.length} caractères, entre ${LONGUEUR_TITRE_EDITION.min} et ${LONGUEUR_TITRE_EDITION.max} attendus.`,
      );
    }
    for (const bloc of BLOCS_EDITION) {
      const texte = v[bloc.cle].trim();
      const libelle = langue === "fr" ? bloc.fr : bloc.en;
      if (/\n/.test(texte)) {
        bloquants.push(`« ${libelle} » (${nom}) doit tenir en un paragraphe.`);
      }
      if (
        texte.length < LONGUEUR_BLOC.min ||
        texte.length > LONGUEUR_BLOC.max
      ) {
        bloquants.push(
          `« ${libelle} » (${nom}) compte ${texte.length} caractères, entre ${LONGUEUR_BLOC.min} et ${LONGUEUR_BLOC.max} attendus.`,
        );
      }
    }
    if (!estSourceValide(v.source.trim())) {
      bloquants.push(
        `La source ${nom} doit être une adresse https complète vers le texte primaire.`,
      );
    }

    const tout = [v.titre, ...CLES_BLOCS.map((c) => v[c])].join("\n");
    const ia = mentionIa(tout);
    if (ia) {
      bloquants.push(
        `Règle des surfaces publiques : le traitement s’appelle « le moteur », jamais par un sigle ou un nom technique (${nom}). Passage : « ${ia} ».`,
      );
    }
    if (tout.includes(TIRET_LONG)) {
      bloquants.push(`Aucun tiret long dans la version ${nom}.`);
    }
    for (const c of controlerTexte(tout)) {
      constats.push(c);
      if (c.niveau === "interdit") {
        bloquants.push(`${c.regle} Passage (${nom}) : « ${c.terme} ».`);
      }
    }
  }

  return { bloquants, constats };
}

/** Une edition vide, pret a remplir, pour le numero donne. */
export function editionVide(numero: number): ContenuEdition {
  const vide: VersionEdition = {
    titre: "",
    source: "",
    signal: "",
    systeme: "",
    decision: "",
    construction: "",
    idee: "",
  };
  return { numero, fr: { ...vide }, en: { ...vide } };
}

// --- Passage entre la forme du code et les colonnes de la base ------------

export type ColonnesEdition = {
  numero: number;
  titre_fr: string;
  signal_fr: string;
  systeme_fr: string;
  decision_fr: string;
  construction_fr: string;
  idee_fr: string;
  source_fr: string;
  titre_en: string;
  signal_en: string;
  systeme_en: string;
  decision_en: string;
  construction_en: string;
  idee_en: string;
  source_en: string;
};

export function versColonnes(e: ContenuEdition): ColonnesEdition {
  const ligne = { numero: e.numero } as ColonnesEdition;
  for (const langue of ["fr", "en"] as const) {
    const v = e[langue];
    ligne[`titre_${langue}`] = v.titre.trim();
    ligne[`source_${langue}`] = v.source.trim();
    for (const cle of CLES_BLOCS) {
      ligne[`${cle}_${langue}`] = v[cle].trim();
    }
  }
  return ligne;
}

export function depuisColonnes(l: ColonnesEdition): ContenuEdition {
  const version = (langue: Langue): VersionEdition => ({
    titre: l[`titre_${langue}`],
    source: l[`source_${langue}`],
    signal: l[`signal_${langue}`],
    systeme: l[`systeme_${langue}`],
    decision: l[`decision_${langue}`],
    construction: l[`construction_${langue}`],
    idee: l[`idee_${langue}`],
  });
  return { numero: l.numero, fr: version("fr"), en: version("en") };
}

/** Les champs qui different entre deux editions, pour une correction. */
export function differences(
  avant: ContenuEdition,
  apres: ContenuEdition,
): Partial<Omit<ColonnesEdition, "numero">> {
  const a = versColonnes(avant);
  const b = versColonnes(apres);
  const diff: Partial<Omit<ColonnesEdition, "numero">> = {};
  for (const cle of Object.keys(b) as (keyof ColonnesEdition)[]) {
    if (cle === "numero") continue;
    if (a[cle] !== b[cle]) diff[cle] = b[cle];
  }
  return diff;
}

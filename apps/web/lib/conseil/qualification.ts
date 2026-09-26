// =====================================================================
// EG0, la qualification d'une demande, avant le premier echange.
//
// Fonction pure : elle ne lit ni la base ni l'horloge, et elle se teste sans
// reseau. Elle applique la regle d'acceptation de la branche EG, quatre
// conditions cumulatives, et les quatre interdits. Une seule condition
// manquante suffit a refuser, et le refus dit laquelle, avec l'orientation
// qui sert vraiment la personne.
//
// La condition 4, le contrat de travail d'Adama, ne se teste pas ici : elle
// est de son cote, et elle se verifie avant toute proposition. La
// qualification rend donc au mieux « recevable », jamais « acceptee ».
// =====================================================================

import type { CodeCondition, CodePorte } from "../../content/conseil";

export const CHOIX_ATTENDU = [
  {
    valeur: "architecture",
    libelle: "Une lecture de notre système et une architecture cible",
  },
  {
    valeur: "livrable",
    libelle:
      "Un livrable ESG produit pour nous : rapport, bilan, déclaration ou calcul",
  },
  {
    valeur: "interpretation",
    libelle: "L’interprétation d’un texte réglementaire pour notre entreprise",
  },
  {
    valeur: "verification",
    libelle: "Une vérification indépendante de nos informations de durabilité",
  },
  {
    valeur: "developpement",
    libelle: "Du développement logiciel",
  },
] as const;

export const CHOIX_STRATA = [
  { valeur: "aucune", libelle: "Aucune relation" },
  { valeur: "client", libelle: "Nous utilisons un produit STRATA ESG" },
  {
    valeur: "prospect",
    libelle: "Nous sommes en discussion avec STRATA ESG",
  },
] as const;

export const CHOIX_ECHEANCE = [
  { valeur: "moins-2-semaines", libelle: "Moins de deux semaines" },
  { valeur: "2-semaines-2-mois", libelle: "Entre deux semaines et deux mois" },
  { valeur: "plus-2-mois", libelle: "Plus de deux mois" },
  { valeur: "aucune", libelle: "Pas d’échéance fixée" },
] as const;

export const CODES_PORTE: readonly CodePorte[] = [
  "construire",
  "donnee",
  "ia",
  "systeme",
];

type Valeur<T extends readonly { valeur: string }[]> = T[number]["valeur"];
export type Attendu = Valeur<typeof CHOIX_ATTENDU>;
export type RelationStrata = Valeur<typeof CHOIX_STRATA>;
export type Echeance = Valeur<typeof CHOIX_ECHEANCE>;

export type Demande = {
  porte: CodePorte;
  attendu: Attendu;
  strata: RelationStrata;
  echeance: Echeance;
  organisation: string;
  nom: string;
  email: string;
  probleme: string;
};

export type MotifRefus =
  | "strata"
  | "livrable"
  | "interpretation"
  | "verification"
  | "developpement"
  | "delai";

type Qualification =
  | { verdict: "recevable"; conditionsTenues: CodeCondition[] }
  | {
      verdict: "refus";
      motifs: MotifRefus[];
      /** Le premier motif, celui que la reponse nomme. */
      principal: MotifRefus;
    };

/** L'ordre de la regle : la condition 1 avant la 2, la 2 avant la 3. */
const ORDRE: readonly MotifRefus[] = [
  "strata",
  "livrable",
  "interpretation",
  "verification",
  "developpement",
  "delai",
];

export function qualifier(
  d: Pick<Demande, "attendu" | "strata" | "echeance">,
): Qualification {
  const motifs = new Set<MotifRefus>();
  if (d.strata !== "aucune") motifs.add("strata");
  if (d.attendu !== "architecture") motifs.add(d.attendu);
  if (d.echeance === "moins-2-semaines") motifs.add("delai");

  const ordonnes = ORDRE.filter((m) => motifs.has(m));
  const principal = ordonnes[0];
  if (principal) return { verdict: "refus", motifs: ordonnes, principal };
  return {
    verdict: "recevable",
    conditionsTenues: ["strata", "conception", "delai"],
  };
}

// --- La reponse de refus, telle qu'elle part -----------------------------

type Refus = {
  /** La condition ou l'interdit nomme, en une phrase. */
  regle: string;
  orientation: string;
  /** Lien d'orientation, externe seulement vers STRATA ESG. */
  lien?: { libelle: string; href: string };
};

export const REFUS: Record<MotifRefus, Refus> = {
  strata: {
    regle:
      "votre organisation ne doit être ni cliente ni prospect de STRATA ESG",
    orientation:
      "L’équipe de STRATA ESG connaît déjà votre contexte, et c’est elle qui peut vous répondre sans conflit d’intérêts.",
    lien: {
      libelle: "Écrire à STRATA ESG",
      href: "https://www.strata-esg.fr/",
    },
  },
  livrable: {
    regle:
      "le sujet doit être la conception d’un système, pas la production d’un livrable ESG",
    orientation:
      "Produire un rapport, un bilan ou une déclaration relève d’un logiciel en service, pas d’une revue. STRATA ESG édite les logiciels pour cela.",
    lien: {
      libelle: "Voir les logiciels de STRATA ESG",
      href: "https://www.strata-esg.fr/",
    },
  },
  interpretation: {
    regle:
      "aucune interprétation réglementaire n’est donnée pour une entreprise nommée",
    orientation:
      "Un avocat ou un conseil habilité à engager sa responsabilité sur votre situation est la bonne personne pour cette question.",
  },
  verification: {
    regle:
      "aucune vérification des informations de durabilité n’est faite ici, faute de l’indépendance qu’elle suppose",
    orientation:
      "Cette vérification relève d’un organisme tiers indépendant de vos outils et de vos conseils.",
  },
  developpement: {
    regle: "aucun développement logiciel n’est facturé",
    orientation:
      "Si le besoin est un outil qui existe déjà, un éditeur peut l’avoir ; sinon, une équipe de développement est la bonne adresse. Une revue peut en revanche dire quoi construire avant qu’elle commence.",
  },
  delai: {
    regle: "l’échéance doit laisser au moins deux semaines",
    orientation:
      "Une revue tenue en moins de deux semaines serait une revue bâclée. Si l’échéance peut glisser, la même porte reste ouverte.",
  },
};

/**
 * La phrase de refus type, ecrite pour partir telle quelle et sans blesser :
 * elle remercie, nomme la regle, dit qu'elle vaut pour tous, oriente, et
 * laisse la porte ouverte.
 */
export function phraseRefus(motif: MotifRefus): string {
  const r = REFUS[motif];
  return [
    "Merci pour la clarté de votre demande.",
    `Je ne peux pas y donner suite, parce qu’une des règles que j’applique avant toute mission n’est pas remplie : ${r.regle}.`,
    "Ce n’est pas un avis sur votre projet. C’est une règle écrite avant la première demande, et elle vaut pour chacune.",
    r.orientation,
    "Si votre situation change, la même porte reste ouverte.",
  ].join(" ");
}

// --- Lecture et bornage du formulaire ----------------------------------

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export const BORNES = {
  organisation: { min: 2, max: 120 },
  nom: { min: 2, max: 80 },
  probleme: { min: 80, max: 3000 },
} as const;

export type ChampDemande =
  | "porte"
  | "attendu"
  | "strata"
  | "echeance"
  | "organisation"
  | "nom"
  | "email"
  | "probleme"
  | "consentement";

type Lecture =
  | { ok: true; demande: Demande }
  | { ok: false; champ: ChampDemande; message: string };

function choix<T extends string>(
  brut: unknown,
  valeurs: readonly T[],
): T | null {
  return typeof brut === "string" &&
    (valeurs as readonly string[]).includes(brut)
    ? (brut as T)
    : null;
}

function texte(brut: unknown): string {
  return typeof brut === "string" ? brut.replace(/\s+/g, " ").trim() : "";
}

/** Le probleme garde ses retours a la ligne, pas ses espaces en rafale. */
function paragraphes(brut: unknown): string {
  if (typeof brut !== "string") return "";
  return brut
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function lireDemande(lire: (cle: string) => unknown): Lecture {
  const porte = choix(lire("porte"), CODES_PORTE);
  if (!porte)
    return { ok: false, champ: "porte", message: "Choisissez une porte." };

  const attendu = choix(
    lire("attendu"),
    CHOIX_ATTENDU.map((c) => c.valeur),
  );
  if (!attendu)
    return {
      ok: false,
      champ: "attendu",
      message: "Dites ce que vous attendez en sortie.",
    };

  const strata = choix(
    lire("strata"),
    CHOIX_STRATA.map((c) => c.valeur),
  );
  if (!strata)
    return {
      ok: false,
      champ: "strata",
      message: "Indiquez votre relation avec STRATA ESG.",
    };

  const echeance = choix(
    lire("echeance"),
    CHOIX_ECHEANCE.map((c) => c.valeur),
  );
  if (!echeance)
    return {
      ok: false,
      champ: "echeance",
      message: "Indiquez votre échéance.",
    };

  const organisation = texte(lire("organisation"));
  if (
    organisation.length < BORNES.organisation.min ||
    organisation.length > BORNES.organisation.max
  )
    return {
      ok: false,
      champ: "organisation",
      message: "Nommez votre organisation, en 120 caractères au plus.",
    };

  const nom = texte(lire("nom"));
  if (nom.length < BORNES.nom.min || nom.length > BORNES.nom.max)
    return {
      ok: false,
      champ: "nom",
      message: "Indiquez votre nom, en 80 caractères au plus.",
    };

  const email = texte(lire("email")).toLowerCase();
  if (!EMAIL.test(email) || email.length > 254)
    return {
      ok: false,
      champ: "email",
      message: "Cette adresse ne semble pas valide. Vérifiez-la.",
    };

  const probleme = paragraphes(lire("probleme"));
  if (probleme.length < BORNES.probleme.min)
    return {
      ok: false,
      champ: "probleme",
      message: `Décrivez le problème en ${BORNES.probleme.min} caractères au moins : le contexte, le blocage et ce qui a déjà été essayé.`,
    };
  if (probleme.length > BORNES.probleme.max)
    return {
      ok: false,
      champ: "probleme",
      message: `Restez sous ${BORNES.probleme.max} caractères. Le détail viendra au premier échange.`,
    };

  if (lire("consentement") !== "oui")
    return {
      ok: false,
      champ: "consentement",
      message:
        "Cochez la case pour que votre demande puisse être lue. Elle n’est jamais cochée d’avance.",
    };

  return {
    ok: true,
    demande: {
      porte,
      attendu,
      strata,
      echeance,
      organisation,
      nom,
      email,
      probleme,
    },
  };
}

// =====================================================================
// ES0, AXP-271, le tableau de bord de la branche, huit indicateurs.
//
// Un instrument privé de pilotage, jamais une surface publique : il vit dans
// /admin/tenue, derrière la session et la liste des administrateurs, et sa
// copie mensuelle datée dans la base Notion « Tableau de bord ES0 ». Aucun
// de ces chiffres n'est publié (XINV-11, XINV-21), et
// tests/tenue.test.ts vérifie qu'aucune page publique n'importe ce module.
//
// Aucune valeur n'est estimée (XINV-56) : une case sans source relevable
// vaut null, et l'écran dit pourquoi et quel chantier fera naître sa source.
// Les huit indicateurs sont ceux d'AXP-271, dans son ordre, ni plus ni moins.
// =====================================================================

import { erreursOuvertes } from "./erreurs";
import { methodesProuvees } from "./methodes";

export type CodeIndicateur =
  | "adresses"
  | "ventes"
  | "encaisse"
  | "objets_publies"
  | "objets_perimes"
  | "erreurs_ouvertes"
  | "methodes_prouvees"
  | "heures";

type DefinitionIndicateur = {
  code: CodeIndicateur;
  libelle: string;
  compte: string;
  source: string;
  geste: string;
  frequence: string;
  /** Null quand la source existe dans le dépôt ou le projet dédié. */
  sourceAbsente: { chantier: string; enAttendant: string } | null;
};

export const INDICATEURS_ES0: readonly DefinitionIndicateur[] = [
  {
    code: "adresses",
    libelle: "Adresses",
    compte:
      "Adresses confirmées par le bouton de XDEC-39, jamais les demandes d’inscription.",
    source:
      "Projet Supabase dédié adama-lettre (XDEC-38), fonction lettre_etat, champ confirmes.",
    geste:
      "Lecture serveur à l’ouverture de /admin/tenue, date et heure de l’appel.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: null,
  },
  {
    code: "ventes",
    libelle: "Ventes",
    compte:
      "Nombre de ventes encaissées de la branche ADAMA, une ligne par facture.",
    source: "Livre des recettes, colonne branche ADAMA (XDEC-33).",
    geste: "Compter les lignes ADAMA du mois dans le livre des recettes.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: {
      chantier:
        "EB0, le socle marchand. Aucune vente n’est possible avant EK2, EK3 et ES9 (XDEC-17).",
      enAttendant:
        "Case vide : le livre des recettes n’a pas encore de colonne branche.",
    },
  },
  {
    code: "encaisse",
    libelle: "Chiffre encaissé",
    compte:
      "Euros encaissés par la branche ADAMA, brut, cumul depuis l’ouverture.",
    source: "Livre des recettes, colonne branche ADAMA (XDEC-33).",
    geste: "Additionner les montants ADAMA encaissés du livre des recettes.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: {
      chantier: "EB0, le socle marchand, après EK2, EK3 et ES9 (XDEC-17).",
      enAttendant:
        "Case vide : aucune source d’encaissement n’existe pour la branche.",
    },
  },
  {
    code: "objets_publies",
    libelle: "Objets publiés",
    compte: "Objets de la branche en ligne, une ligne par objet et par langue.",
    source: "Catalogue des objets publiés.",
    geste: "Compter les objets du catalogue au statut publié.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: {
      chantier: "EB5, le catalogue des objets.",
      enAttendant:
        "Case vide : aucun catalogue n’énumère encore les objets de la branche.",
    },
  },
  {
    code: "objets_perimes",
    libelle: "Objets périmés",
    compte: "Objets publiés dont la date de relecture est dépassée.",
    source: "Registre de vérification des faits et des dates de péremption.",
    geste:
      "Compter les objets dont la date de relecture est antérieure au jour du relevé.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: {
      chantier: "ES5, la vérification des faits et les dates de péremption.",
      enAttendant:
        "Case vide : aucune date de péremption n’est encore portée par les objets.",
    },
  },
  {
    code: "erreurs_ouvertes",
    libelle: "Erreurs ouvertes",
    compte:
      "Entrées du registre public au statut ouverte : correction pas encore en ligne, ou défaut sans méthode.",
    source:
      "Registre public /erreurs, fonction erreursOuvertes de content/erreurs.ts.",
    geste: "Lecture du registre au moment du relevé.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: null,
  },
  {
    code: "methodes_prouvees",
    libelle: "Méthodes PROUVÉ",
    compte: "Méthodes à l’état PROUVÉ sur les sept de la bibliothèque.",
    source: "Fiches EM0 de content/methodes.ts, fonction methodesProuvees.",
    geste: "Lecture des fiches au moment du relevé.",
    frequence: "Premier dimanche du mois",
    sourceAbsente: null,
  },
  {
    code: "heures",
    libelle: "Heures passées",
    compte:
      "Heures comptées sur la branche, par semaine, jamais estimées (AXP-88, ligne 5).",
    source: "Base Notion « Relevé des heures », une ligne par semaine (ET9).",
    geste: "Additionner les heures des semaines du mois écoulé.",
    frequence: "Chaque dimanche, total au premier dimanche du mois",
    sourceAbsente: null,
  },
];

type ValeurIndicateur = {
  code: CodeIndicateur;
  valeur: string | null;
  releveLe: string | null;
  raison: string | null;
};

/**
 * Lit ce qui est relevable dans le dépôt. Les indicateurs lus hors du dépôt
 * (adresses, heures) sont passés par l'appelant, qui les a lus dans leur
 * source, ou restent vides avec leur raison.
 */
export function releverTenue(
  externes: Partial<
    Record<
      CodeIndicateur,
      { valeur: string; releveLe: string } | { raison: string }
    >
  >,
  maintenant: Date = new Date(),
): ValeurIndicateur[] {
  const instant = maintenant.toISOString();
  const internes: Partial<Record<CodeIndicateur, string>> = {
    erreurs_ouvertes: String(erreursOuvertes()),
    methodes_prouvees: `${methodesProuvees().prouvees} sur ${methodesProuvees().total}`,
  };
  return INDICATEURS_ES0.map((def) => {
    const interne = internes[def.code];
    if (interne !== undefined) {
      return {
        code: def.code,
        valeur: interne,
        releveLe: instant,
        raison: null,
      };
    }
    const externe = externes[def.code];
    if (externe && "valeur" in externe) {
      return {
        code: def.code,
        valeur: externe.valeur,
        releveLe: externe.releveLe,
        raison: null,
      };
    }
    return {
      code: def.code,
      valeur: null,
      releveLe: null,
      raison:
        (externe && "raison" in externe ? externe.raison : null) ??
        def.sourceAbsente?.enAttendant ??
        "Source non lue au moment du relevé.",
    };
  });
}

/** Le premier dimanche du mois qui suit une date, jour du relevé (XINV-38). */
export function premierDimancheApres(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
  );
  while (d.getUTCDay() !== 0) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

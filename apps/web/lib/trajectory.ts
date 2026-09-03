// =====================================================================
// C1-T8, lecture de la trajectoire.
//
// Une roadmap perimee est une donnee fausse comme une autre. La table
// contenait une entree « Phase 0, Fondations », datee du 6 juillet 2026,
// encore au statut `now` deux mois apres son echeance. Personne ne mentait :
// il manquait simplement une facon de dire qu'une etape est finie, et un
// endroit qui verifie que les dates tiennent encore.
//
// Ce module fait les deux. La migration 0004 ajoute le statut `done` et
// bascule l'entree concernee ; ce module derive, a chaque lecture, l'etat
// reel d'une entree a partir de son echeance. Une entree dont l'echeance est
// passee ne s'affiche plus telle quelle : elle porte la mention « echeance
// depassee », visible, jusqu'a ce que quelqu'un tranche.
// =====================================================================

import type { TrajectoryRow, TrajectoryStatus } from "../components/types";

const MOIS: Record<string, number> = {
  janvier: 0,
  fevrier: 1,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  aout: 7,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  decembre: 11,
  décembre: 11,
};

/**
 * Interprete un champ `eta` en date limite.
 *
 * Trois formes reconnues, et une seule reponse honnete pour le reste :
 *   "6 juillet 2026"  -> fin de cette journee ;
 *   "Septembre 2026"  -> fin de ce mois ;
 *   "2026-07-06"      -> fin de cette journee ;
 *   "Phase 2", vide   -> null, il n'y a pas d'echeance a tenir.
 *
 * Rendre null plutot que de deviner : une echeance inventee ferait basculer
 * une entree pour rien, ce qui est exactement le defaut que la couche corrige.
 */
export function parseEta(eta: string | null | undefined): Date | null {
  if (!eta) {
    return null;
  }
  const texte = eta.trim().toLowerCase();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte);
  if (iso) {
    return new Date(
      Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 23, 59, 59),
    );
  }

  const jourMoisAnnee = /^(\d{1,2})\s+([a-zéèêûôà]+)\s+(\d{4})$/.exec(texte);
  if (jourMoisAnnee) {
    const mois = MOIS[jourMoisAnnee[2] as string];
    if (mois === undefined) {
      return null;
    }
    return new Date(
      Date.UTC(
        Number(jourMoisAnnee[3]),
        mois,
        Number(jourMoisAnnee[1]),
        23,
        59,
        59,
      ),
    );
  }

  const moisAnnee = /^([a-zéèêûôà]+)\s+(\d{4})$/.exec(texte);
  if (moisAnnee) {
    const mois = MOIS[moisAnnee[1] as string];
    if (mois === undefined) {
      return null;
    }
    // Dernier instant du mois : le 0 du mois suivant est le dernier jour.
    return new Date(Date.UTC(Number(moisAnnee[2]), mois + 1, 0, 23, 59, 59));
  }

  return null;
}

export type TrajectoryView = TrajectoryRow & {
  /** Colonne d'affichage. Identique au statut stocke, sauf pour `done`. */
  colonne: TrajectoryStatus;
  /** Vrai quand l'echeance est passee sans que le statut ait bouge. */
  overdue: boolean;
  /** Echeance interpretee, ISO 8601. Null quand `eta` n'en contient pas. */
  dueAt: string | null;
};

/**
 * Derive l'etat d'affichage de chaque entree.
 *
 * Une entree `done` n'est jamais en retard, elle est finie. Une entree
 * `later` sans echeance non plus. Le retard ne concerne que ce qui est
 * annonce comme en cours ou comme suivant, avec une date passee.
 */
export function resolveTrajectory(
  items: TrajectoryRow[],
  now: Date = new Date(),
): TrajectoryView[] {
  return items.map((item) => {
    const due = parseEta(item.eta);
    const overdue =
      item.status !== "done" && due !== null && due.getTime() < now.getTime();
    return {
      ...item,
      colonne: item.status,
      overdue,
      dueAt: due ? due.toISOString() : null,
    };
  });
}

/** Entrees dont l'echeance est passee sans que le statut ait bouge. */
export function incoherences(views: TrajectoryView[]): TrajectoryView[] {
  return views.filter((v) => v.overdue);
}

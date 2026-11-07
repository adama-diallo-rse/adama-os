import "server-only";

// =====================================================================
// EH4, la lecture publique des numeros parus.
//
// Les pages publiques lisent la base dediee cote serveur, avec la cle de
// service, et ne recoivent que des numeros au statut envoyee : un brouillon
// ou un envoi en cours ne sort jamais. Aucun compteur d'abonnes ni d'envois
// ne sort (XINV-21).
//
// Trois etats, jamais confondus : des numeros parus, aucun numero paru, et
// une base qui ne repond pas. Le troisieme ne se deguise pas en deuxieme :
// la page dit que l'archive est indisponible plutot que d'annoncer que rien
// n'a paru.
// =====================================================================

import { cache } from "react";
import { lireConfigLettre } from "./config";
import { editionsParues, type LigneEdition } from "./registre-editions";

type Archive =
  | { etat: "ok"; editions: LigneEdition[] }
  | { etat: "indisponible" };

export const lireArchive = cache(async (): Promise<Archive> => {
  const lecture = lireConfigLettre();
  if (!lecture.ok) return { etat: "indisponible" };
  try {
    return { etat: "ok", editions: await editionsParues(lecture.config) };
  } catch {
    return { etat: "indisponible" };
  }
});

/** Un numero d'adresse (001, 12, 0042) vers un entier, ou null. */
export function lireNumero(brut: string): number | null {
  if (!/^\d{1,4}$/.test(brut)) return null;
  const n = Number.parseInt(brut, 10);
  return n >= 1 && n <= 9999 ? n : null;
}

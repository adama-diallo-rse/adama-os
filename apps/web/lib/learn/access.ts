import "server-only";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, decodeAccess } from "./token";

// L5-T8 — Lecture de l'accès aux formations depuis le cookie signé.
// Utilisé par les Server Components (page leçon, page cours) pour décider
// d'afficher le contenu premium ou le paywall.

/** Niveaux débloqués pour la requête courante. [] si non connecté / cookie absent. */
export async function getGrantedLevels(): Promise<number[]> {
  const store = await cookies();
  return decodeAccess(store.get(ACCESS_COOKIE)?.value);
}

/** Vrai si le niveau donné est débloqué pour la requête courante. */
export async function hasAccessToLevel(level: number): Promise<boolean> {
  const levels = await getGrantedLevels();
  return levels.includes(level);
}

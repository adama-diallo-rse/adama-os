"use client";

/**
 * L'ÎLOT DU DÉFILEMENT DOUX, POSÉ UNE FOIS DANS LE DOCUMENT RACINE.
 *
 * Même règle de chargement que l'îlot de mouvement : après l'hydratation,
 * au repos du navigateur, jamais sous réduction de mouvement. Il n'importe
 * que Lenis (`defilement.tsx`), sans GSAP : il n'entre pas dans le chemin
 * critique et n'est référencé par aucune balise du HTML servi.
 */

import { lazy, Suspense } from "react";
import { useRepos } from "./repos";

const Defilement = lazy(() => import("./defilement"));

export function IleDefilement() {
  const pret = useRepos(2500, 400);
  return pret ? (
    <Suspense fallback={null}>
      <Defilement />
    </Suspense>
  ) : null;
}

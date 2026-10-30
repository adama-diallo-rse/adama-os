"use client";

/**
 * L'ÎLOT DE MOUVEMENT, UN PAR ÉCRAN.
 *
 * Ce composant ne contient pas une ligne de GSAP. Il attend que la page soit
 * hydratée, puis que le navigateur soit au repos, et seulement alors importe
 * les scènes, qui portent GSAP, ScrollTrigger et SplitText. Le morceau
 * importé n'est référencé par aucune balise du HTML servi : il n'entre ni
 * dans le paquet commun, ni dans le budget de première visite, ni dans le
 * chemin critique. Sous réduction de mouvement, rien n'est importé.
 */

import { lazy, Suspense } from "react";
import { useRepos } from "./repos";

const Scenes = lazy(() => import("./scenes"));

export function IleMouvement() {
  const pret = useRepos(1500, 300);
  return pret ? (
    <Suspense fallback={null}>
      <Scenes />
    </Suspense>
  ) : null;
}

"use client";

/**
 * L'ÎLOT DU SYMBOLE EN TROIS DIMENSIONS.
 *
 * Importé au repos du navigateur, seulement sur grand écran à pointeur fin
 * et hors réduction de mouvement. Sur téléphone, sous réduction de
 * mouvement ou sans WebGL, ce module n'est jamais chargé : le symbole SVG
 * de chaque emplacement reste seul, avec ses états d'acte en CSS.
 */

import { lazy, Suspense, useEffect, useState } from "react";
import { useRepos } from "./repos";

const Symbole3D = lazy(() => import("./symbole-3d"));

export function IleSymbole3D() {
  const repos = useRepos(2500, 600);
  const [grandEcran, setGrandEcran] = useState(false);

  useEffect(() => {
    const requete = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine)",
    );
    const lire = () => setGrandEcran(requete.matches);
    lire();
    requete.addEventListener("change", lire);
    return () => requete.removeEventListener("change", lire);
  }, []);

  return repos && grandEcran ? (
    <Suspense fallback={null}>
      <Symbole3D />
    </Suspense>
  ) : null;
}

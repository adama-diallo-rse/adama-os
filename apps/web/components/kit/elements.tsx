// =====================================================================
// Les éléments du kit de page ADAMA OS (refonte du 30 octobre 2026).
//
// Composants serveur, sans état : ils posent le balisage et les repères
// (`data-*`) que les scènes de mouvement animent, et restent complets,
// lisibles et immobiles sans script ou sous réduction de mouvement.
// =====================================================================

import type { ReactNode } from "react";

/**
 * Le sur-titre numéroté, façon publication de recherche : un numéro de
 * section, une cote qui se trace, un libellé en capitales espacées.
 */
export function SurTitre({
  numero,
  children,
  className = "",
}: {
  numero?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`sur-titre ${className}`}>
      {numero ? <span className="sur-titre-numero">{numero}</span> : null}
      <span className="sur-titre-cote" data-cote aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Le mot accentué d'un titre : serif italique, latérite. Un seul par titre. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="accent">{children}</em>;
}

/**
 * Un mot souligné d'un trait tracé à la main, qui se dessine
 * (`stroke-dashoffset`) quand les scènes sont chargées. Sans elles, le
 * trait est simplement là.
 */
export function TraitMain({ children }: { children: ReactNode }) {
  return (
    <span className="trait-main">
      {children}
      <svg
        data-trait-main
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3 11c22-5 47-7 73-5 21 1 39 5 61 4 22-1 41-5 60-6" />
      </svg>
    </span>
  );
}

/** Flèche du kit : droite pour un lien interne, diagonale pour une sortie. */
export function Fleche({ diagonale = false }: { diagonale?: boolean }) {
  return (
    <svg
      className="fleche"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={diagonale ? "M7 17 17 7M8 7h9v9" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** L'état d'un objet, toujours écrit en toutes lettres, jamais par la seule couleur. */
export function Etat({ valeur }: { valeur: string }) {
  const ton =
    valeur === "PROUVÉ" || valeur === "OUVERT" || valeur === "Ouvert"
      ? "ouvert"
      : valeur === "CONCEPT" || /pas encore/i.test(valeur)
        ? "ferme"
        : "cours";
  return (
    <span className="etat-objet" data-ton={ton}>
      <span className="etat-objet-forme" aria-hidden="true" />
      {valeur}
    </span>
  );
}

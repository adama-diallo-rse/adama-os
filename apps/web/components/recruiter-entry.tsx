// =====================================================================
// C9-T4, l'entree visible du parcours recruteur.
//
// Presente sur chaque page, discrete, et jamais enfouie dans un menu :
// c'est la contrainte de la couche, et elle a une raison. Un recruteur qui
// arrive par une page interne, par un moteur de recherche ou par un lien
// partage n'ouvrira pas un menu pour chercher ce qu'il ne sait pas exister.
//
// Rendu deux fois dans la barre de site : une fois dans les actions
// d'en-tete, visible en permanence au dessus de 800 pixels, et une fois en
// tete de la navigation mobile, ou elle est la premiere entree et non une
// ligne parmi d'autres.
// =====================================================================

import Link from "next/link";

export function RecruiterEntry({
  variant = "header",
  onNavigate,
}: {
  variant?: "header" | "mobile";
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/recruteur"
      className={`recruiter-entry recruiter-entry--${variant}`}
      onClick={onNavigate}
    >
      <span className="recruiter-entry-dot" aria-hidden="true" />
      <span>
        Recruteur
        <span className="recruiter-entry-caption">
          Profil, preuves, disponibilité
        </span>
      </span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

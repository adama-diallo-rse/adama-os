import Link from "next/link";
import { BRANCHES } from "../../content/accueil";
import { METHODES } from "../../content/methodes";
import { IconeBranche } from "../kit/illustrations-maison";
import { Fleche } from "../kit/elements";

// =====================================================================
// Les six branches d'ADAMA OS et la bibliothèque des méthodes.
//
// Chaque branche dit ce qu'elle produit et où elle en est, sans rien
// promettre de ce qui n'est pas en ligne. Les méthodes sont lues dans leur
// source (content/methodes.ts) avec leur état : une méthode n'est dite
// prouvée que si sa fiche le porte.
// =====================================================================

export function Branches() {
  return (
    <ul className="branches" data-cartes>
      {BRANCHES.map((b) => (
        <li key={b.code}>
          <Link href={b.href} className="branche">
            <span className="branche-tete">
              <IconeBranche code={b.code} />
              <span
                className="branche-etat"
                data-ouverte={b.ouverte ? "oui" : "non"}
              >
                {b.etat}
              </span>
            </span>
            <span className="branche-nom">{b.nom}</span>
            <span className="branche-libelle">{b.libelle}</span>
            <span className="branche-texte">{b.texte}</span>
            <span className="branche-fleche" aria-hidden="true">
              <Fleche />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function BandeMethodes() {
  const prouvees = METHODES.filter((m) => m.etat === "PROUVÉ").length;
  return (
    <div className="bande-methodes">
      <div className="bande-methodes-tete">
        <p className="bande-methodes-titre">La bibliothèque des méthodes</p>
        <p>
          {METHODES.length} méthodes nommées et datées,{" "}
          {prouvees > 1
            ? `${prouvees} prouvées par un usage réel mesuré`
            : `${prouvees} prouvée par un usage réel mesuré`}
          . Chacune affiche son état, et rien ne monte d’état sans preuve.
        </p>
        <Link href="/methodes" className="portfolio-text-link">
          Ouvrir la bibliothèque <Fleche />
        </Link>
      </div>
      <ol className="bande-methodes-liste">
        {METHODES.map((m) => (
          <li key={m.identifiant}>
            <Link href={`/methodes/${m.identifiant.toLowerCase()}`}>
              <span className="bande-methodes-code">{m.identifiant}</span>
              <span className="bande-methodes-nom">{m.nomAffiche}</span>
              <span
                className="bande-methodes-etat"
                data-etat={m.etat === "PROUVÉ" ? "prouve" : "autre"}
              >
                {m.etat}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

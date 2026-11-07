import Image from "next/image";
import {
  PARTENAIRES,
  REFERENCES,
  type LogoOrganisation,
} from "../../content/accompagnement";

// =====================================================================
// La bande de confiance, 7 novembre 2026.
//
// Elle remplace le bandeau défilant des organisations. Un défilé oblige le
// lecteur à attendre qu'un nom repasse, et un logo encre sur fond sombre ne
// se voyait plus du tout. Ici, chaque logo est posé sur sa plaque claire,
// dans ses vraies couleurs, et reste immobile : lisible en mode clair comme
// en mode sombre, à l'impression comme sur téléphone.
//
// Deux groupes, deux sens : les structures qui accompagnent les projets,
// puis les organisations où le travail a été fait. Les plaques montent par
// vagues avec le reste des cartes du site (`data-cartes`).
// =====================================================================

function Plaque({ logo }: { logo: LogoOrganisation }) {
  const hauteur = logo.affichage;
  const largeur = Math.round((logo.largeur * hauteur) / logo.hauteur);
  return (
    <li className="plaque">
      <Image
        src={`/logos/${logo.fichier}.webp`}
        alt={logo.nom}
        width={largeur}
        height={hauteur}
        style={{ width: largeur, height: hauteur }}
      />
    </li>
  );
}

/** Une rangée de plaques, pour une page qui n'a besoin que d'un groupe. */
export function Plaques({
  logos,
  label,
}: {
  logos: readonly LogoOrganisation[];
  label: string;
}) {
  return (
    <ul className="confiance-plaques" aria-label={label} data-cartes>
      {logos.map((l) => (
        <Plaque key={l.id} logo={l} />
      ))}
    </ul>
  );
}

export function LogosConfiance({
  id = "confiance",
  compact = false,
}: {
  id?: string;
  /** Sans fond ni marges de section, pour une page du kit. */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      className={`confiance ${compact ? "confiance--compacte" : ""}`.trim()}
      aria-label="Partenaires et références"
    >
      <div className="portfolio-wrap confiance-grille">
        <div className="confiance-groupe confiance-groupe--partenaires">
          <h2 className="confiance-titre">Ils accompagnent mes projets</h2>
          <ul className="confiance-plaques" data-cartes>
            {PARTENAIRES.map((l) => (
              <Plaque key={l.id} logo={l} />
            ))}
          </ul>
        </div>
        <div className="confiance-groupe">
          <h2 className="confiance-titre">Où j’ai travaillé et étudié</h2>
          <ul className="confiance-plaques" data-cartes>
            {REFERENCES.map((l) => (
              <Plaque key={l.id} logo={l} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

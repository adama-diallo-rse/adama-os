import Link from "next/link";
import type { ReactNode } from "react";
import { ETAT_OFFRE, PHOTOS, SEMAINES } from "../../content/accompagnement";
import { PhotoCadre } from "./offre";
import { Accent, Fleche, SurTitre } from "../kit/elements";

// =====================================================================
// L'accompagnement, présenté comme un format de la branche CONSEIL parmi
// d'autres : une photographie, ce que c'est, les six verbes, un lien vers
// la page détaillée et l'appel. Aucun prix, aucune date d'ouverture.
// =====================================================================

export function VoletAccompagnement({
  numero,
  action,
}: {
  numero: string;
  action: ReactNode;
}) {
  return (
    <section
      id="accompagnement"
      className="feuille feuille-creux accueil-section volet"
      aria-labelledby="volet-titre"
    >
      <div className="portfolio-wrap volet-grille">
        <PhotoCadre
          photo={PHOTOS.seance}
          sizes="(max-width: 1023px) 100vw, 46vw"
          className="volet-photo"
        />
        <div className="volet-texte">
          <SurTitre numero={numero}>Accompagnement de projets</SurTitre>
          <h2 id="volet-titre">
            Six semaines pour passer de l’idée{" "}
            <Accent>au système qui tient.</Accent>
          </h2>
          <p className="volet-intro">
            Pour les porteurs de projets qui ont beaucoup d’idées et peu de
            temps : une séance par semaine, un livrable concret à chaque fois,
            et un bilan avant et après. C’est un des formats de CONSEIL, à côté
            de la revue d’architecture et du second avis.
          </p>
          <ol className="volet-verbes">
            {SEMAINES.map((s) => (
              <li key={s.numero}>
                <span>{String(s.numero).padStart(2, "0")}</span>
                {s.verbe}
              </li>
            ))}
          </ol>
          <p className="volet-etat">
            <span className="volet-etat-point" aria-hidden="true" />
            {ETAT_OFFRE.badge}. {ETAT_OFFRE.texte}
          </p>
          <div className="volet-actions">
            {action}
            <Link href="/travaillez-avec-moi" className="portfolio-text-link">
              Le programme en détail <Fleche />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

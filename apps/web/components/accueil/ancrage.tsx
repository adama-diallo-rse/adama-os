import type { ReactNode } from "react";
import { Accent, SurTitre } from "../kit/elements";

// =====================================================================
// L'ancrage de l'accueil, 7 novembre 2026 : Paris et Dakar, la carte où le
// Sénégal porte la latérite, et ce qui se fait de chaque côté. La carte est
// rendue par la page serveur et reçue ici déjà dessinée : ses tracés
// n'entrent pas dans le paquet JavaScript de l'accueil.
// =====================================================================

export function Ancrage({
  carte,
  numero,
}: {
  carte: ReactNode;
  numero: string;
}) {
  return (
    <section
      id="ancrage"
      className="feuille feuille-indigo accueil-section ancrage"
      aria-labelledby="ancrage-titre"
    >
      <div className="portfolio-wrap ancrage-grille">
        <div className="ancrage-texte">
          <SurTitre numero={numero}>Paris et Dakar</SurTitre>
          <h2 id="ancrage-titre">
            Deux villes, <Accent>un même terrain.</Accent>
          </h2>
          <p className="ancrage-intro">
            Sénégalais, installé entre Paris et Dakar, j’accompagne des porteurs
            de projets des deux côtés. Je parle français et je comprends le
            wolof et le pular : l’échange peut commencer dans votre langue.
          </p>
          <dl className="ancrage-villes">
            <div>
              <dt>
                <span className="ancrage-pastille ancrage-pastille--dakar" />
                Dakar
              </dt>
              <dd>
                Pharivo, les logiciels de santé d’Afrique de l’Ouest, et le
                Ministère de l’Économie, des Finances et du Plan.
              </dd>
            </div>
            <div>
              <dt>
                <span className="ancrage-pastille ancrage-pastille--paris" />
                Paris
              </dt>
              <dd>
                STRATA ESG, Conhama, AG2R LA MONDIALE, l’Université Paris-Est
                Créteil et la CCI Paris Île-de-France.
              </dd>
            </div>
          </dl>
        </div>
        <div className="ancrage-carte" data-revele-media>
          {carte}
        </div>
      </div>
    </section>
  );
}

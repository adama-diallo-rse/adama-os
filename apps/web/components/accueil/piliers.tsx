import Link from "next/link";
import { PILIERS } from "../../content/accueil";
import { IllustrationPilier } from "../kit/illustrations-maison";
import { Fleche } from "../kit/elements";

// =====================================================================
// Les trois piliers de l'accueil : construire, publier, accompagner.
// Chaque carte porte son dessin, son verbe et un seul lien. L'ordre est
// celui dans lequel les trois se nourrissent : ce qui est construit donne
// les méthodes, et les méthodes donnent les accompagnements.
// =====================================================================

export function Piliers({ piliers = PILIERS }: { piliers?: typeof PILIERS }) {
  return (
    <ol className="piliers" data-cartes>
      {piliers.map((p, i) => (
        <li key={p.code} className="pilier" id={`pilier-${p.code}`}>
          <div className="pilier-dessin" data-revele-media>
            <IllustrationPilier code={p.code} />
          </div>
          <p className="pilier-verbe">
            <span>{String(i + 1).padStart(2, "0")}</span>
            {p.verbe}
          </p>
          <h3>{p.titre}</h3>
          <p className="pilier-texte">{p.texte}</p>
          <Link href={p.lien.href} className="pilier-lien">
            {p.lien.libelle} <Fleche />
          </Link>
        </li>
      ))}
    </ol>
  );
}

// =====================================================================
// C14-T2, la chaine du site, en SVG en ligne.
//
// Sept etapes, sans bibliotheque, sans animation. Le SVG est decoratif : il
// donne la forme, pas l'information. Tout ce qu'il montre est repris juste
// en dessous en HTML, avec pour chaque etape le fichier ou la table qui
// l'implemente reellement. C'est cette version que lit un lecteur d'ecran,
// et c'est elle qui s'imprime.
//
// Le SVG disparait sous neuf cents pixels : sur telephone, la lecture se
// fait verticalement dans la liste, sans schema ecrase.
// =====================================================================

import { CHAINE, CHAINE_TEXTE } from "../content/systeme";

const LARGEUR = 132;
const ECART = 12;
const HAUTEUR = 56;

export function SystemeChain() {
  const pas = LARGEUR + ECART;
  const largeurTotale = CHAINE.length * pas - ECART;

  return (
    <div className="dna-chaine">
      <svg
        className="dna-chaine-svg"
        viewBox={`0 0 ${largeurTotale} ${HAUTEUR + 24}`}
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        {CHAINE.map((etape, index) => {
          const x = index * pas;
          return (
            <g key={etape.id}>
              <rect
                x={x}
                y={12}
                width={LARGEUR}
                height={HAUTEUR}
                rx={3}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
              />
              <text
                x={x + LARGEUR / 2}
                y={12 + HAUTEUR / 2 + 4}
                textAnchor="middle"
                className="dna-chaine-label"
              >
                {etape.titre}
              </text>
              {index < CHAINE.length - 1 ? (
                <path
                  d={`M${x + LARGEUR} ${12 + HAUTEUR / 2}h${ECART}`}
                  stroke="currentColor"
                  strokeWidth={1}
                  fill="none"
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      <p className="proof-sr">{CHAINE_TEXTE}</p>

      {/* Meme raison que pour les cartes de competence : sans ce titre, la
          page saute de h1 a h3. */}
      <h2 className="portfolio-label">SEPT ÉTAPES, ET LE CODE QUI LES TIENT</h2>

      <ol className="dna-etapes">
        {CHAINE.map((etape, index) => (
          <li key={etape.id}>
            <span className="dna-etape-num" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{etape.titre}</h3>
              <p>{etape.quoi}</p>
              <ul className="dna-implementation">
                {etape.implementation.map((chemin) => (
                  <li key={chemin}>
                    <code>{chemin}</code>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// =====================================================================
// C10-T3, le schema d'architecture.
//
// SVG en ligne, disposition deterministe, aucun logo de technologie. Un mur
// de logos dit ce qu'on a installe ; ce schema dit ce qui traverse, dans quel
// sens, et ou se trouve la frontiere.
//
// Ce qu'il doit rendre evident en dix secondes : le systeme est une chaine a
// sens unique, des sources vers le lecteur, et les produits du groupe sont
// de l'autre cote d'une frontiere que rien ne franchit en ecriture.
//
// Les libelles de couche viennent de content/systeme.ts, qui est deja la
// source de la chaine en sept etapes de la page /systeme. Un second jeu de
// libelles ici aurait diverge au premier changement.
// =====================================================================

import { CHAINE } from "../content/systeme";

const W = 960;
const BAND_H = 78;
const BAND_GAP = 14;
const TOP = 16;
const LEFT = 12;
const CHAINE_W = 640;
const PRODUITS_X = 730;
const PRODUITS_W = 214;

export function ArchitectureDiagram() {
  const bandes = CHAINE;
  const hauteur = TOP + bandes.length * (BAND_H + BAND_GAP) + 30;
  const frontiereX = PRODUITS_X - 42;

  return (
    <figure className="tech-figure">
      <svg
        className="tech-schema"
        viewBox={`0 0 ${W} ${hauteur}`}
        role="img"
        aria-label="Schéma d’architecture. La chaîne va des sources vers le lecteur, étape par étape. Les produits du groupe sont de l’autre côté d’une frontière franchie en lecture seule. Le détail de chaque étape figure dans le tableau qui suit."
      >
        <defs>
          <marker
            id="tech-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10Z" fill="currentColor" />
          </marker>
        </defs>

        {bandes.map((etape, i) => {
          const y = TOP + i * (BAND_H + BAND_GAP);
          return (
            <g key={etape.id}>
              <rect
                x={LEFT}
                y={y}
                width={CHAINE_W}
                height={BAND_H}
                rx="3"
                className="tech-band"
              />
              <text x={LEFT + 18} y={y + 26} className="tech-band-num">
                {String(i + 1).padStart(2, "0")}
              </text>
              <text x={LEFT + 54} y={y + 26} className="tech-band-title">
                {etape.titre}
              </text>
              <text x={LEFT + 54} y={y + 48} className="tech-band-impl">
                {etape.implementation.slice(0, 2).join("  ·  ")}
              </text>
              {i < bandes.length - 1 ? (
                <path
                  d={`M${LEFT + CHAINE_W / 2} ${y + BAND_H} V ${y + BAND_H + BAND_GAP}`}
                  className="tech-edge"
                  markerEnd="url(#tech-arrow)"
                />
              ) : null}
            </g>
          );
        })}

        {/* La frontiere, et ce qu'il y a derriere */}
        <path
          d={`M${frontiereX} ${TOP - 4} V ${hauteur - 26}`}
          className="tech-frontiere"
        />
        <text
          x={frontiereX - 10}
          y={hauteur - 10}
          textAnchor="end"
          className="tech-frontiere-label"
        >
          frontière, lecture seule
        </text>

        <rect
          x={PRODUITS_X}
          y={TOP}
          width={PRODUITS_W}
          height={BAND_H * 2 + BAND_GAP}
          rx="3"
          className="tech-band tech-band--externe"
        />
        <text x={PRODUITS_X + 16} y={TOP + 28} className="tech-band-title">
          Produits du groupe
        </text>
        <text x={PRODUITS_X + 16} y={TOP + 50} className="tech-band-impl">
          interfaces de santé
        </text>
        <text x={PRODUITS_X + 16} y={TOP + 68} className="tech-band-impl">
          publiques, sans compte
        </text>
        <text x={PRODUITS_X + 16} y={TOP + 100} className="tech-band-impl">
          aucune donnée client
        </text>
        <text x={PRODUITS_X + 16} y={TOP + 122} className="tech-band-impl">
          aucune clé d’administration
        </text>
        <text x={PRODUITS_X + 16} y={TOP + 144} className="tech-band-impl">
          aucune écriture, jamais
        </text>

        <path
          d={`M${PRODUITS_X} ${TOP + BAND_H} H ${LEFT + CHAINE_W + 8}`}
          className="tech-edge tech-edge--entrante"
          markerEnd="url(#tech-arrow)"
        />
      </svg>
      <figcaption>
        La chaîne se lit de haut en bas. Rien ne remonte : une étape ne réécrit
        jamais ce que l’étape précédente a produit. À droite, les produits du
        groupe, franchis en lecture seule et jamais en écriture.
      </figcaption>
    </figure>
  );
}

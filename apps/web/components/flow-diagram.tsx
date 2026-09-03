// =====================================================================
// C11-T2, le schema des flux.
//
// Le point focal est la fleche BARREE, celle qui part du cockpit vers les
// produits et qui n'existe pas. C'est elle qui porte la competence demontree
// par cette page : savoir poser une frontiere, et savoir dire de quel cote
// elle passe.
//
// Elle est traitee sobrement, sans dramatisation : trait interrompu, croix
// nette, libelle en toutes lettres. Un panneau d'interdiction rouge aurait
// transforme une decision d'architecture en avertissement de securite, ce
// qui n'est pas la meme chose et se lit beaucoup moins bien.
//
// SVG en ligne, sans bibliotheque. Sous 720 pixels, le schema laisse la
// place au tableau des flux, qui porte la meme information.
// =====================================================================

import { FLUX } from "../content/frontieres";

const W = 900;
const H = 420;
const CX = W / 2;
const CY = 214;
const BOX_W = 214;
const BOX_H = 62;

type Position = { x: number; y: number };

const POSITIONS: Record<string, Position> = {
  github: { x: 20, y: 24 },
  produits: { x: 20, y: 150 },
  visiteur: { x: 20, y: 276 },
  modele: { x: W - BOX_W - 20, y: 90 },
  ecriture: { x: W - BOX_W - 20, y: 264 },
};

function Boite({
  x,
  y,
  titre,
  sous,
  variante,
}: {
  x: number;
  y: number;
  titre: string;
  sous: string;
  variante: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx="3"
        className={`trust-box trust-box--${variante}`}
      />
      <text x={x + 16} y={y + 26} className="trust-box-title">
        {titre}
      </text>
      <text x={x + 16} y={y + 45} className="trust-box-sub">
        {sous}
      </text>
    </g>
  );
}

export function FlowDiagram() {
  const entrants = FLUX.filter((f) => f.sens === "entrant");
  const modele = FLUX.find((f) => f.id === "modele");
  const interdit = FLUX.find((f) => f.sens === "interdit");

  return (
    <figure className="trust-figure">
      <svg
        className="trust-schema"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Schéma des flux de données. Trois sources alimentent ce site en lecture. Ce site interroge un fournisseur de modèle. Aucune écriture ne part vers les produits du groupe : cette flèche est barrée. Le tableau qui suit donne la même information en toutes lettres."
      >
        <defs>
          <marker
            id="trust-arrow"
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

        {entrants.map((f) => {
          const p = POSITIONS[f.id] ?? { x: 20, y: 24 };
          const y = p.y + BOX_H / 2;
          return (
            <g key={f.id}>
              <Boite
                x={p.x}
                y={p.y}
                titre={f.de}
                sous="en lecture"
                variante="source"
              />
              <path
                d={`M${p.x + BOX_W} ${y} H ${CX - BOX_W / 2 - 8}`}
                className="trust-edge"
                markerEnd="url(#trust-arrow)"
              />
            </g>
          );
        })}

        {/* Le cockpit, au centre */}
        <rect
          x={CX - BOX_W / 2}
          y={CY - BOX_H / 2}
          width={BOX_W}
          height={BOX_H}
          rx="3"
          className="trust-box trust-box--cockpit"
        />
        {/* Encre inversee : ces deux lignes sont posees sur le seul bloc
            sombre du schema. Sans classe dediee elles heritaient de l'encre
            ardoise, donc ardoise sur ardoise, et le titre disparaissait. Le
            controle de contraste ne l'aurait pas vu : il ne lit pas le SVG,
            seule une relecture de l'image le trouve. */}
        <text
          x={CX}
          y={CY - 4}
          textAnchor="middle"
          className="trust-box-title trust-box-title--inverse"
        >
          Adama OS
        </text>
        <text
          x={CX}
          y={CY + 16}
          textAnchor="middle"
          className="trust-box-sub trust-box-sub--inverse"
        >
          ce site
        </text>

        {/* Sortie vers le fournisseur de modele */}
        {modele ? (
          <g>
            <Boite
              x={POSITIONS.modele?.x ?? 0}
              y={POSITIONS.modele?.y ?? 0}
              titre={modele.vers}
              sous="requête"
              variante="externe"
            />
            <path
              d={`M${CX + BOX_W / 2} ${CY - 24} H ${(POSITIONS.modele?.x ?? 0) - 8}`}
              className="trust-edge"
              markerEnd="url(#trust-arrow)"
            />
          </g>
        ) : null}

        {/* LE point focal : la fleche qui n'existe pas */}
        {interdit ? (
          <g className="trust-interdit">
            <Boite
              x={POSITIONS.ecriture?.x ?? 0}
              y={POSITIONS.ecriture?.y ?? 0}
              titre={interdit.vers}
              sous="jamais d’écriture"
              variante="interdit"
            />
            <path
              d={`M${CX + BOX_W / 2} ${CY + 24} H ${(POSITIONS.ecriture?.x ?? 0) - 8}`}
              className="trust-edge trust-edge--barree"
              markerEnd="url(#trust-arrow)"
            />
            <g className="trust-croix">
              <circle
                cx={(CX + BOX_W / 2 + (POSITIONS.ecriture?.x ?? 0)) / 2}
                cy={CY + 24}
                r="13"
                className="trust-croix-fond"
              />
              <path
                d={`M${(CX + BOX_W / 2 + (POSITIONS.ecriture?.x ?? 0)) / 2 - 5} ${
                  CY + 19
                } l10 10 M${
                  (CX + BOX_W / 2 + (POSITIONS.ecriture?.x ?? 0)) / 2 + 5
                } ${CY + 19} l-10 10`}
                className="trust-croix-trait"
              />
            </g>
            {/* Le libelle passe AU-DESSUS de la fleche barree : sous elle,
                il chevauchait le cadre en pointilles. */}
            <text
              x={(CX + BOX_W / 2 + (POSITIONS.ecriture?.x ?? 0)) / 2}
              y={CY + 2}
              textAnchor="middle"
              className="trust-interdit-label"
            >
              aucune écriture, jamais
            </text>
          </g>
        ) : null}
      </svg>
      <figcaption>
        Trois sources entrent, une requête sort vers le fournisseur de modèle,
        et la flèche vers les produits du groupe est barrée. Elle n’est pas
        désactivée par une option : elle n’existe pas dans le code, et un test
        échoue si elle apparaît.
      </figcaption>
    </figure>
  );
}

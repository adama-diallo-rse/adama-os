// =====================================================================
// Les illustrations de l'accueil d'ADAMA OS, seconde passe du 7 novembre
// 2026 : les trois piliers, les cinq maillons de l'idée à l'actif, et une
// icône par branche.
//
// Même grammaire que les portes et l'offre : plan quadrillé, bandes, sceau
// latérite, pointillé pour ce qui n'est pas encore posé, trait latérite pour
// le geste. Les cinq maillons remplacent, dans la scène collante, le symbole
// seul : chaque étape montre ce qu'elle fait.
// =====================================================================

import { Grille } from "./illustrations-portes";
import type {
  CodeBranche,
  CodeMaillon,
  CodePilier,
} from "../../content/accueil";

function Texte({
  x,
  y,
  children,
  ancre = "middle",
}: {
  x: number;
  y: number;
  children: string;
  ancre?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} className="vignette-texte" textAnchor={ancre}>
      {children}
    </text>
  );
}

/** Une fenêtre de logiciel : un cadre, sa barre, et ce qu'on lui confie. */
function Fenetre({
  x,
  y,
  l,
  h,
  plein = false,
}: {
  x: number;
  y: number;
  l: number;
  h: number;
  plein?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={l}
        height={h}
        className={plein ? "vignette-fond" : "porte-contour"}
      />
      <path d={`M${x} ${y + 10}h${l}`} className="porte-ligne" />
      <circle cx={x + 6} cy={y + 5} r={1.6} className="porte-sceau" />
    </g>
  );
}

// --- 1. Les piliers ---------------------------------------------------------

const LEGENDES_PILIERS: Record<CodePilier, string> = {
  construire:
    "Trois fenêtres de logiciel superposées ; la première affiche des bandes de données et le sceau.",
  publier:
    "Trois feuilles de méthode décalées ; la première porte un titre, des lignes et le sceau d’une version.",
  accompagner:
    "Des pièces éparses à gauche, alignées pas à pas jusqu’à une bande scellée à droite.",
};

export function IllustrationPilier({ code }: { code: CodePilier }) {
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label={LEGENDES_PILIERS[code]}
      className="porte-dessin vignette vignette-pilier"
    >
      <Grille />
      {code === "construire" ? (
        <g>
          <Fenetre x={60} y={24} l={120} h={78} />
          <Fenetre x={46} y={38} l={120} h={78} />
          <Fenetre x={32} y={52} l={130} h={84} plein />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={46 + i * 24}
              y={126 - [30, 46, 38, 56][i]!}
              width={14}
              height={[30, 46, 38, 56][i]}
              className="porte-bande"
            />
          ))}
          <rect x={118} y={64} width={12} height={12} className="porte-sceau" />
          <path d="M170 92h40M190 72v40" className="porte-trait" />
          <circle cx="190" cy="92" r="14" className="porte-ligne" />
        </g>
      ) : null}
      {code === "publier" ? (
        <g>
          <rect
            x="96"
            y="22"
            width="84"
            height="112"
            className="porte-contour"
          />
          <rect
            x="82"
            y="30"
            width="84"
            height="112"
            className="vignette-fond porte-contour"
          />
          <rect
            x="66"
            y="38"
            width="88"
            height="112"
            className="vignette-fond"
          />
          <rect x="66" y="38" width="88" height="112" className="porte-ligne" />
          <rect x="78" y="52" width="48" height="10" className="porte-bande" />
          {[72, 84, 96, 108].map((y, i) => (
            <path
              key={y}
              d={`M78 ${y}h${[64, 56, 60, 40][i]}`}
              className="porte-ligne"
            />
          ))}
          <circle cx="132" cy="128" r="12" className="porte-trait" />
          <rect
            x="126"
            y="122"
            width="12"
            height="12"
            className="porte-sceau"
          />
          <Texte x={92} y={133}>
            V3
          </Texte>
        </g>
      ) : null}
      {code === "accompagner" ? (
        <g>
          {[
            [26, 40, true],
            [44, 98, true],
            [64, 62, true],
            [92, 84, false],
            [118, 80, false],
            [144, 80, false],
          ].map(([x, y, pointille], i) => (
            <rect
              key={i}
              x={x as number}
              y={y as number}
              width="18"
              height="18"
              className={pointille ? "porte-contour" : "porte-bande"}
            />
          ))}
          <path
            d="M40 58C60 90 90 92 172 89"
            className="porte-trait vignette-pointille"
          />
          <rect x="172" y="60" width="38" height="58" className="porte-bande" />
          <rect x="182" y="72" width="18" height="18" className="porte-sceau" />
          <Texte x={60} y={140}>
            AVANT
          </Texte>
          <Texte x={190} y={140}>
            APRÈS
          </Texte>
        </g>
      ) : null}
    </svg>
  );
}

// --- 2. Les cinq maillons, de l'idée à l'actif ----------------------------

const LEGENDES_MAILLONS: Record<CodeMaillon, string> = {
  idee: "Des idées en pointillé, éparses ; une seule est retenue, pleine, et porte le sceau.",
  experience:
    "Une pièce franchit la frontière du réel ; trois résultats reviennent, dont un scellé.",
  decision:
    "Une ligne se divise en trois branches : deux sont écartées, une est retenue et scellée.",
  methode:
    "Trois versions d’une même fiche, de la recherche à la preuve ; la dernière est scellée.",
  actif:
    "Une méthode scellée au centre, d’où partent un outil, une note, un parcours et un logiciel.",
};

function IllustrationMaillon({ code }: { code: CodeMaillon }) {
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label={LEGENDES_MAILLONS[code]}
      className="porte-dessin vignette vignette-maillon"
    >
      <Grille />
      {code === "idee" ? (
        <g>
          {[
            [28, 26],
            [70, 106],
            [176, 22],
            [190, 104],
            [150, 66],
            [38, 72],
            [104, 24],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="20"
              height="20"
              className="porte-contour"
              opacity={0.55 + (i % 3) * 0.15}
            />
          ))}
          <rect x="98" y="56" width="40" height="52" className="porte-bande" />
          <rect x="109" y="68" width="18" height="18" className="porte-sceau" />
          <path d="M60 82 96 82M150 76 140 80" className="porte-trait" />
        </g>
      ) : null}
      {code === "experience" ? (
        <g>
          <path d="M134 18v124" className="porte-frontiere" />
          <rect x="34" y="50" width="44" height="60" className="porte-bande" />
          <path d="M80 80h84" className="porte-trait" />
          <path d="M156 72l10 8-10 8" className="porte-trait" />
          <rect x="182" y="34" width="18" height="18" className="porte-sceau" />
          <rect x="182" y="70" width="18" height="18" className="porte-bande" />
          <rect
            x="182"
            y="106"
            width="18"
            height="18"
            className="porte-contour"
          />
          <path d="M184 112l14 8M198 112l-14 8" className="porte-ligne" />
          <Texte x={56} y={136}>
            PROTOCOLE
          </Texte>
          <Texte x={191} y={146}>
            LE RÉEL
          </Texte>
        </g>
      ) : null}
      {code === "decision" ? (
        <g>
          <path d="M24 80h70" className="porte-trait" />
          <path d="M94 80C120 80 124 34 158 34" className="porte-ligne" />
          <path d="M94 80h64" className="porte-trait" />
          <path d="M94 80C120 80 124 126 158 126" className="porte-ligne" />
          <rect
            x="158"
            y="24"
            width="20"
            height="20"
            className="porte-contour"
          />
          <path d="M160 26l16 16M176 26l-16 16" className="porte-ligne" />
          <rect
            x="158"
            y="116"
            width="20"
            height="20"
            className="porte-contour"
          />
          <path d="M160 118l16 16M176 118l-16 16" className="porte-ligne" />
          <rect x="158" y="62" width="40" height="36" className="porte-bande" />
          <rect x="169" y="71" width="18" height="18" className="porte-sceau" />
          <circle cx="94" cy="80" r="5" className="porte-sceau" />
          <Texte x={212} y={38} ancre="end">
            ÉCARTÉ
          </Texte>
          <Texte x={212} y={112} ancre="end">
            RETENU
          </Texte>
        </g>
      ) : null}
      {code === "methode" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={30 + i * 64}
                y={36 + (2 - i) * 6}
                width="52"
                height="76"
                className={i === 2 ? "vignette-fond" : "porte-contour"}
              />
              <rect
                x={30 + i * 64}
                y={36 + (2 - i) * 6}
                width="52"
                height="76"
                className="porte-ligne"
              />
              <rect
                x={38 + i * 64}
                y={46 + (2 - i) * 6}
                width="28"
                height="7"
                className="porte-bande"
                opacity={0.4 + i * 0.3}
              />
              {[60, 70, 80].map((y) => (
                <path
                  key={y}
                  d={`M${38 + i * 64} ${y + (2 - i) * 6}h${36 - (y - 60) / 2}`}
                  className="porte-ligne"
                />
              ))}
            </g>
          ))}
          <rect x="166" y="96" width="14" height="14" className="porte-sceau" />
          <path d="M84 74h8M148 74h8" className="porte-trait" />
          <Texte x={56} y={134}>
            RECHERCHE
          </Texte>
          <Texte x={120} y={134}>
            TESTÉ
          </Texte>
          <Texte x={184} y={134}>
            PROUVÉ
          </Texte>
        </g>
      ) : null}
      {code === "actif" ? (
        <g>
          <path
            d="M120 80 L48 38M120 80 L192 38M120 80 L48 122M120 80 L192 122"
            className="porte-ligne"
          />
          <rect x="98" y="58" width="44" height="44" className="porte-bande" />
          <rect x="111" y="71" width="18" height="18" className="porte-sceau" />
          {[
            [30, 24, "OUTIL"],
            [174, 24, "NOTE"],
            [30, 108, "PARCOURS"],
            [174, 108, "LOGICIEL"],
          ].map(([x, y, t]) => (
            <g key={t as string}>
              <rect
                x={x as number}
                y={y as number}
                width="36"
                height="28"
                className="vignette-fond porte-contour"
              />
              <Texte x={(x as number) + 18} y={(y as number) + 46}>
                {t as string}
              </Texte>
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}

/**
 * La scène collante de la chaîne : les cinq maillons superposés, un seul
 * visible à la fois selon `data-acte-actif`, posé par les scènes de
 * mouvement. Sans script, le premier reste affiché.
 */
export function SceneMaillons({ codes }: { codes: readonly CodeMaillon[] }) {
  return (
    <div className="scene-maillons">
      {codes.map((c, i) => (
        <div key={c} className="scene-maillon" data-scene-maillon={i}>
          <IllustrationMaillon code={c} />
        </div>
      ))}
    </div>
  );
}

// --- 3. Une icône par branche ----------------------------------------------

export function IconeBranche({ code }: { code: CodeBranche }) {
  return (
    <svg viewBox="0 0 72 56" className="icone-branche" aria-hidden="true">
      {code === "open" ? (
        <g>
          <path
            d="M22 26v-8a14 14 0 0 1 27-5"
            className="porte-ligne vignette-epais"
          />
          <rect x="16" y="26" width="40" height="24" className="porte-bande" />
          <rect x="31" y="32" width="10" height="10" className="porte-sceau" />
        </g>
      ) : null}
      {code === "press" ? (
        <g>
          <path
            d="M36 12C28 8 16 8 8 12v36c8-4 20-4 28 0"
            className="porte-ligne vignette-epais"
          />
          <path
            d="M36 12c8-4 20-4 28 0v36c-8-4-20-4-28 0z"
            className="porte-bande"
          />
          <path d="M14 22h16M14 30h14M14 38h16" className="porte-ligne" />
          <rect x="45" y="22" width="10" height="10" className="porte-sceau" />
        </g>
      ) : null}
      {code === "forge" ? (
        <g>
          <rect x="8" y="28" width="18" height="18" className="porte-bande" />
          <rect x="27" y="28" width="18" height="18" className="porte-bande" />
          <rect
            x="46"
            y="28"
            width="18"
            height="18"
            className="porte-contour"
          />
          <rect x="17" y="9" width="18" height="18" className="porte-bande" />
          <rect x="37" y="9" width="18" height="18" className="porte-sceau" />
        </g>
      ) : null}
      {code === "atelier" ? (
        <g>
          <path
            d="M6 48h12V38h12V28h12V18h12V8h12"
            className="porte-ligne vignette-epais"
          />
          <rect x="56" y="10" width="10" height="10" className="porte-sceau" />
          <path d="M6 48h60" className="porte-ligne" />
        </g>
      ) : null}
      {code === "conseil" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={6 + i * 14}
              y={30}
              width="10"
              height="18"
              className="porte-bande"
              opacity={0.5}
            />
          ))}
          <circle
            cx="40"
            cy="24"
            r="14"
            className="porte-ligne vignette-epais"
          />
          <path d="M50 34l12 12" className="porte-trait vignette-manche" />
          <rect x="35" y="19" width="10" height="10" className="porte-sceau" />
        </g>
      ) : null}
      {code === "signal" ? (
        <g>
          <rect x="10" y="22" width="12" height="12" className="porte-sceau" />
          <path
            d="M28 16a16 16 0 0 1 0 24M36 10a24 24 0 0 1 0 36M44 4a32 32 0 0 1 0 48"
            className="porte-ligne vignette-epais"
          />
        </g>
      ) : null}
    </svg>
  );
}

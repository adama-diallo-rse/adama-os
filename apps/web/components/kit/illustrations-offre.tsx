// =====================================================================
// Les illustrations de l'offre d'accompagnement (7 novembre 2026).
//
// Même grammaire que le symbole et les quatre portes : des bandes, un plan
// quadrillé, un sceau latérite, des pointillés pour ce qui n'est pas encore
// posé. Chaque dessin montre l'objet dont il parle, sans personnage ni
// métaphore décorative :
//
//   - la carte, où le Sénégal porte la latérite, la terre rouge qui a
//     donné son accent à la charte, reliée à Paris par la ligne de travail ;
//   - la scène isométrique, des idées éparses au système qui tient, avec
//     le baobab, l'arbre qui dure, planté sur le plateau d'arrivée ;
//   - une vignette par semaine, par situation et par formule.
//
// Tout est du SVG rendu côté serveur : rien ne se télécharge en plus, tout
// reste net à toutes les tailles et suit le mode clair ou sombre.
// =====================================================================

import { CARTE } from "./carte-donnees";
import { Grille } from "./illustrations-portes";
import { PaveIso, PlateauIso, projection } from "./isometrie";

// --- 1. La carte, de Dakar à Paris --------------------------------------

export function CarteParisDakar({ titre }: { titre: string }) {
  const [dx, dy] = CARTE.dakar;
  const [px, py] = CARTE.paris;
  // La ligne de travail part de Dakar, longe l'Atlantique et rejoint Paris.
  const arc = `M${dx} ${dy} C${dx - 34} ${dy - 120} ${px - 150} ${py + 40} ${px} ${py}`;
  return (
    <svg
      className="carte"
      viewBox={`0 0 ${CARTE.largeur} ${CARTE.hauteur}`}
      role="img"
      aria-label={titre}
    >
      <defs>
        <pattern
          id="carte-trame"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1.5" cy="1.5" r="0.9" className="carte-trame-point" />
        </pattern>
      </defs>
      <g className="carte-voisins">
        {CARTE.voisins.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="carte-afrique">
        {CARTE.afrique.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <path d={CARTE.france} className="carte-france" />
      <path d={CARTE.senegal} className="carte-senegal" />
      <path
        d={CARTE.senegal}
        className="carte-senegal-trame"
        fill="url(#carte-trame)"
      />

      <path d={arc} className="carte-arc" pathLength={1} />
      <path d={arc} className="carte-arc-flux" />

      <g className="carte-ville carte-ville--dakar">
        <circle cx={dx} cy={dy} r={14} className="carte-onde" />
        <circle cx={dx} cy={dy} r={5} className="carte-point" />
      </g>
      <g className="carte-ville">
        <circle
          cx={px}
          cy={py}
          r={5}
          className="carte-point carte-point--paris"
        />
      </g>

      <g className="carte-etiquette">
        <path d={`M${dx} ${dy + 8}v30h30`} className="carte-filet" />
        <rect
          x={dx + 32}
          y={dy + 24}
          width={98}
          height={30}
          rx={4}
          className="carte-cartouche"
        />
        <text x={dx + 40} y={dy + 37}>
          DAKAR
        </text>
        <text x={dx + 40} y={dy + 48} className="carte-sous">
          14°41′ N · SÉNÉGAL
        </text>
      </g>
      <g className="carte-etiquette">
        <path d={`M${px + 8} ${py}h26v-10`} className="carte-filet" />
        <rect
          x={px + 36}
          y={py - 28}
          width={96}
          height={30}
          rx={4}
          className="carte-cartouche"
        />
        <text x={px + 44} y={py - 15}>
          PARIS
        </text>
        <text x={px + 44} y={py - 4} className="carte-sous">
          48°51′ N · FRANCE
        </text>
      </g>
      <text x={dx + 10} y={150} className="carte-distance">
        4 200 KM
      </text>
    </svg>
  );
}

// --- 2. La scène isométrique, des idées au système ----------------------

const PR = projection(19, 282, 30);

/**
 * Le baobab, en silhouette, planté sur le plan : un tronc massif presque
 * aussi large que haut, des bras épais qui se divisent, et une couronne
 * plate et rare, posée comme un toit.
 */
function Baobab({ x, y, z }: { x: number; y: number; z: number }) {
  const { x: tx, y: ty } = PR.p(x, y, z);
  const tronc = `M${tx - 22} ${ty}
    C${tx - 26} ${ty - 16} ${tx - 24} ${ty - 34} ${tx - 17} ${ty - 50}
    L${tx - 12} ${ty - 58} L${tx + 12} ${ty - 58} L${tx + 17} ${ty - 50}
    C${tx + 24} ${ty - 34} ${tx + 26} ${ty - 16} ${tx + 22} ${ty} Z`;
  // Bras maîtres (épais) puis rameaux (fins), tous partis du sommet.
  const bras = [
    {
      d: `M${tx - 8} ${ty - 56} C${tx - 18} ${ty - 66} ${tx - 30} ${ty - 72} ${tx - 44} ${ty - 78}`,
      e: 7,
    },
    {
      d: `M${tx - 2} ${ty - 57} C${tx - 6} ${ty - 70} ${tx - 12} ${ty - 80} ${tx - 18} ${ty - 90}`,
      e: 6,
    },
    {
      d: `M${tx + 3} ${ty - 57} C${tx + 7} ${ty - 70} ${tx + 12} ${ty - 82} ${tx + 16} ${ty - 92}`,
      e: 6,
    },
    {
      d: `M${tx + 8} ${ty - 56} C${tx + 20} ${ty - 64} ${tx + 32} ${ty - 70} ${tx + 46} ${ty - 76}`,
      e: 7,
    },
    {
      d: `M${tx - 30} ${ty - 72} C${tx - 36} ${ty - 82} ${tx - 40} ${ty - 88} ${tx - 42} ${ty - 94}`,
      e: 3,
    },
    {
      d: `M${tx + 30} ${ty - 70} C${tx + 34} ${ty - 80} ${tx + 38} ${ty - 86} ${tx + 40} ${ty - 92}`,
      e: 3,
    },
    { d: `M${tx - 44} ${ty - 78} L${tx - 56} ${ty - 80}`, e: 3 },
    { d: `M${tx + 46} ${ty - 76} L${tx + 58} ${ty - 76}`, e: 3 },
  ];
  const couronne: [number, number, number, number][] = [
    [-58, -84, 12, 6],
    [-44, -98, 13, 7],
    [-26, -96, 12, 7],
    [-16, -104, 13, 7],
    [0, -100, 14, 8],
    [16, -106, 13, 7],
    [30, -98, 12, 7],
    [42, -96, 13, 7],
    [58, -82, 12, 6],
  ];
  return (
    <g className="baobab">
      <ellipse cx={tx} cy={ty + 1} rx={34} ry={8} className="baobab-ombre" />
      {couronne.map(([cx, cy, rx, ry], i) => (
        <ellipse
          key={i}
          cx={tx + cx}
          cy={ty + cy}
          rx={rx}
          ry={ry}
          className="baobab-feuillage"
        />
      ))}
      {bras.map((b, i) => (
        <path key={i} d={b.d} className="baobab-bras" strokeWidth={b.e} />
      ))}
      <path d={tronc} className="baobab-tronc" />
      <path
        d={`M${tx - 10} ${ty - 4}c-4-14 -4-28 1-42M${tx + 10} ${ty - 4}c4-14 4-28 -1-42`}
        className="baobab-ecorce"
      />
    </g>
  );
}

export function SceneTransformation({ titre }: { titre: string }) {
  // Les idées : des pièces éparses, certaines à peine envisagées.
  const idees: {
    x: number;
    y: number;
    z: number;
    c: number;
    pointille?: boolean;
  }[] = [
    { x: 0.6, y: 8.0, z: 0.3, c: 1.1 },
    { x: 2.6, y: 7.4, z: 1.6, c: 0.9, pointille: true },
    { x: 1.4, y: 10.4, z: 0.9, c: 1, pointille: true },
    { x: 3.4, y: 10.0, z: 0.3, c: 1.2 },
    { x: 0.4, y: 11.4, z: 2.2, c: 0.8, pointille: true },
    { x: 3.6, y: 8.6, z: 2.6, c: 0.7, pointille: true },
  ];
  const depart = PR.p(2.6, 9.2, 3.2);
  const arrivee = PR.p(9.0, 2.4, 4.4);
  const ctrl = {
    x: (depart.x + arrivee.x) / 2,
    y: Math.min(depart.y, arrivee.y) - 86,
  };
  const courbe = `M${depart.x.toFixed(1)} ${depart.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${arrivee.x.toFixed(1)} ${arrivee.y.toFixed(1)}`;
  // Les six semaines, posées sur la courbe (Bézier quadratique).
  const surCourbe = (t: number) => ({
    x: (1 - t) ** 2 * depart.x + 2 * (1 - t) * t * ctrl.x + t ** 2 * arrivee.x,
    y: (1 - t) ** 2 * depart.y + 2 * (1 - t) * t * ctrl.y + t ** 2 * arrivee.y,
  });
  const etiquetteA = PR.p(3.0, 13.4, 0);
  const etiquetteB = PR.p(13.2, 4.8, 0);
  return (
    <svg
      className="scene-iso scene-transformation"
      viewBox="0 6 560 244"
      role="img"
      aria-label={titre}
    >
      <g data-flotte="0.12">
        <PlateauIso pr={PR} x={0} y={7} l={5} p={6} />
        <PlateauIso pr={PR} x={7} y={0} l={7} p={6} />
      </g>

      <g data-flotte="0.6" className="scene-idees">
        {idees.map((c, i) => (
          <PaveIso
            key={i}
            pr={PR}
            x={c.x}
            y={c.y}
            z={c.z}
            l={c.c}
            p={c.c}
            h={c.c}
            pointille={c.pointille}
          />
        ))}
      </g>

      <g data-flotte="0.3">
        <path d={courbe} className="iso-pointille scene-chemin" />
        {[0.12, 0.27, 0.42, 0.57, 0.72, 0.87].map((t, i) => {
          const q = surCourbe(t);
          return (
            <g key={t}>
              <circle cx={q.x} cy={q.y} r={9} className="scene-etape" />
              <text
                x={q.x}
                y={q.y + 3.5}
                textAnchor="middle"
                className="scene-etape-numero"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        <text
          x={ctrl.x}
          y={ctrl.y + 20}
          textAnchor="middle"
          className="iso-texte"
        >
          SIX SEMAINES
        </text>
      </g>

      <g data-flotte="0.45">
        <PaveIso pr={PR} x={8} y={1} z={0.3} l={3.2} p={3.2} h={0.6} />
        <PaveIso
          pr={PR}
          x={8}
          y={1}
          z={1.1}
          l={3.2}
          p={3.2}
          h={0.6}
          dessus="iso-face-creuse"
        />
        <PaveIso
          pr={PR}
          x={8}
          y={1}
          z={1.9}
          l={3.2}
          p={3.2}
          h={0.6}
          dessus="iso-face-sombre"
        />
        <PaveIso
          pr={PR}
          x={9.1}
          y={2.1}
          z={2.5}
          l={1}
          p={1}
          h={0.5}
          dessus="iso-accent"
          flanc="iso-face-sombre"
        />
        {/* Le tableau de pilotage, posé à plat. */}
        <PaveIso pr={PR} x={8.4} y={4.6} z={0.3} l={2.6} p={1.1} h={0.15} />
        {[0, 1, 2].map((i) => (
          <polyline
            key={i}
            points={`${PR.s(8.7 + i * 0.8, 4.8, 0.46)} ${PR.s(8.7 + i * 0.8, 5.5, 0.46)}`}
            className="iso-ligne scene-tableau"
          />
        ))}
      </g>

      <g data-flotte="0.25">
        <Baobab x={12.6} y={1.4} z={0.3} />
      </g>

      <text
        x={etiquetteA.x}
        y={etiquetteA.y + 22}
        className="iso-texte"
        textAnchor="middle"
      >
        VOS IDÉES
      </text>
      <text
        x={etiquetteB.x}
        y={etiquetteB.y + 30}
        className="iso-texte"
        textAnchor="middle"
      >
        UN SYSTÈME QUI TIENT
      </text>
    </svg>
  );
}

// --- 3. Une vignette par semaine ----------------------------------------

const LEGENDES_SEMAINES = [
  "Des idées éparses en pointillé ; une seule est retenue et scellée.",
  "Une cible : le premier utilisateur, au centre, atteint par une ligne droite.",
  "Trois colonnes, maintenant, ensuite, plus tard, de plus en plus légères.",
  "Un tableau de pilotage : des tâches en colonnes et la boucle de la semaine.",
  "Une pièce franchit la frontière du réel et rapporte trois résultats.",
  "Avant en pointillé, après en plein : le chemin parcouru se mesure.",
];

function Etiquette({
  x,
  y,
  children,
}: {
  x: number;
  y: number;
  children: string;
}) {
  return (
    <text x={x} y={y} className="vignette-texte" textAnchor="middle">
      {children}
    </text>
  );
}

export function IllustrationSemaine({ numero }: { numero: number }) {
  const n = Math.min(6, Math.max(1, Math.round(numero)));
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label={LEGENDES_SEMAINES[n - 1]}
      className="porte-dessin vignette"
    >
      <Grille />
      {n === 1 ? (
        <g>
          {[
            [34, 30],
            [178, 26],
            [40, 106],
            [180, 104],
            [150, 66],
            [70, 64],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={22}
              height={22}
              className="porte-contour"
            />
          ))}
          <rect x="101" y="46" width="38" height="68" className="porte-bande" />
          <rect x="111" y="58" width="18" height="18" className="porte-sceau" />
          <path
            d="M56 41 98 64M178 37 142 60"
            className="porte-ligne"
            opacity={0.5}
          />
        </g>
      ) : null}
      {n === 2 ? (
        <g>
          <circle cx="152" cy="80" r="52" className="porte-ligne" />
          <circle cx="152" cy="80" r="34" className="porte-ligne" />
          <circle cx="152" cy="80" r="17" className="porte-ligne" />
          <circle cx="152" cy="80" r="8" className="porte-sceau" />
          <path d="M26 80h112" className="porte-trait" />
          <path d="M128 72l10 8-10 8" className="porte-trait" />
          <rect x="26" y="58" width="22" height="44" className="porte-bande" />
        </g>
      ) : null}
      {n === 3 ? (
        <g>
          <path d="M24 132h192" className="porte-ligne" />
          {[0, 1, 2].map((i) => (
            <rect
              key={`a${i}`}
              x="34"
              y={110 - i * 24}
              width="50"
              height="18"
              className="porte-bande"
            />
          ))}
          <rect x="52" y="64" width="14" height="14" className="porte-sceau" />
          {[0, 1].map((i) => (
            <rect
              key={`b${i}`}
              x="96"
              y={110 - i * 24}
              width="50"
              height="18"
              className="porte-bande vignette-attenue"
            />
          ))}
          <rect
            x="158"
            y="110"
            width="50"
            height="18"
            className="porte-contour"
          />
          <Etiquette x={59} y={30}>
            MAINTENANT
          </Etiquette>
          <Etiquette x={121} y={30}>
            ENSUITE
          </Etiquette>
          <Etiquette x={183} y={30}>
            PLUS TARD
          </Etiquette>
        </g>
      ) : null}
      {n === 4 ? (
        <g>
          {[0, 1, 2].map((col) => (
            <g key={col}>
              <path d={`M${30 + col * 52} 34h40`} className="porte-ligne" />
              {Array.from({ length: 3 - col }, (_, r) => (
                <rect
                  key={r}
                  x={30 + col * 52}
                  y={44 + r * 26}
                  width="40"
                  height="18"
                  className={col === 2 ? "porte-contour" : "porte-bande"}
                />
              ))}
            </g>
          ))}
          <rect x="36" y="48" width="10" height="10" className="porte-sceau" />
          <circle
            cx="196"
            cy="80"
            r="22"
            className="porte-trait vignette-boucle"
          />
          <path d="M210 58l8 4-6 7" className="porte-trait" />
          <Etiquette x={196} y={124}>
            CHAQUE SEMAINE
          </Etiquette>
        </g>
      ) : null}
      {n === 5 ? (
        <g>
          <path d="M132 22v116" className="porte-frontiere" />
          <rect x="40" y="52" width="42" height="56" className="porte-bande" />
          <path d="M86 80h86" className="porte-trait" />
          <path d="M164 72l10 8-10 8" className="porte-trait" />
          <rect x="186" y="40" width="16" height="16" className="porte-sceau" />
          <rect x="186" y="72" width="16" height="16" className="porte-bande" />
          <rect
            x="186"
            y="104"
            width="16"
            height="16"
            className="porte-contour"
          />
          <Etiquette x={84} y={140}>
            VOTRE PROJET
          </Etiquette>
          <Etiquette x={186} y={140}>
            LE RÉEL
          </Etiquette>
        </g>
      ) : null}
      {n === 6 ? (
        <g>
          <path d="M24 130h192" className="porte-ligne" />
          {[30, 44, 24].map((h, i) => (
            <rect
              key={`av${i}`}
              x={36 + i * 26}
              y={130 - h}
              width="18"
              height={h}
              className="porte-contour"
            />
          ))}
          {[62, 88, 74].map((h, i) => (
            <rect
              key={`ap${i}`}
              x={136 + i * 26}
              y={130 - h}
              width="18"
              height={h}
              className="porte-bande"
            />
          ))}
          <rect x="160" y="28" width="18" height="18" className="porte-sceau" />
          <path d="M72 70 C100 40 116 40 132 46" className="porte-trait" />
          <path d="M124 40l9 6-9 6" className="porte-trait" />
          <Etiquette x={71} y={146}>
            AVANT
          </Etiquette>
          <Etiquette x={171} y={146}>
            APRÈS
          </Etiquette>
        </g>
      ) : null}
    </svg>
  );
}

// --- 4. Une icône par situation -----------------------------------------

export function IconeSituation({ code }: { code: string }) {
  return (
    <svg viewBox="0 0 72 56" className="icone-situation" aria-hidden="true">
      {code === "idees" ? (
        <g>
          <rect x="6" y="8" width="12" height="12" className="porte-contour" />
          <rect x="30" y="4" width="12" height="12" className="porte-contour" />
          <rect
            x="52"
            y="14"
            width="12"
            height="12"
            className="porte-contour"
          />
          <rect
            x="12"
            y="34"
            width="12"
            height="12"
            className="porte-contour"
          />
          <rect
            x="44"
            y="36"
            width="12"
            height="12"
            className="porte-contour"
          />
          <rect x="30" y="24" width="10" height="10" className="porte-sceau" />
        </g>
      ) : null}
      {code === "urgences" ? (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x={6 + i * 16}
                y="18"
                width="10"
                height="32"
                className="porte-bande"
              />
              <rect
                x={6 + i * 16}
                y="6"
                width="10"
                height="8"
                className="porte-sceau"
              />
            </g>
          ))}
        </g>
      ) : null}
      {code === "organisation" ? (
        <g>
          <path
            d="M4 10C30 10 18 46 40 30S36 6 52 20M4 30C22 46 34 2 52 28M4 46C26 40 28 18 52 36"
            className="porte-ligne"
          />
          <rect x="52" y="14" width="16" height="28" className="porte-bande" />
          <rect x="56" y="22" width="8" height="8" className="porte-sceau" />
        </g>
      ) : null}
    </svg>
  );
}

// --- 5. Une vignette par formule ---------------------------------------

const LEGENDES_FORMULES: Record<string, string> = {
  accompagnement: "Six cases qui se remplissent, la dernière scellée.",
  diagnostic: "Une loupe posée sur le plan, qui isole le point décisif.",
  sprint: "Une seule pièce, lancée en avant.",
  outils: "Trois blocs reliés en boucle : la tâche répétitive tourne seule.",
};

export function IllustrationFormule({ code }: { code: string }) {
  return (
    <svg
      viewBox="0 0 240 96"
      role="img"
      aria-label={LEGENDES_FORMULES[code] ?? ""}
      className="vignette-formule"
    >
      {code === "accompagnement" ? (
        <g>
          <path d="M20 48h200" className="porte-ligne" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={20 + i * 34}
              y={36}
              width="24"
              height="24"
              className={i < 5 ? "porte-bande" : "porte-contour"}
              opacity={i < 5 ? 0.35 + i * 0.13 : 1}
            />
          ))}
          <rect x="196" y="42" width="12" height="12" className="porte-sceau" />
        </g>
      ) : null}
      {code === "diagnostic" ? (
        <g>
          <g opacity={0.35}>
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M${24 + i * 24} 10v76`}
                className="porte-grille"
              />
            ))}
          </g>
          <circle
            cx="110"
            cy="44"
            r="26"
            className="porte-ligne vignette-loupe"
          />
          <path d="M129 63l22 20" className="porte-trait vignette-manche" />
          <rect x="102" y="36" width="16" height="16" className="porte-sceau" />
        </g>
      ) : null}
      {code === "sprint" ? (
        <g>
          <rect x="116" y="28" width="48" height="40" className="porte-bande" />
          <path d="M36 36h50M24 48h62M44 60h42" className="porte-ligne" />
          <path
            d="M176 32l14 16-14 16M196 32l14 16-14 16"
            className="porte-trait"
          />
        </g>
      ) : null}
      {code === "outils" ? (
        <g>
          <rect x="36" y="30" width="36" height="36" className="porte-bande" />
          <rect x="102" y="30" width="36" height="36" className="porte-bande" />
          <rect
            x="168"
            y="30"
            width="36"
            height="36"
            className="porte-contour"
          />
          <rect x="179" y="41" width="14" height="14" className="porte-sceau" />
          <path d="M72 48h30M138 48h30" className="porte-trait" />
          <path d="M186 74C186 92 54 92 54 74" className="porte-ligne" />
          <path d="M48 80l6-8 6 8" className="porte-ligne" />
        </g>
      ) : null}
    </svg>
  );
}

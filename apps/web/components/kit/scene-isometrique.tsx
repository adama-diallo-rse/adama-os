// =====================================================================
// La scène isométrique d'ADAMA OS (refonte du 30 octobre 2026).
//
// Dessinée en SVG, sans image : un plateau gradué, trois strates de
// données empilées, un registre ouvert, le sceau latérite, et deux repères,
// Dakar et Paris, reliés par la ligne de provenance. Chaque pièce porte
// `data-flotte` : sur grand écran, elle flotte à sa propre vitesse au
// défilement. Sans script, la scène est simplement posée.
//
// La projection est calculée ici, une fois, au rendu serveur : aucune
// coordonnée n'est recopiée à la main.
// =====================================================================

const U = 22; // une unité de plan, en pixels
const OX = 250;
const OY = 92;
const COS = Math.cos(Math.PI / 6);

function iso(x: number, y: number, z = 0): string {
  const px = OX + (x - y) * COS * U;
  const py = OY + (x + y) * 0.5 * U - z * U;
  return `${px.toFixed(1)},${py.toFixed(1)}`;
}

function point(x: number, y: number, z = 0) {
  return {
    x: OX + (x - y) * COS * U,
    y: OY + (x + y) * 0.5 * U - z * U,
  };
}

/** Les trois faces visibles d'un pavé : dessus, flanc gauche, flanc droit. */
function Pave({
  x,
  y,
  z,
  l,
  p,
  h,
  dessus = "iso-face-claire",
  flanc = "iso-face-creuse",
}: {
  x: number;
  y: number;
  z: number;
  l: number;
  p: number;
  h: number;
  dessus?: string;
  flanc?: string;
}) {
  const haut = [
    iso(x, y, z + h),
    iso(x + l, y, z + h),
    iso(x + l, y + p, z + h),
    iso(x, y + p, z + h),
  ];
  const gauche = [
    iso(x, y + p, z + h),
    iso(x + l, y + p, z + h),
    iso(x + l, y + p, z),
    iso(x, y + p, z),
  ];
  const droite = [
    iso(x + l, y, z + h),
    iso(x + l, y + p, z + h),
    iso(x + l, y + p, z),
    iso(x + l, y, z),
  ];
  return (
    <g>
      <polygon points={gauche.join(" ")} className={`${flanc} iso-ligne`} />
      <polygon points={droite.join(" ")} className={`${flanc} iso-ligne`} />
      <polygon points={haut.join(" ")} className={`${dessus} iso-ligne`} />
    </g>
  );
}

export function SceneIsometrique({ titre }: { titre: string }) {
  const dakar = point(2.2, 7.6, 0.3);
  const paris = point(7.4, 2.4, 0.3);
  const milieu = {
    x: (dakar.x + paris.x) / 2,
    y: Math.min(dakar.y, paris.y) - 70,
  };
  return (
    <svg
      className="scene-iso"
      viewBox="0 0 500 360"
      role="img"
      aria-label={titre}
    >
      {/* Le plateau gradué. */}
      <g data-flotte="0.15">
        <Pave x={0} y={0} z={0} l={10} p={10} h={0.3} />
        {Array.from({ length: 9 }, (_, i) => (
          <polyline
            key={`gx${i}`}
            points={`${iso(i + 1, 0, 0.3)} ${iso(i + 1, 10, 0.3)}`}
            className="iso-ligne"
            opacity={0.18}
          />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <polyline
            key={`gy${i}`}
            points={`${iso(0, i + 1, 0.3)} ${iso(10, i + 1, 0.3)}`}
            className="iso-ligne"
            opacity={0.18}
          />
        ))}
      </g>

      {/* Les trois strates de données, empilées avec un jour. */}
      <g data-flotte="0.55">
        <Pave x={0.8} y={0.8} z={0.6} l={3.4} p={3.4} h={0.45} />
        <Pave
          x={0.8}
          y={0.8}
          z={1.35}
          l={3.4}
          p={3.4}
          h={0.45}
          dessus="iso-face-creuse"
        />
        <Pave
          x={0.8}
          y={0.8}
          z={2.1}
          l={3.4}
          p={3.4}
          h={0.45}
          dessus="iso-face-sombre"
        />
      </g>

      {/* Le registre ouvert : deux pages et leurs lignes. */}
      <g data-flotte="0.35">
        <Pave x={5.6} y={5.2} z={0.3} l={3.2} p={2.4} h={0.35} />
        {[0.5, 1, 1.5, 2].map((d) => (
          <polyline
            key={d}
            points={`${iso(5.9, 5.2 + d, 0.65)} ${iso(8.4, 5.2 + d, 0.65)}`}
            className="iso-ligne"
            opacity={0.45}
          />
        ))}
      </g>

      {/* Le sceau latérite, posé au-dessus du registre. */}
      <g data-flotte="0.9">
        <Pave
          x={6.6}
          y={2.6}
          z={1.4}
          l={1.2}
          p={1.2}
          h={0.5}
          dessus="iso-accent"
          flanc="iso-face-sombre"
        />
      </g>

      {/* Dakar et Paris, reliés par la ligne de provenance. */}
      <g data-flotte="0.25">
        <path
          d={`M${dakar.x.toFixed(1)} ${dakar.y.toFixed(1)} Q${milieu.x.toFixed(1)} ${milieu.y.toFixed(1)} ${paris.x.toFixed(1)} ${paris.y.toFixed(1)}`}
          className="iso-pointille"
        />
        <circle cx={dakar.x} cy={dakar.y} r={4.5} className="iso-accent" />
        <circle cx={paris.x} cy={paris.y} r={4.5} className="iso-accent" />
        <text x={dakar.x - 40} y={dakar.y + 22} className="iso-texte">
          DAKAR
        </text>
        <text x={paris.x + 10} y={paris.y - 10} className="iso-texte">
          PARIS
        </text>
      </g>
    </svg>
  );
}

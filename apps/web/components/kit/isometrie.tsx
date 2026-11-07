// =====================================================================
// La projection isométrique du kit, réutilisable (7 novembre 2026).
//
// Même géométrie que la scène isométrique de 2026 (30 degrés, une unité de
// plan carrée), mais l'origine et l'unité sont des paramètres : une scène
// nouvelle ne recopie aucune coordonnée à la main, elle déclare sa
// projection et pose ses pavés dans les unités du plan.
// =====================================================================

const COS = Math.cos(Math.PI / 6);

type Projection = {
  /** Point projeté, en coordonnées SVG. */
  p: (x: number, y: number, z?: number) => { x: number; y: number };
  /** Le même point, écrit pour un attribut `points`. */
  s: (x: number, y: number, z?: number) => string;
};

export function projection(unite: number, ox: number, oy: number): Projection {
  const p = (x: number, y: number, z = 0) => ({
    x: ox + (x - y) * COS * unite,
    y: oy + (x + y) * 0.5 * unite - z * unite,
  });
  const s = (x: number, y: number, z = 0) => {
    const q = p(x, y, z);
    return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  };
  return { p, s };
}

/** Les trois faces visibles d'un pavé : dessus, flanc gauche, flanc droit. */
export function PaveIso({
  pr,
  x,
  y,
  z,
  l,
  p,
  h,
  dessus = "iso-face-claire",
  flanc = "iso-face-creuse",
  pointille = false,
}: {
  pr: Projection;
  x: number;
  y: number;
  z: number;
  l: number;
  p: number;
  h: number;
  dessus?: string;
  flanc?: string;
  /** Contour en pointillé : une pièce envisagée, pas encore posée. */
  pointille?: boolean;
}) {
  const ligne = pointille ? "iso-ligne iso-ligne-pointillee" : "iso-ligne";
  const haut = [
    pr.s(x, y, z + h),
    pr.s(x + l, y, z + h),
    pr.s(x + l, y + p, z + h),
    pr.s(x, y + p, z + h),
  ];
  const gauche = [
    pr.s(x, y + p, z + h),
    pr.s(x + l, y + p, z + h),
    pr.s(x + l, y + p, z),
    pr.s(x, y + p, z),
  ];
  const droite = [
    pr.s(x + l, y, z + h),
    pr.s(x + l, y + p, z + h),
    pr.s(x + l, y + p, z),
    pr.s(x + l, y, z),
  ];
  return (
    <g>
      <polygon points={gauche.join(" ")} className={`${flanc} ${ligne}`} />
      <polygon points={droite.join(" ")} className={`${flanc} ${ligne}`} />
      <polygon points={haut.join(" ")} className={`${dessus} ${ligne}`} />
    </g>
  );
}

/** Le plateau gradué sur lequel une scène se pose. */
export function PlateauIso({
  pr,
  x,
  y,
  l,
  p,
}: {
  pr: Projection;
  x: number;
  y: number;
  l: number;
  p: number;
}) {
  return (
    <g>
      <PaveIso pr={pr} x={x} y={y} z={0} l={l} p={p} h={0.3} />
      {Array.from({ length: Math.max(0, l - 1) }, (_, i) => (
        <polyline
          key={`gx${i}`}
          points={`${pr.s(x + i + 1, y, 0.3)} ${pr.s(x + i + 1, y + p, 0.3)}`}
          className="iso-ligne"
          opacity={0.18}
        />
      ))}
      {Array.from({ length: Math.max(0, p - 1) }, (_, i) => (
        <polyline
          key={`gy${i}`}
          points={`${pr.s(x, y + i + 1, 0.3)} ${pr.s(x + l, y + i + 1, 0.3)}`}
          className="iso-ligne"
          opacity={0.18}
        />
      ))}
    </g>
  );
}

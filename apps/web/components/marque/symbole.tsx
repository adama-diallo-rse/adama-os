// =====================================================================
// Le symbole d'ADAMA OS, « Le Tissage » (révision du 30 octobre 2026).
//
// Trois bandes étroites cousues bord à bord, comme les bandes de pagne
// tissé d'Afrique de l'Ouest : chaque bande est un jeu de données, la
// couture les assemble sans les fondre. La bande du milieu est décalée,
// comme le sont les bandes cousues à la main : le système est construit,
// pas moulé. Un motif monte d'une bande à l'autre, de la source vers
// l'affirmation, et le dernier est un sceau latérite : la preuve.
//
// Tout est posé sur une grille de 48 unités, et chaque cote se lit dans
// GEOMETRIE : c'est ce qui permet de dessiner le symbole en traits de
// construction avant de le remplir (rideau d'accueil, image Open Graph,
// fichiers de marque, rendu en trois dimensions).
// =====================================================================

export const GRILLE = 48;

export type Bande = {
  x: number;
  y: number;
  l: number;
  h: number;
  /** Le motif carré porté par la bande : un jour ou le sceau. */
  motif: { x: number; y: number; c: number; sceau: boolean };
};

const SOURCE: Bande = {
  x: 4,
  y: 6,
  l: 12,
  h: 32,
  motif: { x: 7, y: 26, c: 6, sceau: false },
};
const COUTURE: Bande = {
  x: 18,
  y: 10,
  l: 12,
  h: 32,
  motif: { x: 21, y: 19, c: 6, sceau: false },
};
const SCEAU: Bande = {
  x: 32,
  y: 6,
  l: 12,
  h: 32,
  motif: { x: 35, y: 12, c: 6, sceau: true },
};

export const GEOMETRIE: readonly [Bande, Bande, Bande] = [
  SOURCE,
  COUTURE,
  SCEAU,
];

/** Le tracé d'une bande, son jour découpé (règle evenodd) sauf le sceau. */
export function traceBande(b: Bande): string {
  const cadre = `M${b.x} ${b.y}h${b.l}v${b.h}h-${b.l}z`;
  const { x, y, c } = b.motif;
  return `${cadre}M${x} ${y}v${c}h${c}v-${c}z`;
}

/** Le carré du sceau, posé sur la troisième bande. */
export function traceSceau(): string {
  const { x, y, c } = SCEAU.motif;
  return `M${x} ${y}h${c}v${c}h-${c}z`;
}

/** Centres des trois motifs : la ligne de provenance qui les relie. */
const centre = (b: Bande) => ({
  x: b.motif.x + b.motif.c / 2,
  y: b.motif.y + b.motif.c / 2,
});
export const LIGNE_PROVENANCE = {
  depart: centre(SOURCE),
  milieu: centre(COUTURE),
  arrivee: centre(SCEAU),
} as const;

type Variante = "plein" | "mono" | "epure";

export function Symbole({
  variante = "plein",
  titre,
  className,
}: {
  variante?: Variante;
  /** Sans titre, le symbole est décoratif et masqué aux lecteurs d'écran. */
  titre?: string;
  className?: string;
}) {
  const accessible = titre
    ? { role: "img" as const, "aria-label": titre }
    : { "aria-hidden": true as const };
  return (
    <svg
      viewBox={`0 0 ${GRILLE} ${GRILLE}`}
      className={className}
      data-symbole={variante}
      focusable="false"
      {...accessible}
    >
      {variante === "epure" ? <Epure /> : null}
      <g data-bandes>
        {GEOMETRIE.map((b, i) => (
          <path
            key={i}
            d={traceBande(b)}
            fillRule="evenodd"
            data-bande={i}
            fill={variante === "epure" ? "none" : "currentColor"}
            stroke={variante === "epure" ? "currentColor" : "none"}
            strokeWidth={variante === "epure" ? 0.6 : undefined}
          />
        ))}
      </g>
      {variante !== "mono" ? (
        <path
          d={traceSceau()}
          data-sceau
          className="symbole-sceau"
          fill={variante === "epure" ? "none" : "var(--accent, #c85b32)"}
          stroke={variante === "epure" ? "var(--accent, #c85b32)" : "none"}
          strokeWidth={variante === "epure" ? 0.8 : undefined}
        />
      ) : null}
    </svg>
  );
}

/** Les traits de construction : cotes, axes et ligne de provenance. */
export function Epure() {
  const { depart: a, arrivee: c } = LIGNE_PROVENANCE;
  return (
    <g
      data-epure
      fill="none"
      stroke="currentColor"
      strokeWidth={0.35}
      opacity={0.7}
    >
      {/* Cote horizontale, de la première à la dernière bande. */}
      <path d="M4 2.5h40M4 1.2v2.6M44 1.2v2.6M16 1.8v1.4M18 1.8v1.4M30 1.8v1.4M32 1.8v1.4" />
      {/* Cote verticale de la bande décalée. */}
      <path d="M46 10v32M44.8 10h2.4M44.8 42h2.4M44.8 38h2.4" />
      {/* Axes des bandes, en pointillé. */}
      <path d="M10 4v40M24 4v40M38 4v40" strokeDasharray="0.8 1.2" />
      {/* Cercle de construction du sceau. */}
      <circle cx={c.x} cy={c.y} r={6} strokeDasharray="0.6 0.9" />
      {/* La ligne de provenance qui relie les trois motifs. */}
      <path d={`M${a.x} ${a.y}L${c.x} ${c.y}`} data-provenance />
    </g>
  );
}

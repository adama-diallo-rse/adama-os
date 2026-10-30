import type { CSSProperties } from "react";
import { Symbole } from "./marque/symbole";

/** Original illustrations, not product screenshots or measurements. */
export function ArchitectureArt() {
  return (
    <svg
      className="architecture-art"
      viewBox="0 0 600 570"
      fill="none"
      role="img"
      aria-labelledby="architecture-title"
    >
      <title id="architecture-title">
        Illustration de cinq strates bleu ardoise superposées et d’une sphère
        dorée.
      </title>
      <defs>
        <linearGradient
          id="slab-top"
          x1="110"
          y1="70"
          x2="460"
          y2="410"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--texte-2)" />
          <stop offset="1" stopColor="var(--feuille-2)" />
        </linearGradient>
        <linearGradient
          id="slab-side"
          x1="120"
          y1="0"
          x2="480"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="var(--feuille-2)" />
          <stop offset="1" stopColor="var(--feuille)" />
        </linearGradient>
        <radialGradient id="sphere" cx=".3" cy=".25" r=".8">
          <stop stopColor="var(--ocre)" />
          <stop offset=".55" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-texte)" />
        </radialGradient>
        <filter id="floor-shadow" x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="17" />
        </filter>
        <pattern
          id="art-grid"
          width="48"
          height="48"
          patternUnits="userSpaceOnUse"
        >
          <path d="M48 0H0V48" stroke="var(--texte-2)" strokeOpacity=".09" />
        </pattern>
      </defs>
      <path fill="url(#art-grid)" d="M0 0h600v570H0z" />
      <circle
        cx="305"
        cy="268"
        r="213"
        stroke="var(--filet-fort)"
        strokeOpacity=".24"
        strokeDasharray="2 7"
      />
      <ellipse
        cx="300"
        cy="480"
        rx="153"
        ry="32"
        fill="var(--feuille)"
        opacity=".22"
        filter="url(#floor-shadow)"
      />
      <path
        d="M72 453 510 201M84 240l436 252M300 32v474"
        stroke="var(--texte-2)"
        strokeOpacity=".23"
        strokeWidth=".8"
      />
      <g className="architecture-stack">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(0 ${-i * 57})`}>
            <path d="m132 360 168-97 170 98-169 98z" fill="url(#slab-top)" />
            <path d="m132 360 169 98v23l-169-98z" fill="var(--feuille-2)" />
            <path d="m301 458 169-97v23l-169 97z" fill="url(#slab-side)" />
            <path
              d="m133 360 168 97 168-96"
              stroke="var(--sur-feuille-2)"
              strokeOpacity=".4"
            />
            <path d="m210 360 90-52 91 53-90 52z" fill="var(--fond-creux)" />
            <path d="m210 360 90-52v25l-68 39z" fill="var(--feuille)" />
            <path d="m300 308 91 53-21 12-70-40z" fill="var(--filet-feuille)" />
          </g>
        ))}
      </g>
      <circle
        className="architecture-sphere"
        cx="443"
        cy="409"
        r="42"
        fill="url(#sphere)"
      />
      <path
        d="M73 120h74M110 83v74M450 73h45M473 51v44"
        stroke="var(--texte-2)"
        strokeOpacity=".5"
        strokeWidth=".8"
      />
      <circle cx="301" cy="51" r="4" fill="var(--accent-texte)" />
      <path
        d="m301 51 66 0 22-22"
        stroke="var(--filet-fort)"
        strokeWidth=".8"
      />
      <text
        x="396"
        y="33"
        fontSize="9"
        letterSpacing="2"
        fill="var(--texte-2)"
        fontFamily="monospace"
      >
        STRATE 05
      </text>
      <path d="M132 421H67v53" stroke="var(--filet-fort)" strokeWidth=".8" />
      <text
        x="49"
        y="494"
        fontSize="9"
        letterSpacing="2"
        fill="var(--texte-2)"
        fontFamily="monospace"
      >
        STRATE 01
      </text>
    </svg>
  );
}

export function ProjectArt({ kind }: { kind: "strata" | "iroko" | "adama" }) {
  if (kind === "strata")
    return (
      <div className="strata-sculpture" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ "--layer": i } as CSSProperties} />
        ))}
      </div>
    );
  if (kind === "iroko")
    return (
      <div className="iroko-sculpture" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
    );
  return (
    <div className="os-sculpture" aria-hidden="true">
      <span className="os-orbit" />
      <span className="os-orbit orbit-two" />
      <span className="os-core">
        <Symbole />
      </span>
      <i />
      <span className="os-coordinate">SYSTÈME PERSONNEL</span>
    </div>
  );
}

// L7-T1, gabarit commun des images Open Graph.
//
// Un seul gabarit, trois pages : la home, l'ecosysteme et Open Metrics. Charte
// STRATA, navy #0d1b2a, signal teal #2affd6, or #c9a96e, stratemark en haut.
// Les styles sont ecrits a la main : satori ne lit ni Tailwind ni les
// variables CSS du site, il faut donc des valeurs litterales ici.
//
// Note de conformite (L10-T3) : a partir du 2 decembre 2026, une image generee
// devra porter un marquage lisible par machine. Le gabarit est centralise ici
// pour que ce marquage se pose une fois, sur les trois images a la fois.
import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function OgTemplate({
  title,
  subtitle,
  tagline,
}: {
  title: string;
  subtitle: string;
  tagline: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0d1b2a",
        padding: "80px 100px",
        fontFamily: "monospace",
        position: "relative",
      }}
    >
      {/* Halo or, coin haut droit */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(60% 60% at 80% 22%, rgba(201,169,110,0.18), rgba(13,27,42,0) 70%)",
        }}
      />
      {/* Lignes de strates, or tres discret */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "repeating-linear-gradient(-1.5deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 38px, rgba(201,169,110,0.05) 38px, rgba(201,169,110,0.05) 39px)",
        }}
      />

      {/* Stratemark : barre du haut en signal teal */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            width: 128,
            height: 13,
            borderRadius: 3,
            background: "#2affd6",
          }}
        />
        <div
          style={{
            width: 90,
            height: 13,
            borderRadius: 3,
            background: "#c9a96e",
          }}
        />
        <div
          style={{
            width: 52,
            height: 13,
            borderRadius: 3,
            background: "rgba(201,169,110,0.5)",
          }}
        />
      </div>

      {/* Wordmark + accroche */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontSize: title.length > 12 ? 84 : 112,
            fontWeight: 700,
            letterSpacing: 12,
            color: "#f2ede4",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 34, color: "rgba(242,237,228,0.72)" }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 22, letterSpacing: 3, color: "#2affd6" }}>
          {tagline}
        </div>
      </div>
    </div>
  );
}

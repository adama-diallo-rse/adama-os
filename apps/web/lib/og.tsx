// Shared social preview: the portfolio palette, no network or external fonts.
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
        background: "#f4efe6",
        color: "#0d1b2a",
        padding: "60px 70px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 820,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontSize: 70, fontWeight: 700, letterSpacing: -7 }}>
            a.
          </span>
          <span style={{ fontSize: 15, letterSpacing: 4, color: "#536878" }}>
            ADAMA OS / PORTFOLIO
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 16 ? 62 : 86,
              fontWeight: 700,
              letterSpacing: -4,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 38, color: "#806332", maxWidth: 820 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ height: 1, width: 600, background: "#d4d6d5" }} />
          <div style={{ fontSize: 17, letterSpacing: 2, color: "#536878" }}>
            {tagline}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: -100,
          top: -15,
          width: 450,
          height: 670,
          background: "#e2e6e9",
          borderRadius: 240,
          transform: "rotate(20deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 65,
          top: 145,
          width: 190,
          height: 330,
          border: "44px solid #14263a",
          borderRadius: 130,
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 26,
          bottom: 96,
          width: 87,
          height: 87,
          borderRadius: 50,
          background: "#c9a96e",
        }}
      />
    </div>
  );
}

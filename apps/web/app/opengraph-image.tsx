import { ImageResponse } from "next/og";

// Image de partage (LinkedIn, X...). Générée au build par next/og.
// Charte STRATA : navy, or, signal teal, stratemark. Wordmark "ADAMA OS".
export const alt = "Adama OS, System Architect";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
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
        {/* Lignes de strates, or très discret */}
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

        {/* Stratemark : barre du haut en signal teal (accent perso) */}
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
              fontSize: 112,
              fontWeight: 700,
              letterSpacing: 12,
              color: "#f2ede4",
            }}
          >
            ADAMA OS
          </div>
          <div style={{ fontSize: 34, color: "rgba(242,237,228,0.72)" }}>
            System Architect, RSE / ESG
          </div>
          <div style={{ fontSize: 22, letterSpacing: 3, color: "#2affd6" }}>
            BUILDING · CSRD · ESRS · STRATA
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

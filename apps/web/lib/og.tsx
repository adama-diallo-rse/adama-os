// Shared social preview: the portfolio palette, no network or external fonts.
//
// C13-T6. Six types de page partagent ce gabarit, et c'est le point : deux
// images vues dans un meme fil doivent se reconnaitre comme venant du meme
// endroit. Ce qui change d'un type a l'autre, c'est le SURTITRE et la donnee
// variable, jamais la composition.
//
// Contexte d'usage a ne pas perdre de vue : ces images sont vues petites,
// autour de 400 pixels de large, entourees d'autres contenus. La lisibilite a
// cette taille prime sur tout le reste, d'ou la troncature ci-dessous plutot
// qu'une reduction de corps indefinie : un texte reduit a 30 pixels dans une
// image affichee au tiers de sa taille ne se lit pas, il fait du gris.
import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Regle de debordement, choisie et pas subie.
 *
 * Troncature au dernier mot entier, suivie d'une ellipse. Une reduction de
 * corps aurait garde le texte entier mais illisible en fil ; un passage a la
 * ligne libre aurait pousse la signature hors du cadre. La troncature perd de
 * l'information, elle ne perd pas la lisibilite, et le titre de la page
 * complete l'information a l'ouverture.
 */
export function tronquer(texte: string, max: number): string {
  const t = texte.trim();
  if (t.length <= max) {
    return t;
  }
  const coupe = t.slice(0, max);
  const espace = coupe.lastIndexOf(" ");
  return `${(espace > max * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd()}…`;
}

export function OgTemplate({
  title,
  subtitle,
  tagline,
  eyebrow = "ADAMA OS / PORTFOLIO",
}: {
  title: string;
  subtitle: string;
  tagline: string;
  /** Surtitre du type de page. Ce qui distingue les six gabarits. */
  eyebrow?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f2ede4",
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
            {tronquer(eyebrow, 44)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 34 ? 46 : title.length > 16 ? 62 : 86,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1.05,
            }}
          >
            {tronquer(title, 62)}
          </div>
          <div
            style={{
              fontSize: subtitle.length > 58 ? 30 : 38,
              color: "#806332",
              maxWidth: 820,
              lineHeight: 1.25,
            }}
          >
            {tronquer(subtitle, 108)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ height: 1, width: 600, background: "#d4d6d5" }} />
          {/* Zone de signature. Elle reserve aussi la place du marquage
              lisible par machine exige a partir du 2 decembre 2026 : le jour
              ou une image de ce site sera produite par un modele, la mention
              se pose ici, a un seul endroit pour les six gabarits. Voir
              docs/MARQUAGE-MACHINE.md. */}
          <div style={{ fontSize: 17, letterSpacing: 2, color: "#536878" }}>
            {tronquer(tagline, 64)}
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

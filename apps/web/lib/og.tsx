// Aperçu social partagé : la palette ADAMA OS (indigo, latérite, ivoire,
// encre), sans réseau ni police externe.
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
import {
  GEOMETRIE,
  GRILLE,
  LIGNE_PROVENANCE,
  traceBande,
  traceSceau,
} from "../components/marque/symbole";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Satori ne lit pas l'OKLCH : les équivalents hexadécimaux sont ceux de
// brand/adama-os-tokens.css, recalculés par scripts/contraste.mjs.
const ENCRE = "#101524";
const IVOIRE = "#f8f3ea";
const LATERITE = "#c85b32";
const LATERITE_TEXTE = "#a13a16";
const PIERRE = "#535b6c";
const INDIGO = "#182052";
const BRUME = "#b8becb";

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

/** Le symbole « Le Tissage », plein, aux coordonnées de la charte. */
function SymbolePlein({
  taille,
  couleur,
}: {
  taille: number;
  couleur: string;
}) {
  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${GRILLE} ${GRILLE}`}>
      {GEOMETRIE.map((b, i) => (
        <path key={i} d={traceBande(b)} fill={couleur} fillRule="evenodd" />
      ))}
      <path d={traceSceau()} fill={LATERITE} />
    </svg>
  );
}

export function OgTemplate({
  title,
  subtitle,
  tagline,
  eyebrow = "ADAMA OS",
}: {
  title: string;
  subtitle: string;
  tagline: string;
  /** Surtitre du type de page. Ce qui distingue les six gabarits. */
  eyebrow?: string;
}): ReactElement {
  const { depart: a, arrivee: c } = LIGNE_PROVENANCE;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: IVOIRE,
        color: ENCRE,
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
          width: 760,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <SymbolePlein taille={64} couleur={ENCRE} />
          <span style={{ fontSize: 16, letterSpacing: 4, color: PIERRE }}>
            {tronquer(eyebrow, 44)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 34 ? 48 : title.length > 16 ? 64 : 88,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.04,
            }}
          >
            {tronquer(title, 62)}
          </div>
          <div
            style={{
              fontSize: subtitle.length > 58 ? 29 : 36,
              color: LATERITE_TEXTE,
              maxWidth: 760,
              lineHeight: 1.25,
              // Un saut de ligne voulu dans le sous-titre est tenu : il
              // evite qu'un mot compose se coupe sur son trait d'union.
              whiteSpace: "pre-line",
            }}
          >
            {tronquer(subtitle, 108)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{ height: 1, width: 560, background: ENCRE, opacity: 0.2 }}
          />
          {/* Zone de signature. Elle reserve aussi la place du marquage
              lisible par machine exige a partir du 2 decembre 2026 : le jour
              ou une image de ce site sera produite par un modele, la mention
              se pose ici, a un seul endroit pour les six gabarits. Voir
              docs/MARQUAGE-MACHINE.md. */}
          <div style={{ fontSize: 17, letterSpacing: 2, color: PIERRE }}>
            {tronquer(tagline, 64)}
          </div>
        </div>
      </div>
      {/* La planche de droite : le symbole sur sa grille, en traits de
          construction, comme au chargement de l'accueil. */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          right: 0,
          top: 0,
          width: 360,
          height: 630,
          background: INDIGO,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="300" height="300" viewBox={`0 0 ${GRILLE} ${GRILLE}`}>
          <path
            d="M4 2.5h40M4 1.2v2.6M44 1.2v2.6M46 10v32M44.8 10h2.4M44.8 42h2.4"
            fill="none"
            stroke={BRUME}
            strokeWidth={0.3}
          />
          <path
            d="M10 4v40M24 4v40M38 4v40"
            fill="none"
            stroke={BRUME}
            strokeWidth={0.25}
            strokeDasharray="0.8 1.2"
          />
          {GEOMETRIE.map((b, i) => (
            <path key={i} d={traceBande(b)} fill={IVOIRE} fillRule="evenodd" />
          ))}
          <path
            d={`M${a.x} ${a.y}L${c.x} ${c.y}`}
            stroke={LATERITE}
            strokeWidth={0.5}
            fill="none"
          />
          <path d={traceSceau()} fill={LATERITE} />
        </svg>
      </div>
    </div>
  );
}

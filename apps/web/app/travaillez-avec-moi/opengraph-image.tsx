import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { ACTIVITE } from "../../content/profil";

// 7 novembre 2026 : l'image de partage de l'offre. C'est elle qu'on voit
// quand le lien de la page est collé dans WhatsApp, LinkedIn ou un e-mail :
// elle dit ce qui est vendu, en combien de temps, et quand ça ouvre.
export const alt =
  "Accompagnement de projets en six semaines, par Adama Diallo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OffreOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / TRAVAILLER ENSEMBLE"
      title="VOTRE PROJET"
      subtitle={
        "Accompagnement en six semaines, revue, second avis.\nLa méthode d’ADAMA OS, appliquée à votre projet."
      }
      tagline={`${ACTIVITE.villes.join(" · ").toUpperCase()} · PREMIER ÉCHANGE GRATUIT`}
    />,
    { ...size },
  );
}

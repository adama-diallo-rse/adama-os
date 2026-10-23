import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { ACTIVITE, POSTE_ACTUEL } from "../../content/profil";

// C13-T6, image de partage du profil professionnel.
// Les valeurs viennent de la source unique de profil : c'est exactement le
// defaut que C9-T8 a ferme, des intitules divergents dans plusieurs
// fichiers, et une image de partage est l'endroit ou il serait reapparu
// sans qu'on le remarque. Depuis le 23 octobre 2026, l'image ne dit plus ce
// que je cherche : la recherche de poste est close depuis le 10 octobre.
export const alt = "Profil professionnel d’Adama Diallo";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function RecruteurOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / PROFIL"
      title="ADAMA DIALLO"
      subtitle={`${POSTE_ACTUEL}.`}
      tagline={ACTIVITE.villes.join(" · ").toUpperCase()}
    />,
    { ...size },
  );
}

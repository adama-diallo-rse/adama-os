import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../lib/og";
import { ACTIVITE, IDENTITE, POSTE_ACTUEL } from "../content/profil";

// Image de partage de la home (LinkedIn, X...). Gabarit commun : lib/og.
// Le titre et les maisons viennent de la source unique de profil.
export const alt = `${IDENTITE.nom}, ${POSTE_ACTUEL.charAt(0).toLowerCase()}${POSTE_ACTUEL.slice(1)}.`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      title={IDENTITE.nom}
      subtitle={`${POSTE_ACTUEL.replace(", co-", ",\nco-")}, de ${ACTIVITE.villes.join(" à ")}.`}
      tagline={[...ACTIVITE.maisons, "ADAMA OS"].join(" · ").toUpperCase()}
    />,
    { ...size },
  );
}

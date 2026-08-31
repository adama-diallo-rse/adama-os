import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../lib/og";

// Image de partage de la home (LinkedIn, X...). Gabarit commun : lib/og.
export const alt = "Adama Diallo. RSE, data et développement.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      title="Adama Diallo"
      subtitle="RSE, data et développement."
      tagline="STRATA · IROKO · ADAMA OS"
    />,
    { ...size },
  );
}

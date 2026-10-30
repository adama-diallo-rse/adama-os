import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";

// L7-T1, image de partage du hub ecosysteme.
export const alt = "Écosystème STRATA ESG, Pharivo et Conhama";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function EcosystemeOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      title="ÉCOSYSTÈME"
      subtitle="STRATA ESG, Pharivo et Conhama, de Paris à Dakar"
      tagline="PRODUITS ET AVANCEMENT"
    />,
    { ...size },
  );
}

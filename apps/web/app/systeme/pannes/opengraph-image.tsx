import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../../lib/og";
import { MODES_PANNE } from "../../../content/pannes";
import { CAPABILITY_IDS } from "../../../lib/health/types";

// C13-T6, image de partage de la sante et des modes de panne.
export const alt = "Santé par capacité et modes de panne";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function PannesOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / SANTÉ"
      title="CE QUI TOMBE"
      subtitle={`${CAPABILITY_IDS.length} capacités, ${MODES_PANNE.length} modes de panne rejouables`}
      tagline="LE SYSTÈME PRÉFÈRE L’ABSENCE À L’INVENTION"
    />,
    { ...size },
  );
}

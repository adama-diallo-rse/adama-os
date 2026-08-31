import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";

// L7-T1, image de partage d'Open Metrics.
export const alt = "Métriques publiques, écosystème";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function MetricsOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      title="MÉTRIQUES PUBLIQUES"
      subtitle="Relevés produit, sources et dates"
      tagline="STRATA ESG · IROKO SOFTWARE GROUP"
    />,
    { ...size },
  );
}

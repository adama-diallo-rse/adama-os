import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { JALONS } from "../../content/jalons";

// C13-T6, image de partage du journal de construction.
export const alt = "Journal de construction, lisible et brut";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function JournalOpengraphImage() {
  const revirements = JALONS.filter((j) => j.nature === "revirement").length;
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / CONSTRUCTION"
      title="COMMIT PAR COMMIT"
      subtitle={`${JALONS.length} décisions datées, dont ${revirements} revirements assumés`}
      tagline="TITRE RELU · MATIÈRE BRUTE À UN CLIC"
    />,
    { ...size },
  );
}

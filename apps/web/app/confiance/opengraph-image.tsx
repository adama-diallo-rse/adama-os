import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { INTERDITS } from "../../content/frontieres";

// C13-T6, image de partage des frontieres de donnees.
export const alt = "Frontières de données, ce qui n’entre jamais";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function ConfianceOpengraphImage() {
  const testes = INTERDITS.filter((i) => i.test !== null).length;
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / FRONTIÈRES"
      title="CE QUI N’ENTRE JAMAIS"
      subtitle={`${testes} règles sur ${INTERDITS.length} verrouillées par un test automatique`}
      tagline="LE COCKPIT LIT, IL N’ÉCRIT JAMAIS"
    />,
    { ...size },
  );
}

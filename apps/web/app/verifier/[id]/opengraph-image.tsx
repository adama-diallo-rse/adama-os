import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../../lib/og";
import { getClaim } from "../../../lib/proof/claims";
import { CLAIM_STATE_LABEL } from "../../../lib/proof/types";

// C13-T6, image de partage d'une page de verification.
//
// C'est l'image la plus specifique du site : elle porte l'AFFIRMATION, sa
// source et son etat de fraicheur. Une affirmation dont l'etat est perime le
// dit sur l'image aussi, sinon l'apercu de partage serait plus flatteur que
// la page qu'il annonce.
export const alt = "Vérification d’une affirmation";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function VerifierOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const claim = await getClaim(id).catch(() => null);
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / VÉRIFICATION"
      title={claim ? CLAIM_STATE_LABEL[claim.state] : "VÉRIFICATION"}
      subtitle={
        claim?.row.statement ?? "Le registre de preuve n’a pas pu être lu."
      }
      tagline={
        claim
          ? `SOURCE : ${claim.claim.source.toUpperCase()}`
          : "NE ME CROYEZ PAS, VÉRIFIEZ"
      }
    />,
    { ...size },
  );
}

import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../../lib/og";
import { STATUT_LABEL, getAdr } from "../../../lib/adr";

// C13-T6, image de partage d'une decision d'architecture.
//
// Le titre d'un ADR est deja de la forme « A plutot que B » : c'est
// exactement ce qu'une image de partage doit montrer, et c'est pourquoi elle
// ne le reformule pas. Si la base ne repond pas, l'image reste generique
// plutot que d'annoncer une decision dont on ne connait pas le titre.
export const alt = "Décision d’architecture";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function DecisionOpengraphImage({
  params,
}: {
  params: Promise<{ adr: string }>;
}) {
  const { adr } = await params;
  const decision = await getAdr(adr).catch(() => null);
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / DÉCISION"
      title={decision?.adr_id ?? "DÉCISION"}
      subtitle={
        decision?.title ?? "Le journal d’architecture n’a pas pu être lu."
      }
      tagline={
        decision
          ? `${STATUT_LABEL[decision.status].toUpperCase()} · ${decision.date}`
          : "AUCUNE DÉCISION N’EST INVENTÉE ICI"
      }
    />,
    { ...size },
  );
}

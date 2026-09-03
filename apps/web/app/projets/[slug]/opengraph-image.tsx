import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../../lib/og";
import { ETAT_LABEL, ficheParSlug } from "../../../content/projets";

// C13-T6, image de partage d'une fiche projet.
export const alt = "Fiche projet";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ProjetOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fiche = ficheParSlug(slug);
  if (!fiche) {
    notFound();
  }
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / PROJET"
      title={fiche.titre.toUpperCase()}
      subtitle={fiche.resume}
      tagline={`RÔLE : ${fiche.roleEnUnMot.toUpperCase()} · ${ETAT_LABEL[fiche.etat.valeur].toUpperCase()}`}
    />,
    { ...size },
  );
}

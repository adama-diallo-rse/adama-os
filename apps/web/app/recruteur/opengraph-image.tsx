import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { RECHERCHE } from "../../content/profil";

// C13-T6, image de partage du parcours recruteur.
// Les quatre valeurs viennent de la source unique de profil : c'est
// exactement le defaut que C9-T8 a ferme, quatre intitules divergents dans
// quatre fichiers, et une image de partage est le quatrieme endroit ou il
// serait reapparu sans qu'on le remarque.
export const alt = "Ce que je cherche, contrat, zone et échéance";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function RecruteurOpengraphImage() {
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / RECRUTEMENT"
      title="CE QUE JE CHERCHE"
      subtitle={`${RECHERCHE.postes[0]} · ${RECHERCHE.zone}`}
      tagline={`${RECHERCHE.contrats.join(" OU ")} · ${RECHERCHE.mois.toUpperCase()} ${RECHERCHE.annee}`}
    />,
    { ...size },
  );
}

import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgTemplate } from "../../lib/og";
import { surface } from "../../lib/inventory";

// C13-T6, image de partage de la vue technique.
// Les trois comptes viennent de l'inventaire genere, jamais d'une saisie :
// une image de partage qui annonce une taille de depot fausse est la seule
// chose que le lecteur retiendra si elle se contredit avec la page.
export const alt = "Vue technique, inventaire généré du dépôt";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function TechniqueOpengraphImage() {
  const s = surface();
  return new ImageResponse(
    <OgTemplate
      eyebrow="ADAMA OS / VUE TECHNIQUE"
      title="TOUT EST OUVERT"
      subtitle={`${s.test_cases} cas de test, ${s.tables} tables, ${s.policies} règles de sécurité`}
      tagline="INVENTAIRE GÉNÉRÉ · AUCUN CHIFFRE SAISI"
    />,
    { ...size },
  );
}

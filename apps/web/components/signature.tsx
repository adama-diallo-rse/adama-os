import Link from "next/link";
import { SIGNATURE } from "../content/profil";

// =====================================================================
// EC3, la signature verifiable.
//
// Chaque groupe de mots qui affirme quelque chose est un lien vers sa
// preuve ; la ponctuation reste du texte. Le composant ne connait aucune
// phrase : il lit SIGNATURE, et un segment sans preuve ne peut pas etre
// souligne comme s'il en avait une.
// =====================================================================

export function Signature({
  className = "",
  as: Balise = "p",
}: {
  className?: string;
  /** `span` quand la signature se place dans un paragraphe existant. */
  as?: "p" | "span";
}) {
  return (
    <Balise className={`signature-verifiable ${className}`.trim()}>
      {SIGNATURE.segments.map((segment) =>
        segment.preuve ? (
          <Link
            key={segment.texte}
            href={segment.preuve}
            title={segment.montre}
            className="signature-preuve"
          >
            {segment.texte}
          </Link>
        ) : (
          <span key={segment.texte}>{segment.texte}</span>
        ),
      )}
    </Balise>
  );
}

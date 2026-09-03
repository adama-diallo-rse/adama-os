import type { UIMessage } from "ai";

// =====================================================================
// Le contrat de sources d'adama.ai, partage entre le serveur et le navigateur.
//
// Ce fichier ne porte pas "server-only" et c'est deliberé : la route l'emploie
// pour typer ce qu'elle emet, le panneau pour typer ce qu'il recoit. Les deux
// cotes lisent donc la meme forme, et un champ ajoute d'un cote sans l'autre
// ne compile pas.
//
// Pourquoi une donnee et pas du texte. Jusqu'au 2 septembre 2026, la liste des
// sources etait une ligne « Sources : » que le modele redigeait lui-meme en
// fin de reponse. Elle pouvait citer un document qui n'avait jamais ete
// recupere, elle se melait au texte, et rien ne permettait de la verifier.
// Une reference inventee qui a l'air d'une reference est exactement le defaut
// que ce site combat ailleurs, sur les chiffres. Les sources sont donc
// desormais emises par le serveur, a partir de ce que la recherche a
// reellement rapporte, et affichees a part.
// =====================================================================

/** Un document reellement consulte pour construire une reponse. */
export type SourceConsultee = {
  /** Rang de citation, celui que le modele emploie entre crochets. */
  rang: number;
  source: string;
  titre: string;
  langue: string;
  /** Pages citees pour ce document, triees, sans doublon. */
  pages: number[];
  /** Meilleure similarite obtenue par ce document, arrondie au centieme. */
  similarite: number;
};

/**
 * Le message d'adama.ai. Aucune metadonnee, une seule partie de donnee :
 * `data-sources`, emise une fois par reponse, avant le premier mot.
 */
export type AdamaUIMessage = UIMessage<never, { sources: SourceConsultee[] }>;

/** Libelle d'une source, pour l'affichage. « VSME, Standard VSME, p. 12 et 13 ». */
export function libelleSource(s: SourceConsultee): string {
  const pages =
    s.pages.length === 0
      ? ""
      : s.pages.length === 1
        ? `, p. ${s.pages[0]}`
        : `, p. ${s.pages.slice(0, -1).join(", ")} et ${s.pages.at(-1)}`;
  const titre = s.titre === s.source ? s.titre : `${s.source}, ${s.titre}`;
  return `${titre}${pages}`;
}

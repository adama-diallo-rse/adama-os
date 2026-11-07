// =====================================================================
// EH4, le message d'un numero de SIGNAL.
//
// Meme enveloppe que les messages de la plomberie (lib/lettre/messages.ts) :
// tableaux, styles en ligne, aucune image, aucun pixel, une version texte
// complete. Le numero part dans la langue de l'abonne, pied de page compris,
// avec sa source primaire sous le Signal et le lien vers sa page publique.
// =====================================================================

import {
  BLOCS_EDITION,
  numeroAffiche,
  objetEdition,
  type ContenuEdition,
  type Langue,
} from "./editions";
import {
  LATERITE_TEXTE,
  MONO,
  PIERRE,
  bouton,
  echapper,
  enveloppe,
  etiquette,
  lierSite,
  paragraphe,
  piedTexte,
  type Contenu,
} from "./messages";

const LIBELLES_EDITION = {
  fr: {
    surtitre: (n: string) => `SIGNAL #${n}`,
    source: "Source",
    enLigne: "Lire ce numéro en ligne",
    preentete:
      "Un signal, un système, une décision, une construction, une idée.",
  },
  en: {
    surtitre: (n: string) => `SIGNAL #${n}`,
    source: "Source",
    enLigne: "Read this issue online",
    preentete: "A signal, a system, a decision, a build, an idea.",
  },
} as const;

/** L'adresse publique d'un numero, dans une langue. */
export function lienEdition(
  site: string,
  numero: number,
  langue: Langue,
): string {
  const base = `${site}/lettre/${numeroAffiche(numero)}`;
  return langue === "en" ? `${base}?langue=en` : base;
}

export function messageEdition({
  edition,
  langue,
  desinscription,
  site,
}: {
  edition: ContenuEdition;
  langue: Langue;
  desinscription: string;
  site: string;
}): Contenu {
  const v = edition[langue];
  const l = LIBELLES_EDITION[langue];
  const n = numeroAffiche(edition.numero);
  const enLigne = lienEdition(site, edition.numero, langue);
  const objet = objetEdition(edition.numero, v.titre);
  const corps = [
    ...BLOCS_EDITION.map((b) => {
      const texte = paragraphe(lierSite(echapper(v[b.cle]), site));
      const source =
        b.cle === "signal"
          ? `<p style="margin:-8px 0 22px;font-family:${MONO};font-size:12px;line-height:1.6;color:${PIERRE};word-break:break-all;">${l.source} : <a href="${echapper(v.source)}" style="color:${LATERITE_TEXTE};text-decoration:underline;">${echapper(v.source)}</a></p>`
          : "";
      return `${etiquette(`${b.code} ${langue === "fr" ? b.fr : b.en}`)}${texte}${source}`;
    }),
    bouton(enLigne, l.enLigne),
  ].join("\n");
  return {
    objet,
    html: enveloppe({
      preentete: l.preentete,
      surtitre: l.surtitre(n),
      titre: v.titre,
      corps,
      desinscription,
      site,
      langue,
    }),
    texte: [
      objet,
      "",
      ...BLOCS_EDITION.flatMap((b) => [
        `${b.code} ${(langue === "fr" ? b.fr : b.en).toUpperCase()}`,
        v[b.cle],
        ...(b.cle === "signal" ? [`${l.source} : ${v.source}`] : []),
        "",
      ]),
      `${l.enLigne} : ${enLigne}`,
      piedTexte(site, desinscription, langue),
    ].join("\n"),
  };
}

import type { ReactNode } from "react";
import {
  BLOCS_EDITION,
  numeroAffiche,
  type ContenuEdition,
  type Langue,
} from "../../lib/lettre/editions";

// =====================================================================
// EH4, un numero de SIGNAL tel qu'on le lit.
//
// Le meme composant sert la page publique d'un numero et l'apercu de la
// console : ce qu'Adama relit avant l'envoi est ce que le lecteur verra.
// Sans etat, sans effet, utilisable cote serveur comme cote navigateur.
//
// Les adresses du site citees dans un bloc deviennent des liens ; tout le
// reste reste du texte, comme dans le message envoye.
// =====================================================================

const HOTE = "adamesg-os.fr";

function lier(texte: string): ReactNode[] {
  const motif =
    /(?<![\w.-])(?:https?:\/\/)?adamesg-os\.fr(?:\/[A-Za-z0-9/_#-]*[A-Za-z0-9/_#-])?/g;
  const morceaux: ReactNode[] = [];
  let curseur = 0;
  for (const trouve of texte.matchAll(motif)) {
    const debut = trouve.index ?? 0;
    if (debut > curseur) morceaux.push(texte.slice(curseur, debut));
    const chemin = trouve[0].replace(/^https?:\/\//, "").slice(HOTE.length);
    morceaux.push(
      <a key={`${debut}-${chemin}`} href={chemin || "/"}>
        {HOTE}
        {chemin}
      </a>,
    );
    curseur = debut + trouve[0].length;
  }
  if (curseur < texte.length) morceaux.push(texte.slice(curseur));
  return morceaux;
}

const LIBELLES = {
  fr: { source: "Source primaire", version: "Version" },
  en: { source: "Primary source", version: "Version" },
} as const;

export function EditionLue({
  edition,
  langue,
  version,
  titreNiveau = 2,
  entete = true,
}: {
  edition: ContenuEdition;
  langue: Langue;
  version?: number;
  /** h1 sur la page du numero, h3 dans l'apercu de la console. */
  titreNiveau?: 1 | 2 | 3;
  /** Sans en-tete quand la page porte deja le numero et le titre. */
  entete?: boolean;
}) {
  const v = edition[langue];
  const Titre = `h${titreNiveau}` as "h1" | "h2" | "h3";
  const l = LIBELLES[langue];
  return (
    <article className="edition-lue" lang={langue}>
      {entete ? (
        <header className="edition-lue-tete">
          <p className="edition-lue-numero">
            <span>SIGNAL</span> #{numeroAffiche(edition.numero)}
            {version && version > 1 ? (
              <em>
                {" "}
                · {l.version} {version}
              </em>
            ) : null}
          </p>
          <Titre className="edition-lue-titre">{v.titre || "…"}</Titre>
        </header>
      ) : null}
      <ol className="edition-lue-blocs">
        {BLOCS_EDITION.map((b) => (
          <li key={b.cle} className="edition-lue-bloc" data-bloc={b.cle}>
            <p className="edition-lue-etiquette">
              <span>{b.code}</span> {langue === "fr" ? b.fr : b.en}
            </p>
            <p className="edition-lue-texte">
              {v[b.cle] ? lier(v[b.cle]) : "…"}
            </p>
            {b.cle === "signal" && v.source ? (
              <p className="edition-lue-source">
                {l.source} :{" "}
                <a href={v.source} target="_blank" rel="noopener noreferrer">
                  {v.source.replace(/^https:\/\//, "")}
                </a>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </article>
  );
}

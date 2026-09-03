// =====================================================================
// C6-T4, la chaine decision, code, resultat.
//
// C'est le bloc qui distingue un journal d'architecture d'un journal
// d'intentions : une decision qui n'a produit aucun fichier n'a pas ete
// prise, elle a ete envisagee.
//
// Le schema est en SVG en ligne, sans bibliotheque. Il est decoratif au sens
// strict : tout ce qu'il montre est ecrit juste en dessous, en HTML, et
// c'est cette version qui est lue par un lecteur d'ecran et imprimee. Le SVG
// disparait sous huit cents pixels, la lecture ne perd rien.
// =====================================================================

import { PREUVE_KIND_LABEL, type AdrPreuve } from "../lib/adr";
import { GITHUB_REPO_URL } from "./types";

const EMPREINTE_COMMIT = /^[0-9a-f]{7,40}$/;

/** L'adresse publique d'une preuve, quand elle en a une. Une absence n'a pas
 *  d'adresse : on ne fabrique pas un lien vers un fichier supprime. */
export function adresseDePreuve(preuve: AdrPreuve): string | null {
  if (preuve.kind === "commit" && EMPREINTE_COMMIT.test(preuve.locator)) {
    return `${GITHUB_REPO_URL}/commit/${preuve.locator}`;
  }
  if (
    preuve.kind === "fichier" ||
    preuve.kind === "test" ||
    preuve.kind === "migration"
  ) {
    return `${GITHUB_REPO_URL}/blob/main/${preuve.locator}`;
  }
  return null;
}

function Maillon({
  x,
  titre,
  sous,
}: {
  x: number;
  titre: string;
  sous: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={18}
        width={188}
        height={64}
        rx={4}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
      <text x={x + 16} y={44} className="adr-chain-titre">
        {titre}
      </text>
      <text x={x + 16} y={64} className="adr-chain-sous">
        {sous}
      </text>
    </g>
  );
}

export function AdrChain({
  decision,
  preuves,
  consequence,
}: {
  decision: string;
  preuves: AdrPreuve[];
  consequence: string;
}) {
  return (
    <section className="adr-chain" aria-labelledby="chaine-title">
      <p className="portfolio-label" id="chaine-title">
        DÉCISION · CODE · RÉSULTAT
      </p>

      <svg
        className="adr-chain-svg"
        viewBox="0 0 700 100"
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        <Maillon x={2} titre="Décision" sous="ce qui a été tranché" />
        <Maillon x={256} titre="Code" sous="ce que ça a produit" />
        <Maillon x={510} titre="Résultat" sous="ce qui a été observé" />
        <g stroke="currentColor" strokeWidth={1} fill="none">
          <path d="M190 50h56m0 0-8-5m8 5-8 5" />
          <path d="M444 50h56m0 0-8-5m8 5-8 5" />
        </g>
      </svg>

      <ol className="adr-chain-steps">
        <li>
          <span className="portfolio-label">LA DÉCISION</span>
          <p>{decision}</p>
        </li>
        <li>
          <span className="portfolio-label">LE CODE QU’ELLE A PRODUIT</span>
          {preuves.length === 0 ? (
            <p className="adr-vide">
              Aucune trace déclarée. Une décision sans trace n’a pas été prise,
              elle a été envisagée.
            </p>
          ) : (
            <ul className="adr-preuves">
              {preuves.map((preuve) => {
                const adresse = adresseDePreuve(preuve);
                return (
                  <li key={`${preuve.kind}-${preuve.locator}`}>
                    <span className="adr-preuve-kind">
                      {PREUVE_KIND_LABEL[preuve.kind]}
                    </span>
                    <span className="adr-preuve-libelle">{preuve.libelle}</span>
                    {adresse ? (
                      <a
                        href={adresse}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <code>{preuve.locator}</code>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      <code>{preuve.locator}</code>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </li>
        <li>
          <span className="portfolio-label">LE RÉSULTAT OBSERVÉ</span>
          <p>{consequence}</p>
        </li>
      </ol>
    </section>
  );
}

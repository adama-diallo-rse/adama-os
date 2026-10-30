"use client";

import Link from "next/link";
import { useState } from "react";
import { CLAIM_STATE_LABEL } from "../../lib/proof/types";

export type DonneesCitation = {
  id: string;
  enonce: string;
  sujet: string;
  source: string;
  luLe: string | null;
  /** Classe de donnée d'une affirmation ; une décision porte son statut. */
  etat?: keyof typeof CLAIM_STATE_LABEL;
  etiquette?: string;
  texte: string;
  empreinte: string;
  /** Lien de vérification ; une décision renvoie à sa source versionnée. */
  href: string;
  lienLibelle?: string;
};

/**
 * Le bloc de citation d'une preuve ou d'une décision, façon publication de
 * recherche : résumé, source, empreinte, et la citation prête à copier.
 *
 * L'empreinte est le SHA-256 du texte de la citation, calculé côté
 * serveur : elle permet de vérifier qu'une citation recopiée n'a pas été
 * altérée, et ne prétend rien de plus.
 */
export function BlocCitation({ c }: { c: DonneesCitation }) {
  const [copie, setCopie] = useState<"" | "copiée" | "échec">("");

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(c.texte);
      setCopie("copiée");
    } catch {
      setCopie("échec");
    }
  };

  return (
    <article className="citation" aria-labelledby={`citation-${c.id}`}>
      <header className="citation-tete">
        <span className="citation-id">{c.id}</span>
        <span className="citation-etat">
          {c.etiquette ?? (c.etat ? CLAIM_STATE_LABEL[c.etat] : "")}
        </span>
      </header>
      <dl className="citation-champs">
        <div>
          <dt>Résumé</dt>
          <dd id={`citation-${c.id}`} className="citation-enonce">
            {c.enonce}
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{c.source}</dd>
        </div>
        <div>
          <dt>Lu le</dt>
          <dd>
            {c.luLe ? (
              <time dateTime={c.luLe}>{c.luLe.slice(0, 10)}</time>
            ) : (
              "date absente"
            )}
          </dd>
        </div>
        <div>
          <dt>Empreinte</dt>
          <dd className="citation-empreinte" title={c.empreinte}>
            sha256:{c.empreinte.slice(0, 24)}…
          </dd>
        </div>
      </dl>
      <div className="citation-texte">
        <p className="citation-label">Citer</p>
        <pre>{c.texte}</pre>
      </div>
      <footer className="citation-pied">
        <button type="button" onClick={copier} className="citation-copier">
          Copier la citation
        </button>
        <span className="citation-retour" role="status">
          {copie === "copiée"
            ? "Citation copiée."
            : copie === "échec"
              ? "Copie impossible : sélectionnez le texte."
              : ""}
        </span>
        {c.href.startsWith("http") ? (
          <a
            href={c.href}
            className="citation-lien"
            target="_blank"
            rel="noopener noreferrer"
          >
            {c.lienLibelle ?? "Vérifier"} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        ) : (
          <Link href={c.href} className="citation-lien">
            {c.lienLibelle ?? "Vérifier"} <span aria-hidden="true">→</span>
          </Link>
        )}
      </footer>
    </article>
  );
}

// =====================================================================
// C3-T6, le registre public des limites connues.
//
// Un composant volontairement sobre. Une limite connue n'est pas une alerte :
// elle ne clignote pas, elle n'est pas rouge, elle n'est pas encadree d'un
// bandeau d'avertissement. Elle se lit comme le reste du site, parce qu'elle
// fait partie du dossier au meme titre que ce qui marche.
//
// Le seul traitement particulier porte sur la derniere ligne de chaque
// entree : ce qui la fermera. Une limite sans condition de fermeture est un
// renoncement deguise en transparence.
//
// Revision du 13 septembre 2026 : une limite fermee ne disparait plus. Elle
// passe sous « Fermées », avec sa date et ce qui l'a fermee, et un constat
// revise montre ce qui etait ecrit avant. On ne fait jamais disparaitre, on
// marque.
// =====================================================================

import type { Limite } from "../content/limites";

function dateCourte(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function Carte({ limite: l }: { limite: Limite }) {
  const fermee = Boolean(l.fermeeLe);
  return (
    <li
      className="limite-card"
      id={`limite-${l.id}`}
      data-fermee={fermee ? "oui" : "non"}
    >
      {fermee ? <p className="limite-etiquette">FERMÉE</p> : null}
      <h3>{l.titre}</h3>
      <p className="limite-constat">{l.constat}</p>
      <dl>
        <div>
          <dt>Ce que cela coûte</dt>
          <dd>{l.consequence}</dd>
        </div>
        {fermee ? (
          <div>
            <dt>Ce qui l’a fermée</dt>
            <dd>{l.fermeePar}</dd>
          </div>
        ) : (
          <div>
            <dt>Ce qui la fermera</dt>
            <dd>{l.fermeture}</dd>
          </div>
        )}
        {l.revision ? (
          <div className="limite-revision">
            <dt>Constat révisé le {dateCourte(l.revision.le)}, avant :</dt>
            <dd>
              <s>{l.revision.constatAnterieur}</s>
            </dd>
          </div>
        ) : null}
      </dl>
      <p className="limite-date">
        Constatée le{" "}
        <time dateTime={l.constateLe}>{dateCourte(l.constateLe)}</time>
        {l.fermeeLe ? (
          <>
            {", fermée le "}
            <time dateTime={l.fermeeLe}>{dateCourte(l.fermeeLe)}</time>
          </>
        ) : null}
      </p>
    </li>
  );
}

export function KnownLimits({
  limites,
  titre = "Ce qui ne marche pas encore",
}: {
  limites: readonly Limite[];
  titre?: string;
}) {
  const ouvertes = limites.filter((l) => !l.fermeeLe);
  const fermees = limites.filter((l) => Boolean(l.fermeeLe));
  return (
    <section className="limite-section" aria-labelledby="limites-title">
      <div className="limite-intro">
        <p className="portfolio-label">LIMITES CONNUES</p>
        <h2 id="limites-title">
          {titre}
          <span className="serif">.</span>
        </h2>
        <p>
          {ouvertes.length} entrée{ouvertes.length > 1 ? "s" : ""} ouverte
          {ouvertes.length > 1 ? "s" : ""}, relue
          {ouvertes.length > 1 ? "s" : ""} une par une. Une limite réglée ne
          disparaît pas : elle passe sous « Fermées », avec sa date et ce qui
          l’a fermée. C’est pourquoi chacune porte ce qui la fermera.
        </p>
      </div>

      <ul className="limite-list">
        {ouvertes.map((l) => (
          <Carte key={l.id} limite={l} />
        ))}
      </ul>

      {fermees.length > 0 ? (
        <div className="limite-fermees">
          <p className="portfolio-label">
            FERMÉES, GARDÉES VISIBLES ({fermees.length})
          </p>
          <ul className="limite-list">
            {fermees.map((l) => (
              <Carte key={l.id} limite={l} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

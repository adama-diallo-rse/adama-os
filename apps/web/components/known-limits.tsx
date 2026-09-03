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

export function KnownLimits({
  limites,
  titre = "Ce qui ne marche pas encore",
}: {
  limites: readonly Limite[];
  titre?: string;
}) {
  return (
    <section className="limite-section" aria-labelledby="limites-title">
      <div className="limite-intro">
        <p className="portfolio-label">LIMITES CONNUES</p>
        <h2 id="limites-title">
          {titre}
          <span className="serif">.</span>
        </h2>
        <p>
          {limites.length} entrée{limites.length > 1 ? "s" : ""}, relue
          {limites.length > 1 ? "s" : ""} une par une. Une limite se retire de
          cette liste quand elle est réglée, jamais quand elle devient gênante.
          C’est pourquoi chacune porte ce qui la fermera.
        </p>
      </div>

      <ul className="limite-list">
        {limites.map((l) => (
          <li key={l.id} className="limite-card" id={`limite-${l.id}`}>
            <h3>{l.titre}</h3>
            <p className="limite-constat">{l.constat}</p>
            <dl>
              <div>
                <dt>Ce que cela coûte</dt>
                <dd>{l.consequence}</dd>
              </div>
              <div>
                <dt>Ce qui la fermera</dt>
                <dd>{l.fermeture}</dd>
              </div>
            </dl>
            <p className="limite-date">
              Constatée le{" "}
              <time dateTime={l.constateLe}>{dateCourte(l.constateLe)}</time>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

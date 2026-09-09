import Link from "next/link";
import { ADAMA_OS, PARCOURS_PUBLICS } from "../content/adama-os";

export function JourneyGateway() {
  return (
    <section
      id="explorer"
      className="portfolio-wrap journey-gateway"
      aria-labelledby="journey-title"
    >
      <div className="journey-intro">
        <p className="portfolio-label">
          <span>00 /</span> CHOISIR UNE ENTRÉE
        </p>
        <h2 id="journey-title">
          Que voulez-vous
          <br />
          <span className="serif">faire ici ?</span>
        </h2>
        <p>
          {ADAMA_OS.nom} organise un corpus dense. Vous n’avez pas besoin d’en
          comprendre l’architecture pour commencer.
        </p>
      </div>
      <nav className="journey-grid" aria-label="Parcours ADAMA OS">
        {PARCOURS_PUBLICS.map((parcours, index) => (
          <Link href={parcours.href} key={parcours.code}>
            <span className="journey-index">0{index + 1}</span>
            <span className="journey-code">{parcours.code}</span>
            <strong>{parcours.titre}</strong>
            <span className="journey-description">{parcours.description}</span>
            <span className="journey-action">
              {parcours.action} <span aria-hidden="true">↗</span>
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

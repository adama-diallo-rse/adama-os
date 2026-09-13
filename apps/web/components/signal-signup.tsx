import Link from "next/link";

// =====================================================================
// SIGNAL, l'appel vers la lettre depuis l'accueil.
//
// Jusqu'au 13 septembre 2026, ce bloc portait son propre formulaire, qui
// ecrivait l'adresse dans la table leads du projet partage, sans case de
// consentement, sans double confirmation et sans mention. Il est remplace
// par un renvoi vers /lettre (EH0) : une seule surface de collecte, un seul
// texte de consentement versionne, une base dediee. La table leads ne
// contenait aucune adresse de source newsletter a cette date, releve fait
// en lecture seule : rien n'a ete migre, et rien ne le sera.
// =====================================================================

export function SignalSignup() {
  return (
    <section className="signal-signup" aria-labelledby="signal-title">
      <div>
        <p className="portfolio-label">SIGNAL / LETTRE DE RECHERCHE</p>
        <h2 id="signal-title">Suivre le travail, pas le bruit.</h2>
        <p>
          Un signal extérieur, ce qu’il change dans un système, la décision
          prise, ce qui a été construit, et une idée encore fermée. La lettre
          n’a pas commencé à paraître : d’ici là, une note courte par trimestre.
        </p>
      </div>
      <div className="signal-signup-action">
        <ul>
          <li>Double confirmation</li>
          <li>Désinscription en un clic</li>
          <li>Aucune mesure d’ouverture</li>
        </ul>
        <Link href="/lettre" className="signal-signup-lien">
          <span>Recevoir SIGNAL</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

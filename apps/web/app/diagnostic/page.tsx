import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { DIAGNOSTIC, VERROUS, periodeCourante } from "../../content/conseil";

// =====================================================================
// EG1, AXP-63, le diagnostic court payant.
//
// 90 minutes, une note d'une page. Le prix n'est plus affiche depuis le
// 7 novembre 2026, decision d'Adama : la grille reste interne et le montant
// est annonce par ecrit avant la seance. Il ne s'affiche pas non plus sur
// la page des quatre portes (EG0).
//
// Tant que EK3 n'est pas franchi, aucune reservation n'est ouverte et rien
// ne s'encaisse : la page le dit, et son seul appel mene au formulaire
// commun, qui qualifie et date.
// =====================================================================

// La periode de capacite change a date fixe (EG9) : la page se reconstruit
// toutes les heures, pour ne jamais afficher un plafond perime.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Diagnostic court",
  description:
    "Quatre-vingt-dix minutes pour lire un système de donnée ESG avant d’y ajouter un outil, et une note d’une page. Déroulé et contenu de la note publiés.",
  alternates: { canonical: "/diagnostic" },
};

function minutes(debut: number): string {
  const fin = debut + 15;
  return `${String(debut).padStart(2, "0")} à ${fin} min`;
}

export default function DiagnosticPage() {
  const vente = VERROUS.vente;
  const periode = periodeCourante();
  return (
    <PageShell className="conseil-page diagnostic-page">
      <PageIntro
        eyebrow="TRAVAILLER ENSEMBLE / DIAGNOSTIC COURT"
        title={
          <>
            Quatre-vingt-dix minutes
            <br />
            <span className="serif">avant d’ajouter un outil.</span>
          </>
        }
        description="Une séance pour lire votre système tel qu’il existe ou tel qu’il est imaginé, et une note d’une page qui dit ce qu’il faut trancher d’abord. La conclusion peut être de ne rien acheter, ni ici ni ailleurs."
        aside={
          <div className="intro-note conseil-prix-note">
            <span className="intro-note-label">FORMAT</span>
            <strong>{DIAGNOSTIC.duree}, puis une note d’une page</strong>
            <p>Le montant vous est annoncé par écrit avant la séance.</p>
          </div>
        }
      />

      <section className="diagnostic-avant" aria-labelledby="avant-titre">
        <div>
          <p className="portfolio-label">AVANT LA SÉANCE</p>
          <h2 id="avant-titre">
            Quatre choses à préparer,{" "}
            <span className="serif">une à ne pas envoyer.</span>
          </h2>
        </div>
        <ul>
          {DIAGNOSTIC.avant.map((a, i) => (
            <li
              key={a}
              data-refus={i === DIAGNOSTIC.avant.length - 1 ? "oui" : "non"}
            >
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section className="diagnostic-deroule" aria-labelledby="deroule-titre">
        <div className="diagnostic-deroule-tete">
          <p className="portfolio-label">
            LE DÉROULÉ, PAR BLOCS DE QUINZE MINUTES
          </p>
          <h2 id="deroule-titre">
            Six blocs, <span className="serif">toujours dans cet ordre.</span>
          </h2>
        </div>
        <ol className="diagnostic-frise">
          {DIAGNOSTIC.deroule.map((bloc) => (
            <li key={bloc.debut}>
              <time className="diagnostic-minute">{minutes(bloc.debut)}</time>
              <h3>{bloc.titre}</h3>
              <p>{bloc.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="diagnostic-note" aria-labelledby="note-titre">
        <div className="diagnostic-feuille" aria-hidden="true">
          <span className="diagnostic-feuille-tete">
            NOTE DE DIAGNOSTIC · 1 PAGE
          </span>
          {DIAGNOSTIC.note.sections.map((s, i) => (
            <span key={s} className="diagnostic-feuille-ligne">
              <b>{String(i + 1).padStart(2, "0")}</b>
              {s}
            </span>
          ))}
        </div>
        <div>
          <p className="portfolio-label">LA NOTE D’UNE PAGE</p>
          <h2 id="note-titre">
            Une lecture de système,{" "}
            <span className="serif">pas un livrable ESG.</span>
          </h2>
          <ol className="diagnostic-sections">
            {DIAGNOSTIC.note.sections.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="diagnostic-jamais-titre">Elle ne contient jamais</p>
          <ul className="diagnostic-jamais">
            {DIAGNOSTIC.note.jamais.map((j) => (
              <li key={j}>{j}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="diagnostic-filtre" aria-labelledby="filtre-titre">
        <div>
          <p className="portfolio-label">LE FILTRE</p>
          <h2 id="filtre-titre">
            Le diagnostic se refuse <span className="serif">quand</span>
          </h2>
        </div>
        <ul>
          {DIAGNOSTIC.filtre.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      {!vente.leve ? (
        <section className="conseil-verrou-bloc" aria-labelledby="verrou-titre">
          <span className="conseil-verrou-code">{vente.code}</span>
          <div>
            <h2 id="verrou-titre">
              Les réservations ne sont pas encore ouvertes.
            </h2>
            <p>
              Rien ne s’encaisse avant la publication des conditions de vente,
              avec leur droit de rétractation et leur facturation. Une demande
              envoyée maintenant est lue, qualifiée et datée, puis reçoit une
              réponse écrite. Capacité de la période en cours :{" "}
              {periode.plafond.toLowerCase()}
            </p>
          </div>
        </section>
      ) : null}

      <section className="page-next">
        <div>
          <p className="portfolio-label">PROCHAINE ÉTAPE</p>
          <h2>
            Entrer par la porte <span className="serif">Construire.</span>
          </h2>
          <p>
            Le formulaire commun vous range en quatre questions et applique la
            règle d’acceptation avant que vous écriviez votre problème.
          </p>
        </div>
        <Link
          href="/travaillez-avec-moi?porte=construire#demande"
          className="portfolio-button primary"
        >
          Décrire mon problème <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

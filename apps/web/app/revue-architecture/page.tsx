import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { CONTACT_EMAIL } from "../../components/types";

export const metadata: Metadata = {
  title: "Revue d’architecture",
  description:
    "Revue indépendante d’un système de donnée, de preuve, d’automatisation ou d’intelligence artificielle appliqué à l’ESG.",
  alternates: { canonical: "/revue-architecture" },
};

const SORTIES = [
  "une carte lisible du système et de ses frontières",
  "les décisions qui créent le plus de risque ou de dette",
  "les preuves manquantes et les hypothèses encore invisibles",
  "un ordre d’action court avec ce qu’il faut arrêter, garder ou tester",
] as const;

export default function RevueArchitecturePage() {
  const sujet = encodeURIComponent("Revue d’architecture ADAMA OS");
  const corps = encodeURIComponent(
    "Bonjour Adama,\n\nVoici le système ou le problème que je souhaite faire relire :\n\nContexte :\nObjectif :\nBlocage actuel :\nÉchéance :\n\n",
  );

  return (
    <PageShell className="review-page">
      <PageIntro
        eyebrow="CONSEIL / REVUE D’ARCHITECTURE"
        title={
          <>
            Voir le système
            <br />
            <span className="serif">avant d’ajouter un outil.</span>
          </>
        }
        description="Une lecture structurée de votre architecture de donnée, de preuve ou d’automatisation. La revue cherche les frontières floues, les dépendances cachées et les affirmations impossibles à vérifier."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">POINT DE DÉPART</span>
            <strong>1</strong>
            <p>
              Un problème précis, un système existant ou une décision à prendre.
            </p>
          </div>
        }
      />

      <section className="review-fit">
        <div>
          <p className="portfolio-label">C’EST UTILE SI</p>
          <h2>
            Le système fonctionne, mais personne ne peut l’expliquer simplement.
          </h2>
        </div>
        <ul>
          <li>Les données circulent sans propriétaire clair.</li>
          <li>Les réponses générées ne remontent pas jusqu’à leurs sources.</li>
          <li>Les outils se multiplient plus vite que les décisions.</li>
          <li>Une exigence ESG se transforme en travail manuel permanent.</li>
        </ul>
      </section>

      <section className="review-output">
        <p className="portfolio-label">CE QUE VOUS RECEVEZ</p>
        <ol>
          {SORTIES.map((sortie, index) => (
            <li key={sortie}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{sortie}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="review-boundary">
        <div>
          <p className="portfolio-label">FRONTIÈRE</p>
          <h2>ADAMA explique la construction. STRATA livre le logiciel.</h2>
        </div>
        <p>
          La revue ne vend pas un produit STRATA déguisé. Si votre besoin est
          déjà couvert par un logiciel existant, la conclusion peut être de ne
          rien construire ici.
        </p>
        <Link href="/ecosysteme#strata">Voir les logiciels STRATA ↗</Link>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">PREMIER ÉCHANGE</p>
          <h2>
            Décrivez le problème,{" "}
            <span className="serif">pas la solution.</span>
          </h2>
          <p>
            Indiquez le contexte, le blocage, l’échéance et les personnes qui
            devront utiliser ou défendre le système.
          </p>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${sujet}&body=${corps}`}
          className="portfolio-button primary"
        >
          Soumettre un problème <span aria-hidden="true">→</span>
        </a>
      </section>
    </PageShell>
  );
}

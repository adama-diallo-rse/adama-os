import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, PageIntro } from "../../components/page-shell";

export const metadata: Metadata = {
  title: "Diagnostic court",
  description: "90 minutes pour analyser et cadrer votre architecture de données ESG.",
  alternates: { canonical: "/diagnostic" },
};

export default function DiagnosticPage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Expertise ponctuelle"
        title="Diagnostic court"
        description="Une séance de 90 minutes pour débloquer une impasse d’architecture ESG ou valider un choix de conception, suivie d’une note de synthèse d’une page."
      />
      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <h2 className="section-title">Déroulé des 90 minutes</h2>
          <div className="portfolio-prose">
            <p>
              Avant la séance, le client fournit une brève description du contexte technique et le schéma du flux de données concerné (même à l’état de brouillon).
            </p>
            <ul className="mt-4 space-y-4">
              <li><strong>00:00 - 00:15 : Le problème.</strong> Reformulation du problème et des contraintes par le système, pas par le métier. Ce qui coûte trop cher, ce qui ne tient pas l’échelle.</li>
              <li><strong>00:15 - 00:30 : Les entrées et les sorties.</strong> Frontières du système, qualité de la donnée disponible et usages réels (qui regarde le tableau de bord, qui lit le rapport).</li>
              <li><strong>00:30 - 00:45 : Les hypothèses non vérifiées.</strong> Recherche des points de rupture, des promesses logicielles non testées, et des fausses dépendances.</li>
              <li><strong>00:45 - 01:15 : Déconstruction et options.</strong> Propositions d’architecture, découpage du problème en sous-problèmes, options rejetées et pourquoi.</li>
              <li><strong>01:15 - 01:30 : La prochaine action.</strong> Définition de l’étape suivante, claire et mesurable. Prise de recul sur le périmètre de la note de synthèse.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="portfolio-section bg-muted">
        <div className="portfolio-wrap">
          <h2 className="section-title">La note de synthèse (Livrable)</h2>
          <div className="portfolio-prose">
            <p>
              Un document d’une page, envoyé sous 48 heures ouvrées.
            </p>
            <h3 className="mt-4 text-lg font-bold">Ce qu’elle contient</h3>
            <ul>
              <li>Le diagnostic du point de rupture de l’architecture.</li>
              <li>Les options écartées avec leurs raisons.</li>
              <li>La recommandation d’architecture ou de flux.</li>
              <li>La feuille de route immédiate pour la prochaine action.</li>
            </ul>
            <h3 className="mt-4 text-lg font-bold">Ce qu’elle ne contient jamais</h3>
            <p className="tone-info mt-2 p-4 border border-[var(--border)] rounded bg-background">
              <strong>Attention :</strong> Cette note n’est pas un livrable ESG. Elle ne comporte aucun calcul carbone, aucune matrice de double matérialité, et aucun rapport de conformité CSRD. Il s’agit d’une lecture de système logiciel et de donnée, pas de conseil en développement durable.
            </p>
          </div>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <h2 className="section-title">Tarification & Acceptation</h2>
          <div className="portfolio-grid mt-6">
            <div className="portfolio-card">
              <h3>Filtre d’acceptation</h3>
              <p className="mt-2 text-sm tone-muted">
                Un diagnostic est refusé si la demande cible un calcul métier plutôt qu’une conception de système, si le client est un prospect STRATA ESG (conflit), ou s’il s’agit d’une vérification de conformité légale (tiers indépendant requis).
              </p>
            </div>
            <div className="portfolio-card">
              <h3>Tarification (250 € à 450 €)</h3>
              <p className="mt-2 text-sm tone-muted">
                <strong>250 €</strong> : Problématique isolée (un flux, une intégration, un outil spécifique).<br />
                <strong>450 €</strong> : Architecture d’ensemble, choix de composants structurants, ou données très dispersées.
              </p>
            </div>
          </div>
          
          <div className="mt-12 p-6 border-l-4 border-[var(--text)] bg-muted">
            <h3 className="font-bold">Avertissement de contractualisation (EK3)</h3>
            <p className="mt-2 font-mono text-sm">
              L’encaissement et la facturation de ce service sont temporairement bloqués dans l’attente de l’immatriculation finale de la structure juridique portant les contrats (Jalon EK3). La souscription directe en ligne ouvrira lors de la levée de ce verrou.
            </p>
            <div className="mt-6">
              <Link href="/travaillez-avec-moi" className="btn btn-primary" style={{ display: 'inline-block' }}>
                Soumettre une demande de qualification
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

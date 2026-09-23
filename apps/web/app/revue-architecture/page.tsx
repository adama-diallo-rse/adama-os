import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";

export const metadata: Metadata = {
  title: "Revue d’architecture",
  description:
    "Revue indépendante d’un système de donnée, de preuve, d’automatisation ou d’intelligence artificielle appliqué à l’ESG.",
  alternates: { canonical: "/revue-architecture" },
};

const SORTIES = [
  { titre: "1. Ce qui a été lu (et ce qui ne l’a pas été)", desc: "La délimitation honnête du périmètre." },
  { titre: "2. Les problèmes, classés par gravité", desc: "Avec l’effet concret de chacun." },
  { titre: "3. Les risques", desc: "Ce qui n’est pas encore un problème et le deviendra." },
  { titre: "4. Les incohérences", desc: "Deux endroits qui disent deux choses différentes." },
  { titre: "5. Les priorités", desc: "Trois à cinq, pas quinze. Une liste de quinze priorités n’en contient aucune." },
  { titre: "6. L’architecture cible", desc: "Un schéma, et les options rejetées avec leur raison." },
  { titre: "7. La feuille de route", desc: "Datable par vos équipes, avec les dépendances." },
] as const;

export default function RevueArchitecturePage() {
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

      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <p className="portfolio-label">CE QUE VOUS RECEVEZ</p>
          <h2>Un rapport en sept parties</h2>
          <div className="portfolio-grid mt-8">
            {SORTIES.map((sortie) => (
              <div key={sortie.titre} className="portfolio-card">
                <h3 className="text-lg">{sortie.titre}</h3>
                <p className="tone-muted mt-2">{sortie.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="portfolio-section bg-muted">
        <div className="portfolio-wrap">
          <p className="portfolio-label">FORMATS & TARIFS</p>
          <h2>Une grille de prix lisible et assumée</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th className="py-4 font-bold">Format</th>
                  <th className="py-4 font-bold">Durée estimée</th>
                  <th className="py-4 font-bold">Prix</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-4">Revue courte, un seul sujet</td>
                  <td className="py-4">2 jours</td>
                  <td className="py-4 font-mono">1 800 à 3 000 €</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-4">Revue complète</td>
                  <td className="py-4">5 jours</td>
                  <td className="py-4 font-mono">4 500 à 8 000 €</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-4">Revue complète avec restitution en équipe et suivi à 3 mois</td>
                  <td className="py-4">7 jours</td>
                  <td className="py-4 font-mono">8 000 à 14 000 €</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-4">Audit pour investisseur</td>
                  <td className="py-4">Variable</td>
                  <td className="py-4 font-mono">6 000 à 20 000 €</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-4">Revue pour financeur, volet Afrique</td>
                  <td className="py-4">Variable</td>
                  <td className="py-4 font-mono">8 000 à 40 000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <p className="portfolio-label">FRONTIÈRE & CONFORMITÉ</p>
          <h2>Ce que la revue ne fait jamais</h2>
          <div className="portfolio-prose mt-6">
            <ul>
              <li><strong>Aucun conseil juridique nominatif.</strong> Interpréter un texte pour une entreprise donnée et engager sa responsabilité est hors périmètre.</li>
              <li><strong>Aucune vérification par tiers indépendant.</strong> Ce rôle est réservé aux OTI.</li>
              <li><strong>Aucune production de livrable ESG pour le client.</strong> Un client qui a besoin de rapports est orienté vers des produits logiciels ou cabinets.</li>
              <li><strong>Aucun développement logiciel facturé.</strong> Ce n’est pas une agence de développement.</li>
            </ul>
            <div className="mt-8 p-6 bg-muted border-l-4 border-[var(--text)]">
              <h3 className="font-bold">Clause de renvoi obligatoire</h3>
              <p className="mt-2 text-sm">
                La revue ne vend pas un produit STRATA ESG déguisé. Si votre besoin est déjà couvert par un logiciel existant, la conclusion peut être de ne rien construire ici et vous serez redirigé.
              </p>
              <Link href="https://strata-esg.fr" className="mt-4 inline-block font-bold">Utiliser les logiciels STRATA ESG →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-next bg-background border-t border-[var(--border)]">
        <div>
          <p className="portfolio-label">PREMIER ÉCHANGE</p>
          <h2>
            Décrivez le problème,{" "}
            <span className="serif">pas la solution.</span>
          </h2>
          <p>
            Toute demande est soumise à une qualification stricte pour garantir l’indépendance et la faisabilité. 
          </p>
        </div>
        <Link href="/travaillez-avec-moi" className="portfolio-button primary mt-6">
          Soumettre une demande de qualification <span aria-hidden="true">→</span>
        </Link>
        <p className="mt-4 text-sm tone-muted text-center">
          Note de contractualisation : les ventes sont temporairement suspendues dans l’attente de la levée des verrous d’assurance et d’immatriculation. On ne vend pas, on date.
        </p>
      </section>
    </PageShell>
  );
}

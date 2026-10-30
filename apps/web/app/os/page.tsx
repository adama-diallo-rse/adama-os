import type { Metadata } from "next";
import { PageIntro, PageShell } from "../../components/page-shell";
import { Cockpit } from "../../components/cockpit";
import { IntegrityPanel } from "../../components/integrity-panel";
import { cartesProjet } from "../../content/projets";
import { chargerDonnees } from "../../lib/accueil";
import { lireIntegrite } from "../../lib/integrity";

// AXP-09 : l'état du système public, en une seule vue. Le cockpit qui
// ouvrait l'accueil vit ici depuis la refonte du 30 octobre 2026, avec
// toutes ses données réelles et ses états vides honnêtes.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "L’état du système",
  description:
    "Le cockpit public d’ADAMA OS : décisions, trajectoire, registre produits, passerelles, intégrité et livraisons, lus à chaque visite.",
  alternates: { canonical: "/os" },
  openGraph: {
    title: "L’état du système",
    description:
      "Le cockpit public d’ADAMA OS, lu à chaque visite : rien n’y est recopié à la main.",
    url: "/os",
  },
};

export default async function PageOs() {
  const data = await chargerDonnees();
  const passerelles = {
    ok: data.gateways.filter((g) => g.status === "ok").length,
    total: data.gateways.length,
  };
  const integrite = data.integrity;
  const livraison = data.commits[0];
  const etatPasserelle = (s: string) =>
    s === "ok" ? "en ligne" : s === "disabled" ? "désactivée" : "injoignable";
  return (
    <PageShell className="page-os" sommaire={false}>
      <PageIntro
        numero="OS"
        eyebrow="Explorer / l’état du système"
        title="Le cockpit, tel qu’il tourne."
        description="Décisions, trajectoire, produits, passerelles, intégrité et livraisons : chaque bloc lit sa source au moment de votre visite. Une source qui ne répond pas laisse un état vide, jamais une valeur inventée."
      />
      {/* Refonte du 30 octobre 2026 : les outils du cockpit, chacun montré
          en usage, avec ses vraies valeurs à ce rendu. */}
      <section
        className="tuiles os-tuiles"
        aria-label="Les outils du cockpit"
        data-cartes
      >
        <article className="tuile" data-taille="large">
          <div className="tuile-apercu" aria-hidden="true" data-revele-media>
            <div className="mini">
              <div className="mini-ligne">
                <span>&gt;_ commande</span>
                <span>Ctrl K</span>
              </div>
              {["git log", "ping ecosysteme", "theme", "ask adama"].map((c) => (
                <div className="mini-champ" key={c}>
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Le terminal</h3>
            <p>Chaque commande lit les mêmes données que cette page.</p>
          </div>
        </article>
        <article className="tuile" data-taille="petite">
          <div className="tuile-apercu" aria-hidden="true">
            <div className="mini">
              <div className="mini-ligne">
                <span>Contrôles</span>
                <span>
                  {integrite
                    ? `${integrite.reussis} sur ${integrite.reussis + integrite.echoues + integrite.nonExecutes}`
                    : "rapport absent"}
                </span>
              </div>
              <div className="mini-ligne">
                <span>Calcul</span>
                <span>
                  {integrite ? integrite.executedAt.slice(0, 10) : "aucun"}
                </span>
              </div>
            </div>
          </div>
          <div className="tuile-corps">
            <h3>L’intégrité</h3>
            <p>Les contrôles du dépôt, rejoués et datés.</p>
          </div>
        </article>
        <article className="tuile" data-taille="moyenne">
          <div className="tuile-apercu" aria-hidden="true">
            <div className="mini">
              <div className="mini-ligne">
                <span>Passerelles</span>
                <span>
                  {passerelles.total
                    ? `${passerelles.ok} sur ${passerelles.total} répondent`
                    : "aucune configurée"}
                </span>
              </div>
              {data.gateways.slice(0, 3).map((g) => (
                <div className="mini-ligne" key={g.productSlug}>
                  <span>{g.productName}</span>
                  <span>{etatPasserelle(g.status)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Les passerelles</h3>
            <p>
              Les produits du groupe, interrogés à chaque visite, en lecture
              seule.
            </p>
          </div>
        </article>
        <article className="tuile" data-taille="moyenne">
          <div className="tuile-apercu" aria-hidden="true">
            <div className="mini">
              <div className="mini-ligne">
                <span>Dernière livraison</span>
                <span>
                  {livraison ? livraison.date.slice(0, 10) : "dépôt injoignable"}
                </span>
              </div>
              {livraison ? (
                <div className="mini-champ">{livraison.message}</div>
              ) : null}
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Les livraisons</h3>
            <p>Le journal public des dépôts, filtré du bruit.</p>
          </div>
        </article>
      </section>

      <section className="cockpit-integrite" aria-label="Intégrité du système">
        <IntegrityPanel rapport={lireIntegrite()} />
      </section>
      <Cockpit data={data} cartes={cartesProjet()} />
    </PageShell>
  );
}

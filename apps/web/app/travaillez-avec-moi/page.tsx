import type { Metadata } from "next";
import { PageShell, PageIntro } from "../../components/page-shell";

export const metadata: Metadata = {
  title: "Travailler ensemble",
  description: "Diagnostic, revues d’architecture, et accompagnement pour construire des systèmes ESG souverains.",
};

export default function WorkWithMePage() {
  return (
    <PageShell>
      <PageIntro
        eyebrow="Expertise & Accompagnement"
        title="Travailler ensemble"
        description="Une capacité volontairement limitée pour garantir le plus haut niveau d’engagement sur la conception de votre système ESG."
      />
      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <h2 className="section-title">Quatre problèmes, quatre entrées</h2>
          <div className="portfolio-grid mt-8">
            <div className="portfolio-card">
              <h3>Construire</h3>
              <p className="mt-2 font-serif italic">« Nous voulons construire un produit ESG et nous ne savons pas par où commencer »</p>
              <p className="tone-info mt-4">Diagnostic court, puis revue d’architecture</p>
            </div>
            <div className="portfolio-card">
              <h3>Donnée</h3>
              <p className="mt-2 font-serif italic">« Nos données ESG sont dispersées, on ne sait pas d’où vient un chiffre »</p>
              <p className="tone-info mt-4">Revue d’architecture de donnée et modèle cible</p>
            </div>
            <div className="portfolio-card">
              <h3>Intelligence Artificielle</h3>
              <p className="mt-2 font-serif italic">« Nous voulons mettre de l’IA dans nos processus ESG sans dire de bêtises »</p>
              <p className="tone-info mt-4">Atelier d’une journée, puis architecture de validation</p>
            </div>
            <div className="portfolio-card">
              <h3>Système</h3>
              <p className="mt-2 font-serif italic">« Notre organisation produit du désordre, on refait les mêmes arbitrages tous les mois »</p>
              <p className="tone-info mt-4">Accompagnement de trois mois, ou système installé</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="portfolio-section bg-muted">
        <div className="portfolio-wrap">
          <h2 className="section-title">Capacité & Disponibilité</h2>
          <div className="portfolio-prose">
            <p>L’accompagnement est strictement plafonné pour préserver le temps alloué à la construction de l’écosystème logiciel.</p>
            <ul>
              <li><strong>Jusqu’à octobre 2026 :</strong> Zéro mission (mois commerciaux à plein temps).</li>
              <li><strong>Novembre 2026 à février 2027 :</strong> Une revue courte au maximum par mois, sous réserve d’accord.</li>
              <li><strong>À partir de mars 2027 :</strong> Quatre jours vendus par mois au maximum, tout format confondu.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="portfolio-section">
        <div className="portfolio-wrap">
          <h2 className="section-title">Demande de qualification</h2>
          <p className="portfolio-prose mb-8">
            Renseignez ce formulaire. La réponse permet de s’assurer que votre besoin correspond au périmètre d’intervention, avant même notre premier échange.
          </p>
          
          <form className="form-stack mt-8" style={{ maxWidth: '600px' }}>
            <fieldset style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Relation avec STRATA ESG
                </label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }}>
                  <option value="">Sélectionner...</option>
                  <option value="non">Nous ne sommes ni prospect ni client de STRATA</option>
                  <option value="oui">Nous sommes déjà en contact avec STRATA ou client</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Nature de la demande
                </label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }}>
                  <option value="">Sélectionner...</option>
                  <option value="systeme">Conception de système (architecture, flux, modélisation)</option>
                  <option value="esg">Production d’un livrable ESG / CSRD (Bilan carbone, rapport de durabilité)</option>
                </select>
                <p className="text-sm tone-muted mt-2">
                  Le conseil d’architecture ne produit pas de livrables ESG. Ce besoin relève des outils logiciels ou d’un cabinet conseil.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Délai de réalisation souhaité
                </label>
                <select style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)' }}>
                  <option value="">Sélectionner...</option>
                  <option value="urgent">Urgent (Moins de deux semaines)</option>
                  <option value="normal">Normal (Deux semaines et plus)</option>
                </select>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button 
                  type="button" 
                  disabled
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    background: 'var(--text)', 
                    color: 'var(--bg)', 
                    border: 'none', 
                    fontWeight: 'bold',
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }}
                >
                  Formulaire gelé (En attente d’accord légal)
                </button>
              </div>
            </fieldset>
          </form>
          
          <div className="portfolio-prose mt-12 tone-muted">
            <h3>En cas de refus</h3>
            <p>
              <em>Gabarit de refus type, si les conditions de délai, de nature ou de conflit d’intérêt ne sont pas remplies :</em><br/>
              « Je vous remercie pour votre demande. Après lecture, votre besoin sort du périmètre d’architecture stricte sur lequel je peux m’engager, soit pour des raisons de délai, soit parce qu’il relève d’une mission de production ESG ou qu’il croise l’écosystème STRATA. Je ne pourrai donc pas y donner une suite favorable. Je vous souhaite une excellente continuation dans vos projets. »
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

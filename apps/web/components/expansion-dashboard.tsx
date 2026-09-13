import Link from "next/link";
import { EXPANSION_BRANCHES, EXPANSION_INDICATORS } from "../content/expansion";

export function ExpansionDashboard({ compact = false }: { compact?: boolean }) {
  const visibleIndicators = compact
    ? EXPANSION_INDICATORS.slice(0, 4)
    : EXPANSION_INDICATORS;

  return (
    <div
      className={`expansion-dashboard${compact ? " expansion-dashboard-compact" : ""}`}
      aria-label="Tableau de bord du plan d'expansion"
    >
      <div className="expansion-dashboard-bar">
        <div>
          <span className="expansion-dashboard-mark" aria-hidden="true" />
          <strong>ADAMA OS</strong>
          <span>EXPANSION</span>
        </div>
        <p>
          <span className="dashboard-live" aria-hidden="true" /> Référence
          publique
        </p>
      </div>

      <div className="expansion-dashboard-shell">
        <aside aria-label="Sections du cockpit">
          <span className="dashboard-rail-title">COCKPIT</span>
          {["Vue globale", "Actifs", "Méthodes", "Diffusion", "Tenue"].map(
            (item, index) => (
              <span className={index === 0 ? "is-active" : ""} key={item}>
                <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                {item}
              </span>
            ),
          )}
          <span className="dashboard-rail-foot">NV0 / PUBLIC</span>
        </aside>

        <div className="expansion-dashboard-main">
          <div className="dashboard-title-row">
            <div>
              <span>ÉTAT DU SYSTÈME</span>
              <h2>Vue globale</h2>
            </div>
            {!compact && (
              <Link href="/decisions">
                Ouvrir le registre <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>

          <div className="dashboard-overview-grid">
            <article className="dashboard-idea-card">
              <div className="dashboard-card-heading">
                <span>Idées structurées</span>
                <code>AXP</code>
              </div>
              <strong>298</strong>
              <p>Registre AXP, deux identifiants volontairement libres.</p>
              <div
                className="dashboard-corpus-bars"
                aria-label="Composition documentée du plan"
              >
                <span>
                  <i style={{ height: "100%" }} />
                  AXP
                </span>
                <span>
                  <i style={{ height: "70%" }} />
                  TRAVAUX
                </span>
                <span>
                  <i style={{ height: "20%" }} />
                  XINV
                </span>
                <span>
                  <i style={{ height: "10%" }} />
                  XDEC
                </span>
              </div>
            </article>

            <article className="dashboard-branch-card">
              <div className="dashboard-card-heading">
                <span>Architecture</span>
                <code>12 BRANCHES</code>
              </div>
              <div
                className="dashboard-branch-bars"
                aria-label="État des branches"
              >
                <div>
                  <span>
                    <i className="branch-open" />
                    Existantes
                  </span>
                  <b>2</b>
                </div>
                <div>
                  <span>
                    <i className="branch-ready" />
                    Cadre prêt
                  </span>
                  <b>1</b>
                </div>
                <div>
                  <span>
                    <i className="branch-new" />
                    Nouvelles
                  </span>
                  <b>2</b>
                </div>
                <div>
                  <span>
                    <i className="branch-wait" />À ouvrir
                  </span>
                  <b>7</b>
                </div>
              </div>
              <div className="dashboard-branch-track" aria-hidden="true">
                <span style={{ width: "16.67%" }} />
                <span style={{ width: "8.33%" }} />
                <span style={{ width: "16.67%" }} />
                <span style={{ width: "58.33%" }} />
              </div>
            </article>

            <article className="dashboard-proof-card">
              <div className="dashboard-card-heading">
                <span>Exigence de preuve</span>
                <code>XINV-39</code>
              </div>
              <strong>0</strong>
              <p>méthode à l’état PROUVÉ</p>
              <small>
                Une méthode ne monte de niveau qu’après un résultat réel,
                observable et publié.
              </small>
            </article>
          </div>

          <div className="dashboard-indicators">
            {visibleIndicators.map((indicator) => (
              <div key={indicator.label}>
                <span>{indicator.label}</span>
                <strong
                  className={"verified" in indicator ? "is-verified" : ""}
                >
                  {indicator.value}
                </strong>
              </div>
            ))}
          </div>

          {!compact && (
            <div className="dashboard-bottom-row">
              <div>
                <span>CHARGE DOCUMENTÉE</span>
                <strong>208 chantiers</strong>
              </div>
              <div>
                <span>CADRE DE TENUE</span>
                <strong>60 invariants</strong>
              </div>
              <div>
                <span>DÉCISIONS INSCRITES</span>
                <strong>43 XDEC</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExpansionPreview() {
  return (
    <section
      className="expansion-preview"
      aria-labelledby="expansion-preview-title"
    >
      <div className="portfolio-wrap expansion-preview-inner">
        <div className="expansion-preview-copy">
          <p className="portfolio-label">
            <span>01 /</span> PLAN D’EXPANSION
          </p>
          <h2 id="expansion-preview-title">
            Une méthode,
            <br />
            <span className="serif">plusieurs vies utiles.</span>
          </h2>
          <p>
            Le plan transforme un même travail en décision publique, méthode,
            actif, publication, transmission ou logiciel. Chaque sortie garde sa
            source, son statut, son niveau de maturité et ses limites.
          </p>
          <Link className="portfolio-button primary" href="/expansion">
            Explorer le système <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="expansion-preview-map">
          <div
            className="expansion-branch-cloud"
            aria-label="Les douze branches"
          >
            {EXPANSION_BRANCHES.map((branch, index) => (
              <span
                key={branch.name}
                className={
                  index === 0 || branch.name === "STRATA ESG" ? "is-live" : ""
                }
              >
                <i>{String(index + 1).padStart(2, "0")}</i>
                {branch.name}
              </span>
            ))}
          </div>
          <div className="expansion-boundary">
            <div>
              <span>ADAMA OS</span>
              <strong>Méthode, gabarit, parcours ou avis</strong>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>STRATA ESG</span>
              <strong>Logiciel opérationnel</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

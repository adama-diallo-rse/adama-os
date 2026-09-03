// =====================================================================
// C3-T1, la matrice de sante.
//
// Une capacite par ligne, trois etats, et la raison en une phrase quand
// l'etat n'est pas operationnel. Rien d'autre.
//
// Trois regles de rendu, toutes verrouillees par tests/health.test.tsx :
//   - aucun etat global. Il n'y a pas de pastille verte en haut de cette
//     vue, et il n'y en aura pas : un vert qui agrege sept etats differents
//     est un mensonge de synthese ;
//   - la distinction ne repose jamais sur la seule couleur. Chaque etat
//     porte une forme, un libelle ecrit en toutes lettres et une couleur ;
//   - le depliage des criteres est un vrai element depliable, donc utilisable
//     au clavier et annonce par un lecteur d'ecran, jamais un panneau ouvert
//     par un gestionnaire de clic.
// =====================================================================

import {
  HEALTH_DESCRIPTION,
  HEALTH_LABEL,
  VERDICT_LABEL,
  countByState,
  type CapabilityHealth,
  type CriterionVerdict,
  type HealthMatrix as Matrix,
  type HealthState,
} from "../lib/health/types";

function Glyphe({ state }: { state: HealthState }) {
  const common = {
    className: "health-glyph",
    viewBox: "0 0 12 12",
    "aria-hidden": true,
    focusable: "false" as const,
  };
  if (state === "operationnel") {
    return (
      <svg {...common}>
        <circle cx="6" cy="6" r="4.5" fill="currentColor" />
      </svg>
    );
  }
  if (state === "degrade") {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="10" height="10" fill="currentColor" />
        <path d="M2.4 6h7.2" stroke="var(--health-face)" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect
        x="1.2"
        y="1.2"
        width="9.6"
        height="9.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="2.6 2"
      />
    </svg>
  );
}

/** Le marqueur d'etat. Forme, libelle et couleur, toujours les trois. */
export function HealthMark({ state }: { state: HealthState }) {
  return (
    <span className={`health-mark health-mark--${state}`} data-state={state}>
      <Glyphe state={state} />
      <span className="health-mark-label">{HEALTH_LABEL[state]}</span>
      <span className="proof-sr">{HEALTH_DESCRIPTION[state]}</span>
    </span>
  );
}

function VerdictMark({ verdict }: { verdict: CriterionVerdict }) {
  const signe = verdict === "tenu" ? "✓" : verdict === "non_tenu" ? "✕" : "·";
  return (
    <span className={`health-verdict health-verdict--${verdict}`}>
      <span aria-hidden="true">{signe}</span>
      <span className="health-verdict-label">{VERDICT_LABEL[verdict]}</span>
    </span>
  );
}

function Ligne({ capability }: { capability: CapabilityHealth }) {
  const tenus = capability.criteria.filter((c) => c.verdict === "tenu").length;
  return (
    <li className="health-row" data-state={capability.state}>
      <div className="health-row-head">
        <div className="health-row-identity">
          <h3>{capability.name}</h3>
          <p className="health-purpose">{capability.purpose}</p>
        </div>
        <HealthMark state={capability.state} />
      </div>

      {capability.reason ? (
        <p className="health-reason">{capability.reason}</p>
      ) : null}

      <details className="health-criteria">
        <summary>
          <span>Les critères</span>
          <span className="health-criteria-count">
            {tenus} / {capability.criteria.length} tenus
          </span>
        </summary>
        <ul>
          {capability.criteria.map((c) => (
            <li key={c.id}>
              <VerdictMark verdict={c.verdict} />
              <span className="health-criterion-label">{c.label}</span>
              <span className="health-criterion-observed">{c.observed}</span>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * La matrice. Le compteur en tete COMPTE, il ne conclut pas : il donne le
 * nombre de capacites dans chaque etat, jamais une note ni une moyenne.
 */
export function HealthMatrix({ matrix }: { matrix: Matrix }) {
  const compte = countByState(matrix.capabilities);
  return (
    <section className="health-matrix" aria-labelledby="matrice-title">
      <div className="health-matrix-head">
        <div>
          <p className="portfolio-label">SANTÉ PAR CAPACITÉ</p>
          <h2 id="matrice-title">
            Sept capacités, <span className="serif">trois états.</span>
          </h2>
          <p className="health-matrix-intro">
            Santé n’est pas disponibilité. Une capacité qui répond mais ne
            remplit pas ses critères métier est dégradée, et elle le dit. Il n’y
            a volontairement aucun état global sur cette page : un vert unique
            qui résumerait sept états différents serait un mensonge de synthèse.
          </p>
        </div>
        <ul className="health-count" aria-label="Répartition des capacités">
          {(["operationnel", "degrade", "indetermine"] as HealthState[]).map(
            (etat) => (
              <li key={etat} data-state={etat}>
                <strong>{compte[etat]}</strong>
                <span>{HEALTH_LABEL[etat]}</span>
              </li>
            ),
          )}
        </ul>
      </div>

      <ul className="health-rows">
        {matrix.capabilities.map((c) => (
          <Ligne key={c.id} capability={c} />
        ))}
      </ul>

      <p className="health-observed">
        Relevé le{" "}
        <time dateTime={matrix.observedAt}>
          {new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }).format(new Date(matrix.observedAt))}{" "}
          UTC
        </time>
        . Cette page est calculée à chaque visite : elle ne conserve aucun état
        d’une visite à l’autre.
      </p>
    </section>
  );
}

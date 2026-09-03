// =====================================================================
// C1-T4, le composant de classe.
//
// SEUL endroit du dépôt qui décide du rendu d'un marqueur de provenance.
// Aucun autre composant ne recompose un marqueur à la main : si le rendu
// d'une classe doit changer, il change ici, une fois, partout.
//
// La distinction ne repose jamais sur la seule couleur. Chaque état porte
// trois signaux redondants : une forme (disque, losange, carré hachuré,
// carré barré, disque barré), un libellé écrit en toutes lettres, et une
// couleur de la palette fermée. La page reste lisible en niveaux de gris,
// à l'impression, et en mode contraste élevé.
//
// Les glyphes sont des SVG en ligne de moins de vingt lignes. Aucune
// bibliothèque d'icônes.
// =====================================================================

import type { ReactNode } from "react";
import {
  CLAIM_STATE_DESCRIPTION,
  CLAIM_STATE_LABEL,
  FAILURE_LABEL,
  type Claim,
  type ClaimState,
} from "../../lib/proof/types";

export type ProofTone = "light" | "dark";

/** Date lisible, en UTC pour éviter tout écart entre serveur et client. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "jamais";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "date illisible";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Date et heure lisibles, en UTC. Utilisé sur la page de vérification. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "jamais observée";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "date illisible";
  }
  return `${new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)} à ${new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d)} UTC`;
}

function Glyph({ state }: { state: ClaimState }) {
  const common = {
    className: "proof-glyph",
    viewBox: "0 0 12 12",
    "aria-hidden": true,
    focusable: "false" as const,
  };
  if (state === "real") {
    return (
      <svg {...common}>
        <circle cx="6" cy="6" r="4.5" fill="currentColor" />
      </svg>
    );
  }
  if (state === "historical") {
    return (
      <svg {...common}>
        <path d="M6 1.2 10.8 6 6 10.8 1.2 6Z" fill="currentColor" />
      </svg>
    );
  }
  if (state === "demo") {
    return (
      <svg {...common}>
        <rect x="1" y="1" width="10" height="10" fill="currentColor" />
        <path
          d="M1 8 8 1M4 11 11 4"
          stroke="var(--proof-face)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }
  if (state === "absent") {
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
        />
        <path d="M1.2 10.8 10.8 1.2" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle
        cx="6"
        cy="6"
        r="4.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M1.6 6h8.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/** Détail affiché à droite du libellé, selon l'état. */
function detailOf<T>(claim: Claim<T>, state: ClaimState): string | null {
  if (state === "historical") {
    return formatDate(claim.publishedAt ?? claim.fetchedAt);
  }
  if (state === "real") {
    return claim.source;
  }
  if (state === "stale") {
    return `relevée le ${formatDate(claim.fetchedAt)}`;
  }
  if (state === "absent") {
    const attente = claim.source ? `attendue de ${claim.source}` : null;
    const cause = claim.failure ? FAILURE_LABEL[claim.failure] : null;
    return [attente, cause].filter(Boolean).join(", ") || null;
  }
  return null;
}

/**
 * Le marqueur de classe. `state` peut être passé directement quand
 * l'appelant l'a déjà résolu, pour ne pas relire l'horloge deux fois et
 * risquer deux rendus différents dans la même page.
 */
export function DataClassMark<T>({
  claim,
  state,
  tone = "light",
  detail = true,
}: {
  claim: Claim<T>;
  state: ClaimState;
  tone?: ProofTone;
  detail?: boolean;
}) {
  const label = CLAIM_STATE_LABEL[state];
  const texte = detail ? detailOf(claim, state) : null;
  const annonce = `${CLAIM_STATE_DESCRIPTION[state]}${
    texte ? ` ${texte}.` : ""
  }`;

  return (
    <span
      className={`proof-mark proof-mark--${state}${
        tone === "dark" ? " proof-mark--dark" : ""
      }`}
      data-proof-state={state}
    >
      <Glyph state={state} />
      <span className="proof-mark-label">{label}</span>
      {texte ? <span className="proof-mark-detail">{texte}</span> : null}
      <span className="proof-sr">{annonce}</span>
    </span>
  );
}

/**
 * Le bloc de provenance complet, sous une valeur ou une affirmation.
 * Rien n'est masqué : la source attendue s'affiche même quand elle n'a pas
 * répondu, sinon une absence ressemblerait à une omission.
 */
export function ProofProvenance<T>({
  claim,
  state,
  tone = "light",
  extra,
}: {
  claim: Claim<T>;
  state: ClaimState;
  tone?: ProofTone;
  extra?: ReactNode;
}) {
  const releve =
    state === "historical"
      ? formatDate(claim.publishedAt ?? claim.fetchedAt)
      : formatDate(claim.fetchedAt);
  const libelleReleve = state === "historical" ? "Publié le" : "Relevé le";

  return (
    <dl
      className={`proof-provenance${
        tone === "dark" ? " proof-provenance--dark" : ""
      }`}
    >
      <div>
        <dt>Source</dt>
        <dd>{claim.source}</dd>
      </div>
      <div>
        <dt>Méthode</dt>
        <dd>{claim.method}</dd>
      </div>
      <div>
        <dt>{libelleReleve}</dt>
        <dd>
          {claim.fetchedAt || claim.publishedAt ? (
            <time dateTime={claim.publishedAt ?? claim.fetchedAt ?? undefined}>
              {releve}
            </time>
          ) : (
            "jamais observée"
          )}
        </dd>
      </div>
      {state === "absent" && claim.lastAttemptAt ? (
        <div>
          <dt>Tentative</dt>
          <dd>
            <time dateTime={claim.lastAttemptAt}>
              {formatDate(claim.lastAttemptAt)}
            </time>
            {claim.failure ? `, ${FAILURE_LABEL[claim.failure]}` : ""}
          </dd>
        </div>
      ) : null}
      {extra}
    </dl>
  );
}

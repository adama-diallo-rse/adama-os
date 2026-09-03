// =====================================================================
// C1-T3, le rendu d'une valeur chiffrée.
//
// Ce composant est la seule porte d'entrée pour afficher une métrique. Il
// n'accepte pas de `number` : il accepte un `Claim<number>`. La conséquence
// est volontaire, on ne peut pas afficher un chiffre sans avoir dit d'où il
// vient, comment il a été obtenu et quand.
//
// Un état `absent` n'affiche jamais de valeur, et surtout jamais un zéro :
// un zéro est une mesure, l'absence n'en est pas une.
// =====================================================================

import type { ReactNode } from "react";
import { AnimatedNumber } from "../animated-number";
import { DataClassMark, ProofProvenance, type ProofTone } from "./data-class";
import { resolveClaimState, type Claim } from "../../lib/proof/types";

/** Décimales : 1 pour les valeurs non entières, 0 sinon. */
function decimalsOf(value: number): number {
  return Number.isInteger(value) ? 0 : 1;
}

export function ClaimNumber({
  claim,
  tone = "light",
  className,
  animate = true,
  now,
}: {
  claim: Claim<number>;
  tone?: ProofTone;
  className?: string;
  /** Faux pour un rendu figé (impression, pack de preuve, capture). */
  animate?: boolean;
  /** Instant de référence, injecté pour rendre l'état testable. */
  now?: Date;
}) {
  const state = resolveClaimState(claim, now);

  if (claim.value === null || claim.value === undefined) {
    return (
      <span className={className}>
        {/* Zone barrée, sans aucun caractère. Un tiret, un zéro ou un « n/a »
            se lisent comme une valeur, or il n'y en a pas. Le marqueur de
            classe rendu juste en dessous porte le sens, celui-ci porte
            l'emplacement vide. */}
        <span className="proof-value-absent" aria-hidden="true" />
        <span className="proof-sr">
          Valeur indisponible. La source attendue est {claim.source}.
        </span>
      </span>
    );
  }

  const decimals = decimalsOf(claim.value);
  const suffix = claim.suffix ?? "";

  if (!animate) {
    return (
      <span className={className}>
        {new Intl.NumberFormat("fr-FR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(claim.value)}
        {suffix}
      </span>
    );
  }

  return (
    <AnimatedNumber
      value={claim.value}
      decimals={decimals}
      suffix={suffix}
      className={className}
    />
  );
}

/**
 * Valeur, marqueur de classe et provenance, dans cet ordre de lecture.
 * `label` est le libellé de la métrique, rendu au-dessus.
 */
export function ClaimTile({
  label,
  claim,
  tone = "light",
  valueClassName,
  provenanceClassName,
  extra,
  now,
}: {
  label: string;
  claim: Claim<number>;
  tone?: ProofTone;
  valueClassName?: string;
  provenanceClassName?: string;
  /** Lignes de provenance supplémentaires, propres à la page appelante. */
  extra?: ReactNode;
  now?: Date;
}) {
  const state = resolveClaimState(claim, now);

  return (
    <>
      <p className="portfolio-label">{label}</p>
      <ClaimNumber
        claim={claim}
        tone={tone}
        className={valueClassName}
        now={now}
      />
      {claim.period ? <p className="metric-period">{claim.period}</p> : null}
      <p className="proof-value-mark">
        <DataClassMark claim={claim} state={state} tone={tone} />
      </p>
      <div className={provenanceClassName}>
        <ProofProvenance
          claim={claim}
          state={state}
          tone={tone}
          extra={extra}
        />
      </div>
    </>
  );
}

// =====================================================================
// C2-T2, l'enveloppe universelle d'une affirmation.
//
// À partir d'ici, aucun texte d'affirmation vérifiable ne s'écrit en dur
// dans un autre composant. Une affirmation arrive de `proof_claims`, elle
// porte sa classe, et elle porte un chemin vers sa vérification.
//
// Le composant ne sait pas rendre une affirmation sans preuve : la liste
// qu'il reçoit vient de lib/proof/claims.ts, qui les a déjà écartées. C'est
// volontaire, la règle est tenue à la lecture et pas à l'affichage, pour
// qu'aucun appelant ne puisse la contourner par distraction.
// =====================================================================

import Link from "next/link";
import { DataClassMark, ProofProvenance, type ProofTone } from "./data-class";
import type { ProofClaim } from "../../lib/proof/claims";
import { SUBJECT_LABEL } from "../../lib/proof/claims";

export function Proof({
  claim,
  tone = "light",
  showProvenance = true,
  headingLevel = "p",
}: {
  claim: ProofClaim;
  tone?: ProofTone;
  showProvenance?: boolean;
  /** `p` par défaut : une affirmation n'est pas un titre de section. */
  headingLevel?: "p" | "h2" | "h3";
}) {
  const Statement = headingLevel;
  const { row, state } = claim;

  return (
    <article className="proof-claim" data-proof-state={state} id={row.id}>
      <p className="portfolio-label">
        {SUBJECT_LABEL[row.subject_type]}
        {row.subject_ref ? ` · ${row.subject_ref}` : ""}
      </p>
      <Statement className="proof-claim-statement">{row.statement}</Statement>
      <div className="proof-claim-footer">
        <DataClassMark claim={claim.claim} state={state} tone={tone} />
        <Link className="proof-verify-link" href={`/verifier/${row.id}`}>
          Vérifier <span aria-hidden="true">→</span>
          <span className="proof-sr">l’affirmation : {row.statement}</span>
        </Link>
        <span className="proof-index-subject">
          {claim.evidence.length} preuve{claim.evidence.length > 1 ? "s" : ""}
        </span>
      </div>
      {showProvenance ? (
        <ProofProvenance claim={claim.claim} state={state} tone={tone} />
      ) : null}
    </article>
  );
}

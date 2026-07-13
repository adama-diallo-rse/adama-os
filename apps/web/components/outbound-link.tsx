"use client";

// Lien externe vers un produit STRATA, avec tracking PostHog gate par le
// consentement (captureEvent est no-op sans consentement ou sans cle PostHog,
// donc ce composant ne casse jamais la navigation).
import type { ReactNode } from "react";
import { captureEvent } from "../lib/analytics";

export function OutboundLink({
  href,
  produit,
  source,
  className,
  children,
}: {
  href: string;
  /** Slug du produit STRATA cible (ex: "esg-optimizer", "strata-scope"). */
  produit: string;
  /** D'ou vient le clic (ex: "nav", "layer-d", "strata-hub", "terminal"). */
  source: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => captureEvent("strata_outbound", { produit, source })}
    >
      {children}
    </a>
  );
}

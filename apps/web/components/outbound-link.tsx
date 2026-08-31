"use client";

// Lien externe vers un produit du groupe, avec tracking PostHog gaté par le
// consentement (captureEvent est no-op sans consentement ou sans clé PostHog,
// donc ce composant ne casse jamais la navigation) et paramètres UTM posés
// par lib/outbound, en un seul endroit.
import type { ReactNode } from "react";
import { captureEvent } from "../lib/analytics";
import {
  LEGACY_OUTBOUND_EVENT,
  OUTBOUND_EVENT,
  legacyOutboundProperties,
  outboundProperties,
  withUtm,
} from "../lib/outbound";

export function OutboundLink({
  href,
  product,
  division = "",
  source,
  className,
  children,
}: {
  href: string;
  /** Slug du produit ciblé (ex: "esg-optimizer", "strata-scope"). */
  product: string;
  /** Division du groupe (STRATA, IROKO). Vide si sans objet. */
  division?: string;
  /** D'où vient le clic (ex: "nav", "layer-d", "ecosysteme", "terminal"). */
  source: string;
  className?: string;
  children: ReactNode;
}) {
  const ctx = { product, division, source };
  return (
    <a
      href={withUtm(href, source)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        captureEvent(OUTBOUND_EVENT, outboundProperties(ctx));
        // Double émission jusqu'au 30 septembre 2026, voir lib/outbound.
        captureEvent(LEGACY_OUTBOUND_EVENT, legacyOutboundProperties(ctx));
      }}
    >
      {children}
    </a>
  );
}

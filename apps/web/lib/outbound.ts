// L6-T14 / L7-T2, sorties tracées vers les produits du groupe.
//
// Une seule convention, appliquée à un seul endroit (components/outbound-link)
// et testée. Rien n'est recopié dans les composants appelants.
//
// Nom d'événement : le périmètre est le groupe depuis le 19 juillet 2026,
// l'événement s'appelle donc "ecosystem_outbound". L'ancien nom
// "strata_outbound" continue d'être émis en parallèle pour ne pas trouer
// l'historique PostHog des tableaux déjà construits.
export const OUTBOUND_EVENT = "ecosystem_outbound";
export const LEGACY_OUTBOUND_EVENT = "strata_outbound";

/**
 * Date de retrait de la double émission.
 * À cette date : supprimer LEGACY_OUTBOUND_EVENT, la fonction
 * legacyOutboundProperties, et l'appel correspondant dans outbound-link.tsx
 * et terminal.tsx. Les tableaux PostHog doivent d'ici là pointer sur
 * ecosystem_outbound.
 */
export const LEGACY_OUTBOUND_REMOVAL_DATE = "2026-09-30";

export type OutboundContext = {
  /** Slug du produit ciblé (ecosystem_products.slug). */
  product: string;
  /** Division du groupe (STRATA, IROKO, Cockpit). Vide si sans objet. */
  division: string;
  /** D'où vient le clic : "nav", "layer-d", "ecosysteme", "terminal". */
  source: string;
};

/** Propriétés de l'événement courant. */
export function outboundProperties(ctx: OutboundContext) {
  return { product: ctx.product, division: ctx.division, source: ctx.source };
}

/** Propriétés de l'événement historique, à l'identique de l'ancien format. */
export function legacyOutboundProperties(ctx: OutboundContext) {
  return { produit: ctx.product, source: ctx.source };
}

const UTM_SOURCE = "adama-os";
const UTM_MEDIUM = "cockpit";

/**
 * Ajoute les paramètres UTM à un lien sortant.
 *
 * Règles : uniquement sur une URL http(s) absolue, jamais sur un lien interne ;
 * on ne remplace jamais un utm_source déjà posé (un lien de campagne existant
 * garde son attribution) ; l'URL est rendue telle quelle si elle est invalide,
 * car un lien qui fonctionne vaut mieux qu'une attribution parfaite.
 */
export function withUtm(href: string, source: string): string {
  if (!/^https?:\/\//i.test(href)) {
    return href;
  }
  try {
    const url = new URL(href);
    if (url.searchParams.has("utm_source")) {
      return url.toString();
    }
    url.searchParams.set("utm_source", UTM_SOURCE);
    url.searchParams.set("utm_medium", UTM_MEDIUM);
    if (source) {
      url.searchParams.set("utm_campaign", source);
    }
    return url.toString();
  } catch {
    return href;
  }
}

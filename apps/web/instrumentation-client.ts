// Initialisation Sentry cote navigateur (Next.js >= 15.3 / 16).
//
// Refonte du 30 octobre 2026 : Sentry est importe au repos du navigateur,
// et non plus au premier octet. Son paquet pesait plus que la page
// d'accueil elle-meme dans le chemin critique (mesure Lighthouse du meme
// jour). Contrepartie, ecrite ici pour qu'elle ne surprenne personne : une
// erreur levee pendant la toute premiere seconde, avant le repos du
// navigateur, n'est pas remontee.
//
// 17 novembre 2026 : Sentry ne se charge plus qu'avec le consentement. Le
// bandeau annonçait « aucun tracking tiers » pendant que chaque visite
// envoyait ses erreurs et ses mesures de navigation à sentry.io. Il se
// charge désormais au repos si le visiteur a déjà accepté, ou au moment où
// il accepte. Un refus, ou une absence de choix, ne charge rien : ni le
// paquet (186 Ko), ni aucun envoi. Les erreurs côté serveur restent
// remontées par sentry.server.config.ts, sans donnée de navigation.

import { CONSENT_GRANTED_EVENT, getStoredConsent } from "./lib/analytics";

type Repos = (rappel: () => void, options?: { timeout: number }) => number;
type ModuleSentry = typeof import("@sentry/nextjs");

let sentry: ModuleSentry | null = null;
let demarre = false;

function charger() {
  if (demarre) return;
  demarre = true;
  import("@sentry/nextjs")
    .then((module) => {
      module.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 1,
        enabled: true,
        debug: false,
      });
      sentry = module;
    })
    .catch(() => {
      // Sentry injoignable : le site fonctionne sans lui.
    });
}

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  if (getStoredConsent() === "granted") {
    const w = window as Window & { requestIdleCallback?: Repos };
    if (w.requestIdleCallback)
      w.requestIdleCallback(charger, { timeout: 4000 });
    else window.setTimeout(charger, 2000);
  } else {
    window.addEventListener(CONSENT_GRANTED_EVENT, charger, { once: true });
  }
}

// Instrumente les transitions de navigation App Router, une fois Sentry
// charge. Avant, la transition n'est simplement pas mesuree.
export function onRouterTransitionStart(
  ...args: Parameters<ModuleSentry["captureRouterTransitionStart"]>
) {
  sentry?.captureRouterTransitionStart(...args);
}

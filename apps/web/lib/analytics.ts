// L6-T3 / L8-T4 — Analytics PostHog (région UE), gaté par le consentement.
// Sans NEXT_PUBLIC_POSTHOG_KEY ou sans consentement, tout est no-op :
// la vitrine ne dépend jamais de l'analytics pour fonctionner.
//
// Flux RGPD :
//   - consentement inconnu → les événements sont mis en file (max 20),
//     PostHog n'est PAS chargé, aucun cookie/storage analytics posé ;
//   - "granted"  → init PostHog + envoi de la file ;
//   - "denied"   → file vidée, captures ignorées définitivement.

import type { PostHog } from "posthog-js";

export type ConsentValue = "granted" | "denied";

export const CONSENT_KEY = "adama-consent";
/** Événement fenêtre pour rouvrir le bandeau (lien "cookies" du footer). */
export const CONSENT_OPEN_EVENT = "adama:consent-open";

let clientPromise: Promise<PostHog | null> | null = null;
let queue: { event: string; properties?: Record<string, unknown> }[] = [];

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function initPosthog(): Promise<PostHog | null> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key || typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (!clientPromise) {
    clientPromise = import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(key, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ||
            "https://eu.i.posthog.com",
          capture_pageview: true,
          persistence: "localStorage",
        });
        return posthog;
      })
      .catch(() => null);
  }
  return clientPromise;
}

/** Au montage de l'app : démarre PostHog si le consentement est déjà donné
 *  (visites suivantes), pour que les pageviews soient capturées. */
export function bootAnalytics() {
  if (getStoredConsent() === "granted") {
    void initPosthog();
  }
}

/** Enregistre le choix de l'utilisateur et agit en conséquence. */
export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // stockage indisponible : le choix vaut pour la session
  }
  if (value === "granted") {
    const pending = queue;
    queue = [];
    void initPosthog().then((posthog) => {
      if (!posthog) {
        return;
      }
      for (const { event, properties } of pending) {
        posthog.capture(event, properties);
      }
    });
  } else {
    queue = [];
  }
}

/** Capture un événement, en tâche de fond, sans jamais lever d'erreur. */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  const consent = getStoredConsent();
  if (consent === "denied") {
    return;
  }
  if (consent === null) {
    // Choix pas encore fait : on mémorise, setConsent("granted") enverra.
    queue = [...queue.slice(-19), { event, properties }];
    return;
  }
  void initPosthog().then((posthog) => {
    posthog?.capture(event, properties);
  });
}

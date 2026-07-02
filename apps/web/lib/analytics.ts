// L6-T3 — Analytics PostHog, chargement paresseux et jamais bloquant.
// Sans NEXT_PUBLIC_POSTHOG_KEY, toutes les captures sont des no-op :
// la vitrine ne dépend jamais de l'analytics pour fonctionner.

import type { PostHog } from "posthog-js";

let clientPromise: Promise<PostHog | null> | null = null;

function getPosthog(): Promise<PostHog | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) {
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

/** Capture un événement, en tâche de fond, sans jamais lever d'erreur. */
export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  void getPosthog().then((posthog) => {
    posthog?.capture(event, properties);
  });
}

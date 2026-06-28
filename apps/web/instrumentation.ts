// Point d'entree d'instrumentation Next.js (serveur + edge).
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture les erreurs des Server Components, route handlers et data fetching.
export const onRequestError = Sentry.captureRequestError;

// Initialisation Sentry cote serveur (runtime Node.js).
// Charge par instrumentation.ts via register().
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // 100% des traces au demarrage du projet ; a baisser quand le trafic monte.
  tracesSampleRate: 1,
  // Sans DSN, Sentry reste inactif.
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  debug: false,
});

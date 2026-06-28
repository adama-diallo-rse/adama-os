// Initialisation Sentry cote navigateur (Next.js >= 15.3 / 16).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  debug: false,
});

// Instrumente les transitions de navigation App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

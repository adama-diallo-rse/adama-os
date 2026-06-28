import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@adama/ui", "@adama/db"],
};

export default withSentryConfig(nextConfig, {
  // Upload des source maps (silencieux hors CI, ignore si org/projet absents).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Meilleure resolution des stack traces cote client.
  widenClientFileUpload: true,
  // Retire les logs Sentry du bundle client.
  disableLogger: true,
});

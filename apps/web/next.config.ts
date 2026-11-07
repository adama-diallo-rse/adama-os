import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@adama/ui", "@adama/db"],

  // 7 novembre 2026 : les photographies de l'accueil sont fournies en
  // 3840 pixels. Next les sert à la taille de l'écran, en AVIF quand le
  // navigateur le lit, en WebP sinon. La qualité 85 est réservée aux
  // photographies (PhotoCadre) ; tout le reste garde 75, la valeur par
  // défaut.
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },

  // L6-T13 : le hub produits s'appelle /ecosysteme depuis le 31 août 2026.
  // /strata a été partagé à l'extérieur, la redirection est permanente et le
  // fragment amène directement sur la division STRATA ESG de la nouvelle page.
  async redirects() {
    return [
      // 7 novembre 2026 : la page À propos quitte l'adresse /recruteur,
      // héritée de la recherche de poste close le 10 octobre.
      {
        source: "/recruteur",
        destination: "/a-propos",
        permanent: true,
      },
      {
        source: "/strata",
        destination: "/ecosysteme#strata",
        permanent: true,
      },
      // 30 octobre 2026 : les fiches ESG Optimizer et STRATA Scope sont
      // réunies dans la fiche STRATA ESG. Leurs adresses ont été partagées :
      // elles mènent à l'ancre du produit, de façon permanente.
      {
        source: "/projets/esg-optimizer",
        destination: "/projets/strata-esg#esg-optimizer",
        permanent: true,
      },
      {
        source: "/projets/strata-scope",
        destination: "/projets/strata-esg#strata-scope",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Upload des source maps (silencieux hors CI, ignore si org/projet absents).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Meilleure resolution des stack traces cote client.
  widenClientFileUpload: true,
});

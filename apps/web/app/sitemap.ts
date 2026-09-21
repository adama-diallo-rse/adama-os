import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "../lib/site";
import { listClaims } from "../lib/proof/claims";
import { listAdr } from "../lib/adr";
import { FICHES } from "../content/projets";

// L8-T9, sitemap.
//
// Ne sont listees que les URL servies par ce domaine. Les produits du groupe
// vivent sur leurs propres domaines : les faire figurer ici serait declarer a
// Google des pages que ce site ne sert pas. Le registre ecosystem_products
// n'ajoute donc aucune URL a ce fichier, et c'est volontaire ; il alimente le
// contenu de /ecosysteme, pas la liste des adresses.
//
// La home en mode recruteur (?for=recruiter) est une variante de la meme page,
// pas une URL canonique : elle n'est pas listee. /recruteur, en revanche, est
// une page a part entiere, citable et partageable, donc listee.
//
// C6 : les pages de decision sont listees une par une, lues en base. Une
// decision que Adama n'a pas relue n'est pas servie, donc pas listee : le
// sitemap ne peut pas annoncer une adresse que la base refuse de servir.
//
// C2 : les pages de verification sont listees une par une, lues en base. Ce
// sont des adresses permanentes citables dans un CV, elles doivent etre
// indexables. Seules les affirmations de visibilite publique y figurent : une
// affirmation technique reste servie mais hors index, c'est ce que sa
// visibilite veut dire. Si la base ne repond pas, le sitemap se reduit aux
// pages fixes plutot que d'echouer.
// Rendu a la demande : la liste des pages de verification est lue en base.
// Un sitemap fige au build annoncerait les preuves du jour de la
// construction, pas celles du jour de la lecture.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();
  const decisions = await listAdr()
    .then((liste) =>
      liste.map((d) => ({
        url: absoluteUrl(`/decisions/${d.adr_id}`),
        lastModified: new Date(d.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    )
    .catch(() => []);
  const preuves = await listClaims({ visibility: ["public"], now: maintenant })
    .then((claims) =>
      claims.map((c) => ({
        url: absoluteUrl(`/verifier/${c.row.id}`),
        lastModified: new Date(c.row.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    )
    .catch(() => []);

  return [
    {
      url: SITE_URL,
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/recruteur"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...FICHES.map((f) => ({
      url: absoluteUrl(`/projets/${f.slug}`),
      lastModified: maintenant,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/decisions"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...decisions,
    {
      url: absoluteUrl("/revirements"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/principes"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/lettre"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/articles/methode-de-preuve"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl("/articles/methode-de-preuve"),
          en: absoluteUrl("/en/articles/proof-method"),
        },
      },
    },
    {
      url: absoluteUrl("/en/articles/proof-method"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl("/articles/methode-de-preuve"),
          en: absoluteUrl("/en/articles/proof-method"),
        },
      },
    },
    {
      url: absoluteUrl("/articles/sept-contraintes-donnee-esg-afrique-ouest"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl(
            "/articles/sept-contraintes-donnee-esg-afrique-ouest",
          ),
          en: absoluteUrl(
            "/en/articles/seven-constraints-west-african-esg-data",
          ),
        },
      },
    },
    {
      url: absoluteUrl("/en/articles/seven-constraints-west-african-esg-data"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl(
            "/articles/sept-contraintes-donnee-esg-afrique-ouest",
          ),
          en: absoluteUrl(
            "/en/articles/seven-constraints-west-african-esg-data",
          ),
        },
      },
    },
    {
      url: absoluteUrl("/articles/architecture-donnee-esg-afrique-ouest"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl("/articles/architecture-donnee-esg-afrique-ouest"),
          en: absoluteUrl("/en/articles/west-african-esg-data-architecture"),
        },
      },
    },
    {
      url: absoluteUrl("/en/articles/west-african-esg-data-architecture"),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "yearly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: absoluteUrl("/articles/architecture-donnee-esg-afrique-ouest"),
          en: absoluteUrl("/en/articles/west-african-esg-data-architecture"),
        },
      },
    },
    {
      url: absoluteUrl("/systeme"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/ecosysteme"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/metrics"),
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/preuves"),
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...preuves,
    {
      url: absoluteUrl("/technique"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/journal"),
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/changelog"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/systeme/pannes"),
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/erreurs"),
      lastModified: new Date("2026-09-19"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/confiance"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/mentions-legales"),
      lastModified: maintenant,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/confidentialite"),
      lastModified: maintenant,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}

import { defineArrayMember, defineField, defineType } from "sanity";

// L5-T2 — Article de veille.
// Créé en BROUILLON par le job Trigger.dev (synthèse OpenAI). Adama relit dans
// le Studio et clique « Publier » : la validation 1 clic de la roadmap.
// La page publique /veille ne lit que les documents publiés (client useCdn).
export const veilleArticleType = defineType({
  name: "veilleArticle",
  title: "Article de veille",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Résumé",
      type: "text",
      rows: 3,
      description: "2 à 3 phrases. Sert de chapô et de meta description SEO.",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "body",
      title: "Contenu",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "reference",
      to: [{ type: "source" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
    }),
    defineField({
      name: "originalUrl",
      title: "Lien d'origine",
      type: "url",
      description: "URL de la publication source (EFRAG, GHG Protocol...).",
    }),
    defineField({
      name: "externalId",
      title: "Identifiant externe (dédup)",
      type: "string",
      readOnly: true,
      description:
        "Clé de nouveauté calculée par le job. Ne pas modifier à la main.",
    }),
    defineField({
      name: "publishedAt",
      title: "Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: "Date (récent d'abord)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "source.title" },
  },
});

import { defineField, defineType } from "sanity";

// L5-T2 — Tag de taxonomie (CSRD, ESRS E1, taxonomie UE, ...).
// Upsert par le job avec un _id déterministe (tag.<slug>) pour éviter les
// doublons quand la synthèse propose un thème déjà existant.
export const tagType = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Libellé",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});

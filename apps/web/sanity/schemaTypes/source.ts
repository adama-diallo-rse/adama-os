import { defineField, defineType } from "sanity";

// L5-T2 — Source de veille réglementaire (EFRAG, GHG Protocol, ...).
// Documents seedés automatiquement par le job Trigger.dev avec un _id
// déterministe (source.efrag, source.ghg) pour pouvoir les référencer.
export const sourceType = defineType({
  name: "source",
  title: "Source de veille",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nom",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "EFRAG", value: "EFRAG" },
          { title: "GHG Protocol", value: "GHG" },
          { title: "Autre", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "other",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "kind" },
  },
});

import { defineField, defineType } from "sanity";

// L5-T6 — Cours / formation vendable (un document par niveau du parcours /learn).
// La STRUCTURE du parcours (niveaux, leçons, quelles leçons sont gratuites) vit
// dans le repo (content/learn/catalog.ts) : elle est versionnée avec le contenu
// MDX. Ce schéma sert de couche CMS OPTIONNELLE : Adama peut, depuis le Studio,
// surcharger le prix affiché et l'état « disponible / bientôt » d'un niveau sans
// redéployer. Si aucun document course n'existe, /learn retombe sur le catalogue
// du repo (même logique tolérante que /veille).
export const courseType = defineType({
  name: "course",
  title: "Formation",
  type: "document",
  fields: [
    defineField({
      name: "level",
      title: "Niveau",
      type: "number",
      description: "1 à 4. Doit correspondre à un niveau du catalogue repo.",
      validation: (rule) => rule.required().integer().min(1).max(4),
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceLabel",
      title: "Prix affiché",
      type: "string",
      description: 'Ex. « 49 € » ou « Gratuit ». Surcharge le catalogue repo.',
    }),
    defineField({
      name: "available",
      title: "Disponible à l'achat",
      type: "boolean",
      description: "Décoché → badge « bientôt », achat désactivé.",
      initialValue: true,
    }),
    defineField({
      name: "checkoutUrl",
      title: "Lien de paiement (Polar)",
      type: "url",
      description:
        "URL de checkout Polar du produit (rempli à l'étape L6). Vide → CTA repli.",
    }),
  ],
  orderings: [
    {
      title: "Niveau croissant",
      name: "levelAsc",
      by: [{ field: "level", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", level: "level", price: "priceLabel" },
    prepare({ title, level, price }) {
      return {
        title: title ?? "Formation",
        subtitle: [`Niveau ${level ?? "?"}`, price].filter(Boolean).join(" · "),
      };
    },
  },
});

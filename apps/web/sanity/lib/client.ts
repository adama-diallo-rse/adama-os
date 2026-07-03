import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

// L5 — Client de LECTURE public (contenu publié uniquement).
// useCdn: true → CDN Sanity, rapide et gratuit, ne voit jamais les brouillons.
// Null si Sanity n'est pas configuré : les helpers de requête retombent alors
// sur un tableau vide, la page /veille ne casse pas (cf. env.ts).
export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

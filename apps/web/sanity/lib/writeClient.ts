import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "../env";

// L5-T4 — Client d'ÉCRITURE (serveur / job Trigger.dev uniquement).
// Token à droits Editor : crée des BROUILLONS et upsert sources/tags.
// useCdn: false + perspective raw → voit brouillons ET publiés, indispensable
// pour la déduplication (on ne veut pas recréer un article déjà en brouillon).
// Ne JAMAIS importer ce module dans un composant client.
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID manquant.");
  }
  if (!token) {
    throw new Error("SANITY_WRITE_TOKEN manquant (droits Editor requis).");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });
}

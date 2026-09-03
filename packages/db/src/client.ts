// =====================================================================
// Client Drizzle (postgres-js) pour Adama OS.
// Utilisé côté serveur (seed, Server Components/Actions Next.js, FastAPI
// via un autre client). Ne jamais importer dans du code client/navigateur.
// =====================================================================

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL manquant. Renseigne la connection string Supabase (Transaction pooler) dans .env.",
  );
}

// prepare:false est requis avec le pooler Supabase (mode transaction).
const queryClient = postgres(connectionString, { prepare: false });

export const db = drizzle(queryClient, { schema });
export { schema };

/**
 * Ferme la connexion. A appeler AVANT process.exit dans tout script.
 *
 * Sans elle, postgres-js laisse une poignee libuv ouverte : sous Windows,
 * `process.exit(1)` produit alors une assertion et un code de sortie
 * 3221226505 au lieu de 1. Un script dont le code de sortie ment ne peut
 * etre enchaine ni verifie, ce qui est exactement ce que la couche C12
 * cherche a rendre impossible.
 *
 * Le delai borne evite qu'une connexion deja morte fasse attendre le script
 * indefiniment sur le chemin d'erreur, qui est precisement celui ou la
 * connexion a le plus de chances d'etre en mauvais etat.
 */
export async function closeDb(): Promise<void> {
  await queryClient.end({ timeout: 5 });
}

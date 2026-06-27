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

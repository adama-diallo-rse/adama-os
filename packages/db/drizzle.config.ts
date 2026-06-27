// Config Drizzle Kit. Charge DATABASE_URL depuis packages/db/.env.
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // L'extension pgvector et la RLS sont gérées dans migrations/0000_init.sql
  // (Drizzle Kit ne génère pas ces objets). Les `drizzle-kit generate`
  // suivants ne porteront que sur les évolutions de tables.
  verbose: true,
  strict: true,
});

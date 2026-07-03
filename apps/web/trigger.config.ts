import { defineConfig } from "@trigger.dev/sdk";

// L5-T3 — Configuration Trigger.dev (v4).
// `project` = référence du projet Trigger.dev (Dashboard → Project settings,
// format proj_xxxxxxxx). À renseigner avant `npx trigger.dev deploy`.
// Les tâches vivent dans ./trigger et sont bundlées par Trigger.dev, pas par
// Next : les secrets (OPENAI_API_KEY, SANITY_WRITE_TOKEN, NEXT_PUBLIC_SANITY_*)
// se définissent dans le dashboard Trigger.dev, pas dans Vercel.
export default defineConfig({
  project: "proj_vffucgtspskwdgrkfzkq",
  runtime: "node",
  logLevel: "info",
  maxDuration: 600,
  dirs: ["./trigger"],
});

import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

// L5-T2 — Config CLI Sanity (sanity deploy / sanity schema deploy).
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: true,
});

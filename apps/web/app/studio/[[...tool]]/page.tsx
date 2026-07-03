import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// L5-T2 — Studio Sanity monté sur /studio (route catch-all).
// force-static : la coquille est servie statiquement, le Studio s'hydrate côté
// client. metadata/viewport recommandés par next-sanity (viewport plein écran).
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}

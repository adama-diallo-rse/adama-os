import type { MetadataRoute } from "next";
import { ADAMA_OS } from "../content/adama-os";

// Manifeste d'application : nom et icones affiches quand la page est ajoutee a
// un ecran d'accueil. Les PNG de public/icons sont des rendus du symbole Open
// Strata (app/icon.svg), pas un dessin a part.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ADAMA OS",
    short_name: "ADAMA OS",
    description: ADAMA_OS.sousTitre,
    lang: "fr-FR",
    start_url: "/",
    display: "browser",
    background_color: "#F2EDE4",
    theme_color: "#F2EDE4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

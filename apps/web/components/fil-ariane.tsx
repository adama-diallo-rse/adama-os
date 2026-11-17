"use client";

import { usePathname } from "next/navigation";
import { filArianeJsonLd } from "../lib/fil-ariane";

/**
 * Le fil d'Ariane en données structurées, pour le kit de page intérieure.
 * Composant client parce que l'adresse ne se lit que là ; il est rendu côté
 * serveur comme le reste de la page, le balisage figure donc dans le HTML
 * servi. Il n'affiche rien à l'écran.
 */
export function FilAriane() {
  const noeud = filArianeJsonLd(usePathname());
  if (!noeud) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(noeud).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AutomationNotice } from "../components/automation-notice";
import {
  AUTOMATED_PROCESSING_NOTICE,
  AUTOMATED_PROCESSING_SHORT,
  MACHINE_MARKING_DEADLINE,
  SOUS_TRAITANTS,
} from "../lib/legal";

// L10-T1, article 50 : la mention de traitement automatisé doit survivre à un
// nettoyage de texte. Deux verrous : le rendu du composant, et la présence
// effective de ce composant dans le panneau adama.ai.
afterEach(cleanup);

function lire(chemin: string): string {
  return readFileSync(fileURLToPath(new URL(chemin, import.meta.url)), "utf-8");
}

describe("mention de traitement automatisé", () => {
  it("dit qu'il s'agit d'un agent automatisé et qu'il peut se tromper", () => {
    render(<AutomationNotice />);
    const noeud = screen.getByTestId("automation-notice");
    expect(noeud.textContent).toContain("automatisé");
    expect(noeud.textContent).toContain("vérifiez");
  });

  it("garde une formulation non vide et lisible", () => {
    expect(AUTOMATED_PROCESSING_NOTICE.length).toBeGreaterThan(60);
    expect(AUTOMATED_PROCESSING_SHORT).toBe("Agent automatisé");
  });

  it("est effectivement montée dans le panneau adama.ai", () => {
    const source = lire("../components/adama-ai.tsx");
    expect(source).toContain('from "./automation-notice"');
    expect(source).toContain("<AutomationNotice />");
    expect(source).toContain("AUTOMATED_PROCESSING_SHORT");
  });

  it("rappelle l'échéance du marquage lisible par machine", () => {
    expect(MACHINE_MARKING_DEADLINE).toBe("2026-12-02");
  });
});

describe("pages légales", () => {
  // C11-T1. La liste des sous-traitants vivait dans /confidentialite. La page
  // /confiance en a besoin aussi, et une seconde liste aurait diverge : c'est
  // le meme defaut que les quatre intitules de poste de septembre 2026. Elle
  // vit desormais dans lib/legal.ts, et les deux pages la lisent.
  it("citent les sous-traitants réels depuis une source unique", () => {
    const noms = SOUS_TRAITANTS.map((t) => t.nom);
    for (const soustraitant of [
      "Vercel",
      "Supabase",
      "OpenAI",
      "PostHog",
      "Sentry",
      "Better Stack",
      "GitHub",
    ]) {
      expect(noms).toContain(soustraitant);
    }
    for (const t of SOUS_TRAITANTS) {
      expect(t.donnees.trim().length).toBeGreaterThan(10);
      expect(t.region.trim().length).toBeGreaterThan(3);
    }
  });

  it("ne recopient aucun sous-traitant en clair dans les pages", () => {
    const confidentialite = lire("../app/confidentialite/page.tsx");
    const confiance = lire("../app/confiance/page.tsx");
    for (const t of SOUS_TRAITANTS) {
      expect(
        confidentialite,
        `${t.nom} doit venir de la source unique`,
      ).not.toContain(`"${t.nom}"`);
      expect(
        confiance,
        `${t.nom} doit venir de la source unique`,
      ).not.toContain(`"${t.nom}"`);
    }
  });

  it("mentionnent l'éditeur et l'hébergeur dans les mentions légales", () => {
    const mentions = lire("../app/mentions-legales/page.tsx");
    expect(mentions).toContain("Vercel");
    expect(mentions).toContain("Supabase");
  });
});

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
  it("existent et citent l'éditeur et les sous-traitants réels", () => {
    const mentions = lire("../app/mentions-legales/page.tsx");
    const confidentialite = lire("../app/confidentialite/page.tsx");
    expect(mentions).toContain("Vercel");
    expect(mentions).toContain("Supabase");
    for (const soustraitant of [
      "Vercel",
      "Supabase",
      "OpenAI",
      "PostHog",
      "Sentry",
    ]) {
      expect(confidentialite).toContain(soustraitant);
    }
  });
});

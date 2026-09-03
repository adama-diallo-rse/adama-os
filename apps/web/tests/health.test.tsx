// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HealthMatrix } from "../components/health-matrix";
import { buildCapabilities } from "../lib/health/criteria";
import type { HealthObservations } from "../lib/health/observations";
import {
  countByState,
  resolveHealthReason,
  resolveHealthState,
  toCapabilityHealth,
} from "../lib/health/types";

// =====================================================================
// C3-T1 et C3-T2, la matrice de sante.
//
// Ce fichier verrouille les quatre interdits de la couche :
//   - pas d'etat global agrege ;
//   - INDETERMINE ne se convertit jamais en DEGRADE ;
//   - aucun code d'erreur technique n'atteint l'ecran ;
//   - la distinction entre etats ne repose jamais sur la seule couleur.
// =====================================================================

afterEach(cleanup);

const MAINTENANT = new Date("2026-09-02T12:00:00.000Z");

function observations(): HealthObservations {
  return {
    base: { configured: true, readOk: true, dataClassReady: true },
    github: {
      source: "registre",
      expected: 8,
      read: 8,
      missing: [],
      commits: 12,
    },
    rag: {
      documents: 2,
      chunks: 173,
      lastIngestionAt: "2026-08-31T10:00:00.000Z",
      verification: {
        executedAt: "2026-09-01T10:00:00.000Z",
        verdict: "ok",
        best: 0.61,
        worst: 0.53,
        seuilOk: 0.5,
        seuilEchec: 0.45,
      },
    },
    passerelles: { configured: 2, healthy: 2, unhealthy: [], unreachable: [] },
    analytique: {
      keyConfigured: true,
      region: "UE",
      regionAnnoncee: "UE",
      consentGate: true,
    },
    assistant: { modelKeyConfigured: true, refuseSansSource: true },
    sauvegarde: {
      procedure: true,
      restauration: {
        executedAt: "2026-09-02T08:00:00.000Z",
        result: "reussi",
        scope: "tables du cockpit uniquement, jamais la base entiere",
        tables: 5,
        exercees: 5,
      },
      fraicheurJours: 180,
    },
  };
}

function matrice(o: HealthObservations = observations()) {
  return {
    capabilities: buildCapabilities(o, MAINTENANT).map(toCapabilityHealth),
    observedAt: MAINTENANT.toISOString(),
  };
}

describe("resolution d'un etat", () => {
  it("un critere non tenu domine une mesure manquante", () => {
    expect(
      resolveHealthState([
        { id: "a", label: "a", verdict: "inconnu", observed: "" },
        { id: "b", label: "b", verdict: "non_tenu", observed: "" },
      ]),
    ).toBe("degrade");
  });

  it("une mesure manquante ne devient jamais une panne", () => {
    expect(
      resolveHealthState([
        { id: "a", label: "a", verdict: "tenu", observed: "" },
        { id: "b", label: "b", verdict: "inconnu", observed: "" },
      ]),
    ).toBe("indetermine");
  });

  it("une capacite sans critere est indeterminee, jamais operationnelle", () => {
    expect(resolveHealthState([])).toBe("indetermine");
  });

  it("la raison est celle du premier critere qui l'explique", () => {
    const raison = resolveHealthReason([
      { id: "a", label: "a", verdict: "tenu", observed: "tout va bien" },
      { id: "b", label: "b", verdict: "non_tenu", observed: "la cause" },
      { id: "c", label: "c", verdict: "non_tenu", observed: "une autre" },
    ]);
    expect(raison).toBe("la cause");
  });

  it("une capacite operationnelle n'a pas de raison", () => {
    expect(
      resolveHealthReason([
        { id: "a", label: "a", verdict: "tenu", observed: "" },
      ]),
    ).toBeNull();
  });
});

describe("C3-T5, une panne de sortie reseau ne devient pas une panne produit", () => {
  it("rend INDETERMINE, jamais DEGRADE", () => {
    const o = observations();
    o.passerelles.healthy = 0;
    o.passerelles.unreachable = ["STRATA Scope", "ESG Optimizer"];
    const capacite = buildCapabilities(o, MAINTENANT).find(
      (c) => c.id === "passerelles",
    );
    expect(resolveHealthState(capacite?.criteria ?? [])).toBe("indetermine");
  });

  it("un produit qui se declare en panne rend bien DEGRADE", () => {
    const o = observations();
    o.passerelles.unhealthy = ["ESG Optimizer"];
    const capacite = buildCapabilities(o, MAINTENANT).find(
      (c) => c.id === "passerelles",
    );
    expect(resolveHealthState(capacite?.criteria ?? [])).toBe("degrade");
  });
});

describe("C3, les raisons restent lisibles par un visiteur", () => {
  it("aucune raison ne contient de code technique", () => {
    const casses: HealthObservations[] = [];
    const base = observations();
    for (const patch of [
      (o: HealthObservations) => {
        o.base.readOk = false;
      },
      (o: HealthObservations) => {
        o.rag.documents = 0;
        o.rag.chunks = 0;
      },
      (o: HealthObservations) => {
        o.assistant.modelKeyConfigured = false;
      },
      (o: HealthObservations) => {
        o.github.read = 6;
        o.github.missing = [{ fullName: "a/b", reason: "dépôt privé" }];
      },
      (o: HealthObservations) => {
        o.analytique.region = "hors UE";
      },
      (o: HealthObservations) => {
        o.sauvegarde.restauration = null;
      },
    ]) {
      const copie = JSON.parse(JSON.stringify(base)) as HealthObservations;
      patch(copie);
      casses.push(copie);
    }

    for (const o of casses) {
      for (const capacite of buildCapabilities(o, MAINTENANT)) {
        const raison = resolveHealthReason(capacite.criteria) ?? "";
        expect(raison).not.toMatch(/HTTP \d{3}|ECONNREFUSED|\bstack\b|Error:/i);
        expect(raison).not.toMatch(/supabase\.co|posthog\.com|https?:\/\//i);
      }
    }
  });

  it("un test de restauration sur des tables vides ne vaut pas une restauration testee", () => {
    const o = observations();
    o.sauvegarde.restauration = {
      executedAt: "2026-09-02T08:00:00.000Z",
      result: "partiel",
      scope: "tables du cockpit uniquement, jamais la base entiere",
      tables: 9,
      exercees: 0,
    };
    const critere = buildCapabilities(o, MAINTENANT)
      .flatMap((c) => c.criteria)
      .find((c) => c.id === "sauvegarde-restauration");

    expect(critere?.verdict).toBe("inconnu");
    expect(critere?.observed).toMatch(/rien n’a été restauré/);
  });
});

describe("C3-T1, le rendu de la matrice", () => {
  it("n'affiche aucun etat global agrege", () => {
    const { container } = render(<HealthMatrix matrix={matrice()} />);
    expect(container.querySelector("[data-global-state]")).toBeNull();
    // Le seul resume autorise compte, il ne conclut pas.
    expect(container.querySelectorAll(".health-count li").length).toBe(3);
  });

  it("ecrit le libelle de chaque etat en toutes lettres", () => {
    const o = observations();
    o.assistant.modelKeyConfigured = false;
    o.passerelles.unreachable = ["ESG Optimizer"];
    render(<HealthMatrix matrix={matrice(o)} />);
    expect(screen.getAllByText("OPÉRATIONNEL").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DÉGRADÉ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("INDÉTERMINÉ").length).toBeGreaterThan(0);
  });

  it("rend le depliage des criteres comme un vrai element depliable", () => {
    const { container } = render(<HealthMatrix matrix={matrice()} />);
    const details = container.querySelectorAll("details.health-criteria");
    expect(details.length).toBe(7);
    for (const d of Array.from(details)) {
      expect(d.querySelector("summary")).toBeTruthy();
    }
  });

  it("affiche la raison de chaque capacite non operationnelle", () => {
    const o = observations();
    o.base.readOk = false;
    const m = matrice(o);
    const { container } = render(<HealthMatrix matrix={m} />);
    const raisons = container.querySelectorAll(".health-reason");
    const attendues = m.capabilities.filter((c) => c.reason !== null).length;
    expect(raisons.length).toBe(attendues);
    expect(attendues).toBeGreaterThan(0);
  });

  it("compte les capacites sans jamais en omettre une", () => {
    const m = matrice();
    const compte = countByState(m.capabilities);
    expect(compte.operationnel + compte.degrade + compte.indetermine).toBe(
      m.capabilities.length,
    );
  });
});

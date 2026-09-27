import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ERREURS,
  erreursOuvertes,
  formeCanonique,
  type EntreeErreur,
} from "../content/erreurs";
import { EMPREINTES_ERREURS } from "../content/erreurs-empreintes";

// =====================================================================
// ES2, aucune réécriture silencieuse d'une entrée publiée (XINV-55,
// XDEC-26). Le test passe au rouge dès qu'un caractère publié change sans
// nouvelle version, dès qu'une version antérieure est retouchée, et dès
// qu'une entrée disparaît. La violation volontaire à faire une fois est
// décrite dans la page ES de Notion, section du 27 septembre 2026.
// =====================================================================

const empreinte = (entree: Omit<EntreeErreur, "historique">) =>
  createHash("sha256").update(formeCanonique(entree)).digest("hex");

const PAGE = readFileSync(
  fileURLToPath(new URL("../app/erreurs/page.tsx", import.meta.url)),
  "utf8",
);

describe("ES2, l'historique d'une entrée publiée est immuable", () => {
  for (const erreur of ERREURS) {
    const cle = `${erreur.id}@${erreur.version ?? 1}`;
    it(`${cle} porte l'empreinte inscrite à sa publication`, () => {
      expect(
        EMPREINTES_ERREURS[cle],
        `Version non inscrite ou texte modifié sans nouvelle version. Empreinte actuelle de ${cle} : ${empreinte(erreur)}`,
      ).toBe(empreinte(erreur));
    });

    for (const ancienne of erreur.historique ?? []) {
      const cleAncienne = `${ancienne.id}@${ancienne.version ?? 1}`;
      it(`${cleAncienne} garde le texte de sa publication`, () => {
        expect(EMPREINTES_ERREURS[cleAncienne]).toBe(empreinte(ancienne));
        expect(ancienne.motif.trim().length).toBeGreaterThan(10);
      });
    }
  }

  it("ne perd aucune entrée ni aucune version déjà inscrite", () => {
    const publiees = new Set(
      ERREURS.flatMap((e) => [
        `${e.id}@${e.version ?? 1}`,
        ...(e.historique ?? []).map((a) => `${a.id}@${a.version ?? 1}`),
      ]),
    );
    for (const cle of Object.keys(EMPREINTES_ERREURS)) {
      expect(publiees.has(cle), `${cle} a disparu du registre public`).toBe(
        true,
      );
    }
  });

  it("numérote les versions sans trou, l'historique d'abord", () => {
    for (const erreur of ERREURS) {
      const versions = [
        ...(erreur.historique ?? []).map((a) => a.version ?? 1),
        erreur.version ?? 1,
      ];
      expect(versions).toEqual(versions.map((_, i) => i + 1));
    }
  });
});

describe("ES2, l'erreur publiée dans un objet", () => {
  const corrections = ERREURS.filter((e) => e.objet);

  it("porte l'objet, sa version, la citation, ce qui est vrai et sa source", () => {
    expect(corrections.length).toBeGreaterThan(0);
    for (const { objet } of corrections) {
      if (!objet) continue;
      expect(objet.version.trim().length).toBeGreaterThan(5);
      expect(objet.ecrit.length).toBeGreaterThan(0);
      expect(objet.vrai.trim().length).toBeGreaterThan(20);
      expect(objet.sourceVrai.href).toMatch(/^(\/|https:\/\/)/);
      expect(objet.changementMethode.trim().length).toBeGreaterThan(40);
      if (objet.dateCorrection) {
        expect(objet.dateCorrection >= objet.dateConstat).toBe(true);
      }
    }
  });

  it("reste ouverte tant que la correction n'est pas datée en ligne", () => {
    for (const { objet, statut } of corrections) {
      if (objet && objet.dateCorrection === null)
        expect(statut).toBe("ouverte");
    }
  });

  it("donne à ES0 un compte d'erreurs ouvertes lu dans le registre", () => {
    expect(erreursOuvertes()).toBe(
      ERREURS.filter((e) => e.statut === "ouverte").length,
    );
    expect(erreursOuvertes([])).toBe(0);
  });

  it("affiche l'ancien texte à côté de ce qui est vrai, sur la même route", () => {
    expect(PAGE).toContain("Ce qui était écrit");
    expect(PAGE).toContain("Ce qui est vrai");
    expect(PAGE).toContain("historique");
  });

  it("n'importe rien du commerce, et le commerce ne l'importe pas (XINV-23)", () => {
    expect(PAGE).not.toMatch(
      /from ["'][^"']*(commerce|paiement|checkout|stripe)/i,
    );
  });
});

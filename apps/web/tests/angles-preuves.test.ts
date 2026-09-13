import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LIMITES } from "../content/limites";
import { RETRIEVAL_MIN_SIMILARITY } from "../lib/ai/config";

// =====================================================================
// EH2, les trois angles narratifs et la preuve qui soutient chacun.
//
// Un angle ne vaut que tant que sa preuve est en ligne et exacte. Ce test
// est la regle de retrait sous forme executable : si l'une des preuves
// nommees disparait du depot, ou si un chiffre cite par un angle change, il
// echoue en nommant l'angle. L'angle est alors suspendu jusqu'a la
// reformulation ou au retablissement de sa preuve, jamais remplace par un
// quatrieme.
//
// Les angles sont ceux de la page Notion Branche EH, reformules le
// 13 septembre 2026 (XDEC-42) pour ne citer que ce qui est public.
// =====================================================================

const RACINE = join(process.cwd(), "..", "..");
const APP = join(process.cwd(), "app");

type Angle = {
  nom: string;
  routes: string[];
  verifier?: () => void;
};

const route = (chemin: string) =>
  chemin.startsWith("/.well-known") || chemin === "/llms.txt"
    ? join(APP, ...chemin.split("/").filter(Boolean), "route.ts")
    : join(APP, ...chemin.split("/").filter(Boolean), "page.tsx");

const ANGLES: Angle[] = [
  {
    nom: "La preuve plutôt que la promesse",
    routes: ["/preuves", "/revirements", "/systeme/pannes"],
    verifier: () => {
      // La mention des echecs doit rester exacte : chaque limite fermee dit
      // ce qui l'a fermee, et aucune n'est effacee.
      for (const l of LIMITES) {
        if (l.fermeeLe) {
          expect(l.fermeePar, l.id).toBeTruthy();
        } else {
          expect(l.fermeture, l.id).toBeTruthy();
        }
      }
    },
  },
  {
    nom: "L’IA n’a pas le droit de décider",
    routes: ["/systeme/pannes", "/technique", "/principes"],
    verifier: () => {
      // L'angle cite trois nombres, et seulement ceux-la : le plancher de
      // recuperation sous lequel l'assistant refuse, et les deux seuils de
      // la verification publique. Les scores mesures ne sont pas cites,
      // ils changent a chaque ingestion et se lisent sur /technique.
      expect(RETRIEVAL_MIN_SIMILARITY).toBe(0.15);
      const rag = JSON.parse(
        readFileSync(join(RACINE, "docs", "rag-verify.json"), "utf8"),
      ) as { seuil_ok: number; seuil_echec: number; verdict: string };
      expect(rag.seuil_echec).toBe(0.45);
      expect(rag.seuil_ok).toBe(0.5);
      const pannes = readFileSync(
        join(RACINE, "apps/web/content/pannes.ts"),
        "utf8",
      );
      expect(pannes).toContain("refuse de répondre");
    },
  },
  {
    nom: "Construire seul n’est pas construire petit",
    routes: [
      "/decisions",
      "/technique",
      "/.well-known/adama-os.json",
      "/llms.txt",
    ],
    verifier: () => {
      const integrite = JSON.parse(
        readFileSync(join(RACINE, "docs", "integrity.json"), "utf8"),
      ) as { controls: { status: string }[]; echoues: number };
      expect(integrite.controls).toHaveLength(10);
      expect(integrite.echoues).toBe(0);
      expect(existsSync(join(RACINE, "docs", "inventory.json"))).toBe(true);
    },
  },
];

describe("EH2, chaque angle nomme une preuve qui existe encore", () => {
  it("compte exactement trois angles", () => {
    expect(ANGLES).toHaveLength(3);
  });

  for (const angle of ANGLES) {
    it(`« ${angle.nom} » : ses routes de preuve sont servies`, () => {
      for (const chemin of angle.routes) {
        expect(existsSync(route(chemin)), `${angle.nom} perd ${chemin}`).toBe(
          true,
        );
      }
    });
    if (angle.verifier) {
      it(`« ${angle.nom} » : ce qu’il cite est encore exact`, angle.verifier);
    }
  }
});

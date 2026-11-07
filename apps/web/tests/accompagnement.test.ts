import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ETAT_OFFRE,
  FORMULES,
  PARTENAIRES,
  PHOTOS,
  QUESTIONS,
  REFERENCES,
  SEMAINES,
  SITUATIONS,
} from "../content/accompagnement";
import { CARTE } from "../components/kit/carte-donnees";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// L'offre d'accompagnement, refonte commerciale du 7 novembre 2026.
// Les règles de la page Notion de l'offre, tenues par le code.
// =====================================================================

const RACINE = join(__dirname, "..");
const lire = (f: string) => readFileSync(join(RACINE, f), "utf8");

describe("l'offre d'accompagnement", () => {
  it("met en avant une seule formule, l'accompagnement de six semaines", () => {
    const principales = FORMULES.filter((f) => f.principale);
    expect(principales).toHaveLength(1);
    expect(principales[0]?.code).toBe("accompagnement");
    expect(FORMULES[0]?.principale).toBe(true);
  });

  it("ne publie aucun prix et aucune date d'ouverture (7 novembre 2026)", () => {
    const publics = [
      lire("content/accompagnement.ts"),
      lire("content/accueil.ts"),
      lire("components/dashboard.tsx"),
      lire("components/accueil/offre.tsx"),
      lire("components/accueil/volet-accompagnement.tsx"),
      lire("app/travaillez-avec-moi/page.tsx"),
      lire("app/diagnostic/page.tsx"),
      lire("app/llms.txt/route.ts"),
    ].join("\n");
    expect(publics).not.toMatch(/€|\beuros?\b|prix de lancement|janvier 2027/i);
    expect(ETAT_OFFRE.badge).toBe("Ouvert");
  });

  it("déroule six semaines numérotées, chacune avec un livrable", () => {
    expect(SEMAINES.map((s) => s.numero)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const s of SEMAINES) expect(s.livrable.length).toBeGreaterThan(20);
  });

  it("ne publie aucun nom de bénéficiaire pilote sans accord écrit", () => {
    const texte = [
      lire("content/accompagnement.ts"),
      lire("components/dashboard.tsx"),
      lire("app/travaillez-avec-moi/page.tsx"),
    ].join("\n");
    for (const nom of ["Sentria", "YaatalCo", "Dissou", "Thioune", "Farah"]) {
      expect(texte, nom).not.toContain(nom);
    }
  });

  it("renvoie la durabilité vers STRATA ESG au lieu de la vendre", () => {
    const q = QUESTIONS.find((x) => x.q.includes("durabilité"));
    expect(q?.r).toContain("STRATA ESG");
  });

  it("n'emploie aucun mot que le site s'interdit", () => {
    const tout = [
      ...SITUATIONS.flatMap((s) => [s.titre, s.reponse]),
      ...SEMAINES.flatMap((s) => [s.objectif, s.livrable]),
      ...FORMULES.flatMap((f) => [f.titre, f.pourQuoi, ...f.contenu]),
      ...QUESTIONS.flatMap((q) => [q.q, q.r]),
    ].join(" ");
    expect(controlerTexte(tout).filter((c) => c.niveau !== "relire")).toEqual(
      [],
    );
    expect(tout).not.toMatch(/—|–/);
    expect(tout).not.toMatch(/intelligence artificielle|\bIA\b/i);
  });
});

describe("les logos, les photographies et la carte", () => {
  it("sert chaque logo de la bande de confiance", () => {
    for (const l of [...PARTENAIRES, ...REFERENCES]) {
      expect(
        existsSync(join(RACINE, "public/logos", `${l.fichier}.webp`)),
        l.nom,
      ).toBe(true);
    }
  });

  it("montre les trois structures d'accompagnement et le ministère", () => {
    expect(PARTENAIRES.map((p) => p.id)).toEqual([
      "institut-engagement",
      "google-for-startups",
      "cci-paris-idf",
    ]);
    expect(REFERENCES.map((r) => r.id)).toContain("ministere");
  });

  it("sert chaque photographie en 3840 pixels de large, avec un texte alternatif", () => {
    for (const p of Object.values(PHOTOS)) {
      expect(existsSync(join(RACINE, "public", p.src)), p.src).toBe(true);
      expect(p.largeur).toBe(3840);
      expect(p.alt.length).toBeGreaterThan(30);
    }
  });

  it("n'affiche ni légende ni source sous les photographies", () => {
    expect(lire("components/accueil/offre.tsx")).not.toContain("figcaption");
  });

  it("place Dakar à l'ouest et au sud de Paris, et trace le Sénégal", () => {
    expect(CARTE.dakar[0]).toBeLessThan(CARTE.paris[0]);
    expect(CARTE.dakar[1]).toBeGreaterThan(CARTE.paris[1]);
    expect(CARTE.senegal.startsWith("M")).toBe(true);
    expect(CARTE.afrique.length).toBeGreaterThan(40);
  });

  it("ne remet aucun défilé en boucle sur l'accueil", () => {
    expect(lire("components/dashboard.tsx")).not.toContain("<Defile");
    expect(existsSync(join(RACINE, "components/accueil/defile.tsx"))).toBe(
      false,
    );
  });
});

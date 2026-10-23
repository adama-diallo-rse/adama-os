import { describe, expect, it } from "vitest";
import { suiviPublic } from "../lib/repos";

// =====================================================================
// 23 octobre 2026, le journal ne fait pas reapparaitre un produit retire.
//
// Le positionnement public d'Adama nomme un projet seulement quand il a un
// produit en ligne ou un client. Un produit retire de la vitrine (is_public
// a faux) ne doit donc pas revenir par la porte de service : ses commits,
// avec leur nom de produit, sur la page d'accueil. Seule exception, le
// cockpit, marque non public parce qu'il n'est pas un produit de la grille.
// =====================================================================

describe("suiviPublic, le filtre du journal", () => {
  it("suit un produit public", () => {
    expect(suiviPublic({ is_public: true, division: "STRATA" })).toBe(true);
  });

  it("ne suit pas un produit retire de la vitrine", () => {
    expect(suiviPublic({ is_public: false, division: "IROKO" })).toBe(false);
  });

  it("traite une valeur absente comme non publique", () => {
    expect(suiviPublic({ is_public: null, division: "STRATA" })).toBe(false);
  });

  it("garde le cockpit, seul non public suivi", () => {
    expect(suiviPublic({ is_public: false, division: "Cockpit" })).toBe(true);
  });
});

// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SkillCards } from "../components/skill-cards";
import {
  COMPETENCES,
  DISPONIBILITE,
  POSITIONNEMENT,
  RECHERCHE,
} from "../content/profil";
import { ADAMA_OS } from "../content/adama-os";

// =====================================================================
// C9-T6, test anti regression narrative.
//
// Le defaut que ce test rend impossible : quelqu'un retouche le texte du
// premier ecran, deplace la ligne de disponibilite plus bas « pour aerer »,
// et le site cesse de dire ce qu'on lui demande sans que rien ne casse.
//
// Pourquoi une lecture de source plutot qu'un rendu du composant. Le premier
// ecran vit dans dashboard.tsx, qui monte le terminal, l'assistant, la
// modale de recrutement et les quatre couches du cockpit : le rendre
// demanderait de simuler une demi-douzaine de dependances, et le test
// finirait par mesurer la qualite des simulations plutot que celle de la
// page. Ce qui doit etre verrouille ici n'est pas le rendu, c'est l'ORDRE :
// capacite, puis situation, puis disponibilite, puis trois actions. Cet
// ordre se lit dans la source, exactement et sans intermediaire.
//
// Les cartes de competence, elles, sont rendues : c'est un composant isole,
// et ce qu'on verifie est bien un rendu.
// =====================================================================

afterEach(cleanup);

// Chemin depuis la racine de vitest, apps/web : dans l'environnement jsdom,
// import.meta.url n'est pas une URL de fichier et fileURLToPath echoue.
const DASHBOARD = readFileSync(
  join(process.cwd(), "components", "dashboard.tsx"),
  "utf8",
);

/** Le premier ecran, delimite par les memes ancres que docs/budget.json. */
function premierEcran(): string {
  const debut = DASHBOARD.indexOf('className="hero-copy"');
  const fin = DASHBOARD.indexOf('className="hero-art"', debut + 1);
  expect(debut, "ancre hero-copy introuvable").toBeGreaterThan(-1);
  expect(fin, "ancre hero-art introuvable").toBeGreaterThan(debut);
  return DASHBOARD.slice(debut, fin);
}

describe("C9-T6, le premier ecran dit ce qu'on lui demande", () => {
  const ecran = premierEcran();

  it("porte la proposition de valeur ADAMA OS", () => {
    // EC2 : la phrase se lit dans sa source unique, jamais recopiee.
    expect(ecran).toContain("POSITIONNEMENT.fr");
    expect(ADAMA_OS.proposition).toBe(POSITIONNEMENT.fr);
    expect(POSITIONNEMENT.fr.length).toBeGreaterThan(60);
    // Une capacite se dit a la premiere personne et avec des verbes d'action.
    expect(POSITIONNEMENT.fr).toMatch(/^Je /);
  });

  it("porte la signature de preuve comme une affirmation autonome", () => {
    // EC3 : la signature est rendue par son composant, avec ses preuves.
    expect(ecran).toContain("<Signature");
    expect(ecran).toContain('className="hero-availability"');
  });

  it("annonce le mois et l'annee de prise de fonction", () => {
    expect(DISPONIBILITE).toContain("novembre");
    expect(DISPONIBILITE).toContain(RECHERCHE.annee);
    expect(RECHERCHE.annee).toBe("2026");
  });

  it("annonce la zone geographique, accents portes", () => {
    expect(DISPONIBILITE).toContain("Île-de-France");
  });

  it("range la proposition avant le sous-titre, puis la signature avant les actions", () => {
    const capacite = ecran.indexOf("POSITIONNEMENT.fr");
    const situation = ecran.indexOf("ADAMA_OS.sousTitre");
    const signature = ecran.indexOf("<Signature");
    const actions = ecran.indexOf('className="hero-actions"');
    expect(capacite).toBeGreaterThan(-1);
    expect(situation).toBeGreaterThan(capacite);
    expect(signature).toBeGreaterThan(situation);
    expect(actions).toBeGreaterThan(signature);
  });

  it("ne propose que trois actions, jamais quatre", () => {
    const debut = ecran.indexOf('className="hero-actions"');
    const zone = ecran.slice(debut);
    const actions = zone.match(/portfolio-button|portfolio-text-link/g) ?? [];
    expect(actions).toHaveLength(3);
  });

  it("n'affiche aucune metrique produit dans l'accroche", () => {
    // Une metrique dans le hero deplace l'attention du profil vers un
    // chiffre que le lecteur ne sait pas interpreter en quarante secondes.
    expect(ecran).not.toMatch(/data\.analytics|ClaimNumber|AnimatedNumber/);
  });
});

describe("C9-T2, les trois cartes de competence", () => {
  it("rend exactement trois domaines", () => {
    render(<SkillCards proofStates={{}} />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(COMPETENCES).toHaveLength(3);
  });

  it("propose un lien de verification quand la preuve est servie", () => {
    const etats = Object.fromEntries(
      COMPETENCES.map((c) => [c.preuveId, "real" as const]),
    );
    render(<SkillCards proofStates={etats} />);
    expect(
      screen.getAllByRole("link", { name: /Vérifier cette compétence/ }),
    ).toHaveLength(3);
  });

  it("n'invente aucun lien quand la preuve n'est pas servie", () => {
    render(<SkillCards proofStates={{}} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getAllByText(/Preuve non servie/)).toHaveLength(3);
  });

  it("n'affiche aucune barre de niveau ni pourcentage de maitrise", () => {
    const { container } = render(<SkillCards proofStates={{}} />);
    expect(container.querySelector("progress, meter")).toBeNull();
    expect(container.textContent ?? "").not.toMatch(/%/);
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });

  it("adosse chaque carte a une affirmation du registre", () => {
    for (const domaine of COMPETENCES) {
      expect(domaine.preuveId).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(domaine.fait.length).toBeGreaterThan(60);
    }
  });
});

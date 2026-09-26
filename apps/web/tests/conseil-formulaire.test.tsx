// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// =====================================================================
// EG0, le formulaire commun, rendu et exerce.
//
//   - la case d'accord n'est jamais cochee au rendu ;
//   - le panneau applique la regle pendant que la personne se range ;
//   - un manquement affiche la reponse de refus et retire le formulaire
//     d'identite AVANT que la personne ecrive son probleme ;
//   - une demande recevable garde le formulaire complet.
// =====================================================================

vi.mock("../app/travaillez-avec-moi/actions", () => ({
  deposerDemande: vi.fn(async () => ({ statut: "repos" as const })),
}));

import { FormulaireDemande } from "../app/travaillez-avec-moi/formulaire";
import { CONDITIONS, MENTION_DEMANDE, PORTES } from "../content/conseil";

afterEach(cleanup);

function rendre(relie = true) {
  return render(
    <FormulaireDemande
      portes={PORTES.map((p) => ({
        code: p.code,
        numero: p.numero,
        titre: p.titre,
      }))}
      porteInitiale="donnee"
      conditions={CONDITIONS.map((c) => ({ numero: c.numero, texte: c.texte }))}
      mentionVersion={MENTION_DEMANDE.version}
      texteCase={MENTION_DEMANDE.texteCase}
      mention={<p>mention</p>}
      relie={relie}
      contact="diadamflow@gmail.com"
      plafond="Aucune mission."
    />,
  );
}

function choisir(libelle: RegExp) {
  fireEvent.click(screen.getByLabelText(libelle));
}

describe("EG0, le formulaire commun", () => {
  it("preselectionne la porte et ne coche jamais la case d'accord", () => {
    rendre();
    expect(
      (screen.getByLabelText(/02 Donnée/) as HTMLInputElement).checked,
    ).toBe(true);
    expect(
      (screen.getByLabelText(MENTION_DEMANDE.texteCase) as HTMLInputElement)
        .checked,
    ).toBe(false);
  });

  it("affiche le refus avant la description quand une condition manque", async () => {
    rendre();
    choisir(/Un livrable ESG produit pour nous/);
    choisir(/^Aucune relation$/);
    choisir(/Plus de deux mois/);
    expect(screen.getByText(/LA RÉPONSE, TELLE QU’ELLE PART/)).toBeTruthy();
    expect(
      screen.getByText(/Je ne peux pas y donner suite/).textContent,
    ).toMatch(/pas la production d’un livrable ESG/);
    expect(screen.getByText(/Rien de ce que vous avez saisi/)).toBeTruthy();
    // Le bloc d'identite sort apres sa courte animation de sortie.
    await waitFor(() => {
      expect(
        screen.queryByLabelText(/Le problème, pas la solution/),
      ).toBeNull();
      expect(
        screen.queryByRole("button", { name: /Envoyer la demande/ }),
      ).toBeNull();
    });
  });

  it("garde le formulaire complet quand la demande est recevable", () => {
    rendre();
    choisir(/Une lecture de notre système/);
    choisir(/^Aucune relation$/);
    choisir(/Entre deux semaines et deux mois/);
    expect(
      screen.getByText(/Les trois conditions qui dépendent de vous/),
    ).toBeTruthy();
    expect(screen.getByLabelText(/Le problème, pas la solution/)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Envoyer la demande/ }),
    ).toBeTruthy();
  });

  it("marque la condition 4 comme verifiee de mon cote, jamais par le formulaire", () => {
    rendre();
    expect(screen.getAllByText(/vérifiée de mon côté/)).toHaveLength(1);
  });

  it("propose un courriel pre-rempli tant que la reception en ligne est fermee", () => {
    rendre(false);
    choisir(/Une lecture de notre système/);
    choisir(/^Aucune relation$/);
    choisir(/Plus de deux mois/);
    expect(
      screen.queryByRole("button", { name: /Envoyer la demande/ }),
    ).toBeNull();
    const lien = screen.getByRole("link", {
      name: /Écrire à diadamflow@gmail.com/,
    });
    const href = decodeURIComponent(lien.getAttribute("href") ?? "");
    expect(href.startsWith("mailto:diadamflow@gmail.com?subject=")).toBe(true);
    expect(href).toContain("Porte : 02 Donnée");
    expect(href).toContain("Échéance : Plus de deux mois");
  });
});

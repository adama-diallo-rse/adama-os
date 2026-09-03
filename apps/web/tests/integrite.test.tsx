// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IntegrityPanel } from "../components/integrity-panel";
import {
  FRAICHEUR_INTEGRITE_JOURS,
  type IntegrityReport,
} from "../lib/integrity";

// =====================================================================
// C12-T2, l'affichage du resultat.
//
// Trois regles verrouillees ici, et elles priment sur l'esthetique :
//   - un controle en echec s'affiche, jamais masque ;
//   - au-dela du seuil de fraicheur, l'age prime sur le resultat ;
//   - un rapport jamais execute n'affiche aucun resultat, et surtout pas un
//     vert par defaut.
// =====================================================================

afterEach(cleanup);

function rapport(over: Partial<IntegrityReport> = {}): IntegrityReport {
  return {
    executedAt: "2026-09-02T09:00:00.000Z",
    verdict: "partiel",
    buildInclus: true,
    modesDePanneConformes: true,
    ageJours: 0,
    perime: false,
    controls: [
      {
        id: "a",
        label: "Toute donnée affichée porte sa classe",
        detail: "détail a",
        status: "reussi",
        message: "ok",
      },
      {
        id: "b",
        label: "La sauvegarde a été restaurée et datée",
        detail: "détail b",
        status: "echoue",
        message: "aucun test de restauration enregistré",
      },
      {
        id: "c",
        label: "Les règles de sécurité tiennent",
        detail: "détail c",
        status: "non_execute",
        message: "base de test absente",
      },
    ],
    ...over,
  };
}

describe("C12-T2, un controle en echec n'est jamais masque", () => {
  it("rend autant de lignes qu'il y a de controles", () => {
    const r = rapport();
    const { container } = render(<IntegrityPanel rapport={r} />);
    expect(container.querySelectorAll(".integrity-list li")).toHaveLength(
      r.controls.length,
    );
  });

  it("affiche le message d'un controle en echec", () => {
    render(<IntegrityPanel rapport={rapport()} />);
    expect(
      screen.getByText(/aucun test de restauration enregistré/i),
    ).toBeTruthy();
  });

  it("distingue echec et non execute par le libelle, pas par la couleur", () => {
    render(<IntegrityPanel rapport={rapport()} />);
    expect(screen.getAllByText("EN ÉCHEC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NON EXÉCUTÉ").length).toBeGreaterThan(0);
    expect(screen.getAllByText("RÉUSSI").length).toBeGreaterThan(0);
  });

  it("ne rend aucun score global sur cent", () => {
    const { container } = render(<IntegrityPanel rapport={rapport()} />);
    expect(container.textContent).not.toMatch(/\/\s*100|%/);
  });
});

describe("C12-T2, l'age prime au-dela du seuil", () => {
  it("annonce l'age et relativise le resultat quand le rapport est vieux", () => {
    render(
      <IntegrityPanel
        rapport={rapport({
          ageJours: FRAICHEUR_INTEGRITE_JOURS + 14,
          perime: true,
        })}
      />,
    );
    expect(screen.getByText(/l’âge compte plus que le résultat/i)).toBeTruthy();
    expect(screen.getByText(/état passé, pas l’état actuel/i)).toBeTruthy();
  });

  it("annonce simplement la date quand le rapport est frais", () => {
    render(<IntegrityPanel rapport={rapport()} />);
    expect(screen.getByText(/Exécutée le/i)).toBeTruthy();
  });
});

describe("C12-T2, un rapport jamais execute n'affiche rien", () => {
  it("ne rend aucun controle et dit pourquoi", () => {
    const { container } = render(<IntegrityPanel rapport={null} />);
    expect(container.querySelector(".integrity-list")).toBeNull();
    expect(
      screen.getByText(/n’a jamais été exécutée sur cette version/i),
    ).toBeTruthy();
  });

  it("montre malgre tout la commande qui produirait le resultat", () => {
    render(<IntegrityPanel rapport={null} />);
    expect(screen.getByText(/pnpm integrity/)).toBeTruthy();
  });
});

describe("C12-T1, le message d'un controle est lisible par un humain", () => {
  // Ces deux cas verrouillent un defaut trouve le 2 septembre 2026 : le
  // message ecrit dans docs/integrity.json etait la derniere ligne de la
  // sortie brute, sequences de couleur du terminal comprises, et cette chaine
  // est rendue telle quelle sur /technique. La page publique affichait donc
  // des codes d'echappement, et le seul renseignement qu'elle donnait etait
  // une duree en anglais.
  // Lecture DANS le cas, pas dans le corps du describe. Au moment de la
  // collecte, un fichier absent ferait echouer tout le fichier de test sur une
  // erreur d'entree-sortie, en emportant les huit autres cas et sans afficher
  // aucun des messages ecrits plus bas.
  const lireRapport = () =>
    JSON.parse(
      readFileSync(join(process.cwd(), "../../docs/integrity.json"), "utf8"),
    ) as { controls: { id: string; message?: string }[] };

  const ECHAPPEMENT = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`);

  it("ne porte aucune sequence de couleur de terminal", () => {
    for (const c of lireRapport().controls) {
      expect(
        ECHAPPEMENT.test(c.message ?? ""),
        `${c.id} : la sortie brute du terminal se retrouve sur la page publique. Relancer \`pnpm integrity\` puis committer docs/integrity.json.`,
      ).toBe(false);
    }
  });

  it("ne recopie pas le decompte anglais de l'outil de test", () => {
    for (const c of lireRapport().controls) {
      expect(
        /\d+\s+(passed|failed|skipped)/.test(c.message ?? ""),
        `${c.id} : « ${c.message} » est la ligne de l'outil, pas une phrase du site. Relancer \`pnpm integrity\` puis committer docs/integrity.json.`,
      ).toBe(false);
    }
  });
});

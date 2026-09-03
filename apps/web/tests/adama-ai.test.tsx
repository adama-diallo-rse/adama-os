// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdamaAi, messageDErreur } from "../components/adama-ai";

const chat = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  stop: vi.fn(),
  messages: [],
  status: "ready",
  error: undefined as Error | undefined,
}));
vi.mock("@ai-sdk/react", () => ({ useChat: () => chat }));
beforeEach(() => {
  chat.status = "ready";
  chat.error = undefined;
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});
afterEach(cleanup);
function Harness() {
  const [open, setOpen] = useState(false);
  return <AdamaAi open={open} onOpenChange={setOpen} />;
}
describe("assistant du portfolio", () => {
  it("rend le focus au déclencheur après Échap", async () => {
    render(<Harness />);
    const launcher = screen.getByRole("button", { name: "Ouvrir Adama AI" });
    launcher.focus();
    fireEvent.click(launcher);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox")),
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(launcher);
  });
  it("ignore une saisie vide et transmet une seule question nettoyée", () => {
    render(<AdamaAi open onOpenChange={() => {}} />);
    const field = screen.getByRole("textbox");
    fireEvent.change(field, { target: { value: "   " } });
    fireEvent.submit(field.closest("form")!);
    expect(chat.sendMessage).not.toHaveBeenCalled();
    fireEvent.change(field, {
      target: { value: "  Quel est le parcours d’Adama ?  " },
    });
    fireEvent.submit(field.closest("form")!);
    expect(chat.sendMessage).toHaveBeenCalledExactlyOnceWith({
      text: "Quel est le parcours d’Adama ?",
    });
  });
  it("permet d’arrêter une réponse sans envoyer une deuxième demande", () => {
    chat.status = "streaming";
    render(<AdamaAi open onOpenChange={() => {}} />);
    const field = screen.getByRole("textbox");
    fireEvent.change(field, { target: { value: "Question suivante" } });
    fireEvent.submit(field.closest("form")!);
    expect(chat.sendMessage).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Arrêter la réponse" }));
    expect(chat.stop).toHaveBeenCalledOnce();
  });
  it("affiche une erreur compréhensible sans exposer les détails techniques", () => {
    chat.error = new Error("internal-provider-trace");
    render(<AdamaAi open onOpenChange={() => {}} />);
    expect(screen.getByRole("alert").textContent).toContain("Réessayez");
    expect(screen.queryByText(/internal-provider-trace/)).toBeNull();
  });

  // La route repond deja en clair. Ces phrases n'arrivaient jamais a l'ecran :
  // une personne limitee en debit lisait le meme message qu'une personne
  // devant une base en panne, et n'avait aucune raison de patienter plutot
  // que de recharger.
  it("laisse passer le message que le serveur a réellement écrit", () => {
    chat.error = new Error(
      JSON.stringify({ error: "Trop de questions d’affilée." }),
    );
    render(<AdamaAi open onOpenChange={() => {}} />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Trop de questions",
    );
  });

  it("affiche les documents consultés avec le numéro de leur renvoi", () => {
    chat.messages = [
      {
        id: "m1",
        role: "assistant",
        parts: [
          {
            type: "data-sources",
            id: "sources",
            data: [
              {
                rang: 1,
                source: "VSME",
                titre: "Standard VSME",
                langue: "fr",
                pages: [12, 13],
                similarite: 0.82,
              },
            ],
          },
          { type: "text", text: "Le seuil est fixé à 250 salariés [1]." },
        ],
      },
    ] as unknown as typeof chat.messages;
    render(<AdamaAi open onOpenChange={() => {}} />);
    expect(screen.getByText("Document consulté")).toBeTruthy();
    expect(screen.getByText(/Standard VSME, p\. 12 et 13/)).toBeTruthy();
    expect(screen.getByText("[1]")).toBeTruthy();
    chat.messages = [];
  });
});

describe("message d’erreur", () => {
  it("ne montre jamais une chaîne technique brute", () => {
    expect(messageDErreur(new Error("TypeError: fetch failed"))).toContain(
      "Réessayez",
    );
    expect(messageDErreur(undefined)).toBeNull();
  });

  it("écarte un corps JSON sans champ error exploitable", () => {
    expect(messageDErreur(new Error(JSON.stringify({ error: 42 })))).toContain(
      "Réessayez",
    );
    expect(messageDErreur(new Error(JSON.stringify({ error: "" })))).toContain(
      "Réessayez",
    );
    expect(
      messageDErreur(new Error(JSON.stringify({ error: "x".repeat(201) }))),
    ).toContain("Réessayez");
  });
});

// C9, defaut du 2 septembre 2026. Sur la home, .portfolio porte le jeu de
// tokens des sections sombres qu'elle contient, et --color-foreground y vaut
// la creme. La regle .portfolio [role="dialog"] visait le panneau d'Adama AI,
// qui est une surface creme : texte creme sur fond creme, rapport 1:1, texte
// invisible. Ces deux verifications lisent la feuille de style plutot que le
// rendu, parce que jsdom ne resout pas la cascade : elles verrouillent la
// forme de la regle, qui est exactement ce qui avait cede.
describe("panneau clair sur page sombre", () => {
  const css = (nom: string) =>
    readFileSync(join(process.cwd(), "app", nom), "utf8");

  it("exclut le panneau clair de la regle des dialogues sombres", () => {
    const portfolio = css("portfolio.css");
    expect(portfolio).toContain(
      '.portfolio [role="dialog"]:not(.assistant-panel) {',
    );
    expect(portfolio).not.toMatch(
      /\.portfolio \[role="dialog"\] \{\s*\n\s*color: var\(--color-foreground\)/,
    );
  });

  it("fait declarer sa couleur par le panneau lui-meme", () => {
    const sous = css("subpages.css");
    const bloc = sous.slice(sous.indexOf(".assistant-panel {"));
    const regle = bloc.slice(0, bloc.indexOf("}"));
    expect(regle).toContain("color: var(--ink)");
    expect(regle).toContain("color-scheme: light");
  });
});

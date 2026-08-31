// @vitest-environment jsdom
import { useState } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdamaAi } from "../components/adama-ai";

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
});

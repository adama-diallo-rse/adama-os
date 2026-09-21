// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LexiqueAnglaisEH1 } from "../app/admin/lettre/lexique-anglais";

afterEach(cleanup);

describe("EH1, lexique anglais provisoire", () => {
  it("affiche les douze interdits français et tous leurs équivalents", () => {
    render(<LexiqueAnglaisEH1 />);
    const tableau = screen.getByRole("table");
    expect(within(tableau).getAllByRole("row")).toHaveLength(19);
    expect(within(tableau).getByText("certified")).toBeTruthy();
    expect(
      within(tableau).getByText(
        "French national register of professional qualifications",
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(/18 équivalents affichés sur 12 entrées/i),
    ).toBeTruthy();
  });

  it("filtre les usages banals sans jamais les présenter comme admis", async () => {
    render(<LexiqueAnglaisEH1 />);
    fireEvent.click(screen.getByRole("button", { name: "Banals en anglais" }));
    const tableau = screen.getByRole("table");
    expect(screen.getByText(/4 équivalents affichés/i)).toBeTruthy();
    expect(within(tableau).getByText("certified")).toBeTruthy();
    await waitFor(() =>
      expect(within(tableau).queryByText("accreditation")).toBeNull(),
    );
    expect(screen.getByRole("note").textContent).toContain(
      "Tous ces termes restent interdits",
    );
  });

  it("recherche dans les deux langues et les précisions", async () => {
    render(<LexiqueAnglaisEH1 />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "diplôme" },
    });
    const tableau = screen.getByRole("table");
    expect(within(tableau).getByText("diploma")).toBeTruthy();
    expect(within(tableau).getByText("degree")).toBeTruthy();
    await waitFor(() =>
      expect(within(tableau).queryByText("certified")).toBeNull(),
    );
  });
});

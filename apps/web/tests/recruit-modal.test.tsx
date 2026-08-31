// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecruitModal } from "../components/recruit-modal";
import { createClient } from "../lib/supabase/client";

vi.mock("../lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("../lib/analytics", () => ({ captureEvent: vi.fn() }));
afterEach(cleanup);

function submitContact() {
  render(<RecruitModal open onOpenChange={() => {}} />);
  fireEvent.change(screen.getByLabelText("Email professionnel"), {
    target: { value: "portfolio-test@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "envoyer" }));
}

describe("contact delivery feedback", () => {
  it("does not claim delivery when storage is not configured", async () => {
    vi.mocked(createClient).mockReturnValue(null);
    submitContact();
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText(/Bien reçu/)).toBeNull();
  });

  it.each(["returned error", "network rejection"])(
    "keeps contact retryable after a %s",
    async (mode) => {
      const insert =
        mode === "returned error"
          ? vi.fn().mockResolvedValue({ error: { message: "unavailable" } })
          : vi.fn().mockRejectedValue(new Error("network unavailable"));
      vi.mocked(createClient).mockReturnValue({
        from: () => ({ insert }),
      } as unknown as NonNullable<ReturnType<typeof createClient>>);
      submitContact();
      await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
      expect(screen.queryByText(/Bien reçu/)).toBeNull();
      expect(
        (screen.getByRole("button", { name: "envoyer" }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    },
  );

  it("confirms only after the contact has been saved", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createClient).mockReturnValue({
      from: () => ({ insert }),
    } as unknown as NonNullable<ReturnType<typeof createClient>>);
    submitContact();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Bien reçu"),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "portfolio-test@example.com",
        source: "recruiter",
      }),
    );
  });
});

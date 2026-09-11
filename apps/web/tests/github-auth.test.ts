import { afterEach, describe, expect, it, vi } from "vitest";
import { githubTokenForRepo } from "../lib/github-auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("jetons GitHub par propriétaire", () => {
  it("choisit le jeton du propriétaire avant le repli historique", () => {
    vi.stubEnv("GITHUB_TOKEN", "ancien");
    vi.stubEnv("GITHUB_TOKEN_IROKO_SOFTWARE_GROUP", "iroko");
    vi.stubEnv("GITHUB_TOKEN_ADAMA_DIALLO_RSE", "adama");
    vi.stubEnv("GITHUB_TOKEN_STRATA_ESG", "strata");

    expect(githubTokenForRepo("iroko-software-group/esg-optimizer")).toBe(
      "iroko",
    );
    expect(githubTokenForRepo("adama-diallo-rse/adama-os")).toBe("adama");
    expect(githubTokenForRepo("strata-esg/archive")).toBe("strata");
  });

  it("accepte le jeton historique pendant la migration", () => {
    vi.stubEnv("GITHUB_TOKEN", "ancien");
    expect(githubTokenForRepo("autre/projet")).toBe("ancien");
  });

  it("n'envoie aucun en-tête si aucun jeton n'est posé", () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    vi.stubEnv("GITHUB_TOKEN_ADAMA_DIALLO_RSE", "");
    expect(githubTokenForRepo("adama-diallo-rse/adama-os")).toBeNull();
  });
});

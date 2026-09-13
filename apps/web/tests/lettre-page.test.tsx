// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// =====================================================================
// EH0, la page /lettre et ses liens, rendus et exerces.
//
//   - un seul champ visible, l'adresse ;
//   - la case de consentement n'est jamais cochee au rendu ;
//   - collecte fermee : le champ et la case sont inactifs et la page le dit ;
//   - la mention complete est sur la page, ancre #mention ;
//   - la route des liens ne confirme pas a l'ouverture : elle pose un cookie
//     limite a /lettre et redirige vers le bouton.
// =====================================================================

const actions = vi.hoisted(() => ({
  inscrire: vi.fn(async () => ({ statut: "repos" as const })),
  confirmer: vi.fn(),
}));
vi.mock("../app/lettre/actions", () => actions);

const cookiesPresents = vi.hoisted(() => ({
  jeton: undefined as string | undefined,
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nom: string) =>
      nom === "lettre_confirmation" && cookiesPresents.jeton
        ? { value: cookiesPresents.jeton }
        : undefined,
  }),
  headers: async () => new Headers(),
}));

const parcours = vi.hoisted(() => ({
  verifierLien: vi.fn(),
  desinscrireParJeton: vi.fn(),
}));
vi.mock("../lib/lettre/parcours", async (original) => ({
  ...(await original<typeof import("../lib/lettre/parcours")>()),
  verifierLien: parcours.verifierLien,
  desinscrireParJeton: parcours.desinscrireParJeton,
}));

import { FormulaireLettre } from "../app/lettre/formulaire";
import { CONSENTEMENT } from "../content/lettre";

const ENV = { ...process.env };
const ENV_LETTRE = {
  LETTRE_SUPABASE_URL: "https://lettre-dediee.supabase.co",
  LETTRE_SUPABASE_SERVICE_ROLE_KEY: "cle-dediee",
  LETTRE_RESEND_API_KEY: "re_test",
  LETTRE_EXPEDITEUR: "Adama Diallo <signal@lettre.adamesg-os.fr>",
  LETTRE_SECRET: "un-secret-de-test-assez-long-pour-hmac-32",
};

beforeEach(() => {
  cookiesPresents.jeton = undefined;
  parcours.verifierLien.mockReset();
  parcours.desinscrireParJeton.mockReset();
});
afterEach(() => {
  cleanup();
  process.env = { ...ENV };
});

function rendreFormulaire(ouverte: boolean) {
  return render(
    <FormulaireLettre
      ouverte={ouverte}
      version={CONSENTEMENT.version}
      texteCase={CONSENTEMENT.texteCase}
      texteMention={CONSENTEMENT.texteMention}
    />,
  );
}

describe("EH0, le formulaire de /lettre", () => {
  it("n’a qu’un seul champ visible, l’adresse", () => {
    const { container } = rendreFormulaire(true);
    const visibles = [...container.querySelectorAll("input")].filter(
      (i) =>
        i.type !== "hidden" &&
        i.type !== "checkbox" &&
        !i.closest("[aria-hidden='true']"),
    );
    expect(visibles).toHaveLength(1);
    expect(visibles[0]?.getAttribute("name")).toBe("adresse");
    expect(visibles[0]?.getAttribute("type")).toBe("email");
  });

  it("ne coche jamais la case de consentement d’avance", () => {
    rendreFormulaire(true);
    const caseAccord = screen.getByLabelText(
      CONSENTEMENT.texteCase,
    ) as HTMLInputElement;
    expect(caseAccord.type).toBe("checkbox");
    expect(caseAccord.checked).toBe(false);
    expect(caseAccord.defaultChecked).toBe(false);
    expect(caseAccord.hasAttribute("checked")).toBe(false);
  });

  it("refuse l’envoi sans la case, et le dit", () => {
    rendreFormulaire(true);
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "a@exemple.fr" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /confirmation/i }).closest("form")!,
    );
    expect(screen.getByRole("alert").textContent).toContain("Cochez la case");
    expect(actions.inscrire).not.toHaveBeenCalled();
  });

  it("remplit la provenance au moment de l’envoi, pas avant", async () => {
    window.history.replaceState(
      null,
      "",
      "/lettre?utm_source=linkedin&utm_medium=post",
    );
    Object.defineProperty(document, "referrer", {
      value: "https://www.linkedin.com/feed/",
      configurable: true,
    });
    const { container } = rendreFormulaire(true);
    const referent = container.querySelector(
      "input[name='referent']",
    ) as HTMLInputElement;
    expect(referent.value).toBe("");
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
      target: { value: "a@exemple.fr" },
    });
    fireEvent.click(screen.getByLabelText(CONSENTEMENT.texteCase));
    fireEvent.submit(referent.closest("form")!);
    await waitFor(() => expect(actions.inscrire).toHaveBeenCalled());
    const donnees = (
      actions.inscrire.mock.calls.at(-1) as unknown[]
    )[1] as FormData;
    expect(donnees.get("referent")).toBe("https://www.linkedin.com/feed/");
    expect(donnees.get("utm_source")).toBe("linkedin");
    expect(donnees.get("utm_medium")).toBe("post");
    expect(donnees.get("utm_campaign")).toBe("");
    expect(donnees.get("consentement")).toBe("oui");
    expect(donnees.get("adresse")).toBe("a@exemple.fr");
  });

  it("transmet la version du consentement lu", () => {
    const { container } = rendreFormulaire(true);
    const version = container.querySelector(
      "input[name='version']",
    ) as HTMLInputElement;
    expect(version.value).toBe(CONSENTEMENT.version);
  });

  it("collecte fermée : champ et case inactifs, et la page le dit", () => {
    rendreFormulaire(false);
    expect(
      (screen.getByLabelText("Adresse e-mail") as HTMLInputElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByLabelText(CONSENTEMENT.texteCase) as HTMLInputElement)
        .disabled,
    ).toBe(true);
    expect(screen.getByRole("note").textContent).toContain(
      "pas encore ouverte",
    );
  });
});

describe("EH0, la page /lettre", () => {
  async function rendrePage(params: Record<string, string> = {}) {
    const { default: LettrePage } = await import("../app/lettre/page");
    render(await LettrePage({ searchParams: Promise.resolve(params) }));
  }

  it("porte la mention complète sur la page, et aucun compteur d’inscrits", async () => {
    await rendrePage();
    const mention = document.getElementById("mention");
    expect(mention).not.toBeNull();
    for (const rubrique of [
      "Responsable de traitement",
      "Finalité",
      "Conservation",
      "Vos droits",
    ]) {
      expect(mention?.textContent).toContain(rubrique);
    }
    expect(document.body.textContent).not.toMatch(/\d+\s+(inscrits|abonnés)/i);
    expect(document.body.textContent).toContain("Pas encore.");
  });

  it("affiche le bouton de confirmation seulement avec le cookie du lien", async () => {
    cookiesPresents.jeton = "x".repeat(43);
    await rendrePage({ etape: "confirmer" });
    expect(
      screen.getByRole("button", { name: "Confirmer mon inscription" }),
    ).toBeTruthy();
    cleanup();
    cookiesPresents.jeton = undefined;
    await rendrePage({ etape: "confirmer" });
    expect(
      screen.queryByRole("button", { name: "Confirmer mon inscription" }),
    ).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("plus valable");
  });
});

describe("EH0, la route des liens", () => {
  it("sans configuration, redirige vers l’état indisponible", async () => {
    for (const cle of Object.keys(ENV_LETTRE)) delete process.env[cle];
    const { GET, POST } = await import("../app/api/lettre/route");
    const r = await GET(
      new Request("https://adamesg-os.fr/api/lettre?confirmation=abc"),
    );
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toContain("/lettre?etat=indisponible");
    const p = await POST(
      new Request("https://adamesg-os.fr/api/lettre?desinscription=abc", {
        method: "POST",
      }),
    );
    expect(p.status).toBe(503);
  });

  it("ne confirme pas à l’ouverture : pose un cookie limité à /lettre", async () => {
    Object.assign(process.env, ENV_LETTRE);
    parcours.verifierLien.mockResolvedValue("valide");
    const { GET } = await import("../app/api/lettre/route");
    const jeton = "a".repeat(43);
    const r = await GET(
      new Request(`https://adamesg-os.fr/api/lettre?confirmation=${jeton}`),
    );
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toContain("/lettre?etape=confirmer");
    expect(r.headers.get("location")).not.toContain(jeton);
    const cookie = r.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("lettre_confirmation=");
    expect(cookie).toContain("Path=/lettre");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(r.headers.get("referrer-policy")).toBe("no-referrer");
  });

  it("désinscrit au clic du lien, et en un clic par l’en-tête de messagerie", async () => {
    Object.assign(process.env, ENV_LETTRE);
    parcours.desinscrireParJeton.mockResolvedValue("desinscrit");
    const { GET, POST } = await import("../app/api/lettre/route");
    const lien = await GET(
      new Request("https://adamesg-os.fr/api/lettre?desinscription=j"),
    );
    expect(lien.headers.get("location")).toContain("/lettre?etat=desinscrit");
    expect(parcours.desinscrireParJeton).toHaveBeenLastCalledWith(
      expect.anything(),
      "j",
      "lien",
    );

    const entete = await POST(
      new Request("https://adamesg-os.fr/api/lettre?desinscription=j", {
        method: "POST",
        body: "List-Unsubscribe=One-Click",
      }),
    );
    expect(entete.status).toBe(200);
    expect(parcours.desinscrireParJeton).toHaveBeenLastCalledWith(
      expect.anything(),
      "j",
      "en_tete_un_clic",
    );
  });
});

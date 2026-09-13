import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// =====================================================================
// EH0, les parcours de bout en bout, registre et envoi simules.
//
// Ce qui est verifie ici est la sequence : rien n'est marque envoye sans
// identifiant rendu, le plafond est lu avant d'envoyer, une confirmation
// qui ne part pas laisse la demande rejouable, une note ne consomme jamais
// la reserve des confirmations.
// =====================================================================

const registre = vi.hoisted(() => ({
  envoisDuJour: vi.fn(),
  inscrire: vi.fn(),
  confirmationEnvoyee: vi.fn(),
  etatJeton: vi.fn(),
  confirmer: vi.fn(),
  bienvenueEnvoyee: vi.fn(),
  bienvenuesEnAttente: vi.fn(),
  desinscrire: vi.fn(),
  purger: vi.fn(),
  demarrerNote: vi.fn(),
  destinatairesNote: vi.fn(),
  noteEnvoyee: vi.fn(),
  clore: vi.fn(),
  testEnvoye: vi.fn(),
}));
const envoi = vi.hoisted(() => ({
  envoyer: vi.fn(),
  envoyerLot: vi.fn(),
}));

vi.mock("../lib/lettre/registre", () => registre);
vi.mock("../lib/lettre/envoi", async (original) => ({
  ...(await original<typeof import("../lib/lettre/envoi")>()),
  envoyer: envoi.envoyer,
  envoyerLot: envoi.envoyerLot,
}));

import type { ConfigLettre } from "../lib/lettre/config";
import { jetonDesinscription, nouveauJeton } from "../lib/lettre/jetons";
import {
  confirmerInscription,
  demanderInscription,
  desinscrireParJeton,
  entretenir,
  envoyerLotNote,
} from "../lib/lettre/parcours";

const CONFIG: ConfigLettre = {
  supabaseUrl: "https://lettre.supabase.co",
  supabaseCle: "cle",
  resendCle: "re_cle",
  expediteur: "Adama Diallo <signal@lettre.adamesg-os.fr>",
  domaineEnvoi: "lettre.adamesg-os.fr",
  reponse: "diadamflow@gmail.com",
  secret: "un-secret-de-test-assez-long-pour-hmac-32",
  plafondJour: 100,
  collecteOuverte: true,
  administrateurs: ["admin@exemple.fr"],
};
const ABONNE = "3f2a4b6c-1d2e-4f50-8a9b-0c1d2e3f4a5b";
const NOTE = {
  id: "9d2a4b6c-1d2e-4f50-8a9b-0c1d2e3f4a5b",
  code: "NOTE-01",
  objet: "SIGNAL, la note du trimestre",
  decide: "d".repeat(130),
  echoue: "e".repeat(130),
  preparation: "p".repeat(130),
};

beforeEach(() => {
  for (const f of [...Object.values(registre), ...Object.values(envoi)]) {
    f.mockReset();
  }
  registre.envoisDuJour.mockResolvedValue(0);
});
afterEach(() => vi.clearAllMocks());

const demande = {
  adresse: "a@exemple.fr",
  ip: "203.0.113.7",
  referentHote: "www.linkedin.com",
  campagne: { utm_source: "linkedin" },
};

describe("EH0, la demande d’inscription", () => {
  it("écrit la provenance, envoie la confirmation, puis seulement la marque", async () => {
    registre.inscrire.mockResolvedValue({
      resultat: "envoyer_confirmation",
      abonneId: ABONNE,
    });
    envoi.envoyer.mockResolvedValue({ ok: true, id: "msg_1" });

    expect(await demanderInscription(CONFIG, demande)).toBe(
      "confirmation_partie",
    );

    const ecrit = registre.inscrire.mock.calls[0]?.[1];
    expect(ecrit).toMatchObject({
      email: "a@exemple.fr",
      surface: "page_lettre",
      chemin: "/lettre",
      referentHote: "www.linkedin.com",
      campagne: { utm_source: "linkedin" },
      consentementVersion: "EH0-1",
      langue: "fr",
    });
    expect(ecrit.emailEmpreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(ecrit.ipEmpreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(ecrit)).not.toContain("203.0.113.7");

    const message = envoi.envoyer.mock.calls[0]?.[1];
    expect(message.categorie).toBe("confirmation");
    expect(message.texte).toContain("/api/lettre?confirmation=");
    expect(registre.confirmationEnvoyee).toHaveBeenCalledWith(
      CONFIG,
      ABONNE,
      "msg_1",
    );
  });

  it("ne marque rien si la confirmation ne part pas", async () => {
    registre.inscrire.mockResolvedValue({
      resultat: "envoyer_confirmation",
      abonneId: ABONNE,
    });
    envoi.envoyer.mockResolvedValue({
      ok: false,
      raison: "x",
      reessayable: true,
    });
    expect(await demanderInscription(CONFIG, demande)).toBe("echec_envoi");
    expect(registre.confirmationEnvoyee).not.toHaveBeenCalled();
  });

  it("n’envoie rien à une adresse déjà confirmée, et répond pareil", async () => {
    registre.inscrire.mockResolvedValue({
      resultat: "deja_confirme",
      abonneId: ABONNE,
    });
    expect(await demanderInscription(CONFIG, demande)).toBe("rien_a_envoyer");
    expect(envoi.envoyer).not.toHaveBeenCalled();
  });

  it("n’écrit rien quand le plafond du jour est atteint", async () => {
    registre.envoisDuJour.mockResolvedValue(100);
    expect(await demanderInscription(CONFIG, demande)).toBe("plafond_jour");
    expect(registre.inscrire).not.toHaveBeenCalled();
  });
});

describe("EH0, confirmation, bienvenue et désinscription", () => {
  it("confirme puis envoie la bienvenue avec sa désinscription en un clic", async () => {
    registre.confirmer.mockResolvedValue({
      resultat: "confirme",
      abonneId: ABONNE,
      email: "a@exemple.fr",
    });
    envoi.envoyer.mockResolvedValue({ ok: true, id: "msg_2" });
    const { jeton } = nouveauJeton();
    expect(await confirmerInscription(CONFIG, jeton, "203.0.113.7")).toBe(
      "confirme",
    );
    const message = envoi.envoyer.mock.calls[0]?.[1];
    expect(message.categorie).toBe("bienvenue");
    expect(message.desinscription).toContain("/api/lettre?desinscription=");
    expect(registre.bienvenueEnvoyee).toHaveBeenCalledWith(
      CONFIG,
      ABONNE,
      "msg_2",
    );
  });

  it("garde la confirmation même si la bienvenue échoue", async () => {
    registre.confirmer.mockResolvedValue({
      resultat: "confirme",
      abonneId: ABONNE,
      email: "a@exemple.fr",
    });
    envoi.envoyer.mockRejectedValue(new Error("coupure"));
    const { jeton } = nouveauJeton();
    expect(await confirmerInscription(CONFIG, jeton, "ip")).toBe("confirme");
    expect(registre.bienvenueEnvoyee).not.toHaveBeenCalled();
  });

  it("refuse un jeton mal formé sans interroger la base", async () => {
    expect(await confirmerInscription(CONFIG, "faux", "ip")).toBe("invalide");
    expect(registre.confirmer).not.toHaveBeenCalled();
  });

  it("désinscrit au premier clic d’un lien signé, refuse un lien falsifié", async () => {
    registre.desinscrire.mockResolvedValue("desinscrit");
    const jeton = jetonDesinscription(CONFIG.secret, ABONNE);
    expect(await desinscrireParJeton(CONFIG, jeton, "lien")).toBe("desinscrit");
    expect(registre.desinscrire).toHaveBeenCalledWith(CONFIG, ABONNE, "lien");
    expect(await desinscrireParJeton(CONFIG, `${jeton}x`, "lien")).toBe(
      "invalide",
    );
  });
});

describe("EH0, l’entretien et la note trimestrielle", () => {
  it("purge, puis rejoue les bienvenues sans toucher la réserve", async () => {
    registre.purger.mockResolvedValue({
      demandes_jamais_confirmees: 2,
      reinscriptions_expirees: 0,
      preuves_de_retrait_echues: 0,
    });
    registre.envoisDuJour.mockResolvedValue(75);
    registre.bienvenuesEnAttente.mockResolvedValue([
      { abonneId: ABONNE, email: "a@exemple.fr" },
    ]);
    envoi.envoyer.mockResolvedValue({ ok: true, id: "m" });
    const bilan = await entretenir(CONFIG);
    expect(registre.bienvenuesEnAttente).toHaveBeenCalledWith(CONFIG, 5);
    expect(bilan.bienvenues).toEqual({ envoyees: 1, en_echec: 0 });
  });

  it("refuse d’envoyer une note non relue", async () => {
    registre.demarrerNote.mockResolvedValue("non_relue");
    const bilan = await envoyerLotNote(CONFIG, NOTE);
    expect(bilan.etat).toBe("refus");
    expect(envoi.envoyerLot).not.toHaveBeenCalled();
  });

  it("borne le lot au plafond moins la réserve, et ne marque que ce qui est parti", async () => {
    registre.demarrerNote.mockResolvedValue("en_cours");
    registre.envoisDuJour.mockResolvedValue(78);
    registre.destinatairesNote.mockResolvedValue([
      { abonneId: ABONNE, email: "a@exemple.fr" },
      {
        abonneId: "4f2a4b6c-1d2e-4f50-8a9b-0c1d2e3f4a5b",
        email: "b@exemple.fr",
      },
    ]);
    envoi.envoyerLot.mockResolvedValue([
      { ok: true, id: "m1" },
      { ok: false, raison: "x", reessayable: true },
    ]);
    registre.clore.mockResolvedValue("reste");

    const bilan = await envoyerLotNote(CONFIG, NOTE);

    expect(registre.destinatairesNote).toHaveBeenCalledWith(CONFIG, NOTE.id, 2);
    expect(registre.noteEnvoyee).toHaveBeenCalledTimes(1);
    expect(registre.noteEnvoyee).toHaveBeenCalledWith(
      CONFIG,
      NOTE.id,
      ABONNE,
      "m1",
    );
    expect(bilan).toEqual({
      etat: "lot_envoye",
      envoyes: 1,
      en_echec: 1,
      reste: true,
    });
    const messages = envoi.envoyerLot.mock.calls[0]?.[1] as {
      desinscription?: string;
    }[];
    expect(
      messages.every((m) => m.desinscription?.includes("desinscription=")),
    ).toBe(true);
  });

  it("n’envoie rien quand la réserve des confirmations serait entamée", async () => {
    registre.demarrerNote.mockResolvedValue("en_cours");
    registre.envoisDuJour.mockResolvedValue(80);
    const bilan = await envoyerLotNote(CONFIG, NOTE);
    expect(bilan.etat).toBe("refus");
    expect(registre.destinatairesNote).not.toHaveBeenCalled();
  });
});

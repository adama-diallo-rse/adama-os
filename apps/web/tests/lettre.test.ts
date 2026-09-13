import { describe, expect, it, vi } from "vitest";
import {
  BLOCS_LETTRE,
  CONSENTEMENT,
  ENGAGEMENTS,
  ETATS_PAGE,
  MENTION_COMPLETE,
} from "../content/lettre";
import {
  estSousDomaineEnvoi,
  lireConfigLettre,
  type ConfigLettre,
} from "../lib/lettre/config";
import { charge, envoyer, envoyerLot } from "../lib/lettre/envoi";
import {
  campagneDepuis,
  empreinteAdresse,
  empreinteIp,
  empreinteJeton,
  hoteReferent,
  jetonDesinscription,
  lireJetonDesinscription,
  normaliserAdresse,
  nouveauJeton,
} from "../lib/lettre/jetons";
import {
  PARAGRAPHES_BIENVENUE,
  PARAGRAPHES_CONFIRMATION,
  examinerNote,
  messageBienvenue,
  messageConfirmation,
  messageNote,
} from "../lib/lettre/messages";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EH0, la plomberie de la lettre, sans reseau ni base.
// =====================================================================

const SITE = "https://adamesg-os.fr";
const SECRET = "un-secret-de-test-assez-long-pour-hmac-32";
const ABONNE = "3f2a4b6c-1d2e-4f50-8a9b-0c1d2e3f4a5b";

const ENV_VALIDE = {
  NEXT_PUBLIC_SUPABASE_URL: "https://partage.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "cle-partagee",
  LETTRE_SUPABASE_URL: "https://lettre-dediee.supabase.co",
  LETTRE_SUPABASE_SERVICE_ROLE_KEY: "cle-dediee",
  LETTRE_RESEND_API_KEY: "re_test_cle",
  LETTRE_EXPEDITEUR: "Adama Diallo <signal@lettre.adamesg-os.fr>",
  LETTRE_SECRET: SECRET,
  LETTRE_ADMINISTRATEURS: "Admin@Exemple.fr, pas-une-adresse",
  LETTRE_COLLECTE: "ouverte",
};

function configValide(): ConfigLettre {
  const lecture = lireConfigLettre(ENV_VALIDE);
  if (!lecture.ok) throw new Error(JSON.stringify(lecture));
  return lecture.config;
}

describe("EH0, la configuration refuse ce qui violerait une règle", () => {
  it("accepte une configuration complète et ouverte", () => {
    const config = configValide();
    expect(config.domaineEnvoi).toBe("lettre.adamesg-os.fr");
    expect(config.collecteOuverte).toBe(true);
    expect(config.plafondJour).toBe(100);
    expect(config.administrateurs).toEqual(["admin@exemple.fr"]);
  });

  it("liste ce qui manque au lieu d’échouer en silence", () => {
    const lecture = lireConfigLettre({});
    expect(lecture.ok).toBe(false);
    if (!lecture.ok) {
      expect(lecture.manquants).toEqual([
        "LETTRE_SUPABASE_URL",
        "LETTRE_SUPABASE_SERVICE_ROLE_KEY",
        "LETTRE_RESEND_API_KEY",
        "LETTRE_EXPEDITEUR",
        "LETTRE_SECRET",
      ]);
    }
  });

  it("refuse la base partagée du cockpit (XINV-22)", () => {
    const lecture = lireConfigLettre({
      ...ENV_VALIDE,
      LETTRE_SUPABASE_URL: "https://partage.supabase.co",
    });
    expect(lecture.ok).toBe(false);
    if (!lecture.ok) expect(lecture.refus.join(" ")).toContain("XINV-22");
  });

  it("refuse la clé de service du projet partagé", () => {
    const lecture = lireConfigLettre({
      ...ENV_VALIDE,
      LETTRE_SUPABASE_SERVICE_ROLE_KEY: "cle-partagee",
    });
    expect(lecture.ok).toBe(false);
  });

  it("refuse un expéditeur sur un domaine de STRATA ESG", () => {
    for (const expediteur of [
      "contact@strata-esg.fr",
      "Adama <adama@news.strata-esg.fr>",
      "noreply@esg-optimizer.fr",
    ]) {
      const lecture = lireConfigLettre({
        ...ENV_VALIDE,
        LETTRE_EXPEDITEUR: expediteur,
      });
      expect(lecture.ok, expediteur).toBe(false);
    }
  });

  it("refuse la racine et tout domaine hors d’adamesg-os.fr", () => {
    expect(estSousDomaineEnvoi("adamesg-os.fr")).toBe(false);
    expect(estSousDomaineEnvoi("lettre.adamesg-os.fr")).toBe(true);
    expect(estSousDomaineEnvoi("adamesg-os.fr.exemple.com")).toBe(false);
    const lecture = lireConfigLettre({
      ...ENV_VALIDE,
      LETTRE_EXPEDITEUR: "signal@adamesg-os.fr",
    });
    expect(lecture.ok).toBe(false);
  });

  it("refuse une adresse de réponse de STRATA ESG et un secret court", () => {
    expect(
      lireConfigLettre({ ...ENV_VALIDE, LETTRE_REPONSE: "a@strata-esg.fr" }).ok,
    ).toBe(false);
    expect(lireConfigLettre({ ...ENV_VALIDE, LETTRE_SECRET: "court" }).ok).toBe(
      false,
    );
  });

  it("garde la collecte fermée tant que le geste d’ouverture n’est pas posé", () => {
    for (const valeur of [undefined, "", "oui", "OUVERTE", "true"]) {
      const lecture = lireConfigLettre({
        ...ENV_VALIDE,
        LETTRE_COLLECTE: valeur,
      });
      expect(lecture.ok && lecture.config.collecteOuverte, String(valeur)).toBe(
        false,
      );
    }
  });
});

describe("EH0, adresses, empreintes et jetons", () => {
  it("normalise une adresse plausible et rejette le reste", () => {
    expect(normaliserAdresse("  Adama.Diallo@Exemple.FR ")).toBe(
      "adama.diallo@exemple.fr",
    );
    for (const faux of [
      "",
      "sans-arobase",
      "a@b",
      "deux@@exemple.fr",
      "espace @exemple.fr",
      ".point@exemple.fr",
      "x@exemple..fr",
      42,
    ]) {
      expect(normaliserAdresse(faux), String(faux)).toBeNull();
    }
  });

  it("calcule des empreintes stables, distinctes par contexte", () => {
    const a = empreinteAdresse(SECRET, "a@exemple.fr");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(empreinteAdresse(SECRET, "a@exemple.fr")).toBe(a);
    expect(empreinteIp(SECRET, "a@exemple.fr")).not.toBe(a);
    expect(empreinteAdresse(`${SECRET}x`, "a@exemple.fr")).not.toBe(a);
    expect(empreinteIp(SECRET, "inconnu")).toBeNull();
  });

  it("ne garde du jeton de confirmation que son empreinte", () => {
    const { jeton, empreinte } = nouveauJeton();
    expect(jeton).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(empreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(empreinte).not.toContain(jeton);
    expect(empreinteJeton(jeton)).toBe(empreinte);
    expect(empreinteJeton("trop-court")).toBeNull();
    expect(nouveauJeton().jeton).not.toBe(jeton);
  });

  it("signe la désinscription et refuse toute falsification", () => {
    const jeton = jetonDesinscription(SECRET, ABONNE);
    expect(lireJetonDesinscription(SECRET, jeton)).toBe(ABONNE);
    expect(lireJetonDesinscription(`${SECRET}!`, jeton)).toBeNull();
    const autre = "3f2a4b6c-1d2e-4f50-8a9b-0c1d2e3f4a5c";
    const signature = jeton.split(".")[1];
    expect(lireJetonDesinscription(SECRET, `${autre}.${signature}`)).toBeNull();
    expect(lireJetonDesinscription(SECRET, `${ABONNE}.court`)).toBeNull();
    expect(lireJetonDesinscription(SECRET, "n-importe-quoi")).toBeNull();
  });

  it("ne garde du référent que le nom de domaine", () => {
    expect(hoteReferent("https://www.linkedin.com/feed/?x=1#a")).toBe(
      "www.linkedin.com",
    );
    expect(hoteReferent("javascript:alert(1)")).toBeNull();
    expect(hoteReferent("")).toBeNull();
  });

  it("borne les paramètres de campagne à quatre clés propres", () => {
    const valeurs: Record<string, string> = {
      utm_source: "linkedin",
      utm_medium: "post",
      utm_campaign: "<script>",
      utm_term: "ignore",
    };
    expect(campagneDepuis((c) => valeurs[c])).toEqual({
      utm_source: "linkedin",
      utm_medium: "post",
    });
  });
});

describe("EH0, les textes lus par une personne", () => {
  const textes = [
    CONSENTEMENT.texteCase,
    CONSENTEMENT.texteMention,
    ...BLOCS_LETTRE.flatMap((b) => [b.nom, b.texte]),
    ...ENGAGEMENTS.flatMap((e) => [e.titre, e.texte]),
    ...MENTION_COMPLETE.flatMap((m) => [m.label, m.valeur]),
    ...Object.values(ETATS_PAGE).flatMap((e) => [e.titre, e.texte]),
    ...PARAGRAPHES_CONFIRMATION,
    ...PARAGRAPHES_BIENVENUE,
  ];

  it("n’emploient aucun mot fermé ni tiret long", () => {
    for (const texte of textes) {
      const bloquants = controlerTexte(texte).filter(
        (c) => c.niveau === "interdit",
      );
      expect(bloquants, texte.slice(0, 60)).toEqual([]);
    }
  });

  it("le message de bienvenue n’annonce ni date ni délai", () => {
    const contenu = messageBienvenue({
      desinscription: `${SITE}/api/lettre?desinscription=x`,
      site: SITE,
    });
    for (const texte of [contenu.objet, ...PARAGRAPHES_BIENVENUE]) {
      expect(controlerTexte(texte, { sansDate: true }), texte).toEqual([]);
    }
    expect(contenu.texte).toContain("n’a pas encore commencé à paraître");
  });

  it("la case de consentement dit la note trimestrielle et le clic de sortie", () => {
    expect(CONSENTEMENT.version).toMatch(/^EH0-\d+$/);
    expect(CONSENTEMENT.texteCase).toContain("désinscrire en un clic");
    expect(CONSENTEMENT.texteCase).toContain("par trimestre");
  });

  it("la mention complète couvre les cinq rubriques exigées", () => {
    const labels = MENTION_COMPLETE.map((m) => m.label);
    for (const attendu of [
      "Responsable de traitement",
      "Finalité",
      "Conservation",
      "Vos droits",
      "Destinataires",
    ]) {
      expect(labels).toContain(attendu);
    }
    expect(MENTION_COMPLETE[0]?.valeur).toContain("SIREN 913518031");
  });
});

describe("EH0, les messages envoyés", () => {
  it("la confirmation porte le lien et ne demande aucune désinscription", () => {
    const lien = `${SITE}/api/lettre?confirmation=abc`;
    const m = messageConfirmation({ lien, site: SITE });
    expect(m.html).toContain(lien);
    expect(m.texte).toContain(lien);
    expect(m.html).not.toMatch(/<img/i);
  });

  it("chaque message de liste porte sa désinscription en un clic, dans le corps", () => {
    const desinscription = `${SITE}/api/lettre?desinscription=${jetonDesinscription(SECRET, ABONNE)}`;
    const bienvenue = messageBienvenue({ desinscription, site: SITE });
    const note = messageNote({
      note: {
        objet: "SIGNAL, la note du trimestre",
        decide: "a".repeat(130),
        echoue: "b".repeat(130),
        preparation: "c".repeat(130),
      },
      desinscription,
      site: SITE,
    });
    for (const m of [bienvenue, note]) {
      expect(m.html).toContain("Se désinscrire en un clic");
      expect(m.html).toContain(desinscription);
      expect(m.texte).toContain(desinscription);
      expect(m.html).not.toMatch(/<img|open\.gif|pixel/i);
    }
  });

  it("échappe le texte d’une note et ne lie que les adresses du site", () => {
    const m = messageNote({
      note: {
        objet: "SIGNAL, la note du trimestre",
        decide: `<b>gras</b> et ${SITE}/decisions à lire, puis https://ailleurs.exemple ${"x".repeat(80)}`,
        echoue: "e".repeat(130),
        preparation: "p".repeat(130),
      },
      desinscription: `${SITE}/api/lettre?desinscription=x`,
      site: SITE,
    });
    expect(m.html).toContain("&lt;b&gt;gras&lt;/b&gt;");
    expect(m.html).toContain(`href="${SITE}/decisions"`);
    expect(m.html).not.toContain('href="https://ailleurs.exemple"');
  });

  it("l’examen de note refuse la date, le mot fermé et le paragraphe trop court", () => {
    const verdict = examinerNote({
      objet: "SIGNAL, la note de mai",
      decide: "Une décision certifiée. ".repeat(8),
      echoue: "court",
      preparation: "La première lettre paraîtra dans trois mois. ".repeat(4),
    });
    const texte = verdict.bloquants.join(" ");
    expect(texte).toContain("Sans date");
    expect(texte).toContain("ADEC-19");
    expect(texte).toContain("Ce qui a échoué");
    expect(texte).toContain("Sans délai");
  });
});

describe("EH0, l’envoi par Resend", () => {
  it("pose List-Unsubscribe et List-Unsubscribe-Post (RFC 8058)", () => {
    const corps = charge(configValide(), {
      destinataire: "a@exemple.fr",
      objet: "o",
      texte: "t",
      html: "h",
      categorie: "bienvenue",
      desinscription: `${SITE}/api/lettre?desinscription=j`,
    });
    expect(corps.from).toBe("Adama Diallo <signal@lettre.adamesg-os.fr>");
    expect(corps.headers["List-Unsubscribe"]).toBe(
      `<${SITE}/api/lettre?desinscription=j>`,
    );
    expect(corps.headers["List-Unsubscribe-Post"]).toBe(
      "List-Unsubscribe=One-Click",
    );
    expect(corps.reply_to).toBe("diadamflow@gmail.com");
  });

  it("refuse d’envoyer un message de liste sans désinscription", () => {
    expect(() =>
      charge(configValide(), {
        destinataire: "a@exemple.fr",
        objet: "o",
        texte: "t",
        html: "h",
        categorie: "note",
      }),
    ).toThrow(/désinscription/);
  });

  it("rejoue les refus de configuration à l’envoi", async () => {
    const faux = vi.fn();
    const config = { ...configValide(), expediteur: "a@strata-esg.fr" };
    const r = await envoyer(
      config,
      {
        destinataire: "a@exemple.fr",
        objet: "o",
        texte: "t",
        html: "h",
        categorie: "confirmation",
      },
      "cle",
      faux as unknown as typeof fetch,
    );
    expect(r.ok).toBe(false);
    expect(faux).not.toHaveBeenCalled();
  });

  it("envoie avec une clé d’idempotence et rend l’identifiant", async () => {
    const faux = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: "msg_1" }), { status: 200 }),
    );
    const r = await envoyer(
      configValide(),
      {
        destinataire: "a@exemple.fr",
        objet: "o",
        texte: "t",
        html: "h",
        categorie: "confirmation",
      },
      "confirmation-1",
      faux as unknown as typeof fetch,
    );
    expect(r).toEqual({ ok: true, id: "msg_1" });
    const [url, init] = faux.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(
      "confirmation-1",
    );
    const corps = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(corps).not.toHaveProperty("track_opens");
  });

  it("classe un 429 comme réessayable et un 422 comme définitif", async () => {
    const envoi = {
      destinataire: "a@exemple.fr",
      objet: "o",
      texte: "t",
      html: "h",
      categorie: "confirmation" as const,
    };
    const r429 = await envoyer(
      configValide(),
      envoi,
      "k",
      (async () =>
        new Response("", { status: 429 })) as unknown as typeof fetch,
    );
    const r422 = await envoyer(
      configValide(),
      envoi,
      "k",
      (async () =>
        new Response("", { status: 422 })) as unknown as typeof fetch,
    );
    expect(r429).toMatchObject({ ok: false, reessayable: true });
    expect(r422).toMatchObject({ ok: false, reessayable: false });
  });

  it("un lot rend un résultat par message, et un échec commun sans rien marquer", async () => {
    const envois = [1, 2].map((i) => ({
      destinataire: `a${i}@exemple.fr`,
      objet: "o",
      texte: "t",
      html: "h",
      categorie: "note" as const,
      desinscription: `${SITE}/api/lettre?desinscription=${i}`,
    }));
    const ok = await envoyerLot(
      configValide(),
      envois,
      "lot",
      (async () =>
        new Response(JSON.stringify({ data: [{ id: "m1" }, { id: "m2" }] }), {
          status: 200,
        })) as unknown as typeof fetch,
    );
    expect(ok).toEqual([
      { ok: true, id: "m1" },
      { ok: true, id: "m2" },
    ]);
    const ko = await envoyerLot(configValide(), envois, "lot", (async () => {
      throw new Error("coupure");
    }) as unknown as typeof fetch);
    expect(ko.every((r) => !r.ok)).toBe(true);
  });
});

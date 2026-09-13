import { createServer, request, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// =====================================================================
// EH0, la lettre de bout en bout contre une vraie base et un vrai PostgREST.
//
// Ne tourne que si ADAMA_TEST_LETTRE_REST et ADAMA_TEST_LETTRE_JWT sont
// poses, comme tests/rls.integration.test.ts. Aucun compte reel : un
// Postgres et un PostgREST jetables, la migration 0001_lettre jouee dessus,
// et l'outil d'envoi simule. La procedure est dans docs/LETTRE.md.
//
// Ce test prouve ce que les tests unitaires ne peuvent pas prouver : que les
// noms de parametres, les formes de retour des fonctions SQL et la lecture
// des notes avec leur compte d'envois correspondent a lib/lettre/registre.ts.
// =====================================================================

const REST = process.env.ADAMA_TEST_LETTRE_REST;
const JWT = process.env.ADAMA_TEST_LETTRE_JWT;
const actif = Boolean(REST && JWT);

const envoyes = vi.hoisted(
  () => [] as { categorie: string; texte: string; desinscription?: string }[],
);
vi.mock("../lib/lettre/envoi", async (original) => {
  const reel = await original<typeof import("../lib/lettre/envoi")>();
  let n = 0;
  return {
    ...reel,
    envoyer: vi.fn(
      async (
        _c: unknown,
        e: { categorie: string; texte: string; desinscription?: string },
      ) => {
        envoyes.push(e);
        n += 1;
        return { ok: true, id: `faux_${n}` };
      },
    ),
    envoyerLot: vi.fn(
      async (
        _c: unknown,
        lot: { categorie: string; texte: string; desinscription?: string }[],
      ) =>
        lot.map((e) => {
          envoyes.push(e);
          n += 1;
          return { ok: true, id: `faux_${n}` };
        }),
    ),
  };
});

import type { ConfigLettre } from "../lib/lettre/config";
import { empreinteAdresse } from "../lib/lettre/jetons";
import {
  confirmerInscription,
  demanderInscription,
  desinscrireParJeton,
  entretenir,
  envoyerLotNote,
  verifierLien,
} from "../lib/lettre/parcours";
import {
  enregistrerNote,
  etatListe,
  exporter,
  listerNotes,
} from "../lib/lettre/registre";

let serveur: Server;
let config: ConfigLettre;

beforeAll(async () => {
  if (!actif) return;
  // supabase-js appelle <url>/rest/v1 ; PostgREST sert a la racine.
  const cible = new URL(REST as string);
  serveur = createServer((req, res) => {
    const chemin = (req.url ?? "/").replace(/^\/rest\/v1/, "");
    const amont = request(
      {
        hostname: cible.hostname,
        port: cible.port,
        path: chemin,
        method: req.method,
        headers: { ...req.headers, host: cible.host },
      },
      (r) => {
        res.writeHead(r.statusCode ?? 502, r.headers);
        r.pipe(res);
      },
    );
    req.pipe(amont);
  });
  await new Promise<void>((ok) => serveur.listen(0, "127.0.0.1", ok));
  const { port } = serveur.address() as AddressInfo;
  config = {
    supabaseUrl: `http://127.0.0.1:${port}`,
    supabaseCle: JWT as string,
    resendCle: "re_simule",
    expediteur: "Adama Diallo <signal@lettre.adamesg-os.fr>",
    domaineEnvoi: "lettre.adamesg-os.fr",
    reponse: "diadamflow@gmail.com",
    secret: "un-secret-d-integration-assez-long-32",
    plafondJour: 100,
    collecteOuverte: true,
    administrateurs: [],
  };
});

afterAll(async () => {
  if (serveur) await new Promise((ok) => serveur.close(ok));
});

const adresse = `integration-${Date.now()}@exemple.fr`;
const demande = {
  adresse,
  ip: "198.51.100.4",
  referentHote: "www.linkedin.com",
  campagne: { utm_source: "linkedin" },
};

function parametre(texte: string, nom: string): string {
  const trouve = texte.match(new RegExp(`${nom}=([A-Za-z0-9_.%-]+)`));
  if (!trouve?.[1]) throw new Error(`${nom} absent du message`);
  return decodeURIComponent(trouve[1]);
}

describe.skipIf(!actif)("EH0, bout en bout sur base jetable", () => {
  let jetonDesinscription = "";

  it("demande, confirme, accueille, sans doublon", async () => {
    expect(await demanderInscription(config, demande)).toBe(
      "confirmation_partie",
    );
    expect(await demanderInscription(config, demande)).toBe("rien_a_envoyer");
    const confirmation = envoyes.find((e) => e.categorie === "confirmation");
    const jeton = parametre(confirmation?.texte ?? "", "confirmation");

    expect(await verifierLien(config, jeton)).toBe("valide");
    expect(await confirmerInscription(config, jeton, "198.51.100.4")).toBe(
      "confirme",
    );
    expect(await confirmerInscription(config, jeton, "198.51.100.4")).toBe(
      "invalide",
    );

    const bienvenue = envoyes.find((e) => e.categorie === "bienvenue");
    expect(bienvenue?.desinscription).toContain("desinscription=");
    jetonDesinscription = parametre(
      bienvenue?.desinscription ?? "",
      "desinscription",
    );

    const etat = await etatListe(config);
    expect(etat.confirmes).toBeGreaterThanOrEqual(1);
    expect(etat.bienvenues_en_attente).toBe(0);
    expect(etat.envois_du_jour).toBeGreaterThanOrEqual(2);
  });

  it("envoie la note par lot, la clôt, et compte ses envois", async () => {
    const code = `NOTE-${String(Date.now()).slice(-3)}`;
    const id = await enregistrerNote(config, {
      id: null,
      code,
      objet: "SIGNAL, la note du trimestre",
      decide:
        "Décision prise et tracée publiquement, avec les options écartées et la raison du choix retenu. ".repeat(
          2,
        ),
      echoue:
        "Un essai a échoué, son coût est écrit, et ce qui en est gardé l’est aussi, sans aucun dossier. ".repeat(
          2,
        ),
      preparation:
        "La préparation de la lettre avance, et ce qui manque encore est nommé sans promettre de date. ".repeat(
          2,
        ),
      relue: true,
    });
    const note = (await listerNotes(config)).find((n) => n.id === id);
    expect(note?.statut).toBe("brouillon");
    expect(note?.envois).toBe(0);

    const bilan = await envoyerLotNote(
      config,
      note as NonNullable<typeof note>,
    );
    expect(bilan).toMatchObject({
      etat: "lot_envoye",
      en_echec: 0,
      reste: false,
    });
    const apres = (await listerNotes(config)).find((n) => n.id === id);
    expect(apres?.statut).toBe("envoyee");
    expect(apres?.envois).toBeGreaterThanOrEqual(1);
  });

  it("exporte tout ce que la base sait d’une adresse", async () => {
    const donnees = (await exporter(
      config,
      empreinteAdresse(config.secret, adresse),
    )) as {
      provenance: { referent_hote: string };
      journal: unknown[];
      consentement: { version: string };
    };
    expect(donnees.provenance.referent_hote).toBe("www.linkedin.com");
    expect(donnees.consentement.version).toBe("EH0-1");
    expect(donnees.journal.length).toBeGreaterThanOrEqual(4);
  });

  it("désinscrit en un clic, efface l’adresse, garde la preuve", async () => {
    expect(
      await desinscrireParJeton(config, jetonDesinscription, "en_tete_un_clic"),
    ).toBe("desinscrit");
    expect(await desinscrireParJeton(config, jetonDesinscription, "lien")).toBe(
      "deja",
    );
    const donnees = (await exporter(
      config,
      empreinteAdresse(config.secret, adresse),
    )) as {
      email: string | null;
      desinscrit_le: string | null;
      motif_desinscription: string;
    };
    expect(donnees.email).toBeNull();
    expect(donnees.desinscrit_le).not.toBeNull();
    expect(donnees.motif_desinscription).toBe("en_tete_un_clic");
  });

  it("l’entretien rend son bilan de rétention", async () => {
    const bilan = await entretenir(config);
    expect(bilan.purge).toHaveProperty("demandes_jamais_confirmees");
    expect(bilan.bienvenues).toEqual({ envoyees: 0, en_echec: 0 });
  });
});

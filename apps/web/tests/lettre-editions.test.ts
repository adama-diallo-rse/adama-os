import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { STOCK_SIGNAL } from "../content/signal-stock";
import {
  BLOCS_EDITION,
  CLES_BLOCS,
  depuisColonnes,
  differences,
  editionVide,
  examinerEdition,
  mentionIa,
  numeroAffiche,
  objetEdition,
  versColonnes,
  type ContenuEdition,
} from "../lib/lettre/editions";
import {
  PARAGRAPHES_BIENVENUE_PARUE,
  messageBienvenue,
} from "../lib/lettre/messages";
import { lienEdition, messageEdition } from "../lib/lettre/message-edition";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EH4, les éditions SIGNAL : la forme, le contrôle, le stock, le message
// envoyé et le contrat de la migration 0003_editions.
// =====================================================================

const SITE = "https://adamesg-os.fr";
const DESINSCRIPTION = `${SITE}/api/lettre?desinscription=jeton`;

const SQL = readFileSync(
  join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "db",
    "migrations-lettre",
    "0003_editions.sql",
  ),
  "utf8",
);
const CODE = SQL.split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n");

function copie(e: ContenuEdition): ContenuEdition {
  return { numero: e.numero, fr: { ...e.fr }, en: { ...e.en } };
}

describe("EH4, le stock EX1", () => {
  it("compte dix numéros, de 1 à 10, sans trou ni doublon", () => {
    expect(STOCK_SIGNAL.map((e) => e.numero)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("chaque numéro passe le contrôle complet, dans les deux langues", () => {
    for (const e of STOCK_SIGNAL) {
      expect(examinerEdition(e).bloquants, `#${e.numero}`).toEqual([]);
    }
  });

  it("aucun numéro ne parle d’intelligence artificielle", () => {
    for (const e of STOCK_SIGNAL) {
      for (const langue of ["fr", "en"] as const) {
        const tout = Object.values(e[langue]).join(" ");
        expect(mentionIa(tout), `#${e.numero} ${langue}`).toBeNull();
      }
    }
  });

  it("aucun numéro ne cite d’identifiant technique interne", () => {
    for (const e of STOCK_SIGNAL) {
      const tout = JSON.stringify(e);
      expect(tout, `#${e.numero}`).not.toMatch(
        /sgymoieskfhdzeimvsti|SERVICE_ROLE|re_[A-Za-z0-9]{8,}|commit [0-9a-f]{7}/,
      );
    }
  });

  it("chaque Signal cite une source primaire en https, hors du texte", () => {
    for (const e of STOCK_SIGNAL) {
      for (const langue of ["fr", "en"] as const) {
        expect(e[langue].source).toMatch(/^https:\/\//);
        expect(e[langue].signal).not.toMatch(/Source\s*:/);
      }
    }
  });
});

describe("EH4, le contrôle d’une édition", () => {
  const base = STOCK_SIGNAL[0] as ContenuEdition;

  it("refuse une mention d’IA, en majuscules comme en toutes lettres", () => {
    for (const texte of [
      "Une IA tranche à notre place sur ce point précis du système.",
      "The AI decides here, which is exactly what we refuse to accept now.",
      "Un modèle d’intelligence artificielle propose, le responsable dispose ici.",
    ]) {
      const e = copie(base);
      e.fr.systeme = texte;
      e.en.systeme = texte;
      expect(examinerEdition(e).bloquants.join(" ")).toMatch(/le moteur/);
    }
  });

  it("laisse passer le français ordinaire : j’ai, mais, aide", () => {
    const e = copie(base);
    e.fr.construction =
      "J’ai construit la page, mais l’aide en ligne reste à écrire : elle viendra avec la preuve.";
    expect(examinerEdition(e).bloquants).toEqual([]);
  });

  it("refuse une source absente ou non https", () => {
    const e = copie(base);
    e.fr.source = "http://exemple.fr/texte";
    e.en.source = "";
    const b = examinerEdition(e).bloquants.join(" ");
    expect(b).toMatch(/source français/);
    expect(b).toMatch(/source anglais/);
  });

  it("refuse un bloc trop court, un saut de ligne et un tiret long", () => {
    const e = copie(base);
    e.fr.idee = "Trop court.";
    e.en.decision =
      "Une ligne\npuis une autre, ce qui casse le paragraphe du bloc.";
    e.fr.systeme = `${base.fr.systeme} ${String.fromCharCode(0x2014)} avec un tiret long.`;
    const b = examinerEdition(e).bloquants.join(" ");
    expect(b).toMatch(/Idée.*caractères/);
    expect(b).toMatch(/un paragraphe/);
    expect(b).toMatch(/tiret long/);
  });

  it("refuse un numéro hors bornes", () => {
    expect(examinerEdition({ ...copie(base), numero: 0 }).bloquants[0]).toMatch(
      /numéro/,
    );
  });

  it("une édition vide est entièrement bloquée, rien ne part par erreur", () => {
    expect(examinerEdition(editionVide(11)).bloquants.length).toBeGreaterThan(
      10,
    );
  });
});

describe("EH4, passage aux colonnes et corrections", () => {
  const e = STOCK_SIGNAL[1] as ContenuEdition;

  it("aller et retour sans perte", () => {
    expect(depuisColonnes(versColonnes(e))).toEqual(e);
  });

  it("une correction ne porte que les champs changés, jamais le numéro", () => {
    const apres = copie(e);
    apres.fr.titre = "Une décision a toujours un propriétaire";
    apres.en.source = "https://adr.github.io/";
    const diff = differences(e, apres);
    expect(diff).toEqual({
      titre_fr: "Une décision a toujours un propriétaire",
      source_en: "https://adr.github.io/",
    });
    expect("numero" in diff).toBe(false);
  });
});

describe("EH4, le message envoyé", () => {
  const e = STOCK_SIGNAL[0] as ContenuEdition;

  it("porte l’objet numéroté, les cinq blocs, la source et le lien en ligne", () => {
    for (const langue of ["fr", "en"] as const) {
      const m = messageEdition({
        edition: e,
        langue,
        desinscription: DESINSCRIPTION,
        site: SITE,
      });
      expect(m.objet).toBe(objetEdition(1, e[langue].titre));
      expect(m.objet).toMatch(/^SIGNAL #001, /);
      for (const b of BLOCS_EDITION) {
        expect(m.texte).toContain(e[langue][b.cle]);
      }
      expect(m.html).toContain(e[langue].source.replace(/&/g, "&amp;"));
      expect(m.texte).toContain(lienEdition(SITE, 1, langue));
      expect(m.html).toContain(`lang="${langue}"`);
    }
  });

  it("garde la désinscription en un clic et aucun pixel, dans les deux langues", () => {
    const fr = messageEdition({
      edition: e,
      langue: "fr",
      desinscription: DESINSCRIPTION,
      site: SITE,
    });
    const en = messageEdition({
      edition: e,
      langue: "en",
      desinscription: DESINSCRIPTION,
      site: SITE,
    });
    expect(fr.html).toContain("Se désinscrire en un clic");
    expect(en.html).toContain("Unsubscribe in one click");
    expect(en.html).not.toContain("Se désinscrire");
    for (const m of [fr, en]) {
      expect(m.html).toContain(DESINSCRIPTION);
      expect(m.texte).toContain(DESINSCRIPTION);
      expect(m.html).not.toMatch(/<img|pixel|open\.gif/i);
    }
  });

  it("échappe le texte et ne lie que les adresses du site", () => {
    const piege = copie(e);
    piege.fr.construction =
      "Preuve <script>alert(1)</script> sur adamesg-os.fr/decisions et envoi depuis lettre.adamesg-os.fr, rien ailleurs.";
    const m = messageEdition({
      edition: piege,
      langue: "fr",
      desinscription: DESINSCRIPTION,
      site: SITE,
    });
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain('href="https://adamesg-os.fr/decisions"');
    expect(m.html).not.toContain('href="https://lettre.adamesg-os.fr');
  });

  it("l’adresse publique d’un numéro s’écrit sur trois chiffres", () => {
    expect(numeroAffiche(7)).toBe("007");
    expect(lienEdition(SITE, 7, "fr")).toBe(`${SITE}/lettre/007`);
    expect(lienEdition(SITE, 7, "en")).toBe(`${SITE}/lettre/007?langue=en`);
  });
});

describe("EH4, la bienvenue après la première parution", () => {
  it("cesse de dire que la lettre n’a pas paru, et pointe le dernier numéro", () => {
    const m = messageBienvenue({
      desinscription: DESINSCRIPTION,
      site: SITE,
      parue: {
        numero: 3,
        titre: "Séparer les surfaces et les responsabilités",
      },
    });
    expect(m.texte).not.toContain("n’a pas encore commencé à paraître");
    expect(m.texte).toContain(`${SITE}/lettre/003`);
    expect(m.texte).toContain("SIGNAL #003");
  });

  it("n’annonce ni date ni délai, et n’emploie aucun mot fermé", () => {
    for (const texte of PARAGRAPHES_BIENVENUE_PARUE) {
      expect(controlerTexte(texte, { sansDate: true }), texte).toEqual([]);
    }
  });
});

describe("EH4, la migration 0003_editions lue comme un contrat", () => {
  it("s’arrête hors du projet dédié et sans 0001_lettre", () => {
    expect(CODE).toContain("'decisions_log'");
    expect(CODE).toContain("table_name = 'lettre_abonnes'");
  });

  it("garde un numéro par édition, à vie", () => {
    expect(CODE).toMatch(/numero\s+integer not null unique/);
    expect(CODE).toContain("est attribue a vie");
  });

  it("porte les colonnes de chaque bloc dans les deux langues", () => {
    for (const cle of [...CLES_BLOCS, "titre", "source"]) {
      for (const langue of ["fr", "en"]) {
        expect(CODE, `${cle}_${langue}`).toContain(`${cle}_${langue}`);
      }
    }
  });

  it("refuse en base une mention d’IA et un envoi non relu", () => {
    expect(CODE).toContain("lettre_editions_sans_ia");
    expect(CODE).toContain("lettre_editions_relue_avant_envoi");
  });

  it("fige un numéro parti, sauf par une correction tracée", () => {
    expect(CODE).toContain("lettre.correction");
    expect(CODE).toMatch(
      /create table if not exists lettre_editions_revisions/,
    );
    expect(CODE).toContain("lettre_editions_revisions_immuable");
  });

  it("compte les éditions dans le plafond du jour et le journal", () => {
    expect(CODE).toMatch(/'edition_envoyee'/);
    expect(CODE).toMatch(
      /create or replace function lettre_envois_du_jour[\s\S]*'edition_envoyee'/,
    );
  });

  it("ferme les tables et les fonctions aux rôles anon et authenticated", () => {
    for (const table of [
      "lettre_editions",
      "lettre_envois_editions",
      "lettre_editions_revisions",
    ]) {
      expect(CODE).toContain(`alter table ${table} enable row level security`);
    }
    expect(CODE).toMatch(
      /revoke all on function %s from public, anon, authenticated/,
    );
    expect(CODE).not.toMatch(/create policy/i);
  });

  it("envoie les numéros dans l’ordre, jamais deux à la fois", () => {
    expect(CODE).toContain("numero_precedent_non_parti");
    expect(CODE).toContain("autre_edition_en_cours");
    expect(CODE).toContain("edition_en_cours");
  });
});

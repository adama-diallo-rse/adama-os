import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAPACITE,
  CLAUSE_RENVOI,
  CONDITIONS,
  DIAGNOSTIC,
  FORMATS_REVUE,
  INTERDITS,
  MENTION_DEMANDE,
  PORTES,
  RAPPORT_REVUE,
  VERROUS,
  periodeCourante,
  reponseReception,
} from "../content/conseil";
import { demandesOuvertes, messageNotification } from "../lib/conseil/registre";
import {
  CHOIX_ATTENDU,
  CHOIX_ECHEANCE,
  CHOIX_STRATA,
  CODES_PORTE,
  REFUS,
  lireDemande,
  phraseRefus,
  qualifier,
  type Demande,
  type MotifRefus,
} from "../lib/conseil/qualification";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EG0 a EG2, les quatre portes, le diagnostic court et la revue.
// =====================================================================

const RACINE = join(__dirname, "..");
const lire = (relatif: string) => readFileSync(join(RACINE, relatif), "utf8");
const SQL = readFileSync(
  join(RACINE, "../../packages/db/migrations-lettre/0002_conseil.sql"),
  "utf8",
);

function bloquants(texte: string) {
  return controlerTexte(texte).filter((c) => c.niveau !== "relire");
}

const DEMANDE: Record<string, string> = {
  porte: "donnee",
  attendu: "architecture",
  strata: "aucune",
  echeance: "plus-2-mois",
  organisation: "Une coopérative agricole",
  nom: "Awa Ndiaye",
  email: "Awa.Ndiaye@Exemple.org ",
  probleme:
    "Nos chiffres d’émissions viennent de trois tableurs différents, et personne ne sait lequel fait foi. Le rapport de l’an dernier ne se recalcule plus.",
  consentement: "oui",
};

describe("EG0, les quatre portes", () => {
  it("reprend les quatre portes de la branche, dans l'ordre", () => {
    expect(PORTES.map((p) => p.titre)).toEqual([
      "Construire",
      "Donnée",
      "Intelligence artificielle",
      "Système",
    ]);
    expect(PORTES.map((p) => p.code)).toEqual([...CODES_PORTE]);
  });

  it("dit pour chaque porte ce qu'elle livre et ce qu'elle ne livre pas", () => {
    for (const p of PORTES) {
      expect(p.livre.length, p.code).toBeGreaterThanOrEqual(3);
      expect(p.neLivrePas.length, p.code).toBeGreaterThan(10);
      expect(p.duree, p.code).toBeTruthy();
    }
  });

  it("n'affiche aucun prix sur la page des portes", () => {
    const page = lire("app/travaillez-avec-moi/page.tsx");
    const formulaire = lire("app/travaillez-avec-moi/formulaire.tsx");
    for (const source of [page, formulaire, JSON.stringify(PORTES)]) {
      expect(source).not.toMatch(/€|\beuros?\b|DIAGNOSTIC\.prix/i);
    }
  });

  it("reprend la regle a quatre conditions et les quatre interdits", () => {
    expect(CONDITIONS.map((c) => c.numero)).toEqual([1, 2, 3, 4]);
    expect(INTERDITS).toHaveLength(4);
  });

  it("passe le vocabulaire ferme sur tout ce qu'une personne lit", () => {
    const textes = [
      ...PORTES.flatMap((p) => [
        p.probleme,
        p.premierPas,
        ...p.livre,
        p.neLivrePas,
        p.duree,
        p.ouverture ?? "",
      ]),
      ...CONDITIONS.flatMap((c) => [c.texte, c.verification]),
      ...INTERDITS.flatMap((i) => [i.titre, i.texte]),
      ...CAPACITE.map((c) => c.plafond),
      MENTION_DEMANDE.texteCase,
      ...MENTION_DEMANDE.lignes.map((l) => l.valeur),
      CLAUSE_RENVOI,
      ...CHOIX_ATTENDU.map((c) => c.libelle),
      ...CHOIX_STRATA.map((c) => c.libelle),
      ...CHOIX_ECHEANCE.map((c) => c.libelle),
    ];
    for (const t of textes) expect(bloquants(t), t).toEqual([]);
  });
});

describe("EG0, la qualification", () => {
  it("rend recevable une demande qui tient les trois conditions declarees", () => {
    expect(
      qualifier({
        attendu: "architecture",
        strata: "aucune",
        echeance: "aucune",
      }).verdict,
    ).toBe("recevable");
  });

  it("refuse au premier manquement, dans l'ordre de la regle", () => {
    const q = qualifier({
      attendu: "livrable",
      strata: "prospect",
      echeance: "moins-2-semaines",
    });
    expect(q.verdict).toBe("refus");
    if (q.verdict === "refus") {
      expect(q.principal).toBe("strata");
      expect(q.motifs).toEqual(["strata", "livrable", "delai"]);
    }
  });

  it.each([
    ["livrable", { attendu: "livrable" }],
    ["interpretation", { attendu: "interpretation" }],
    ["verification", { attendu: "verification" }],
    ["developpement", { attendu: "developpement" }],
    ["delai", { echeance: "moins-2-semaines" }],
    ["strata", { strata: "client" }],
  ] as const)("refuse pour le motif %s", (motif, ecart) => {
    const q = qualifier({
      attendu: "architecture",
      strata: "aucune",
      echeance: "plus-2-mois",
      ...ecart,
    });
    expect(q.verdict === "refus" && q.principal).toBe(motif);
  });

  it("ecrit une reponse de refus qui part telle quelle, sans mot ferme", () => {
    for (const motif of Object.keys(REFUS) as MotifRefus[]) {
      const phrase = phraseRefus(motif);
      expect(phrase.startsWith("Merci")).toBe(true);
      expect(phrase).toContain("la même porte reste ouverte");
      expect(phrase).not.toMatch(/[—–]/);
      expect(bloquants(phrase), motif).toEqual([]);
    }
  });

  it("n'oriente vers l'exterieur que vers STRATA ESG", () => {
    for (const r of Object.values(REFUS)) {
      if (r.lien)
        expect(r.lien.href).toMatch(/^https:\/\/www\.strata-esg\.fr\//);
    }
  });
});

describe("EG0, la lecture du formulaire", () => {
  const lecture = (ecart: Record<string, string> = {}) =>
    lireDemande((cle) => ({ ...DEMANDE, ...ecart })[cle]);

  it("borne et normalise une demande valide", () => {
    const l = lecture();
    expect(l.ok).toBe(true);
    if (l.ok) {
      expect(l.demande.email).toBe("awa.ndiaye@exemple.org");
      expect(l.demande.porte).toBe("donnee");
    }
  });

  it.each([
    ["porte", { porte: "cuisine" }],
    ["attendu", { attendu: "" }],
    ["strata", { strata: "peut-etre" }],
    ["echeance", { echeance: "demain" }],
    ["organisation", { organisation: "x" }],
    ["nom", { nom: "" }],
    ["email", { email: "pas-une-adresse" }],
    ["probleme", { probleme: "trop court" }],
    ["consentement", { consentement: "" }],
  ] as const)("refuse un champ %s invalide", (champ, ecart) => {
    const l = lecture(ecart);
    expect(l.ok).toBe(false);
    if (!l.ok) expect(l.champ).toBe(champ);
  });

  it("refuse une description au-dela de trois mille caracteres", () => {
    const l = lecture({ probleme: "a".repeat(3001) });
    expect(!l.ok && l.champ).toBe("probleme");
  });
});

describe("EG0, la base dediee", () => {
  it("s'arrete dans le projet partage et exige la lettre", () => {
    expect(SQL).toContain("'leads', 'proof_claims'");
    expect(SQL).toContain("table_name = 'lettre_abonnes'");
  });

  it("n'accepte que ce que la qualification rend recevable", () => {
    expect(SQL).toContain("check (attendu = 'architecture')");
    expect(SQL).toContain("check (strata = 'aucune')");
    const recevables = CHOIX_ECHEANCE.map((c) => c.valeur).filter(
      (v) => v !== "moins-2-semaines",
    );
    expect(SQL).toContain(
      `check (echeance in (${recevables.map((v) => `'${v}'`).join(", ")}))`,
    );
    expect(SQL).toContain(
      `check (porte in (${CODES_PORTE.map((v) => `'${v}'`).join(", ")}))`,
    );
  });

  it("garde la version de mention au format que la base attend", () => {
    expect(MENTION_DEMANDE.version).toMatch(/^EG0-[0-9]+$/);
  });

  it("ferme tout aux roles publics et n'accepte une mission qu'apres les deux controles", () => {
    expect(SQL).toContain("from anon, authenticated");
    expect(SQL).toContain(
      "statut <> 'acceptee' or (condition_4_verifiee and strata_verifie)",
    );
    expect(SQL).toContain("interval '12 months'");
  });
});

describe("EG0, l'ouverture de la reception en ligne", () => {
  it("ne s'ouvre que par la valeur exacte, jamais par defaut", () => {
    expect(demandesOuvertes({})).toBe(false);
    expect(demandesOuvertes({ CONSEIL_DEMANDES: "oui" })).toBe(false);
    expect(demandesOuvertes({ CONSEIL_DEMANDES: "ouvertes" })).toBe(true);
  });
});

describe("EG0, la notification", () => {
  it("echappe le texte libre avant de l'ecrire en HTML", () => {
    const l = lireDemande(
      (cle) =>
        ({
          ...DEMANDE,
          probleme: `<script>alert(1)</script> ${DEMANDE.probleme}`,
        })[cle],
    );
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    const m = messageNotification(
      l.demande as Demande,
      "00000000-0000-0000-0000-000000000000",
      "2026-09-26T10:00:00Z",
      "https://adamesg-os.fr",
    );
    expect(m.html).not.toContain("<script>");
    expect(m.html).toContain("&lt;script&gt;");
    expect(m.reply_to).toBe("awa.ndiaye@exemple.org");
    expect(m.to).toEqual(["diadamflow@gmail.com"]);
  });
});

describe("EG9, le plafond de capacite", () => {
  it("couvre le temps sans trou", () => {
    for (let i = 1; i < CAPACITE.length; i += 1) {
      expect(CAPACITE[i]?.debut).toBe(CAPACITE[i - 1]?.fin);
    }
    expect(CAPACITE.at(-1)?.fin).toBeUndefined();
  });

  it("donne la bonne periode selon la date", () => {
    expect(periodeCourante(new Date("2026-09-26T12:00:00Z")).plafond).toBe(
      "Aucune mission.",
    );
    expect(periodeCourante(new Date("2026-12-15T12:00:00Z")).plafond).toMatch(
      /Une revue courte/,
    );
    expect(periodeCourante(new Date("2027-06-01T12:00:00Z")).plafond).toMatch(
      /Quatre jours/,
    );
  });
});

describe("EG1, le diagnostic court", () => {
  it("tient 90 minutes en six blocs de quinze", () => {
    expect(DIAGNOSTIC.deroule.map((b) => b.debut)).toEqual([
      0, 15, 30, 45, 60, 75,
    ]);
  });

  it("reste dans la fourchette de la branche, 250 a 450 euros", () => {
    expect(DIAGNOSTIC.prix).toEqual({ min: 250, max: 450 });
    for (const r of DIAGNOSTIC.prixRegle) {
      expect(r.prix).toBeGreaterThanOrEqual(250);
      expect(r.prix).toBeLessThanOrEqual(450);
    }
  });

  it("n'ouvre aucune reservation tant que EK3 tient", () => {
    const page = lire("app/diagnostic/page.tsx");
    expect(VERROUS.vente.leve).toBe(false);
    expect(page).toContain("!vente.leve");
    expect(page).not.toMatch(/stripe|checkout|paiement en ligne/i);
  });
});

describe("EG2, la revue d'architecture", () => {
  it("rend un rapport en sept parties, la premiere sur ce qui n'a pas ete lu", () => {
    expect(RAPPORT_REVUE).toHaveLength(7);
    expect(RAPPORT_REVUE[0]?.titre).toMatch(/pas été/);
  });

  it("n'affiche aucun prix et dit que rien ne se vend avant EK2", () => {
    const page = lire("app/revue-architecture/page.tsx");
    expect(page).not.toMatch(/€|\beuros?\b/i);
    expect(VERROUS.assurance.leve).toBe(false);
    expect(page).toContain("!assurance.leve");
    expect(FORMATS_REVUE.map((f) => f.duree)).toEqual([
      "2 jours",
      "5 jours",
      "7 jours",
    ]);
  });

  it("porte la clause de renvoi vers STRATA ESG", () => {
    expect(lire("app/revue-architecture/page.tsx")).toContain("CLAUSE_RENVOI");
    expect(lire("app/travaillez-avec-moi/page.tsx")).toContain("CLAUSE_RENVOI");
  });

  it("ecrit une reponse de reception qui date sans vendre", () => {
    const r = reponseReception({
      nom: "Awa Ndiaye",
      porte: "Donnée",
      recueLe: "26 septembre 2026",
      plafond: "Aucune mission.",
      assuranceLevee: false,
    });
    expect(r).toContain("datée, pas vendue");
    expect(r).not.toMatch(/€|prix de/);
    expect(bloquants(r)).toEqual([]);
  });
});

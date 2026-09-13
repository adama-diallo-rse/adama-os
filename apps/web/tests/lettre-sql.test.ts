import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONSENTEMENT } from "../content/lettre";

// =====================================================================
// EH0, la migration de la base dediee, lue comme un contrat.
//
// Ces controles portent sur le texte de la migration, pas sur une base :
// ils tournent partout, sans compte. Ce qu'ils garantissent est structurel.
// La migration elle-meme a ete jouee sur un Postgres jetable, et ses
// controles de fin de fichier se relisent a chaque execution reelle.
// =====================================================================

const SQL = readFileSync(
  join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "db",
    "migrations-lettre",
    "0001_lettre.sql",
  ),
  "utf8",
);

/** Le SQL sans ses commentaires, pour ne pas compter ce qui est explique. */
const CODE = SQL.split("\n")
  .filter((ligne) => !ligne.trim().startsWith("--"))
  .join("\n");

describe("EH0, la migration de la lettre", () => {
  it("s’arrête si elle reconnaît le projet partagé du cockpit", () => {
    expect(CODE).toMatch(/raise exception/);
    for (const table of [
      "decisions_log",
      "leads",
      "users",
      "lifecycle_emails",
    ]) {
      expect(CODE).toContain(`'${table}'`);
    }
  });

  it("sème le texte de consentement mot pour mot, sans dérive", () => {
    expect(CODE).toContain(`'${CONSENTEMENT.version}'`);
    expect(CODE).toContain(`'${CONSENTEMENT.texteCase}'`);
    expect(CODE).toContain(`'${CONSENTEMENT.texteMention}'`);
  });

  it("n’admet qu’un seul mode de collecte, le formulaire", () => {
    expect(CODE).toContain("check (mode_collecte = 'formulaire')");
    expect(CODE).not.toMatch(/function\s+lettre_importer/i);
    expect(CODE.toLowerCase()).not.toContain("'import'");
  });

  it("ne connaît qu’une liste, celle d’ADAMA", () => {
    expect(CODE).toContain("check (liste = 'ADAMA_SIGNAL')");
    expect(CODE.toLowerCase()).not.toMatch(/strata_|liste = 'strata/);
  });

  it("trace la provenance de chaque adresse, champ par champ", () => {
    for (const colonne of [
      "mode_collecte",
      "surface",
      "chemin",
      "referent_hote",
      "campagne",
      "langue",
      "consentement_version",
      "ip_empreinte",
      "demande_le",
      "confirme_le",
      "desinscrit_le",
      "motif_desinscription",
    ]) {
      expect(CODE, colonne).toMatch(new RegExp(`\\n\\s+${colonne}\\s`));
    }
  });

  it("tient la cohérence de chaque statut par contrainte", () => {
    expect(CODE).toContain("constraint lettre_abonnes_coherence");
    expect(CODE).toMatch(/statut = 'desinscrit'\s+and email is null/);
  });

  it("interdit toute adresse en clair dans le journal", () => {
    expect(CODE).toContain("constraint lettre_evenements_sans_adresse");
  });

  it("rend le consentement et le journal immuables", () => {
    expect(CODE).toMatch(
      /create trigger lettre_consentements_immuable before update or delete/,
    );
    expect(CODE).toMatch(
      /create trigger lettre_evenements_immuable before update or delete/,
    );
  });

  it("refuse une note datée jusque dans la base", () => {
    expect(CODE).toContain("constraint lettre_notes_sans_date");
    expect(CODE).toContain("constraint lettre_notes_relue_avant_envoi");
  });

  it("n’ouvre aucun accès aux rôles anon et authenticated", () => {
    expect(CODE).not.toMatch(/create policy/i);
    expect(CODE.match(/enable row level security/g)?.length).toBe(5);
    expect(CODE).toMatch(/revoke all on lettre_consentements, lettre_abonnes/);
    expect(CODE).toMatch(
      /revoke all on function %s from public, anon, authenticated/,
    );
  });

  it("applique la rétention annoncée dans la mention", () => {
    expect(CODE).toContain("interval '30 days'");
    expect(CODE).toContain("interval '3 years'");
  });

  it("n’emploie aucun tiret long", () => {
    expect(SQL).not.toMatch(/[–—]/);
  });
});

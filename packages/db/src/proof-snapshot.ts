// =====================================================================
// C2-T7, le pack de preuve date.
// Lancement : pnpm --filter @adama/db proof:snapshot
//
// Produit deux fichiers dates dans snapshots/, ignore par git :
//   proof-<date>.json   le registre fige, lisible par une machine ;
//   proof-<date>.html   une page imprimable, autonome, a joindre a une
//                       candidature.
//
// Pourquoi un pack fige. Une adresse de verification vit et change : c'est sa
// qualite. Une candidature, elle, est envoyee un jour donne et lue des
// semaines plus tard. Le pack dit ce qui etait vrai le jour de l'envoi, sans
// dependre du site, sans reseau, sans police distante. Il survit a
// l'evolution du site, et il ne pretend pas decrire le present : sa date est
// en tete de page.
//
// Le pack ne contient QUE des affirmations publiques et techniques, celles
// que le site sert deja. Il n'ouvre aucun acces supplementaire.
//
// Regle de tenue : les chaines rendues dans le HTML portent leurs accents,
// c'est un document lu par un humain. Les commentaires n'en portent pas,
// comme le reste du depot.
// =====================================================================

import { config } from "dotenv";

config({ path: ".env" });

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { asc, inArray } from "drizzle-orm";
import { proofClaims, proofEvidence } from "./schema";

const ETAT_LIBELLE: Record<string, string> = {
  real: "SOURCE",
  historical: "VALEUR AU",
  demo: "DÉMONSTRATION",
  absent: "SOURCE INDISPONIBLE",
  stale: "PÉRIMÉE",
};

const SUJET_LIBELLE: Record<string, string> = {
  produit: "Produit",
  projet: "Projet",
  competence: "Compétence",
  experience: "Expérience",
  systeme: "Système",
  metrique: "Métrique",
};

const KIND_LIBELLE: Record<string, string> = {
  api: "Appel d'API",
  depot: "Dépôt de code",
  commit: "Commit",
  deploiement: "Déploiement",
  base: "Lecture en base",
  document: "Document",
  attestation: "Attestation",
  capture: "Capture",
};

/** Meme regle de derivation que apps/web/lib/proof/types.ts. Recopiee ici
 *  volontairement : le pack doit rester lisible sans l'application web. */
function etat(
  dataClass: string,
  observedAt: Date | null,
  maxAgeSeconds: number | null,
  maintenant: Date,
): string {
  if (!observedAt) return "absent";
  if (dataClass === "demo") return "demo";
  if (dataClass === "historical") return "historical";
  if (maxAgeSeconds && maxAgeSeconds > 0) {
    const age = (maintenant.getTime() - observedAt.getTime()) / 1000;
    if (age > maxAgeSeconds) return "stale";
  }
  return "real";
}

function echapper(texte: string): string {
  return texte
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function dateFr(d: Date | null): string {
  if (!d) return "jamais observée";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

async function snapshot() {
  const maintenant = new Date();
  const jour = maintenant.toISOString().slice(0, 10);
  console.log(`→ Pack de preuve du ${jour} : demarrage`);

  const { db } = await import("./client");

  const claims = await db
    .select()
    .from(proofClaims)
    .orderBy(asc(proofClaims.position), asc(proofClaims.id));

  const publiques = claims.filter(
    (c) => c.visibility === "public" || c.visibility === "technique",
  );
  if (publiques.length === 0) {
    console.log("  • Aucune affirmation publique : pack non produit.");
    return;
  }

  const preuves = await db
    .select()
    .from(proofEvidence)
    .where(
      inArray(
        proofEvidence.claimId,
        publiques.map((c) => c.id),
      ),
    )
    .orderBy(asc(proofEvidence.position), asc(proofEvidence.id));

  const parClaim = new Map<string, typeof preuves>();
  for (const p of preuves) {
    const liste = parClaim.get(p.claimId) ?? [];
    liste.push(p);
    parClaim.set(p.claimId, liste);
  }

  // Regle dure de la couche, tenue jusque dans le pack : une affirmation
  // sans preuve n'y figure pas.
  const retenues = publiques.filter(
    (c) => (parClaim.get(c.id) ?? []).length > 0,
  );

  const document = {
    schema_version: "1.0",
    frozen_at: maintenant.toISOString(),
    notice:
      "Pack de preuve figé. Il décrit ce qui était vérifiable à la date ci-dessus, pas l'état présent du site.",
    claims: retenues.map((c) => {
      const liste = parClaim.get(c.id) ?? [];
      const derniere = liste
        .filter((e) => e.observedAt)
        .sort(
          (a, b) =>
            (a.observedAt?.getTime() ?? 0) - (b.observedAt?.getTime() ?? 0),
        )
        .at(-1);
      return {
        id: c.id,
        statement: c.statement,
        subject_type: c.subjectType,
        subject_ref: c.subjectRef,
        data_class: c.dataClass,
        state: etat(
          c.dataClass,
          derniere?.observedAt ?? null,
          c.maxAgeSeconds,
          maintenant,
        ),
        evidence: liste.map((e) => ({
          kind: e.kind,
          source: e.source,
          locator: e.locator,
          method: e.method,
          observed_at: e.observedAt?.toISOString() ?? null,
          observed_result: e.observedResult,
          verifiable_by: e.verifiableBy,
        })),
      };
    }),
  };

  const dossier = join(process.cwd(), "snapshots");
  mkdirSync(dossier, { recursive: true });

  const cheminJson = join(dossier, `proof-${jour}.json`);
  writeFileSync(cheminJson, JSON.stringify(document, null, 2) + "\n", "utf8");

  const corps = document.claims
    .map(
      (c) => `<article>
  <p class="sujet">${echapper(SUJET_LIBELLE[c.subject_type] ?? c.subject_type)}${c.subject_ref ? ` &middot; ${echapper(c.subject_ref)}` : ""}</p>
  <h2>${echapper(c.statement)}</h2>
  <p class="etat etat-${c.state}">${ETAT_LIBELLE[c.state] ?? c.state}</p>
  <table>
    <thead><tr><th>Nature</th><th>Source</th><th>Méthode</th><th>Observé le</th><th>Constat</th></tr></thead>
    <tbody>
      ${c.evidence
        .map(
          (e) => `<tr>
        <td>${echapper(KIND_LIBELLE[e.kind] ?? e.kind)}</td>
        <td>${echapper(e.source)}${e.locator ? `<br><span class="loc">${echapper(e.locator)}</span>` : ""}</td>
        <td>${echapper(e.method)}</td>
        <td>${e.observed_at ? dateFr(new Date(e.observed_at)) : "jamais observée"}</td>
        <td>${e.observed_result ? echapper(e.observed_result) : "non observée"}</td>
      </tr>`,
        )
        .join("\n")}
    </tbody>
  </table>
</article>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Pack de preuve, ${jour}</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; padding: 36px; background: #f2ede4; color: #0d1b2a;
         font: 14px/1.7 -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }
  header { border-bottom: 2px solid #806332; padding-bottom: 18px; margin-bottom: 32px; }
  h1 { font-size: 30px; font-weight: 500; letter-spacing: -0.03em; margin: 0 0 8px; }
  .avis { color: #536878; font-size: 13px; max-width: 62ch; }
  article { border-top: 1px solid #d4d6d5; padding: 24px 0; break-inside: avoid; }
  article h2 { font-size: 19px; font-weight: 500; letter-spacing: -0.02em; margin: 6px 0 12px; }
  .sujet { font: 10px ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.12em;
           text-transform: uppercase; color: #536878; margin: 0; }
  .etat { display: inline-block; font: 10px ui-monospace, Menlo, Consolas, monospace;
          letter-spacing: 0.12em; padding: 3px 9px; border: 1px solid #d4d6d5;
          border-left: 3px solid #806332; margin: 0 0 14px; }
  .etat-demo { background: #0d1b2a; color: #f2ede4; border-color: #0d1b2a; border-left-color: #c9a96e; }
  .etat-absent, .etat-stale { border-left-color: #536878; color: #536878; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; font: 10px ui-monospace, Menlo, Consolas, monospace;
       letter-spacing: 0.1em; text-transform: uppercase; color: #536878;
       border-bottom: 1px solid #d4d6d5; padding: 6px 10px 6px 0; }
  td { vertical-align: top; padding: 9px 10px 9px 0; border-bottom: 1px solid #e4e2da; }
  .loc { font: 11px ui-monospace, Menlo, Consolas, monospace; color: #806332; word-break: break-all; }
  footer { margin-top: 36px; border-top: 1px solid #d4d6d5; padding-top: 16px;
           font-size: 12px; color: #536878; }
  @media print {
    body { background: #fff; padding: 0; }
    article { break-inside: avoid; }
  }
</style>
</head>
<body>
<header>
  <h1>Pack de preuve, Adama Diallo</h1>
  <p class="avis">
    Figé le ${dateFr(maintenant)}. Ce document décrit ce qui était vérifiable à
    cette date. Il ne décrit pas l'état présent du site, et il n'a pas besoin du
    site pour être lu. ${document.claims.length} affirmation(s), chacune avec ses
    preuves, leur méthode d'obtention et la date de leur dernière observation.
  </p>
</header>
${corps}
<footer>
  Une affirmation sans preuve ne figure pas dans ce pack. Une preuve jamais
  observée est écrite comme telle, elle n'est pas remplacée par une date de
  complaisance.
</footer>
</body>
</html>
`;

  const cheminHtml = join(dossier, `proof-${jour}.html`);
  writeFileSync(cheminHtml, html, "utf8");

  console.log(`  ✓ ${cheminJson}`);
  console.log(`  ✓ ${cheminHtml}`);
  console.log(`  ${document.claims.length} affirmation(s) figee(s).`);
  console.log("→ Pack termine.");
}

snapshot()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Echec du pack de preuve :", err);
    process.exit(1);
  });

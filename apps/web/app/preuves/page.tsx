import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { TrackedAnchor } from "../../components/analytics-tracker";
import { EVENT_PROOF_PACK } from "../../lib/analytics-events";
import {
  ProofIndex,
  type IndexEntry,
} from "../../components/proof/proof-index";
import { SUBJECT_LABEL, listClaims } from "../../lib/proof/claims";
import {
  CLAIM_STATE_DESCRIPTION,
  CLAIM_STATE_LABEL,
} from "../../lib/proof/types";

// =====================================================================
// C2-T8, l'index des preuves.
//
// Toutes les affirmations publiques du site, avec leur état de fraîcheur.
// Aucune affirmation sans preuve ne figure ici, parce qu'aucune n'existe :
// lib/proof/claims.ts les écarte à la lecture.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Toutes les preuves",
  description:
    "Chaque affirmation publiée sur ce site porte sa provenance et possède une page de vérification. Voici la liste complète, avec son état de fraîcheur.",
  alternates: { canonical: "/preuves" },
};

const LEGENDE: { etat: keyof typeof CLAIM_STATE_LABEL }[] = [
  { etat: "real" },
  { etat: "historical" },
  { etat: "stale" },
  { etat: "absent" },
  { etat: "demo" },
];

export default async function PreuvesPage() {
  const maintenant = new Date();
  const claims = await listClaims({ now: maintenant });

  const entries: IndexEntry[] = claims.map((c) => ({
    id: c.row.id,
    statement: c.row.statement,
    subject: SUBJECT_LABEL[c.row.subject_type],
    subjectRef: c.row.subject_ref,
    state: c.state,
    evidenceCount: c.evidence.length,
    claim: c.claim,
  }));

  const aReprendre = entries.filter(
    (e) => e.state === "absent" || e.state === "stale",
  ).length;

  return (
    <PageShell>
      <PageIntro
        eyebrow="PREUVES / INDEX COMPLET"
        title={
          <>
            Ne me croyez pas,
            <br />
            <span className="serif">vérifiez.</span>
          </>
        }
        description="Chaque affirmation importante de ce site est un enregistrement qui porte sa source, sa méthode d’obtention et sa date d’observation. Une affirmation sans preuve n’apparaît nulle part : elle n’est pas grisée, elle est absente."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ÉTAT DU REGISTRE</span>
            <strong>{entries.length}</strong>
            <p>
              affirmation{entries.length > 1 ? "s" : ""} publiée
              {entries.length > 1 ? "s" : ""}, dont {aReprendre} à reprendre.
            </p>
            <Link href="/metrics">Voir les métriques ↗</Link>
          </div>
        }
      />

      {entries.length === 0 ? (
        <section className="metrics-empty">
          <p className="portfolio-label">LE REGISTRE</p>
          <h2>
            Aucune affirmation <span className="serif">publiée.</span>
          </h2>
          <p>
            Le registre est vide ou injoignable. Rien n’est affiché plutôt
            qu’une liste écrite en dur : c’est la même règle que partout
            ailleurs sur ce site.
          </p>
          <Link className="portfolio-text-link" href="/ecosysteme">
            Consulter les projets <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <ProofIndex entries={entries} />
      )}

      <section className="proof-legend" aria-label="Lecture des marqueurs">
        <p className="portfolio-label">COMMENT LIRE LES MARQUEURS</p>
        {LEGENDE.map(({ etat }) => (
          <div key={etat}>
            <span>
              <strong>{CLAIM_STATE_LABEL[etat]}</strong>
            </span>
            <span>{CLAIM_STATE_DESCRIPTION[etat]}</span>
          </div>
        ))}
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">POUR LES MACHINES</p>
          <h2>
            Le même registre,{" "}
            <span className="serif">lisible par un programme.</span>
          </h2>
          <p>
            Le document <code>/.well-known/adama-os.json</code> sert les mêmes
            affirmations et les mêmes preuves, dans un format stable. Le fichier{" "}
            <code>/llms.txt</code> décrit le site en texte simple. La{" "}
            <Link href="/technique">vue technique</Link> ouvre l’inventaire
            généré du dépôt et les contrats des interfaces publiques.
          </p>
        </div>
        <TrackedAnchor
          href="/.well-known/adama-os.json"
          event={EVENT_PROOF_PACK}
          properties={{ source: "preuves" }}
          className="portfolio-button primary"
        >
          Ouvrir le document machine <span aria-hidden="true">↗</span>
        </TrackedAnchor>
      </section>
    </PageShell>
  );
}

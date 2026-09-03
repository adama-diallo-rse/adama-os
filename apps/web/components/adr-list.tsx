"use client";

// =====================================================================
// C6-T3, la liste des decisions.
//
// Une ligne par decision, dense, lisible sans ouvrir. Doivent tenir sur la
// ligne : l'identifiant, le titre sous la forme A plutot que B, la date, le
// statut, l'impact et la reversibilite.
//
// Contrainte d'accessibilite tenue ici : le statut et la reversibilite ne se
// distinguent JAMAIS par la couleur seule. Chacun porte un glyphe et un mot.
// Un lecteur daltonien lit la meme information qu'un autre.
//
// Le tri par defaut est chronologique inverse, parce qu'une decision recente
// gouverne une decision ancienne. Le tri par impact sert a repondre a une
// autre question : sur quels axes cette personne a-t-elle tranche.
// =====================================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDate } from "./proof/data-class";
import {
  IMPACT_LABEL,
  PORTEE_LABEL,
  REVERSIBILITE_COURT,
  STATUT_LABEL,
  type Adr,
  type AdrImpact,
  type AdrPortee,
  type AdrStatut,
} from "../lib/adr";

const GLYPHE_STATUT: Record<AdrStatut, string> = {
  propose: "○",
  accepte: "●",
  remplace: "◐",
  abandonne: "×",
};

const GLYPHE_REVERSIBILITE = {
  forte: "↩",
  moyenne: "↩↩",
  faible: "↯",
} as const;

type Tri = "date" | "impact" | "statut";

const TRIS: { id: Tri; label: string }[] = [
  { id: "date", label: "Date" },
  { id: "impact", label: "Impact" },
  { id: "statut", label: "Statut" },
];

function uniques<T extends string>(valeurs: T[]): T[] {
  return Array.from(new Set(valeurs)).sort();
}

export function AdrList({ decisions }: { decisions: Adr[] }) {
  const [portee, setPortee] = useState<AdrPortee | "toutes">("toutes");
  const [impact, setImpact] = useState<AdrImpact | "tous">("tous");
  const [statut, setStatut] = useState<AdrStatut | "tous">("tous");
  const [tri, setTri] = useState<Tri>("date");

  const portees = useMemo(
    () => uniques(decisions.map((d) => d.scope)),
    [decisions],
  );
  const impacts = useMemo(
    () => uniques(decisions.map((d) => d.impact)),
    [decisions],
  );
  const statuts = useMemo(
    () => uniques(decisions.map((d) => d.status)),
    [decisions],
  );

  const visibles = useMemo(() => {
    const liste = decisions.filter(
      (d) =>
        (portee === "toutes" || d.scope === portee) &&
        (impact === "tous" || d.impact === impact) &&
        (statut === "tous" || d.status === statut),
    );
    return liste.sort((a, b) => {
      if (tri === "impact") {
        return a.impact.localeCompare(b.impact) || b.date.localeCompare(a.date);
      }
      if (tri === "statut") {
        return a.status.localeCompare(b.status) || b.date.localeCompare(a.date);
      }
      return b.date.localeCompare(a.date) || a.adr_id.localeCompare(b.adr_id);
    });
  }, [decisions, portee, impact, statut, tri]);

  return (
    <>
      <div className="adr-filters">
        <div className="adr-filter-group">
          <span className="portfolio-label">PORTÉE</span>
          <button
            type="button"
            aria-pressed={portee === "toutes"}
            onClick={() => setPortee("toutes")}
          >
            Toutes
          </button>
          {portees.map((p) => (
            <button
              type="button"
              key={p}
              aria-pressed={portee === p}
              onClick={() => setPortee(p)}
            >
              {PORTEE_LABEL[p]}
            </button>
          ))}
        </div>
        <div className="adr-filter-group">
          <span className="portfolio-label">IMPACT</span>
          <button
            type="button"
            aria-pressed={impact === "tous"}
            onClick={() => setImpact("tous")}
          >
            Tous
          </button>
          {impacts.map((i) => (
            <button
              type="button"
              key={i}
              aria-pressed={impact === i}
              onClick={() => setImpact(i)}
            >
              {IMPACT_LABEL[i]}
            </button>
          ))}
        </div>
        <div className="adr-filter-group">
          <span className="portfolio-label">STATUT</span>
          <button
            type="button"
            aria-pressed={statut === "tous"}
            onClick={() => setStatut("tous")}
          >
            Tous
          </button>
          {statuts.map((st) => (
            <button
              type="button"
              key={st}
              aria-pressed={statut === st}
              onClick={() => setStatut(st)}
            >
              {STATUT_LABEL[st]}
            </button>
          ))}
        </div>
        <div className="adr-filter-group adr-filter-tri">
          <span className="portfolio-label">TRI</span>
          {TRIS.map((t) => (
            <button
              type="button"
              key={t.id}
              aria-pressed={tri === t.id}
              onClick={() => setTri(t.id)}
            >
              {t.label}
            </button>
          ))}
          <span className="filter-caption" aria-live="polite">
            {visibles.length} décision{visibles.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <ol className="adr-list">
        {visibles.map((d) => (
          <li key={d.adr_id} data-statut={d.status}>
            <Link href={`/decisions/${d.adr_id}`}>
              <span className="adr-id">{d.adr_id}</span>
              <span className="adr-titre">{d.title}</span>
              <span className="adr-date">
                <time dateTime={d.date}>{formatDate(d.date)}</time>
              </span>
              <span className="adr-statut">
                <span aria-hidden="true">{GLYPHE_STATUT[d.status]}</span>
                {STATUT_LABEL[d.status]}
              </span>
              <span className="adr-impact">{IMPACT_LABEL[d.impact]}</span>
              <span className="adr-reversibilite">
                <span aria-hidden="true">
                  {GLYPHE_REVERSIBILITE[d.reversibility]}
                </span>
                {REVERSIBILITE_COURT[d.reversibility]}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {visibles.length === 0 ? (
        <p className="adr-vide">
          Aucune décision ne correspond à ce filtre. Rien n’est affiché à la
          place.
        </p>
      ) : null}
    </>
  );
}

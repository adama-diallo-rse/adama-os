"use client";

// =====================================================================
// C2-T8, l'index des preuves.
//
// Sert deux lecteurs à la fois. Un visiteur qui veut vérifier une
// affirmation précise, et Adama qui veut voir d'un coup d'œil ce qui est en
// train de périmer. C'est le même tableau : un tableau de bord interne qui a
// besoin d'être caché n'est pas un tableau de bord, c'est un aveu.
//
// Le tri par fraîcheur remonte d'abord ce qui va mal : jamais observé, puis
// périmé, puis le plus ancien. L'ordre par défaut d'une page de preuves ne
// doit pas flatter.
// =====================================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataClassMark } from "./data-class";
import type { Claim, ClaimState } from "../../lib/proof/types";

export type IndexEntry = {
  id: string;
  statement: string;
  subject: string;
  subjectRef: string | null;
  state: ClaimState;
  evidenceCount: number;
  claim: Claim<string>;
};

type Tri = "fraicheur" | "sujet" | "classe";

const RANG_ETAT: Record<ClaimState, number> = {
  absent: 0,
  stale: 1,
  demo: 2,
  historical: 3,
  real: 4,
};

const FILTRES: {
  id: string;
  label: string;
  test: (e: IndexEntry) => boolean;
}[] = [
  { id: "tout", label: "Tout", test: () => true },
  {
    id: "verifiees",
    label: "Vérifiées",
    test: (e) => e.state === "real" || e.state === "historical",
  },
  {
    id: "attention",
    label: "À reprendre",
    test: (e) => e.state === "absent" || e.state === "stale",
  },
  { id: "demo", label: "Démonstration", test: (e) => e.state === "demo" },
];

const TRIS: { id: Tri; label: string }[] = [
  { id: "fraicheur", label: "Fraîcheur" },
  { id: "sujet", label: "Sujet" },
  { id: "classe", label: "Classe" },
];

export function ProofIndex({ entries }: { entries: IndexEntry[] }) {
  const [filtre, setFiltre] = useState("tout");
  const [tri, setTri] = useState<Tri>("fraicheur");

  const visibles = useMemo(() => {
    const test = FILTRES.find((f) => f.id === filtre)?.test ?? (() => true);
    const liste = entries.filter(test);
    const parDate = (e: IndexEntry) =>
      e.claim.fetchedAt ? Date.parse(e.claim.fetchedAt) : 0;
    return [...liste].sort((a, b) => {
      if (tri === "sujet") {
        return (
          a.subject.localeCompare(b.subject) ||
          a.statement.localeCompare(b.statement)
        );
      }
      if (tri === "classe") {
        return (
          a.claim.dataClass.localeCompare(b.claim.dataClass) ||
          a.statement.localeCompare(b.statement)
        );
      }
      return RANG_ETAT[a.state] - RANG_ETAT[b.state] || parDate(a) - parDate(b);
    });
  }, [entries, filtre, tri]);

  return (
    <>
      <div className="catalog-filters">
        <div role="group" aria-label="Filtrer les affirmations">
          {FILTRES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtre === f.id}
              onClick={() => setFiltre(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Trier les affirmations">
          {TRIS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tri === t.id}
              onClick={() => setTri(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span>
          {visibles.length} affirmation{visibles.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="proof-index">
        {visibles.length === 0 ? (
          <p className="proof-index-empty">
            Aucune affirmation dans cette sélection.
          </p>
        ) : (
          visibles.map((e) => (
            <div className="proof-index-row" key={e.id}>
              <Link
                className="proof-index-statement"
                href={`/verifier/${e.id}`}
              >
                {e.statement}
              </Link>
              <span className="proof-index-subject">
                {e.subject}
                {e.subjectRef ? ` · ${e.subjectRef}` : ""}
                {" · "}
                {e.evidenceCount} preuve{e.evidenceCount > 1 ? "s" : ""}
              </span>
              <DataClassMark claim={e.claim} state={e.state} />
            </div>
          ))
        )}
      </div>
    </>
  );
}

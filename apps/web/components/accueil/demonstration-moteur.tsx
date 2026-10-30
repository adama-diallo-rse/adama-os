"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CitationPreuve } from "../../lib/accueil";
import { CLAIM_STATE_LABEL } from "../../lib/proof/types";

// =====================================================================
// La démonstration du moteur (refonte du 30 octobre 2026).
//
// Une pièce justificative entre, le moteur la classe, la rattache à ce
// qu'elle établit, la scelle, et elle devient vérifiable à une adresse
// publique. Chaque valeur affichée est celle d'une affirmation réellement
// servie par le registre de preuve à ce rendu ; l'empreinte est calculée
// sur le serveur. Sans registre joignable, la démonstration montre la
// structure, champs vides, et le dit.
//
// La tâche se déroule une fois, quand le bloc entre à l'écran. Elle ne
// tourne jamais en boucle ; « Rejouer » la relance. Sous réduction de
// mouvement, l'état final est affiché d'emblée.
// =====================================================================

/** Durée d'un geste du moteur dans la démonstration, en millisecondes. */
const PAS_MS = 1100;

const ETAPES = [
  { code: "piece", titre: "La pièce entre", statut: "réception" },
  { code: "classe", titre: "Le moteur la classe", statut: "classement" },
  { code: "rattache", titre: "Il la rattache", statut: "rattachement" },
  { code: "scelle", titre: "Il la scelle", statut: "scellement" },
  {
    code: "verifiable",
    titre: "Elle devient vérifiable",
    statut: "vérifiable",
  },
] as const;

type Ligne = { etape: number; texte: string };

function journal(c: CitationPreuve | null): Ligne[] {
  if (!c) {
    return [
      { etape: 0, texte: "registre de preuve injoignable à ce rendu" },
      { etape: 1, texte: "aucune pièce à classer, aucune valeur inventée" },
      { etape: 2, texte: "structure seule : énoncé, sujet, source" },
      { etape: 3, texte: "empreinte calculée à la première pièce servie" },
      { etape: 4, texte: "adresse publique : /verifier/{identifiant}" },
    ];
  }
  return [
    { etape: 0, texte: `pièce reçue : ${c.source}` },
    {
      etape: 0,
      texte: `lue le ${c.luLe ? c.luLe.slice(0, 10) : "date absente"}`,
    },
    { etape: 1, texte: `classe de donnée : ${CLAIM_STATE_LABEL[c.etat]}` },
    { etape: 1, texte: `sujet : ${c.sujet}` },
    { etape: 2, texte: `rattachée à l’affirmation ${c.id}` },
    { etape: 3, texte: `empreinte SHA-256 : ${c.empreinte.slice(0, 16)}…` },
    { etape: 4, texte: `vérifiable : /verifier/${c.id}` },
  ];
}

function champs(c: CitationPreuve | null, etape: number) {
  const v = (min: number, valeur: string | null) =>
    etape >= min ? valeur : undefined;
  return {
    source: v(0, c?.source ?? null),
    lue_le: v(0, c?.luLe ?? null),
    classe: v(1, c ? CLAIM_STATE_LABEL[c.etat] : null),
    sujet: v(1, c?.sujet ?? null),
    affirmation: v(2, c?.id ?? null),
    empreinte: v(3, c?.empreinte ?? null),
    adresse: v(4, c ? `/verifier/${c.id}` : null),
  };
}

export function DemonstrationMoteur({
  citation,
}: {
  citation: CitationPreuve | null;
}) {
  const racine = useRef<HTMLDivElement>(null);
  const [etape, setEtape] = useState(-1);
  const [enCours, setEnCours] = useState(false);
  const minuterie = useRef<number[]>([]);
  const idBase = useId();
  const lignes = journal(citation);

  const arreter = () => {
    minuterie.current.forEach((t) => window.clearTimeout(t));
    minuterie.current = [];
  };

  const jouer = useCallback(() => {
    arreter();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEtape(ETAPES.length - 1);
      return;
    }
    setEnCours(true);
    setEtape(0);
    ETAPES.forEach((_, i) => {
      if (i === 0) return;
      minuterie.current.push(window.setTimeout(() => setEtape(i), i * PAS_MS));
    });
    minuterie.current.push(
      window.setTimeout(() => setEnCours(false), ETAPES.length * PAS_MS),
    );
  }, []);

  useEffect(() => {
    const el = racine.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          jouer();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      arreter();
    };
  }, [jouer]);

  const choisir = (i: number) => {
    arreter();
    setEnCours(false);
    setEtape(i);
  };

  const courante = Math.max(etape, 0);
  const affiche = etape === -1 ? ETAPES.length - 1 : courante;
  const json = champs(citation, affiche);

  return (
    <div className="moteur" ref={racine} data-etape={affiche}>
      <div
        className="moteur-onglets"
        role="tablist"
        aria-label="Les cinq gestes du moteur"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const pas = e.key === "ArrowRight" ? 1 : -1;
          const suivant = (affiche + pas + ETAPES.length) % ETAPES.length;
          choisir(suivant);
          document.getElementById(`${idBase}-onglet-${suivant}`)?.focus();
        }}
      >
        {ETAPES.map((e, i) => (
          <button
            key={e.code}
            id={`${idBase}-onglet-${i}`}
            type="button"
            role="tab"
            aria-selected={affiche === i}
            aria-controls={`${idBase}-panneau`}
            tabIndex={affiche === i ? 0 : -1}
            data-fait={i < affiche ? "oui" : "non"}
            onClick={() => choisir(i)}
          >
            <span className="moteur-onglet-numero">
              {String(i + 1).padStart(2, "0")}
            </span>
            {e.titre}
          </button>
        ))}
      </div>
      <div
        className="moteur-panneau"
        id={`${idBase}-panneau`}
        role="tabpanel"
        aria-labelledby={`${idBase}-onglet-${affiche}`}
      >
        <div className="moteur-journal">
          <p className="moteur-statut" aria-live="polite">
            <span
              className="moteur-statut-point"
              data-final={
                citation && affiche === ETAPES.length - 1 ? "oui" : "non"
              }
              aria-hidden="true"
            />
            {citation ? ETAPES[affiche]?.statut : "en attente du registre"}
            {citation && affiche === ETAPES.length - 1 ? (
              <span className="moteur-coche" aria-hidden="true">
                ✓
              </span>
            ) : null}
          </p>
          <ol>
            {lignes.map((l, i) =>
              l.etape <= affiche ? (
                <li key={i} data-etape={l.etape}>
                  <span aria-hidden="true">›</span> {l.texte}
                </li>
              ) : null,
            )}
          </ol>
        </div>
        <pre
          className="moteur-json"
          aria-label="Fiche de la pièce, au format JSON"
        >
          {"{\n"}
          {Object.entries(json).map(([cle, valeur]) => (
            <span key={cle} data-rempli={valeur !== undefined ? "oui" : "non"}>
              {`  "${cle}": `}
              <span className="moteur-json-valeur">
                {valeur === undefined
                  ? "…"
                  : valeur === null
                    ? "null"
                    : JSON.stringify(valeur)}
              </span>
              {",\n"}
            </span>
          ))}
          {"}"}
        </pre>
      </div>
      <div className="moteur-pied">
        {citation ? (
          <Link href={`/verifier/${citation.id}`} className="moteur-lien">
            Vérifier cette affirmation vous-même{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link href="/preuves" className="moteur-lien">
            Voir le registre de preuve <span aria-hidden="true">→</span>
          </Link>
        )}
        <button
          type="button"
          className="moteur-rejouer"
          onClick={jouer}
          disabled={enCours}
        >
          Rejouer
        </button>
      </div>
    </div>
  );
}

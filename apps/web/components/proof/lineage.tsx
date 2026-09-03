// =====================================================================
// C2-T4, le lignage.
//
// La chaîne qui va de la source à l'affirmation, dessinée. Chaque nœud porte
// son état. AUCUN NŒUD FICTIF : si une étape n'existe pas dans les preuves
// enregistrées, elle n'est pas dessinée. Un schéma qui complète la chaîne
// pour faire joli raconte une vérification qui n'a pas eu lieu.
//
// SVG en ligne, sans bibliothèque. Deux tracés du même contenu : horizontal
// au delà de 720 pixels, vertical en dessous, permutés par CSS. Le schéma ne
// défile jamais latéralement dans la page : un schéma qui sort de l'écran
// n'est pas un schéma, c'est un piège.
//
// Les deux SVG sont masqués aux lecteurs d'écran. L'équivalent textuel sous
// le dessin est la vraie source d'information : il est lu, imprimé, et il
// survit à une image qui ne se charge pas.
// =====================================================================

import {
  EVIDENCE_KIND_LABEL,
  type EvidenceRow,
  type ProofClaim,
} from "../../lib/proof/claims";
import { resolveClaimState, type ClaimState } from "../../lib/proof/types";
import { formatDate } from "./data-class";

type Node = {
  label: string;
  detail: string;
  /** ok : observé et frais. failed : jamais observé. stale : trop ancien. */
  etat: "ok" | "failed" | "stale";
};

// Largeur d'une boite en unites de viewBox. Le texte est en 10 unites, une
// lettre monospace en occupe environ 6 : 158 moins 20 de marges laisse donc
// une vingtaine de caracteres par ligne. PAR_LIGNE_H en tient compte.
const LARGEUR_H = 158;
const HAUTEUR_H = 58;
const ECART_H = 30;
const LARGEUR_V = 280;
const HAUTEUR_V = 56;
const ECART_V = 34;
const PAR_LIGNE_H = 21;
const PAR_LIGNE_V = 40;

/**
 * Découpe un libellé en deux lignes au plus, sans couper un mot, et marque
 * la coupe par des points de suspension quand il reste du texte.
 *
 * Un SVG ne sait pas replier son texte tout seul : sans cette découpe, un
 * libellé long sort de sa boîte et se superpose au maillon suivant. La
 * version complète reste lisible dans l'équivalent textuel sous le dessin,
 * qui est la vraie source d'information.
 */
function lignes(texte: string, parLigne: number): string[] {
  const mots = texte.split(" ");
  const out: string[] = [];
  let courante = "";
  let reste = false;

  for (let i = 0; i < mots.length; i += 1) {
    const mot = mots[i] as string;
    const essai = (courante + " " + mot).trim();
    if (essai.length > parLigne && courante) {
      out.push(courante);
      courante = mot;
      if (out.length === 2) {
        reste = true;
        break;
      }
    } else {
      courante = essai;
    }
  }
  if (out.length < 2 && courante) {
    out.push(courante);
  }

  if (reste || out.join(" ").length < texte.length) {
    const derniere = out[out.length - 1] ?? "";
    out[out.length - 1] = `${derniere}…`;
  }

  // Coupe dure. Un localisateur comme "adama-diallo-rse/strata-scope" est un
  // seul mot de vingt-neuf caracteres : sans cette coupe il sortirait de sa
  // boite quelle que soit la largeur choisie.
  return out
    .slice(0, 2)
    .map((ligne) =>
      ligne.length > parLigne ? `${ligne.slice(0, parLigne - 1)}…` : ligne,
    );
}

function etatDePreuve(
  evidence: EvidenceRow,
  maxAgeSeconds: number | null,
  now: Date,
): Node["etat"] {
  if (!evidence.observed_at) {
    return "failed";
  }
  const state: ClaimState = resolveClaimState(
    {
      value: evidence.observed_result,
      dataClass: "real",
      source: evidence.source,
      method: evidence.method,
      fetchedAt: evidence.observed_at,
      maxAgeSeconds,
    },
    now,
  );
  return state === "stale" ? "stale" : "ok";
}

/** Construit la chaîne à partir des preuves réellement enregistrées. */
export function buildNodes(proof: ProofClaim, now: Date = new Date()): Node[] {
  const nodes: Node[] = proof.evidence.map((e) => ({
    label: `${EVIDENCE_KIND_LABEL[e.kind]} · ${e.source}`,
    detail: e.observed_at ? formatDate(e.observed_at) : "jamais observée",
    etat: etatDePreuve(e, proof.row.max_age_seconds, now),
  }));
  nodes.push({
    label: proof.row.statement,
    detail:
      proof.state === "absent"
        ? "non vérifiée"
        : proof.state === "stale"
          ? "vérification périmée"
          : "vérifiée",
    etat:
      proof.state === "absent"
        ? "failed"
        : proof.state === "stale"
          ? "stale"
          : "ok",
  });
  return nodes;
}

function Boite({
  node,
  x,
  y,
  largeur,
  hauteur,
  parLigne,
}: {
  node: Node;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  parLigne: number;
}) {
  const texte = lignes(node.label, parLigne);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={largeur}
        height={hauteur}
        rx="2"
        className={`proof-node-box proof-node-box--${node.etat}`}
      />
      {texte.map((ligne, i) => (
        <text
          key={ligne + i}
          x={x + 10}
          y={y + 19 + i * 13}
          className="proof-node-label"
        >
          {ligne}
        </text>
      ))}
      <text x={x + 10} y={y + hauteur - 11} className="proof-node-state">
        {node.detail.toUpperCase()}
      </text>
    </g>
  );
}

function Fleche({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const horizontal = y1 === y2;
  const pointe = horizontal
    ? `${x2 - 6},${y2 - 4} ${x2},${y2} ${x2 - 6},${y2 + 4}`
    : `${x2 - 4},${y2 - 6} ${x2},${y2} ${x2 + 4},${y2 - 6}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className="proof-edge" />
      <polyline points={pointe} className="proof-edge" />
    </g>
  );
}

export function ProofLineage({
  proof,
  now,
}: {
  proof: ProofClaim;
  now?: Date;
}) {
  const nodes = buildNodes(proof, now);
  const n = nodes.length;

  const largeurH = n * LARGEUR_H + (n - 1) * ECART_H;
  const hauteurV = n * HAUTEUR_V + (n - 1) * ECART_V;

  return (
    <figure className="proof-lineage">
      <svg
        className="proof-lineage-horizontal"
        viewBox={`0 0 ${largeurH} ${HAUTEUR_H + 8}`}
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        {nodes.map((node, i) => (
          <Boite
            key={`h-${i}`}
            node={node}
            x={i * (LARGEUR_H + ECART_H)}
            y={4}
            largeur={LARGEUR_H}
            hauteur={HAUTEUR_H}
            parLigne={PAR_LIGNE_H}
          />
        ))}
        {nodes.slice(1).map((_, i) => (
          <Fleche
            key={`ah-${i}`}
            x1={i * (LARGEUR_H + ECART_H) + LARGEUR_H + 4}
            y1={4 + HAUTEUR_H / 2}
            x2={(i + 1) * (LARGEUR_H + ECART_H) - 4}
            y2={4 + HAUTEUR_H / 2}
          />
        ))}
      </svg>

      <svg
        className="proof-lineage-vertical"
        viewBox={`0 0 ${LARGEUR_V} ${hauteurV + 8}`}
        role="presentation"
        aria-hidden="true"
        focusable="false"
      >
        {nodes.map((node, i) => (
          <Boite
            key={`v-${i}`}
            node={node}
            x={0}
            y={4 + i * (HAUTEUR_V + ECART_V)}
            largeur={LARGEUR_V}
            hauteur={HAUTEUR_V}
            parLigne={PAR_LIGNE_V}
          />
        ))}
        {nodes.slice(1).map((_, i) => (
          <Fleche
            key={`av-${i}`}
            x1={LARGEUR_V / 2}
            y1={4 + i * (HAUTEUR_V + ECART_V) + HAUTEUR_V + 4}
            x2={LARGEUR_V / 2}
            y2={4 + (i + 1) * (HAUTEUR_V + ECART_V) - 4}
          />
        ))}
      </svg>

      <figcaption className="proof-lineage-caption">
        <span className="portfolio-label">CHAÎNE DE VÉRIFICATION</span>
        <ol>
          {nodes.map((node, i) => (
            <li key={`c-${i}`}>
              {i + 1}. {node.label}, {node.detail}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

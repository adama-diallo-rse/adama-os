// =====================================================================
// C8-T2 et C8-T5, du commit brut a la ligne lisible.
//
// Module PUR : il recoit des commits, il rend des lignes. Aucun appel
// reseau, aucune base, aucun modele. C'est la condition pour que la regle
// centrale de la couche soit verifiable : une ligne lisible est DERIVEE de
// commits reels, jamais generee.
//
// Deux derivations, et deux seulement.
//   1. Resume relu. Le commit tombe dans la fenetre d'un chantier de
//      content/chantiers.ts : la ligne porte le titre ecrit par Adama, et la
//      liste des commits qui la fondent.
//   2. Regle deterministe. Le commit ne tombe dans aucun chantier : son
//      prefixe conventionnel donne son libelle, par une table de traduction.
//      Aucun modele n'intervient, et le commit reste visible.
//
// Ce qui n'existe pas ici, et n'existera pas : une fonction qui appellerait
// un modele pour resumer un commit. Le journal serait alors une invention
// exactement la ou le site promet une preuve.
// =====================================================================

import { CHANTIERS, type Chantier } from "../content/chantiers";
import type { CommitRow } from "../components/types";

/** Traduction du type conventionnel. Table fermee, aucune interpretation. */
const TYPE_LABEL: Record<string, string> = {
  feat: "ajout",
  fix: "correction",
  refactor: "remaniement",
  perf: "performance",
  docs: "documentation",
  test: "tests",
  style: "mise en forme",
  build: "construction",
  ci: "automatisation",
  chore: "entretien",
  revert: "retour en arrière",
};

/** Traduction du perimetre conventionnel. Un perimetre inconnu passe brut. */
const SCOPE_LABEL: Record<string, string> = {
  web: "interface web",
  ui: "composants partagés",
  db: "base de données",
  api: "interfaces publiques",
  ai: "moteur documentaire",
  proof: "registre de preuve",
  health: "santé du système",
  repo: "dépôt",
  docs: "documentation",
  config: "configuration",
  scripts: "outillage",
  seo: "référencement",
  a11y: "accessibilité",
  legal: "mentions légales",
};

const CONVENTION =
  /^(feat|fix|chore|docs|refactor|perf|test|style|ci|build|revert)(\(([^)]*)\))?!?:\s*(.*)$/;

/**
 * Libelle deterministe d'un commit. Retourne null quand le message ne suit
 * pas la convention : dans ce cas la ligne garde le message tel quel, ce qui
 * reste une derivation honnete puisque rien n'a ete reecrit.
 */
export function libelleDeterministe(message: string): string | null {
  const m = CONVENTION.exec(message);
  if (!m) {
    return null;
  }
  const type = TYPE_LABEL[m[1] ?? ""] ?? m[1] ?? "";
  const scope = m[3]?.trim();
  const portee = scope ? (SCOPE_LABEL[scope] ?? scope) : null;
  return portee ? `${type}, ${portee}` : type;
}

/** Jour ISO d'un horodatage. */
function jour(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Chantier d'un commit, ou null.
 *
 * Premier chantier dont la fenetre contient la date du commit ET dont la
 * liste de depots contient le sien. Les fenetres de content/chantiers.ts ne
 * se recouvrent pas, ce qui garantit qu'un commit n'est compte qu'une fois.
 */
export function chantierDe(commit: CommitRow): Chantier | null {
  const d = jour(commit.date);
  return (
    CHANTIERS.find(
      (c) =>
        c.depots.includes(commit.repo) &&
        d >= c.du &&
        (c.au === null || d <= c.au),
    ) ?? null
  );
}

export type LigneJournal = {
  id: string;
  /** Titre humain, ou libelle derive du prefixe conventionnel. */
  titre: string;
  /** Ce que la ligne dit de plus, quand un chantier relu la porte. */
  resume: string | null;
  /** Comment la ligne a ete obtenue. Affiche a l'ecran, jamais devine. */
  mode: "resume-relu" | "regle-deterministe";
  /** Les commits qui la fondent. Jamais vide. */
  commits: CommitRow[];
  /** Date la plus recente du groupe, ISO 8601. */
  date: string;
  depots: string[];
  divisions: string[];
  adr: readonly string[];
  projet: string | null;
};

/**
 * Regroupe les commits en lignes lisibles.
 *
 * Un chantier rassemble ses commits en une ligne. Un commit hors chantier
 * garde sa propre ligne : il n'est ni cache, ni fondu dans un groupe auquel
 * il n'appartient pas.
 */
export function lignesLisibles(commits: CommitRow[]): LigneJournal[] {
  const parChantier = new Map<string, CommitRow[]>();
  const isoles: CommitRow[] = [];

  for (const commit of commits) {
    const chantier = chantierDe(commit);
    if (!chantier) {
      isoles.push(commit);
      continue;
    }
    const liste = parChantier.get(chantier.id) ?? [];
    liste.push(commit);
    parChantier.set(chantier.id, liste);
  }

  const lignes: LigneJournal[] = [];

  for (const [id, liste] of parChantier) {
    const chantier = CHANTIERS.find((c) => c.id === id);
    if (!chantier) {
      continue;
    }
    const triees = [...liste].sort((a, b) => b.date.localeCompare(a.date));
    lignes.push({
      id: `chantier:${id}`,
      titre: chantier.titre,
      resume: chantier.resume,
      mode: "resume-relu",
      commits: triees,
      date: triees[0]?.date ?? "",
      depots: Array.from(new Set(triees.map((c) => c.repo))),
      divisions: Array.from(
        new Set(triees.map((c) => c.division).filter(Boolean)),
      ),
      adr: chantier.adr,
      projet: chantier.projet,
    });
  }

  for (const commit of isoles) {
    lignes.push({
      id: `commit:${commit.repo}:${commit.sha}`,
      titre: libelleDeterministe(commit.message) ?? commit.message,
      resume: null,
      mode: "regle-deterministe",
      commits: [commit],
      date: commit.date,
      depots: [commit.repo],
      divisions: commit.division ? [commit.division] : [],
      adr: [],
      projet: null,
    });
  }

  return lignes.sort((a, b) => b.date.localeCompare(a.date));
}

export type MetriquesJournal = {
  commits: number;
  depotsActifs: number;
  joursActifs: number;
  joursDeLaPeriode: number;
  /** Bornes reelles de ce qui est observe, ISO 8601. Null si rien. */
  du: string | null;
  au: string | null;
};

/**
 * C8-T5, les seules metriques d'execution honnetes.
 *
 * Nombre de contributions, nombre de depots actifs, et regularite exprimee
 * en jours actifs sur la periode observee. Rien d'autre.
 *
 * Ce qui est volontairement ABSENT, et doit le rester : frequence de
 * deploiement, delai de mise en production, taux d'echec de changement,
 * temps de retablissement. Le depot n'a pas d'integration continue, donc
 * aucune de ces valeurs n'est mesuree. Les publier serait les inventer,
 * et elles seraient d'autant plus credibles qu'elles portent des noms
 * connus.
 */
export function metriques(commits: CommitRow[]): MetriquesJournal {
  if (commits.length === 0) {
    return {
      commits: 0,
      depotsActifs: 0,
      joursActifs: 0,
      joursDeLaPeriode: 0,
      du: null,
      au: null,
    };
  }
  const dates = commits.map((c) => c.date).sort();
  const premier = dates[0] ?? "";
  const dernier = dates[dates.length - 1] ?? "";
  const jours = new Set(commits.map((c) => jour(c.date)));
  const etendue =
    Math.floor(
      (Date.parse(jour(dernier)) - Date.parse(jour(premier))) / 86400000,
    ) + 1;
  return {
    commits: commits.length,
    depotsActifs: new Set(commits.map((c) => c.repo)).size,
    joursActifs: jours.size,
    joursDeLaPeriode: Number.isFinite(etendue) && etendue > 0 ? etendue : 1,
    du: premier,
    au: dernier,
  };
}

/** Filtre par periode, en jours. `null` signifie toute la periode connue. */
export function filtrerPeriode(
  commits: CommitRow[],
  jours: number | null,
  now: Date = new Date(),
): CommitRow[] {
  if (jours === null) {
    return commits;
  }
  const limite = new Date(now.getTime() - jours * 86400000).toISOString();
  return commits.filter((c) => c.date >= limite);
}

import "server-only";

// C11-T3. La garantie « ce module ne descend jamais dans le navigateur »
// etait tenue par convention et par le fait qu'aucun composant client ne
// l'importait. Elle est desormais STRUCTURELLE : `server-only` leve a
// l'import depuis un composant client, donc une importation fautive casse la
// construction au lieu de fuiter une cle en production.

// L5-T2, feed "Shipped" multi-dépôts, étendu par C3-T6 et C8-T6.
// Agrège les derniers commits de tous les dépôts du groupe (liste fournie par
// lib/repos.ts). Un appel par dépôt, en parallèle, chacun avec son propre
// cache : la page n'attend jamais plus que le dépôt le plus lent et l'API
// n'est pas rappelée à chaque rendu.
//
// Durée de cache calée sur le quota anonyme de GitHub, 60 requêtes par heure.
// Avec huit dépôts, un cache de 5 minutes donnerait 96 requêtes par heure,
// donc du 403 une partie du temps. À 15 minutes on retombe à 32. Dès qu'un
// jeton est posé (5000 par heure), cette contrainte disparaît.
//
// Dégradation : un dépôt injoignable (privé, renommé, quota) n'annule pas les
// autres. Jusqu'au 2 septembre 2026 il était simplement OMIS, et c'est le
// défaut que C3-T6 ferme : un journal qui montre six dépôts sur huit en ayant
// l'air complet ment par omission. Chaque dépôt non lu est désormais NOMMÉ,
// avec sa raison en français courant.
//
// Contrainte structurante à ne pas perdre de vue : les huit dépôts vivent sur
// deux propriétaires, adama-diallo-rse et iroko-software-group. Un jeton
// fine-grained n'a qu'un seul propriétaire, donc sept entrées sur huit au
// mieux. Le seul jeton couvrant les huit serait un jeton classique de portée
// repo, qui donne l'écriture : contraire à docs/SECRETS.md.
//
// Le jeton n'est jamais exposé au navigateur, ce module est serveur uniquement.

import {
  resolveTrackedRepos,
  type RepoSource,
  type TrackedRepo,
} from "./repos";
import type { CommitRow } from "../components/types";

type GitHubCommit = {
  sha: string;
  html_url: string;
  author: { login: string } | null;
  commit: {
    message: string;
    author: { date: string; name: string } | null;
  };
};

/** État de lecture d'un dépôt, pour le journal et la matrice de santé. */
export type RepoFeedStatus = {
  fullName: string;
  product: string;
  division: string;
  ok: boolean;
  /** Raison de l'absence, en français courant. Null quand le dépôt a été lu. */
  reason: string | null;
  /** Contributions retenues après filtrage du bruit. */
  commits: number;
};

export type ShippedFeed = {
  commits: CommitRow[];
  repos: RepoFeedStatus[];
  /** D'où vient la liste des dépôts suivis. */
  source: RepoSource;
  /** Raison du repli de source, en français courant. Null si tout va bien. */
  sourceReason: string | null;
};

// Bruit à ne jamais afficher : fusions, montées de dépendances, et la
// renormalisation des fins de ligne de la vague 0, qui noierait le feed.
const NOISE_PATTERNS = [
  /^Merge (branch|pull request|remote-tracking|tag)/i,
  /^Revert "Merge/i,
  /^chore\(deps(-dev)?\)/i,
  /^(build|chore|fix)\(deps\)/i,
  /^(chore|build): (bump|update) /i,
  /fins de ligne/i,
  /line endings/i,
  /^Initial commit$/i,
];

const BOT_AUTHOR = /\[bot\]$|^dependabot|^renovate|^github-actions/i;

/** Fraîcheur du feed, en secondes. Voir la note de quota en tête de fichier. */
const REVALIDATE_SECONDS = 900;

/** Erreur de lecture d'un dépôt, porteuse de sa cause lisible. */
class RepoReadError extends Error {
  constructor(
    message: string,
    /** Phrase de français courant, affichable telle quelle à un visiteur. */
    readonly reason: string,
  ) {
    super(message);
    this.name = "RepoReadError";
  }
}

/**
 * Traduction d'un code HTTP en cause lisible. Aucun code technique ne
 * traverse vers l'écran : l'interdit de la couche C3 le dit explicitement.
 */
function raisonHttp(status: number, jeton: boolean): string {
  if (status === 401) {
    return "le jeton de lecture a été refusé, il est expiré ou révoqué";
  }
  if (status === 403 || status === 429) {
    return jeton
      ? "le quota de lecture du jeton est atteint"
      : "le quota de lecture sans jeton est atteint";
  }
  if (status === 404) {
    return jeton
      ? "hors de portée du jeton : dépôt privé d’un autre propriétaire, ou renommé"
      : "dépôt privé, aucun jeton de lecture n’est posé";
  }
  if (status >= 500) {
    return "l’hébergeur du dépôt n’a pas répondu";
  }
  return "le dépôt n’a pas pu être lu";
}

function isNoise(commit: GitHubCommit, title: string): boolean {
  if (NOISE_PATTERNS.some((re) => re.test(title))) {
    return true;
  }
  const login = commit.author?.login ?? "";
  const name = commit.commit.author?.name ?? "";
  return BOT_AUTHOR.test(login) || BOT_AUTHOR.test(name);
}

async function fetchRepoCommits(
  repo: TrackedRepo,
  perRepo: number,
): Promise<CommitRow[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Jeton optionnel pour un dépôt public, obligatoire pour un dépôt privé.
  // Il fait aussi passer le quota de 60 à 5000 requêtes par heure.
  const jeton = Boolean(process.env.GITHUB_TOKEN);
  if (jeton) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.github.com/repos/${repo.fullName}/commits?per_page=${perRepo}`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } },
    );
  } catch (error) {
    throw new RepoReadError(
      error instanceof Error ? error.message : String(error),
      "la sortie réseau de ce site n’a pas abouti, l’état du dépôt reste inconnu",
    );
  }
  if (!res.ok) {
    throw new RepoReadError(
      `HTTP ${res.status} ${res.statusText}`,
      raisonHttp(res.status, jeton),
    );
  }

  const data = (await res.json()) as GitHubCommit[];
  if (!Array.isArray(data)) {
    throw new RepoReadError(
      "réponse inattendue de l'API GitHub",
      "la réponse reçue n’était pas exploitable",
    );
  }

  return data
    .map((c) => ({
      raw: c,
      title: c.commit.message.split("\n")[0]?.trim() ?? "",
    }))
    .filter(({ raw, title }) => title.length > 0 && !isNoise(raw, title))
    .map(({ raw, title }) => ({
      sha: raw.sha.slice(0, 7),
      message: title,
      date: raw.commit.author?.date ?? "",
      url: raw.html_url,
      product: repo.product,
      division: repo.division,
      repo: repo.fullName,
    }));
}

/**
 * Journal complet : les commits ET l'état de lecture de chaque dépôt.
 *
 * C'est la fonction que le journal de construction (C8) et la matrice de
 * santé (C3) appellent. Elle ne lève jamais.
 */
export async function fetchShippedFeed(limit = 8): Promise<ShippedFeed> {
  const { repos, source, reason } = await resolveTrackedRepos();
  // On tire plus large que `limit` par dépôt : après filtrage du bruit, un
  // dépôt très actif doit pouvoir occuper plusieurs lignes du feed.
  const perRepo = Math.min(Math.max(limit, 15), 100);

  const settled = await Promise.allSettled(
    repos.map((repo) => fetchRepoCommits(repo, perRepo)),
  );

  const commits: CommitRow[] = [];
  const statuses: RepoFeedStatus[] = settled.map((result, i) => {
    const repo = repos[i];
    const base = {
      fullName: repo?.fullName ?? "dépôt inconnu",
      product: repo?.product ?? "",
      division: repo?.division ?? "",
    };
    if (result.status === "fulfilled") {
      commits.push(...result.value);
      return { ...base, ok: true, reason: null, commits: result.value.length };
    }
    const cause =
      result.reason instanceof RepoReadError
        ? result.reason.reason
        : "le dépôt n’a pas pu être lu";
    console.error(`[shipped] ${base.fullName} indisponible :`, result.reason);
    return { ...base, ok: false, reason: cause, commits: 0 };
  });

  return {
    commits: commits
      .filter((c) => c.date !== "")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit),
    repos: statuses,
    source,
    sourceReason: reason,
  };
}

/** Derniers commits, tous dépôts confondus, du plus récent au plus ancien. */
export async function fetchShippedCommits(limit = 8): Promise<CommitRow[]> {
  return (await fetchShippedFeed(limit)).commits;
}

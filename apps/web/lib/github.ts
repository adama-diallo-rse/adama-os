// L5-T2, feed "Shipped" multi-dépôts.
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
// autres. L'erreur part dans les logs serveur, elle n'est pas avalée.
// Le jeton n'est jamais exposé au navigateur, ce module est serveur uniquement.

import { listTrackedRepos, type TrackedRepo } from "./repos";
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
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${repo.fullName}/commits?per_page=${perRepo}`,
    { headers, next: { revalidate: REVALIDATE_SECONDS } },
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as GitHubCommit[];
  if (!Array.isArray(data)) {
    throw new Error("réponse inattendue de l'API GitHub");
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
    }));
}

/** Derniers commits, tous dépôts confondus, du plus récent au plus ancien. */
export async function fetchShippedCommits(limit = 8): Promise<CommitRow[]> {
  const repos = await listTrackedRepos();
  // On tire plus large que `limit` par dépôt : après filtrage du bruit, un
  // dépôt très actif doit pouvoir occuper plusieurs lignes du feed.
  const perRepo = Math.min(Math.max(limit, 15), 100);

  const settled = await Promise.allSettled(
    repos.map((repo) => fetchRepoCommits(repo, perRepo)),
  );

  const commits: CommitRow[] = [];
  settled.forEach((result, i) => {
    if (result.status === "fulfilled") {
      commits.push(...result.value);
      return;
    }
    const repo = repos[i]?.fullName ?? "dépôt inconnu";
    console.error(`[shipped] ${repo} indisponible :`, result.reason);
  });

  return commits
    .filter((c) => c.date !== "")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

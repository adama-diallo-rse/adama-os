// L5-T1, Feed "Shipped".
// Lit les derniers commits du repo public via l'API GitHub REST.
// Cache serveur 5 min (revalidate) : meme avec la page en force-dynamic,
// le fetch garde son propre cache de donnees, donc on reste tres loin du
// rate limit anonyme (60 req/h). Jamais bloquant : en cas d'erreur, de
// timeout ou de rate limit, on renvoie [] et la vitrine ne casse pas.

import { GITHUB_OWNER, GITHUB_REPO, type CommitRow } from "../components/types";

type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string } | null;
  };
};

export async function fetchShippedCommits(limit = 8): Promise<CommitRow[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    // Token optionnel (GITHUB_TOKEN) : passe la limite de 60 a 5000 req/h.
    // Jamais expose au navigateur, ce module ne tourne que cote serveur.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=${limit}`,
      { headers, next: { revalidate: 300 } },
    );
    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as GitHubCommit[];
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((c) => ({
      sha: c.sha.slice(0, 7),
      // Premiere ligne du message uniquement (titre du commit).
      message: c.commit.message.split("\n")[0]?.trim() ?? "",
      date: c.commit.author?.date ?? "",
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}

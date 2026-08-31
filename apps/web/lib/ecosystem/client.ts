import "server-only";

// L9, client générique des passerelles écosystème.
//
// Contraintes tenues ici, une fois pour toutes :
//   - délai court et borné : une API produit lente ne ralentit jamais le
//     dashboard (AbortController, 2,5 s par défaut) ;
//   - cache Next explicite : l'API produit n'est pas rappelée à chaque rendu ;
//   - dégradation silencieuse vers un état "source indisponible", JAMAIS vers
//     une valeur inventée : une erreur remonte comme telle à l'appelant ;
//   - lecture seule : ce module ne connaît que la méthode GET. Il n'existe
//     volontairement aucun chemin d'écriture vers un produit.

const DEFAULT_TIMEOUT_MS = 2500;
const DEFAULT_REVALIDATE_S = 300;

export type GetJsonOptions = {
  timeoutMs?: number;
  /** Durée de cache Next, en secondes. */
  revalidate?: number;
};

export type GetJsonResult<T> = {
  data: T;
  /** Latence observée côté cockpit, en millisecondes. */
  latencyMs: number;
};

/** Normalise une origine d'API : vide ou mal formée vaut absente. */
export function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * GET JSON sur une API produit. Lève en cas d'indisponibilité : c'est
 * l'appelant qui décide de l'état dégradé, pas ce module.
 */
export async function getJson<T>(
  url: string,
  options: GetJsonOptions = {},
): Promise<GetJsonResult<T>> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, revalidate = DEFAULT_REVALIDATE_S } =
    options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      next: { revalidate },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as T;
    return { data, latencyMs: Date.now() - startedAt };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`délai dépassé (${timeoutMs} ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

import "server-only";

// L9, client générique des passerelles écosystème.
//
// Contraintes tenues ici, une fois pour toutes :
//   - délai court et borné : une API produit lente ne ralentit jamais le
//     dashboard (AbortController, 2,5 s par défaut) ;
//   - cache Next explicite : l'API produit n'est pas rappelée à chaque rendu ;
//   - dégradation silencieuse vers un état "source indisponible", JAMAIS vers
//     une valeur inventée : une erreur remonte comme telle à l'appelant ;
//   - depuis la couche C1, l'erreur remontée porte sa NATURE. Un délai
//     dépassé, une sortie réseau qui échoue, un produit qui répond mal et une
//     réponse illisible étaient jusqu'ici la même absence. Ce sont quatre
//     informations différentes, et le cockpit doit pouvoir dire laquelle ;
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
  /** Code HTTP de la réponse. */
  httpStatus: number;
};

/** C1-T7, nature d'un échec de passerelle. Miroir du type Postgres
 *  probe_failure_kind, migration 0003. */
export type GatewayFailure =
  | "produit_non_sain"
  | "delai_depasse"
  | "erreur_reseau"
  | "reponse_illisible";

/**
 * Erreur de passerelle qui porte sa nature.
 *
 * Distinction fondatrice de C1-T7 : `erreur_reseau` dit que le cockpit n'a
 * pas pu sortir, `produit_non_sain` dit que le produit a répondu et va mal.
 * Confondre les deux revient à attribuer au produit un incident qu'on n'a pas
 * constaté, ou à s'attribuer une panne qui n'est pas la sienne.
 */
export class GatewayError extends Error {
  readonly kind: GatewayFailure;
  readonly httpStatus: number | null;
  readonly latencyMs: number | null;

  constructor(
    message: string,
    kind: GatewayFailure,
    options: { httpStatus?: number | null; latencyMs?: number | null } = {},
  ) {
    super(message);
    this.name = "GatewayError";
    this.kind = kind;
    this.httpStatus = options.httpStatus ?? null;
    this.latencyMs = options.latencyMs ?? null;
  }
}

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
    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        next: { revalidate },
      });
    } catch (error) {
      // Rien n'est revenu. Soit le délai est dépassé, soit la sortie réseau
      // du cockpit a échoué. Dans les deux cas, le produit n'est pas en
      // cause : on ne lui attribue aucun incident.
      if (error instanceof Error && error.name === "AbortError") {
        throw new GatewayError(
          `délai dépassé (${timeoutMs} ms)`,
          "delai_depasse",
        );
      }
      throw new GatewayError(
        error instanceof Error ? error.message : String(error),
        "erreur_reseau",
      );
    }

    const latencyMs = Date.now() - startedAt;
    if (!res.ok) {
      // Le produit a répondu. Il va mal, et c'est une information sur lui.
      throw new GatewayError(
        `HTTP ${res.status} ${res.statusText}`,
        "produit_non_sain",
        { httpStatus: res.status, latencyMs },
      );
    }

    let data: T;
    try {
      data = (await res.json()) as T;
    } catch {
      throw new GatewayError(
        "réponse non exploitable (JSON illisible)",
        "reponse_illisible",
        { httpStatus: res.status, latencyMs },
      );
    }
    return { data, latencyMs, httpStatus: res.status };
  } finally {
    clearTimeout(timer);
  }
}

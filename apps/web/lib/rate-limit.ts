// L8-T12, garde-fou de débit.
//
// /api/chat appelle un modèle payant sans authentification : sans limite, une
// boucle depuis un navigateur suffit à vider un budget en une nuit. Ce module
// pose une fenêtre glissante simple, en mémoire du processus.
//
// Limite assumée : la mémoire n'est pas partagée entre les instances
// serverless. Le plafond réel est donc « limite x nombre d'instances tièdes »,
// pas « limite ». C'est un garde-fou anti-emballement, pas un contrôle
// d'accès. Le jour où il faut mieux, la même interface se rebranche sur un
// stockage partagé sans toucher aux routes.

export type RateLimitVerdict = {
  allowed: boolean;
  /** Requêtes encore autorisées dans la fenêtre courante. */
  remaining: number;
  /** Secondes à attendre avant la prochaine tentative utile. */
  retryAfterS: number;
};

export type RateLimiter = {
  check: (key: string, now?: number) => RateLimitVerdict;
  /** Vide l'état interne. Réservé aux tests. */
  reset: () => void;
};

const MAX_KEYS = 5000;

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const { limit, windowMs } = options;
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now = Date.now()): RateLimitVerdict {
      // Purge grossière : au-delà du plafond de clés, on repart à zéro plutôt
      // que de laisser la carte grossir sans borne dans un processus long.
      if (hits.size > MAX_KEYS) {
        hits.clear();
      }

      const debut = now - windowMs;
      const precedents = (hits.get(key) ?? []).filter((t) => t > debut);

      if (precedents.length >= limit) {
        const plusAncien = precedents[0] ?? now;
        const attente = Math.ceil((plusAncien + windowMs - now) / 1000);
        hits.set(key, precedents);
        return {
          allowed: false,
          remaining: 0,
          retryAfterS: Math.max(1, attente),
        };
      }

      precedents.push(now);
      hits.set(key, precedents);
      return {
        allowed: true,
        remaining: limit - precedents.length,
        retryAfterS: 0,
      };
    },
    reset() {
      hits.clear();
    },
  };
}

/** Entier positif lu dans l'environnement, avec valeur de repli. */
export function readPositiveInt(
  value: string | undefined,
  fallback: number,
): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Identifiant de l'appelant, dérivé des en-têtes de proxy.
 * Vercel pose x-forwarded-for ; on prend la première adresse, la seule que le
 * client ne contrôle pas. Sans en-tête, tout le monde partage la clé
 * "inconnu" : en développement local c'est sans conséquence, en production
 * l'en-tête est toujours présent.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const premier = forwarded.split(",")[0]?.trim();
    if (premier) {
      return premier;
    }
  }
  return headers.get("x-real-ip")?.trim() || "inconnu";
}

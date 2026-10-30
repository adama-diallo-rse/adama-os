"use client";

import { useEffect, useState } from "react";

type Repos = (rappel: () => void, options?: { timeout: number }) => number;

/**
 * Vrai une fois la page hydratée ET le navigateur au repos
 * (`requestIdleCallback`, repli sur un délai). Toujours faux sous
 * réduction de mouvement : rien de ce qui en dépend n'est alors importé.
 */
export function useRepos(delaiMax: number, repli: number): boolean {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const w = window as Window & {
      requestIdleCallback?: Repos;
      cancelIdleCallback?: (id: number) => void;
    };
    const lancer = () => setPret(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(lancer, { timeout: delaiMax });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(lancer, repli);
    return () => window.clearTimeout(id);
  }, [delaiMax, repli]);

  return pret;
}

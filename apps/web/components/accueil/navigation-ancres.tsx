"use client";

import { useEffect, useState } from "react";

export type Ancre = { id: string; numero: string; libelle: string };

/**
 * La navigation latérale fixe de l'accueil, à ancres numérotées, façon
 * publication de recherche. Grand écran seulement. La section lue porte
 * `aria-current`. Les liens sont de vrais liens d'ancre : sans script, ils
 * mènent à leur section comme n'importe quel lien.
 */
export function NavigationAncres({ ancres }: { ancres: readonly Ancre[] }) {
  const [actif, setActif] = useState<string | null>(null);

  useEffect(() => {
    const cibles = ancres
      .map((a) => document.getElementById(a.id))
      .filter((e): e is HTMLElement => Boolean(e));
    const obs = new IntersectionObserver(
      (vues) => {
        const v = vues.find((e) => e.isIntersecting);
        if (v) setActif(v.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    cibles.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [ancres]);

  return (
    <nav className="nav-ancres" aria-label="Sections de l’accueil">
      <ol>
        {ancres.map((a) => (
          <li key={a.id}>
            <a
              href={`#${a.id}`}
              aria-current={actif === a.id ? "true" : undefined}
            >
              <span className="nav-ancres-numero">{a.numero}</span>
              <span className="nav-ancres-libelle">{a.libelle}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

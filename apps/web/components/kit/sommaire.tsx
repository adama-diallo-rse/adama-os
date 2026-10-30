"use client";

import { useEffect, useState } from "react";

type Entree = { id: string; texte: string };

/** Identifiant lisible tiré du texte d'un titre, accents retirés. */
function ancre(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Le texte d'un titre sans son numéro de section : le sommaire numérote
 *  déjà ses entrées, un titre qui porte « 01 » se lirait « 01 01 ». */
function texteDe(h: HTMLHeadingElement): string {
  const copie = h.cloneNode(true) as HTMLElement;
  copie.querySelectorAll("span, small, em").forEach((e) => {
    if (/^\s*\d{1,3}\s*$/.test(e.textContent ?? "")) e.remove();
  });
  return (copie.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Le sommaire collant du kit de page intérieure.
 *
 * Construit après le rendu depuis les titres de section (`main h2`) : il
 * n'ajoute aucun contenu, il en donne le plan. Sous trois titres, il ne
 * s'affiche pas. Sur grand écran seulement ; ailleurs, la page se lit de
 * haut en bas sans lui. La section lue est signalée par `aria-current`.
 */
export function Sommaire() {
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [actif, setActif] = useState<string | null>(null);

  useEffect(() => {
    const titres = Array.from(
      document.querySelectorAll<HTMLHeadingElement>("main h2"),
    ).filter((h) => !h.closest("[hidden], dialog, [data-sans-sommaire]"));
    const vus = new Set<string>();
    const liste = titres.map((h) => {
      let id =
        h.id || h.closest("section[id]")?.id || ancre(h.textContent ?? "");
      if (!id || vus.has(id)) id = `${id || "section"}-${vus.size + 1}`;
      vus.add(id);
      if (!h.id && !h.closest("section[id]")) h.id = id;
      return { id, texte: texteDe(h) };
    });
    // Lecture du document après hydratation : une seule mise à jour.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntrees(liste.length >= 3 ? liste : []);
    if (liste.length < 3) return;

    const observateur = new IntersectionObserver(
      (vues) => {
        const visible = vues
          .filter((v) => v.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (visible) {
          const id =
            visible.target.id ||
            visible.target.closest("section[id]")?.id ||
            null;
          if (id) setActif(id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    titres.forEach((h) => observateur.observe(h));
    return () => observateur.disconnect();
  }, []);

  if (!entrees.length) return null;
  return (
    <aside className="sommaire" aria-label="Sommaire de la page">
      <p className="sommaire-titre">Sommaire</p>
      <ol>
        {entrees.map((e, i) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={actif === e.id ? "true" : undefined}
            >
              <span className="sommaire-numero">
                {String(i + 1).padStart(2, "0")}
              </span>
              {e.texte}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

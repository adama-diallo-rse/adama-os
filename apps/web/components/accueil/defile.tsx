"use client";

import { useState, type ReactNode } from "react";

/**
 * Un bandeau qui défile en continu, avec son bouton pause : tout mouvement
 * en boucle de plus de cinq secondes doit pouvoir s'arrêter. Le contenu est
 * fourni deux fois par l'appelant (la seconde copie masquée aux lecteurs
 * d'écran) pour que la boucle soit sans couture. Sous réduction de
 * mouvement, la CSS fige le bandeau et la première copie reste lisible.
 */
export function Defile({
  libelle,
  children,
  vitesse = 48,
}: {
  libelle: string;
  children: ReactNode;
  /** Durée d'un tour, en secondes. */
  vitesse?: number;
}) {
  const [pause, setPause] = useState(false);
  return (
    <div
      className="defile"
      role="region"
      aria-label={`Défilé des ${libelle}`}
      tabIndex={0}
      data-pause={pause ? "oui" : "non"}
      style={{ ["--defile-duree" as string]: `${vitesse}s` }}
    >
      <div className="defile-piste">{children}</div>
      <button
        type="button"
        className="defile-pause"
        aria-pressed={pause}
        onClick={() => setPause(!pause)}
      >
        {pause ? "Reprendre" : "Pause"}
        <span className="sr-only"> : {libelle}</span>
      </button>
    </div>
  );
}

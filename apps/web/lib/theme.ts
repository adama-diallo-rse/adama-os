"use client";

import { useEffect } from "react";

// Le thème alternatif du terminal (commande `theme`), persisté dans le
// navigateur. Module minuscule et séparé du terminal : l'accueil restaure le
// thème au montage sans charger le terminal, qui n'arrive qu'au repos.

export const THEME_KEY = "adama-theme";

export function applyTheme(theme: string | null) {
  if (theme === "indigo") {
    document.documentElement.dataset.theme = "indigo";
  } else {
    delete document.documentElement.dataset.theme;
  }
}

/** Restaure le thème choisi au montage (persisté en localStorage). */
export function useThemeBoot() {
  useEffect(() => {
    try {
      applyTheme(localStorage.getItem(THEME_KEY));
    } catch {
      // stockage indisponible : thème par défaut
    }
  }, []);
}

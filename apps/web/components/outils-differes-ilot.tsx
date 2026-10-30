"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ProprietesOutils } from "./outils-differes";

const OutilsDifferes = dynamic(() => import("./outils-differes"), {
  ssr: false,
});

type Repos = (rappel: () => void, options?: { timeout: number }) => number;

/**
 * Monte les outils différés au repos du navigateur (y compris sous
 * réduction de mouvement : ce ne sont pas des animations), ou tout de
 * suite quand l'un d'eux est demandé. Le raccourci Ctrl+K est écouté ici
 * tant que le terminal n'est pas chargé, pour qu'il réponde dès le premier
 * appui.
 */
export function IlotOutils(p: ProprietesOutils) {
  const [pret, setPret] = useState(false);
  const { setTerminalOpen, terminal } = p;

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: Repos;
      cancelIdleCallback?: (id: number) => void;
    };
    const lancer = () => setPret(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(lancer, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(lancer, 1500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (pret || !terminal) return;
    const raccourci = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setPret(true);
        setTerminalOpen(true);
      }
    };
    window.addEventListener("keydown", raccourci);
    return () => window.removeEventListener("keydown", raccourci);
  }, [pret, terminal, setTerminalOpen]);

  const demande = p.recruitOpen || p.terminalOpen || p.adamaOpen;
  return pret || demande ? <OutilsDifferes {...p} /> : null;
}

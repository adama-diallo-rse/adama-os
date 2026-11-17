"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ProprietesOutils } from "./outils-differes";

const OutilsDifferes = dynamic(() => import("./outils-differes"), {
  ssr: false,
});

/** Les gestes qui disent qu'une personne est là et lit la page. */
const GESTES = [
  "pointermove",
  "pointerdown",
  "touchstart",
  "keydown",
  "wheel",
  "scroll",
] as const;

/**
 * Monte les outils différés au premier geste du visiteur (y compris sous
 * réduction de mouvement : ce ne sont pas des animations), ou tout de
 * suite quand l'un d'eux est demandé. Le raccourci Ctrl+K est écouté ici
 * tant que le terminal n'est pas chargé, pour qu'il réponde dès le premier
 * appui.
 *
 * 17 novembre 2026 : le montage attendait le repos du navigateur, soit
 * quatre secondes au plus. Le moteur, le terminal, framer-motion et le
 * client de conversation se chargeaient donc pendant le premier affichage
 * et pesaient sur le blocage du fil principal (490 ms mesurés sur
 * l'accueil). Ils attendent désormais un geste. En attendant, un lanceur
 * sans dépendance tient la place du vrai, au même endroit et sous le même
 * nom : le visiteur ne voit pas la différence, et un clic dessus charge
 * et ouvre le moteur.
 */
export function IlotOutils(p: ProprietesOutils) {
  const [pret, setPret] = useState(false);
  const { setTerminalOpen, terminal } = p;

  useEffect(() => {
    if (pret) return;
    const lancer = () => setPret(true);
    GESTES.forEach((g) =>
      window.addEventListener(g, lancer, { once: true, passive: true }),
    );
    return () => GESTES.forEach((g) => window.removeEventListener(g, lancer));
  }, [pret]);

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
  if (pret || demande) return <OutilsDifferes {...p} />;
  // Même balisage et mêmes classes que le lanceur de components/adama-ai.tsx,
  // au repos : un rond et son monogramme, le nom porté par aria-label.
  return (
    <div className="adama-assistant">
      <button
        type="button"
        className="assistant-launcher"
        aria-expanded={false}
        aria-label="Le moteur, poser une question"
        onClick={() => p.setAdamaOpen(true)}
      >
        <span className="assistant-monogram" aria-hidden="true">
          a.
        </span>
        <span className="assistant-libelle">Le moteur</span>
        <span className="assistant-libelle" aria-hidden="true">
          ↗
        </span>
      </button>
    </div>
  );
}

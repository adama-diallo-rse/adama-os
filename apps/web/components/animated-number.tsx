"use client";

// Compteur animé (L4-T10). Monte de 0 vers la valeur cible quand
// l'élément entre dans le viewport. Respecte prefers-reduced-motion.

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  // Toujours démarrer à 0 : le serveur rend 0, le client doit rendre la même
  // chose au premier rendu (sinon erreur d'hydratation). L'effet ci-dessous
  // (post-hydratation) anime ou fixe la valeur selon reduced-motion.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion]);

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(display);

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

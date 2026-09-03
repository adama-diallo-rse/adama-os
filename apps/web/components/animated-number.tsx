"use client";

// Compteur animé (L4-T10). Monte de 0 vers la valeur cible quand l'élément
// entre dans le viewport. Respecte prefers-reduced-motion.
//
// Corrigé par la couche C1. L'état de départ était 0, ce qui voulait dire que
// le rendu serveur, la version imprimée et tout lecteur sans JavaScript
// voyaient « 0 » à la place de la valeur réelle. Un zéro affiché à la place
// d'une mesure est exactement le défaut que cette couche traite : c'est un
// chiffre faux, même s'il ne le reste qu'une seconde.
//
// L'état de départ est donc la valeur elle-même. Le serveur et le client
// rendent la même chose au premier rendu, l'égalité de markup est préservée,
// et l'animation part de 0 après hydratation, quand elle a lieu.

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
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) {
      return;
    }
    if (reduceMotion) {
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

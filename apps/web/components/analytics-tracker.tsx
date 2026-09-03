"use client";

// =====================================================================
// C13-T1, l'emission des evenements ouverts par les couches C2 a C10.
//
// Deux composants minuscules, et rien d'autre. Ils passent par le meme
// chemin que les evenements existants : sans consentement, la capture est
// mise en file puis effacee au refus, et sans cle configuree elle ne fait
// rien du tout. Aucun cookie n'est pose ici.
//
// `TrackView` emet a l'affichage. C'est volontaire pour les pages de preuve
// et de decision : ce qu'on veut mesurer, c'est qu'un lecteur EST ALLE
// verifier, pas qu'il a survole un lien. Emettre au clic aurait compte des
// intentions au lieu de constater des lectures.
// =====================================================================

import { useEffect, useRef, type ReactNode } from "react";
import { captureEvent } from "../lib/analytics";

export function TrackView({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  const emis = useRef(false);
  useEffect(() => {
    if (emis.current) {
      return;
    }
    emis.current = true;
    captureEvent(event, properties);
    // Les proprietes sont figees au premier rendu : une re-emission a chaque
    // changement de reference d'objet compterait plusieurs fois la meme
    // lecture, et gonflerait l'entonnoir sans que rien ne le signale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}

/**
 * Un lien qui trace son ouverture. Reste un vrai lien : il fonctionne sans
 * JavaScript, et la mesure est le supplement, jamais la condition.
 */
export function TrackedAnchor({
  href,
  event,
  properties,
  className,
  children,
}: {
  href: string;
  event: string;
  properties?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => captureEvent(event, properties)}
    >
      {children}
    </a>
  );
}

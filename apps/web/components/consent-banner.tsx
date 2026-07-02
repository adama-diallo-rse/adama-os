"use client";

// L8-T4 — Bandeau de consentement analytics (RGPD).
// Monté dans le layout : s'affiche tant qu'aucun choix n'est stocké.
// Rouvrable via l'événement fenêtre CONSENT_OPEN_EVENT (lien "cookies").
// Rendu null au premier rendu (serveur ET client) → zéro risque d'hydratation,
// l'état ne change que dans useEffect.

import { useEffect, useState } from "react";
import { Button } from "@adama/ui";
import {
  CONSENT_OPEN_EVENT,
  bootAnalytics,
  getStoredConsent,
  setConsent,
} from "../lib/analytics";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Consentement déjà donné lors d'une visite précédente → boot direct.
    bootAnalytics();
    if (getStoredConsent() === null) {
      setVisible(true);
    }
    const onOpen = () => setVisible(true);
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  if (!visible) {
    return null;
  }

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Consentement analytics"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border-strong bg-surface/95 px-4 py-3 backdrop-blur-sm print:hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs leading-relaxed text-muted">
          <span className="text-emerald">$</span> analytics : mesure d&apos;audience
          anonyme via PostHog (UE), aucune pub, aucun tracking tiers.{" "}
          <span className="text-faint">Refuser ne change rien au site.</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => choose("denied")}>
            Refuser
          </Button>
          <Button variant="primary" size="sm" bracket onClick={() => choose("granted")}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Lien discret pour rouvrir le bandeau (footer). */
export function ConsentLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className={
        className ??
        "font-mono text-[0.65rem] text-faint underline-offset-4 transition-colors hover:text-muted hover:underline"
      }
    >
      cookies
    </button>
  );
}

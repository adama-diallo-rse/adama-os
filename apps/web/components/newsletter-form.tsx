"use client";

// L6-T10 — Formulaire d'inscription newsletter, réutilisable (/veille, /learn,
// /strata). Poste sur /api/newsletter. Fail-safe côté serveur : ici on affiche
// simplement l'état. Capture l'intention via PostHog (gaté par le consentement).

import { useState, type FormEvent } from "react";
import { Button } from "@adama/ui";
import { captureEvent } from "../lib/analytics";

type State = "idle" | "sending" | "done" | "error";

export function NewsletterForm({
  context,
  title = "Recevoir la veille par email",
  subtitle = "Les synthèses réglementaires et les nouvelles ressources, sans spam.",
}: {
  /** D'où vient l'inscription (ex. "veille", "learn"). */
  context?: string;
  title?: string;
  subtitle?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setState("error");
      return;
    }
    setState("sending");
    captureEvent("newsletter_signup", { context: context ?? null });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, context: context ?? null }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-4 py-4">
      {state === "done" ? (
        <p role="status" className="font-mono text-sm text-emerald-bright">
          ✓ Inscription confirmée. À bientôt.
        </p>
      ) : (
        <>
          <p className="font-mono text-sm font-semibold text-foreground">
            {title}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted">{subtitle}</p>
          <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.pro"
              aria-label="Adresse email"
              className="h-9 flex-1 rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-mono text-sm text-foreground outline-none placeholder:text-faint focus:border-emerald"
            />
            <Button type="submit" variant="outline" size="md" disabled={state === "sending"}>
              {state === "sending" ? "envoi..." : "s'inscrire"}
            </Button>
          </form>
          {state === "error" ? (
            <p role="alert" className="mt-2 font-mono text-xs text-danger">
              Email invalide ou envoi impossible. Réessaie.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

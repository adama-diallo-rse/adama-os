"use client";

// L6-T2/T3 — Modal "Recruter l'Architecte".
// Proposition de valeur hybride, CV téléchargeable, Cal.com embarqué
// (chargé à la demande), capture du lead recruteur dans `leads`
// + événement PostHog `recruiter_intent`.
//
// Règle hydratation du projet : useReducedMotion uniquement dans des
// composants montés côté client après interaction (c'est le cas ici,
// le modal n'est rendu que quand open === true).

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Badge, Button } from "@adama/ui";
import { captureEvent } from "../lib/analytics";
import { createClient } from "../lib/supabase/client";
import {
  CAL_LINK,
  CONTACT_EMAIL,
  CV_DOWNLOAD_NAME,
  CV_PATH,
} from "./types";

type SubmitState = "idle" | "sending" | "done" | "error";

const VALUE_PROPS: { title: string; body: string }[] = [
  {
    title: "RSE / ESG",
    body: "CSRD, ESRS, VSME : le cadre réglementaire maîtrisé côté métier, pas seulement côté texte.",
  },
  {
    title: "Ingénierie",
    body: "Ce dashboard est la preuve : Next.js, Supabase, FastAPI, RAG. Conçu, codé et livré en solo.",
  },
  {
    title: "Systèmes",
    body: "Une approche d'architecte : décisions documentées, métriques publiques, exécution mesurable.",
  },
];

export function RecruitModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [showCal, setShowCal] = useState(false);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Échap pour fermer + événement d'ouverture.
  useEffect(() => {
    if (!open) {
      setShowCal(false);
      return;
    }
    captureEvent("recruiter_modal_opened");
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  const downloadCv = useCallback(() => {
    const a = document.createElement("a");
    a.href = CV_PATH;
    a.download = CV_DOWNLOAD_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    captureEvent("recruiter_cv_download");
  }, []);

  const openCal = useCallback(() => {
    captureEvent("recruiter_cal_opened");
    if (CAL_LINK) {
      setShowCal(true);
      return;
    }
    // Repli sans Cal.com configuré : email.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      "Prise de rendez-vous, Adama OS",
    )}`;
  }, []);

  const submitLead = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const cleanEmail = email.trim().toLowerCase();
      if (state === "sending") {
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        setState("error");
        return;
      }
      setState("sending");

      // L6-T3 : événement d'intention, envoyé même si Supabase échoue.
      captureEvent("recruiter_intent", {
        company: company.trim() || null,
        has_cal_link: Boolean(CAL_LINK),
      });

      const supabase = createClient();
      if (!supabase) {
        // Pas de config Supabase (dev local) : on considère l'intention captée.
        setState("done");
        return;
      }

      const { error } = await supabase.from("leads").insert({
        email: cleanEmail,
        source: "recruiter",
        context: {
          company: company.trim() || null,
          path: window.location.pathname + window.location.search,
        },
      });

      setState(error ? "error" : "done");
    },
    [email, company, state],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="recruit-overlay"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[8vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              close();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Recruter l'Architecte"
        >
          <motion.div
            key="recruit-panel"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-2xl overflow-hidden rounded-[var(--radius)] border border-border-strong bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] glow-emerald"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span aria-hidden className="font-mono text-sm text-emerald">
                  $
                </span>
                <h2 className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-foreground">
                  Recruter l&apos;Architecte
                </h2>
                <Badge variant="emerald" dot>
                  open to work
                </Badge>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-faint transition-colors hover:text-foreground"
              >
                esc
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              {/* Proposition de valeur hybride */}
              <div>
                <p className="font-mono text-sm leading-relaxed text-muted">
                  Un profil hybride :{" "}
                  <span className="text-foreground">
                    expertise RSE / ESG
                  </span>{" "}
                  ×{" "}
                  <span className="text-foreground">
                    exécution d&apos;ingénieur
                  </span>
                  . Alternance / stage à partir de novembre 2026.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {VALUE_PROPS.map((v) => (
                    <div
                      key={v.title}
                      className="rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-3 py-3"
                    >
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-emerald">
                        {v.title}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        {v.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions : CV + call */}
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm" bracket onClick={downloadCv}>
                  Télécharger le CV
                </Button>
                <Button variant="outline" size="sm" bracket onClick={openCal}>
                  Planifier un appel
                </Button>
                <a
                  href="/?for=recruiter"
                  className="font-mono text-xs text-faint underline-offset-4 transition-colors hover:text-emerald-bright hover:underline"
                >
                  version lecture / imprimable →
                </a>
              </div>

              {/* Cal.com embarqué, chargé à la demande */}
              {showCal && CAL_LINK ? (
                <div className="overflow-hidden rounded-[calc(var(--radius)_-_0.25rem)] border border-border">
                  <iframe
                    src={`https://cal.com/${CAL_LINK}?theme=dark&layout=month_view`}
                    title="Prendre rendez-vous (Cal.com)"
                    className="h-[420px] w-full bg-surface-raised"
                    loading="lazy"
                  />
                </div>
              ) : null}

              {/* Capture du lead */}
              <form
                onSubmit={submitLead}
                className="rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-4 py-4"
              >
                {state === "done" ? (
                  <p
                    role="status"
                    className="font-mono text-sm text-emerald-bright"
                  >
                    ✓ Bien reçu. Réponse sous 24 h, CV et références inclus.
                  </p>
                ) : (
                  <>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-faint">
                      Ou laissez un contact, réponse sous 24 h
                    </p>
                    <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email pro"
                        aria-label="Email professionnel"
                        className="h-9 flex-1 rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-mono text-sm text-foreground outline-none placeholder:text-faint focus:border-emerald"
                      />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="entreprise (optionnel)"
                        aria-label="Entreprise"
                        className="h-9 flex-1 rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-mono text-sm text-foreground outline-none placeholder:text-faint focus:border-emerald"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        size="md"
                        disabled={state === "sending"}
                      >
                        {state === "sending" ? "envoi..." : "envoyer"}
                      </Button>
                    </div>
                    {state === "error" ? (
                      <p role="alert" className="mt-2 font-mono text-xs text-danger">
                        échec de l&apos;envoi — réessayez ou écrivez à{" "}
                        {CONTACT_EMAIL}
                      </p>
                    ) : null}
                  </>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

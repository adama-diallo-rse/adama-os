"use client";

// L6-T2/T3, Modal "Contacter Adama".
// Proposition de valeur hybride, CV téléchargeable, Cal.com embarqué
// (chargé à la demande), capture du lead recruteur dans `leads`
// + événement PostHog `recruiter_intent`.
//
// Règle hydratation du projet : useReducedMotion uniquement dans des
// composants montés côté client après interaction (c'est le cas ici,
// le modal n'est rendu que quand open === true).

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Badge, Button } from "@adama/ui";
import { captureEvent } from "../lib/analytics";
import { createClient } from "../lib/supabase/client";
import { CAL_LINK, CONTACT_EMAIL, CV_DOWNLOAD_NAME, CV_PATH } from "./types";

type SubmitState = "idle" | "sending" | "done" | "error";

const VALUE_PROPS: { title: string; body: string }[] = [
  {
    title: "RSE / ESG",
    body: "Reporting de durabilité, données ESG et travail sur les référentiels CSRD, ESRS et VSME.",
  },
  {
    title: "Développement",
    body: "Next.js, Python, FastAPI et Supabase, utilisés dans mes projets STRATA ESG, IROKO et Adama OS.",
  },
  {
    title: "Projets",
    body: "Calcul carbone, veille réglementaire et logiciels de gestion. Les dépôts et le suivi des projets sont accessibles depuis ce site.",
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
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Échap pour fermer + événement d'ouverture.
  useEffect(() => {
    if (!open) {
      setShowCal(false);
      return;
    }
    captureEvent("recruiter_modal_opened");
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
      if (e.key === "Tab") {
        const targets = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex="0"]',
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (!first || !last) return;
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !dialogRef.current?.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
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
        // Without storage, never claim a contact request was delivered.
        setState("error");
        return;
      }

      try {
        const { error } = await supabase.from("leads").insert({
          email: cleanEmail,
          source: "recruiter",
          context: {
            company: company.trim() || null,
            path: window.location.pathname + window.location.search,
          },
        });
        setState(error ? "error" : "done");
      } catch {
        setState("error");
      }
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
          ref={dialogRef}
          aria-modal="true"
          aria-label="Contacter Adama"
        >
          <motion.div
            key="recruit-panel"
            initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="recruit-panel w-full max-w-2xl overflow-hidden rounded-[var(--radius)] border border-border-strong bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="font-sans text-2xl font-medium tracking-tight text-foreground">
                  Faisons connaissance.
                </h2>
                <Badge variant="emerald" dot>
                  open to work
                </Badge>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-border font-mono text-lg text-muted transition-colors hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              {/* Proposition de valeur hybride */}
              <div>
                <p className="font-sans text-sm leading-relaxed text-muted">
                  Je recherche un poste en{" "}
                  <span className="text-foreground">RSE ou data ESG</span>, en
                  CDI / CDD dès début novembre 2026 (Île-de-France).
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
                <Button
                  variant="primary"
                  size="sm"
                  bracket
                  onClick={downloadCv}
                >
                  Télécharger le CV
                </Button>
                <Button variant="outline" size="sm" bracket onClick={openCal}>
                  Planifier un appel
                </Button>
                <Link
                  href="/?for=recruiter"
                  className="font-mono text-xs text-faint underline-offset-4 transition-colors hover:text-emerald-bright hover:underline"
                >
                  version lecture / imprimable →
                </Link>
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
                    ✓ Bien reçu. Je vous répondrai par email.
                  </p>
                ) : (
                  <>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-faint">
                      Ou laissez-moi vos coordonnées
                    </p>
                    <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email pro"
                        aria-label="Email professionnel"
                        className="h-11 min-w-0 flex-1 rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-sans text-base text-foreground outline-none placeholder:text-faint focus:border-emerald"
                      />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="entreprise (optionnel)"
                        aria-label="Entreprise"
                        className="h-11 min-w-0 flex-1 rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-sans text-base text-foreground outline-none placeholder:text-faint focus:border-emerald"
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
                      <p
                        role="alert"
                        className="mt-2 font-mono text-xs text-danger"
                      >
                        échec de l&apos;envoi, réessayez ou écrivez à{" "}
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

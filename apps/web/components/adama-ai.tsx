"use client";

// L3-T5 — Composant adama.ai flottant.
// Chat streaming branché sur /api/chat (useChat, AI SDK v5).
// Style terminal cohérent avec le reste de l'OS : mono, bordures, émeraude.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SUGGESTIONS = [
  "Qu'est-ce que la double matérialité selon l'ESRS ?",
  "Quelles PME sont concernées par le standard VSME ?",
  "Résume le profil d'Adama Diallo.",
];

function MessageText({ parts }: { parts: { type: string; text?: string }[] }) {
  return (
    <>
      {parts.map((part, i) =>
        part.type === "text" && part.text ? (
          <span key={i} className="whitespace-pre-wrap">
            {part.text}
          </span>
        ) : null,
      )}
    </>
  );
}

export function AdamaAi({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat();
  const busy = status === "submitted" || status === "streaming";

  // Autoscroll vers le dernier message pendant le streaming.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  // Focus input à l'ouverture.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) {
      return;
    }
    void sendMessage({ text });
    setInput("");
  };

  const ask = (text: string) => {
    if (busy) {
      return;
    }
    void sendMessage({ text });
  };

  return (
    <>
      {/* Lanceur flottant (bas gauche, le CTA recruteur occupe le bas droit) */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-label="Ouvrir adama.ai"
          className="flex items-center gap-2 rounded-[var(--radius)] border border-border-strong bg-surface px-3.5 py-2.5 font-mono text-sm text-emerald-bright shadow-[0_12px_32px_-12px_rgba(0,0,0,0.9)] transition-colors hover:bg-surface-raised glow-emerald"
        >
          <span
            aria-hidden
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              busy ? "animate-pulse bg-emerald" : "bg-emerald"
            }`}
          />
          adama.ai
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="adama-ai-panel"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-label="adama.ai — agent ESG"
            className="fixed bottom-20 left-5 z-40 flex max-h-[70vh] w-[min(26rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[var(--radius)] border border-border-strong bg-surface shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] glow-emerald"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-mono text-sm text-foreground">
                <span className="text-emerald">$</span> adama.ai
                <span className="ml-2 text-[0.65rem] uppercase tracking-[0.18em] text-faint">
                  RAG · ESRS / VSME
                </span>
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Fermer adama.ai"
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-faint transition-colors hover:text-foreground"
              >
                esc
              </button>
            </div>

            {/* Fil de messages */}
            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            >
              {messages.length === 0 ? (
                <div className="space-y-2">
                  <p className="font-mono text-xs text-muted">
                    Pose une question sur la CSRD, les ESRS, le VSME ou le
                    profil d&apos;Adama. Les réponses citent leurs sources.
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="block w-full rounded-[calc(var(--radius)_-_0.25rem)] border border-border px-3 py-2 text-left font-mono text-xs text-muted transition-colors hover:border-border-strong hover:text-emerald-bright"
                    >
                      <span className="text-emerald">›</span> {s}
                    </button>
                  ))}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`font-mono text-sm ${
                      message.role === "user" ? "text-emerald-bright" : "text-muted"
                    }`}
                  >
                    <span aria-hidden className="mr-1.5 select-none text-faint">
                      {message.role === "user" ? "$" : "›"}
                    </span>
                    <MessageText parts={message.parts} />
                  </div>
                ))
              )}
              {status === "submitted" ? (
                <p className="animate-pulse font-mono text-xs text-faint">
                  › recherche dans les documents...
                </p>
              ) : null}
              {error ? (
                <p className="font-mono text-xs text-red-400">
                  ✗ erreur : {error.message}
                </p>
              ) : null}
            </div>

            {/* Saisie */}
            <form
              onSubmit={submit}
              className="flex items-center gap-2 border-t border-border px-4 py-3"
            >
              <span aria-hidden className="font-mono text-sm text-emerald">
                ?
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ask adama..."
                aria-label="Question pour adama.ai"
                className="w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-faint"
              />
              <button
                type="submit"
                disabled={busy || input.trim().length === 0}
                className="rounded border border-border px-2 py-1 font-mono text-[0.65rem] uppercase text-muted transition-colors enabled:hover:text-emerald-bright disabled:opacity-40"
              >
                {busy ? "..." : "run"}
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AutomationNotice } from "./automation-notice";
import { AUTOMATED_PROCESSING_SHORT } from "../lib/legal";
import { libelleSource } from "../lib/ai/sources";
import type { AdamaUIMessage, SourceConsultee } from "../lib/ai/sources";

const SUGGESTIONS = [
  {
    label: "Le parcours d’Adama",
    question: "Résume le profil d’Adama Diallo.",
  },
  {
    label: "Comprendre la double matérialité",
    question: "Qu’est-ce que la double matérialité selon les ESRS ?",
  },
  {
    label: "Le VSME pour les PME",
    question: "À quelles PME s’adresse le standard VSME ?",
  },
];

function MessageText({ parts }: { parts: AdamaUIMessage["parts"] }) {
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

/**
 * Les documents reellement consultes pour construire la reponse.
 *
 * Ce bloc n'est pas redige par le modele. Il est emis par la route a partir
 * de ce que la recherche a rapporte, avant meme le premier mot de la
 * reponse. Les numeros sont ceux que le modele emploie entre crochets dans
 * son texte : [2] renvoie ici a la source 2, et c'est verifie par
 * tests/retrieval.integration.test.ts.
 */
function Sources({ sources }: { sources: SourceConsultee[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="assistant-sources">
      <p>
        {sources.length === 1
          ? "Document consulté"
          : `${sources.length} documents consultés`}
      </p>
      <ol>
        {sources.map((source) => (
          <li key={source.rang}>
            <span aria-hidden="true">[{source.rang}]</span>
            <span>
              <span className="sr-only">Source {source.rang} : </span>
              {libelleSource(source)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Le message d'erreur a montrer.
 *
 * La route repond deja en clair : « Trop de questions d'affilee », « Base
 * documentaire injoignable ». Ces phrases n'arrivaient jamais jusqu'a
 * l'ecran, remplacees par un message unique, et une personne limitee en debit
 * lisait donc la meme chose qu'une personne devant une base en panne. Le
 * corps de la reponse est du JSON produit par ce site : s'il porte un champ
 * `error` en chaine, il est affichable tel quel. Tout le reste, y compris une
 * trace technique, reste derriere la phrase generique.
 */
export function messageDErreur(error: Error | undefined): string | null {
  if (!error) return null;
  const generique =
    "La réponse n’a pas pu être chargée. Réessayez dans un instant.";
  try {
    const corps: unknown = JSON.parse(error.message);
    if (
      corps !== null &&
      typeof corps === "object" &&
      "error" in corps &&
      typeof (corps as { error: unknown }).error === "string"
    ) {
      const texte = (corps as { error: string }).error.trim();
      return texte.length > 0 && texte.length <= 200 ? texte : generique;
    }
  } catch {
    // Pas du JSON : rien a en tirer, on ne montre pas la chaine brute.
  }
  return generique;
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
  const stickToBottom = useRef(true);
  const { messages, sendMessage, status, error, stop } =
    useChat<AdamaUIMessage>();
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messages.length === 0 && !busy) {
      listRef.current?.scrollTo({ top: 0 });
    } else if (stickToBottom.current)
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return;
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", escape);
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open, onOpenChange]);

  const ask = (text: string) => {
    if (busy) return;
    stickToBottom.current = true;
    void sendMessage({ text });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || busy) return;
    ask(input.trim());
    setInput("");
  };

  return (
    <div className="adama-assistant">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="adama-ai-panel"
        aria-label={open ? "Fermer Adama AI" : "Ouvrir Adama AI"}
        className="assistant-launcher"
      >
        <span className="assistant-monogram" aria-hidden="true">
          a.
        </span>
        <span>Adama AI</span>
        <span aria-hidden="true">{open ? "×" : "↗"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            key="adama-ai-panel"
            id="adama-ai-panel"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="dialog"
            aria-labelledby="assistant-title"
            className="assistant-panel"
          >
            <header className="assistant-header">
              <span className="assistant-monogram" aria-hidden="true">
                a.
              </span>
              <div>
                <h2 id="assistant-title">Adama AI</h2>
                <p>{AUTOMATED_PROCESSING_SHORT} · ESG & parcours</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Fermer la conversation"
                className="assistant-close"
              >
                ×
              </button>
            </header>
            <div
              ref={listRef}
              className="assistant-messages"
              onScroll={() => {
                const el = listRef.current;
                if (el)
                  stickToBottom.current =
                    el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
            >
              {messages.length === 0 ? (
                <div className="assistant-welcome">
                  <p className="assistant-eyebrow">UNE QUESTION ?</p>
                  <h3>
                    Par où souhaitez-vous
                    <br />
                    <span className="serif">commencer ?</span>
                  </h3>
                  <p>
                    Mon parcours, la CSRD ou le VSME : choisissez un sujet ou
                    posez votre question.
                  </p>
                  <div className="assistant-suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        disabled={busy}
                        onClick={() => ask(s.question)}
                      >
                        {s.label}
                        <span aria-hidden="true">↗</span>
                      </button>
                    ))}
                  </div>
                  <AutomationNotice />
                </div>
              ) : (
                <div
                  role="log"
                  aria-label="Conversation"
                  aria-live="polite"
                  aria-busy={busy}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        "assistant-message " +
                        (message.role === "user"
                          ? "message-user"
                          : "message-answer")
                      }
                    >
                      <p className="message-author">
                        {message.role === "user" ? "Vous" : "Adama AI"}
                      </p>
                      <MessageText parts={message.parts} />
                      <Sources
                        sources={message.parts.flatMap((part) =>
                          part.type === "data-sources" ? part.data : [],
                        )}
                      />
                    </div>
                  ))}
                </div>
              )}
              {status === "submitted" && (
                <p className="assistant-progress" role="status">
                  Recherche dans les documents…
                </p>
              )}
              {error && (
                <p className="assistant-error" role="alert">
                  {messageDErreur(error)}
                </p>
              )}
            </div>
            <form onSubmit={submit} className="assistant-composer">
              <label htmlFor="assistant-question" className="sr-only">
                Votre question pour Adama AI
              </label>
              <input
                id="assistant-question"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez votre question…"
                maxLength={4000}
                autoComplete="off"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={() => void stop()}
                  aria-label="Arrêter la réponse"
                >
                  ■
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Envoyer la question"
                >
                  ↑
                </button>
              )}
            </form>
            <p className="assistant-footnote">
              Vérifiez les sources avant toute décision réglementaire.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

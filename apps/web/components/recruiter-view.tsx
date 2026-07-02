"use client";

// L6-T4 — Mode lecture recruteur (?for=recruiter).
// Layout simplifié, sans animation ni terminal, pensé pour être lu
// vite et imprimé proprement (@media print dans globals.css).

import type { ReactNode } from "react";
import { Badge, Button } from "@adama/ui";
import { captureEvent } from "../lib/analytics";
import {
  CONTACT_EMAIL,
  CV_DOWNLOAD_NAME,
  CV_PATH,
  GITHUB_REPO_URL,
  type DashboardData,
} from "./types";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(
    d.getUTCMonth() + 1,
  ).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="break-inside-avoid border-t border-border pt-4 print:border-neutral-300">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-emerald print:text-neutral-600">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function RecruiterView({ data }: { data: DashboardData }) {
  const byKey = new Map(data.metrics.map((m) => [m.key, m]));
  const focus = byKey.get("current_focus")?.value_text;
  const deadline = byKey.get("internship_deadline")?.value_text;

  const nowItems = data.trajectory.filter((t) => t.status === "now");
  const nextItems = data.trajectory.filter((t) => t.status === "next");
  const decisions = data.decisions.slice(0, 6);
  const commits = data.commits.slice(0, 5);

  return (
    <div className="recruiter-view min-h-dvh bg-background print:bg-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 print:max-w-none print:px-0 print:py-0">
        {/* En-tête */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-faint print:text-neutral-500">
              Adama OS · mode lecture recruteur
            </p>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground print:text-black">
              Adama Diallo — System Architect
            </h1>
            <p className="text-sm leading-relaxed text-muted print:text-neutral-700">
              Profil hybride RSE / ESG × ingénierie. Architecte de Strata
              (CSRD, ESRS, VSME). Ce document est généré depuis mon dashboard
              système public.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <a href={CV_PATH} download={CV_DOWNLOAD_NAME} className="inline-flex">
              <Button variant="primary" size="sm" bracket tabIndex={-1}>
                CV PDF
              </Button>
            </a>
            <Button
              variant="outline"
              size="sm"
              bracket
              onClick={() => {
                captureEvent("recruiter_view_print");
                window.print();
              }}
            >
              Imprimer
            </Button>
          </div>
        </header>

        {/* Coordonnées + statut */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted print:text-neutral-700">
          <span className="print:hidden">
            <Badge variant="emerald" dot>
              open to work
            </Badge>
          </span>
          <span>{CONTACT_EMAIL}</span>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {GITHUB_REPO_URL.replace("https://", "")}
          </a>
          {deadline ? <span>disponible : {deadline}</span> : null}
        </div>

        <main className="mt-8 space-y-6">
          {focus ? (
            <Section title="Focus actuel">
              <p className="font-mono text-sm text-foreground print:text-black">
                {focus}
              </p>
            </Section>
          ) : null}

          <Section title="En cours / à venir">
            <ul className="space-y-1.5">
              {nowItems.map((t) => (
                <li
                  key={t.id}
                  className="font-mono text-sm text-foreground print:text-black"
                >
                  <span className="text-emerald print:text-neutral-500">
                    [now]
                  </span>{" "}
                  {t.title}
                </li>
              ))}
              {nextItems.map((t) => (
                <li
                  key={t.id}
                  className="font-mono text-sm text-muted print:text-neutral-700"
                >
                  <span className="text-faint print:text-neutral-500">
                    [next]
                  </span>{" "}
                  {t.title}
                  {t.eta ? ` — ${t.eta}` : ""}
                </li>
              ))}
              {nowItems.length + nextItems.length === 0 ? (
                <li className="font-mono text-sm text-faint">—</li>
              ) : null}
            </ul>
          </Section>

          <Section title="Décisions récentes (log public)">
            <ul className="space-y-3">
              {decisions.map((d) => (
                <li key={d.id} className="break-inside-avoid">
                  <p className="font-mono text-sm text-foreground print:text-black">
                    {formatDate(d.date)} · {d.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted print:text-neutral-700">
                    {d.reasoning}
                  </p>
                </li>
              ))}
              {decisions.length === 0 ? (
                <li className="font-mono text-sm text-faint">—</li>
              ) : null}
            </ul>
          </Section>

          {data.strata.length > 0 ? (
            <Section title="Strata — métriques produit">
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.strata.map((s) => (
                  <li
                    key={s.metric}
                    className="font-mono text-xs text-muted print:text-neutral-700"
                  >
                    <span className="text-foreground print:text-black">
                      {s.value}
                    </span>{" "}
                    {s.metric}
                    {s.period ? ` (${s.period})` : ""}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {commits.length > 0 ? (
            <Section title="Derniers livrables (GitHub)">
              <ul className="space-y-1.5">
                {commits.map((c) => (
                  <li
                    key={c.sha}
                    className="font-mono text-xs text-muted print:text-neutral-700"
                  >
                    <span className="text-faint">{c.sha.slice(0, 7)}</span>{" "}
                    {c.message}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="Contact">
            <p className="font-mono text-sm text-foreground print:text-black">
              {CONTACT_EMAIL} — réponse sous 24 h. CV joint :{" "}
              {CV_DOWNLOAD_NAME}.
            </p>
          </Section>
        </main>

        <footer className="mt-10 border-t border-border pt-4 print:border-neutral-300">
          <p className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.65rem] text-faint print:text-neutral-500">
            <span>Adama Diallo — System Architect · Strata</span>
            <a
              href="/"
              className="underline-offset-4 hover:underline print:hidden"
            >
              ← version dashboard complète
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

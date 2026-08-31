// Coquille commune des pages légales (L10-T2).
// Même charte que le reste du cockpit : navy, monospace, cartes discrètes.
// Aucune animation : ces pages se lisent, elles ne se regardent pas.
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@adama/ui";
import { LEGAL_UPDATED_AT } from "../lib/legal";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-5">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald">
        {title}
      </h2>
      <div className="mt-3 space-y-3 font-mono text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

export function LegalDefinitionList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[minmax(9rem,auto)_1fr]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
            {item.label}
          </dt>
          <dd className="font-mono text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <header className="mb-8 space-y-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← Adama OS
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <Badge variant="default">maj {LEGAL_UPDATED_AT}</Badge>
          </div>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted">
            {intro}
          </p>
        </header>

        <main className="space-y-6">{children}</main>

        <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo · System Architect
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/mentions-legales"
              className="font-mono text-[0.65rem] text-faint underline-offset-4 transition-colors hover:text-muted hover:underline"
            >
              mentions légales
            </Link>
            <Link
              href="/confidentialite"
              className="font-mono text-[0.65rem] text-faint underline-offset-4 transition-colors hover:text-muted hover:underline"
            >
              confidentialité
            </Link>
            <Link
              href="/"
              className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
            >
              ← dashboard
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

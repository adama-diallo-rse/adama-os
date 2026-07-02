"use client";

// L4-T6, Couche B — Decisions Log.
// Timeline ADR, filtrable par catégorie, lisible.

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@adama/ui";
import type { DecisionRow } from "./types";

const ALL = "toutes";

function formatDateFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em]",
        "cursor-pointer transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-emerald",
        active
          ? "border-transparent bg-[color-mix(in_oklch,var(--color-emerald)_18%,transparent)] text-emerald-bright"
          : "border-border bg-transparent text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function LayerB({ decisions }: { decisions: DecisionRow[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const set = new Set(decisions.map((d) => d.category).filter(Boolean));
    return [ALL, ...Array.from(set).sort()];
  }, [decisions]);

  const visible = useMemo(
    () =>
      category === ALL
        ? decisions
        : decisions.filter((d) => d.category === category),
    [decisions, category],
  );

  return (
    <Card id="couche-b" className="scroll-mt-24">
      <CardHeader className="flex-wrap">
        <CardTitle>Couche B — Decisions Log</CardTitle>
        <Badge variant="outline">ADR</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Filtres par catégorie */}
        {categories.length > 1 ? (
          <div
            role="group"
            aria-label="Filtrer les décisions par catégorie"
            className="flex flex-wrap gap-2"
          >
            {categories.map((c) => (
              <FilterChip
                key={c}
                label={c}
                active={category === c}
                onClick={() => setCategory(c)}
              />
            ))}
          </div>
        ) : null}

        {/* Timeline verticale */}
        {visible.length > 0 ? (
          <ol className="relative space-y-5 border-l border-border pl-5">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((dec) => (
                <motion.li
                  key={dec.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Point de la timeline */}
                  <span
                    aria-hidden
                    className="absolute -left-[1.45rem] top-1.5 size-2 rounded-full bg-emerald shadow-[0_0_8px_0_var(--color-emerald)]"
                  />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
                      {formatDateFr(dec.date)}
                    </p>
                    <Badge variant="default">{dec.category}</Badge>
                  </div>
                  <p className="mt-1 font-medium text-foreground">{dec.title}</p>
                  <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
                    {dec.reasoning}
                  </p>
                  {dec.tags.length > 0 ? (
                    <p className="mt-1.5 font-mono text-[0.65rem] text-faint">
                      {dec.tags.map((t) => `#${t}`).join("  ")}
                    </p>
                  ) : null}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        ) : (
          <p className="font-mono text-sm text-muted">
            Aucune décision publiée pour cette catégorie.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

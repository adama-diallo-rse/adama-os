"use client";

// L4-T7, Couche C — Trajectory.
// Now / Next / Later, avec risques et solutions (notes de mitigation).

import { motion } from "framer-motion";
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@adama/ui";
import type { TrajectoryRow, TrajectoryStatus } from "./types";

const COLUMNS: { status: TrajectoryStatus; label: string }[] = [
  { status: "now", label: "Now" },
  { status: "next", label: "Next" },
  { status: "later", label: "Later" },
];

const STATUS_BADGE: Record<TrajectoryStatus, "emerald" | "warning" | "default"> =
  {
    now: "emerald",
    next: "warning",
    later: "default",
  };

function TrajectoryItem({ item }: { item: TrajectoryRow }) {
  const isRisk = item.type === "risk";
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "rounded-[calc(var(--radius)_-_0.125rem)] border px-3 py-2.5",
        isRisk
          ? "border-[color-mix(in_oklch,var(--color-danger)_45%,transparent)] bg-[color-mix(in_oklch,var(--color-danger)_8%,transparent)]"
          : "border-border bg-surface-raised",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-foreground">{item.title}</p>
        {isRisk ? (
          <Badge variant="danger">risk</Badge>
        ) : item.type === "expansion" ? (
          <Badge variant="outline">exp</Badge>
        ) : null}
      </div>
      {item.eta ? (
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
          ETA {item.eta}
        </p>
      ) : null}
      {isRisk && item.notes ? (
        <p className="mt-1.5 border-l-2 border-emerald-dim pl-2 text-xs leading-relaxed text-muted">
          <span className="font-mono text-emerald">→ solution :</span>{" "}
          {item.notes}
        </p>
      ) : null}
    </motion.li>
  );
}

export function LayerC({ trajectory }: { trajectory: TrajectoryRow[] }) {
  return (
    <Card id="couche-c" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Couche C — Trajectory</CardTitle>
        <Badge variant="outline">Roadmap</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {COLUMNS.map(({ status, label }) => {
            const items = trajectory.filter((t) => t.status === status);
            return (
              <div key={status}>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[status]} dot>
                    {label}
                  </Badge>
                  <span className="font-mono text-[0.65rem] text-faint">
                    {items.length}
                  </span>
                </div>
                {items.length > 0 ? (
                  <ul className="space-y-2.5">
                    {items.map((item) => (
                      <TrajectoryItem key={item.id} item={item} />
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-xs text-faint">— vide —</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

// L4-T7, Couche C, Trajectory. Reprise par la couche C1-T8.
// Now / Next / Later / Livré, avec risques et solutions (notes de mitigation).
//
// Ce qui a changé en C1. Une entrée dont l'échéance est passée ne s'affiche
// plus comme les autres : elle porte la mention « échéance dépassée », en
// clair, jusqu'à ce que quelqu'un tranche. Une roadmap périmée est une donnée
// fausse comme une autre, et la cacher aurait été le pire des trois choix.
// Le statut `done` existe depuis la migration 0003 : ce qui est fini est
// rangé dans une bande à part, sous les trois colonnes, sans les encombrer.
//
// C8-T9. Trois entrées visibles par colonne, au maximum. Le système interne
// peut en porter quarante ; la surface publique en montre trois. Une roadmap
// qui déroule tout ce qu'on aimerait faire ne se lit pas, et elle transforme
// une intention en engagement. Le reste n'est pas caché : le compte réel est
// affiché à côté du libellé de colonne, et la frise d'ingénierie raconte le
// passé, que cette colonne n'a plus à porter.

import { motion } from "framer-motion";
import { Badge, Card, CardContent, CardHeader, CardTitle, cn } from "@adama/ui";
import Link from "next/link";
import type { TrajectoryRow, TrajectoryStatus } from "./types";
import { resolveTrajectory, type TrajectoryView } from "../lib/trajectory";

/** C8-T9 : plafond d'entrees visibles par colonne, sur la surface publique. */
const MAX_PAR_COLONNE = 3;

const COLUMNS: { status: TrajectoryStatus; label: string }[] = [
  { status: "now", label: "Now" },
  { status: "next", label: "Next" },
  { status: "later", label: "Later" },
];

const STATUS_BADGE: Record<
  TrajectoryStatus,
  "emerald" | "warning" | "default"
> = {
  now: "emerald",
  next: "warning",
  later: "default",
  done: "default",
};

function TrajectoryItem({ item }: { item: TrajectoryView }) {
  const isRisk = item.type === "risk";
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      data-overdue={item.overdue ? "true" : undefined}
      className={cn(
        "rounded-[calc(var(--radius)_-_0.125rem)] border px-3 py-2.5",
        isRisk
          ? "border-[color-mix(in_oklch,var(--color-danger)_45%,transparent)] bg-[color-mix(in_oklch,var(--color-danger)_8%,transparent)]"
          : item.overdue
            ? "border-[color-mix(in_oklch,var(--color-warning)_55%,transparent)] bg-[color-mix(in_oklch,var(--color-warning)_8%,transparent)]"
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
      {item.overdue ? (
        <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-warning">
          échéance dépassée, statut à trancher
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
  const vues = resolveTrajectory(trajectory);
  const livrees = vues.filter((v) => v.colonne === "done");
  const enRetard = vues.filter((v) => v.overdue).length;

  return (
    <Card id="couche-c" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Couche C, Trajectory</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Roadmap</Badge>
          {enRetard > 0 ? (
            <Badge variant="warning" dot>
              {enRetard} échéance{enRetard > 1 ? "s" : ""} dépassée
              {enRetard > 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {COLUMNS.map(({ status, label }) => {
            const items = vues.filter((t) => t.colonne === status);
            const visibles = items.slice(0, MAX_PAR_COLONNE);
            const reste = items.length - visibles.length;
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
                {visibles.length > 0 ? (
                  <ul className="space-y-2.5">
                    {visibles.map((item) => (
                      <TrajectoryItem key={item.id} item={item} />
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-xs text-faint">
                    Aucun élément publié.
                  </p>
                )}
                {reste > 0 ? (
                  <p className="mt-2.5 font-mono text-[0.65rem] leading-relaxed text-faint">
                    {reste} autre{reste > 1 ? "s" : ""} entrée
                    {reste > 1 ? "s" : ""} dans cette colonne, non affichée
                    {reste > 1 ? "s" : ""} ici : trois suffisent à dire une
                    direction.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        {livrees.length > 0 ? (
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                Livré
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="font-mono text-[0.6rem] text-faint">
                {livrees.length}
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {livrees.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-2.5 py-1.5 font-mono text-[0.65rem] text-muted"
                >
                  {item.title}
                  {item.eta ? (
                    <span className="text-faint"> · {item.eta}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="mt-5 border-t border-border pt-4 font-mono text-[0.65rem] leading-relaxed text-faint">
          Cette colonne dit où je vais.{" "}
          <Link
            href="/journal#frise"
            className="text-emerald transition-colors hover:text-emerald-bright"
          >
            La frise d&apos;ingénierie
          </Link>{" "}
          dit d&apos;où je viens, décision par décision.
        </p>
      </CardContent>
    </Card>
  );
}

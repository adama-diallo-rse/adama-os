"use client";

// L4-T5, Couche A — System Status.
// Statut, focus courant, compte à rebours live vers le 31 octobre,
// barre lean bulk vers 80 kg, protocole minimaliste.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@adama/ui";
import {
  DEFAULT_DEADLINE_ISO,
  DEFAULT_TARGET_WEIGHT,
  type MetricRow,
} from "./types";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function computeCountdown(targetMs: number): Countdown {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

/** Compte à rebours live (tick chaque seconde), sûr côté hydratation. */
function useCountdown(targetIso: string): Countdown | null {
  const [value, setValue] = useState<Countdown | null>(null);

  useEffect(() => {
    const targetMs = new Date(targetIso).getTime();
    if (Number.isNaN(targetMs)) {
      return;
    }
    setValue(computeCountdown(targetMs));
    const id = setInterval(() => setValue(computeCountdown(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return value;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function CountdownCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-2 py-2 sm:px-3">
      <span className="font-mono text-xl font-semibold tabular-nums text-emerald-bright sm:text-2xl">
        {value}
      </span>
      <span className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-faint">
        {label}
      </span>
    </div>
  );
}

function ProtocolRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5 last:border-b-0 last:pb-0">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </span>
      <span className="text-right font-mono text-sm text-foreground">{value}</span>
    </li>
  );
}

export function LayerA({ metrics }: { metrics: MetricRow[] }) {
  const byKey = new Map(metrics.map((m) => [m.key, m]));
  const txt = (k: string, fallback: string) =>
    byKey.get(k)?.value_text ?? fallback;
  const num = (k: string) => byKey.get(k)?.value_num ?? null;

  const systemStatus = txt("system_status", "ONLINE - BUILDING MODE");
  const online = !systemStatus.toUpperCase().includes("OFFLINE");
  const buildLabel = systemStatus.toUpperCase().includes("SHIPPING")
    ? "Shipping"
    : online
      ? "Building"
      : "Rest";

  const deadlineIso = txt("internship_deadline", DEFAULT_DEADLINE_ISO);
  const countdown = useCountdown(deadlineIso);

  // Lean bulk : priorité au poids réel, sinon pourcentage direct.
  const targetWeight = num("target_weight") ?? DEFAULT_TARGET_WEIGHT;
  const currentWeight = num("current_weight");
  const rawProgress =
    currentWeight !== null && targetWeight > 0
      ? (currentWeight / targetWeight) * 100
      : (num("lean_bulk_progress") ?? 0);
  const progress = Math.max(0, Math.min(100, rawProgress));
  const weightLabel =
    currentWeight !== null
      ? `${currentWeight} kg / ${targetWeight} kg`
      : `${Math.round(progress)}% de ${targetWeight} kg`;

  return (
    <Card id="couche-a" className="h-full scroll-mt-24">
      <CardHeader>
        <CardTitle>Couche A — System Status</CardTitle>
        <Badge variant={online ? "emerald" : "default"} dot>
          {buildLabel}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Focus courant */}
        <div className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Current Focus
          </p>
          <p className="mt-1.5 font-mono text-base text-foreground">
            {txt("current_focus", "n/a")}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            <span className="text-emerald">$</span> status --live
          </p>
        </div>

        {/* Compte à rebours live vers le 31 octobre */}
        <div>
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Deadline Stage — 31 octobre
          </p>
          <div className="grid grid-cols-4 gap-2">
            <CountdownCell
              value={countdown ? String(countdown.days) : "--"}
              label="jours"
            />
            <CountdownCell
              value={countdown ? pad(countdown.hours) : "--"}
              label="hrs"
            />
            <CountdownCell
              value={countdown ? pad(countdown.minutes) : "--"}
              label="min"
            />
            <CountdownCell
              value={countdown ? pad(countdown.seconds) : "--"}
              label="sec"
            />
          </div>
        </div>

        {/* Barre lean bulk vers 80 kg */}
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
              Lean Bulk
            </p>
            <p className="font-mono text-xs text-emerald-bright">{weightLabel}</p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Lean bulk, objectif ${targetWeight} kg`}
            className="h-2.5 overflow-hidden rounded-full border border-border bg-surface-raised"
          >
            <motion.div
              className="h-full rounded-full bg-emerald"
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 1.1,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2,
              }}
            />
          </div>
          <p className="mt-1.5 font-mono text-[0.65rem] text-faint">
            objectif : 80 kg
          </p>
        </div>

        {/* Protocole minimaliste */}
        <div>
          <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Protocole Minimaliste
          </p>
          <ul className="space-y-1.5">
            <ProtocolRow label="Deep Work" value={txt("deep_work_status", "n/a")} />
            <ProtocolRow label="Energy" value={txt("energy_level", "n/a")} />
            <ProtocolRow
              label="Social Media"
              value={txt("social_media_status", "n/a")}
            />
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

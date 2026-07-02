"use client";

// L4-T8, Couche D — Sandbox.
// Zone preuve sociale (AFEV, Ministère) et métriques STRATA (Open Metrics).

import { Badge, Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@adama/ui";
import { AnimatedNumber } from "./animated-number";
import { CONTACT_EMAIL, CV_PATH, type StrataMetricRow } from "./types";

// Métriques affichées par défaut si la table strata_analytics est vide.
const FALLBACK_METRICS: StrataMetricRow[] = [
  { metric: "audits_vsme", value: 12, period: "beta" },
  { metric: "docs_rag", value: 340, period: "corpus" },
  { metric: "uptime_pct", value: 99.9, period: "30j" },
];

const METRIC_LABELS: Record<string, string> = {
  audits_vsme: "Audits VSME",
  docs_rag: "Docs RAG",
  uptime_pct: "Uptime",
  users: "Utilisateurs",
  reports: "Rapports",
  leads: "Leads",
};

function metricLabel(key: string): string {
  return (
    METRIC_LABELS[key] ??
    key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}

function ProofTile({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex flex-col justify-center rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3 transition-colors duration-150 hover:border-border-strong">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
        {name}
      </p>
      <p className="mt-0.5 font-mono text-[0.65rem] text-faint">{role}</p>
    </div>
  );
}

export function LayerD({ strata }: { strata: StrataMetricRow[] }) {
  const rows = strata.length > 0 ? strata.slice(0, 6) : FALLBACK_METRICS;

  return (
    <Card id="couche-d" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Couche D — Sandbox</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">VSME</Badge>
          <Badge variant="warning">Beta</Badge>
          <Badge variant="default">CSRD</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Preuve sociale */}
        <div>
          <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Ils m&apos;ont fait confiance
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ProofTile name="AFEV" role="Engagement, mentorat étudiant" />
            <ProofTile
              name="Ministère"
              role="Éducation nationale, mission service civique"
            />
          </div>
          <p className="mt-3 font-mono text-xs text-muted">
            <span className="text-emerald">$</span> ping strata
            <span className="text-faint"> — moteur RSE / ESG / CSRD en beta</span>
          </p>
        </div>

        {/* Métriques STRATA */}
        <div>
          <p className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            STRATA — Open Metrics
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {rows.map((row) => (
              <div
                key={row.metric}
                className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-2.5"
              >
                <AnimatedNumber
                  value={row.value}
                  decimals={Number.isInteger(row.value) ? 0 : 1}
                  suffix={row.metric.endsWith("_pct") ? "%" : ""}
                  className="font-mono text-lg font-semibold tabular-nums text-emerald-bright"
                />
                <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-faint">
                  {metricLabel(row.metric)}
                  {row.period ? ` · ${row.period}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <a href={CV_PATH} download="Adama-Diallo-CV.pdf" className="inline-flex">
          <Button size="sm" tabIndex={-1}>
            Download CV
          </Button>
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Prise de contact, Adama OS",
          )}`}
          className="inline-flex"
        >
          <Button variant="outline" size="sm" tabIndex={-1}>
            Book call
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}

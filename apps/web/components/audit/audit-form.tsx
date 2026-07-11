"use client";

// L6-T8 — Formulaire d'Audit Express (client). Poste sur /api/audit, affiche le
// mini-rapport carbone renvoyé par le moteur. Tous les champs d'activité sont
// optionnels : plus on renseigne, plus le bilan est précis. Capture l'intention
// via PostHog (gaté par le consentement).

import { useState, type FormEvent } from "react";
import { Button } from "@adama/ui";
import { captureEvent } from "../../lib/analytics";

type CarbonReport = {
  scope1_t: number;
  scope2_t: number;
  scope3_t: number;
  total_t: number;
  breakdown_pct: Record<string, number>;
  intensity_per_employee_t?: number | null;
  intensity_kg_per_eur?: number | null;
};

type Report = {
  company: string;
  carbon: CarbonReport;
  recommendations: string[];
};

type State = "idle" | "sending" | "done" | "error";

const SECTORS = [
  { value: "", label: "Secteur (optionnel)" },
  { value: "services", label: "Services" },
  { value: "industrie", label: "Industrie" },
  { value: "commerce", label: "Commerce" },
  { value: "construction", label: "Construction" },
];

const FIELDS: { name: string; label: string; placeholder: string }[] = [
  { name: "employees", label: "Effectif", placeholder: "ex. 25" },
  { name: "diesel_l", label: "Gazole (L/an)", placeholder: "ex. 1200" },
  { name: "gaz_naturel_kwh", label: "Gaz naturel (kWh/an)", placeholder: "ex. 15000" },
  { name: "electricite_fr_kwh", label: "Électricité (kWh/an)", placeholder: "ex. 25000" },
  { name: "purchases_eur", label: "Achats (€/an)", placeholder: "ex. 400000" },
  { name: "voiture_km", label: "Voiture (km/an)", placeholder: "ex. 15000" },
  { name: "avion_km", label: "Avion (km/an)", placeholder: "ex. 8000" },
];

const inputClass =
  "h-9 w-full rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface px-3 font-mono text-sm text-foreground outline-none placeholder:text-faint focus:border-emerald";

export function AuditForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {};
    form.forEach((v, k) => {
      payload[k] = typeof v === "string" ? v.trim() : v;
    });

    setState("sending");
    setError("");
    captureEvent("audit_submitted", {
      sector: typeof payload.sector === "string" ? payload.sector : null,
    });

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { report?: Report; error?: string };
      if (!res.ok || !data.report) {
        setError(data.error ?? "Une erreur est survenue. Réessayez.");
        setState("error");
        return;
      }
      setReport(data.report);
      setState("done");
    } catch {
      setError("Réseau indisponible. Réessayez dans un instant.");
      setState("error");
    }
  }

  if (state === "done" && report) {
    return <AuditResult report={report} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          type="email"
          name="email"
          required
          placeholder="Email professionnel"
          aria-label="Email professionnel"
          className={inputClass}
        />
        <input
          type="text"
          name="company"
          required
          placeholder="Nom de l'entreprise"
          aria-label="Nom de l'entreprise"
          className={inputClass}
        />
        <select name="sector" aria-label="Secteur" className={inputClass}>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {FIELDS.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
              {f.label}
            </span>
            <input
              type="number"
              name={f.name}
              min="0"
              step="any"
              inputMode="decimal"
              placeholder={f.placeholder}
              aria-label={f.label}
              className={inputClass}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" size="md" bracket disabled={state === "sending"}>
          {state === "sending" ? "analyse..." : "Lancer l'audit"}
        </Button>
        <span className="font-mono text-[0.65rem] text-faint">
          Gratuit. Résultat immédiat. Aucune donnée vendue.
        </span>
      </div>

      {state === "error" ? (
        <p role="alert" className="font-mono text-xs text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n);
}

function AuditResult({ report }: { report: Report }) {
  const c = report.carbon;
  const rows: { label: string; value: string }[] = [
    { label: "Scope 1", value: `${fmt(c.scope1_t)} t` },
    { label: "Scope 2", value: `${fmt(c.scope2_t)} t` },
    { label: "Scope 3", value: `${fmt(c.scope3_t)} t` },
    { label: "Total", value: `${fmt(c.total_t)} t CO₂e` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-emerald">
          Mini-rapport
        </p>
        <h3 className="font-mono text-lg font-semibold text-foreground">
          {report.company}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-3 py-3"
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
              {r.label}
            </p>
            <p className="mt-1 font-mono text-base font-semibold text-foreground">
              {r.value}
            </p>
          </div>
        ))}
      </div>

      {c.intensity_per_employee_t != null || c.intensity_kg_per_eur != null ? (
        <p className="font-mono text-xs text-muted">
          {c.intensity_per_employee_t != null
            ? `Intensité : ${fmt(c.intensity_per_employee_t)} t CO₂e / employé. `
            : ""}
          {c.intensity_kg_per_eur != null
            ? `${fmt(c.intensity_kg_per_eur)} kg CO₂e / € de CA.`
            : ""}
        </p>
      ) : null}

      {report.recommendations.length > 0 ? (
        <div className="space-y-2">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
            Recommandations
          </p>
          <ul className="space-y-1.5">
            {report.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex gap-2 font-mono text-xs leading-relaxed text-muted"
              >
                <span aria-hidden className="text-emerald">
                  →
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-[calc(var(--radius)_-_0.25rem)] border border-emerald/40 bg-emerald/10 px-4 py-3">
        <p className="font-mono text-xs leading-relaxed text-emerald-bright">
          Ce mini-rapport est une estimation express. Pour un reporting complet,
          conforme et auditable, STRATA automatise l&apos;ensemble.
        </p>
      </div>
    </div>
  );
}

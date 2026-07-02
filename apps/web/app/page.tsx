import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adama/ui";
import { createPublicClient } from "../lib/supabase/public";

// Dashboard public branché en live sur les données Supabase (Couches A/B/C).
// Lecture via la clé anon + RLS. Si Supabase est indisponible, on retombe sur
// des valeurs par défaut pour que la vitrine ne casse jamais.
export const dynamic = "force-dynamic";

// Adresse de contact pour les CTA (recrutement, prise de rendez-vous).
const CONTACT_EMAIL = "diadamflow@gmail.com";

type MetricRow = {
  key: string;
  value_num: number | null;
  value_text: string | null;
  unit: string | null;
};
type DecisionRow = {
  title: string;
  date: string;
  reasoning: string;
};
type TrajectoryRowData = {
  title: string;
  status: "now" | "next" | "later";
};

const RANK: Record<string, number> = { now: 0, next: 1, later: 2 };

function joursRestants(dateIso: string | null): number {
  const cible = dateIso ? new Date(dateIso) : new Date("2026-10-31T00:00:00Z");
  const diff = cible.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

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

async function chargerDonnees() {
  const supabase = createPublicClient();
  if (!supabase) {
    return { metrics: [], decisions: [], trajectory: [] };
  }

  const [m, d, t] = await Promise.all([
    supabase
      .from("system_metrics")
      .select("key, value_num, value_text, unit"),
    supabase
      .from("decisions_log")
      .select("title, date, reasoning")
      .eq("is_published", true)
      .order("date", { ascending: false })
      .limit(3),
    supabase.from("trajectory").select("title, status").limit(20),
  ]);

  const trajectory = ((t.data as TrajectoryRowData[]) ?? []).sort(
    (a, b) => (RANK[a.status] ?? 99) - (RANK[b.status] ?? 99),
  );

  return {
    metrics: (m.data as MetricRow[]) ?? [],
    decisions: (d.data as DecisionRow[]) ?? [],
    trajectory,
  };
}

export default async function Home() {
  const { metrics, decisions, trajectory } = await chargerDonnees();

  const byKey = new Map(metrics.map((x) => [x.key, x]));
  const txt = (k: string, fallback: string) =>
    byKey.get(k)?.value_text ?? fallback;
  const num = (k: string) => byKey.get(k)?.value_num ?? null;

  const jours = joursRestants(byKey.get("internship_deadline")?.value_text ?? null);
  const leanBulk = num("lean_bulk_progress");
  const targetWeight = num("target_weight");
  const leanBulkLabel =
    leanBulk !== null && targetWeight !== null
      ? `${leanBulk}% / ${targetWeight} kg`
      : leanBulk !== null
        ? `${leanBulk}%`
        : "n/a";

  const systemStatus = txt("system_status", "ONLINE - BUILDING MODE");
  const online = !systemStatus.toUpperCase().includes("OFFLINE");
  const buildLabel = systemStatus.toUpperCase().includes("SHIPPING")
    ? "Shipping"
    : systemStatus.toUpperCase().includes("OFFLINE")
      ? "Rest"
      : "Building";

  const decisionsAffichees = decisions.slice(0, 2);
  const trajectoireAffichee =
    trajectory.length > 0
      ? trajectory.slice(0, 4)
      : [
          { title: "Design system dark mode", status: "now" as const },
          { title: "Couche A/B/C live", status: "next" as const },
          { title: "Pipeline RAG adama.ai", status: "later" as const },
        ];

  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {/* En-tête */}
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-faint">
              Adama OS
            </p>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              System Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={online ? "emerald" : "default"} dot>
              {online ? "Online" : "Offline"}
            </Badge>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "Recrutement, Architecte Adama OS",
              )}`}
              className="inline-flex"
            >
              <Button variant="outline" size="sm" bracket tabIndex={-1}>
                Recruter l&apos;Architecte
              </Button>
            </a>
          </div>
        </header>

        {/* Grille du dashboard */}
        <main className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Couche A, System Status, large */}
          <Card className="md:col-span-2 xl:col-span-2">
            <CardHeader>
              <CardTitle>Couche A — System Status</CardTitle>
              <Badge variant={online ? "emerald" : "default"} dot>
                {buildLabel}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric label="Current Focus" value={txt("current_focus", "n/a")} />
              <Metric label="Deadline Stage" value={`${jours} jours`} accent />
              <Metric label="Deep Work" value={txt("deep_work_status", "n/a")} />
              <Metric label="Lean Bulk" value={leanBulkLabel} />
              <Metric label="Energy" value={txt("energy_level", "n/a")} />
              <Metric label="Social Media" value={txt("social_media_status", "n/a")} />
            </CardContent>
          </Card>

          {/* Couche C, Trajectory */}
          <Card>
            <CardHeader>
              <CardTitle>Couche C — Trajectory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {trajectoireAffichee.map((row) => (
                <TrajectoryRow
                  key={row.title}
                  status={row.status}
                  label={row.title}
                />
              ))}
            </CardContent>
          </Card>

          {/* Couche B, Decisions Log */}
          <Card id="couche-b" className="md:col-span-2">
            <CardHeader>
              <CardTitle>Couche B — Decisions Log</CardTitle>
              <Badge variant="outline">ADR</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {decisionsAffichees.length > 0 ? (
                decisionsAffichees.map((dec) => (
                  <Decision
                    key={dec.title}
                    date={formatDateFr(dec.date)}
                    title={dec.title}
                    reason={dec.reasoning}
                  />
                ))
              ) : (
                <p className="font-mono text-sm text-muted">
                  Aucune décision publiée pour le moment.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <a href="#couche-b" className="inline-flex">
                <Button variant="ghost" size="sm" tabIndex={-1}>
                  Voir tout
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Couche D, Sandbox */}
          <Card>
            <CardHeader>
              <CardTitle>Couche D — Sandbox</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-sm text-muted">
                <span className="text-emerald">$</span> ping strata
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="emerald">VSME</Badge>
                <Badge variant="warning">Beta</Badge>
                <Badge variant="default">CSRD</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <a
                href="/adama-diallo-cv.pdf"
                download="Adama-Diallo-CV.pdf"
                className="inline-flex"
              >
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
        </main>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-2.5">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-base ${
          accent ? "text-emerald-bright" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TrajectoryRow({
  status,
  label,
}: {
  status: "now" | "next" | "later";
  label: string;
}) {
  const variant =
    status === "now" ? "emerald" : status === "next" ? "warning" : "default";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <Badge variant={variant}>{status}</Badge>
    </div>
  );
}

function Decision({
  date,
  title,
  reason,
}: {
  date: string;
  title: string;
  reason: string;
}) {
  return (
    <div className="border-l-2 border-emerald-dim pl-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
        {date}
      </p>
      <p className="mt-0.5 font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{reason}</p>
    </div>
  );
}

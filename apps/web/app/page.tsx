import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@adama/ui";

const DEADLINE = new Date("2026-10-31T00:00:00Z");

function joursRestants(): number {
  const maintenant = new Date();
  const diff = DEADLINE.getTime() - maintenant.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function Home() {
  const jours = joursRestants();

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
            <Badge variant="emerald" dot>
              Online
            </Badge>
            <Button variant="outline" size="sm" bracket>
              Recruter l&apos;Architecte
            </Button>
          </div>
        </header>

        {/* Grille du dashboard */}
        <main className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Couche A, System Status, large */}
          <Card className="md:col-span-2 xl:col-span-2">
            <CardHeader>
              <CardTitle>Couche A — System Status</CardTitle>
              <Badge variant="emerald" dot>
                Building
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric label="Current Focus" value="Design System" />
              <Metric label="Deadline Stage" value={`${jours} jours`} accent />
              <Metric label="Deep Work" value="Active" />
              <Metric label="Lean Bulk" value="72% / 80 kg" />
              <Metric label="Energy" value="Optimal" />
              <Metric label="Social Media" value="Locked" />
            </CardContent>
          </Card>

          {/* Couche C, Trajectory */}
          <Card>
            <CardHeader>
              <CardTitle>Couche C — Trajectory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <TrajectoryRow status="now" label="Design system dark mode" />
              <TrajectoryRow status="next" label="Couche A/B/C live" />
              <TrajectoryRow status="later" label="Pipeline RAG adama.ai" />
            </CardContent>
          </Card>

          {/* Couche B, Decisions Log */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Couche B — Decisions Log</CardTitle>
              <Badge variant="outline">ADR</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <Decision
                date="24 Juin 2026"
                title="Node.js → FastAPI"
                reason="Écosystème Python supérieur pour les calculs carbone Scopes 1-2-3."
              />
              <Decision
                date="15 Juin 2026"
                title="RAG vs Fine-tuning"
                reason="Zéro hallucination sur les textes de loi, coûts API réduits de 80%."
              />
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
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
              <Button size="sm">Download CV</Button>
              <Button variant="outline" size="sm">
                Book call
              </Button>
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

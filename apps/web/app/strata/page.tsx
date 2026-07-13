import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent } from "@adama/ui";

// Hub STRATA. Adama OS est l'atelier du fondateur : il ne re-heberge aucun
// produit, il pointe vers les vrais. Ce qui est en ligne s'ouvre directement
// (ESG Optimizer, STRATA Scope). Ce qui n'est pas encore lance porte son statut
// reel. Source de verite : le site corporate STRATA (contenu produits juillet
// 2026). Server component, indexable, sans aucune dependance externe.
export const metadata: Metadata = {
  title: "STRATA — La suite ESG pour PME",
  description:
    "STRATA construit le systeme d'exploitation de l'entreprise durable : audit CSRD, bilan carbone, veille reglementaire, formation. Adama OS suit la construction en public.",
  alternates: { canonical: "/strata" },
};

type Status = "live" | "soon" | "roadmap";

type Product = {
  name: string;
  pillar: string;
  body: string;
  status: Status;
  eta: string;
  href?: string;
};

const PRODUCTS: Product[] = [
  {
    name: "ESG Optimizer",
    pillar: "Audit & Conformite CSRD",
    body: "Deposez vos documents, obtenez un scoring sur les 10 standards ESRS et un rapport structure. Le produit phare, en ligne.",
    status: "live",
    eta: "Disponible",
    href: "https://esg-optimizer.fr",
  },
  {
    name: "STRATA Scope",
    pillar: "Empreinte carbone",
    body: "Calculateur de bilan carbone Scopes 1, 2 et 3 branche sur les facteurs officiels de la Base Empreinte ADEME. Restitution BEGES, CSRD, SBTi.",
    status: "live",
    eta: "Disponible",
    href: "https://scope.esg-optimizer.fr",
  },
  {
    name: "STRATA Foundation",
    pillar: "Point de depart ESG",
    body: "Un premier diagnostic de maturite durable, gratuit, pour se situer en dix minutes avant d'aller plus loin.",
    status: "soon",
    eta: "Q3 2026",
  },
  {
    name: "STRATA Watch",
    pillar: "Veille reglementaire",
    body: "Veille automatisee sur les sources officielles (EFRAG, AMF, JOUE) qui transforme le bruit reglementaire en alertes utiles.",
    status: "soon",
    eta: "Q3 2026",
  },
  {
    name: "STRATA Academy",
    pillar: "Formation a la durabilite",
    body: "Des parcours courts et concrets sur la CSRD, la VSME et le carbone, penses pour les equipes de PME, pas pour les experts.",
    status: "soon",
    eta: "Q4 2026",
  },
  {
    name: "STRATA Due",
    pillar: "Due diligence ESG",
    body: "Evaluez le profil de durabilite d'une cible d'acquisition avec la rigueur attendue par les investisseurs.",
    status: "roadmap",
    eta: "2027",
  },
  {
    name: "STRATA Taxonomy",
    pillar: "Taxonomie europeenne",
    body: "Mesurez l'alignement de votre chiffre d'affaires et de vos investissements avec la Taxonomie europeenne.",
    status: "roadmap",
    eta: "2027",
  },
  {
    name: "GreenHR",
    pillar: "Pilier social",
    body: "Le module dedie au pilier social de l'ESG : diversite, conditions de travail, formation, chaine de valeur humaine.",
    status: "roadmap",
    eta: "2027",
  },
];

const STATUS_BADGE: Record<Status, { label: string; variant: "emerald" | "warning" | "default" }> = {
  live: { label: "Disponible", variant: "emerald" },
  soon: { label: "A venir", variant: "warning" },
  roadmap: { label: "Roadmap", variant: "default" },
};

function ProductTile({ p }: { p: Product }) {
  const badge = STATUS_BADGE[p.status];
  const inner = (
    <Card className={p.href ? "h-full transition-colors hover:border-emerald/60" : "h-full"}>
      <CardContent className="flex h-full flex-col py-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-emerald">
            {p.pillar}
          </p>
          <Badge variant={badge.variant} dot={p.status === "live"}>
            {badge.label}
          </Badge>
        </div>
        <h3 className="font-mono text-sm font-semibold text-foreground">{p.name}</h3>
        <p className="mt-1.5 flex-1 font-mono text-xs leading-relaxed text-muted">
          {p.body}
        </p>
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
          {p.href ? (
            <span className="text-emerald">ouvrir le produit →</span>
          ) : (
            <span>{p.eta}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );

  if (p.href) {
    return (
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export default function StrataPage() {
  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        {/* En-tete */}
        <header className="mb-10 space-y-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← Adama OS
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              STRATA
            </h1>
            <Badge variant="emerald" dot>
              live
            </Badge>
          </div>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
            Le systeme d&apos;exploitation de l&apos;entreprise durable. Une suite
            d&apos;outils qui rend le reporting de durabilite accessible aux PME
            europeennes.{" "}
            <span className="text-foreground">ESG Optimizer</span> et{" "}
            <span className="text-foreground">STRATA Scope</span> sont en ligne ;
            les suivants arrivent. Adama OS est l&apos;atelier qui documente cette
            construction en public.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://esg-optimizer.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] bg-emerald px-5 font-mono text-sm font-medium uppercase tracking-[0.12em] text-emerald-foreground transition-colors hover:bg-emerald-bright"
            >
              Essayer ESG Optimizer
            </a>
            <Link
              href="/metrics"
              className="font-mono text-xs text-faint underline-offset-4 transition-colors hover:text-emerald-bright hover:underline"
            >
              ou voir les metriques produit →
            </Link>
          </div>
        </header>

        {/* La suite */}
        <section className="mb-12">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            La suite STRATA
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PRODUCTS.map((p) => (
              <ProductTile key={p.name} p={p} />
            ))}
          </div>
        </section>

        {/* Note transparence */}
        <section className="mb-10">
          <Card>
            <CardContent className="space-y-3 py-5">
              <p className="font-mono text-sm leading-relaxed text-muted">
                STRATA n&apos;est pas une promesse : les produits en ligne
                s&apos;utilisent aujourd&apos;hui, et les metriques d&apos;usage
                sont <span className="text-foreground">publiques</span> sur{" "}
                <Link
                  href="/metrics"
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  /metrics
                </Link>
                . Le reste de la suite se construit produit apres produit.
              </p>
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo · System Architect · STRATA
          </p>
          <Link
            href="/"
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← retour au dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}

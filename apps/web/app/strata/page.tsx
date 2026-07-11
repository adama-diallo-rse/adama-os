import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Card, CardContent } from "@adama/ui";
import { CONTACT_EMAIL } from "../../components/types";

// L6-T7 — Landing STRATA : la vitrine du produit de reporting ESG.
// Server component (indexable, SEO). Aucune dépendance à une config externe :
// les CTA pointent vers /api/trial (essai, L6-T9), /audit (lead magnet, L6-T8)
// et la prise de RDV (Cal.com si configuré, sinon mailto). La page reste
// entièrement fonctionnelle sans aucune clé.
export const metadata: Metadata = {
  title: "STRATA — Reporting de durabilité automatisé pour PME",
  description:
    "STRATA transforme vos données en reporting CSRD, VSME et bilan carbone conforme. Double matérialité, Scopes 1-2-3, taxonomie UE : un pipeline automatisé, auditable, pensé pour les PME européennes.",
  alternates: { canonical: "/strata" },
};

const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK?.trim() ?? "";
const RDV_HREF = CAL_LINK
  ? `https://cal.com/${CAL_LINK}`
  : `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Démo STRATA")}`;

type Module = { code: string; title: string; body: string };

const MODULES: Module[] = [
  {
    code: "CSRD / ESRS",
    title: "Rapport de durabilité",
    body: "Structure ESRS transverses et thématiques, points de données tracés jusqu'à la source. Prêt pour l'audit.",
  },
  {
    code: "VSME",
    title: "Standard volontaire PME",
    body: "Le Module de Base VSME de l'EFRAG, proportionné aux PME hors périmètre CSRD obligatoire.",
  },
  {
    code: "GHG",
    title: "Bilan carbone Scopes 1-2-3",
    body: "Émissions directes, énergie et chaîne de valeur selon le GHG Protocol, avec intensités par employé et par euro.",
  },
  {
    code: "Double matérialité",
    title: "Matrice d'impact & financière",
    body: "Notation des enjeux, seuil paramétrable, quadrant de double matérialité et priorisation automatique.",
  },
  {
    code: "Taxonomie UE",
    title: "Éligibilité & alignement",
    body: "Cartographie des activités et des critères techniques, pour relier reporting et accès au financement vert.",
  },
  {
    code: "Open Metrics",
    title: "Transparence produit",
    body: "Les métriques d'usage de STRATA sont publiques et vérifiables, pas des promesses marketing.",
  },
];

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Connecter les données",
    body: "Consommations, achats, déplacements, effectifs : les points de collecte sont cartographiés une fois.",
  },
  {
    n: "02",
    title: "Calculer & positionner",
    body: "Le moteur calcule le bilan carbone et la matrice de matérialité de façon déterministe et reproductible.",
  },
  {
    n: "03",
    title: "Produire le rapport",
    body: "Le rapport ESRS / VSME est généré, traçable jusqu'à la donnée brute, prêt à être partagé ou audité.",
  },
];

function CtaLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] px-5 font-mono text-sm font-medium uppercase tracking-[0.12em] transition-colors";
  const style = primary
    ? "bg-emerald text-emerald-foreground hover:bg-emerald-bright"
    : "border border-border-strong text-foreground hover:border-emerald hover:text-emerald-bright";
  return (
    <Link href={href} className={`${base} ${style}`}>
      {children}
    </Link>
  );
}

export default function StrataPage() {
  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        {/* En-tête */}
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
              beta
            </Badge>
          </div>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
            Le reporting de durabilité, automatisé de bout en bout. De la donnée
            brute au rapport <span className="text-foreground">CSRD</span>,{" "}
            <span className="text-foreground">VSME</span> ou{" "}
            <span className="text-foreground">bilan carbone</span> conforme,
            traçable et auditable. Conçu pour les PME européennes.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <CtaLink href="/api/trial" primary>
              Démarrer l&apos;essai gratuit
            </CtaLink>
            <CtaLink href="/audit">Audit Express gratuit</CtaLink>
            <a
              href={RDV_HREF}
              className="font-mono text-xs text-faint underline-offset-4 transition-colors hover:text-emerald-bright hover:underline"
            >
              ou planifier une démo →
            </a>
          </div>
        </header>

        {/* Aperçu de rapport (capture stylisée, pas d'image externe) */}
        <section className="mb-12">
          <Card className="glow-emerald overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span aria-hidden className="font-mono text-xs text-emerald">
                  $
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
                  strata report --company &quot;PME SAS&quot; --year 2026
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                {[
                  { label: "Scope 1+2+3", value: "412 t", sub: "CO₂e / an" },
                  { label: "Intensité", value: "9,1 t", sub: "par employé" },
                  { label: "Enjeux matériels", value: "5", sub: "double matérialité" },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-4 py-4"
                  >
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                      {k.label}
                    </p>
                    <p className="mt-1.5 font-mono text-2xl font-semibold text-foreground">
                      {k.value}
                    </p>
                    <p className="font-mono text-[0.65rem] text-muted">{k.sub}</p>
                  </div>
                ))}
              </div>
              <p className="border-t border-border px-5 py-3 font-mono text-[0.65rem] text-faint">
                Exemple illustratif. Les vraies métriques produit sont publiques
                sur{" "}
                <Link
                  href="/metrics"
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  /metrics
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Modules de reporting */}
        <section className="mb-12">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            Modules de reporting
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODULES.map((m) => (
              <Card key={m.code} className="transition-colors hover:border-emerald/60">
                <CardContent className="py-4">
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-emerald">
                    {m.code}
                  </p>
                  <h3 className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 font-mono text-xs leading-relaxed text-muted">
                    {m.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <section className="mb-12">
          <h2 className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
            Comment ça marche
          </h2>
          <ol className="space-y-3">
            {STEPS.map((s) => (
              <li key={s.n}>
                <Card>
                  <CardContent className="flex items-start gap-4 py-4">
                    <span className="font-mono text-lg font-semibold text-emerald">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-mono text-sm font-semibold text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs leading-relaxed text-muted">
                        {s.body}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        {/* Valeur / preuve */}
        <section className="mb-12">
          <Card>
            <CardContent className="space-y-3 py-5">
              <p className="font-mono text-sm leading-relaxed text-muted">
                STRATA n&apos;est pas une promesse : le calcul est{" "}
                <span className="text-foreground">déterministe</span>, les
                données sont <span className="text-foreground">traçables</span>{" "}
                jusqu&apos;à la source, et les métriques produit sont{" "}
                <span className="text-foreground">publiques</span>. Le même
                moteur alimente l&apos;
                <Link
                  href="/audit"
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  Audit Express
                </Link>{" "}
                gratuit et les{" "}
                <Link
                  href="/learn"
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  formations
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>

        {/* CTA final */}
        <section className="mb-10">
          <div className="flex flex-col items-start gap-4 rounded-[var(--radius)] border border-border-strong bg-surface-raised px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-sm font-semibold text-foreground">
                Prêt à produire votre premier rapport ?
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                Essai gratuit, sans engagement. Ou commencez par l&apos;audit.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CtaLink href="/api/trial" primary>
                Essai gratuit
              </CtaLink>
              <CtaLink href="/audit">Audit Express</CtaLink>
            </div>
          </div>
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

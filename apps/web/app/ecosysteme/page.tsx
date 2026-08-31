import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent } from "@adama/ui";
import { OutboundLink } from "../../components/outbound-link";
import { LegalFooterLinks } from "../../components/legal-links";
import type {
  EcosystemProductRow,
  EcosystemStatus,
} from "../../components/types";
import { createPublicClient } from "../../lib/supabase/public";
import { SITE_URL, absoluteUrl } from "../../lib/site";

// L6-T13, hub écosystème. Remplace /strata, redirigé en 301 (next.config.ts).
//
// Adama OS est l'atelier du fondateur : il ne ré-héberge aucun produit, il
// pointe vers les vrais. La grille est lue depuis ecosystem_products, jamais
// écrite en dur : un produit qui n'existe pas ne peut pas apparaître ici, et
// un lien cliquable n'existe que pour un produit portant une URL en base.
// Aucune date de disponibilité n'est affichée.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Écosystème, STRATA et IROKO",
  description:
    "Les produits du groupe, division par division : audit CSRD, empreinte carbone, veille réglementaire, formation, branche Afrique. État réel de chacun, sans date promise.",
  alternates: { canonical: "/ecosysteme" },
  openGraph: {
    title: "Écosystème, STRATA et IROKO",
    description:
      "Les produits du groupe, division par division. État réel de chacun, sans date promise.",
    url: "/ecosysteme",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

const STATUT: Record<
  EcosystemStatus,
  { label: string; variant: "emerald" | "warning" | "default"; dot: boolean }
> = {
  live: { label: "En ligne", variant: "emerald", dot: true },
  building: { label: "En construction", variant: "warning", dot: false },
  planned: { label: "En réflexion", variant: "default", dot: false },
};

// Une ligne par division, factuelle. Rien qui engage une date.
const DIVISIONS: Record<string, { ancre: string; accroche: string }> = {
  STRATA: {
    ancre: "strata",
    accroche:
      "La suite ESG pour les PME européennes : conformité CSRD, empreinte carbone, veille et formation.",
  },
  IROKO: {
    ancre: "iroko",
    accroche:
      "La branche Afrique du groupe, sur ses propres contraintes de terrain et ses propres cadres.",
  },
  Cockpit: {
    ancre: "cockpit",
    accroche: "L'atelier, ce tableau de bord.",
  },
};

const ORDRE = ["STRATA", "IROKO", "Cockpit"];

function ancre(division: string): string {
  return (
    DIVISIONS[division]?.ancre ??
    division.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );
}

async function chargerProduits(): Promise<EcosystemProductRow[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("ecosystem_products")
    .select("slug, name, division, pillar, description, status, url, position")
    .order("position", { ascending: true });
  if (error) {
    console.error("[ecosysteme] registre illisible :", error.message);
    return [];
  }
  return (data as EcosystemProductRow[]) ?? [];
}

function grouper(products: EcosystemProductRow[]) {
  const groupes = new Map<string, EcosystemProductRow[]>();
  for (const p of products) {
    groupes.set(p.division, [...(groupes.get(p.division) ?? []), p]);
  }
  return Array.from(groupes.entries())
    .map(([division, liste]) => ({ division, produits: liste }))
    .sort((a, b) => {
      const ra = ORDRE.indexOf(a.division);
      const rb = ORDRE.indexOf(b.division);
      const na = ra === -1 ? ORDRE.length : ra;
      const nb = rb === -1 ? ORDRE.length : rb;
      return na !== nb ? na - nb : a.division.localeCompare(b.division);
    });
}

function ProductTile({ p }: { p: EcosystemProductRow }) {
  const statut = STATUT[p.status] ?? STATUT.building;
  const carte = (
    <Card
      className={
        p.url
          ? "h-full transition-colors duration-150 group-hover:border-emerald/60"
          : "h-full"
      }
    >
      <CardContent className="flex h-full flex-col py-4">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-emerald">
            {p.pillar ?? p.division}
          </p>
          <Badge variant={statut.variant} dot={statut.dot}>
            {statut.label}
          </Badge>
        </div>
        <h3 className="font-mono text-sm font-semibold text-foreground">
          {p.name}
        </h3>
        {p.description ? (
          <p className="mt-1.5 flex-1 font-mono text-xs leading-relaxed text-muted">
            {p.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-faint">
          {p.url ? (
            <span className="text-emerald transition-colors group-hover:text-emerald-bright">
              ouvrir le produit →
            </span>
          ) : (
            <span>sans lien public</span>
          )}
        </p>
      </CardContent>
    </Card>
  );

  if (!p.url) {
    return carte;
  }
  return (
    <OutboundLink
      href={p.url}
      product={p.slug}
      division={p.division}
      source="ecosysteme"
      className="group block h-full"
    >
      {carte}
    </OutboundLink>
  );
}

export default async function EcosystemePage() {
  const produits = await chargerProduits();
  const groupes = grouper(produits);
  const enLigne = produits.filter((p) => p.status === "live" && p.url);

  // L8-T9 : JSON-LD lu depuis la base, jamais recopié à la main.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organisation`,
        name: "STRATA",
        description:
          "Suite logicielle de reporting de durabilité pour les PME européennes (CSRD, ESRS, VSME) et branche africaine IROKO.",
        url: absoluteUrl("/ecosysteme"),
        founder: { "@type": "Person", name: "Adama Diallo" },
      },
      ...enLigne.map((p) => ({
        "@type": "SoftwareApplication",
        name: p.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: p.url,
        description: p.description ?? p.pillar ?? undefined,
        publisher: { "@id": `${SITE_URL}#organisation` },
      })),
    ],
  };

  return (
    <div className="bg-grid min-h-dvh">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
        {/* En-tête */}
        <header className="mb-10 space-y-4">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← Adama OS
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Écosystème
            </h1>
            {enLigne.length > 0 ? (
              <Badge variant="emerald" dot>
                {enLigne.length} en ligne
              </Badge>
            ) : null}
          </div>
          <p className="max-w-2xl font-mono text-sm leading-relaxed text-muted">
            Un ensemble logiciel construit sur deux continents. Chaque produit
            affiche son état réel, lu dans le registre du groupe. Ce qui est
            ouvert s&apos;ouvre d&apos;un clic, ce qui se construit le dit sans
            promettre de date, et ce qui n&apos;existe pas n&apos;apparaît pas.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {enLigne[0] && enLigne[0].url ? (
              <OutboundLink
                href={enLigne[0].url}
                product={enLigne[0].slug}
                division={enLigne[0].division}
                source="ecosysteme-hero"
                className="inline-flex h-10 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] bg-emerald px-5 font-mono text-sm font-medium uppercase tracking-[0.12em] text-emerald-foreground transition-colors hover:bg-emerald-bright"
              >
                Essayer {enLigne[0].name}
              </OutboundLink>
            ) : null}
            <Link
              href="/metrics"
              className="font-mono text-xs text-faint underline-offset-4 transition-colors hover:text-emerald-bright hover:underline"
            >
              ou voir les métriques produit →
            </Link>
          </div>
        </header>

        {/* Divisions */}
        {groupes.length > 0 ? (
          groupes.map((groupe) => (
            <section
              key={groupe.division}
              id={ancre(groupe.division)}
              className="mb-12 scroll-mt-24"
            >
              <div className="mb-1 flex items-baseline gap-3">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                  {groupe.division}
                </h2>
                <span className="font-mono text-[0.65rem] text-faint">
                  {groupe.produits.length} produit
                  {groupe.produits.length > 1 ? "s" : ""}
                </span>
              </div>
              {DIVISIONS[groupe.division] ? (
                <p className="mb-4 max-w-2xl font-mono text-xs leading-relaxed text-muted">
                  {DIVISIONS[groupe.division]?.accroche}
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {groupe.produits.map((p) => (
                  <ProductTile key={p.slug} p={p} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <section className="mb-12">
            <Card>
              <CardContent className="py-6">
                <p className="font-mono text-sm text-muted">
                  Registre produits non disponible
                </p>
                <p className="mt-1.5 max-w-xl font-mono text-xs leading-relaxed text-faint">
                  Cette page ne montre que ce que le registre du groupe
                  contient. Rien n&apos;est écrit en dur ici, donc rien
                  n&apos;est affiché tant que la source ne répond pas.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Note de transparence */}
        <section className="mb-10">
          <Card>
            <CardContent className="space-y-3 py-5">
              <p className="font-mono text-sm leading-relaxed text-muted">
                Rien ici n&apos;est une promesse : les produits en ligne
                s&apos;utilisent aujourd&apos;hui, et leurs métriques
                d&apos;usage sont{" "}
                <span className="text-foreground">publiques</span> sur{" "}
                <Link
                  href="/metrics"
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  /metrics
                </Link>
                . Le reste se construit produit après produit, et se dit tel
                quel.
              </p>
            </CardContent>
          </Card>
        </section>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo · System Architect
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <LegalFooterLinks />
            <Link
              href="/"
              className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
            >
              ← retour au dashboard
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent } from "@adama/ui";
import { getVeilleList } from "../../sanity/lib/queries";

// L5-T5 — Page /veille (liste). Server component : le contenu est visible par
// les moteurs de recherche. ISR 1h : le CDN Sanity sert le publié, la page se
// régénère au plus toutes les heures. Si Sanity n'est pas configuré, la liste
// est vide et la page affiche un état neutre (jamais d'erreur).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Veille réglementaire — Adama OS",
  description:
    "Veille automatisée sur le reporting de durabilité : CSRD, ESRS, VSME, taxonomie UE et GHG Protocol. Synthèses factuelles pour les PME européennes.",
  alternates: { canonical: "/veille" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export default async function VeillePage() {
  const articles = await getVeilleList();

  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
            >
              ← Adama OS
            </Link>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Veille réglementaire
            </h1>
            <p className="max-w-xl font-mono text-sm text-muted">
              Synthèses automatisées des évolutions CSRD, ESRS, VSME et GHG
              Protocol. Mise à jour en continu, validées à la main.
            </p>
          </div>
          <Badge variant="emerald" dot>
            Auto
          </Badge>
        </header>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center font-mono text-sm text-muted">
              Aucun article pour le moment. La prochaine synthèse arrive bientôt.
            </CardContent>
          </Card>
        ) : (
          <section className="space-y-4">
            {articles.map((a) => (
              <Link key={a.slug} href={`/veille/${a.slug}`} className="block">
                <Card className="transition-colors hover:border-emerald/60">
                  <CardContent className="py-4">
                    <div className="mb-1.5 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                      {a.source ? <span className="text-emerald">{a.source}</span> : null}
                      <span>·</span>
                      <span>{formatDate(a.publishedAt)}</span>
                    </div>
                    <h2 className="font-mono text-base font-semibold text-foreground">
                      {a.title}
                    </h2>
                    <p className="mt-1.5 font-mono text-sm text-muted">{a.summary}</p>
                    {a.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.tags.map((t) => (
                          <Badge key={t} variant="default">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}

        <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo — System Architect · Strata
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

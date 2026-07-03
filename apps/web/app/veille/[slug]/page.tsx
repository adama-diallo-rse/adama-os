import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Badge } from "@adama/ui";
import { getVeilleArticle, getVeilleSlugs } from "../../../sanity/lib/queries";

// L5-T5 — Article de veille (SSR + ISR 1h). generateStaticParams pré-rend les
// slugs connus ; dynamicParams laisse générer à la volée les nouveaux articles.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getVeilleSlugs();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getVeilleArticle(slug);
  if (!article) {
    return { title: "Article introuvable — Veille Adama OS" };
  }
  return {
    title: `${article.title} — Veille Adama OS`,
    description: article.summary,
    alternates: { canonical: `/veille/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 font-mono text-sm leading-relaxed text-muted">{children}</p>
    ),
  },
};

export default async function VeilleArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getVeilleArticle(slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="bg-grid min-h-dvh">
      <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
        <Link
          href="/veille"
          className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
        >
          ← Veille
        </Link>

        <header className="mt-4 mb-6 space-y-3 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
            {article.source ? <span className="text-emerald">{article.source}</span> : null}
            <span>·</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {article.title}
          </h1>
          <p className="font-mono text-sm text-muted">{article.summary}</p>
          {article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <Badge key={t} variant="default">
                  {t}
                </Badge>
              ))}
            </div>
          ) : null}
        </header>

        {article.body ? <PortableText value={article.body} components={ptComponents} /> : null}

        {article.originalUrl ? (
          <p className="mt-6 border-t border-border pt-5 font-mono text-xs text-muted">
            Source d&apos;origine :{" "}
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
            >
              lien officiel
            </a>
          </p>
        ) : null}

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama OS · Veille
          </p>
          <Link
            href="/veille"
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← tous les articles
          </Link>
        </footer>
      </article>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, CardContent } from "@adama/ui";
import { CATALOG, getCourseBySlug } from "../../../content/learn/catalog";
import { getGrantedLevels } from "../../../lib/learn/access";
import { getCourseOverrides } from "../../../sanity/lib/courses";

// L5-T6 — Page d'un cours : présentation du niveau + sommaire des leçons.
// SSR (lit le cookie d'accès pour marquer les leçons débloquées).
export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOG.map((c) => ({ course: c.slug }));
}

type Props = { params: Promise<{ course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Formation introuvable — Adama OS" };
  return {
    title: `${course.title} — Formations Adama OS`,
    description: course.tagline,
    alternates: { canonical: `/learn/${course.slug}` },
  };
}

export default async function CoursePage({ params }: Props) {
  const { course: slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const [overrides, granted] = await Promise.all([
    getCourseOverrides(),
    getGrantedLevels(),
  ]);
  const override = overrides[course.level];
  const priceLabel = override?.priceLabel ?? course.priceLabel;
  const available = override?.available ?? course.available;
  const unlocked = granted.includes(course.level);
  const checkoutUrl = override?.checkoutUrl ?? null;

  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
        <Link
          href="/learn"
          className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
        >
          ← Formations
        </Link>

        <header className="mt-4 mb-6 space-y-3 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
            <span className="text-emerald">Niveau {course.level}</span>
            <span>·</span>
            <span>
              {course.lessons.length} leçon
              {course.lessons.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {course.title}
            </h1>
            {unlocked ? (
              <Badge variant="emerald">Débloqué</Badge>
            ) : available ? (
              <Badge variant="default">{priceLabel}</Badge>
            ) : (
              <Badge variant="default">Bientôt</Badge>
            )}
          </div>
          <p className="font-mono text-sm text-muted">{course.tagline}</p>
          {!unlocked && available ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={checkoutUrl ?? "/strata"}
                className="inline-flex h-9 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] bg-emerald px-4 font-mono text-sm font-medium uppercase tracking-[0.12em] text-emerald-foreground transition-colors hover:bg-emerald-bright"
              >
                Débloquer · {priceLabel}
              </Link>
              <Link
                href="/learn/acces"
                className="font-mono text-xs text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
              >
                j&apos;ai déjà acheté
              </Link>
            </div>
          ) : null}
        </header>

        <ol className="space-y-3">
          {course.lessons.map((lesson, i) => {
            const readable = lesson.free || unlocked;
            const inner = (
              <Card
                className={
                  readable ? "transition-colors hover:border-emerald/60" : "opacity-70"
                }
              >
                <CardContent className="flex items-center gap-3 py-3.5">
                  <span className="font-mono text-xs text-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-mono text-sm font-semibold text-foreground">
                      {lesson.title}
                    </h2>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted">
                      {lesson.summary}
                    </p>
                  </div>
                  {lesson.free ? (
                    <Badge variant="emerald">Libre</Badge>
                  ) : readable ? (
                    <Badge variant="default">Lire</Badge>
                  ) : (
                    <Badge variant="default">Premium</Badge>
                  )}
                </CardContent>
              </Card>
            );

            return (
              <li key={lesson.slug}>
                {readable ? (
                  <Link
                    href={`/learn/${course.slug}/${lesson.slug}`}
                    className="block"
                  >
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ol>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama OS · Formations
          </p>
          <Link
            href="/learn"
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← tous les niveaux
          </Link>
        </footer>
      </div>
    </div>
  );
}

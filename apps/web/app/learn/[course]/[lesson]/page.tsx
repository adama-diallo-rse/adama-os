import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Badge } from "@adama/ui";
import { CATALOG, getLesson } from "../../../../content/learn/catalog";
import { getGrantedLevels } from "../../../../lib/learn/access";
import { loadLessonSource } from "../../../../lib/learn/content";
import { getCourseOverrides } from "../../../../sanity/lib/courses";
import { mdxComponents } from "../../../../components/learn/mdx-components";
import { Paywall } from "../../../../components/learn/paywall";

// L5-T6 / L5-T8 — Leçon d'une formation. Contenu MDX (content/learn/*.mdx),
// rendu serveur via next-mdx-remote/rsc. Leçon gratuite ou niveau débloqué →
// contenu ; sinon paywall.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATALOG.flatMap((c) =>
    c.lessons.map((l) => ({ course: c.slug, lesson: l.slug })),
  );
}

type Props = { params: Promise<{ course: string; lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, lesson } = await params;
  const found = getLesson(course, lesson);
  if (!found) return { title: "Leçon introuvable — Adama OS" };
  return {
    title: `${found.lesson.title} — ${found.course.title}`,
    description: found.lesson.summary,
    alternates: { canonical: `/learn/${course}/${lesson}` },
    // Les leçons premium ne sont pas indexées (contenu payant), seules les
    // gratuites le sont.
    robots: found.lesson.free ? undefined : { index: false, follow: true },
  };
}

export default async function LessonPage({ params }: Props) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const found = getLesson(courseSlug, lessonSlug);
  if (!found) notFound();
  const { course, lesson } = found;

  const granted = await getGrantedLevels();
  const readable = lesson.free || granted.includes(course.level);

  return (
    <div className="bg-grid min-h-dvh">
      <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
        <Link
          href={`/learn/${course.slug}`}
          className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
        >
          ← {course.title}
        </Link>

        <header className="mt-4 mb-6 space-y-3 border-b border-border pb-6">
          <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
            <span className="text-emerald">Niveau {course.level}</span>
            <span>·</span>
            <span>{lesson.free ? "Accès libre" : "Premium"}</span>
          </div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {lesson.title}
          </h1>
          <p className="font-mono text-sm text-muted">{lesson.summary}</p>
          {lesson.free ? <Badge variant="emerald">Libre</Badge> : null}
        </header>

        {readable ? (
          <LessonBody mdxKey={lesson.mdxKey} />
        ) : (
          <PremiumGate course={course} />
        )}

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-5">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama OS · Formations
          </p>
          <Link
            href={`/learn/${course.slug}`}
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← sommaire
          </Link>
        </footer>
      </article>
    </div>
  );
}

async function LessonBody({ mdxKey }: { mdxKey: string }) {
  const source = await loadLessonSource(mdxKey);
  if (!source) {
    return (
      <p className="font-mono text-sm text-muted">
        Contenu en cours de rédaction.
      </p>
    );
  }
  return (
    <div className="learn-prose">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}

async function PremiumGate({
  course,
}: {
  course: (typeof CATALOG)[number];
}) {
  const overrides = await getCourseOverrides();
  const override = overrides[course.level];
  return (
    <Paywall
      title={course.title}
      priceLabel={override?.priceLabel ?? course.priceLabel}
      available={override?.available ?? course.available}
      checkoutUrl={override?.checkoutUrl ?? null}
    />
  );
}

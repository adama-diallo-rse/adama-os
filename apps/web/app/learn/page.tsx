import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent } from "@adama/ui";
import { CATALOG } from "../../content/learn/catalog";
import { getGrantedLevels } from "../../lib/learn/access";
import { getCourseOverrides } from "../../sanity/lib/courses";

// L5-T6 — Index des formations /learn : les 4 niveaux du parcours.
// SSR (lit le cookie d'accès pour badger les niveaux débloqués). Le prix et la
// disponibilité viennent du catalogue repo, surchargés par Sanity si présent.
export const metadata: Metadata = {
  title: "Formations — Adama OS",
  description:
    "Parcours en 4 niveaux pour maîtriser le reporting de durabilité : CSRD/ESG automatisé, VSME pour les PME, bilan carbone Scopes 1-2-3, stratégie ESG et financement durable.",
  alternates: { canonical: "/learn" },
};

export default async function LearnPage() {
  const [overrides, granted] = await Promise.all([
    getCourseOverrides(),
    getGrantedLevels(),
  ]);

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
              Formations
            </h1>
            <p className="max-w-xl font-mono text-sm text-muted">
              Un parcours en 4 niveaux, du reporting CSRD automatisé à la
              stratégie ESG. Chaque niveau commence par une leçon en accès libre.
            </p>
          </div>
          <Badge variant="emerald" dot>
            4 niveaux
          </Badge>
        </header>

        <section className="space-y-4">
          {CATALOG.map((course) => {
            const override = overrides[course.level];
            const priceLabel = override?.priceLabel ?? course.priceLabel;
            const available = override?.available ?? course.available;
            const unlocked = granted.includes(course.level);
            const freeCount = course.lessons.filter((l) => l.free).length;

            return (
              <Link
                key={course.slug}
                href={`/learn/${course.slug}`}
                className="block"
              >
                <Card className="transition-colors hover:border-emerald/60">
                  <CardContent className="py-4">
                    <div className="mb-1.5 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                      <span className="text-emerald">Niveau {course.level}</span>
                      <span>·</span>
                      <span>
                        {course.lessons.length} leçon
                        {course.lessons.length > 1 ? "s" : ""}
                      </span>
                      {freeCount > 0 ? (
                        <>
                          <span>·</span>
                          <span>{freeCount} en accès libre</span>
                        </>
                      ) : null}
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-mono text-base font-semibold text-foreground">
                        {course.title}
                      </h2>
                      {unlocked ? (
                        <Badge variant="emerald">Débloqué</Badge>
                      ) : available ? (
                        <Badge variant="default">{priceLabel}</Badge>
                      ) : (
                        <Badge variant="default">Bientôt</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 font-mono text-sm text-muted">
                      {course.tagline}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </section>

        <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo — System Architect · Strata
          </p>
          <Link
            href="/learn/acces"
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            j&apos;ai déjà acheté →
          </Link>
        </footer>
      </div>
    </div>
  );
}

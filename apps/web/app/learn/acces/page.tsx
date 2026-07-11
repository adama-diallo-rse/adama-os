import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@adama/ui";
import { CATALOG } from "../../../content/learn/catalog";
import { AccessForm } from "../../../components/learn/access-form";

// L5-T8 — Déblocage d'accès pour un acheteur existant. La vérification réelle se
// fait côté serveur (route api/learn/access), cette page n'est qu'un formulaire.
export const metadata: Metadata = {
  title: "Débloquer mon accès — Formations Adama OS",
  description:
    "Accédez à votre formation avec l'email utilisé lors de l'achat.",
  alternates: { canonical: "/learn/acces" },
  robots: { index: false, follow: true },
};

export default function AccessPage() {
  const courses = CATALOG.map((c) => ({ level: c.level, title: c.title }));

  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-8 sm:py-14">
        <Link
          href="/learn"
          className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
        >
          ← Formations
        </Link>

        <header className="mt-4 mb-6 space-y-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground">
            Débloquer mon accès
          </h1>
          <p className="font-mono text-sm text-muted">
            Saisis l&apos;email utilisé lors de l&apos;achat. On vérifie ton
            droit et on ouvre le niveau correspondant.
          </p>
        </header>

        <Card>
          <CardContent className="py-6">
            <AccessForm courses={courses} />
          </CardContent>
        </Card>

        <p className="mt-6 font-mono text-xs text-faint">
          Pas encore acheté ?{" "}
          <Link
            href="/learn"
            className="text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
          >
            voir les formations
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

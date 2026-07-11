import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@adama/ui";
import { AuditForm } from "../../components/audit/audit-form";

// L6-T8 — Page Audit Express (lead magnet). Le formulaire est un composant
// client (components/audit/audit-form.tsx) qui poste sur /api/audit. La page
// elle-même est un server component indexable (SEO).
export const metadata: Metadata = {
  title: "Audit Express ESG gratuit — STRATA",
  description:
    "Estimez en une minute votre empreinte carbone Scopes 1-2-3 et vos premières pistes de réduction. Gratuit, immédiat, sans engagement.",
  alternates: { canonical: "/audit" },
};

export default function AuditPage() {
  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
        <Link
          href="/strata"
          className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
        >
          ← STRATA
        </Link>

        <header className="mt-4 mb-6 space-y-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Audit Express ESG
          </h1>
          <p className="max-w-xl font-mono text-sm leading-relaxed text-muted">
            Une estimation immédiate de votre empreinte carbone (Scopes 1-2-3) à
            partir de quelques chiffres clés. Le même moteur que STRATA, en
            version express. Gratuit, sans engagement.
          </p>
        </header>

        <Card>
          <CardContent className="py-6">
            <AuditForm />
          </CardContent>
        </Card>

        <p className="mt-6 font-mono text-xs text-faint">
          Besoin d&apos;un reporting complet et auditable ?{" "}
          <Link
            href="/strata"
            className="text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
          >
            découvrir STRATA
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

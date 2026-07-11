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

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Message contextuel selon le paramètre de retour de /api/checkout.
function checkoutNotice(
  purchased: boolean,
  checkout: string | undefined,
): { tone: "ok" | "warn"; text: string } | null {
  if (purchased) {
    return {
      tone: "ok",
      text: "Paiement confirmé. Saisis l'email utilisé à l'achat pour ouvrir ton accès (le webhook peut prendre quelques secondes).",
    };
  }
  if (checkout === "unavailable" || checkout === "error") {
    return {
      tone: "warn",
      text: "Le paiement en ligne n'est pas disponible pour le moment. Si tu as déjà acheté, débloque ton accès ci-dessous ou écris-nous.",
    };
  }
  return null;
}

export default async function AccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const courses = CATALOG.map((c) => ({ level: c.level, title: c.title }));
  const notice = checkoutNotice(
    params.purchased === "1",
    typeof params.checkout === "string" ? params.checkout : undefined,
  );

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

        {notice ? (
          <div
            role="status"
            className={
              "mb-5 rounded-[calc(var(--radius)_-_0.25rem)] border px-4 py-3 font-mono text-xs leading-relaxed " +
              (notice.tone === "ok"
                ? "border-emerald/50 bg-emerald/10 text-emerald-bright"
                : "border-border-strong bg-surface-raised text-muted")
            }
          >
            {notice.text}
          </div>
        ) : null}

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

import Link from "next/link";
import { Card, CardContent } from "@adama/ui";

// L5-T8 — Bloc paywall affiché à la place du contenu premium quand le niveau
// n'est pas débloqué. Deux issues : acheter (checkout Polar, câblé en L6-T6 via
// checkoutUrl ; repli vers la landing /strata, L6-T7) ou saisir l'email d'achat
// si déjà client.
export function Paywall({
  title,
  priceLabel,
  available,
  checkoutUrl,
}: {
  title: string;
  priceLabel: string;
  available: boolean;
  checkoutUrl: string | null;
}) {
  const buyHref = checkoutUrl ?? "/strata";

  return (
    <Card className="border-emerald/40">
      <CardContent className="space-y-4 py-6 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-faint">
          Contenu premium
        </p>
        <p className="font-mono text-sm text-muted">
          Cette leçon fait partie de <strong className="text-foreground">{title}</strong>.
          Débloque le niveau complet pour y accéder.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
          {available ? (
            <Link
              href={buyHref}
              className="inline-flex h-9 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] bg-emerald px-4 font-mono text-sm font-medium uppercase tracking-[0.12em] text-emerald-foreground transition-colors hover:bg-emerald-bright"
            >
              Débloquer · {priceLabel}
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center justify-center rounded-[calc(var(--radius)_-_0.25rem)] border border-border-strong px-4 font-mono text-sm uppercase tracking-[0.12em] text-muted">
              Bientôt disponible
            </span>
          )}
          <Link
            href="/learn/acces"
            className="font-mono text-xs text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
          >
            j&apos;ai déjà acheté
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

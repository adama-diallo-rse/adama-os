import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type BadgeVariant =
  | "default"
  | "emerald"
  | "warning"
  | "danger"
  | "outline";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-border bg-surface-raised text-muted",
  emerald:
    "border-transparent bg-[color-mix(in_oklch,var(--color-emerald)_18%,transparent)] text-emerald-bright",
  warning:
    "border-transparent bg-[color-mix(in_oklch,var(--color-warning)_18%,transparent)] text-warning",
  danger:
    "border-transparent bg-[color-mix(in_oklch,var(--color-danger)_18%,transparent)] text-danger",
  outline: "border-border-strong bg-transparent text-foreground",
};

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
  /** Affiche un point d'état avant le contenu. */
  dot?: boolean;
}

/** Étiquette compacte monospace, casse haute. */
export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em]",
        "whitespace-nowrap",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-current shadow-[0_0_8px_0_currentColor]"
        />
      ) : null}
      {children}
    </span>
  );
}

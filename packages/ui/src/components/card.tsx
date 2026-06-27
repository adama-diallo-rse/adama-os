import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

/** Panneau de base façon module de monitoring. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-[var(--radius)] border border-border bg-surface",
        "shadow-[0_1px_0_0_var(--color-border-strong)_inset,0_8px_24px_-16px_rgba(0,0,0,0.8)]",
        className,
      )}
      {...props}
    />
  );
}

/** En-tête avec liseré bas, accueille titre et actions. */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

/** Titre en monospace, casse haute, ton terminal. */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 py-4", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-border px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

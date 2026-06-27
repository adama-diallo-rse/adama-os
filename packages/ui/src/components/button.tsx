import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald text-emerald-foreground hover:bg-emerald-bright active:bg-emerald-dim",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:border-emerald hover:text-emerald-bright",
  ghost: "bg-transparent text-muted hover:bg-surface-raised hover:text-foreground",
  danger:
    "border border-transparent bg-[color-mix(in_oklch,var(--color-danger)_16%,transparent)] text-danger hover:bg-[color-mix(in_oklch,var(--color-danger)_26%,transparent)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Encadre le libellé de crochets, ressenti ligne de commande : [ libellé ]. */
  bracket?: boolean;
}

/** Bouton style terminal, monospace et casse haute. */
export function Button({
  className,
  variant = "primary",
  size = "md",
  bracket = false,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius)_-_0.25rem)]",
        "font-mono font-medium uppercase tracking-[0.12em]",
        "transition-colors duration-150 outline-none select-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-emerald focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-45",
        buttonSizes[size],
        buttonVariants[variant],
        className,
      )}
      {...props}
    >
      {bracket ? <span aria-hidden>[</span> : null}
      {children}
      {bracket ? <span aria-hidden>]</span> : null}
    </button>
  );
}

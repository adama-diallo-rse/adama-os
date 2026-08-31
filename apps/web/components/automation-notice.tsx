// L10-T1, mention de traitement automatisé (article 50).
// Présentée au premier contact avec adama.ai, pas enfouie dans un pied de
// page. Composant sans état : testable isolément.
import { AUTOMATED_PROCESSING_NOTICE } from "../lib/legal";

export function AutomationNotice({ className }: { className?: string }) {
  return (
    <p
      data-testid="automation-notice"
      className={
        className ??
        "rounded-[calc(var(--radius)_-_0.25rem)] border border-border bg-surface-raised px-3 py-2 font-mono text-[0.65rem] leading-relaxed text-faint"
      }
    >
      <span aria-hidden className="mr-1 text-warning">
        ⚑
      </span>
      {AUTOMATED_PROCESSING_NOTICE}
    </p>
  );
}

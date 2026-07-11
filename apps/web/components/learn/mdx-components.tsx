import type { MDXComponents } from "mdx/types";

// L5-T6 — Rendu MDX au style terminal d'Adama OS. Composants serveur purs
// (aucun état), passés à <MDXRemote>. Typographie monospace, accents emerald,
// cohérente avec /veille et le dashboard.
export const mdxComponents: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 font-mono text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-emerald">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 font-mono text-sm leading-relaxed text-muted">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-5 list-disc space-y-1.5 font-mono text-sm text-muted marker:text-emerald">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-5 list-decimal space-y-1.5 font-mono text-sm text-muted marker:text-emerald">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="text-foreground/90">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-emerald underline decoration-dotted transition-colors hover:text-emerald-bright"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.8em] text-foreground">
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-emerald/60 pl-4 font-mono text-sm italic text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
};

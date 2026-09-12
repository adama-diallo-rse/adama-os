// Symbole Open Strata, source brand/logo/adama-os-open-strata-icon.svg.
// Deux strates ouvertes et un point de provenance. Un seul trace pour l'en-tete,
// l'ecosysteme et les fiches projet : le favicon (app/icon.svg) et les images
// de partage (lib/og.tsx) reprennent les memes coordonnees.
export const OPEN_STRATA_PATHS = [
  "M32 8 51 27",
  "M56 32 32 56 8 32 32 8",
  "M32 19 44 31",
  "M45 35 32 48 16 32 32 16",
] as const;

export const OPEN_STRATA_SOURCE = { cx: 53, cy: 29, r: 3.5 } as const;

/**
 * Le trait suit `currentColor` et le point prend `--accent-text` via la
 * classe du parent (.brand-symbol, .os-core, .brand-adama).
 */
export function OpenStrataSymbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" focusable="false">
      {OPEN_STRATA_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
      <circle {...OPEN_STRATA_SOURCE} />
    </svg>
  );
}

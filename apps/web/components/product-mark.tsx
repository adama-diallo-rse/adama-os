// =====================================================================
// Les marques des produits du groupe.
//
// Le kit de marque fourni ne contient aucun fichier de logo produit, et ce
// n'est pas un oubli : la marque STRATA ESG y est definie comme un
// mot-symbole typographique, Syne 700 en capitales largement interlettrees,
// et son seul ornement autorise est l'arc concentrique dore. Un logo produit
// telecharge ailleurs, ou dessine dans un autre vocabulaire, aurait donc ete
// un corps etranger dans la charte.
//
// Ces huit marques sont donc construites avec les deux seules primitives que
// la charte autorise, l'arc et la strate, et rien d'autre : trait uniquement,
// une seule couleur heritee du contexte, aucun aplat, aucun degrade, aucune
// ombre portee. Elles forment une famille lisible : on doit voir d'un coup
// d'oeil que les huit appartiennent au meme groupe, et distinguer laquelle
// est laquelle.
//
// Le libelle reste le nom du produit, ecrit a cote. Une marque de vingt-deux
// pixels ne nomme pas un produit, elle le signale.
// =====================================================================

/** Les traces, par identifiant de produit du registre ecosystem_products. */
const TRACES: Record<string, React.ReactNode> = {
  // Trois strates montantes sur un socle : le scoring d'un audit.
  "esg-optimizer": (
    <>
      <path d="M5 26h22" />
      <path d="M9.5 26V19" />
      <path d="M16 26V13" />
      <path d="M22.5 26V7.5" />
      <circle cx="22.5" cy="4.6" r="1.4" />
    </>
  ),
  // Trois arcs concentriques poses sur une ligne de base : les scopes 1, 2
  // et 3 d'un bilan carbone, lus comme un cadran plutot que comme une cible.
  "strata-scope": (
    <>
      <path d="M4 24h24" />
      <path d="M4 24a12 12 0 0 1 24 0" />
      <path d="M8.3 24a7.7 7.7 0 0 1 15.4 0" />
      <path d="M12.6 24a3.4 3.4 0 0 1 6.8 0" />
    </>
  ),
  // Trois plaques empilees : le socle sur lequel le reste se pose.
  "strata-platform": (
    <>
      <path d="M4 10.5 16 16l12-5.5L16 5Z" />
      <path d="m4 16.5 12 5.5 12-5.5" />
      <path d="m4 22.5 12 5.5 12-5.5" />
    </>
  ),
  // Une seule plaque, et l'arc de ce qui viendra se poser dessus : le
  // premier diagnostic, avant la suite.
  "strata-foundation": (
    <>
      <path d="M4 21.5 16 27l12-5.5L16 16Z" />
      <path d="M6.5 13.5a9.5 9.5 0 0 1 19 0" />
      <circle cx="16" cy="4" r="1.4" />
    </>
  ),
  // Un arc ouvert et son rayon : la veille qui balaie ses sources.
  "strata-watch": (
    <>
      <path d="M16 27a11 11 0 1 1 11-11" />
      <path d="m16 16 8.2-5.2" />
      <circle cx="16" cy="16" r="1.7" />
    </>
  ),
  // Deux arcs ouverts sur une reliure : un ouvrage, pas une toque.
  "strata-academy": (
    <>
      <path d="M16 9v17" />
      <path d="M16 9c-3-2.4-7-3.4-11-2.9v16c4-.5 8 .5 11 2.9" />
      <path d="M16 9c3-2.4 7-3.4 11-2.9v16c-4-.5-8 .5-11 2.9" />
    </>
  ),
  // Un arc ferme par une strate, et un tronc : la couronne large et plate de
  // l'iroko, l'arbre qui donne son nom a la division.
  "iroko-platform": (
    <>
      <path d="M4.5 15a11.5 11.5 0 0 1 23 0Z" />
      <path d="M16 28V15" />
      <path d="M11.5 25h9" />
    </>
  ),
  // Une orbite, un horizon, un point : le cockpit.
  "adama-os": (
    <>
      <circle cx="16" cy="16" r="10.5" />
      <path d="M5.5 16h21" />
      <circle cx="21.6" cy="9.4" r="1.6" />
    </>
  ),
};

export function aUneMarqueProduit(slug: string): boolean {
  return slug in TRACES;
}

/**
 * La marque d'un produit. Toujours decorative : le nom du produit est ecrit
 * a cote, et faire entendre deux fois le meme nom a un lecteur d'ecran ne
 * l'aide pas.
 */
export function ProductMark({
  slug,
  taille = 24,
  className = "",
}: {
  slug: string;
  taille?: number;
  className?: string;
}) {
  const trace = TRACES[slug];
  if (!trace) return null;
  return (
    <svg
      className={`product-mark ${className}`.trim()}
      width={taille}
      height={taille}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {trace}
    </svg>
  );
}

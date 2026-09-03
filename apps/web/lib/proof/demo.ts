// =====================================================================
// C1-T5, l'interrupteur de démonstration.
//
// `ADAMA_HIDE_DEMO=1` retire tout contenu de classe `demo` du rendu serveur.
// Le filtrage a lieu au CHARGEMENT des données, pas à l'affichage : la grille
// se recompose d'elle-même et ne montre pas de case vide là où une carte a
// disparu. Sert avant un envoi à un lecteur exigeant.
//
// Module serveur : il lit une variable d'environnement non publique. Il ne
// doit jamais être importé depuis un composant client.
// =====================================================================

/** Vrai quand l'interrupteur est armé. */
export function hideDemo(): boolean {
  return process.env.ADAMA_HIDE_DEMO?.trim() === "1";
}

/** Retire les lignes de classe `demo` quand l'interrupteur est armé. */
export function filtrerDemo<T extends { data_class?: string | null }>(
  rows: T[],
): T[] {
  if (!hideDemo()) {
    return rows;
  }
  return rows.filter((r) => r.data_class !== "demo");
}

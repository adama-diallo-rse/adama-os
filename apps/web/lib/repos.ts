// L5-T2, source de vérité de la liste des dépôts suivis par le feed Shipped.
//
// POINT DE BASCULE UNIQUE. Aujourd'hui la liste vient de la variable
// d'environnement GITHUB_REPOS. Quand la table ecosystem_products existera
// (L1-T9), seule `listTrackedRepos` change : elle lira la colonne
// repo_full_name au lieu de l'environnement. Aucun autre fichier ne connaît
// la liste des dépôts, c'est tout l'intérêt de ce module.
//
// Format de GITHUB_REPOS, entrées séparées par des virgules :
//   owner/repo:Produit:Division
// Le produit et la division sont optionnels. Sans produit, le nom du dépôt
// est utilisé. Exemple d'une entrée : iroko-software-group/esg-optimizer:ESG Optimizer:STRATA

export type TrackedRepo = {
  /** "owner/repo", tel que l'attend l'API GitHub. */
  fullName: string;
  /** Nom lisible affiché en badge à côté du commit. */
  product: string;
  /** Division du groupe (STRATA, IROKO, Cockpit). Vide si non renseignée. */
  division: string;
};

/** Dépôt du cockpit lui-même. Repli quand rien n'est configuré, pour que le
 *  feed reste vivant en local sans variable d'environnement. */
const FALLBACK_REPO: TrackedRepo = {
  fullName: "adama-diallo-rse/adama-os",
  product: "Adama OS",
  division: "Cockpit",
};

const FULL_NAME_RE = /^[\w.-]+\/[\w.-]+$/;

function parseEntry(raw: string): TrackedRepo | null {
  const [fullName, product, division] = raw.split(":").map((s) => s.trim());
  if (!fullName || !FULL_NAME_RE.test(fullName)) {
    return null;
  }
  const repoName = fullName.split("/")[1] ?? fullName;
  return {
    fullName,
    product: product || repoName,
    division: division || "",
  };
}

/** Liste des dépôts à agréger dans le feed. Jamais vide. */
export function listTrackedRepos(): TrackedRepo[] {
  const raw = process.env.GITHUB_REPOS?.trim();
  if (!raw) {
    return [FALLBACK_REPO];
  }
  const parsed = raw
    .split(",")
    .map((entry) => parseEntry(entry))
    .filter((r): r is TrackedRepo => r !== null);

  if (parsed.length === 0) {
    console.error(
      "[shipped] GITHUB_REPOS est défini mais aucune entrée n'est valide, repli sur le dépôt du cockpit.",
    );
    return [FALLBACK_REPO];
  }
  return parsed;
}

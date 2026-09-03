// L5-T2, source de vérité de la liste des dépôts suivis par le feed Shipped.
//
// Deux sources, dans cet ordre. La table ecosystem_products (L1-T9) d'abord,
// c'est la source de vérité du groupe. La variable d'environnement
// GITHUB_REPOS ensuite, en repli : elle couvre le cas où la migration 0001
// n'a pas encore été passée, où la base est injoignable, ou le développement
// local sans Supabase. Aucun autre fichier ne connaît la liste des dépôts.
//
// Module serveur uniquement : il lit la clé service_role.
//
// Format de GITHUB_REPOS, entrées séparées par des virgules :
//   owner/repo:Produit:Division
// Le produit et la division sont optionnels. Sans produit, le nom du dépôt
// est utilisé. Exemple d'une entrée : iroko-software-group/esg-optimizer:ESG Optimizer:STRATA

import { createServiceClient } from "./supabase/service";

export type TrackedRepo = {
  /** "owner/repo", tel que l'attend l'API GitHub. */
  fullName: string;
  /** Nom lisible affiché en badge à côté du commit. */
  product: string;
  /** Division du groupe (STRATA, IROKO, Cockpit). Vide si non renseignée. */
  division: string;
};

/**
 * C8 et C3, la source qui a effectivement repondu.
 *
 * Le mode degrade de ce resolveur etait MUET jusqu'ici : quand la migration
 * 0001 n'etait pas passee ou que la base ne repondait pas, le feed se
 * reduisait a un seul depot sans que rien ne le dise a l'ecran. Un journal
 * qui montre un dixieme de l'activite en ayant l'air complet ment par
 * omission. La source est donc remontee avec la liste, et l'ecran la nomme.
 */
export type RepoSource = "registre" | "environnement" | "repli";

export type TrackedRepos = {
  repos: TrackedRepo[];
  source: RepoSource;
  /** Raison du repli, en francais courant. Null quand la source est le registre. */
  reason: string | null;
};

/** Dépôt du cockpit lui-même. Repli quand rien n'est configuré, pour que le
 *  feed reste vivant en local sans variable d'environnement. */
const FALLBACK_REPO: TrackedRepo = {
  fullName: "adama-diallo-rse/adama-os",
  product: "Adama OS",
  division: "Cockpit",
};

/** Instance unique du repli, pour que l'appelant puisse la reconnaitre. */
const FALLBACK_LIST: TrackedRepo[] = [FALLBACK_REPO];

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

type ProductRow = {
  name: string | null;
  division: string | null;
  repo_full_name: string | null;
};

/** Source primaire : le registre produits. Tableau vide si la table n'existe
 *  pas encore, si Supabase est injoignable, ou si aucun produit ne porte de
 *  dépôt. L'appelant retombe alors sur l'environnement. */
async function fromEcosystemProducts(): Promise<TrackedRepo[]> {
  const supabase = createServiceClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("ecosystem_products")
    .select("name, division, repo_full_name")
    .not("repo_full_name", "is", null)
    .order("position", { ascending: true });

  if (error) {
    // Table absente tant que la migration 0001 n'est pas passée : ce n'est pas
    // une anomalie, on le dit une fois et on passe au repli.
    console.error("[shipped] ecosystem_products illisible :", error.message);
    return [];
  }

  return ((data as ProductRow[]) ?? [])
    .map((row) => {
      const fullName = row.repo_full_name?.trim() ?? "";
      if (!FULL_NAME_RE.test(fullName)) {
        return null;
      }
      const repoName = fullName.split("/")[1] ?? fullName;
      return {
        fullName,
        product: row.name?.trim() || repoName,
        division: row.division?.trim() || "",
      };
    })
    .filter((r): r is TrackedRepo => r !== null);
}

/** Source de repli : la variable d'environnement. */
function fromEnv(): TrackedRepo[] {
  const raw = process.env.GITHUB_REPOS?.trim();
  if (!raw) {
    return FALLBACK_LIST;
  }
  const parsed = raw
    .split(",")
    .map((entry) => parseEntry(entry))
    .filter((r): r is TrackedRepo => r !== null);

  if (parsed.length === 0) {
    console.error(
      "[shipped] GITHUB_REPOS est défini mais aucune entrée n'est valide, repli sur le dépôt du cockpit.",
    );
    return FALLBACK_LIST;
  }
  return parsed;
}

/**
 * Liste des dépôts à agréger, AVEC la source qui l'a fournie.
 *
 * C'est cette fonction que le journal et la matrice de santé appellent :
 * elles ont besoin de savoir si elles regardent la liste complète du groupe
 * ou un repli, parce que les deux ne racontent pas la même chose.
 */
export async function resolveTrackedRepos(): Promise<TrackedRepos> {
  const fromDb = await fromEcosystemProducts();
  if (fromDb.length > 0) {
    return { repos: fromDb, source: "registre", reason: null };
  }
  const raw = process.env.GITHUB_REPOS?.trim();
  const repos = fromEnv();
  if (raw && repos !== FALLBACK_LIST) {
    return {
      repos,
      source: "environnement",
      reason:
        "Le registre produits n’a pas répondu : la liste des dépôts vient de la configuration, elle peut être incomplète.",
    };
  }
  return {
    repos,
    source: "repli",
    reason:
      "Ni le registre produits ni la configuration n’ont fourni de liste : seul le dépôt de ce site est lu.",
  };
}

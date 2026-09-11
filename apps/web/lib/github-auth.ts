import "server-only";

/**
 * Renvoie le jeton de lecture du propriétaire du dépôt.
 *
 * GitHub limite un jeton finement configuré à un seul propriétaire. Les
 * dépôts suivis vivent chez trois propriétaires, donc un jeton unique ne peut
 * pas tenir le périmètre annoncé. GITHUB_TOKEN reste accepté pendant la
 * migration, après les variables propres à chaque propriétaire.
 */
export function githubTokenForRepo(fullName: string): string | null {
  const owner = fullName.split("/", 1)[0]?.trim().toLowerCase();
  const token =
    owner === "iroko-software-group"
      ? process.env.GITHUB_TOKEN_IROKO_SOFTWARE_GROUP
      : owner === "adama-diallo-rse"
        ? process.env.GITHUB_TOKEN_ADAMA_DIALLO_RSE
        : owner === "strata-esg"
          ? process.env.GITHUB_TOKEN_STRATA_ESG
          : undefined;

  return token?.trim() || process.env.GITHUB_TOKEN?.trim() || null;
}

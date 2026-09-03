// =====================================================================
// C3-T2, la forme de ce qui est observe.
//
// Separe des regles qui en deduisent un etat. Ce fichier dit CE QU'ON
// REGARDE ; criteria.ts dit CE QU'ON EN CONCLUT. La couture est reelle et
// pas cosmetique : lib/health/collect.ts remplit cette forme depuis la base,
// le reseau et les artefacts machine, scripts/failure-drill.mjs la remplit a
// la main pour rejouer une panne, et ni l'un ni l'autre n'a besoin de
// connaitre les regles.
//
// Aucune valeur par defaut ici, volontairement. Une observation absente doit
// se declarer absente (null), jamais prendre une valeur de confort : c'est
// la seule facon d'obtenir un INDETERMINE honnete plutot qu'un vert.
// =====================================================================

/** Nature de la source qui a fourni la liste des depots suivis. */
export type RepoSource = "registre" | "environnement" | "repli";

export type MissingRepo = {
  /** "owner/repo", tel qu'il figure au registre. */
  fullName: string;
  /** Pourquoi il n'est pas lu, en francais courant. */
  reason: string;
};

export type RagVerification = {
  executedAt: string;
  verdict: "ok" | "avertissement" | "echec";
  /** Meilleur score obtenu, toutes questions de controle confondues. */
  best: number;
  /** Plus mauvais des meilleurs scores : c'est lui qui decide. */
  worst: number;
  seuilOk: number;
  seuilEchec: number;
};

export type RestaurationRecord = {
  executedAt: string;
  /**
   * « partiel » : le test a bien tourne, mais aucune table ne portait de
   * ligne. Le chemin est prouve, le contenu ne l'est pas. Ce troisieme etat
   * existe pour qu'une base vide ne delivre pas une attestation de sauvegarde.
   */
  result: "reussi" | "echoue" | "partiel";
  scope: string;
  /** Tables candidates au test. */
  tables: number;
  /** Tables qui portaient au moins une ligne, donc reellement restaurees. */
  exercees: number;
};

export type HealthObservations = {
  base: {
    /** La cle de lecture publique est posee. */
    configured: boolean;
    /** Vrai si une lecture a abouti, faux si elle a echoue, null si non tentee. */
    readOk: boolean | null;
    /** Les colonnes de classe de donnee existent (migration 0003 passee). */
    dataClassReady: boolean | null;
  };
  github: {
    source: RepoSource;
    /** Nombre de depots attendus, d'apres la source qui a repondu. */
    expected: number;
    /** Nombre de depots effectivement lus. */
    read: number;
    missing: MissingRepo[];
    /** Nombre de commits rapportes. Null si le feed n'a pas ete demande. */
    commits: number | null;
  };
  rag: {
    documents: number | null;
    chunks: number | null;
    /** Derniere ingestion connue, ISO 8601. */
    lastIngestionAt: string | null;
    verification: RagVerification | null;
  };
  passerelles: {
    /** Passerelles declarees et effectivement configurees. */
    configured: number;
    /** Passerelles ayant repondu un etat sain. */
    healthy: number;
    /** Produits ayant repondu un etat NON sain : panne produit constatee. */
    unhealthy: string[];
    /** Produits injoignables par la sortie reseau du cockpit : on ne sait pas. */
    unreachable: string[];
  };
  analytique: {
    keyConfigured: boolean;
    /** Region reellement servie, deduite de l'hote configure. */
    region: "UE" | "hors UE" | "inconnue";
    /** Region annoncee par la page de confidentialite. */
    regionAnnoncee: "UE";
    /** Le consentement est demande avant toute mesure. Verrouille par test. */
    consentGate: boolean;
  };
  assistant: {
    modelKeyConfigured: boolean;
    /** Le refus de repondre sans source est verrouille par un test. */
    refuseSansSource: boolean;
  };
  sauvegarde: {
    /** La procedure de sauvegarde existe dans le depot. */
    procedure: boolean;
    restauration: RestaurationRecord | null;
    /** Age au dela duquel un test de restauration ne dit plus rien, en jours. */
    fraicheurJours: number;
  };
};

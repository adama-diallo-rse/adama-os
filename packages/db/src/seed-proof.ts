// =====================================================================
// C2, semis du registre de preuve.
// Lancement : pnpm --filter @adama/db proof:seed
//
// Ce que ce script insere, et ce qu'il n'insere PAS.
//
// Il insere des affirmations et la DECLARATION de leurs preuves : la nature,
// la source, le localisateur, la methode, et qui peut refaire la
// verification. Il laisse observed_at et observed_result a NULL.
//
// Il n'invente aucune observation. Ecrire « observee aujourd'hui, HTTP 200 »
// au moment du semis serait fabriquer une preuve, ce que la couche C2
// interdit explicitement. Les preuves automatisables sont observees pour la
// premiere fois par le cron quotidien /api/ecosystem/sync, qui appelle
// reellement les sources. Tant que cette premiere observation n'a pas eu
// lieu, l'affirmation s'affiche comme non verifiee, et c'est exact.
//
// Les affirmations dont la preuve est un document detenu par Adama sont
// semees en visibilite `interne` : elles ne sont servies nulle part tant
// qu'Adama n'a pas renseigne lui-meme l'observation et bascule la
// visibilite. Le detail de la marche a suivre est en fin de fichier.
//
// Reexecutable : conflit sur l'identifiant ignore, et les preuves ne sont
// inserees que pour les affirmations qui n'en ont aucune.
//
// Regle de tenue : les CHAINES de ce fichier sont affichees telles quelles sur
// /preuves et sur /verifier. Elles portent donc leurs accents. Les
// commentaires, eux, suivent la convention du depot et n'en portent pas.
// =====================================================================

import { config } from "dotenv";

config({ path: ".env" });

import { eq, sql } from "drizzle-orm";
import { proofClaims, proofEvidence } from "./schema";

type ClaimSeed = {
  id: string;
  statement: string;
  subjectType:
    | "produit"
    | "projet"
    | "competence"
    | "experience"
    | "systeme"
    | "metrique";
  subjectRef: string | null;
  dataClass: "real" | "historical" | "demo";
  maxAgeSeconds: number | null;
  visibility: "public" | "technique" | "interne";
  position: number;
  evidence: {
    kind:
      | "api"
      | "depot"
      | "commit"
      | "deploiement"
      | "base"
      | "document"
      | "attestation"
      | "capture";
    source: string;
    locator: string | null;
    method: string;
    verifiableBy: "visiteur" | "adama" | "tiers";
    refreshKind: "http_status" | "github_commit" | "db_count" | null;
    position: number;
  }[];
};

/** Deux jours : le cron passe une fois par jour, une observation qui a saute
 *  deux passages ne decrit plus le present. */
const DEUX_JOURS = 172800;
/** Trente jours, pour ce qui bouge lentement (un depot, un registre). */
const TRENTE_JOURS = 2592000;

const CLAIMS: ClaimSeed[] = [
  {
    id: "strata-scope-en-ligne",
    statement:
      "STRATA Scope, le moteur d’empreinte carbone du groupe, répond en production sur son adresse publique.",
    subjectType: "produit",
    subjectRef: "strata-scope",
    dataClass: "real",
    maxAgeSeconds: DEUX_JOURS,
    visibility: "public",
    position: 10,
    evidence: [
      {
        kind: "api",
        source: "Adresse publique de STRATA Scope",
        locator: "https://scope.esg-optimizer.fr",
        method:
          "Appel GET sur l'adresse publique du produit depuis le cockpit, code de retour conservé tel quel.",
        verifiableBy: "visiteur",
        refreshKind: "http_status",
        position: 10,
      },
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/strata-scope",
        locator: "adama-diallo-rse/strata-scope",
        method:
          "Lecture du dernier commit du dépôt via l'API publique de GitHub.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 20,
      },
    ],
  },
  {
    id: "esg-optimizer-en-ligne",
    statement:
      "ESG Optimizer, l'outil d'audit et de conformité CSRD du groupe, répond en production sur son adresse publique.",
    subjectType: "produit",
    subjectRef: "esg-optimizer",
    dataClass: "real",
    maxAgeSeconds: DEUX_JOURS,
    visibility: "public",
    position: 20,
    evidence: [
      {
        kind: "api",
        source: "Adresse publique d'ESG Optimizer",
        locator: "https://esg-optimizer.fr",
        method:
          "Appel GET sur l'adresse publique du produit depuis le cockpit, code de retour conservé tel quel.",
        verifiableBy: "visiteur",
        refreshKind: "http_status",
        position: 10,
      },
      {
        kind: "depot",
        source: "Dépôt iroko-software-group/esg-optimizer",
        locator: "iroko-software-group/esg-optimizer",
        method:
          "Lecture du dernier commit du dépôt via l'API publique de GitHub.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 20,
      },
    ],
  },
  {
    id: "esg-optimizer-depot-suivi",
    statement:
      "Le code d'ESG Optimizer est versionné dans un dépôt suivi par ce cockpit, dont le dernier commit est lisible publiquement.",
    subjectType: "produit",
    subjectRef: "esg-optimizer",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 22,
    evidence: [
      {
        kind: "depot",
        source: "Dépôt iroko-software-group/esg-optimizer",
        locator: "iroko-software-group/esg-optimizer",
        method:
          "Lecture du dernier commit du dépôt via l'API publique de GitHub, à la même adresse que celle du journal des livraisons.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 10,
      },
    ],
  },
  {
    id: "esg-optimizer-sondes-tracees",
    statement:
      "Ce cockpit conserve la trace datée de chaque interrogation de la route de santé d'ESG Optimizer, y compris de ses échecs et de leur nature.",
    subjectType: "produit",
    subjectRef: "esg-optimizer",
    dataClass: "real",
    maxAgeSeconds: DEUX_JOURS,
    visibility: "public",
    position: 24,
    evidence: [
      {
        kind: "base",
        source: "Table ecosystem_probes",
        locator: "ecosystem_probes",
        method:
          "Comptage des tentatives de sonde enregistrées pour ce produit. Chaque ligne porte sa date, son état et, en cas d'échec, sa nature.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
    ],
  },
  {
    id: "strata-scope-depot-suivi",
    statement:
      "Le code de STRATA Scope est versionné dans un dépôt suivi par ce cockpit, dont le dernier commit est lisible publiquement.",
    subjectType: "produit",
    subjectRef: "strata-scope",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 12,
    evidence: [
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/strata-scope",
        locator: "adama-diallo-rse/strata-scope",
        method:
          "Lecture du dernier commit du dépôt via l'API publique de GitHub, à la même adresse que celle du journal des livraisons.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 10,
      },
    ],
  },
  {
    id: "strata-scope-sondes-tracees",
    statement:
      "Ce cockpit conserve la trace datée de chaque interrogation de la route de santé de STRATA Scope, y compris de ses échecs et de leur nature.",
    subjectType: "produit",
    subjectRef: "strata-scope",
    dataClass: "real",
    maxAgeSeconds: DEUX_JOURS,
    visibility: "public",
    position: 14,
    evidence: [
      {
        kind: "base",
        source: "Table ecosystem_probes",
        locator: "ecosystem_probes",
        method:
          "Comptage des tentatives de sonde enregistrées pour ce produit. Chaque ligne porte sa date, son état et, en cas d'échec, sa nature.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
    ],
  },
  {
    id: "cockpit-code-public",
    statement:
      "Le code de ce site est public et versionné : chaque affirmation qu'il porte est relisible dans son dépôt.",
    subjectType: "systeme",
    subjectRef: "adama-os",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 30,
    evidence: [
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/adama-os",
        locator: "adama-diallo-rse/adama-os",
        method:
          "Lecture du dernier commit du dépôt via l'API publique de GitHub.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 10,
      },
    ],
  },
  {
    id: "registre-produits-en-base",
    statement:
      "La liste des produits du groupe est tenue en base de données, pas écrite en dur dans les pages du site.",
    subjectType: "systeme",
    subjectRef: "ecosystem_products",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 40,
    evidence: [
      {
        kind: "base",
        source: "Table ecosystem_products",
        locator: "ecosystem_products",
        method:
          "Comptage des lignes lisibles publiquement, avec la même clé anonyme que le site.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/adama-os",
        locator: "adama-diallo-rse/adama-os",
        method:
          "Le code de lecture du registre est relisible dans apps/web/app/page.tsx et apps/web/lib/repos.ts.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 20,
      },
    ],
  },
  {
    id: "metriques-portent-leur-provenance",
    statement:
      "Chaque métrique publiée sur ce site porte sa classe de donnée, sa source et sa date de relevé.",
    subjectType: "systeme",
    subjectRef: "ecosystem_analytics",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 50,
    evidence: [
      {
        kind: "base",
        source: "Table ecosystem_analytics",
        locator: "ecosystem_analytics",
        method:
          "Comptage des relevés lisibles publiquement. La colonne data_class est non nulle depuis la migration 0003.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/adama-os",
        locator: "adama-diallo-rse/adama-os",
        method:
          "La règle est tenue par le type Claim, dans apps/web/lib/proof/types.ts, et verrouillée par tests/no-fabrication.test.ts.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 20,
      },
    ],
  },
  {
    id: "sondes-distinguent-les-pannes",
    statement:
      "Le cockpit enregistre la nature de chaque échec de sonde, et ne confond plus une panne d'un produit avec une panne de sa propre sortie réseau.",
    subjectType: "systeme",
    subjectRef: "ecosystem_probes",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "technique",
    position: 60,
    evidence: [
      {
        kind: "base",
        source: "Table ecosystem_probes",
        locator: "ecosystem_probes",
        method:
          "Comptage des tentatives de sonde enregistrées, chacune portant sa nature d'échec.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
      {
        kind: "depot",
        source: "Dépôt adama-diallo-rse/adama-os",
        locator: "adama-diallo-rse/adama-os",
        method:
          "La distinction est faite dans apps/web/lib/ecosystem/client.ts et gateways.ts, et décrite dans la migration 0003.",
        verifiableBy: "visiteur",
        refreshKind: "github_commit",
        position: 20,
      },
    ],
  },
  {
    id: "registre-de-preuve-tenu",
    statement:
      "Les affirmations publiées sur ce site sont enregistrées avec leurs preuves, et aucune affirmation sans preuve n'est affichée.",
    subjectType: "systeme",
    subjectRef: "proof_claims",
    dataClass: "real",
    maxAgeSeconds: TRENTE_JOURS,
    visibility: "public",
    position: 70,
    evidence: [
      {
        kind: "base",
        source: "Table proof_claims",
        locator: "proof_claims",
        method:
          "Comptage des affirmations lisibles publiquement, filtrées par la RLS de la migration 0004.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 10,
      },
      {
        kind: "base",
        source: "Table proof_evidence",
        locator: "proof_evidence",
        method:
          "Comptage des preuves lisibles publiquement. Une affirmation sans preuve est écartée à la lecture par apps/web/lib/proof/claims.ts.",
        verifiableBy: "visiteur",
        refreshKind: "db_count",
        position: 20,
      },
    ],
  },

  // --- Affirmations a preuve humaine, semees en visibilite interne -----
  // Elles ne sont servies nulle part tant qu'Adama n'a pas renseigne
  // lui-meme l'observation. Voir la marche a suivre en fin de fichier.
  {
    id: "stage-ag2r-data-esg",
    statement:
      "Adama Diallo effectue un stage Data ESG et solutions IA à la direction RSE d'AG2R LA MONDIALE.",
    subjectType: "experience",
    subjectRef: "AG2R LA MONDIALE",
    dataClass: "real",
    maxAgeSeconds: null,
    visibility: "interne",
    position: 100,
    evidence: [
      {
        kind: "document",
        source: "Convention de stage",
        locator: null,
        method:
          "Document signé par l'établissement, l'entreprise et le stagiaire, détenu par Adama et communicable sur demande.",
        verifiableBy: "adama",
        refreshKind: null,
        position: 10,
      },
    ],
  },
  {
    id: "coordination-rse-younivibe",
    statement:
      "Adama Diallo a assuré la coordination RSE et le reporting de durabilité chez Younivibe.",
    subjectType: "experience",
    subjectRef: "Younivibe",
    dataClass: "historical",
    maxAgeSeconds: null,
    visibility: "interne",
    position: 110,
    evidence: [
      {
        kind: "attestation",
        source: "Attestation de l'employeur",
        locator: null,
        method:
          "Attestation détenue par Adama, communicable sur demande à un recruteur.",
        verifiableBy: "adama",
        refreshKind: null,
        position: 10,
      },
    ],
  },
];

async function seedProof() {
  console.log("→ Semis du registre de preuve (C2) : demarrage");

  const { db } = await import("./client");

  const insertedClaims = await db
    .insert(proofClaims)
    .values(
      CLAIMS.map((c) => ({
        id: c.id,
        statement: c.statement,
        subjectType: c.subjectType,
        subjectRef: c.subjectRef,
        dataClass: c.dataClass,
        maxAgeSeconds: c.maxAgeSeconds,
        visibility: c.visibility,
        position: c.position,
      })),
    )
    .onConflictDoNothing({ target: proofClaims.id })
    .returning({ id: proofClaims.id });

  console.log(
    `  ✓ proof_claims : ${insertedClaims.length} inseree(s), ${CLAIMS.length - insertedClaims.length} deja presente(s)`,
  );

  let preuves = 0;
  for (const claim of CLAIMS) {
    const existantes = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(proofEvidence)
      .where(eq(proofEvidence.claimId, claim.id));

    if ((existantes[0]?.n ?? 0) > 0) {
      continue;
    }

    await db.insert(proofEvidence).values(
      claim.evidence.map((e) => ({
        claimId: claim.id,
        kind: e.kind,
        source: e.source,
        locator: e.locator,
        method: e.method,
        // Jamais d'observation au semis. Voir l'en-tete de ce fichier.
        observedAt: null,
        observedResult: null,
        verifiableBy: e.verifiableBy,
        refreshKind: e.refreshKind,
        position: e.position,
      })),
    );
    preuves += claim.evidence.length;
  }

  console.log(`  ✓ proof_evidence : ${preuves} preuve(s) declaree(s)`);
  console.log("");
  console.log(
    "  Aucune observation n'a ete ecrite. Les preuves automatisables",
  );
  console.log("  seront observees au premier passage du cron quotidien :");
  console.log('    curl -H "Authorization: Bearer <CRON_SECRET>" \\');
  console.log("         <origine du site>/api/ecosystem/sync");
  console.log("");
  console.log(
    "  Les deux affirmations d'experience sont en visibilite interne.",
  );
  console.log("  Pour les publier, renseigner l'observation puis basculer :");
  console.log("    update proof_evidence");
  console.log("       set observed_at = now(),");
  console.log(
    "           observed_result = 'Convention de stage signee le <date>, verifiee par Adama'",
  );
  console.log("     where claim_id = 'stage-ag2r-data-esg';");
  console.log("    update proof_claims set visibility = 'public'");
  console.log("     where id = 'stage-ag2r-data-esg';");
  console.log("→ Semis termine.");
}

seedProof()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Echec du semis de preuve :", err);
    process.exit(1);
  });

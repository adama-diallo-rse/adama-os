// =====================================================================
// C3-T2, les criteres metier, capacite par capacite.
//
// Ce fichier ne lit rien. Il recoit des OBSERVATIONS deja faites et il en
// deduit des criteres. C'est ce qui le rend testable sans base, sans reseau
// et sans variable d'environnement, et c'est ce qui permet a
// scripts/failure-drill.mjs de rejouer chaque mode de panne en local.
//
// Regle de redaction tenue partout ici : le champ `observed` est une phrase
// de francais courant, destinee a un visiteur. Jamais un code HTTP, jamais un
// message d'exception, jamais un nom de service technique non public.
// =====================================================================

import type { Capability, Criterion, CriterionVerdict } from "./types";
import type { HealthObservations, RepoSource } from "./observations";

export type {
  HealthObservations,
  MissingRepo,
  RagVerification,
  RepoSource,
  RestaurationRecord,
} from "./observations";

function critere(
  id: string,
  label: string,
  verdict: CriterionVerdict,
  observed: string,
): Criterion {
  return { id, label, verdict, observed };
}

/** Age en jours d'un horodatage ISO. Null si la date est absente ou illisible. */
export function ageEnJours(iso: string | null, now: Date): number | null {
  if (!iso) {
    return null;
  }
  const t = Date.parse(iso);
  if (Number.isNaN(t)) {
    return null;
  }
  return Math.max(0, Math.floor((now.getTime() - t) / 86400000));
}

function pluriel(n: number, singulier: string, plurielMot = `${singulier}s`) {
  return n > 1 ? plurielMot : singulier;
}

// --- Base de donnees ---------------------------------------------------

function baseCapability(o: HealthObservations["base"]): Capability {
  const criteria: Criterion[] = [
    critere(
      "base-configuree",
      "La lecture publique est configurée",
      o.configured ? "tenu" : "non_tenu",
      o.configured
        ? "La clé de lecture publique est posée."
        : "La clé de lecture publique n’est pas posée : le site ne peut lire aucune donnée.",
    ),
    critere(
      "base-lecture",
      "Une lecture aboutit",
      o.readOk === null ? "inconnu" : o.readOk ? "tenu" : "non_tenu",
      o.readOk === null
        ? "Aucune lecture n’a été tentée pendant ce contrôle."
        : o.readOk
          ? "Une lecture de contrôle a abouti."
          : "La base n’a pas répondu à la lecture de contrôle.",
    ),
    critere(
      "base-classes",
      "Chaque valeur peut porter sa classe de donnée",
      o.dataClassReady === null
        ? "inconnu"
        : o.dataClassReady
          ? "tenu"
          : "non_tenu",
      o.dataClassReady === null
        ? "L’état du schéma n’a pas pu être établi."
        : o.dataClassReady
          ? "Les colonnes de provenance sont en place."
          : "Les colonnes de provenance manquent : les valeurs ne peuvent pas porter leur classe, elles ne sont donc pas affichées.",
    ),
  ];
  return {
    id: "base",
    name: "Base de données",
    purpose:
      "Sert les affirmations, les décisions, la trajectoire et le registre produits.",
    criteria,
  };
}

// --- Feed GitHub --------------------------------------------------------

const SOURCE_DEPOTS: Record<RepoSource, string> = {
  registre: "Les dépôts suivis viennent du registre produits.",
  environnement:
    "Les dépôts suivis viennent de la configuration, pas du registre produits : la liste peut être incomplète.",
  repli:
    "Aucune liste de dépôts n’a été trouvée, le journal se limite au dépôt de ce site.",
};

function githubCapability(o: HealthObservations["github"]): Capability {
  const manquants = o.missing.length;
  const criteria: Criterion[] = [
    critere(
      "github-source",
      "La liste des dépôts vient du registre produits",
      o.source === "registre" ? "tenu" : "non_tenu",
      SOURCE_DEPOTS[o.source] ?? SOURCE_DEPOTS.repli,
    ),
    critere(
      "github-couverture",
      "Tous les dépôts attendus sont lus",
      manquants === 0 ? "tenu" : "non_tenu",
      manquants === 0
        ? `Les ${o.read} dépôts attendus sont lus.`
        : `${o.read} ${pluriel(o.read, "dépôt")} sur ${o.expected} ${pluriel(
            o.expected,
            "lu",
          )}, ${manquants} ${pluriel(manquants, "manquant")} et ${pluriel(
            manquants,
            "nommé",
          )} plus bas.`,
    ),
    critere(
      "github-contenu",
      "Le journal rapporte au moins une contribution",
      o.commits === null ? "inconnu" : o.commits > 0 ? "tenu" : "non_tenu",
      o.commits === null
        ? "Le journal n’a pas été demandé pendant ce contrôle."
        : o.commits > 0
          ? `${o.commits} ${pluriel(o.commits, "contribution")} ${pluriel(
              o.commits,
              "rapportée",
            )}.`
          : "Aucune contribution n’a été rapportée.",
    ),
  ];
  return {
    id: "github",
    name: "Journal de construction",
    purpose:
      "Agrège les contributions réelles des dépôts du groupe, sans en inventer aucune.",
    criteria,
  };
}

// --- Moteur de recherche documentaire ------------------------------------

function ragCapability(o: HealthObservations["rag"], now: Date): Capability {
  const v = o.verification;
  const age = ageEnJours(o.lastIngestionAt, now);
  const criteria: Criterion[] = [
    critere(
      "rag-documents",
      "Le corpus contient au moins un document",
      o.documents === null ? "inconnu" : o.documents > 0 ? "tenu" : "non_tenu",
      o.documents === null
        ? "Le contenu du corpus n’a pas pu être lu."
        : o.documents > 0
          ? `${o.documents} ${pluriel(o.documents, "document")} en base.`
          : "Le corpus est vide : l’assistant ne peut répondre sur rien.",
    ),
    critere(
      "rag-fragments",
      "Les documents sont découpés et indexés",
      o.chunks === null ? "inconnu" : o.chunks > 0 ? "tenu" : "non_tenu",
      o.chunks === null
        ? "Le nombre de fragments n’a pas pu être lu."
        : o.chunks > 0
          ? `${o.chunks} ${pluriel(o.chunks, "fragment")} ${pluriel(
              o.chunks,
              "indexé",
            )}.`
          : "Aucun fragment indexé : le corpus est présent mais inexploitable.",
    ),
    critere(
      "rag-ingestion",
      "La dernière ingestion est datée",
      age === null ? "inconnu" : "tenu",
      age === null
        ? "La date de la dernière ingestion n’est pas connue."
        : age === 0
          ? "Dernière ingestion aujourd’hui."
          : `Dernière ingestion il y a ${age} ${pluriel(age, "jour")}.`,
    ),
    critere(
      "rag-pertinence",
      "La question de contrôle ramène une source pertinente",
      // Un avertissement N'EST PAS un critere tenu. La commande de
      // verification tolere la zone grise et sort en code 0 : elle ne bloque
      // pas une mise en ligne pour un corpus juste au-dessus du bruit. La
      // matrice, elle, decrit ce qu'un lecteur obtiendrait, et un corpus qui
      // repond mal est DEGRADE. « Un RAG qui repond mais dont le corpus ne
      // couvre pas le sujet est degrade, pas operationnel. »
      !v ? "inconnu" : v.verdict === "ok" ? "tenu" : "non_tenu",
      !v
        ? "Aucune vérification de pertinence n’a été enregistrée."
        : v.verdict === "echec"
          ? `La question de contrôle ne ramène que du bruit, meilleur score ${v.worst.toFixed(
              2,
            )} pour un seuil d’échec à ${v.seuilEchec.toFixed(2)}.`
          : v.verdict === "avertissement"
            ? `Pertinence juste au-dessus du seuil d’échec, meilleur score ${v.worst.toFixed(
                2,
              )} pour un seuil de réussite à ${v.seuilOk.toFixed(2)}.`
            : `Pertinence vérifiée, meilleur score ${v.best.toFixed(2)}.`,
    ),
  ];
  return {
    id: "rag",
    name: "Moteur de recherche documentaire",
    purpose:
      "Retrouve dans le corpus les passages qui fondent une réponse de l’assistant.",
    criteria,
  };
}

// --- Passerelles vers les produits ----------------------------------------

function passerellesCapability(
  o: HealthObservations["passerelles"],
): Capability {
  const criteria: Criterion[] = [
    critere(
      "passerelles-configurees",
      "Au moins une passerelle est configurée",
      o.configured > 0 ? "tenu" : "inconnu",
      o.configured > 0
        ? `${o.configured} ${pluriel(o.configured, "passerelle")} ${pluriel(
            o.configured,
            "configurée",
          )}.`
        : "Aucune passerelle n’est configurée : l’état des produits n’est pas mesuré.",
    ),
    critere(
      "passerelles-produits",
      "Aucun produit n’a répondu un état non sain",
      o.unhealthy.length === 0 ? "tenu" : "non_tenu",
      o.unhealthy.length === 0
        ? "Aucun produit ne s’est déclaré en panne."
        : `${o.unhealthy.join(", ")} ${pluriel(
            o.unhealthy.length,
            "s’est déclaré",
            "se sont déclarés",
          )} en panne.`,
    ),
    // C3-T5. Une sortie reseau coupee n'est PAS une panne produit. Elle rend
    // l'etat indetermine, et le dire est exactement ce que la couche exige.
    critere(
      "passerelles-joignables",
      "Chaque produit interrogé a pu être joint",
      o.unreachable.length === 0 ? "tenu" : "inconnu",
      o.unreachable.length === 0
        ? "Tous les produits interrogés ont répondu."
        : `${o.unreachable.join(", ")} ${pluriel(
            o.unreachable.length,
            "n’a pas pu être joint",
            "n’ont pas pu être joints",
          )} depuis ce site. L’état du produit lui-même reste inconnu.`,
    ),
  ];
  return {
    id: "passerelles",
    name: "Passerelles vers les produits",
    purpose:
      "Lit l’état des produits du groupe, en lecture seule, et n’écrit jamais chez eux.",
    criteria,
  };
}

// --- Analytique -----------------------------------------------------------

function analytiqueCapability(o: HealthObservations["analytique"]): Capability {
  const criteria: Criterion[] = [
    critere(
      "analytique-configuree",
      "La mesure d’audience est configurée",
      o.keyConfigured ? "tenu" : "inconnu",
      o.keyConfigured
        ? "La mesure d’audience est active."
        : "Aucune mesure d’audience n’est configurée : rien n’est collecté, et rien n’est donc mesuré.",
    ),
    critere(
      "analytique-consentement",
      "Rien n’est collecté avant le consentement",
      o.consentGate ? "tenu" : "non_tenu",
      o.consentGate
        ? "Les événements attendent le consentement, et sont effacés en cas de refus."
        : "Des événements partent avant le consentement.",
    ),
    // C11-T7 et C3-T6 : tant que la region reelle ne rejoint pas la region
    // annoncee, la contradiction est affichee, ici et au registre des limites.
    critere(
      "analytique-region",
      "La région servie est celle annoncée",
      o.region === "inconnue"
        ? "inconnu"
        : o.region === o.regionAnnoncee
          ? "tenu"
          : "non_tenu",
      o.region === "inconnue"
        ? "La région de traitement n’a pas pu être établie."
        : o.region === o.regionAnnoncee
          ? "La région de traitement est celle annoncée sur la page de confidentialité."
          : "La mesure d’audience est traitée hors de l’Union européenne, alors que la page de confidentialité annonce l’Union européenne.",
    ),
  ];
  return {
    id: "analytique",
    name: "Mesure d’audience",
    purpose:
      "Compte les parcours, après consentement, sans jamais identifier un visiteur.",
    criteria,
  };
}

// --- Assistant conversationnel ---------------------------------------------

function assistantCapability(
  o: HealthObservations["assistant"],
  rag: Capability,
): Capability {
  const corpusUtilisable = rag.criteria
    .filter((c) => c.id === "rag-documents" || c.id === "rag-fragments")
    .every((c) => c.verdict === "tenu");
  const corpusInconnu = rag.criteria.some(
    (c) =>
      (c.id === "rag-documents" || c.id === "rag-fragments") &&
      c.verdict === "inconnu",
  );

  const criteria: Criterion[] = [
    critere(
      "assistant-modele",
      "Le fournisseur de modèle est configuré",
      o.modelKeyConfigured ? "tenu" : "non_tenu",
      o.modelKeyConfigured
        ? "L’accès au fournisseur de modèle est configuré."
        : "L’accès au fournisseur de modèle n’est pas configuré : l’assistant se déclare hors service au lieu de répondre de mémoire.",
    ),
    critere(
      "assistant-corpus",
      "L’assistant dispose d’un corpus à citer",
      corpusInconnu ? "inconnu" : corpusUtilisable ? "tenu" : "non_tenu",
      corpusInconnu
        ? "L’état du corpus documentaire n’a pas pu être établi."
        : corpusUtilisable
          ? "Le corpus documentaire est exploitable."
          : "Le corpus documentaire est vide ou inexploitable : l’assistant refusera de répondre.",
    ),
    critere(
      "assistant-refus",
      "Aucune réponse n’est produite sans source",
      o.refuseSansSource ? "tenu" : "non_tenu",
      o.refuseSansSource
        ? "Le refus de répondre sans source est verrouillé par un test automatique."
        : "Le refus de répondre sans source n’est plus verrouillé.",
    ),
  ];
  return {
    id: "assistant",
    name: "Assistant conversationnel",
    purpose:
      "Répond sur le corpus documentaire, avec ses sources, ou ne répond pas.",
    criteria,
  };
}

// --- Sauvegarde -------------------------------------------------------------

function sauvegardeCapability(
  o: HealthObservations["sauvegarde"],
  now: Date,
): Capability {
  const r = o.restauration;
  const age = ageEnJours(r?.executedAt ?? null, now);
  const perime = age !== null && age > o.fraicheurJours;

  const criteria: Criterion[] = [
    critere(
      "sauvegarde-procedure",
      "Une procédure de sauvegarde existe",
      o.procedure ? "tenu" : "non_tenu",
      o.procedure
        ? "La procédure d’export est versionnée dans le dépôt."
        : "Aucune procédure d’export n’est versionnée.",
    ),
    critere(
      "sauvegarde-restauration",
      "La restauration a été testée pour de vrai",
      !r || r.result === "echoue"
        ? "non_tenu"
        : r.result === "partiel" || perime
          ? "inconnu"
          : "tenu",
      !r
        ? "Aucun test de restauration n’a été enregistré : la politique de sauvegarde reste une intention."
        : r.result === "echoue"
          ? "Le dernier test de restauration a échoué."
          : r.result === "partiel"
            ? "Le dernier test a parcouru le chemin complet, mais aucune table ne portait de ligne : rien n’a été restauré, donc rien n’est prouvé du contenu."
            : perime
              ? `Le dernier test de restauration remonte à ${age} jours, il ne dit plus rien du présent.`
              : `Restauration testée il y a ${age} ${pluriel(
                  age ?? 0,
                  "jour",
                )}, sur ${r.exercees} ${pluriel(
                  r.exercees,
                  "table",
                )} portant des lignes, ${r.tables} ${pluriel(
                  r.tables,
                  "candidate",
                )}, ${r.scope}.`,
    ),
    critere(
      "sauvegarde-selective",
      "La restauration reste sélective",
      !r ? "inconnu" : /sélectiv|table/i.test(r.scope) ? "tenu" : "non_tenu",
      !r
        ? "La portée de la restauration n’est pas documentée."
        : /sélectiv|table/i.test(r.scope)
          ? "La restauration porte sur les seules tables de ce site, jamais sur la base entière."
          : "La portée enregistrée n’est pas sélective, alors que la base est partagée avec deux produits.",
    ),
  ];
  return {
    id: "sauvegarde",
    name: "Sauvegarde et reprise",
    purpose:
      "Permet de reconstituer les données écrites à la main sans toucher aux produits voisins.",
    criteria,
  };
}

/**
 * Les sept capacites, dans l'ordre d'affichage. Aucune n'est omise quand elle
 * va mal, et aucune n'est ajoutee quand elle va bien.
 */
export function buildCapabilities(
  o: HealthObservations,
  now: Date = new Date(),
): Capability[] {
  const rag = ragCapability(o.rag, now);
  return [
    baseCapability(o.base),
    githubCapability(o.github),
    rag,
    passerellesCapability(o.passerelles),
    analytiqueCapability(o.analytique),
    assistantCapability(o.assistant, rag),
    sauvegardeCapability(o.sauvegarde, now),
  ];
}

// =====================================================================
// C2-T5, la sortie machine.
//
// Un document stable, servi à /.well-known/adama-os.json, qui décrit le site
// et ses affirmations vérifiables. Destiné aux programmes : moteurs de
// recherche, agents, outils de veille, ou n'importe qui préférant lire du
// JSON plutôt qu'une page.
//
// Deux règles tenues ici.
//
// 1. N'expose AUCUNE information qui ne soit pas déjà publique sur le site.
//    Ce document est un autre chemin vers les mêmes faits, jamais une porte
//    dérobée vers des faits supplémentaires. Les affirmations internes ne le
//    traversent pas, la RLS les a déjà écartées.
// 2. Le schéma est versionné et validé par son propre validateur, utilisé
//    par le test. Un document machine qu'aucun programme ne peut valider
//    n'est pas un contrat, c'est une promesse.
// =====================================================================

import { CONTACT_EMAIL } from "../../components/types";
import {
  DEMANDE,
  IDENTITE,
  POSTE_ACTUEL,
  RECHERCHE,
} from "../../content/profil";
import { SITE_URL, absoluteUrl } from "../site";
import { resolveClaimState } from "./types";
import type { ProofClaim } from "./claims";

export const WELL_KNOWN_SCHEMA_VERSION = "1.0";

export type WellKnownEvidence = {
  kind: string;
  source: string;
  locator: string | null;
  method: string;
  observed_at: string | null;
  observed_result: string | null;
  verifiable_by: string;
};

export type WellKnownClaim = {
  id: string;
  statement: string;
  subject_type: string;
  subject_ref: string | null;
  data_class: string;
  state: string;
  verify_url: string;
  max_age_seconds: number | null;
  evidence: WellKnownEvidence[];
};

export type WellKnownProduct = {
  slug: string;
  name: string;
  division: string;
  status: string;
  url: string | null;
};

export type WellKnownDocument = {
  schema_version: string;
  site: { url: string; name: string; language: string };
  person: {
    name: string;
    role: string;
    seeking: string;
    available_from: string;
    location: string;
    contact: string;
  };
  products: WellKnownProduct[];
  claims: WellKnownClaim[];
  last_verification: string | null;
  documentation: { human: string; machine: string; text: string };
};

/**
 * Faits déjà publiés sur la home et dans le JSON-LD du layout.
 *
 * C9-T8 : ces valeurs ne s'écrivent plus ici. Elles étaient recopiées, et
 * elles avaient déjà divergé : ce document annonçait « chargé de mission
 * Data ESG » là où la page annonce « Chargé de mission RSE et data ESG ».
 * Un agent qui pré-filtre une candidature lisait donc un intitulé que le
 * site ne portait pas. Une seule source désormais, content/profil.ts, et
 * tests/profil.test.ts refuse qu'un intitulé se réécrive ailleurs.
 */
const PERSONNE = {
  name: IDENTITE.nom,
  role: POSTE_ACTUEL,
  seeking: DEMANDE,
  available_from: RECHERCHE.disponibleLe,
  location: `${RECHERCHE.zone}, France`,
  contact: CONTACT_EMAIL,
};

export function buildWellKnown(
  claims: ProofClaim[],
  products: WellKnownProduct[],
  now: Date = new Date(),
): WellKnownDocument {
  const observations = claims
    .map((c) => c.claim.fetchedAt)
    .filter((d): d is string => Boolean(d))
    .sort();

  return {
    schema_version: WELL_KNOWN_SCHEMA_VERSION,
    site: { url: SITE_URL, name: "Adama OS", language: "fr-FR" },
    person: PERSONNE,
    products,
    claims: claims.map((c) => ({
      id: c.row.id,
      statement: c.row.statement,
      subject_type: c.row.subject_type,
      subject_ref: c.row.subject_ref,
      data_class: c.row.data_class,
      state: resolveClaimState(c.claim, now),
      verify_url: absoluteUrl(`/verifier/${c.row.id}`),
      max_age_seconds: c.row.max_age_seconds,
      evidence: c.evidence.map((e) => ({
        kind: e.kind,
        source: e.source,
        locator: e.locator,
        method: e.method,
        observed_at: e.observed_at,
        observed_result: e.observed_result,
        verifiable_by: e.verifiable_by,
      })),
    })),
    last_verification: observations.at(-1) ?? null,
    documentation: {
      human: absoluteUrl("/preuves"),
      machine: absoluteUrl("/.well-known/adama-os.json"),
      text: absoluteUrl("/llms.txt"),
    },
  };
}

/**
 * Validateur du document, utilisé par le test et utilisable par un tiers.
 * Renvoie la liste des manquements, vide quand le document est conforme.
 */
export function validateWellKnown(doc: unknown): string[] {
  const erreurs: string[] = [];
  const d = doc as Partial<WellKnownDocument>;

  if (d?.schema_version !== WELL_KNOWN_SCHEMA_VERSION) {
    erreurs.push(`schema_version doit valoir ${WELL_KNOWN_SCHEMA_VERSION}`);
  }
  if (!d?.site?.url?.startsWith("http")) {
    erreurs.push("site.url doit être une URL absolue");
  }
  if (!d?.person?.name) {
    erreurs.push("person.name est obligatoire");
  }
  if (!Array.isArray(d?.products)) {
    erreurs.push("products doit être un tableau");
  }
  if (!Array.isArray(d?.claims)) {
    erreurs.push("claims doit être un tableau");
    return erreurs;
  }

  const vus = new Set<string>();
  const classes = new Set(["real", "historical", "demo"]);
  const etats = new Set(["real", "historical", "demo", "absent", "stale"]);

  for (const c of d.claims) {
    if (!c.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) {
      erreurs.push(`identifiant invalide : ${String(c.id)}`);
    }
    if (vus.has(c.id)) {
      erreurs.push(`identifiant en double : ${c.id}`);
    }
    vus.add(c.id);
    if (!c.statement || c.statement.length < 10) {
      erreurs.push(`affirmation trop courte : ${c.id}`);
    }
    if (!classes.has(c.data_class)) {
      erreurs.push(`classe inconnue sur ${c.id} : ${c.data_class}`);
    }
    if (!etats.has(c.state)) {
      erreurs.push(`état inconnu sur ${c.id} : ${c.state}`);
    }
    if (!c.verify_url?.includes(`/verifier/${c.id}`)) {
      erreurs.push(`verify_url incohérente sur ${c.id}`);
    }
    // La règle dure de la couche, vérifiée jusque dans la sortie machine.
    if (!Array.isArray(c.evidence) || c.evidence.length === 0) {
      erreurs.push(`affirmation sans preuve : ${c.id}`);
      continue;
    }
    for (const e of c.evidence) {
      if (!e.source || !e.method) {
        erreurs.push(`preuve sans source ou sans méthode sur ${c.id}`);
      }
      // Une observation datée dit ce qui a été constaté, et réciproquement.
      const dateSeule = Boolean(e.observed_at) !== Boolean(e.observed_result);
      if (dateSeule) {
        erreurs.push(`observation incomplète sur ${c.id}`);
      }
    }
  }

  return erreurs;
}

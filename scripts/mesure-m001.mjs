#!/usr/bin/env node
// =====================================================================
// EM2, la mesure de résultat de M-001, Evidence-First ESG Architecture.
//
//   node scripts/mesure-m001.mjs                 relevé, sortie JSON sur stdout
//   node scripts/mesure-m001.mjs --ecrire        écrit aussi le relevé daté dans
//                                                apps/web/content/mesures/
//
// Ce que le script mesure : la part des preuves publiques du site qu'un
// tiers, sans compte et sans accès privé, ré-observe lui-même avec un
// résultat qui concorde avec ce que le site a publié. C'est un résultat de
// la méthode, pas une description de l'architecture : le script ne lit
// aucun fichier du dépôt, il part de ce que le site sert à n'importe qui.
//
// Node pur, aucune dépendance, aucun jeton. Trois sources publiques :
//   1. https://adamesg-os.fr/.well-known/adama-os.json, la liste des preuves ;
//   2. l'adresse de chaque preuve, appelée telle quelle ;
//   3. l'API publique de GitHub sans jeton, et l'API REST de la base avec la
//      clé anonyme que le site sert à tout navigateur (elle est découverte
//      dans ses fichiers statiques, jamais lue dans un fichier privé).
//
// Règle de concordance, écrite avant le relevé du 27 septembre 2026 :
//   api    : le code HTTP ré-observé est égal au code publié ;
//   depot  : le commit publié existe publiquement dans le dépôt nommé, à la
//            date publiée ;
//   base   : la table est lisible sans compte et le nombre de lignes
//            ré-observé est égal au nombre publié. Un nombre différent est
//            classé « reproduit, valeur changée », jamais concordant ;
//   autre  : non reproductible par ce protocole, compté comme tel.
// Une preuve que le site déclare lui-même non vérifiable par un visiteur
// (verifiable_by différent de « visiteur ») est classée « déclarée hors
// tiers » : elle n'est ni concordante ni discordante, elle est honnête.
// =====================================================================

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = process.env.MESURE_SITE ?? "https://adamesg-os.fr";
const ECRIRE = process.argv.includes("--ecrire");
const RACINE = dirname(dirname(fileURLToPath(import.meta.url)));
const DELAI_MS = 15_000;

async function lire(url, init = {}) {
  const controleur = new AbortController();
  const minuteur = setTimeout(() => controleur.abort(), DELAI_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controleur.signal,
      headers: { "User-Agent": "mesure-m001-tiers", ...(init.headers ?? {}) },
    });
  } finally {
    clearTimeout(minuteur);
  }
}

/** Retrouve l'adresse de la base et la clé anonyme dans les fichiers servis. */
async function decouvrirBasePublique() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return {
      url: process.env.SUPABASE_URL,
      cle: process.env.SUPABASE_ANON_KEY,
      origine: "variables fournies par le tiers",
    };
  }
  const page = await (await lire(`${SITE}/`)).text();
  const scripts = [
    ...new Set(page.match(/\/_next\/static\/chunks\/[^"']+\.js/g) ?? []),
  ];
  for (const chemin of scripts) {
    const code = await (await lire(`${SITE}${chemin}`)).text();
    const url = code.match(/https:\/\/[a-z0-9]{20}\.supabase\.co/)?.[0];
    const cle = code.match(
      /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    )?.[0];
    if (url && cle) {
      return { url, cle, origine: `fichier public ${chemin}` };
    }
  }
  return null;
}

function nombrePublie(texte) {
  const m = /^(\d+) ligne/.exec(texte ?? "");
  return m ? Number(m[1]) : null;
}

async function reobserver(preuve, base) {
  const { kind, locator, observed_result: publie } = preuve;
  if (preuve.verifiable_by && preuve.verifiable_by !== "visiteur") {
    return {
      verdict: "hors_tiers",
      reobserve: `déclarée vérifiable par ${preuve.verifiable_by}`,
    };
  }
  try {
    if (kind === "api") {
      const r = await lire(locator, { redirect: "follow" });
      const codePublie = Number(/HTTP (\d{3})/.exec(publie ?? "")?.[1]);
      return {
        verdict: r.status === codePublie ? "concordant" : "discordant",
        reobserve: `HTTP ${r.status}`,
      };
    }
    if (kind === "depot") {
      const [, sha, date] =
        /commit ([0-9a-f]{7,40}) du (\d{4}-\d{2}-\d{2})/.exec(publie ?? "") ??
        [];
      if (!sha)
        return {
          verdict: "non_reproductible",
          reobserve: "résultat publié illisible",
        };
      const r = await lire(
        `https://api.github.com/repos/${locator}/commits/${sha}`,
        {
          headers: { Accept: "application/vnd.github+json" },
        },
      );
      if (!r.ok)
        return { verdict: "discordant", reobserve: `GitHub ${r.status}` };
      const commit = await r.json();
      const dateVue = commit?.commit?.committer?.date?.slice(0, 10);
      return {
        verdict: dateVue === date ? "concordant" : "discordant",
        reobserve: `commit ${commit.sha.slice(0, 7)} du ${dateVue}`,
      };
    }
    if (kind === "base") {
      if (!base)
        return {
          verdict: "non_reproductible",
          reobserve: "clé publique introuvable",
        };
      // La clé anonyme ne lit que des colonnes nommées sur certaines tables
      // (migration 0003) : demander toutes les colonnes serait refusé. On
      // demande la seule colonne id, ouverte partout où la table est publique.
      const r = await lire(`${base.url}/rest/v1/${locator}?select=id&limit=1`, {
        headers: {
          apikey: base.cle,
          Authorization: `Bearer ${base.cle}`,
          Prefer: "count=exact",
        },
      });
      const total = Number(r.headers.get("content-range")?.split("/")[1]);
      if (!r.ok || Number.isNaN(total)) {
        return { verdict: "non_reproductible", reobserve: `REST ${r.status}` };
      }
      return {
        verdict:
          total === nombrePublie(publie) ? "concordant" : "valeur_changee",
        reobserve: `${total} ligne(s) lisibles sans compte`,
      };
    }
    return {
      verdict: "non_reproductible",
      reobserve: `nature ${kind} hors protocole`,
    };
  } catch (erreur) {
    return {
      verdict: "non_reproductible",
      reobserve: `échec réseau : ${erreur.name}`,
    };
  }
}

const debut = new Date();
const wk = await (await lire(`${SITE}/.well-known/adama-os.json`)).json();
const base = await decouvrirBasePublique();

const preuves = [];
for (const claim of wk.claims) {
  for (const preuve of claim.evidence) {
    const resultat = await reobserver(preuve, base);
    preuves.push({
      affirmation: claim.id,
      nature: preuve.kind,
      adresse: preuve.locator,
      publie: preuve.observed_result,
      publieLe: preuve.observed_at,
      verifiablePar: preuve.verifiable_by,
      ...resultat,
    });
  }
}

const compter = (v) => preuves.filter((p) => p.verdict === v).length;
const releve = {
  mesure: "M-001, taux de reproduction tierce des preuves publiques",
  protocole: "scripts/mesure-m001.mjs",
  site: SITE,
  releveLe: debut.toISOString(),
  derniereVerificationDuSite: wk.last_verification,
  basePublique: base ? base.origine : null,
  affirmations: wk.claims.length,
  preuves,
  totaux: {
    preuves: preuves.length,
    concordant: compter("concordant"),
    valeurChangee: compter("valeur_changee"),
    discordant: compter("discordant"),
    nonReproductible: compter("non_reproductible"),
    horsTiers: compter("hors_tiers"),
  },
};

const sortie = JSON.stringify(releve, null, 2);
process.stdout.write(`${sortie}\n`);

if (ECRIRE) {
  const jour = debut.toISOString().slice(0, 10);
  const cible = join(
    RACINE,
    "apps",
    "web",
    "content",
    "mesures",
    `m001-${jour}.json`,
  );
  mkdirSync(dirname(cible), { recursive: true });
  writeFileSync(cible, `${sortie}\n`, "utf8");
  process.stderr.write(`Relevé écrit : ${cible}\n`);
}

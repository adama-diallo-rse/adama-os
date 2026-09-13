#!/usr/bin/env node
// =====================================================================
// C12-T5 et C12-T6, l'audit de rendu.
//
//   node scripts/audit-render.mjs                 contre http://localhost:3000
//   node scripts/audit-render.mjs --base http://localhost:3111
//
// Pourquoi ce script existe. Un typage vert, des tests verts et une
// construction reussie ne disent RIEN du rendu. La passe du 2 septembre 2026
// l'a montre : 416 tests verts, zero erreur de type, et pourtant une carte
// projet illisible, quinze textes en or trop clair, trois sauts de niveau de
// titre, un lien d'evitement imprime sur chaque page d'un dossier de
// candidature, et le panneau de l'assistant entierement invisible sur
// l'accueil. Rien de tout cela n'etait detectable autrement.
//
// Cinq controles, et ils ne se remplacent pas :
//   1. CONTRASTE reel. Remonter le fond effectif de chaque noeud de texte,
//      calculer le rapport WCAG, comparer au seuil selon la taille.
//   2. DEBORDEMENT horizontal, a cinq largeurs. Attention : une capture
//      d'ecran ne prouve rien, la fenetre n'impose pas la largeur de mise en
//      page et l'image est simplement rognee. Seule la mesure compte.
//   3. STRUCTURE : niveaux de titre, noms accessibles, identifiants uniques,
//      references aria resolues.
//   4. IMPRESSION : le media print, puis debordement, titres visibles et
//      longueur du texte.
//   5. PANNEAUX OUVERTS. Les quatre premiers ne voient que ce qui est rendu
//      au chargement. Un panneau qui s'ouvre au clic doit etre ouvert AVANT
//      la mesure, sinon la moitie de l'interface n'est jamais controlee.
//
// S'y ajoute une MESURE de performance, qui n'est pas un controle : elle
// n'echoue jamais. Elle est relevee, datee et versionnee, et l'inventaire en
// reprend le maximum. Un seuil de performance pose sur une mesure locale
// dirait surtout la vitesse de la machine qui l'a lancee.
//
// Dependance : playwright-core, volontairement NON declaree dans le depot.
// C'est un outil d'audit, pas une dependance du site : l'ajouter au manifeste
// ferait grossir l'installation de tout le monde pour une commande lancee
// quelques fois par an. Le script dit comment l'installer et sort proprement
// quand elle est absente.
// =====================================================================

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

function arg(nom, defaut) {
  const i = process.argv.indexOf(`--${nom}`);
  return i !== -1 ? (process.argv[i + 1] ?? defaut) : defaut;
}

const BASE = arg("base", "http://localhost:3000").replace(/\/+$/, "");

/** Les pages auditees. Toute page publique ajoutee doit figurer ici. */
const PAGES = [
  "/",
  "/recruteur",
  "/technique",
  "/confiance",
  "/journal",
  "/systeme",
  "/systeme/pannes",
  "/ecosysteme",
  "/preuves",
  "/decisions",
  "/principes",
  "/revirements",
  "/metrics",
  "/lettre",
];

const LARGEURS = [320, 390, 768, 1100, 1440];

let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  console.error(
    "✗ playwright-core est absent. C'est un outil d'audit, pas une\n" +
      "  dependance du site : il ne figure pas au manifeste.\n\n" +
      "  npm i -g playwright-core\n" +
      "  node scripts/audit-render.mjs --base http://localhost:3000\n",
  );
  process.exit(2);
}

/** Calcul WCAG. Une seule implementation, employee par le seul controle. */
const MESURE_CONTRASTE = `(() => {
  const lum = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const fondEffectif = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.92) return c;
      n = n.parentElement;
    }
    const c = parse(getComputedStyle(document.body).backgroundColor);
    return c && c.a > 0 ? c : { r: 255, g: 255, b: 255, a: 1 };
  };
  const fautes = [];
  const noeuds = document.querySelectorAll("body *");
  for (const el of noeuds) {
    if (!el.firstChild) continue;
    let texte = "";
    for (const n of el.childNodes) {
      if (n.nodeType === 3) texte += n.textContent;
    }
    texte = texte.trim();
    if (texte.length < 2) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none" || st.opacity === "0") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const fg = parse(st.color);
    if (!fg || fg.a < 0.5) continue;
    const bg = fondEffectif(el);
    const l1 = lum(fg.r, fg.g, fg.b);
    const l2 = lum(bg.r, bg.g, bg.b);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const taille = parseFloat(st.fontSize);
    const gras = parseInt(st.fontWeight, 10) >= 700;
    const seuil = taille >= 24 || (taille >= 18.66 && gras) ? 3 : 4.5;
    if (ratio < seuil) {
      fautes.push({
        texte: texte.slice(0, 58),
        classe: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 48),
        ratio: Math.round(ratio * 100) / 100,
        seuil,
      });
    }
  }
  return fautes;
})()`;

const MESURE_STRUCTURE = `(() => {
  const problemes = [];
  const titres = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  let precedent = 0;
  for (const t of titres) {
    const n = Number(t.tagName.slice(1));
    if (precedent && n > precedent + 1) {
      problemes.push({ type: "saut de titre", detail: "h" + precedent + " vers h" + n + " : " + (t.textContent || "").trim().slice(0, 44) });
    }
    precedent = n;
  }
  if (titres.filter((t) => t.tagName === "H1").length !== 1) {
    problemes.push({ type: "titre principal", detail: titres.filter((t) => t.tagName === "H1").length + " element h1" });
  }
  const vus = new Set();
  for (const el of document.querySelectorAll("[id]")) {
    if (vus.has(el.id)) problemes.push({ type: "identifiant duplique", detail: el.id });
    vus.add(el.id);
  }
  for (const el of document.querySelectorAll("[aria-labelledby]")) {
    for (const id of el.getAttribute("aria-labelledby").split(/\\s+/)) {
      if (id && !document.getElementById(id)) {
        problemes.push({ type: "reference aria non resolue", detail: id });
      }
    }
  }
  for (const el of document.querySelectorAll("a[href], button")) {
    const nom = (el.getAttribute("aria-label") || el.textContent || "").trim();
    if (!nom) problemes.push({ type: "controle sans nom", detail: el.outerHTML.slice(0, 64) });
  }
  return problemes;
})()`;

const rapport = {
  base: BASE,
  pages: [],
  executed_at: new Date().toISOString(),
};
let fautes = 0;
let nonMesurees = 0;

let navigateur;
try {
  navigateur = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
} catch (e) {
  // Un audit qui ne trouve pas de navigateur n'a rien mesure. Il le dit en
  // une phrase lisible et sort en code 2, le meme que l'absence de
  // playwright-core, plutot que de deverser une trace d'execution : la
  // difference entre « rien trouve » et « rien regarde » est exactement ce
  // que cette couche existe pour rendre visible.
  console.error(
    "✗ NON EXECUTE : aucun navigateur lancable.\n" +
      `  ${e instanceof Error ? e.message.split("\n")[0] : String(e)}\n\n` +
      "  playwright-core est installe mais son navigateur ne l'est pas, ou\n" +
      "  il vit ailleurs. Deux issues :\n" +
      "    npx playwright install chromium\n" +
      "    CHROMIUM_PATH=/chemin/vers/chrome node scripts/audit-render.mjs\n",
  );
  process.exit(2);
}

try {
  for (const chemin of PAGES) {
    const page = await navigateur.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const entree = {
      page: chemin,
      contraste: [],
      debordement: [],
      structure: [],
      impression: {},
      panneaux: {},
      performance: {},
    };
    try {
      const reponse = await page.goto(`${BASE}${chemin}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      entree.statut = reponse ? reponse.status() : 0;

      // La banniere de consentement intercepte les evenements de pointeur :
      // elle est retiree AVANT tout clic, sinon le controle 5 ne voit rien.
      await page.evaluate(`(() => {
        for (const el of document.querySelectorAll("[class*='consent'],[class*='cookie']")) {
          el.remove();
        }
      })()`);

      // 1. Contraste
      entree.contraste = await page.evaluate(MESURE_CONTRASTE);

      // 2. Debordement, cinq largeurs
      for (const w of LARGEURS) {
        await page.setViewportSize({ width: w, height: 900 });
        const trop = await page.evaluate(
          "document.documentElement.scrollWidth - document.documentElement.clientWidth",
        );
        if (trop > 1) {
          entree.debordement.push({ largeur: w, depassement: trop });
        }
      }
      await page.setViewportSize({ width: 1280, height: 900 });

      // 3. Structure
      entree.structure = await page.evaluate(MESURE_STRUCTURE);

      // Mesure de performance. Relevee, jamais transformee en verdict.
      entree.performance = await page.evaluate(`(() => {
        const nav = performance.getEntriesByType("navigation")[0];
        const peintures = performance.getEntriesByType("paint");
        const premiere = peintures.find((p) => p.name === "first-contentful-paint");
        const ressources = performance.getEntriesByType("resource");
        const poids = ressources.reduce((n, r) => n + (r.transferSize || 0), 0);
        return {
          premier_rendu_ms: premiere ? Math.round(premiere.startTime) : null,
          document_pret_ms: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
          poids_ko: Math.round(poids / 1024),
          noeuds: document.getElementsByTagName("*").length,
        };
      })()`);

      // 4. Impression
      await page.emulateMedia({ media: "print" });
      entree.impression = await page.evaluate(`(() => ({
        debordement: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        titres: document.querySelectorAll("h1,h2,h3").length,
        longueur: (document.body.innerText || "").length,
        // Un lien d'evitement en position fixe se repete sur CHAQUE page
        // imprimee. Mais la regle d'impression peut le masquer, et c'est le
        // correctif retenu ici : le controle doit donc verifier qu'il est
        // encore RENDU, pas seulement qu'il est fixe. Sans cette nuance, le
        // controle signale un defaut deja corrige, et on finit par l'ignorer.
        evitementFixe: Array.from(document.querySelectorAll("a")).some((a) => {
          const st = getComputedStyle(a);
          return (
            st.position === "fixed" &&
            st.display !== "none" &&
            st.visibility !== "hidden" &&
            /aller au contenu/i.test(a.textContent || "")
          );
        }),
      }))()`);
      await page.emulateMedia({ media: "screen" });

      // 5. Panneaux ouverts. Les quatre premiers controles ne voient que ce
      // qui est rendu au chargement.
      const lanceur = await page.$(
        ".assistant-launcher, [data-open-assistant]",
      );
      if (lanceur) {
        await lanceur.click();
        await page.waitForTimeout(400);
        entree.panneaux.assistant = await page.evaluate(MESURE_CONTRASTE);
      }
      const depliants = await page.$$("details:not([open]) > summary");
      for (const d of depliants.slice(0, 8)) {
        await d.click().catch(() => {});
      }
      await page.waitForTimeout(200);
      entree.panneaux.depliants = await page.evaluate(MESURE_CONTRASTE);
    } catch (error) {
      entree.erreur = error instanceof Error ? error.message : String(error);
    } finally {
      await page.close();
    }

    // Une page qui n'a pas repondu n'est pas une page fautive : c'est une
    // page NON MESUREE. Les compter ensemble faisait rendre « 13 anomalies »
    // a un serveur eteint, et ce chiffre partait tel quel dans l'inventaire.
    // Rien regarde n'est pas treize defauts constates.
    const mesuree =
      !entree.erreur && entree.statut >= 200 && entree.statut < 400;
    if (!mesuree) {
      nonMesurees += 1;
      entree.mesuree = false;
      console.log(
        `· ${chemin.padEnd(20)} NON MESUREE ${entree.erreur ?? `statut ${entree.statut}`}`,
      );
      rapport.pages.push(entree);
      continue;
    }
    entree.mesuree = true;
    const nb =
      entree.contraste.length +
      entree.debordement.length +
      entree.structure.length +
      (entree.impression.evitementFixe ? 1 : 0) +
      (entree.panneaux.assistant?.length ?? 0) +
      (entree.panneaux.depliants?.length ?? 0);
    fautes += nb;
    console.log(
      `${nb === 0 ? "✓" : "✗"} ${chemin.padEnd(20)} ${nb} anomalie(s)`,
    );
    for (const c of entree.contraste.slice(0, 4)) {
      console.log(`      contraste ${c.ratio} pour ${c.seuil} · ${c.texte}`);
    }
    for (const d of entree.debordement) {
      console.log(`      debordement de ${d.depassement} px a ${d.largeur} px`);
    }
    for (const s of entree.structure.slice(0, 4)) {
      console.log(`      ${s.type} · ${s.detail}`);
    }
    if (entree.impression.evitementFixe) {
      console.log("      le lien d'evitement s'imprime en pied de chaque page");
    }
    if (entree.erreur) {
      console.log(`      ${entree.erreur}`);
    }
    rapport.pages.push(entree);
  }
} finally {
  await navigateur.close();
}

rapport.anomalies = fautes;
rapport.non_mesurees = nonMesurees;
// Resume stable, celui que l'inventaire reprend. Aucun horodatage : sinon
// `pnpm inventory --check` echouerait a chaque seconde qui passe.
const mesurees = rapport.pages.filter((p) => p.mesuree);
/** Maximum sur les pages REELLEMENT mesurees, nul si aucune ne l'a ete. */
const maxMesure = (lire) =>
  mesurees.length === 0 ? null : Math.max(0, ...mesurees.map(lire));
rapport.resume = {
  pages: PAGES.length,
  pages_mesurees: mesurees.length,
  anomalies: fautes,
  non_mesurees: nonMesurees,
  premier_rendu_max_ms: maxMesure((p) => p.performance?.premier_rendu_ms ?? 0),
  poids_max_ko: maxMesure((p) => p.performance?.poids_ko ?? 0),
  noeuds_max: maxMesure((p) => p.performance?.noeuds ?? 0),
};
writeFileSync(
  join(ROOT, "docs/audit-rendu.json"),
  `${JSON.stringify(rapport, null, 2)}\n`,
  "utf8",
);

const suffixe =
  nonMesurees > 0 ? `, ${nonMesurees} page(s) NON MESUREE(S)` : "";
console.log(
  `\n${fautes === 0 && nonMesurees === 0 ? "✓" : "✗"} ${fautes} anomalie(s) sur ${mesurees.length} page(s) mesuree(s) sur ${PAGES.length}${suffixe}. Rapport : docs/audit-rendu.json`,
);
if (mesurees.length === 0) {
  console.error(
    "\n✗ NON EXECUTE : aucune page n'a repondu. Verifier que le serveur tourne\n" +
      `  et que --base pointe la bonne origine (ici ${BASE}).`,
  );
  process.exit(2);
}
process.exit(fautes === 0 && nonMesurees === 0 ? 0 : 1);

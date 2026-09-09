#!/usr/bin/env node
// =====================================================================
// Signalement IndexNow.
//
// Google n'accepte pas IndexNow : il decouvre par le sitemap et par ses
// propres passages. Bing, Yandex, Seznam et Naver l'acceptent, et ce
// protocole leur dit en une requete quelles adresses ont bouge, au lieu
// d'attendre leur prochain passage. C'est le seul levier d'indexation qui
// ne demande ni compte ni interface.
//
// Le script ne fabrique aucune liste : il lit le sitemap servi par le site,
// donc exactement les adresses que le site declare. Une page absente du
// sitemap ne sera pas signalee, et c'est voulu.
//
// La cle vit dans apps/web/public/<cle>.txt. Le moteur va la lire a cette
// adresse pour verifier que celui qui signale controle bien le domaine. Si
// le fichier disparait, le signalement est rejete, silencieusement.
//
// Usage :
//   node scripts/indexnow.mjs             signale tout le sitemap
//   node scripts/indexnow.mjs /journal    signale une ou plusieurs adresses
//   node scripts/indexnow.mjs --dry-run   affiche sans envoyer
// =====================================================================

const HOTE = process.env.INDEXNOW_HOST ?? "adamesg-os.fr";
const CLE = process.env.INDEXNOW_KEY ?? "bb6d506a613669769af0dbb42c8d770e";
const ORIGINE = `https://${HOTE}`;
const POINT_DE_SIGNALEMENT = "https://api.indexnow.org/IndexNow";

const args = process.argv.slice(2);
const simulation = args.includes("--dry-run");
const chemins = args.filter((a) => !a.startsWith("--"));

async function lireSitemap() {
  const reponse = await fetch(`${ORIGINE}/sitemap.xml`, {
    headers: { "user-agent": "adama-os-indexnow" },
  });
  if (!reponse.ok) {
    throw new Error(`sitemap.xml a repondu ${reponse.status}`);
  }
  const xml = await reponse.text();
  const adresses = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].trim(),
  );
  if (adresses.length === 0) {
    throw new Error("sitemap.xml ne contient aucune adresse");
  }
  return adresses;
}

async function verifierCle() {
  const reponse = await fetch(`${ORIGINE}/${CLE}.txt`);
  if (!reponse.ok) {
    throw new Error(
      `le fichier de cle ${CLE}.txt repond ${reponse.status} : deployez-le avant de signaler`,
    );
  }
  const contenu = (await reponse.text()).trim();
  if (contenu !== CLE) {
    throw new Error("le fichier de cle ne contient pas la cle attendue");
  }
}

async function main() {
  await verifierCle();
  const urlList =
    chemins.length > 0
      ? chemins.map((c) => (c.startsWith("http") ? c : `${ORIGINE}${c}`))
      : await lireSitemap();

  console.log(`${urlList.length} adresses a signaler sur ${HOTE}`);
  if (simulation) {
    urlList.forEach((u) => console.log(`  ${u}`));
    console.log("simulation : rien n'a ete envoye");
    return;
  }

  const reponse = await fetch(POINT_DE_SIGNALEMENT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOTE,
      key: CLE,
      keyLocation: `${ORIGINE}/${CLE}.txt`,
      urlList,
    }),
  });

  // 200 accepte, 202 accepte mais cle en cours de verification. Tout le
  // reste est un refus qu'il vaut mieux lire que masquer.
  const corps = await reponse.text();
  console.log(`reponse ${reponse.status} ${corps.slice(0, 200)}`.trim());
  if (reponse.status !== 200 && reponse.status !== 202) {
    process.exitCode = 1;
  }
}

main().catch((erreur) => {
  console.error(`echec du signalement : ${erreur.message}`);
  process.exitCode = 1;
});

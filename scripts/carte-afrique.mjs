// =====================================================================
// Génère les tracés de la carte Afrique, Sénégal et France du site
// (apps/web/components/kit/carte-donnees.ts), à partir de Natural Earth
// 1:50m, domaine public.
//
//   curl -o ne50.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
//   node scripts/carte-afrique.mjs ne50.geojson
//
// Projection équirectangulaire corrigée de la latitude moyenne, tracés
// simplifiés (Douglas-Peucker) : la carte est une illustration, pas un
// instrument de mesure. Le fichier produit est relu et versionné.
// =====================================================================
import { readFileSync, writeFileSync } from "node:fs";

const [source] = process.argv.slice(2);
if (!source) throw new Error("Chemin du fichier GeoJSON attendu.");
const geo = JSON.parse(readFileSync(source, "utf8"));

const LON = [-22, 56];
const LAT = [-37, 54];
const LARGEUR = 520;
const k = Math.cos((15 * Math.PI) / 180);
const echelle = LARGEUR / ((LON[1] - LON[0]) * k);
const HAUTEUR = Math.round((LAT[1] - LAT[0]) * echelle);
const proj = ([lon, lat]) => [
  (lon - LON[0]) * k * echelle,
  (LAT[1] - lat) * echelle,
];

function dp(points, tol) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]];
  let max = 0;
  let idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const d =
      dx === 0 && dy === 0
        ? Math.hypot(x - a[0], y - a[1])
        : Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) /
          Math.hypot(dx, dy);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [a, b];
  return [
    ...dp(points.slice(0, idx + 1), tol).slice(0, -1),
    ...dp(points.slice(idx), tol),
  ];
}

function chemin(geometrie, tol) {
  const polys =
    geometrie.type === "Polygon"
      ? [geometrie.coordinates]
      : geometrie.coordinates;
  const morceaux = [];
  for (const poly of polys) {
    const anneau = poly[0].map(proj);
    const xs = anneau.map((p) => p[0]);
    const ys = anneau.map((p) => p[1]);
    // Les îlots minuscules n'apportent que du bruit à cette échelle.
    if (
      Math.max(...xs) - Math.min(...xs) < 2.5 &&
      Math.max(...ys) - Math.min(...ys) < 2.5
    )
      continue;
    const simple = dp(anneau, tol);
    if (simple.length < 4) continue;
    morceaux.push(
      "M" +
        simple.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") +
        "Z",
    );
  }
  return morceaux.join("");
}

const afrique = [];
const europe = [];
let senegal = "";
let france = "";
for (const f of geo.features) {
  const p = f.properties;
  if (p.ISO_A3 === "SEN") senegal = chemin(f.geometry, 0.35);
  if (p.ADMIN === "France") {
    // France métropolitaine seulement : on garde les morceaux au nord de 40°.
    const g = {
      type: "MultiPolygon",
      coordinates: (f.geometry.type === "Polygon"
        ? [f.geometry.coordinates]
        : f.geometry.coordinates
      ).filter(
        (poly) =>
          poly[0][0][1] > 40 && poly[0][0][0] > -6 && poly[0][0][0] < 10,
      ),
    };
    france = chemin(g, 0.35);
  }
  if (p.CONTINENT === "Africa" && p.ISO_A3 !== "SEN")
    afrique.push(chemin(f.geometry, 0.9));
  if (p.CONTINENT === "Europe" && p.ADMIN !== "France" && p.ADMIN !== "Russia")
    europe.push(chemin(f.geometry, 1.3));
  if (
    p.CONTINENT === "Asia" &&
    [
      "Turkey",
      "Saudi Arabia",
      "Yemen",
      "Oman",
      "Israel",
      "Jordan",
      "Syria",
      "Lebanon",
      "Iraq",
      "United Arab Emirates",
      "Kuwait",
      "Qatar",
      "Cyprus",
      "Iran",
    ].includes(p.ADMIN)
  )
    europe.push(chemin(f.geometry, 1.3));
}

const point = (lon, lat) => proj([lon, lat]).map((v) => +v.toFixed(1));
const sortie = `// Généré par scripts/carte-afrique.mjs depuis Natural Earth 1:50m
// (domaine public). Ne pas modifier à la main : relancer le script.
export const CARTE = {
  largeur: ${LARGEUR},
  hauteur: ${HAUTEUR},
  afrique: ${JSON.stringify(afrique.filter(Boolean))},
  voisins: ${JSON.stringify(europe.filter(Boolean))},
  senegal: ${JSON.stringify(senegal)},
  france: ${JSON.stringify(france)},
  dakar: ${JSON.stringify(point(-17.3, 14.72))},
  paris: ${JSON.stringify(point(2.35, 48.86))},
} as const;
`;
writeFileSync("apps/web/components/kit/carte-donnees.ts", sortie);
console.log("carte", LARGEUR, "x", HAUTEUR, "octets", sortie.length);

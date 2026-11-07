import { PaveIso, projection } from "../kit/isometrie";
import { STRATES, STRATES_EN, type CodeStrate } from "../../content/accueil";
import { METHODES } from "../../content/methodes";

// =====================================================================
// La figure du premier écran : ADAMA OS en quatre strates éclatées.
//
// En bas, les logiciels qui tournent (trois pavés, un par maison). Au
// dessus, le journal des décisions, puis les preuves, reliées par un fil
// aux logiciels qu'elles prouvent. Au sommet, les méthodes, une tuile par
// fiche publiée, pleine quand la méthode est prouvée. À droite, l'échelle
// du temps : tout ce qui est ici est daté.
//
// Le dessin se calcule dans les unités du plan (isometrie.tsx). Les
// strates s'ouvrent au chargement, les fils de preuve circulent ; rien ne
// bouge quand le visiteur a demandé moins de mouvement.
// =====================================================================

const U = 24;
const PR = projection(U, 420, 300);
const COTE = 10;
const EPAISSEUR = 0.3;
const ECART = 3.1;

const zDe = (k: number) => k * ECART;
const dessusDe = (k: number) => zDe(k) + EPAISSEUR;

/** Un losange posé à plat sur le dessus d'une strate. */
function Point({
  x,
  y,
  z,
  r = 0.09,
  className,
  delai,
}: {
  x: number;
  y: number;
  z: number;
  r?: number;
  className: string;
  delai?: number;
}) {
  const pts = [
    PR.s(x - r, y, z),
    PR.s(x, y - r, z),
    PR.s(x + r, y, z),
    PR.s(x, y + r, z),
  ].join(" ");
  return (
    <polygon
      points={pts}
      className={className}
      style={delai === undefined ? undefined : { animationDelay: `${delai}s` }}
    />
  );
}

/** La trame de points d'une strate, tirée sans hasard pour rester stable. */
function Trame({
  k,
  code,
  seuil,
  exclure = () => false,
}: {
  k: number;
  code: CodeStrate;
  seuil: number;
  exclure?: (x: number, y: number) => boolean;
}) {
  const z = dessusDe(k);
  const points: { x: number; y: number; vif: boolean }[] = [];
  for (let i = 0; i < COTE; i++) {
    for (let j = 0; j < COTE; j++) {
      const h = (i * 73 + j * 151 + k * 37 + i * j * 11) % 17;
      const x = i + 0.5;
      const y = j + 0.5;
      if (h < seuil && !exclure(x, y)) points.push({ x, y, vif: h === 0 });
    }
  }
  return (
    <g>
      {points.map((q) => (
        <Point
          key={`${q.x}-${q.y}`}
          x={q.x}
          y={q.y}
          z={z}
          className={`strate-point strate-point--${code}${q.vif ? " strate-point--vif" : ""}`}
          delai={q.vif ? ((q.x * 7 + q.y * 3) % 10) / 4 : undefined}
        />
      ))}
    </g>
  );
}

/** La plaque d'une strate : un pavé mince, opaque, qui cache ce qui est dessous. */
function Plaque({ k }: { k: number }) {
  return (
    <PaveIso
      pr={PR}
      x={0}
      y={0}
      z={zDe(k)}
      l={COTE}
      p={COTE}
      h={EPAISSEUR}
      dessus="strate-dessus"
      flanc="strate-flanc"
    />
  );
}

const MAISONS = [
  { code: "strata", x: 1.4, y: 1.4, l: 2.4, p: 2.4, h: 1.7 },
  { code: "pharivo", x: 6.1, y: 1.8, l: 2.2, p: 2.2, h: 1.15 },
  { code: "conhama", x: 2.9, y: 6.3, l: 2.6, p: 2.0, h: 0.8 },
] as const;

const surUneMaison = (x: number, y: number) =>
  MAISONS.some(
    (m) =>
      x > m.x - 0.4 &&
      x < m.x + m.l + 0.4 &&
      y > m.y - 0.4 &&
      y < m.y + m.p + 0.4,
  );

const JOURNAL = [
  [1.1, 8.6],
  [2.4, 7.2],
  [3.6, 7.7],
  [4.9, 5.6],
  [6.1, 6.1],
  [7.4, 3.8],
  [8.8, 2.1],
] as const;

export function HeroStrates({ langue = "fr" }: { langue?: "fr" | "en" }) {
  const en = langue === "en";
  const strates = en ? STRATES_EN : STRATES;
  const zFil = dessusDe(2);
  const prouvees = METHODES.filter((m) => m.etat === "PROUVÉ").length;
  const coin = (k: number) => PR.p(0, COTE, dessusDe(k));
  const haut = PR.p(-0.6, -0.6, 11.2);
  const gauche = PR.p(-0.6, 10.6, 11.2);
  const droite = PR.p(10.6, -0.6, 11.2);
  const avant = PR.p(10.6, 10.6, 11.2);
  const gaucheBas = PR.p(-0.6, 10.6, -0.4);
  const droiteBas = PR.p(10.6, -0.6, -0.4);
  const avantBas = PR.p(10.6, 10.6, -0.4);

  return (
    <figure className="hero-strates">
      <svg
        viewBox="0 0 760 580"
        role="img"
        aria-labelledby="hero-strates-titre"
        className="hero-strates-svg"
      >
        <title id="hero-strates-titre">
          {en
            ? `ADAMA OS in four layers: software in service, dated decisions, proofs linked to the software, and ${METHODES.length} published methods, ${prouvees} of them proven.`
            : `ADAMA OS en quatre strates : les logiciels en service, les décisions datées, les preuves reliées aux logiciels, et ${METHODES.length} méthodes publiées dont ${prouvees} prouvée${prouvees > 1 ? "s" : ""}.`}
        </title>

        {/* Le cadre : la boîte qui tient le système. */}
        <g className="strate-cadre">
          <polyline
            points={`${gaucheBas.x},${gaucheBas.y} ${gauche.x},${gauche.y} ${haut.x},${haut.y} ${droite.x},${droite.y} ${droiteBas.x},${droiteBas.y}`}
          />
          <polyline
            points={`${gauche.x},${gauche.y} ${avant.x},${avant.y} ${droite.x},${droite.y}`}
          />
          <line x1={avant.x} y1={avant.y} x2={avantBas.x} y2={avantBas.y} />
          <polyline
            points={`${gaucheBas.x},${gaucheBas.y} ${avantBas.x},${avantBas.y} ${droiteBas.x},${droiteBas.y}`}
          />
        </g>

        {/* 01. Les logiciels en service. */}
        <g data-flotte="0.1">
          <g className="strate strate--0">
            <Plaque k={0} />
            <Trame k={0} code="logiciels" seuil={6} exclure={surUneMaison} />
            {MAISONS.map((m) => (
              <PaveIso
                key={m.code}
                pr={PR}
                x={m.x}
                y={m.y}
                z={dessusDe(0)}
                l={m.l}
                p={m.p}
                h={m.h}
                dessus={`maison-dessus maison-dessus--${m.code}`}
                flanc={`maison-flanc maison-flanc--${m.code}`}
              />
            ))}
          </g>
        </g>

        {/* Les fils de preuve : de chaque preuve à la maison qu'elle prouve. */}
        <g className="strate-fils" aria-hidden="true">
          {MAISONS.map((m) => {
            const cx = m.x + m.l / 2;
            const cy = m.y + m.p / 2;
            const a = PR.p(cx, cy, dessusDe(0) + m.h);
            const b = PR.p(cx, cy, zFil);
            return <line key={m.code} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>

        {/* 02. Les décisions : un journal daté, un revirement compris. */}
        <g data-flotte="0.25">
          <g className="strate strate--1">
            <Plaque k={1} />
            <Trame k={1} code="decisions" seuil={4} />
            <polyline
              className="strate-journal"
              points={JOURNAL.map(([x, y]) => PR.s(x, y, dessusDe(1))).join(
                " ",
              )}
            />
            {JOURNAL.map(([x, y], i) => (
              <Point
                key={`${x}-${y}`}
                x={x}
                y={y}
                z={dessusDe(1)}
                r={0.2}
                className={
                  i === 3
                    ? "strate-decision strate-decision--revirement"
                    : "strate-decision"
                }
              />
            ))}
          </g>
        </g>

        {/* 03. Les preuves, au droit de chaque maison. */}
        <g data-flotte="0.4">
          <g className="strate strate--2">
            <Plaque k={2} />
            <Trame k={2} code="preuves" seuil={4} />
            {MAISONS.map((m) => {
              const cx = m.x + m.l / 2;
              const cy = m.y + m.p / 2;
              return (
                <g key={m.code}>
                  <Point
                    x={cx}
                    y={cy}
                    z={zFil}
                    r={0.62}
                    className="strate-sceau strate-sceau--halo"
                  />
                  <Point
                    x={cx}
                    y={cy}
                    z={zFil}
                    r={0.3}
                    className="strate-sceau"
                  />
                </g>
              );
            })}
          </g>
        </g>

        {/* 04. Les méthodes : une tuile par fiche, pleine quand prouvée. */}
        <g data-flotte="0.6">
          <g className="strate strate--3">
            <Plaque k={3} />
            <Trame k={3} code="methodes" seuil={3} />
            {METHODES.map((m, i) => {
              const ligne = i < 4 ? 0 : 1;
              const rang = ligne === 0 ? i : i - 4;
              const etat =
                m.etat === "PROUVÉ"
                  ? "prouvee"
                  : m.etat === "TESTÉ"
                    ? "testee"
                    : "recherche";
              return (
                <PaveIso
                  key={m.identifiant}
                  pr={PR}
                  x={1.3 + rang * 2 + ligne * 1}
                  y={3.2 + ligne * 2.4}
                  z={dessusDe(3)}
                  l={1.3}
                  p={1.3}
                  h={0.32}
                  dessus={`methode-tuile methode-tuile--${etat}`}
                  flanc={`methode-flanc methode-flanc--${etat}`}
                  pointille={etat === "recherche"}
                />
              );
            })}
          </g>
        </g>

        {/* Les étiquettes, à gauche de chaque strate. */}
        <g className="strate-etiquettes" aria-hidden="true">
          {strates.map((s, k) => {
            const c = coin(k);
            return (
              <g key={s.code}>
                <line x1={c.x - 8} y1={c.y} x2={c.x - 34} y2={c.y} />
                <text x={c.x - 40} y={c.y - 4} className="strate-etiquette-nom">
                  <tspan className="strate-etiquette-numero">{`0${k + 1} `}</tspan>
                  {s.libelle}
                </text>
                <text
                  x={c.x - 40}
                  y={c.y + 12}
                  className="strate-etiquette-detail"
                >
                  {s.detail}
                </text>
              </g>
            );
          })}
        </g>

        {/* L'échelle du temps : tout ce qui est ici est daté. */}
        <g className="strate-echelle" aria-hidden="true">
          <line x1="716" y1="36" x2="716" y2="540" />
          {Array.from({ length: 26 }, (_, i) => (
            <line
              key={i}
              x1="716"
              y1={40 + i * 20}
              x2={i % 5 === 0 ? 728 : 722}
              y2={40 + i * 20}
            />
          ))}
          <rect
            x="712"
            y="34"
            width="8"
            height="30"
            className="strate-echelle-curseur"
          />
          <rect
            x="732"
            y="30"
            width="26"
            height="14"
            rx="2"
            className="strate-echelle-etiquette"
          />
          <text
            x="745"
            y="40"
            className="strate-echelle-texte strate-echelle-texte--vif"
          >
            {en ? "NOW" : "AUJ."}
          </text>
          <text x="732" y="544" className="strate-echelle-texte">
            {en ? "DAY 1" : "J1"}
          </text>
        </g>
      </svg>
      <figcaption className="hero-legende">
        <span>Fig. 1</span>{" "}
        {en
          ? "ADAMA OS in four layers: what runs at the bottom, what is passed on at the top, each layer tied to its proof."
          : "ADAMA OS en quatre strates : ce qui tourne en bas, ce qui se transmet en haut, et chaque étage relié à sa preuve."}
      </figcaption>
    </figure>
  );
}

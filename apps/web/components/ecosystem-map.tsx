// =====================================================================
// C4-T1 a C4-T7, la carte de l'ecosysteme.
//
// Ce que la carte doit faire comprendre en dix secondes : toutes les fleches
// vont des produits vers le cockpit, aucune ne part du cockpit vers un
// produit. C'est la decision d'architecture la plus structurante du dossier,
// et elle se voit avant qu'on lise la legende.
//
// Deux rendus du MEME modele, jamais deux verites :
//   - un schema SVG en ligne, sans bibliotheque, a disposition deterministe.
//     La meme donnee produit toujours la meme carte. Il est masque sous 720
//     pixels : une carte qui defile horizontalement ne se lit pas ;
//   - une liste hierarchique, qui porte le detail de chaque noeud et qui
//     sert d'equivalent textuel. Elle est dans le document a toutes les
//     largeurs, donc annoncee par un lecteur d'ecran et imprimee proprement.
//
// Interdit tenu : aucun libelle de produit n'est ecrit dans ce fichier.
// tests/ecosystem-map.test.tsx echoue si l'un d'eux y apparait.
// =====================================================================

import Link from "next/link";
import { libelleDivision } from "../content/divisions";
import type { EcosystemMap, MapNode } from "../lib/ecosystem/map";
import type { RepoStatusRow } from "./types";

// --- Disposition, en unites du viewBox -------------------------------------

const COL = 300;
const BOX_W = 244;
const HEAD_Y = 10;
const HEAD_H = 40;
const FIRST_ROW_Y = 74;
const ROW_H = 84;
const PRODUIT_H = 46;
const DEPOT_H = 22;
const COCKPIT_H = 62;
const COCKPIT_W = 430;
const RAIL = 28;

function centreColonne(column: number): number {
  return column * COL + COL / 2;
}

function dateCourte(iso: string | null): string {
  if (!iso) {
    return "inconnue";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "illisible";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Glyphe d'etat, pour que la distinction ne tienne pas a la couleur seule. */
function marqueEtat(state: string): string {
  if (state.startsWith("En ligne")) return "●";
  if (state.startsWith("En développement")) return "◐";
  if (state.startsWith("En projet")) return "○";
  return "△";
}

function Schema({ map }: { map: EcosystemMap }) {
  const colonnes = map.divisions.length;
  const produits = map.nodes.filter((n) => n.kind === "produit");
  const maxRangs = Math.max(
    1,
    ...map.divisions.map(
      (d) => produits.filter((p) => p.division === d).length,
    ),
  );

  const largeur = Math.max(colonnes * COL, 900);
  const basProduits = FIRST_ROW_Y + maxRangs * ROW_H;
  const busY = basProduits + 26;
  const cockpitY = busY + 48;
  const hauteur = cockpitY + COCKPIT_H + 46;
  const centre = largeur / 2;

  return (
    <svg
      className="map-svg"
      viewBox={`0 0 ${largeur} ${hauteur}`}
      role="img"
      aria-label="Schéma de l’écosystème. Les produits alimentent le cockpit, aucune flèche ne part du cockpit vers un produit. Le détail de chaque nœud figure dans la liste qui suit."
    >
      <defs>
        <marker
          id="map-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 10 5 0 10Z" fill="currentColor" />
        </marker>
      </defs>

      {/* Divisions, une colonne chacune */}
      {map.divisions.map((division, i) => {
        const x = i * COL + (COL - BOX_W) / 2;
        return (
          <g key={division} className="map-division">
            <rect
              x={x}
              y={HEAD_Y}
              width={BOX_W}
              height={HEAD_H}
              rx="3"
              className="map-box map-box--division"
            />
            <text
              x={centreColonne(i)}
              y={HEAD_Y + 25}
              textAnchor="middle"
              className="map-label map-label--division"
            >
              {libelleDivision(division)}
            </text>
          </g>
        );
      })}

      {/* Rail d'appartenance : une colonne, de l'entete au dernier produit */}
      {map.divisions.map((division, i) => {
        const dedans = produits.filter((p) => p.division === division);
        if (dedans.length === 0) {
          return null;
        }
        const bas = FIRST_ROW_Y + (dedans.length - 1) * ROW_H + PRODUIT_H / 2;
        return (
          <g key={`rail-${division}`}>
            <path
              d={`M${i * COL + RAIL} ${HEAD_Y + HEAD_H} V ${bas}`}
              className="map-edge map-edge--appartenance"
            />
            {/* La descente vers le collecteur part du RAIL de colonne, une
                seule fois. Une descente par produit traverserait les boites
                situees en dessous, ce que la premiere composition faisait. */}
            <path
              d={`M${i * COL + RAIL} ${bas} V ${busY}`}
              className="map-edge map-edge--lecture"
            />
          </g>
        );
      })}

      {/* Produits et depots */}
      {map.divisions.map((division, i) => {
        const dedans = produits.filter((p) => p.division === division);
        return dedans.map((produit, r) => {
          const x = i * COL + (COL - BOX_W) / 2;
          const y = FIRST_ROW_Y + r * ROW_H;
          const depot = map.nodes.find(
            (n) =>
              n.kind === "depot" &&
              n.division === division &&
              n.row === produit.row,
          );
          return (
            <g key={produit.id}>
              <path
                d={`M${i * COL + RAIL} ${y + PRODUIT_H / 2} H ${x}`}
                className="map-edge map-edge--appartenance"
              />
              <rect
                x={x}
                y={y}
                width={BOX_W}
                height={PRODUIT_H}
                rx="3"
                className="map-box map-box--produit"
              />
              <text
                x={x + 14}
                y={y + 20}
                className="map-label map-label--produit"
              >
                {produit.label}
              </text>
              <text x={x + 14} y={y + 36} className="map-state">
                {marqueEtat(produit.state)} {produit.state}
              </text>
              {depot ? (
                <text x={x + 14} y={y + PRODUIT_H + 16} className="map-depot">
                  {depot.label}
                </text>
              ) : (
                <text
                  x={x + 14}
                  y={y + PRODUIT_H + 16}
                  className="map-depot map-depot--absent"
                >
                  dépôt non rattaché
                </text>
              )}
            </g>
          );
        });
      })}

      {/* Collecteur, puis la seule fleche de la carte, vers le cockpit */}
      <path
        d={`M${RAIL} ${busY} H ${(colonnes - 1) * COL + RAIL}`}
        className="map-edge map-edge--lecture"
      />
      <path
        d={`M${centre} ${busY} V ${cockpitY - 6}`}
        className="map-edge map-edge--lecture map-edge--principale"
        markerEnd="url(#map-arrow)"
      />
      <text x={centre + 14} y={busY + 26} className="map-flow-label">
        lecture seule
      </text>

      <rect
        x={centre - COCKPIT_W / 2}
        y={cockpitY}
        width={COCKPIT_W}
        height={COCKPIT_H}
        rx="3"
        className="map-box map-box--cockpit"
      />
      <text
        x={centre}
        y={cockpitY + 26}
        textAnchor="middle"
        className="map-label map-label--cockpit"
      >
        Adama OS
      </text>
      <text
        x={centre}
        y={cockpitY + 45}
        textAnchor="middle"
        className="map-state map-state--cockpit"
      >
        consomme, ne recalcule pas, n’écrit pas
      </text>
    </svg>
  );
}

function DetailNoeud({ node }: { node: MapNode }) {
  return (
    <div className="map-node-detail">
      <dl>
        <div>
          <dt>État</dt>
          <dd>{node.state}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{node.source}</dd>
        </div>
        <div>
          <dt>Dernière activité</dt>
          <dd>{dateCourte(node.lastActivityAt)}</dd>
        </div>
      </dl>
      {node.proofId ? (
        <Link className="map-verify" href={`/verifier/${node.proofId}`}>
          Vérifier cet état <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <p className="map-verify map-verify--absente">
          Aucune affirmation publiée pour cet état, donc aucun lien de
          vérification.
        </p>
      )}
    </div>
  );
}

/** La liste hierarchique. Equivalent textuel complet, et repli sous 720 px. */
function Liste({ map }: { map: EcosystemMap }) {
  return (
    <ol className="map-list">
      {map.divisions.map((division) => {
        const entete = map.nodes.find((n) => n.id === `division:${division}`);
        const produits = map.nodes.filter(
          (n) => n.kind === "produit" && n.division === division,
        );
        return (
          <li key={division} className="map-list-division">
            <h3>{libelleDivision(division)}</h3>
            <p className="map-list-role">{entete?.state}</p>
            <ol>
              {produits.map((produit) => {
                const depot = map.nodes.find(
                  (n) =>
                    n.kind === "depot" &&
                    n.division === division &&
                    n.row === produit.row,
                );
                return (
                  <li key={produit.id} className="map-list-produit">
                    <p className="map-list-nom">
                      <span aria-hidden="true">
                        {marqueEtat(produit.state)}
                      </span>{" "}
                      {produit.label}
                    </p>
                    <DetailNoeud node={produit} />
                    {depot ? (
                      <p className="map-list-depot">
                        Dépôt <code>{depot.label}</code> · {depot.state}
                      </p>
                    ) : (
                      <p className="map-list-depot map-list-depot--absent">
                        Aucun dépôt rattaché à ce produit dans le registre.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        );
      })}
      <li className="map-list-division map-list-cockpit">
        <h3>Adama OS</h3>
        <p className="map-list-role">
          Le cockpit. Il lit les produits ci-dessus, il n’en héberge aucun, et
          il n’écrit jamais chez eux.
        </p>
      </li>
    </ol>
  );
}

export function EcosystemMapView({
  map,
  repos,
  roles,
}: {
  map: EcosystemMap;
  /** Dépôts non lus, nommés un par un. Jamais omis en silence. */
  repos: RepoStatusRow[];
  /** Phrase de rôle par division, contenu éditorial relu. */
  roles: Record<string, string>;
}) {
  if (map.empty) {
    return (
      <section className="map-empty" aria-labelledby="carte-title">
        <p className="portfolio-label">LA CARTE</p>
        <h2 id="carte-title">
          Le registre produits <span className="serif">ne répond pas.</span>
        </h2>
        <p>
          La carte n’est pas rendue. Elle ne se replie pas non plus sur une
          version figée : une carte de l’écosystème dessinée sans le registre
          serait un dessin, pas une carte. La source attendue est le registre
          produits de la base de données.
        </p>
      </section>
    );
  }

  const absents = repos.filter((r) => !r.ok);

  return (
    <section className="map-section" aria-labelledby="carte-title">
      <div className="map-intro">
        <p className="portfolio-label">LA CARTE</p>
        <h2 id="carte-title">
          Quatre divisions, un cockpit,{" "}
          <span className="serif">et des flèches dans un seul sens.</span>
        </h2>
        <p>
          Chaque nœud de cette carte vient du registre produits ou du résolveur
          de dépôts. Aucun n’est écrit dans le composant, et un test échoue si
          l’un d’eux venait à l’être.
        </p>
      </div>

      <div className="map-canvas">
        <Schema map={map} />
      </div>

      <p className="map-legend">
        <strong>Le sens des flèches est la carte.</strong> Toutes les lectures
        montent des produits vers le cockpit. Aucune flèche ne part du cockpit
        vers un produit, et il n’en existe aucune dans le code : le cockpit
        consomme, il ne recalcule pas, et il n’écrit jamais dans un produit du
        groupe.
      </p>

      <div className="map-roles">
        {map.divisions.map((division) => (
          <div key={division}>
            <h3>{libelleDivision(division)}</h3>
            <p>{roles[division] ?? "Rôle non renseigné dans le registre."}</p>
          </div>
        ))}
      </div>

      <Liste map={map} />

      {absents.length > 0 ? (
        <div className="map-absents">
          <h3>Ce que la carte ne montre pas</h3>
          <ul>
            {absents.map((r) => (
              <li key={r.fullName}>
                <code>{r.fullName}</code> · {r.reason}
              </li>
            ))}
          </ul>
          <p>
            Ces dépôts existent, ils ne sont simplement pas lus. Les nommer
            coûte moins cher que de laisser croire que la carte est complète.
          </p>
        </div>
      ) : null}

      <p className="map-observed">
        Composée le{" "}
        <time dateTime={map.observedAt}>
          {new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }).format(new Date(map.observedAt))}{" "}
          UTC
        </time>
        , à partir de {map.nodes.length} nœuds réellement présents en base ou au
        résolveur de dépôts. Aucun n’est écrit dans le code.
      </p>
    </section>
  );
}

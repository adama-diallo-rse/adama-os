// =====================================================================
// C4-T1 a C4-T4, le modele de la carte de l'ecosysteme.
//
// Module PUR. Il ne lit ni base ni reseau : il recoit le registre produits,
// l'etat de lecture des depots et les affirmations du registre de preuve, et
// il en compose un graphe. C'est ce qui permet a tests/ecosystem-map.test.tsx
// de verifier l'interdit central de la couche : aucun noeud fictif.
//
// Trois types de noeud, deux types d'arete, et toutes les aretes de lecture
// vont dans le meme sens. Ce sens EST la decision d'architecture que la carte
// doit rendre evidente : le cockpit consomme les produits, il n'en heberge
// aucun et il n'ecrit jamais chez eux.
//
// La disposition est deterministe : la meme donnee produit toujours la meme
// carte, au pixel pres. Aucune simulation de forces, aucune bibliotheque.
// =====================================================================

import type {
  EcosystemProductRow,
  EcosystemStatus,
  RepoStatusRow,
} from "../../components/types";

export type NodeKind = "cockpit" | "division" | "produit" | "depot";

export type MapNode = {
  id: string;
  kind: NodeKind;
  label: string;
  /** Etat lisible du noeud. Jamais vide : une absence se dit. */
  state: string;
  /** D'ou vient l'information portee par ce noeud. */
  source: string;
  /** Derniere activite connue, ISO 8601. Null si inconnue. */
  lastActivityAt: string | null;
  /** Division de rattachement, pour les produits et les depots. */
  division: string | null;
  /** Identifiant d'affirmation du registre de preuve, quand il en existe une. */
  proofId: string | null;
  /** Colonne et rang, calcules par la disposition. */
  column: number;
  row: number;
};

export type MapEdge = {
  from: string;
  to: string;
  kind: "appartenance" | "lecture";
};

export type EcosystemMap = {
  nodes: MapNode[];
  edges: MapEdge[];
  divisions: string[];
  /** Horodatage de la composition, ISO 8601. */
  observedAt: string;
  /** Vrai quand le registre n'a rien fourni : la carte ne se rend pas. */
  empty: boolean;
};

const STATUT_PRODUIT: Record<EcosystemStatus, string> = {
  live: "En ligne",
  building: "En développement",
  planned: "En projet",
};

/** Ordre d'affichage des divisions. Une inconnue passe apres, par ordre. */
const ORDRE = ["STRATA", "IROKO", "Afrique", "Cockpit"];

function rang(division: string): number {
  const i = ORDRE.indexOf(division);
  return i === -1 ? ORDRE.length : i;
}

export type MapInput = {
  products: EcosystemProductRow[];
  repos: RepoStatusRow[];
  /** Derniere activite connue par depot, "owner/repo" vers ISO 8601. */
  activity: Record<string, string>;
  /** Affirmation du registre de preuve, par slug de produit. */
  proofs: Record<string, string>;
  observedAt: string;
};

/**
 * Compose le graphe.
 *
 * Regle tenue ici, et c'est la seule qui compte : chaque noeud vient d'une
 * ligne du registre produits ou d'une entree du resolveur de depots. Aucun
 * libelle n'est ecrit dans ce fichier, a l'exception du cockpit lui-meme,
 * qui n'est pas un produit du groupe mais le lecteur.
 */
export function buildEcosystemMap(input: MapInput): EcosystemMap {
  const { products, repos, activity, proofs, observedAt } = input;

  if (products.length === 0) {
    return {
      nodes: [],
      edges: [],
      divisions: [],
      observedAt,
      empty: true,
    };
  }

  const divisions = Array.from(new Set(products.map((p) => p.division))).sort(
    (a, b) => {
      const d = rang(a) - rang(b);
      return d !== 0 ? d : a.localeCompare(b);
    },
  );

  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  divisions.forEach((division, column) => {
    nodes.push({
      id: `division:${division}`,
      kind: "division",
      label: division,
      state: (() => {
        const n = products.filter((p) => p.division === division).length;
        return `${n} produit${n > 1 ? "s" : ""}`;
      })(),
      source: "Registre produits",
      lastActivityAt: null,
      division,
      proofId: null,
      column,
      row: 0,
    });

    const dedans = products
      .filter((p) => p.division === division)
      .sort((a, b) => a.position - b.position);

    dedans.forEach((produit, row) => {
      const produitId = `produit:${produit.slug}`;
      // Le depot d'un produit est celui que le resolveur lui a associe. Un
      // produit sans depot n'invente pas de noeud de depot : il n'en a pas.
      const depot = repos.find((r) => r.product === produit.name);
      nodes.push({
        id: produitId,
        kind: "produit",
        label: produit.name,
        state: STATUT_PRODUIT[produit.status] ?? "État inconnu",
        source: "Registre produits",
        lastActivityAt: depot ? (activity[depot.fullName] ?? null) : null,
        division,
        proofId: proofs[produit.slug] ?? null,
        column,
        row: row + 1,
      });
      edges.push({
        from: produitId,
        to: `division:${division}`,
        kind: "appartenance",
      });
      edges.push({ from: produitId, to: "cockpit", kind: "lecture" });

      if (depot) {
        const depotId = `depot:${depot.fullName}`;
        nodes.push({
          id: depotId,
          kind: "depot",
          label: depot.fullName,
          state: depot.ok
            ? `${depot.commits} contribution${depot.commits > 1 ? "s" : ""} lue${
                depot.commits > 1 ? "s" : ""
              }`
            : `Non lu, ${depot.reason ?? "raison inconnue"}`,
          source: "Journal de construction",
          lastActivityAt: activity[depot.fullName] ?? null,
          division,
          proofId: null,
          column,
          row: row + 1,
        });
        edges.push({ from: depotId, to: produitId, kind: "appartenance" });
      }
    });
  });

  nodes.push({
    id: "cockpit",
    kind: "cockpit",
    label: "Adama OS",
    state: "Lit les produits, n’en héberge aucun",
    source: "Ce site",
    lastActivityAt: observedAt,
    division: null,
    proofId: null,
    column: 0,
    row: 0,
  });

  return { nodes, edges, divisions, observedAt, empty: false };
}

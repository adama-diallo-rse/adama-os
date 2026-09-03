// =====================================================================
// C10-T11, les commandes d'inspection du terminal.
//
// Module PUR. Il ne touche ni au DOM, ni au routeur, ni a l'etat React : il
// recoit des donnees et rend, pour chaque commande, les lignes a afficher et
// la destination eventuelle. Le composant se contente d'executer.
//
// Cette separation a un but precis et pas seulement esthetique : la regle de
// la couche est que CHAQUE commande soit branchee sur une source reelle, et
// aucune sur un texte en dur. Rendue pure, cette regle se verifie par un
// test au lieu de reposer sur une relecture.
//
// Ce qui n'existe pas ici, et n'existera pas : une commande qui rendrait un
// texte ecrit d'avance. Une commande sans source n'a pas sa place dans un
// site qui refuse les valeurs sans provenance.
// =====================================================================

import type { CarteProjet } from "../../content/projets";
import { DISPONIBILITE, IDENTITE, RECHERCHE } from "../../content/profil";
import type {
  EcosystemProductRow,
  GatewayStatusRow,
  TerminalIntegrity,
  TerminalProof,
} from "../../components/types";

export type LigneTerminal = { text: string; tone: "ok" | "info" };

export type SortieCommande = {
  lignes: LigneTerminal[];
  /** Adresse a ouvrir apres l'affichage. Null quand la commande ne navigue pas. */
  ouvrir: string | null;
  /** Ancre a rejoindre dans la page courante. Null sinon. */
  ancre: string | null;
};

export type CommandeInspection = {
  value: string;
  hint: string;
  keywords?: string[];
  run: () => SortieCommande;
};

export type ContexteInspection = {
  cartes: CarteProjet[];
  products: EcosystemProductRow[];
  gateways: GatewayStatusRow[];
  proofs: TerminalProof[];
  integrity: TerminalIntegrity | null;
};

function sortie(
  lignes: LigneTerminal[],
  options: { ouvrir?: string; ancre?: string } = {},
): SortieCommande {
  return {
    lignes,
    ouvrir: options.ouvrir ?? null,
    ancre: options.ancre ?? null,
  };
}

/** Sujets proposes a la commande `proof`, derives du registre au rendu. */
export function sujetsPreuve(proofs: TerminalProof[]): string[] {
  return Array.from(
    new Set(
      proofs.map((p) => p.subjectRef).filter((r): r is string => Boolean(r)),
    ),
  ).slice(0, 4);
}

function preuvesDe(proofs: TerminalProof[], sujet: string): SortieCommande {
  const q = sujet.trim().toLowerCase();
  const trouvees = proofs.filter(
    (p) =>
      q === "" ||
      p.statement.toLowerCase().includes(q) ||
      (p.subjectRef ?? "").toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q),
  );
  if (trouvees.length === 0) {
    return sortie([
      {
        text:
          q === ""
            ? "aucune affirmation servie par le registre"
            : `aucune affirmation ne correspond à « ${sujet} »`,
        tone: "info",
      },
    ]);
  }
  return sortie([
    { text: `${trouvees.length} affirmation(s)`, tone: "ok" },
    ...trouvees.slice(0, 6).map((p) => ({
      text: `${p.statement} · ${p.source} · ${p.state} · /verifier/${p.id}`,
      tone: "info" as const,
    })),
  ]);
}

/**
 * Toutes les commandes d'inspection.
 *
 * L'ordre est celui de l'affichage, et il n'est pas neutre : `help` d'abord,
 * puis ce qui decrit la personne, puis ce qui decrit le systeme, puis les
 * deux bascules de lecture.
 */
export function commandesInspection(
  ctx: ContexteInspection,
): CommandeInspection[] {
  const commandes: CommandeInspection[] = [
    {
      value: "help",
      hint: "la liste des commandes",
      run: () =>
        sortie([
          { text: "commandes d’inspection :", tone: "ok" },
          { text: "whoami · profil, recherche, disponibilité", tone: "info" },
          { text: "projects · les fiches projet relues", tone: "info" },
          { text: "ecosystem · le registre produits", tone: "info" },
          {
            text: "proof <sujet> · une affirmation et sa preuve",
            tone: "info",
          },
          { text: "status · l’état réel des sondes produit", tone: "info" },
          { text: "integrity · le dernier calcul d’intégrité", tone: "info" },
          {
            text: "build, decisions, turns, architecture, recruiter, contact",
            tone: "info",
          },
        ]),
    },
    {
      value: "whoami",
      hint: "profil, recherche, disponibilité",
      run: () =>
        sortie([
          { text: IDENTITE.nom, tone: "ok" },
          { text: IDENTITE.capacite, tone: "info" },
          { text: DISPONIBILITE, tone: "info" },
          {
            text: `postes visés : ${RECHERCHE.postes.join(" · ")}`,
            tone: "info",
          },
        ]),
    },
    {
      value: "projects",
      hint: "les fiches projet relues",
      run: () =>
        ctx.cartes.length === 0
          ? sortie([{ text: "aucune fiche projet servie", tone: "info" }])
          : sortie([
              {
                text: `${ctx.cartes.length} fiche(s) projet relue(s)`,
                tone: "ok",
              },
              ...ctx.cartes.map((c) => ({
                text: `${c.titre} · ${c.roleEnUnMot} · ${c.etatLabel}`,
                tone: "info" as const,
              })),
            ]),
    },
    {
      value: "ecosystem",
      hint: "le registre produits",
      run: () =>
        ctx.products.length === 0
          ? sortie([
              {
                text: "registre produits injoignable, rien n’est affiché",
                tone: "info",
              },
            ])
          : sortie([
              {
                text: `${ctx.products.length} produit(s) au registre`,
                tone: "ok",
              },
              ...ctx.products.map((p) => ({
                text: `${p.name} · ${p.division} · ${
                  p.url ? "en ligne" : "sans lien public"
                }`,
                tone: "info" as const,
              })),
            ]),
    },
    {
      value: "proof",
      hint: "affirmations et preuves",
      keywords: ["preuve", "verifier"],
      run: () => preuvesDe(ctx.proofs, ""),
    },
    ...sujetsPreuve(ctx.proofs).map((sujet) => ({
      value: `proof ${sujet}`,
      hint: "source, état, vérification",
      keywords: sujet.startsWith("strata") ? ["ping strata"] : undefined,
      run: () => preuvesDe(ctx.proofs, sujet),
    })),
    {
      value: "status",
      hint: "état réel des sondes produit",
      keywords: ["sante", "matrice"],
      run: () => {
        const sondes = ctx.gateways.filter((g) => g.status !== "disabled");
        const lignes: LigneTerminal[] =
          sondes.length === 0
            ? [
                {
                  text: "aucune sonde configurée, l’état des produits n’est pas mesuré",
                  tone: "info",
                },
              ]
            : sondes.map((sonde) => ({
                text:
                  sonde.status === "ok"
                    ? `${sonde.productName} · opérationnel`
                    : `${sonde.productName} · ${
                        sonde.failureKind === "erreur_reseau" ||
                        sonde.failureKind === "delai_depasse"
                          ? "indéterminé, ce site n’a pas pu le joindre"
                          : "dégradé, le produit a répondu un état non sain"
                      }`,
                tone: sonde.status === "ok" ? "ok" : "info",
              }));
        return sortie([
          ...lignes,
          {
            text: "matrice complète des sept capacités : /systeme/pannes",
            tone: "info",
          },
        ]);
      },
    },
    {
      value: "integrity",
      hint: "dernier calcul d’intégrité",
      run: () => {
        const i = ctx.integrity;
        if (!i) {
          return sortie([
            {
              text: "aucun calcul d’intégrité enregistré sur cette version",
              tone: "info",
            },
          ]);
        }
        return sortie([
          {
            text: `${i.reussis} réussi(s), ${i.echoues} en échec, ${i.nonExecutes} non exécuté(s)`,
            tone: i.echoues === 0 ? "ok" : "info",
          },
          {
            text: i.perime
              ? `calcul vieux de ${i.ageJours} jours : il décrit un état passé`
              : `calculé il y a ${i.ageJours} jour(s)`,
            tone: "info",
          },
        ]);
      },
    },
    {
      value: "build",
      hint: "le journal de construction",
      run: () => sortie([], { ouvrir: "/journal" }),
    },
    {
      value: "decisions",
      hint: "le journal d’architecture",
      run: () => sortie([], { ouvrir: "/decisions" }),
    },
    {
      value: "turns",
      hint: "ce sur quoi je suis revenu",
      keywords: ["revirements"],
      run: () => sortie([], { ouvrir: "/revirements" }),
    },
    {
      value: "trajectory",
      hint: "maintenant, ensuite, plus tard",
      run: () => sortie([], { ancre: "couche-c" }),
    },
    {
      value: "architecture",
      hint: "la vue technique",
      keywords: ["technique", "inventaire"],
      run: () => sortie([], { ouvrir: "/technique" }),
    },
    {
      value: "recruiter",
      hint: "bascule en parcours recruteur",
      run: () => sortie([], { ouvrir: "/recruteur" }),
    },
  ];
  return commandes;
}

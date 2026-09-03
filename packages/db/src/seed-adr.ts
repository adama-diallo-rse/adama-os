// =====================================================================
// C6 et C7, semis du journal d'architecture.
// Lancement : pnpm --filter @adama/db adr:seed
// A executer APRES les migrations 0005 et 0006.
//
// Ce que ce script fait :
//   1. il MIGRE les trois decisions historiques, en les retrouvant par leur
//      titre. Elles gardent leur identifiant technique et leur place dans la
//      Couche B du cockpit : elles ne sont ni dupliquees ni remplacees ;
//   2. il insere les autres ADR du catalogue ;
//   3. il ne supprime JAMAIS une ligne. Un ADR remplace reste en ligne.
//
// Ce que ce script ne fait PAS : il ne bascule jamais reviewed_by_adama a
// vrai. Un ADR affirme des choses sur le travail d'Adama ; personne d'autre
// que lui ne peut les valider. Tant qu'il n'a pas relu, l'ADR existe en base,
// il est marque publie, et la politique de securite de la migration 0005
// interdit a la cle anonyme de le lire. La page /admin/relecture sert
// exactement a cela.
//
// Reexecutable : le contenu est mis a jour, l'etat de relecture est
// preserve. Relancer le semis apres une relecture ne la defait pas.
// =====================================================================

import { config } from "dotenv";

config({ path: ".env" });

import { eq, sql } from "drizzle-orm";
import { ADR_CATALOGUE, adrParId, type Adr } from "./adr-catalogue";
import { decisionsLog } from "./schema";

/**
 * Les trois decisions anterieures au format ADR, retrouvees par leur titre
 * d'origine. Le motif est volontairement etroit : un motif large migrerait
 * une ligne voisine sans que personne s'en apercoive.
 */
const TITRES_HISTORIQUES: Record<string, string> = {
  "DEC-001": "%RAG%Fine-Tuning%",
  "DEC-002": "%FastAPI%",
  "DEC-003": "%Mistral%",
};

/** Libelle de categorie, colonne heritee et non nulle de la Couche B. */
const CATEGORIE: Record<Adr["impact"], string> = {
  architecture: "Architecture",
  conformite: "Conformité",
  cout: "Coût",
  produit: "Produit",
  securite: "Sécurité",
};

/** Le raisonnement lisible d'un trait, pour la Couche B qui n'affiche que ce
 *  champ. Les trois axes restent lisibles separement sur /decisions. */
function raisonnementLisible(adr: Adr): string {
  return [
    adr.decision,
    `Technique : ${adr.raisonnement.technique}`,
    `Réglementaire : ${adr.raisonnement.reglementaire}`,
    `Économique : ${adr.raisonnement.economique}`,
    `Compromis accepté : ${adr.compromis}`,
  ].join(" ");
}

function valeurs(adr: Adr) {
  return {
    title: adr.titre,
    date: adr.date,
    category: CATEGORIE[adr.impact],
    reasoning: raisonnementLisible(adr),
    tags: [...adr.tags],
    isPublished: true,
    adrId: adr.adrId,
    status: adr.statut,
    scope: adr.portee,
    impact: adr.impact,
    reversibility: adr.reversibilite,
    supersedes: adr.remplace,
    context: [...adr.contexte],
    options: adr.options.map((o) => ({ ...o })),
    decision: adr.decision,
    rationale: { ...adr.raisonnement },
    tradeoff: adr.compromis,
    consequence: adr.consequence,
    evidenceRefs: adr.preuves.map((p) => ({ ...p })),
    reconstructed: adr.reconstruit,
    openQuestions: [...adr.questions],
    revirement: adr.revirement ? { ...adr.revirement } : null,
    updatedAt: new Date(),
  };
}

async function seedAdr() {
  console.log("→ Semis du journal d'architecture (C6, C7) : demarrage");

  // Controle avant ecriture : un ADR qui en remplace un autre doit pouvoir le
  // nommer. Ecrire d'abord et decouvrir le renvoi casse ensuite laisserait la
  // base dans un etat que la page ne sait pas rendre.
  const renvoisCasses = ADR_CATALOGUE.filter(
    (a) => a.remplace !== null && adrParId(a.remplace) === null,
  );
  if (renvoisCasses.length > 0) {
    throw new Error(
      `Renvoi vers un ADR absent du catalogue : ${renvoisCasses
        .map((a) => `${a.adrId} -> ${a.remplace}`)
        .join(", ")}`,
    );
  }

  const { db } = await import("./client");

  let migrees = 0;
  let inserees = 0;
  let mises_a_jour = 0;

  for (const adr of ADR_CATALOGUE) {
    const v = valeurs(adr);

    // 1. La ligne porte-t-elle deja cet identifiant ?
    const parId = await db
      .select({ id: decisionsLog.id })
      .from(decisionsLog)
      .where(eq(decisionsLog.adrId, adr.adrId))
      .limit(1);

    if (parId[0]) {
      // Mise a jour du contenu, sans toucher a l'etat de relecture.
      await db
        .update(decisionsLog)
        .set(v)
        .where(eq(decisionsLog.id, parId[0].id));
      mises_a_jour += 1;
      continue;
    }

    // 2. Sinon, s'agit-il d'une des trois decisions anterieures au format ?
    const motif = TITRES_HISTORIQUES[adr.adrId];
    if (motif) {
      const historique = await db
        .select({ id: decisionsLog.id, title: decisionsLog.title })
        .from(decisionsLog)
        .where(
          sql`${decisionsLog.adrId} is null and ${decisionsLog.title} ilike ${motif}`,
        )
        .limit(2);

      if (historique.length > 1) {
        // Deux lignes correspondent : on ne devine pas laquelle migrer.
        console.error(
          `  ! ${adr.adrId} : ${historique.length} lignes correspondent au motif ${motif}, aucune n'est migree. Trancher a la main.`,
        );
        continue;
      }

      if (historique[0]) {
        await db
          .update(decisionsLog)
          .set(v)
          .where(eq(decisionsLog.id, historique[0].id));
        migrees += 1;
        console.log(
          `  ✓ ${adr.adrId} : ligne historique migree (« ${historique[0].title} »)`,
        );
        continue;
      }
    }

    // 3. Sinon, c'est un ADR nouveau.
    await db.insert(decisionsLog).values(v);
    inserees += 1;
  }

  console.log(
    `  ✓ decisions_log : ${migrees} migree(s), ${inserees} inseree(s), ${mises_a_jour} mise(s) a jour`,
  );

  // Controle d'integrite : aucun renvoi vers un ADR qui n'existe pas.
  const orphelins = await db
    .select({ adrId: decisionsLog.adrId, supersedes: decisionsLog.supersedes })
    .from(decisionsLog)
    .where(
      sql`${decisionsLog.supersedes} is not null and not exists (
        select 1 from decisions_log s where s.adr_id = ${decisionsLog.supersedes}
      )`,
    );

  if (orphelins.length > 0) {
    console.error(
      `  ! ${orphelins.length} renvoi(s) vers un ADR inexistant :`,
      orphelins.map((o) => `${o.adrId} -> ${o.supersedes}`).join(", "),
    );
  } else {
    console.log("  ✓ aucun renvoi vers un ADR inexistant");
  }

  const [compte] = await db
    .select({
      total: sql<number>`count(*) filter (where adr_id is not null)::int`,
      relus: sql<number>`count(*) filter (where reviewed_by_adama)::int`,
      revirements: sql<number>`count(*) filter (where revirement is not null)::int`,
    })
    .from(decisionsLog);

  console.log("");
  console.log(
    `  ${compte?.total ?? 0} ADR en base, dont ${compte?.revirements ?? 0} revirements.`,
  );
  console.log(
    `  ${compte?.relus ?? 0} relu(s) par Adama, donc servis publiquement.`,
  );
  console.log("");
  console.log("  Aucun ADR n'a ete marque relu par ce script, et c'est voulu.");
  console.log("  Pour relire : se connecter, puis ouvrir /admin/relecture.");
  console.log("  Ou, en SQL, apres lecture :");
  console.log("    update decisions_log set reviewed_by_adama = true");
  console.log("     where adr_id = 'DEC-004';");
  console.log("→ Semis termine.");
}

seedAdr()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✗ Echec du semis du journal d'architecture :", err);
    process.exit(1);
  });

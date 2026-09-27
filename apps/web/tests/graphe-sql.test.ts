import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ECHANTILLON_EN0,
  LIENS_EN0,
  TYPES_SANS_OBJET_REEL,
  type ObjetGraphe,
} from "./graphe/echantillon";

// =====================================================================
// EN0, le schéma du graphe, joué sur un vrai PostgreSQL local (PGlite).
//
// Aucune base distante n'est touchée. Le test pose d'abord les privilèges
// par défaut d'un projet Supabase, qui donnent tout au rôle anon sur toute
// table nouvelle : c'est exactement le piège où un revoke de colonne ne
// retire rien. Puis il joue la migration deux fois, fait passer chaque règle
// par un cas construit pour être refusé, cas nul et clé absente compris, et
// valide l'échantillon de cent objets réels.
//
// Violation volontaire à faire une fois : retirer le coalesce de la
// contrainte graphe_objets_methode_renvoi dans 0007_graphe.sql. Le cas
// « méthode sans renvoi » passe alors au rouge, parce qu'une expression
// nulle satisfait une contrainte CHECK.
// =====================================================================

const MIGRATION = readFileSync(
  fileURLToPath(
    new URL("../../../packages/db/migrations/0007_graphe.sql", import.meta.url),
  ),
  "utf8",
);

const CONTRAINTES = [
  "graphe_objets_id_type_unique",
  "graphe_objets_id_format",
  "graphe_objets_titre",
  "graphe_objets_version_format",
  "graphe_objets_source_non_vide",
  "graphe_objets_auteur_non_vide",
  "graphe_objets_langue",
  "graphe_objets_revue_apres_date",
  "graphe_objets_publication_datee",
  "graphe_objets_methode_renvoi",
  "graphe_objets_stock_public_date",
  "graphe_objets_stock_reste_nv0",
  "graphe_objets_visibilite_decision_existe",
  "graphe_liens_de_existe",
  "graphe_liens_vers_existe",
  "graphe_liens_liaison_permise",
  "graphe_liens_pas_de_boucle",
];

let db: PGlite;

type Erreur = {
  code?: string;
  constraint?: string;
  column?: string;
  message?: string;
};

async function refus(sql: string, params: unknown[] = []): Promise<Erreur> {
  await db.exec("begin");
  try {
    await db.query(sql, params);
    await db.exec("commit");
  } catch (e) {
    await db.exec("rollback").catch(() => undefined);
    return e as Erreur;
  }
  throw new Error(`Accepté alors qu'il devait être refusé : ${sql}`);
}

const COLONNES = [
  "id",
  "type",
  "titre",
  "version",
  "etat",
  "visibilite",
  "source",
  "origine",
  "date_objet",
  "date_derniere_revue",
  "auteur",
  "droits",
  "langue",
  "publie_le",
  "renvoi_strata",
] as const;

async function inserer(o: ObjetGraphe) {
  await db.query(
    `insert into graphe_objets (${COLONNES.join(", ")})
     values (${COLONNES.map((_, i) => `$${i + 1}`).join(", ")})`,
    COLONNES.map((c) => o[c]),
  );
}

const typeDe = new Map(ECHANTILLON_EN0.map((o) => [o.id, o.type]));

async function lier(de: string, nature: string, vers: string) {
  await db.query(
    "insert into graphe_liens (de, type_de, nature, vers, type_vers) values ($1, $2, $3, $4, $5)",
    [de, typeDe.get(de), nature, vers, typeDe.get(vers)],
  );
}

const valide = (sur: Partial<ObjetGraphe> = {}): ObjetGraphe => ({
  id: "ESSAI-1",
  type: "idee",
  titre: "Objet d’essai",
  version: "1.0",
  etat: "concept",
  visibilite: "nv0",
  source: "https://adamesg-os.fr",
  origine: "adama",
  date_objet: "2026-09-27",
  date_derniere_revue: "2026-09-27",
  auteur: "Adama Diallo",
  droits: "lecture_libre",
  langue: "fr",
  publie_le: null,
  renvoi_strata: null,
  ...sur,
});

const inserSql = (o: ObjetGraphe) =>
  [
    `insert into graphe_objets (${COLONNES.join(", ")}) values (${COLONNES.map((_, i) => `$${i + 1}`).join(", ")})`,
    COLONNES.map((c) => o[c]),
  ] as const;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  `);
  await db.exec(MIGRATION);
  await db.exec(MIGRATION);

  await db.exec("begin");
  for (const o of ECHANTILLON_EN0) await inserer(o);
  for (const l of LIENS_EN0) await lier(l.de, l.nature, l.vers);
  await db.exec("commit");
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe("EN0, la migration", () => {
  it("se rejoue deux fois sans erreur et garde chaque contrainte", async () => {
    await db.exec(MIGRATION);
    const { rows } = await db.query<{ conname: string }>(
      "select conname from pg_constraint where conname like 'graphe_%' order by conname",
    );
    const noms = rows.map((r) => r.conname);
    for (const c of CONTRAINTES) expect(noms, c).toContain(c);
  });

  it("porte treize types, cinq états et quatre niveaux, en listes fermées", async () => {
    const valeurs = async (t: string) =>
      (
        await db.query<{ v: string }>(
          `select unnest(enum_range(null::${t}))::text as v`,
        )
      ).rows.map((r) => r.v);
    expect(await valeurs("graphe_type")).toHaveLength(13);
    expect(await valeurs("graphe_etat")).toEqual([
      "concept",
      "recherche",
      "teste",
      "prouve",
      "archive",
    ]);
    expect(await valeurs("graphe_visibilite")).toEqual([
      "nv0",
      "nv1",
      "nv2",
      "nv3",
    ]);
  });
});

describe("EN0, chaque règle refuse, cas nuls et clés absentes compris", () => {
  it("clé absente : la source manque", async () => {
    const e = await refus(
      "insert into graphe_objets (id, type, titre, version, etat, visibilite, origine, date_objet, date_derniere_revue, auteur, droits, langue) values ('X-1','idee','Essai','1.0','concept','nv0','adama','2026-09-27','2026-09-27','Adama','lecture_libre','fr')",
    );
    expect(e.code).toBe("23502");
    expect(e.column).toBe("source");
  });

  it("valeur nulle : la version vaut null", async () => {
    const e = await refus(
      ...inserSql(valide({ version: null as unknown as string })),
    );
    expect(e.code).toBe("23502");
    expect(e.column).toBe("version");
  });

  const cas: [string, Partial<ObjetGraphe>, string][] = [
    ["version hors format", { version: "1" }, "graphe_objets_version_format"],
    ["source vide", { source: "   " }, "graphe_objets_source_non_vide"],
    [
      "langue hors liste",
      { langue: "de" as ObjetGraphe["langue"] },
      "graphe_objets_langue",
    ],
    [
      "revue antérieure à la date",
      { date_derniere_revue: "2026-01-01" },
      "graphe_objets_revue_apres_date",
    ],
    [
      "publication antérieure à l’objet",
      { publie_le: "2026-01-01" },
      "graphe_objets_publication_datee",
    ],
    ["identifiant hors format", { id: "a b" }, "graphe_objets_id_format"],
    [
      "méthode sans renvoi, valeur nulle",
      { id: "M-999", type: "methode", renvoi_strata: null },
      "graphe_objets_methode_renvoi",
    ],
    ["objet inséré à PROUVÉ", { etat: "prouve" }, "graphe_etat_saute"],
  ];
  for (const [nom, sur, contrainte] of cas) {
    it(`${nom} : ${contrainte}`, async () => {
      const e = await refus(...inserSql(valide(sur)));
      expect(e.constraint).toBe(contrainte);
    });
  }

  it("état hors liste fermée", async () => {
    const e = await refus(
      ...inserSql(valide({ etat: "valide" as ObjetGraphe["etat"] })),
    );
    expect(e.code).toBe("22P02");
  });

  it("niveau N1 à la place de NV1", async () => {
    const e = await refus(
      ...inserSql(valide({ visibilite: "n1" as ObjetGraphe["visibilite"] })),
    );
    expect(e.code).toBe("22P02");
  });

  it("une affirmation sans preuve liée ne s'enregistre pas", async () => {
    const e = await refus(
      ...inserSql(valide({ id: "AFF-SANS-PREUVE", type: "affirmation" })),
    );
    expect(e.constraint).toBe("graphe_affirmation_sans_preuve");
  });

  it("retirer la seule preuve d'une affirmation est refusé", async () => {
    const lien = LIENS_EN0.find(
      (l) =>
        l.nature === "prouve" &&
        LIENS_EN0.filter((m) => m.vers === l.vers && m.nature === "prouve")
          .length === 1,
    );
    expect(lien).toBeDefined();
    const e = await refus(
      "delete from graphe_liens where de = $1 and nature = 'prouve' and vers = $2",
      [lien!.de, lien!.vers],
    );
    expect(e.constraint).toBe("graphe_affirmation_sans_preuve");
  });

  it("rien ne saute d'état : CONCEPT vers TESTÉ", async () => {
    const e = await refus(
      "update graphe_objets set etat = 'teste' where id = 'AXP-223'",
    );
    expect(e.constraint).toBe("graphe_etat_saute");
  });

  it("TESTÉ vers PROUVÉ sans mesure publiée liée", async () => {
    const e = await refus(
      "update graphe_objets set etat = 'prouve' where id = 'M-002'",
    );
    expect(e.constraint).toBe("graphe_prouve_sans_mesure");
  });

  it("une liaison hors de la table des couples permis", async () => {
    const e = await refus(
      "insert into graphe_liens (de, type_de, nature, vers, type_vers) values ('M-001','methode','prouve','strata-scope-en-ligne','affirmation')",
    );
    expect(e.constraint).toBe("graphe_liens_liaison_permise");
  });

  it("un lien qui ment sur le type de son origine", async () => {
    const e = await refus(
      "insert into graphe_liens (de, type_de, nature, vers, type_vers) values ('M-001','preuve','prouve','strata-scope-en-ligne','affirmation')",
    );
    expect(e.constraint).toBe("graphe_liens_de_existe");
  });

  it("un objet relié à lui-même", async () => {
    const e = await refus(
      "insert into graphe_liens (de, type_de, nature, vers, type_vers) values ('M-001','methode','depend_de','M-001','methode')",
    );
    expect(e.constraint).toBe("graphe_liens_pas_de_boucle");
  });

  it("un niveau de visibilité qui change sans décision datée", async () => {
    const e = await refus(
      "update graphe_objets set visibilite = 'nv1' where id = 'M-003'",
    );
    expect(e.constraint).toBe("graphe_visibilite_sans_decision");
  });

  it("le stock public du 7 septembre 2026 ne descend jamais, même avec une décision", async () => {
    await db.query(
      ...inserSql(
        valide({
          id: "STOCK-1",
          publie_le: "2026-09-07",
          date_objet: "2026-09-01",
        }),
      ),
    );
    await db.query(
      "update graphe_objets set stock_public_20260907 = true where id = 'STOCK-1'",
    );
    const e = await refus(
      "update graphe_objets set visibilite = 'nv2', visibilite_decision = 'XDEC-54' where id = 'STOCK-1'",
    );
    expect(e.constraint).toBe("graphe_objets_stock_reste_nv0");
  });

  it("le journal des états ne se réécrit pas", async () => {
    const e = await refus(
      "update graphe_journal_etats set etat = 'prouve' where objet_id = 'M-001'",
    );
    expect(e.constraint).toBe("graphe_journal_immuable");
  });
});

describe("EN0, la clé anonyme", () => {
  it("ne lit jamais l'auteur, par privilège de colonne et non par revoke", async () => {
    const priv = async (col: string) =>
      (
        await db.query<{ p: boolean }>(
          "select has_column_privilege('anon', 'graphe_objets', $1, 'SELECT') as p",
          [col],
        )
      ).rows[0]?.p;
    expect(await priv("auteur")).toBe(false);
    expect(await priv("stock_public_20260907")).toBe(false);
    expect(await priv("visibilite_decision")).toBe(false);
    expect(await priv("titre")).toBe(true);
    expect(await priv("source")).toBe(true);
  });

  it("est refusée sur l'auteur, et ne voit que les objets NV0 publiés", async () => {
    await db.exec("set role anon");
    try {
      await expect(
        db.query("select auteur from graphe_objets"),
      ).rejects.toMatchObject({ code: "42501" });
      const { rows } = await db.query<{ n: number }>(
        "select count(*)::int as n from graphe_objets",
      );
      const attendus = ECHANTILLON_EN0.filter(
        (o) =>
          o.visibilite === "nv0" &&
          o.publie_le &&
          o.publie_le <= new Date().toISOString().slice(0, 10),
      ).length;
      expect(rows[0]?.n).toBe(attendus + 1); // + STOCK-1, publié le 7 septembre 2026
      await expect(
        db.query("select * from graphe_journal_etats"),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await db.exec("reset role");
    }
  });
});

describe("EN0, validé sur cent objets réels", () => {
  it("compte cent objets et zéro objet à champ manquant", async () => {
    expect(ECHANTILLON_EN0).toHaveLength(100);
    const { rows } = await db.query<{ n: number }>(`
      select count(*)::int as n from graphe_objets
       where id <> 'STOCK-1' and (
         coalesce(btrim(version), '') = '' or coalesce(btrim(source), '') = ''
         or coalesce(btrim(auteur), '') = '' or coalesce(btrim(langue), '') = ''
         or etat is null or visibilite is null or origine is null or droits is null
         or date_objet is null or date_derniere_revue is null)`);
    expect(rows[0]?.n).toBe(0);
  });

  it("parcourt les treize types, et déclare vides ceux sans objet réel", async () => {
    const { rows } = await db.query<{ type: string; n: number }>(
      "select type::text, count(*)::int as n from graphe_objets where id <> 'STOCK-1' group by type",
    );
    const presents = new Set(rows.map((r) => r.type));
    expect(presents.size + TYPES_SANS_OBJET_REEL.length).toBe(13);
    for (const t of TYPES_SANS_OBJET_REEL) expect(presents.has(t)).toBe(false);
  });

  it("journalise l'état de chaque objet inséré", async () => {
    const { rows } = await db.query<{ n: number }>(
      "select count(distinct objet_id)::int as n from graphe_journal_etats",
    );
    expect(rows[0]?.n).toBeGreaterThanOrEqual(100);
  });
});

-- =====================================================================
-- ADAMA OS, EN0, le schéma du graphe de connaissance.
-- A exécuter dans Supabase, SQL Editor, après 0006_revirements.sql. N'est
-- jouée en production par personne d'autre qu'Adama. Idempotente : elle se
-- rejoue deux fois de suite sans erreur et sans contrainte ignorée, ce que
-- tests/graphe-sql.test.ts prouve sur un PostgreSQL local.
--
-- ATTENTION, projet Supabase PARTAGÉ avec STRATA Scope. Tout ce qui est créé
-- ici porte le préfixe graphe_. Aucune table existante n'est touchée, et la
-- migration s'arrête si elle reconnaît le projet dédié de la lettre.
--
-- Ce que fait cette migration :
--   1. treize types d'objets (XDEC-20), cinq états, quatre niveaux ;
--   2. quatorze attributs obligatoires par objet : les douze d'AXP-189, plus
--      la source et le niveau de visibilité exigés par XINV-40, qui
--      l'emporte (XDEC-54) ;
--   3. des liaisons contrôlées : une liaison n'existe que si le couple de
--      types est permis, et une affirmation sans preuve liée ne s'enregistre
--      pas ;
--   4. l'état PROUVÉ exige une mesure publiée liée, et rien ne saute d'état
--      (XINV-39) ; un niveau de visibilité ne change que par une décision
--      du graphe (XINV-40) ; le stock public du 7 septembre 2026 ne descend
--      jamais (XINV-17) ;
--   5. la clé anonyme ne lit que des colonnes nommées, jamais l'auteur
--      (XINV-41), et seulement les objets NV0 publiés.
--
-- Règle apprise en 0005 et 0006, tenue ici partout : une contrainte CHECK
-- dont l'expression vaut NULL est satisfaite. Toute colonne qui peut être
-- nulle passe donc par coalesce avant d'être comparée.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Garde : jamais dans le projet dédié de la lettre (XDEC-38)
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public'
       and table_name in ('lettre_abonnes', 'lettre_consentements', 'lettre_envois')
  ) then
    raise exception 'EN0 : ce projet porte la liste SIGNAL (adama-lettre). Le graphe vit dans le projet du cockpit.';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 1. Types énumérés, listes fermées
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'graphe_type') then
    create type graphe_type as enum (
      'idee', 'source', 'decision', 'affirmation', 'preuve', 'methode',
      'cadre', 'produit', 'article', 'playbook', 'parcours', 'gabarit',
      'composant_strata'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'graphe_etat') then
    -- Affichés CONCEPT, RECHERCHE, TESTÉ, PROUVÉ, ARCHIVÉ.
    create type graphe_etat as enum (
      'concept', 'recherche', 'teste', 'prouve', 'archive'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'graphe_visibilite') then
    -- NV0 public, NV1 contre une adresse, NV2 payant, NV3 sous licence,
    -- jamais servi par l'API (XDEC-27).
    create type graphe_visibilite as enum ('nv0', 'nv1', 'nv2', 'nv3');
  end if;
  if not exists (select 1 from pg_type where typname = 'graphe_origine') then
    create type graphe_origine as enum ('adama', 'tiers', 'strata', 'contribution');
  end if;
  if not exists (select 1 from pg_type where typname = 'graphe_droits') then
    create type graphe_droits as enum (
      'lecture_libre', 'licence_ecrite', 'reserve', 'droits_tiers'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'graphe_lien') then
    create type graphe_lien as enum (
      'prouve', 'mesure', 'source', 'depend_de', 'applique', 'associe_a',
      'decide', 'remplace', 'cite'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Les objets
-- ---------------------------------------------------------------------
create table if not exists graphe_objets (
  -- AXP-189, les douze attributs
  id                   text primary key,
  version              text not null,
  etat                 graphe_etat not null,          -- statut
  origine              graphe_origine not null,
  date_objet           date not null,                 -- date
  auteur               text not null,                 -- jamais servi (XINV-41)
  droits               graphe_droits not null,
  langue               text not null,
  date_derniere_revue  date not null,
  -- preuves, dépendances, produits associés : portés par graphe_liens
  -- XINV-40, les deux champs absents d'AXP-189
  source               text not null,
  visibilite           graphe_visibilite not null,
  -- Identification et service
  type                 graphe_type not null,
  titre                text not null,
  publie_le            date,
  renvoi_strata        text,
  visibilite_decision  text,
  stock_public_20260907 boolean not null default false,
  cree_le              timestamptz not null default now(),
  modifie_le           timestamptz not null default now()
);

comment on table graphe_objets is
  'EN0. Un objet du graphe de connaissance. Le Notion reste la surface d''écriture ; EN1 migre ses pages ici.';
comment on column graphe_objets.auteur is
  'AXP-189. Existe dans le graphe, n''est jamais servi par l''API, un jeu ou le serveur d''outils (XINV-41).';

-- La clé (id, type) porte les clés étrangères des liens : elle se pose une
-- fois et ne se retire pas au rejeu, sinon les liens en dépendraient.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'graphe_objets_id_type_unique') then
    alter table graphe_objets add constraint graphe_objets_id_type_unique unique (id, type);
  end if;
end $$;

alter table graphe_objets
  drop constraint if exists graphe_objets_id_format,
  drop constraint if exists graphe_objets_titre,
  drop constraint if exists graphe_objets_version_format,
  drop constraint if exists graphe_objets_source_non_vide,
  drop constraint if exists graphe_objets_auteur_non_vide,
  drop constraint if exists graphe_objets_langue,
  drop constraint if exists graphe_objets_revue_apres_date,
  drop constraint if exists graphe_objets_publication_datee,
  drop constraint if exists graphe_objets_methode_renvoi,
  drop constraint if exists graphe_objets_stock_public_date,
  drop constraint if exists graphe_objets_stock_reste_nv0,
  drop constraint if exists graphe_objets_visibilite_decision_existe;

alter table graphe_objets
  add constraint graphe_objets_id_format
    check (id ~ '^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$' and length(id) between 2 and 80),
  add constraint graphe_objets_titre
    check (length(btrim(titre)) between 3 and 300),
  add constraint graphe_objets_version_format
    check (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'),
  add constraint graphe_objets_source_non_vide
    check (length(btrim(source)) >= 3),
  add constraint graphe_objets_auteur_non_vide
    check (length(btrim(auteur)) >= 2),
  add constraint graphe_objets_langue
    check (langue in ('fr', 'en', 'fr+en')),
  add constraint graphe_objets_revue_apres_date
    check (date_derniere_revue >= date_objet),
  add constraint graphe_objets_publication_datee
    check (publie_le is null or publie_le >= date_objet),
  -- La clause de renvoi est obligatoire sur chaque méthode (XDEC-08) : elle
  -- dit le produit, ou pourquoi aucun ne correspond. coalesce fait mordre
  -- la règle sur une valeur nulle.
  add constraint graphe_objets_methode_renvoi
    check (type <> 'methode' or length(btrim(coalesce(renvoi_strata, ''))) >= 10),
  add constraint graphe_objets_stock_public_date
    check (not stock_public_20260907
           or coalesce(publie_le, date '9999-12-31') <= date '2026-09-07'),
  -- XINV-17 : ce qui était public au 7 septembre 2026 le reste.
  add constraint graphe_objets_stock_reste_nv0
    check (not stock_public_20260907 or visibilite = 'nv0'),
  add constraint graphe_objets_visibilite_decision_existe
    foreign key (visibilite_decision) references graphe_objets (id)
    on update cascade on delete restrict;

-- ---------------------------------------------------------------------
-- 3. Les liaisons permises, puis les liens
-- ---------------------------------------------------------------------
create table if not exists graphe_liaisons_permises (
  nature     graphe_lien not null,
  type_de    graphe_type not null,
  type_vers  graphe_type not null,
  primary key (nature, type_de, type_vers)
);

comment on table graphe_liaisons_permises is
  'EN0. Les seuls couples de types qu''un lien peut relier. Un lien hors de cette table est refusé par clé étrangère.';

insert into graphe_liaisons_permises (nature, type_de, type_vers)
select n::graphe_lien, d::graphe_type, v::graphe_type
  from (values
    -- une preuve établit une affirmation ; une mesure publiée établit un état PROUVÉ
    ('prouve', 'preuve', 'affirmation'),
    ('mesure', 'preuve', 'methode'),
    ('mesure', 'preuve', 'playbook'),
    ('mesure', 'preuve', 'gabarit'),
    ('mesure', 'preuve', 'parcours'),
    ('mesure', 'preuve', 'produit'),
    -- l'origine documentaire
    ('source', 'idee', 'source'),
    ('source', 'decision', 'source'),
    ('source', 'affirmation', 'source'),
    ('source', 'preuve', 'source'),
    ('source', 'methode', 'source'),
    ('source', 'cadre', 'source'),
    ('source', 'article', 'source'),
    ('source', 'playbook', 'source'),
    ('source', 'gabarit', 'source'),
    ('source', 'parcours', 'source'),
    -- dépendances
    ('depend_de', 'methode', 'methode'),
    ('depend_de', 'playbook', 'playbook'),
    ('depend_de', 'gabarit', 'gabarit'),
    ('depend_de', 'parcours', 'parcours'),
    ('depend_de', 'produit', 'produit'),
    ('depend_de', 'decision', 'decision'),
    -- application d'une méthode
    ('applique', 'playbook', 'methode'),
    ('applique', 'gabarit', 'methode'),
    ('applique', 'parcours', 'methode'),
    ('applique', 'article', 'methode'),
    ('applique', 'produit', 'methode'),
    -- produits associés, dont la clause de renvoi vers STRATA
    ('associe_a', 'methode', 'composant_strata'),
    ('associe_a', 'methode', 'produit'),
    ('associe_a', 'article', 'composant_strata'),
    ('associe_a', 'playbook', 'composant_strata'),
    ('associe_a', 'gabarit', 'composant_strata'),
    ('associe_a', 'cadre', 'composant_strata'),
    ('associe_a', 'idee', 'produit'),
    -- décisions
    ('decide', 'decision', 'idee'),
    ('decide', 'decision', 'methode'),
    ('decide', 'decision', 'produit'),
    ('decide', 'decision', 'gabarit'),
    ('decide', 'decision', 'affirmation'),
    ('decide', 'decision', 'article'),
    -- citations d'un article
    ('cite', 'article', 'source'),
    ('cite', 'article', 'cadre'),
    ('cite', 'article', 'decision'),
    ('cite', 'article', 'methode'),
    ('cite', 'article', 'affirmation')
  ) as t(n, d, v)
union all
-- un objet ne remplace qu'un objet de son type
select 'remplace'::graphe_lien, t, t from unnest(enum_range(null::graphe_type)) as t
on conflict do nothing;

create table if not exists graphe_liens (
  de         text not null,
  type_de    graphe_type not null,
  nature     graphe_lien not null,
  vers       text not null,
  type_vers  graphe_type not null,
  cree_le    timestamptz not null default now(),
  primary key (de, nature, vers)
);

alter table graphe_liens
  drop constraint if exists graphe_liens_de_existe,
  drop constraint if exists graphe_liens_vers_existe,
  drop constraint if exists graphe_liens_liaison_permise,
  drop constraint if exists graphe_liens_pas_de_boucle;

alter table graphe_liens
  -- Les types portés par le lien sont ceux des objets : la clé composite
  -- empêche de déclarer un type faux pour passer la table des liaisons.
  add constraint graphe_liens_de_existe
    foreign key (de, type_de) references graphe_objets (id, type)
    on update cascade on delete restrict,
  add constraint graphe_liens_vers_existe
    foreign key (vers, type_vers) references graphe_objets (id, type)
    on update cascade on delete restrict,
  add constraint graphe_liens_liaison_permise
    foreign key (nature, type_de, type_vers)
    references graphe_liaisons_permises (nature, type_de, type_vers),
  add constraint graphe_liens_pas_de_boucle check (de <> vers);

create index if not exists graphe_liens_vers_idx on graphe_liens (vers, nature);

-- ---------------------------------------------------------------------
-- 4. Le journal des états, qui ne se réécrit pas
-- ---------------------------------------------------------------------
create table if not exists graphe_journal_etats (
  id         bigint generated always as identity primary key,
  objet_id   text not null references graphe_objets (id) on update cascade on delete restrict,
  etat       graphe_etat not null,
  depuis     timestamptz not null default now()
);

create or replace function graphe_journal_immuable() returns trigger
language plpgsql as $$
begin
  raise exception 'Le journal des états ne se réécrit pas.'
    using errcode = '23514', constraint = 'graphe_journal_immuable';
end $$;

drop trigger if exists graphe_journal_immuable on graphe_journal_etats;
create trigger graphe_journal_immuable
  before update or delete on graphe_journal_etats
  for each row execute function graphe_journal_immuable();

-- ---------------------------------------------------------------------
-- 5. Les règles qui portent sur plusieurs lignes
-- ---------------------------------------------------------------------
create or replace function graphe_rang(e graphe_etat) returns int
language sql immutable as $$
  select case e when 'concept' then 0 when 'recherche' then 1
                when 'teste' then 2 when 'prouve' then 3 else 9 end
$$;

-- a. Rien ne saute d'état (XINV-39), et la visibilité ne change que par une
--    décision du graphe (XINV-40). Contrôle immédiat, avant écriture.
create or replace function graphe_objets_avant_ecriture() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.etat = 'prouve' then
      raise exception 'Un objet n''entre pas dans le graphe à l''état PROUVÉ : il y monte depuis TESTÉ.'
        using errcode = '23514', constraint = 'graphe_etat_saute';
    end if;
    return new;
  end if;

  if new.etat is distinct from old.etat and new.etat <> 'archive' then
    if (old.etat = 'archive' and new.etat = 'prouve')
       or (old.etat <> 'archive' and graphe_rang(new.etat) > graphe_rang(old.etat) + 1) then
      raise exception 'Rien ne saute d''état : % vers % est refusé.', old.etat, new.etat
        using errcode = '23514', constraint = 'graphe_etat_saute';
    end if;
  end if;

  if new.visibilite is distinct from old.visibilite then
    if new.visibilite_decision is null
       or new.visibilite_decision is not distinct from old.visibilite_decision
       or not exists (select 1 from graphe_objets d
                       where d.id = new.visibilite_decision and d.type = 'decision') then
      raise exception 'Le niveau de visibilité de % ne change que par une décision datée du graphe.', new.id
        using errcode = '23514', constraint = 'graphe_visibilite_sans_decision';
    end if;
  end if;

  new.modifie_le := now();
  return new;
end $$;

drop trigger if exists graphe_objets_avant_ecriture on graphe_objets;
create trigger graphe_objets_avant_ecriture
  before insert or update on graphe_objets
  for each row execute function graphe_objets_avant_ecriture();

create or replace function graphe_journaliser_etat() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.etat is distinct from old.etat then
    insert into graphe_journal_etats (objet_id, etat) values (new.id, new.etat);
  end if;
  return null;
end $$;

drop trigger if exists graphe_journaliser_etat on graphe_objets;
create trigger graphe_journaliser_etat
  after insert or update on graphe_objets
  for each row execute function graphe_journaliser_etat();

-- b. Une affirmation sans preuve liée ne s'enregistre pas, et un objet
--    PROUVÉ sans mesure publiée liée non plus. Contrôle différé à la fin de
--    la transaction, pour qu'on puisse écrire l'objet puis son lien.
create or replace function graphe_controler_objet(cible text) returns void
language plpgsql as $$
declare
  o graphe_objets%rowtype;
begin
  select * into o from graphe_objets where id = cible;
  if not found then
    return;
  end if;
  if o.type = 'affirmation' and not exists (
    select 1 from graphe_liens l
     where l.vers = o.id and l.nature = 'prouve'
  ) then
    raise exception 'L''affirmation % n''a aucune preuve liée.', o.id
      using errcode = '23514', constraint = 'graphe_affirmation_sans_preuve';
  end if;
  if o.etat = 'prouve' and not exists (
    select 1 from graphe_liens l
      join graphe_objets p on p.id = l.de
     where l.vers = o.id and l.nature = 'mesure' and p.publie_le is not null
  ) then
    raise exception 'L''objet % est PROUVÉ sans mesure de résultat publiée liée.', o.id
      using errcode = '23514', constraint = 'graphe_prouve_sans_mesure';
  end if;
end $$;

create or replace function graphe_objets_apres_ecriture() returns trigger
language plpgsql as $$
begin
  perform graphe_controler_objet(new.id);
  return null;
end $$;

drop trigger if exists graphe_objets_complet on graphe_objets;
create constraint trigger graphe_objets_complet
  after insert or update on graphe_objets
  deferrable initially deferred
  for each row execute function graphe_objets_apres_ecriture();

create or replace function graphe_liens_apres_retrait() returns trigger
language plpgsql as $$
begin
  perform graphe_controler_objet(old.vers);
  return null;
end $$;

drop trigger if exists graphe_liens_retrait on graphe_liens;
create constraint trigger graphe_liens_retrait
  after delete or update on graphe_liens
  deferrable initially deferred
  for each row execute function graphe_liens_apres_retrait();

-- ---------------------------------------------------------------------
-- 6. Row Level Security et privilèges de la clé anonyme
-- ---------------------------------------------------------------------
-- Le projet Supabase accorde par défaut tous les privilèges de table au rôle
-- anon sur toute table nouvelle. Un revoke de colonne ne retire rien tant
-- qu'un privilège de table existe : on retire donc tout, puis on accorde
-- colonne par colonne. Le contrôle (c) le vérifie par has_column_privilege.
alter table graphe_objets enable row level security;
alter table graphe_liens enable row level security;
alter table graphe_liaisons_permises enable row level security;
alter table graphe_journal_etats enable row level security;

revoke all on graphe_objets, graphe_liens, graphe_liaisons_permises,
              graphe_journal_etats from anon, authenticated;

grant select (
  id, type, titre, version, etat, visibilite, source, origine, date_objet,
  date_derniere_revue, droits, langue, publie_le, renvoi_strata
) on graphe_objets to anon, authenticated;
grant select (de, type_de, nature, vers, type_vers) on graphe_liens to anon, authenticated;
grant select on graphe_liaisons_permises to anon, authenticated;

drop policy if exists "graphe_objets_lecture_publique" on graphe_objets;
create policy "graphe_objets_lecture_publique" on graphe_objets
  for select to anon, authenticated
  using (visibilite = 'nv0' and publie_le is not null and publie_le <= current_date);

drop policy if exists "graphe_liens_lecture_publique" on graphe_liens;
create policy "graphe_liens_lecture_publique" on graphe_liens
  for select to anon, authenticated
  using (
    exists (select 1 from graphe_objets o where o.id = de
             and o.visibilite = 'nv0' and o.publie_le <= current_date)
    and exists (select 1 from graphe_objets o where o.id = vers
             and o.visibilite = 'nv0' and o.publie_le <= current_date)
  );

drop policy if exists "graphe_liaisons_lecture" on graphe_liaisons_permises;
create policy "graphe_liaisons_lecture" on graphe_liaisons_permises
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------
-- 7. Contrôles
-- ---------------------------------------------------------------------
-- a. objets à champ manquant, sur les quatorze attributs. Cible : zéro.
select count(*) as objets_incomplets
  from graphe_objets
 where coalesce(btrim(version), '') = ''
    or coalesce(btrim(source), '') = ''
    or coalesce(btrim(auteur), '') = ''
    or coalesce(btrim(langue), '') = ''
    or etat is null or visibilite is null or origine is null or droits is null
    or date_objet is null or date_derniere_revue is null;

-- b. affirmations sans preuve. Cible : zéro ligne.
select o.id from graphe_objets o
 where o.type = 'affirmation'
   and not exists (select 1 from graphe_liens l where l.vers = o.id and l.nature = 'prouve');

-- c. la clé anonyme ne lit pas l'auteur. Doit renvoyer false, false.
select has_column_privilege('anon', 'graphe_objets', 'auteur', 'SELECT') as anon_auteur,
       has_column_privilege('anon', 'graphe_objets', 'stock_public_20260907', 'SELECT') as anon_stock;

-- d. la contrainte mord sur une clé absente. A exécuter à la main, hors
--    migration ; doit lever graphe_objets_methode_renvoi :
--    insert into graphe_objets (id, type, titre, version, etat, visibilite,
--      source, origine, date_objet, date_derniere_revue, auteur, droits, langue)
--    values ('M-999', 'methode', 'Essai sans renvoi', '1.0', 'concept', 'nv0',
--      '/methodes', 'adama', current_date, current_date, 'Adama', 'lecture_libre', 'fr');
-- =====================================================================

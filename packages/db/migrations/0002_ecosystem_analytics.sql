-- =====================================================================
-- ADAMA OS, L1-T10, metriques produit a l'echelle du groupe
-- A executer dans Supabase -> SQL Editor, APRES 0001_ecosystem_products.sql.
-- Idempotent : peut etre relance sans casser l'existant.
--
-- Ce que fait cette migration :
--   1. renomme strata_analytics en ecosystem_analytics (le perimetre est le
--      groupe, pas la seule suite STRATA) ;
--   2. ajoute division, product_slug (cle etrangere vers ecosystem_products)
--      et fetched_at, les champs de provenance exiges par la couche L9 ;
--   3. pose une vue de compatibilite strata_analytics, en lecture seule, a
--      retirer le 30 novembre 2026 ;
--   4. tranche le sort de audit_requests, orpheline depuis le recentrage du
--      13 juillet 2026.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Renommage strata_analytics -> ecosystem_analytics
-- ---------------------------------------------------------------------
-- Trois etats possibles au moment ou cette migration passe : la table porte
-- encore l'ancien nom, elle porte deja le nouveau, ou la base a ete montee
-- par drizzle-kit push et ne contient rien des deux. Les trois sont geres.
do $$
begin
  if exists (
        select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relname = 'strata_analytics' and n.nspname = 'public'
          and c.relkind = 'r'
      )
     and not exists (
        select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relname = 'ecosystem_analytics' and n.nspname = 'public'
          and c.relkind = 'r'
      )
  then
    alter table public.strata_analytics rename to ecosystem_analytics;
    raise notice 'strata_analytics renommee en ecosystem_analytics';
  end if;
end $$;

-- Base montee sans 0000 : on cree la table dans sa forme cible.
create table if not exists ecosystem_analytics (
  id         uuid primary key default gen_random_uuid(),
  metric     text not null,
  value      double precision not null,
  period     text,
  source     text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Colonnes de provenance (L9)
-- ---------------------------------------------------------------------
-- Regle tenue par la base autant que par le code : une metrique importee
-- porte le produit dont elle vient, la source qui l'a servie et l'instant du
-- relevé. Sans ces champs, elle ne s'affiche pas.
alter table ecosystem_analytics add column if not exists division text;
alter table ecosystem_analytics add column if not exists product_slug text;
alter table ecosystem_analytics
  add column if not exists fetched_at timestamptz not null default now();

-- Cle etrangere vers le registre produits, uniquement si 0001 est passee.
do $$
begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relname = 'ecosystem_products' and n.nspname = 'public'
  ) then
    begin
      alter table ecosystem_analytics
        add constraint ecosystem_analytics_product_fk
        foreign key (product_slug) references ecosystem_products (slug)
        on update cascade on delete set null;
    exception when duplicate_object then null;
    end;
  else
    raise notice 'ecosystem_products absente : cle etrangere non posee, rejouer 0001 puis cette migration';
  end if;
end $$;

create index if not exists ecosystem_analytics_metric_idx
  on ecosystem_analytics (metric, created_at desc);
create index if not exists ecosystem_analytics_product_idx
  on ecosystem_analytics (product_slug, created_at desc)
  where product_slug is not null;

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
alter table ecosystem_analytics enable row level security;

-- Les policies suivent la table lors d'un renommage : on retire les anciens
-- noms et on repose les nouveaux, pour que le nom dise ce qu'il protege.
drop policy if exists "strata_public_read"  on ecosystem_analytics;
drop policy if exists "strata_admin_write"  on ecosystem_analytics;

drop policy if exists "ecosystem_analytics_public_read" on ecosystem_analytics;
create policy "ecosystem_analytics_public_read" on ecosystem_analytics
  for select to anon, authenticated using (true);

drop policy if exists "ecosystem_analytics_admin_write" on ecosystem_analytics;
create policy "ecosystem_analytics_admin_write" on ecosystem_analytics
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- 4. Vue de compatibilite strata_analytics
-- ---------------------------------------------------------------------
-- Transition seulement. security_invoker : la vue applique la RLS de
-- l'appelant, elle n'ouvre aucun acces que la table n'accorde pas.
-- RETRAIT PREVU LE 30 NOVEMBRE 2026. Apres cette date, executer :
--   drop view if exists public.strata_analytics;
do $$
begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relname = 'strata_analytics' and n.nspname = 'public'
      and c.relkind = 'r'
  ) then
    drop view if exists public.strata_analytics;
    create view public.strata_analytics with (security_invoker = true) as
      select id, metric, value, period, source, created_at
      from public.ecosystem_analytics;
    grant select on public.strata_analytics to anon, authenticated;
    comment on view public.strata_analytics is
      'Compatibilite L1-T10. Lire ecosystem_analytics. Retrait prevu le 2026-11-30.';
  else
    raise notice 'strata_analytics est encore une table : vue de compatibilite non creee';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 5. audit_requests : sortie de l'etat orphelin
-- ---------------------------------------------------------------------
-- Creee par 0000 avec ses policies, absente de schema.ts, et plus touchee par
-- aucun code depuis le recentrage du 13 juillet 2026 : l'Audit Express est
-- parti chez ESG Optimizer et ne reviendra pas dans le cockpit. Une table
-- ouverte a l'insertion anonyme que personne ne lit est une surface d'ecriture
-- publique sans proprietaire, pas une reserve.
-- Decision : suppression si elle est vide, archivage sinon. Aucune donnee
-- n'est detruite sans avoir ete regardee.
do $$
declare n bigint;
begin
  if exists (
    select 1 from pg_class c join pg_namespace n2 on n2.oid = c.relnamespace
    where c.relname = 'audit_requests' and n2.nspname = 'public'
      and c.relkind = 'r'
  ) then
    execute 'select count(*) from public.audit_requests' into n;
    if n = 0 then
      drop table public.audit_requests;
      raise notice 'audit_requests etait vide : table supprimee';
    else
      alter table public.audit_requests rename to audit_requests_archive_20260831;
      revoke all on public.audit_requests_archive_20260831 from anon;
      raise notice 'audit_requests contenait % ligne(s) : archivee sous audit_requests_archive_20260831, ecriture anonyme retiree', n;
    end if;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 6. Controles
-- ---------------------------------------------------------------------
-- a. la table cible existe avec ses colonnes de provenance
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'ecosystem_analytics'
order by ordinal_position;

-- b. la vue de compatibilite repond
select count(*) as lignes_vue_compat from public.strata_analytics;

-- c. audit_requests n'existe plus sous son nom d'origine
select to_regclass('public.audit_requests') as audit_requests_restante;

-- =====================================================================
-- Fin de la migration 0002.
-- =====================================================================

-- =====================================================================
-- ADAMA OS, L1-T9, registre des produits du groupe (ecosystem_products)
-- A executer dans Supabase -> SQL Editor (projet region UE, Frankfurt).
-- Idempotent : peut etre relance sans casser l'existant.
--
-- Cette table devient la source de verite unique de trois surfaces :
--   - le hub ecosysteme /strata (L6-T13), qui affiche aujourd'hui un tableau
--     en dur dans apps/web/app/strata/page.tsx ;
--   - la Couche D en vue groupe (L4-T14) ;
--   - la liste des depots agreges par le feed Shipped (L5-T2), qui lit
--     repo_full_name et retombe sur la variable GITHUB_REPOS si la table est
--     vide ou injoignable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Prerequis : fonction de trigger updated_at
-- ---------------------------------------------------------------------
-- Normalement posee par 0000_init.sql. Recreee ici si elle manque, pour que
-- cette migration soit autonome : une base montee par "drizzle-kit push" a
-- les tables mais aucun des objets SQL manuels de 0000 (fonction, triggers,
-- RLS). On ne remplace jamais une fonction existante.
do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'adama_set_updated_at' and n.nspname = 'public'
  ) then
    create function adama_set_updated_at()
    returns trigger
    language plpgsql
    as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 1. Type enumere
-- ---------------------------------------------------------------------
do $$ begin
  create type ecosystem_status as enum ('live', 'building', 'planned');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Table
-- ---------------------------------------------------------------------
create table if not exists ecosystem_products (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  division       text not null,
  pillar         text,
  description    text,
  status         ecosystem_status not null default 'building',
  url            text,
  repo_full_name text,
  is_public      boolean not null default true,
  position       double precision not null default 100,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Un produit sans URL ne peut pas etre declare en ligne. La regle
-- "lien cliquable uniquement pour ce qui est reellement ouvert" est tenue
-- par la base, pas par la bonne volonte de l'interface.
do $$ begin
  alter table ecosystem_products
    add constraint ecosystem_products_live_needs_url
    check (status <> 'live' or url is not null);
exception when duplicate_object then null; end $$;

create index if not exists ecosystem_products_division_idx
  on ecosystem_products (division, position);
create index if not exists ecosystem_products_repo_idx
  on ecosystem_products (repo_full_name)
  where repo_full_name is not null;

-- updated_at automatique (fonction garantie par la section 0).
drop trigger if exists set_updated_at on ecosystem_products;
create trigger set_updated_at
  before update on ecosystem_products
  for each row execute function adama_set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
alter table ecosystem_products enable row level security;

-- Lecture publique des seuls produits marques publics.
drop policy if exists "ecosystem_public_read" on ecosystem_products;
create policy "ecosystem_public_read" on ecosystem_products
  for select to anon, authenticated using (is_public);

-- Ecriture reservee a l'admin authentifie.
drop policy if exists "ecosystem_admin_write" on ecosystem_products;
create policy "ecosystem_admin_write" on ecosystem_products
  for all to authenticated using (true) with check (true);

-- La RLS filtre des lignes, pas des colonnes. Le nom d'un depot prive n'a
-- rien a faire dans le bundle client : on le retire explicitement de la cle
-- anon. Le feed Shipped lit cette colonne cote serveur, avec le service_role.
revoke select (repo_full_name) on ecosystem_products from anon;

-- =====================================================================
-- Fin de la migration 0001.
-- =====================================================================

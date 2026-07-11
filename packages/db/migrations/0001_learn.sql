-- =====================================================================
-- ADAMA OS, L5-T8 — Accès aux formations /learn
-- À exécuter dans Supabase → SQL Editor (après 0000_init).
-- Idempotent : peut être relancé sans casser l'existant.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Type énuméré : origine de l'accès
-- ---------------------------------------------------------------------
do $$ begin
  create type entitlement_source as enum ('polar', 'trial', 'manual');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Table : course_entitlements
-- ---------------------------------------------------------------------
-- Une ligne = un email a débloqué un niveau (1 à 4). Alimentée par le
-- webhook Polar (L6-T6), l'essai gratuit (L6-T9) ou un octroi manuel.
create table if not exists course_entitlements (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  level       double precision not null,
  source      entitlement_source not null default 'polar',
  reference   text,
  created_at  timestamptz not null default now()
);

-- Idempotence des relances de webhook : un seul droit par (email, level).
create unique index if not exists uq_entitlement_email_level
  on course_entitlements (lower(email), level);

create index if not exists idx_entitlement_email
  on course_entitlements (lower(email));

-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
-- Aucun accès public. La vérification (page /learn/acces) et l'écriture
-- (webhook Polar) se font côté serveur via le service_role, qui contourne
-- la RLS. On active la RLS sans policy publique : anon ne peut ni lire ni
-- écrire, donc aucune fuite d'emails clients.
alter table course_entitlements enable row level security;

drop policy if exists "entitlements_admin_all" on course_entitlements;
create policy "entitlements_admin_all" on course_entitlements
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- Fin de la migration L5-T8.
-- =====================================================================

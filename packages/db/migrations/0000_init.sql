-- =====================================================================
-- ADAMA OS, L1 Données, Migration initiale (0000_init)
-- À exécuter dans Supabase → SQL Editor (projet région UE, Frankfurt).
-- Idempotent : peut être relancé sans casser l'existant.
-- Couvre L1-T3 (schéma + pgvector) et L1-T4 (RLS + policies).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";      -- pgvector (embeddings)

-- ---------------------------------------------------------------------
-- 2. Types énumérés
-- ---------------------------------------------------------------------
do $$ begin
  create type trajectory_status as enum ('now', 'next', 'later');
exception when duplicate_object then null; end $$;

do $$ begin
  create type trajectory_type as enum ('feature', 'expansion', 'risk');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_source as enum ('recruiter', 'audit', 'newsletter');
exception when duplicate_object then null; end $$;

do $$ begin
  create type audit_status as enum ('pending', 'processing', 'done', 'failed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 3. Fonction trigger : updated_at automatique
-- ---------------------------------------------------------------------
create or replace function adama_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Tables
-- ---------------------------------------------------------------------

-- system_metrics : variables temps réel du dashboard
create table if not exists system_metrics (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value_num   double precision,
  value_text  text,
  unit        text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_system_metrics_updated_at on system_metrics;
create trigger trg_system_metrics_updated_at
  before update on system_metrics
  for each row execute function adama_set_updated_at();

-- decisions_log : registre ADR public (Couche B)
create table if not exists decisions_log (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  date          date not null default current_date,
  category      text not null,
  reasoning     text not null,
  tags          text[] not null default '{}',
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- trajectory : roadmap Now / Next / Later (Couche C)
create table if not exists trajectory (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      trajectory_status not null default 'next',
  type        trajectory_type not null default 'feature',
  eta         text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- strata_analytics : métriques produit (Open Metrics)
create table if not exists strata_analytics (
  id          uuid primary key default gen_random_uuid(),
  metric      text not null,
  value       double precision not null,
  period      text,
  source      text,
  created_at  timestamptz not null default now()
);

-- leads : capture de leads (recruteur / audit / newsletter)
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      lead_source not null,
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- rag_documents : documents source du RAG
create table if not exists rag_documents (
  id          uuid primary key default gen_random_uuid(),
  source      text not null,
  title       text not null,
  lang        text not null default 'fr',
  created_at  timestamptz not null default now()
);

-- rag_chunks : chunks vectorisés (OpenAI text-embedding-3-small, 1024 dim)
create table if not exists rag_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references rag_documents(id) on delete cascade,
  content      text not null,
  embedding    vector(1024),
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- audit_requests : Audit Express (lead magnet → moteur FastAPI)
create table if not exists audit_requests (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete set null,
  company     text not null,
  sector      text,
  answers     jsonb not null default '{}'::jsonb,
  result      jsonb,
  status      audit_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. Index
-- ---------------------------------------------------------------------
create index if not exists idx_decisions_published
  on decisions_log (is_published, date desc);
create index if not exists idx_trajectory_status
  on trajectory (status);
create index if not exists idx_leads_source
  on leads (source, created_at desc);
create index if not exists idx_rag_chunks_document
  on rag_chunks (document_id);
create index if not exists idx_audit_requests_status
  on audit_requests (status, created_at desc);

-- Index vectoriel HNSW, similarité cosinus (embeddings OpenAI normalisés).
create index if not exists idx_rag_chunks_embedding
  on rag_chunks using hnsw (embedding vector_cosine_ops);

-- ---------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- ---------------------------------------------------------------------
-- Modèle : un seul admin (toi) authentifié + accès anonyme limité.
-- Le service_role (côté serveur) contourne la RLS : seed, ingestion RAG
-- et appels FastAPI passent par lui sans être bloqués par les policies.

alter table system_metrics   enable row level security;
alter table decisions_log    enable row level security;
alter table trajectory       enable row level security;
alter table strata_analytics enable row level security;
alter table leads            enable row level security;
alter table rag_documents    enable row level security;
alter table rag_chunks       enable row level security;
alter table audit_requests   enable row level security;

-- system_metrics : lecture publique (System Status), écriture admin
drop policy if exists "system_metrics_public_read" on system_metrics;
create policy "system_metrics_public_read" on system_metrics
  for select to anon, authenticated using (true);
drop policy if exists "system_metrics_admin_write" on system_metrics;
create policy "system_metrics_admin_write" on system_metrics
  for all to authenticated using (true) with check (true);

-- decisions_log : public = uniquement publiées ; admin = tout + écriture
drop policy if exists "decisions_public_read_published" on decisions_log;
create policy "decisions_public_read_published" on decisions_log
  for select to anon using (is_published = true);
drop policy if exists "decisions_auth_read_all" on decisions_log;
create policy "decisions_auth_read_all" on decisions_log
  for select to authenticated using (true);
drop policy if exists "decisions_admin_write" on decisions_log;
create policy "decisions_admin_write" on decisions_log
  for all to authenticated using (true) with check (true);

-- trajectory : lecture publique, écriture admin
drop policy if exists "trajectory_public_read" on trajectory;
create policy "trajectory_public_read" on trajectory
  for select to anon, authenticated using (true);
drop policy if exists "trajectory_admin_write" on trajectory;
create policy "trajectory_admin_write" on trajectory
  for all to authenticated using (true) with check (true);

-- strata_analytics : lecture publique (Open Metrics), écriture admin
drop policy if exists "strata_public_read" on strata_analytics;
create policy "strata_public_read" on strata_analytics
  for select to anon, authenticated using (true);
drop policy if exists "strata_admin_write" on strata_analytics;
create policy "strata_admin_write" on strata_analytics
  for all to authenticated using (true) with check (true);

-- leads : insertion publique (formulaires), lecture admin uniquement
drop policy if exists "leads_public_insert" on leads;
create policy "leads_public_insert" on leads
  for insert to anon, authenticated with check (true);
drop policy if exists "leads_admin_read" on leads;
create policy "leads_admin_read" on leads
  for select to authenticated using (true);

-- audit_requests : insertion publique (Audit Express), gestion admin
drop policy if exists "audit_public_insert" on audit_requests;
create policy "audit_public_insert" on audit_requests
  for insert to anon, authenticated with check (true);
drop policy if exists "audit_admin_read" on audit_requests;
create policy "audit_admin_read" on audit_requests
  for select to authenticated using (true);
drop policy if exists "audit_admin_update" on audit_requests;
create policy "audit_admin_update" on audit_requests
  for update to authenticated using (true) with check (true);

-- rag_documents / rag_chunks : aucun accès public.
-- Lecture/écriture réservées à l'admin authentifié ; le retrieval RAG
-- se fait côté serveur avec le service_role.
drop policy if exists "rag_documents_admin_all" on rag_documents;
create policy "rag_documents_admin_all" on rag_documents
  for all to authenticated using (true) with check (true);
drop policy if exists "rag_chunks_admin_all" on rag_chunks;
create policy "rag_chunks_admin_all" on rag_chunks
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- Fin de la migration initiale.
-- =====================================================================

-- =====================================================================
-- ADAMA OS, couche C2, la preuve.
-- A executer dans Supabase, SQL Editor, APRES 0003_data_class.sql, et DANS
-- UNE SESSION SQL DISTINCTE de 0003 : la valeur 'done' ajoutee au type
-- trajectory_status par 0003 n'est utilisable qu'une fois cette
-- transaction-la validee. Ne pas coller les deux fichiers ensemble.
-- Idempotente : relancable sans casser l'existant.
--
-- ATTENTION, projet Supabase PARTAGE avec STRATA Scope et Academy. Tout ce
-- qui est cree ici porte le prefixe proof_. Aucune table existante n'est
-- touchee.
--
-- Ce que fait cette migration :
--   1. cree proof_claims et proof_evidence, avec leurs types enumeres ;
--   2. pose la RLS : lecture publique des seules affirmations publiques,
--      ecriture reservee au role de service ;
--   3. bascule l'entree de trajectory dont l'echeance etait passee.
--
-- Regle dure de la couche, tenue par le code et rappelee ici : une
-- affirmation sans preuve NE SE REND PAS. Il n'y a donc volontairement
-- aucune valeur par defaut qui permettrait d'inserer une affirmation nue.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Types enumeres
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'proof_subject_type') then
    create type proof_subject_type as enum (
      'produit', 'projet', 'competence', 'experience', 'systeme', 'metrique'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'proof_visibility') then
    -- public    : lisible par tous, indexable, citable dans un CV ;
    -- technique : lisible par tous mais hors index, detail d'ingenierie ;
    -- interne   : jamais servi publiquement, sert de brouillon a Adama.
    create type proof_visibility as enum ('public', 'technique', 'interne');
  end if;
  if not exists (select 1 from pg_type where typname = 'proof_evidence_kind') then
    create type proof_evidence_kind as enum (
      'api', 'depot', 'commit', 'deploiement', 'base',
      'document', 'attestation', 'capture'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'proof_verifiable_by') then
    create type proof_verifiable_by as enum ('visiteur', 'adama', 'tiers');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. proof_claims
-- ---------------------------------------------------------------------
-- L'identifiant est un texte choisi, stable et JAMAIS reattribue : il finit
-- dans une URL de verification, et une URL citee dans un CV doit rester
-- valide des annees. Un uuid aurait ete plus commode a generer et illisible
-- a citer.
create table if not exists proof_claims (
  id               text primary key
                   check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) between 3 and 80),
  statement        text not null check (length(btrim(statement)) between 10 and 400),
  subject_type     proof_subject_type not null,
  subject_ref      text,
  data_class       data_class not null,
  max_age_seconds  integer,
  visibility       proof_visibility not null default 'interne',
  position         double precision not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table proof_claims is
  'C2. Une affirmation publiee du site, avec sa provenance. Une affirmation sans entree dans proof_evidence ne se rend pas.';
comment on column proof_claims.id is
  'Identifiant stable, jamais reattribue. Sert d''URL : /verifier/<id>.';
comment on column proof_claims.visibility is
  'public : servi et indexe. technique : servi, hors index. interne : jamais servi publiquement.';

create index if not exists proof_claims_visibility_idx
  on proof_claims (visibility, position, id);
create index if not exists proof_claims_subject_idx
  on proof_claims (subject_type, subject_ref);

-- ---------------------------------------------------------------------
-- 3. proof_evidence
-- ---------------------------------------------------------------------
-- observed_at et observed_result sont NULLABLES, et c'est le coeur de la
-- doctrine : une preuve declaree mais jamais observee existe en base et
-- s'affiche comme absente. Les remplir a l'insertion avec la date du jour
-- reviendrait a fabriquer une observation qui n'a pas eu lieu.
create table if not exists proof_evidence (
  id               uuid primary key default gen_random_uuid(),
  claim_id         text not null references proof_claims (id)
                   on update cascade on delete cascade,
  kind             proof_evidence_kind not null,
  source           text not null,
  locator          text,
  method           text not null check (length(btrim(method)) between 10 and 300),
  observed_at      timestamptz,
  observed_result  text,
  verifiable_by    proof_verifiable_by not null default 'visiteur',
  -- C2-T6, reevaluation automatique. Null : preuve non reevaluable, elle
  -- garde sa date d'origine et bascule en perimee a l'echeance.
  --   http_status   : appel GET sur locator, on garde le code renvoye ;
  --   github_commit : dernier commit du depot nomme par locator ;
  --   db_count      : nombre de lignes lues sur la table nommee par locator.
  refresh_kind     text check (refresh_kind in ('http_status', 'github_commit', 'db_count')),
  position         double precision not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table proof_evidence is
  'C2. Les preuves d''une affirmation. observed_at nul signifie jamais observee, jamais une observation supposee.';

-- Coherence : une observation datee dit ce qui a ete constate, et
-- reciproquement. L'une sans l'autre est une demi-preuve.
do $$
begin
  begin
    alter table proof_evidence
      add constraint proof_evidence_observation_coherence check (
        (observed_at is null and observed_result is null)
        or (observed_at is not null and observed_result is not null)
      );
  exception when duplicate_object then null;
  end;
end $$;

create index if not exists proof_evidence_claim_idx
  on proof_evidence (claim_id, position, id);
create index if not exists proof_evidence_refresh_idx
  on proof_evidence (refresh_kind) where refresh_kind is not null;

-- ---------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------
alter table proof_claims enable row level security;
alter table proof_evidence enable row level security;

-- Lecture publique des seules affirmations publiques et techniques. Une
-- affirmation interne n'est jamais servie par la cle anonyme, pas meme
-- partiellement.
drop policy if exists "proof_claims_public_read" on proof_claims;
create policy "proof_claims_public_read" on proof_claims
  for select to anon, authenticated
  using (visibility in ('public', 'technique'));

-- Une preuve suit la visibilite de son affirmation. Sans cette clause, les
-- preuves d'une affirmation interne seraient lisibles alors que
-- l'affirmation ne l'est pas, ce qui la reconstituerait par morceaux.
drop policy if exists "proof_evidence_public_read" on proof_evidence;
create policy "proof_evidence_public_read" on proof_evidence
  for select to anon, authenticated
  using (
    exists (
      select 1 from proof_claims c
      where c.id = proof_evidence.claim_id
        and c.visibility in ('public', 'technique')
    )
  );

drop policy if exists "proof_claims_service_write" on proof_claims;
create policy "proof_claims_service_write" on proof_claims
  for all to service_role using (true) with check (true);

drop policy if exists "proof_evidence_service_write" on proof_evidence;
create policy "proof_evidence_service_write" on proof_evidence
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- 5. trajectory, bascule de l'echeance passee (C1-T8)
-- ---------------------------------------------------------------------
-- L'entree « Phase 0, Fondations », datee du 6 juillet 2026, etait encore au
-- statut 'now' le 1er septembre 2026. Les fondations sont livrees : monorepo,
-- base migree, authentification en place, site en ligne sur son domaine. Le
-- statut est donc corrige, il n'est pas efface.
--
-- Pourquoi une mise a jour nommee plutot qu'une regle generale : PostgreSQL
-- ne sait pas lire « 6 juillet 2026 » comme une date, et une regle qui
-- devinerait ferait basculer des lignes sans que personne l'ait decide.
-- Les autres echeances passees sont derivees a la lecture par
-- apps/web/lib/trajectory.ts, qui les affiche avec la mention « echeance
-- depassee » jusqu'a ce qu'un humain tranche.
update trajectory
   set status = 'done'
 where status = 'now'
   and title like 'Phase 0, Fondations%';

-- ---------------------------------------------------------------------
-- 6. Controles
-- ---------------------------------------------------------------------
-- a. les deux tables existent
select to_regclass('public.proof_claims')   as proof_claims,
       to_regclass('public.proof_evidence') as proof_evidence;

-- b. aucune affirmation publique sans preuve : cette requete doit renvoyer 0
select count(*) as affirmations_publiques_sans_preuve
  from proof_claims c
 where c.visibility in ('public', 'technique')
   and not exists (select 1 from proof_evidence e where e.claim_id = c.id);

-- c. plus aucune entree 'now' portant l'echeance de juillet
select status, count(*) from trajectory group by 1 order by 1;

-- =====================================================================
-- Fin de la migration 0004.
-- =====================================================================

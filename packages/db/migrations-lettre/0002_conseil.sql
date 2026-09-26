-- =====================================================================
-- ADAMA OS, chantier EG0, les demandes de conseil (0002_conseil).
--
-- A EXECUTER DANS LE PROJET SUPABASE DEDIE D'ADAMA OS EXPANSION, celui qui
-- porte deja la lettre SIGNAL (0001_lettre), region Union europeenne.
-- JAMAIS dans le projet partage strata-scope : la protection 4 de la
-- branche EK exige que les documents d'un client de conseil ne touchent
-- jamais l'environnement de STRATA, et XDEC-48 en fait une regle. Le
-- premier bloc le verifie et s'arrete s'il reconnait le projet partage.
--
-- Idempotente : relancable sans casser l'existant.
--
-- Ce que fait cette migration, dans l'ordre :
--   1. refuse de s'executer ailleurs que dans le projet dedie ;
--   2. cree la table des demandes et son journal ;
--   3. pose les fonctions qui sont les SEULS chemins d'ecriture ;
--   4. ferme tout acces aux roles anon et authenticated ;
--   5. se controle elle-meme.
--
-- La regle qui gouverne le fichier : seule une demande RECEVABLE entre ici.
-- Une demande que la qualification refuse n'est jamais enregistree, pas
-- meme son adresse. Ce qui entre est efface douze mois apres le dernier
-- mouvement, et tout de suite sur demande.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Garde-fou de separation
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
     where table_schema = 'public'
       and table_name in (
         'decisions_log', 'leads', 'proof_claims', 'ecosystem_products',
         'users', 'lifecycle_emails', 'acad_courses', 'organization'
       )
  ) then
    raise exception using
      message = 'EG0 : ce projet contient des tables du cockpit ou de STRATA.',
      hint = 'Les demandes de conseil vivent dans le projet dedie (EK protection 4, XDEC-48). Rien n''a ete cree.';
  end if;
  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'lettre_abonnes'
  ) then
    raise exception using
      message = 'EG0 : la migration 0001_lettre n''est pas jouee ici.',
      hint = 'Ce fichier se joue dans le projet dedie, apres 0001_lettre.';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- 2.1 Les demandes. Une ligne par demande recevable.
create table if not exists conseil_demandes (
  id                    uuid primary key default gen_random_uuid(),
  recue_le              timestamptz not null default now(),
  porte                 text not null
                          check (porte in ('construire', 'donnee', 'ia', 'systeme')),
  -- Seule la reponse recevable existe ici : les autres sont refusees
  -- avant la base, et la contrainte le rappelle.
  attendu               text not null check (attendu = 'architecture'),
  strata                text not null check (strata = 'aucune'),
  echeance              text not null
                          check (echeance in ('2-semaines-2-mois', 'plus-2-mois', 'aucune')),
  organisation          text check (organisation is null or length(organisation) between 2 and 120),
  nom                   text check (nom is null or length(nom) between 2 and 80),
  email                 text check (
                          email is null
                          or (
                            email = lower(btrim(email))
                            and length(email) between 6 and 254
                            and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
                          )
                        ),
  probleme              text check (probleme is null or length(probleme) between 80 and 3000),
  mention_version       text not null check (mention_version ~ '^EG0-[0-9]+$'),
  ip_empreinte          text check (ip_empreinte is null or ip_empreinte ~ '^[0-9a-f]{64}$'),
  email_empreinte       text not null check (email_empreinte ~ '^[0-9a-f]{64}$'),

  -- Suivi. La condition 4, le contrat d'Adama, se verifie a la main :
  -- une demande n'est « acceptee » qu'apres ce controle.
  statut                text not null default 'recue'
                          check (statut in ('recue', 'acceptee', 'refusee', 'close', 'effacee')),
  condition_4_verifiee  boolean not null default false,
  strata_verifie        boolean not null default false,
  note_interne          text check (note_interne is null or length(note_interne) <= 2000),
  statut_le             timestamptz not null default now(),
  efface_le             timestamptz,

  -- Une demande effacee ne garde que ses dates, sa porte et ses empreintes.
  constraint conseil_efface_vide check (
    statut <> 'effacee'
    or (email is null and nom is null and organisation is null
        and probleme is null and note_interne is null and efface_le is not null)
  ),
  constraint conseil_acceptee_controlee check (
    statut <> 'acceptee' or (condition_4_verifiee and strata_verifie)
  )
);

create index if not exists conseil_demandes_recue_idx on conseil_demandes (recue_le desc);
create index if not exists conseil_demandes_ip_idx on conseil_demandes (ip_empreinte, recue_le);
create index if not exists conseil_demandes_email_idx on conseil_demandes (email_empreinte, recue_le);

-- 2.2 Le journal, en ajout seul, sans aucune donnee en clair.
create table if not exists conseil_evenements (
  id            bigint generated always as identity primary key,
  demande_id    uuid references conseil_demandes (id) on delete set null,
  type          text not null
                  check (type in ('recue', 'statut', 'effacement', 'purge', 'notification')),
  detail        jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  survenu_le    timestamptz not null default now(),
  constraint conseil_evenements_sans_adresse check (detail::text !~ '@')
);

create or replace function conseil_refuser_modification()
returns trigger language plpgsql as $$
begin
  raise exception 'EG0 : le journal des demandes est en ajout seul.';
end $$;

drop trigger if exists conseil_evenements_fige on conseil_evenements;
create trigger conseil_evenements_fige
  before update or delete on conseil_evenements
  for each row execute function conseil_refuser_modification();

-- ---------------------------------------------------------------------
-- 3. Fonctions, seuls chemins d'ecriture
-- ---------------------------------------------------------------------

-- 3.1 Deposer une demande recevable. Refuse au-dela de trois demandes par
--     connexion ou d'une par adresse sur vingt-quatre heures.
create or replace function conseil_deposer(
  p_porte text,
  p_echeance text,
  p_organisation text,
  p_nom text,
  p_email text,
  p_probleme text,
  p_mention_version text,
  p_ip_empreinte text,
  p_email_empreinte text
)
returns table (resultat text, demande_id uuid, recue_le timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_recue timestamptz;
begin
  if p_ip_empreinte is not null and (
    select count(*) from conseil_demandes d
     where d.ip_empreinte = p_ip_empreinte
       and d.recue_le > now() - interval '24 hours'
  ) >= 3 then
    return query select 'limite'::text, null::uuid, null::timestamptz;
    return;
  end if;
  if exists (
    select 1 from conseil_demandes d
     where d.email_empreinte = p_email_empreinte
       and d.recue_le > now() - interval '24 hours'
  ) then
    return query select 'doublon'::text, null::uuid, null::timestamptz;
    return;
  end if;

  insert into conseil_demandes (
    porte, attendu, strata, echeance, organisation, nom, email, probleme,
    mention_version, ip_empreinte, email_empreinte
  ) values (
    p_porte, 'architecture', 'aucune', p_echeance, p_organisation, p_nom,
    lower(btrim(p_email)), p_probleme, p_mention_version, p_ip_empreinte,
    p_email_empreinte
  )
  returning id, conseil_demandes.recue_le into v_id, v_recue;

  insert into conseil_evenements (demande_id, type, detail)
  values (v_id, 'recue', jsonb_build_object('porte', p_porte, 'echeance', p_echeance));

  return query select 'recue'::text, v_id, v_recue;
end $$;

-- 3.2 Lister, pour la console privee.
create or replace function conseil_lister(p_limite integer default 50)
returns setof conseil_demandes
language sql stable security definer set search_path = public as $$
  select * from conseil_demandes
   where statut <> 'effacee'
   order by recue_le desc
   limit greatest(1, least(p_limite, 200));
$$;

-- 3.3 Changer le statut. « acceptee » exige les deux controles manuels.
create or replace function conseil_statuer(
  p_id uuid,
  p_statut text,
  p_strata_verifie boolean,
  p_condition_4_verifiee boolean,
  p_note text
)
returns text
language plpgsql security definer set search_path = public as $$
begin
  if p_statut not in ('recue', 'acceptee', 'refusee', 'close') then
    return 'statut_invalide';
  end if;
  if p_statut = 'acceptee' and not (p_strata_verifie and p_condition_4_verifiee) then
    return 'controles_manquants';
  end if;
  update conseil_demandes
     set statut = p_statut,
         strata_verifie = p_strata_verifie,
         condition_4_verifiee = p_condition_4_verifiee,
         note_interne = nullif(btrim(p_note), ''),
         statut_le = now()
   where id = p_id and statut <> 'effacee';
  if not found then
    return 'introuvable';
  end if;
  insert into conseil_evenements (demande_id, type, detail)
  values (p_id, 'statut', jsonb_build_object('statut', p_statut));
  return 'ok';
end $$;

-- 3.4 Effacer une demande, sur demande de la personne ou a la purge.
create or replace function conseil_effacer(p_id uuid, p_motif text)
returns text
language plpgsql security definer set search_path = public as $$
begin
  update conseil_demandes
     set email = null, nom = null, organisation = null, probleme = null,
         note_interne = null, statut = 'effacee', statut_le = now(),
         efface_le = now()
   where id = p_id and statut <> 'effacee';
  if not found then
    return 'introuvable';
  end if;
  insert into conseil_evenements (demande_id, type, detail)
  values (p_id, 'effacement', jsonb_build_object('motif', left(coalesce(p_motif, 'demande'), 40)));
  return 'ok';
end $$;

-- 3.5 Effacer toutes les demandes d'une adresse, retrouvees par empreinte.
create or replace function conseil_effacer_par_empreinte(p_email_empreinte text)
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_nb integer := 0;
  r record;
begin
  for r in
    select id from conseil_demandes
     where email_empreinte = p_email_empreinte and statut <> 'effacee'
  loop
    perform conseil_effacer(r.id, 'droit_effacement');
    v_nb := v_nb + 1;
  end loop;
  return v_nb;
end $$;

-- 3.6 La purge : douze mois apres le dernier mouvement.
create or replace function conseil_purger()
returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_nb integer := 0;
  r record;
begin
  for r in
    select id from conseil_demandes
     where statut <> 'effacee' and statut_le < now() - interval '12 months'
  loop
    perform conseil_effacer(r.id, 'duree_ecoulee');
    v_nb := v_nb + 1;
  end loop;
  insert into conseil_evenements (type, detail)
  values ('purge', jsonb_build_object('effacees', v_nb));
  return v_nb;
end $$;

-- 3.7 La notification partie, ou non, vers la boite de l'editeur.
create or replace function conseil_notification(p_id uuid, p_ok boolean)
returns void
language sql security definer set search_path = public as $$
  insert into conseil_evenements (demande_id, type, detail)
  values (p_id, 'notification', jsonb_build_object('ok', p_ok));
$$;

-- ---------------------------------------------------------------------
-- 4. Acces : le role service seulement
-- ---------------------------------------------------------------------
alter table conseil_demandes enable row level security;
alter table conseil_evenements enable row level security;

revoke all on conseil_demandes, conseil_evenements from anon, authenticated;
grant select, insert, update, delete on conseil_demandes, conseil_evenements to service_role;

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname like 'conseil\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 5. Controles
-- ---------------------------------------------------------------------
-- a. Deux tables, RLS active, aucune politique. Doit renvoyer 2 lignes.
select c.relname as table_conseil,
       c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.tablename = c.relname) as politiques
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relname like 'conseil\_%' and c.relkind = 'r'
 order by 1;

-- b. Aucune fonction du conseil n'est executable par anon. Doit renvoyer
--    0 ligne.
select p.proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname like 'conseil\_%'
   and has_function_privilege('anon', p.oid, 'execute');

-- =====================================================================
-- Fin de la migration 0002_conseil.
-- =====================================================================

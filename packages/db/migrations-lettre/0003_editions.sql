-- =====================================================================
-- ADAMA OS, chantier EH4, les editions de SIGNAL (0003_editions).
--
-- A EXECUTER DANS LE PROJET SUPABASE DEDIE A LA LETTRE, apres 0001_lettre,
-- region Union europeenne. JAMAIS dans le projet partage strata-scope
-- (XINV-22, XDEC-38). Le premier bloc le verifie et s'arrete sinon.
--
-- Idempotente : relancable sans casser l'existant.
--
-- Jusqu'ici la base ne savait envoyer que la note trimestrielle a trois
-- paragraphes. Ce fichier ajoute l'edition SIGNAL elle-meme : un numero a
-- vie, cinq blocs dans un ordre fixe, une version francaise et une version
-- anglaise, une source primaire par langue. Ce que fait le fichier :
--   1. refuse de s'executer ailleurs que dans le projet dedie ;
--   2. cree les editions, leurs envois et leur historique de corrections ;
--   3. fige une edition partie : son texte ne change que par une
--      correction tracee, jamais par une ecriture directe ;
--   4. pose les fonctions qui sont les SEULS chemins d'ecriture ;
--   5. etend le journal, le compteur du jour, l'etat et l'export ;
--   6. ferme tout acces aux roles anon et authenticated ;
--   7. se controle elle-meme.
--
-- Regles d'EX1 tenues par la base :
--   - un numero ne se reutilise jamais, une correction ne cree pas de
--     numero, une version anglaise ne cree pas une seconde edition ;
--   - une edition ne part pas sans relecture cochee ;
--   - une edition partie garde la trace de chaque correction, avec son
--     motif et le texte d'avant, en ajout seul.
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
      message = 'EH4 : ce projet contient des tables du cockpit ou de STRATA.',
      hint = 'Les editions SIGNAL vivent dans le projet dedie (XINV-22, XDEC-38). Rien n''a ete cree.';
  end if;
  if not exists (
    select 1 from information_schema.tables
     where table_schema = 'public' and table_name = 'lettre_abonnes'
  ) then
    raise exception using
      message = 'EH4 : la migration 0001_lettre n''est pas jouee ici.',
      hint = 'Ce fichier se joue dans le projet dedie, apres 0001_lettre.';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- 2.1 Les editions. Une ligne par numero, les deux langues dans la meme
--     ligne : l'anglais n'est pas une edition de plus.
create table if not exists lettre_editions (
  id                 uuid primary key default gen_random_uuid(),
  numero             integer not null unique check (numero between 1 and 9999),
  version            integer not null default 1 check (version >= 1),

  titre_fr           text not null check (length(btrim(titre_fr)) between 6 and 90),
  signal_fr          text not null,
  systeme_fr         text not null,
  decision_fr        text not null,
  construction_fr    text not null,
  idee_fr            text not null,
  source_fr          text not null check (source_fr ~ '^https://[^[:space:]]+$' and length(source_fr) <= 400),

  titre_en           text not null check (length(btrim(titre_en)) between 6 and 90),
  signal_en          text not null,
  systeme_en         text not null,
  decision_en        text not null,
  construction_en    text not null,
  idee_en            text not null,
  source_en          text not null check (source_en ~ '^https://[^[:space:]]+$' and length(source_en) <= 400),

  statut             text not null default 'brouillon'
                       check (statut in ('brouillon', 'envoi_en_cours', 'envoyee')),
  relue              boolean not null default false,
  cree_le            timestamptz not null default now(),
  modifie_le         timestamptz not null default now(),
  envoi_commence_le  timestamptz,
  envoi_termine_le   timestamptz,

  -- Chaque bloc tient en un paragraphe, entre 40 et 900 caracteres.
  constraint lettre_editions_blocs check (
    length(btrim(signal_fr)) between 40 and 900 and position(E'\n' in signal_fr) = 0
    and length(btrim(systeme_fr)) between 40 and 900 and position(E'\n' in systeme_fr) = 0
    and length(btrim(decision_fr)) between 40 and 900 and position(E'\n' in decision_fr) = 0
    and length(btrim(construction_fr)) between 40 and 900 and position(E'\n' in construction_fr) = 0
    and length(btrim(idee_fr)) between 40 and 900 and position(E'\n' in idee_fr) = 0
    and length(btrim(signal_en)) between 40 and 900 and position(E'\n' in signal_en) = 0
    and length(btrim(systeme_en)) between 40 and 900 and position(E'\n' in systeme_en) = 0
    and length(btrim(decision_en)) between 40 and 900 and position(E'\n' in decision_en) = 0
    and length(btrim(construction_en)) between 40 and 900 and position(E'\n' in construction_en) = 0
    and length(btrim(idee_en)) between 40 and 900 and position(E'\n' in idee_en) = 0
  ),
  -- Aucune mention d'intelligence artificielle : regle des surfaces
  -- publiques d'ADAMA OS. Le controle applicatif est plus fin, celui-ci
  -- est le dernier mot.
  constraint lettre_editions_sans_ia check (
    (titre_fr || ' ' || signal_fr || ' ' || systeme_fr || ' ' || decision_fr || ' '
     || construction_fr || ' ' || idee_fr || ' ' || titre_en || ' ' || signal_en || ' '
     || systeme_en || ' ' || decision_en || ' ' || construction_en || ' ' || idee_en)
      !~ '(^|[^[:alpha:]])(IA|AI|LLM|LLMs|GPT)([^[:alpha:]]|$)'
    and (titre_fr || ' ' || signal_fr || ' ' || systeme_fr || ' ' || decision_fr || ' '
     || construction_fr || ' ' || idee_fr || ' ' || titre_en || ' ' || signal_en || ' '
     || systeme_en || ' ' || decision_en || ' ' || construction_en || ' ' || idee_en)
      !~* '(intelligence artificielle|artificial intelligence|chatgpt|chatbot)'
  ),
  constraint lettre_editions_relue_avant_envoi check (statut = 'brouillon' or relue),
  constraint lettre_editions_dates check (
    (statut = 'brouillon' and envoi_termine_le is null)
    or (statut = 'envoi_en_cours' and envoi_commence_le is not null and envoi_termine_le is null)
    or (statut = 'envoyee' and envoi_commence_le is not null and envoi_termine_le is not null)
  )
);

create index if not exists lettre_editions_statut_idx on lettre_editions (statut, numero);

-- 2.2 Les envois d'editions, une ligne par destinataire et par numero. La
--     cle primaire rend l'envoi reprenable sans doublon.
create table if not exists lettre_envois_editions (
  edition_id      uuid not null references lettre_editions (id) on delete restrict,
  abonne_id       uuid not null references lettre_abonnes (id) on delete cascade,
  langue          text not null check (langue in ('fr', 'en')),
  envoye_le       timestamptz not null default now(),
  fournisseur_id  text check (fournisseur_id is null or length(fournisseur_id) <= 80),
  primary key (edition_id, abonne_id)
);

create index if not exists lettre_envois_editions_abonne_idx on lettre_envois_editions (abonne_id);

-- 2.3 L'historique des corrections, en ajout seul. Le texte d'avant est
--     garde entier : ce qu'un abonne a lu reste retrouvable.
create table if not exists lettre_editions_revisions (
  id           bigint generated always as identity primary key,
  edition_id   uuid not null references lettre_editions (id) on delete restrict,
  version      integer not null check (version >= 1),
  motif        text not null check (length(btrim(motif)) between 10 and 400),
  avant        jsonb not null check (jsonb_typeof(avant) = 'object'),
  revise_le    timestamptz not null default now(),
  unique (edition_id, version)
);

-- ---------------------------------------------------------------------
-- 3. Immuabilite
-- ---------------------------------------------------------------------
drop trigger if exists lettre_editions_horodatage on lettre_editions;
create trigger lettre_editions_horodatage before update on lettre_editions
  for each row execute function lettre_horodater();

drop trigger if exists lettre_editions_revisions_immuable on lettre_editions_revisions;
create trigger lettre_editions_revisions_immuable before update or delete on lettre_editions_revisions
  for each row execute function lettre_refuser_modification();

-- Une edition partie ne se reecrit que par lettre_edition_corriger, qui
-- leve le reglage lettre.correction le temps de sa transaction. Le numero
-- ne change jamais, et le statut ne revient jamais en arriere.
create or replace function lettre_figer_edition()
returns trigger language plpgsql as $$
begin
  if new.numero <> old.numero then
    raise exception 'EH4 : le numero % est attribue a vie.', old.numero;
  end if;
  if old.statut <> 'brouillon'
     and (new.titre_fr, new.signal_fr, new.systeme_fr, new.decision_fr, new.construction_fr,
          new.idee_fr, new.source_fr, new.titre_en, new.signal_en, new.systeme_en,
          new.decision_en, new.construction_en, new.idee_en, new.source_en)
         is distinct from
         (old.titre_fr, old.signal_fr, old.systeme_fr, old.decision_fr, old.construction_fr,
          old.idee_fr, old.source_fr, old.titre_en, old.signal_en, old.systeme_en,
          old.decision_en, old.construction_en, old.idee_en, old.source_en)
     and coalesce(current_setting('lettre.correction', true), 'off') <> 'on' then
    raise exception 'EH4 : SIGNAL #% est parti, son texte ne change que par une correction tracee.', old.numero;
  end if;
  if old.statut = 'envoyee' and new.statut <> 'envoyee' then
    raise exception 'EH4 : SIGNAL #% est envoye, son statut ne revient pas en arriere.', old.numero;
  end if;
  if old.statut <> 'brouillon' and new.relue is distinct from old.relue then
    raise exception 'EH4 : la relecture de SIGNAL #% est acquise, elle ne se decoche plus.', old.numero;
  end if;
  return new;
end $$;

drop trigger if exists lettre_editions_figees on lettre_editions;
create trigger lettre_editions_figees before update on lettre_editions
  for each row execute function lettre_figer_edition();

-- Une edition ne se supprime jamais une fois partie.
create or replace function lettre_proteger_edition()
returns trigger language plpgsql as $$
begin
  if old.statut <> 'brouillon' then
    raise exception 'EH4 : SIGNAL #% est parti, il ne se supprime pas.', old.numero;
  end if;
  return old;
end $$;

drop trigger if exists lettre_editions_protegees on lettre_editions;
create trigger lettre_editions_protegees before delete on lettre_editions
  for each row execute function lettre_proteger_edition();

-- ---------------------------------------------------------------------
-- 4. Le journal connait les editions
-- ---------------------------------------------------------------------
alter table lettre_evenements drop constraint if exists lettre_evenements_type_check;
alter table lettre_evenements add constraint lettre_evenements_type_check check (type in (
  'inscription_demandee', 'reinscription_demandee', 'demande_repetee',
  'confirmation_envoyee', 'confirme', 'bienvenue_envoyee',
  'note_envoyee', 'edition_envoyee', 'test_envoye', 'desinscrit', 'expire',
  'export_remis', 'purge'
));

-- Le compteur du jour protege le palier gratuit : une edition compte comme
-- tout autre message.
create or replace function lettre_envois_du_jour()
returns integer language sql stable as $$
  select count(*)::integer
    from lettre_evenements
   where type in ('confirmation_envoyee', 'bienvenue_envoyee', 'note_envoyee',
                  'edition_envoyee', 'test_envoye')
     and survenu_le >= (date_trunc('day', now() at time zone 'utc') at time zone 'utc');
$$;

-- ---------------------------------------------------------------------
-- 5. Les seuls chemins d'ecriture des editions
-- ---------------------------------------------------------------------

-- 5.1 Demarrer l'envoi. Une seule edition en cours a la fois, et jamais
--     pendant l'envoi d'une note.
create or replace function lettre_edition_demarrer(p_edition_id uuid)
returns text language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_editions%rowtype;
begin
  select * into v from lettre_editions e where e.id = p_edition_id for update;
  if not found then
    return 'inconnue';
  end if;
  if v.statut = 'envoyee' then
    return 'envoyee';
  end if;
  if not v.relue then
    return 'non_relue';
  end if;
  if exists (select 1 from lettre_editions e where e.statut = 'envoi_en_cours' and e.id <> v.id) then
    return 'autre_edition_en_cours';
  end if;
  if exists (select 1 from lettre_notes n where n.statut = 'envoi_en_cours') then
    return 'note_en_cours';
  end if;
  if v.statut = 'brouillon' then
    if exists (
      select 1 from lettre_editions e
       where e.numero < v.numero and e.statut <> 'envoyee'
    ) then
      return 'numero_precedent_non_parti';
    end if;
    update lettre_editions set statut = 'envoi_en_cours', envoi_commence_le = now() where id = v.id;
  end if;
  return 'en_cours';
end $$;

-- 5.1 bis La note trimestrielle ne part pas pendant l'envoi d'une edition.
create or replace function lettre_note_demarrer(p_note_id uuid)
returns text language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_notes%rowtype;
begin
  select * into v from lettre_notes n where n.id = p_note_id for update;
  if not found then
    return 'inconnue';
  end if;
  if v.statut = 'envoyee' then
    return 'envoyee';
  end if;
  if not v.relue_desidentification then
    return 'non_relue';
  end if;
  if exists (select 1 from lettre_notes n where n.statut = 'envoi_en_cours' and n.id <> v.id) then
    return 'autre_note_en_cours';
  end if;
  if exists (select 1 from lettre_editions e where e.statut = 'envoi_en_cours') then
    return 'edition_en_cours';
  end if;
  if v.statut = 'brouillon' then
    update lettre_notes set statut = 'envoi_en_cours', envoi_commence_le = now() where id = v.id;
  end if;
  return 'en_cours';
end $$;

-- 5.2 Les destinataires restants, avec leur langue.
create or replace function lettre_destinataires_edition(p_edition_id uuid, p_limite integer)
returns table (abonne_id uuid, email text, langue text)
language sql stable as $$
  select a.id, a.email, a.langue
    from lettre_abonnes a
   where a.statut = 'confirme'
     and not exists (
       select 1 from lettre_envois_editions x
        where x.edition_id = p_edition_id and x.abonne_id = a.id
     )
   order by a.confirme_le
   limit greatest(p_limite, 0);
$$;

-- 5.3 Un envoi reussi, ecrit apres l'identifiant rendu par l'outil.
create or replace function lettre_edition_envoyee(
  p_edition_id uuid,
  p_abonne_id uuid,
  p_langue text,
  p_fournisseur_id text
)
returns void language plpgsql as $$
#variable_conflict use_column
declare
  v_numero integer;
  v_version integer;
  v_cycle integer;
begin
  select e.numero, e.version into v_numero, v_version
    from lettre_editions e where e.id = p_edition_id and e.statut = 'envoi_en_cours';
  if v_numero is null then
    raise exception 'EH4 : l''edition n''est pas en cours d''envoi.';
  end if;
  select a.cycle into v_cycle from lettre_abonnes a where a.id = p_abonne_id and a.statut = 'confirme';
  if v_cycle is null then
    return;
  end if;
  insert into lettre_envois_editions (edition_id, abonne_id, langue, fournisseur_id)
  values (p_edition_id, p_abonne_id, p_langue, left(p_fournisseur_id, 80))
  on conflict (edition_id, abonne_id) do nothing;
  if found then
    insert into lettre_evenements (abonne_id, type, cycle, details)
    values (p_abonne_id, 'edition_envoyee', v_cycle,
            jsonb_build_object('numero', v_numero, 'version', v_version, 'langue', p_langue));
  end if;
end $$;

-- 5.4 Clore quand plus personne n'attend le numero.
create or replace function lettre_edition_clore_si_complete(p_edition_id uuid)
returns text language plpgsql as $$
#variable_conflict use_column
begin
  if exists (select 1 from lettre_destinataires_edition(p_edition_id, 1)) then
    return 'reste';
  end if;
  update lettre_editions
     set statut = 'envoyee', envoi_termine_le = now()
   where id = p_edition_id and statut = 'envoi_en_cours';
  return 'close';
end $$;

-- 5.5 Corriger une edition partie. Le texte d'avant entre dans
--     l'historique avec son motif, la version monte d'un cran, le numero
--     ne bouge pas. Les champs absents de p_contenu restent tels quels.
create or replace function lettre_edition_corriger(
  p_edition_id uuid,
  p_contenu jsonb,
  p_motif text
)
returns integer language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_editions%rowtype;
  v_avant jsonb;
  v_cles text[] := array[
    'titre_fr', 'signal_fr', 'systeme_fr', 'decision_fr', 'construction_fr', 'idee_fr', 'source_fr',
    'titre_en', 'signal_en', 'systeme_en', 'decision_en', 'construction_en', 'idee_en', 'source_en'
  ];
  v_cle text;
begin
  if p_contenu is null or jsonb_typeof(p_contenu) <> 'object' then
    raise exception 'EH4 : contenu de correction illisible.';
  end if;
  for v_cle in select jsonb_object_keys(p_contenu) loop
    if not (v_cle = any (v_cles)) then
      raise exception 'EH4 : le champ % ne se corrige pas.', v_cle;
    end if;
  end loop;
  select * into v from lettre_editions e where e.id = p_edition_id for update;
  if not found then
    raise exception 'EH4 : edition introuvable.';
  end if;
  if v.statut = 'brouillon' then
    raise exception 'EH4 : SIGNAL #% est un brouillon, il se modifie sans correction.', v.numero;
  end if;
  v_avant := jsonb_build_object(
    'titre_fr', v.titre_fr, 'signal_fr', v.signal_fr, 'systeme_fr', v.systeme_fr,
    'decision_fr', v.decision_fr, 'construction_fr', v.construction_fr, 'idee_fr', v.idee_fr,
    'source_fr', v.source_fr,
    'titre_en', v.titre_en, 'signal_en', v.signal_en, 'systeme_en', v.systeme_en,
    'decision_en', v.decision_en, 'construction_en', v.construction_en, 'idee_en', v.idee_en,
    'source_en', v.source_en
  );
  if (v_avant || p_contenu) = v_avant then
    raise exception 'EH4 : la correction ne change rien a SIGNAL #%.', v.numero;
  end if;
  insert into lettre_editions_revisions (edition_id, version, motif, avant)
  values (v.id, v.version, btrim(p_motif), v_avant);
  perform set_config('lettre.correction', 'on', true);
  update lettre_editions
     set titre_fr        = coalesce(p_contenu ->> 'titre_fr', titre_fr),
         signal_fr       = coalesce(p_contenu ->> 'signal_fr', signal_fr),
         systeme_fr      = coalesce(p_contenu ->> 'systeme_fr', systeme_fr),
         decision_fr     = coalesce(p_contenu ->> 'decision_fr', decision_fr),
         construction_fr = coalesce(p_contenu ->> 'construction_fr', construction_fr),
         idee_fr         = coalesce(p_contenu ->> 'idee_fr', idee_fr),
         source_fr       = coalesce(p_contenu ->> 'source_fr', source_fr),
         titre_en        = coalesce(p_contenu ->> 'titre_en', titre_en),
         signal_en       = coalesce(p_contenu ->> 'signal_en', signal_en),
         systeme_en      = coalesce(p_contenu ->> 'systeme_en', systeme_en),
         decision_en     = coalesce(p_contenu ->> 'decision_en', decision_en),
         construction_en = coalesce(p_contenu ->> 'construction_en', construction_en),
         idee_en         = coalesce(p_contenu ->> 'idee_en', idee_en),
         source_en       = coalesce(p_contenu ->> 'source_en', source_en),
         version         = version + 1
   where id = v.id;
  perform set_config('lettre.correction', 'off', true);
  return v.version + 1;
end $$;

-- ---------------------------------------------------------------------
-- 6. L'etat et l'export connaissent les editions
-- ---------------------------------------------------------------------
create or replace function lettre_etat()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'en_attente', (select count(*) from lettre_abonnes where statut = 'en_attente'),
    'confirmes', (select count(*) from lettre_abonnes where statut = 'confirme'),
    'confirmes_fr', (select count(*) from lettre_abonnes where statut = 'confirme' and langue = 'fr'),
    'confirmes_en', (select count(*) from lettre_abonnes where statut = 'confirme' and langue = 'en'),
    'desinscrits', (select count(*) from lettre_abonnes where statut = 'desinscrit'),
    'expires', (select count(*) from lettre_abonnes where statut = 'expire'),
    'bienvenues_en_attente', (select count(*) from lettre_abonnes
                               where statut = 'confirme' and bienvenue_envoyee_le is null),
    'envois_du_jour', lettre_envois_du_jour(),
    'editions_parues', (select count(*) from lettre_editions where statut = 'envoyee'),
    'derniere_purge', (select max(survenu_le) from lettre_evenements where type = 'purge'),
    'consentement_version', (select max(version) from lettre_consentements)
  );
$$;

-- Le droit d'acces dit aussi quels numeros une adresse a recus.
create or replace function lettre_exporter(p_email_empreinte text)
returns jsonb language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
  v_journal jsonb;
begin
  select * into v from lettre_abonnes a where a.email_empreinte = p_email_empreinte;
  if not found then
    return null;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'type', e.type, 'cycle', e.cycle, 'consentement_version', e.consentement_version,
           'details', e.details, 'survenu_le', e.survenu_le
         ) order by e.survenu_le), '[]'::jsonb)
    into v_journal
    from lettre_evenements e where e.abonne_id = v.id;
  insert into lettre_evenements (abonne_id, type, cycle) values (v.id, 'export_remis', v.cycle);
  return jsonb_build_object(
    'liste', v.liste,
    'email', v.email,
    'statut', v.statut,
    'cycle', v.cycle,
    'provenance', jsonb_build_object(
      'mode_collecte', v.mode_collecte, 'surface', v.surface, 'chemin', v.chemin,
      'referent_hote', v.referent_hote, 'campagne', v.campagne, 'langue', v.langue
    ),
    'consentement', (
      select jsonb_build_object('version', c.version, 'texte_case', c.texte_case,
                                'texte_mention', c.texte_mention, 'empreinte', c.empreinte)
        from lettre_consentements c where c.version = v.consentement_version
    ),
    'demande_le', v.demande_le,
    'confirme_le', v.confirme_le,
    'bienvenue_envoyee_le', v.bienvenue_envoyee_le,
    'desinscrit_le', v.desinscrit_le,
    'motif_desinscription', v.motif_desinscription,
    'notes_recues', (select count(*) from lettre_envois n where n.abonne_id = v.id),
    'editions_recues', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'numero', ed.numero, 'langue', x.langue, 'envoye_le', x.envoye_le
             ) order by ed.numero), '[]'::jsonb)
        from lettre_envois_editions x
        join lettre_editions ed on ed.id = x.edition_id
       where x.abonne_id = v.id
    ),
    'journal', v_journal
  );
end $$;

-- ---------------------------------------------------------------------
-- 7. Acces : le role service seulement
-- ---------------------------------------------------------------------
alter table lettre_editions enable row level security;
alter table lettre_envois_editions enable row level security;
alter table lettre_editions_revisions enable row level security;

revoke all on lettre_editions, lettre_envois_editions, lettre_editions_revisions
  from anon, authenticated;
grant select, insert, update, delete on lettre_editions, lettre_envois_editions, lettre_editions_revisions
  to service_role;

do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as signature
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname like 'lettre\_%'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.signature);
    execute format('grant execute on function %s to service_role', f.signature);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 8. Controles
-- ---------------------------------------------------------------------
-- a. Les trois tables des editions ont RLS active et aucune politique.
--    Doit renvoyer 3 lignes, rls = true, politiques = 0.
select c.relname as table_edition,
       c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.tablename = c.relname) as politiques
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relname in ('lettre_editions', 'lettre_envois_editions', 'lettre_editions_revisions')
 order by 1;

-- b. Aucune fonction de la lettre n'est executable par anon. Doit renvoyer
--    0 ligne.
select p.proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname like 'lettre\_%'
   and has_function_privilege('anon', p.oid, 'execute');

-- c. Le journal accepte les envois d'edition. Doit renvoyer 1 ligne.
select conname from pg_constraint
 where conname = 'lettre_evenements_type_check'
   and pg_get_constraintdef(oid) like '%edition_envoyee%';

-- =====================================================================
-- Fin de la migration 0003_editions.
-- =====================================================================

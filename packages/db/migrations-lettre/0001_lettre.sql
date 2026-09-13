-- =====================================================================
-- ADAMA OS, chantier EH0, la lettre SIGNAL et sa plomberie (0001_lettre).
--
-- A EXECUTER DANS LE SQL EDITOR DU PROJET SUPABASE DEDIE A LA LETTRE,
-- region Union europeenne. JAMAIS dans le projet partage strata-scope, qui
-- porte le cockpit et plusieurs produits STRATA : XINV-22 exige deux bases
-- physiquement separees, et XDEC-38 en fait une regle. Le premier bloc de
-- ce fichier le verifie et s'arrete s'il reconnait le projet partage.
--
-- Idempotente : relancable sans casser l'existant.
--
-- Ce que fait cette migration, dans l'ordre :
--   1. refuse de s'executer dans une base qui n'est pas dediee ;
--   2. cree les cinq tables de la lettre ;
--   3. rend le texte de consentement et le journal immuables ;
--   4. pose les fonctions qui sont les SEULS chemins d'ecriture ;
--   5. ferme tout acces aux roles anon et authenticated ;
--   6. seme la version EH0-1 du texte de consentement ;
--   7. se controle elle-meme.
--
-- La regle qui gouverne le fichier : une adresse n'entre que par le
-- formulaire de /lettre, avec une version de consentement connue, et sa
-- provenance est ecrite au moment ou elle entre. Il n'existe aucune
-- fonction d'import, et la colonne mode_collecte n'accepte qu'une valeur.
-- C'est la condition de cessibilite EK7 : une liste dont on ne peut pas
-- dire d'ou vient chaque adresse ne se transmet pas.
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
      message = 'EH0 : ce projet contient des tables du cockpit ou de STRATA.',
      hint = 'La liste SIGNAL vit dans un projet dedie (XINV-22, XDEC-38). Rien n''a ete cree.';
  end if;
end $$;

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------

-- 2.1 Les versions du texte de consentement. Une adresse pointe vers la
--     version exacte qu'elle a lue. Une version ne se modifie jamais : un
--     texte change, c'est une version nouvelle.
create table if not exists lettre_consentements (
  version        text primary key check (version ~ '^EH0-[0-9]+$'),
  texte_case     text not null check (length(btrim(texte_case)) > 40),
  texte_mention  text not null check (length(btrim(texte_mention)) > 80),
  empreinte      text generated always as (
    encode(extensions.digest(texte_case || E'\n' || texte_mention, 'sha256'), 'hex')
  ) stored,
  publie_le      timestamptz not null default now()
);

-- 2.2 Les abonnes. Une ligne par adresse, retrouvee par son empreinte.
--     L'historique complet vit dans lettre_evenements.
create table if not exists lettre_abonnes (
  id                         uuid primary key default gen_random_uuid(),
  liste                      text not null default 'ADAMA_SIGNAL'
                               check (liste = 'ADAMA_SIGNAL'),
  email                      text check (
                               email is null
                               or (
                                 email = lower(btrim(email))
                                 and length(email) between 6 and 254
                                 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
                               )
                             ),
  email_empreinte            text not null unique
                               check (email_empreinte ~ '^[0-9a-f]{64}$'),
  statut                     text not null
                               check (statut in ('en_attente', 'confirme', 'desinscrit', 'expire')),
  cycle                      integer not null default 1 check (cycle >= 1),

  -- Provenance, ecrite a l'entree et reecrite a chaque nouvelle demande.
  mode_collecte              text not null default 'formulaire'
                               check (mode_collecte = 'formulaire'),
  surface                    text not null check (surface in ('page_lettre')),
  chemin                     text not null
                               check (chemin ~ '^/[a-z0-9/_-]*$' and length(chemin) <= 120),
  referent_hote              text check (
                               referent_hote is null
                               or referent_hote ~ '^[a-z0-9.-]{1,253}$'
                             ),
  campagne                   jsonb not null default '{}'::jsonb check (
                               jsonb_typeof(campagne) = 'object'
                               and (campagne - array['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) = '{}'::jsonb
                             ),
  langue                     text not null default 'fr' check (langue in ('fr', 'en')),
  consentement_version       text not null references lettre_consentements (version),
  ip_empreinte               text check (ip_empreinte is null or ip_empreinte ~ '^[0-9a-f]{64}$'),
  demande_le                 timestamptz not null default now(),

  -- Double confirmation.
  jeton_empreinte            text unique check (
                               jeton_empreinte is null or jeton_empreinte ~ '^[0-9a-f]{64}$'
                             ),
  jeton_expire_le            timestamptz,
  confirmations_envoyees     integer not null default 0
                               check (confirmations_envoyees between 0 and 3),
  derniere_confirmation_le   timestamptz,
  confirme_le                timestamptz,
  confirme_ip_empreinte      text check (
                               confirme_ip_empreinte is null or confirme_ip_empreinte ~ '^[0-9a-f]{64}$'
                             ),
  bienvenue_envoyee_le       timestamptz,

  -- Retrait.
  desinscrit_le              timestamptz,
  motif_desinscription       text check (
                               motif_desinscription is null
                               or motif_desinscription in ('lien', 'en_tete_un_clic', 'demande_ecrite', 'rebond', 'plainte')
                             ),

  cree_le                    timestamptz not null default now(),
  modifie_le                 timestamptz not null default now(),

  -- Chaque statut porte exactement ce qui le prouve. Une adresse confirmee
  -- sans date de confirmation, ou une adresse desinscrite qui garde son
  -- email en clair, ne peuvent pas exister.
  constraint lettre_abonnes_coherence check (
    (statut = 'en_attente'
      and email is not null and jeton_empreinte is not null and jeton_expire_le is not null
      and confirme_le is null and desinscrit_le is null)
    or (statut = 'confirme'
      and email is not null and jeton_empreinte is null and confirme_le is not null
      and desinscrit_le is null)
    or (statut = 'desinscrit'
      and email is null and jeton_empreinte is null
      and desinscrit_le is not null and motif_desinscription is not null)
    or (statut = 'expire'
      and email is null and jeton_empreinte is null)
  )
);

create index if not exists lettre_abonnes_statut_idx on lettre_abonnes (statut, confirme_le);
create index if not exists lettre_abonnes_attente_idx on lettre_abonnes (demande_le) where statut = 'en_attente';

-- 2.3 Le journal. En ajout seul, sans aucune adresse en clair.
create table if not exists lettre_evenements (
  id                    bigint generated always as identity primary key,
  abonne_id             uuid references lettre_abonnes (id) on delete cascade,
  type                  text not null check (type in (
                          'inscription_demandee', 'reinscription_demandee', 'demande_repetee',
                          'confirmation_envoyee', 'confirme', 'bienvenue_envoyee',
                          'note_envoyee', 'test_envoye', 'desinscrit', 'expire',
                          'export_remis', 'purge'
                        )),
  cycle                 integer,
  consentement_version  text references lettre_consentements (version),
  ip_empreinte          text check (ip_empreinte is null or ip_empreinte ~ '^[0-9a-f]{64}$'),
  details               jsonb not null default '{}'::jsonb
                          check (jsonb_typeof(details) = 'object'),
  survenu_le            timestamptz not null default now(),
  constraint lettre_evenements_sans_adresse check (position('@' in details::text) = 0)
);

create index if not exists lettre_evenements_abonne_idx on lettre_evenements (abonne_id, survenu_le);
create index if not exists lettre_evenements_type_idx on lettre_evenements (type, survenu_le);
create index if not exists lettre_evenements_ip_idx on lettre_evenements (ip_empreinte, survenu_le)
  where ip_empreinte is not null;

-- 2.4 Les notes trimestrielles de patience. Trois paragraphes, sans date.
create table if not exists lettre_notes (
  id                        uuid primary key default gen_random_uuid(),
  code                      text not null unique check (code ~ '^NOTE-[0-9]{2,3}$'),
  objet                     text not null check (length(btrim(objet)) between 10 and 90),
  decide                    text not null,
  echoue                    text not null,
  preparation               text not null,
  statut                    text not null default 'brouillon'
                              check (statut in ('brouillon', 'envoi_en_cours', 'envoyee')),
  relue_desidentification   boolean not null default false,
  cree_le                   timestamptz not null default now(),
  modifie_le                timestamptz not null default now(),
  envoi_commence_le         timestamptz,
  envoi_termine_le          timestamptz,
  constraint lettre_notes_paragraphes check (
    length(btrim(decide)) between 120 and 900
    and length(btrim(echoue)) between 120 and 900
    and length(btrim(preparation)) between 120 and 900
    and position(E'\n' in decide) = 0
    and position(E'\n' in echoue) = 0
    and position(E'\n' in preparation) = 0
  ),
  -- La note ne porte ni annee, ni mois, ni jour de la semaine. Le controle
  -- applicatif est plus fin (delais relatifs), celui-ci est le dernier mot.
  constraint lettre_notes_sans_date check (
    (objet || ' ' || decide || ' ' || echoue || ' ' || preparation) !~ '(^|[^0-9])(19|20)[0-9]{2}([^0-9]|$)'
    and lower(objet || ' ' || decide || ' ' || echoue || ' ' || preparation)
      !~ '(^|[^[:alpha:]])(janvier|f[eé]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[eé]cembre|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)([^[:alpha:]]|$)'
  ),
  constraint lettre_notes_relue_avant_envoi check (statut = 'brouillon' or relue_desidentification)
);

-- 2.5 Les envois de notes, une ligne par destinataire. La cle primaire rend
--     l'envoi reprenable : un lot interrompu ne renvoie jamais deux fois.
create table if not exists lettre_envois (
  note_id         uuid not null references lettre_notes (id) on delete restrict,
  abonne_id       uuid not null references lettre_abonnes (id) on delete cascade,
  envoye_le       timestamptz not null default now(),
  fournisseur_id  text check (fournisseur_id is null or length(fournisseur_id) <= 80),
  primary key (note_id, abonne_id)
);

-- ---------------------------------------------------------------------
-- 3. Immuabilite
-- ---------------------------------------------------------------------
create or replace function lettre_horodater()
returns trigger language plpgsql as $$
begin
  new.modifie_le = now();
  return new;
end $$;

drop trigger if exists lettre_abonnes_horodatage on lettre_abonnes;
create trigger lettre_abonnes_horodatage before update on lettre_abonnes
  for each row execute function lettre_horodater();
drop trigger if exists lettre_notes_horodatage on lettre_notes;
create trigger lettre_notes_horodatage before update on lettre_notes
  for each row execute function lettre_horodater();

-- Un texte de consentement ne se modifie ni ne se supprime. Le journal ne
-- se modifie jamais, et ne se supprime que pendant une purge de retention,
-- signalee par le reglage de transaction lettre.purge.
create or replace function lettre_refuser_modification()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE'
     and tg_table_name = 'lettre_evenements'
     and current_setting('lettre.purge', true) = 'on' then
    return old;
  end if;
  raise exception 'EH0 : % refuse sur %, table en ajout seul.', tg_op, tg_table_name;
end $$;

drop trigger if exists lettre_consentements_immuable on lettre_consentements;
create trigger lettre_consentements_immuable before update or delete on lettre_consentements
  for each row execute function lettre_refuser_modification();
drop trigger if exists lettre_evenements_immuable on lettre_evenements;
create trigger lettre_evenements_immuable before update or delete on lettre_evenements
  for each row execute function lettre_refuser_modification();

-- Une note partie ne se reecrit plus : ce que les abonnes ont lu reste ce
-- qui est en base.
create or replace function lettre_figer_note()
returns trigger language plpgsql as $$
begin
  if old.statut <> 'brouillon'
     and (new.objet, new.decide, new.echoue, new.preparation)
         is distinct from (old.objet, old.decide, old.echoue, old.preparation) then
    raise exception 'EH0 : la note % est partie, son texte ne se modifie plus.', old.code;
  end if;
  if old.statut = 'envoyee' and new.statut <> 'envoyee' then
    raise exception 'EH0 : la note % est envoyee, son statut ne revient pas en arriere.', old.code;
  end if;
  return new;
end $$;

drop trigger if exists lettre_notes_figees on lettre_notes;
create trigger lettre_notes_figees before update on lettre_notes
  for each row execute function lettre_figer_note();

-- ---------------------------------------------------------------------
-- 4. Les seuls chemins d'ecriture
-- ---------------------------------------------------------------------

-- 4.1 Envois du jour, tous types confondus. Le palier gratuit de l'outil
--     d'envoi compte par jour, et ce compteur est celui qui le protege.
create or replace function lettre_envois_du_jour()
returns integer language sql stable as $$
  select count(*)::integer
    from lettre_evenements
   where type in ('confirmation_envoyee', 'bienvenue_envoyee', 'note_envoyee', 'test_envoye')
     and survenu_le >= (date_trunc('day', now() at time zone 'utc') at time zone 'utc');
$$;

-- 4.2 Une demande d'inscription. Ne dit jamais a l'appelant si l'adresse
--     est deja connue : la reponse visible est la meme dans tous les cas.
create or replace function lettre_inscrire(
  p_email                 text,
  p_email_empreinte       text,
  p_jeton_empreinte       text,
  p_jeton_expire_le       timestamptz,
  p_surface               text,
  p_chemin                text,
  p_referent_hote         text,
  p_campagne              jsonb,
  p_langue                text,
  p_consentement_version  text,
  p_ip_empreinte          text,
  p_limite_ip             integer default 5
)
returns table (resultat text, abonne_id uuid)
language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
  v_recentes integer;
  v_provenance jsonb := jsonb_build_object(
    'surface', p_surface,
    'chemin', p_chemin,
    'referent_hote', p_referent_hote,
    'campagne', coalesce(p_campagne, '{}'::jsonb)
  );
begin
  if p_ip_empreinte is not null then
    select count(*) into v_recentes
      from lettre_evenements e
     where e.ip_empreinte = p_ip_empreinte
       and e.type in ('inscription_demandee', 'reinscription_demandee', 'demande_repetee')
       and e.survenu_le > now() - interval '1 hour';
    if v_recentes >= p_limite_ip then
      return query select 'limite_ip'::text, null::uuid;
      return;
    end if;
  end if;

  select * into v from lettre_abonnes a where a.email_empreinte = p_email_empreinte for update;

  if not found then
    begin
      insert into lettre_abonnes (
        email, email_empreinte, statut, surface, chemin, referent_hote, campagne,
        langue, consentement_version, ip_empreinte, jeton_empreinte, jeton_expire_le
      ) values (
        p_email, p_email_empreinte, 'en_attente', p_surface, p_chemin, p_referent_hote,
        coalesce(p_campagne, '{}'::jsonb), p_langue, p_consentement_version, p_ip_empreinte,
        p_jeton_empreinte, p_jeton_expire_le
      ) returning * into v;
    exception when unique_violation then
      return query select 'trop_de_demandes'::text, null::uuid;
      return;
    end;
    insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
    values (v.id, 'inscription_demandee', v.cycle, p_consentement_version, p_ip_empreinte, v_provenance);
    return query select 'envoyer_confirmation'::text, v.id;
    return;
  end if;

  if v.statut = 'confirme' then
    insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
    values (v.id, 'demande_repetee', v.cycle, p_consentement_version, p_ip_empreinte,
            v_provenance || jsonb_build_object('refus', 'deja_confirme'));
    return query select 'deja_confirme'::text, v.id;
    return;
  end if;

  if v.statut = 'en_attente' then
    if v.confirmations_envoyees >= 3
       or (v.derniere_confirmation_le is not null
           and v.derniere_confirmation_le > now() - interval '10 minutes') then
      insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
      values (v.id, 'demande_repetee', v.cycle, p_consentement_version, p_ip_empreinte,
              v_provenance || jsonb_build_object('refus', 'rythme'));
      return query select 'trop_de_demandes'::text, v.id;
      return;
    end if;
    update lettre_abonnes
       set jeton_empreinte = p_jeton_empreinte,
           jeton_expire_le = p_jeton_expire_le,
           surface = p_surface,
           chemin = p_chemin,
           referent_hote = p_referent_hote,
           campagne = coalesce(p_campagne, '{}'::jsonb),
           langue = p_langue,
           consentement_version = p_consentement_version,
           ip_empreinte = p_ip_empreinte
     where id = v.id;
    insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
    values (v.id, 'demande_repetee', v.cycle, p_consentement_version, p_ip_empreinte,
            v_provenance || jsonb_build_object('renvoi', true));
    return query select 'envoyer_confirmation'::text, v.id;
    return;
  end if;

  -- Desinscrit ou expire : un nouveau cycle commence, avec une nouvelle
  -- double confirmation. L'ancien consentement ne se reveille jamais.
  update lettre_abonnes
     set statut = 'en_attente',
         cycle = v.cycle + 1,
         email = p_email,
         surface = p_surface,
         chemin = p_chemin,
         referent_hote = p_referent_hote,
         campagne = coalesce(p_campagne, '{}'::jsonb),
         langue = p_langue,
         consentement_version = p_consentement_version,
         ip_empreinte = p_ip_empreinte,
         demande_le = now(),
         jeton_empreinte = p_jeton_empreinte,
         jeton_expire_le = p_jeton_expire_le,
         confirmations_envoyees = 0,
         derniere_confirmation_le = null,
         confirme_le = null,
         confirme_ip_empreinte = null,
         bienvenue_envoyee_le = null,
         desinscrit_le = null,
         motif_desinscription = null
   where id = v.id;
  insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
  values (v.id, 'reinscription_demandee', v.cycle + 1, p_consentement_version, p_ip_empreinte, v_provenance);
  return query select 'envoyer_confirmation'::text, v.id;
end $$;

-- 4.3 Le message de confirmation est parti.
create or replace function lettre_confirmation_envoyee(p_abonne_id uuid, p_fournisseur_id text)
returns void language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
begin
  update lettre_abonnes
     set confirmations_envoyees = least(confirmations_envoyees + 1, 3),
         derniere_confirmation_le = now()
   where id = p_abonne_id and statut = 'en_attente'
  returning * into v;
  if found then
    insert into lettre_evenements (abonne_id, type, cycle, details)
    values (v.id, 'confirmation_envoyee', v.cycle,
            jsonb_build_object('fournisseur_id', left(coalesce(p_fournisseur_id, ''), 80)));
  end if;
end $$;

-- 4.4 Lecture seule d'un jeton, pour afficher tout de suite un lien expire.
create or replace function lettre_etat_jeton(p_jeton_empreinte text)
returns text language sql stable as $$
  select case
    when a.id is null then 'invalide'
    when a.jeton_expire_le < now() then 'expire'
    else 'valide'
  end
  from (select 1) s
  left join lettre_abonnes a
    on a.jeton_empreinte = p_jeton_empreinte and a.statut = 'en_attente';
$$;

-- 4.5 La confirmation, par un geste explicite sur la page, jamais par la
--     seule ouverture du lien (XDEC-39).
create or replace function lettre_confirmer(p_jeton_empreinte text, p_ip_empreinte text)
returns table (resultat text, abonne_id uuid, email text, cycle integer)
language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
begin
  select * into v from lettre_abonnes a
   where a.jeton_empreinte = p_jeton_empreinte and a.statut = 'en_attente'
   for update;
  if not found then
    return query select 'invalide'::text, null::uuid, null::text, null::integer;
    return;
  end if;
  if v.jeton_expire_le < now() then
    return query select 'expire'::text, v.id, null::text, v.cycle;
    return;
  end if;
  update lettre_abonnes
     set statut = 'confirme',
         confirme_le = now(),
         confirme_ip_empreinte = p_ip_empreinte,
         jeton_empreinte = null,
         jeton_expire_le = null
   where id = v.id;
  insert into lettre_evenements (abonne_id, type, cycle, consentement_version, ip_empreinte, details)
  values (v.id, 'confirme', v.cycle, v.consentement_version, p_ip_empreinte,
          jsonb_build_object('surface', v.surface, 'chemin', v.chemin));
  return query select 'confirme'::text, v.id, v.email, v.cycle;
end $$;

-- 4.6 Le message de bienvenue unique.
create or replace function lettre_bienvenue_envoyee(p_abonne_id uuid, p_fournisseur_id text)
returns void language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
begin
  update lettre_abonnes
     set bienvenue_envoyee_le = now()
   where id = p_abonne_id and statut = 'confirme' and bienvenue_envoyee_le is null
  returning * into v;
  if found then
    insert into lettre_evenements (abonne_id, type, cycle, details)
    values (v.id, 'bienvenue_envoyee', v.cycle,
            jsonb_build_object('fournisseur_id', left(coalesce(p_fournisseur_id, ''), 80)));
  end if;
end $$;

create or replace function lettre_bienvenues_en_attente(p_limite integer)
returns table (abonne_id uuid, email text, cycle integer)
language sql stable as $$
  select a.id, a.email, a.cycle
    from lettre_abonnes a
   where a.statut = 'confirme' and a.bienvenue_envoyee_le is null
   order by a.confirme_le
   limit greatest(p_limite, 0);
$$;

-- 4.7 La desinscription. L'adresse est effacee sur-le-champ ; restent son
--     empreinte et les dates, qui prouvent le consentement et son retrait.
create or replace function lettre_desinscrire(p_abonne_id uuid, p_motif text)
returns text language plpgsql as $$
#variable_conflict use_column
declare
  v lettre_abonnes%rowtype;
begin
  select * into v from lettre_abonnes a where a.id = p_abonne_id for update;
  if not found then
    return 'inconnu';
  end if;
  if v.statut in ('desinscrit', 'expire') then
    return 'deja';
  end if;
  update lettre_abonnes
     set statut = 'desinscrit',
         email = null,
         jeton_empreinte = null,
         jeton_expire_le = null,
         desinscrit_le = now(),
         motif_desinscription = p_motif
   where id = v.id;
  insert into lettre_evenements (abonne_id, type, cycle, details)
  values (v.id, 'desinscrit', v.cycle,
          jsonb_build_object('motif', p_motif, 'statut_precedent', v.statut));
  return 'desinscrit';
end $$;

create or replace function lettre_desinscrire_par_empreinte(p_email_empreinte text, p_motif text)
returns text language plpgsql as $$
#variable_conflict use_column
declare
  v_id uuid;
begin
  select a.id into v_id from lettre_abonnes a where a.email_empreinte = p_email_empreinte;
  if v_id is null then
    return 'inconnu';
  end if;
  return lettre_desinscrire(v_id, p_motif);
end $$;

-- 4.8 Le droit d'acces : tout ce que la base sait d'une adresse.
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
    'journal', v_journal
  );
end $$;

-- 4.9 La retention, appelee chaque jour par /api/lettre/sync.
--     Demande jamais confirmee : supprimee 30 jours apres la demande.
--     Preuve de retrait : supprimee 3 ans apres la desinscription.
create or replace function lettre_purger()
returns jsonb language plpgsql as $$
#variable_conflict use_column
declare
  v_jamais integer := 0;
  v_expires integer := 0;
  v_anciens integer := 0;
begin
  perform set_config('lettre.purge', 'on', true);

  with supprimes as (
    delete from lettre_abonnes a
     where a.statut = 'en_attente' and a.cycle = 1
       and a.demande_le < now() - interval '30 days'
    returning a.id
  ) select count(*) into v_jamais from supprimes;

  with expires as (
    update lettre_abonnes a
       set statut = 'expire', email = null, jeton_empreinte = null, jeton_expire_le = null
     where a.statut = 'en_attente' and a.cycle > 1
       and a.demande_le < now() - interval '30 days'
    returning a.id, a.cycle
  ), traces as (
    insert into lettre_evenements (abonne_id, type, cycle, details)
    select e.id, 'expire', e.cycle, jsonb_build_object('raison', 'confirmation_absente')
      from expires e
    returning 1
  ) select count(*) into v_expires from traces;

  with anciens as (
    delete from lettre_abonnes a
     where a.statut in ('desinscrit', 'expire')
       and coalesce(a.desinscrit_le, a.modifie_le) < now() - interval '3 years'
    returning a.id
  ) select count(*) into v_anciens from anciens;

  perform set_config('lettre.purge', 'off', true);

  insert into lettre_evenements (type, details)
  values ('purge', jsonb_build_object(
    'demandes_jamais_confirmees', v_jamais,
    'reinscriptions_expirees', v_expires,
    'preuves_de_retrait_echues', v_anciens
  ));

  return jsonb_build_object(
    'demandes_jamais_confirmees', v_jamais,
    'reinscriptions_expirees', v_expires,
    'preuves_de_retrait_echues', v_anciens
  );
end $$;

-- 4.10 Les notes trimestrielles.
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
  if v.statut = 'brouillon' then
    update lettre_notes set statut = 'envoi_en_cours', envoi_commence_le = now() where id = v.id;
  end if;
  return 'en_cours';
end $$;

create or replace function lettre_destinataires_note(p_note_id uuid, p_limite integer)
returns table (abonne_id uuid, email text)
language sql stable as $$
  select a.id, a.email
    from lettre_abonnes a
   where a.statut = 'confirme'
     and not exists (
       select 1 from lettre_envois n where n.note_id = p_note_id and n.abonne_id = a.id
     )
   order by a.confirme_le
   limit greatest(p_limite, 0);
$$;

create or replace function lettre_note_envoyee(p_note_id uuid, p_abonne_id uuid, p_fournisseur_id text)
returns void language plpgsql as $$
#variable_conflict use_column
declare
  v_code text;
  v_cycle integer;
begin
  select n.code into v_code from lettre_notes n where n.id = p_note_id and n.statut = 'envoi_en_cours';
  if v_code is null then
    raise exception 'EH0 : la note n''est pas en cours d''envoi.';
  end if;
  select a.cycle into v_cycle from lettre_abonnes a where a.id = p_abonne_id and a.statut = 'confirme';
  if v_cycle is null then
    return;
  end if;
  insert into lettre_envois (note_id, abonne_id, fournisseur_id)
  values (p_note_id, p_abonne_id, left(p_fournisseur_id, 80))
  on conflict (note_id, abonne_id) do nothing;
  if found then
    insert into lettre_evenements (abonne_id, type, cycle, details)
    values (p_abonne_id, 'note_envoyee', v_cycle, jsonb_build_object('note', v_code));
  end if;
end $$;

create or replace function lettre_note_clore_si_complete(p_note_id uuid)
returns text language plpgsql as $$
#variable_conflict use_column
begin
  if exists (select 1 from lettre_destinataires_note(p_note_id, 1)) then
    return 'reste';
  end if;
  update lettre_notes
     set statut = 'envoyee', envoi_termine_le = now()
   where id = p_note_id and statut = 'envoi_en_cours';
  return 'close';
end $$;

create or replace function lettre_test_envoye(p_fournisseur_id text)
returns void language sql as $$
  insert into lettre_evenements (type, details)
  values ('test_envoye', jsonb_build_object('fournisseur_id', left(coalesce(p_fournisseur_id, ''), 80)));
$$;

-- 4.11 L'etat de la liste, pour la console privee. Jamais publie : aucun
--      compteur d'abonnes ne sort de l'administration (XINV-21).
create or replace function lettre_etat()
returns jsonb language sql stable as $$
  select jsonb_build_object(
    'en_attente', (select count(*) from lettre_abonnes where statut = 'en_attente'),
    'confirmes', (select count(*) from lettre_abonnes where statut = 'confirme'),
    'desinscrits', (select count(*) from lettre_abonnes where statut = 'desinscrit'),
    'expires', (select count(*) from lettre_abonnes where statut = 'expire'),
    'bienvenues_en_attente', (select count(*) from lettre_abonnes
                               where statut = 'confirme' and bienvenue_envoyee_le is null),
    'envois_du_jour', lettre_envois_du_jour(),
    'derniere_purge', (select max(survenu_le) from lettre_evenements where type = 'purge'),
    'consentement_version', (select max(version) from lettre_consentements)
  );
$$;

-- ---------------------------------------------------------------------
-- 5. Acces : le role service seulement
-- ---------------------------------------------------------------------
alter table lettre_consentements enable row level security;
alter table lettre_abonnes enable row level security;
alter table lettre_evenements enable row level security;
alter table lettre_notes enable row level security;
alter table lettre_envois enable row level security;

-- Aucune politique n'est creee, et c'est le reglage : sans politique, la
-- securite au niveau des lignes refuse tout aux cles anon et authenticated.
-- Les droits de table sont retires en plus, pour qu'un oubli de RLS futur
-- ne rouvre rien.
revoke all on lettre_consentements, lettre_abonnes, lettre_evenements, lettre_notes, lettre_envois
  from anon, authenticated;
grant select, insert, update, delete on lettre_consentements, lettre_abonnes, lettre_evenements, lettre_notes, lettre_envois
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
-- 6. Semis : la version EH0-1 du texte de consentement
-- ---------------------------------------------------------------------
-- Ces deux textes sont recopies a l'identique dans apps/web/content/lettre.ts.
-- Le test tests/lettre-sql.test.ts echoue si l'un des deux derive.
insert into lettre_consentements (version, texte_case, texte_mention)
values (
  'EH0-1',
  'J’accepte de recevoir SIGNAL, la lettre d’ADAMA OS, et en attendant sa parution une note courte par trimestre. Je peux me désinscrire en un clic à tout moment.',
  'Adama Diallo, entrepreneur individuel, traite cette adresse pour vous envoyer SIGNAL, sur la base de votre consentement. Elle n’est jamais cédée ni versée à une autre liste, et elle est effacée dès votre désinscription. La mention complète, plus bas, donne les durées et vos droits.'
)
on conflict (version) do nothing;

-- ---------------------------------------------------------------------
-- 7. Controles
-- ---------------------------------------------------------------------
-- a. Cinq tables, RLS active sur chacune, aucune politique. Doit renvoyer
--    5 lignes, toutes a rls = true et politiques = 0.
select c.relname as table_lettre,
       c.relrowsecurity as rls,
       (select count(*) from pg_policies p where p.tablename = c.relname) as politiques
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relname like 'lettre\_%' and c.relkind = 'r'
 order by 1;

-- b. Aucune fonction de la lettre n'est executable par anon. Doit renvoyer
--    0 ligne.
select p.proname
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname like 'lettre\_%'
   and has_function_privilege('anon', p.oid, 'execute');

-- c. La version de consentement est semee, avec son empreinte.
select version, empreinte from lettre_consentements order by version;

-- d. A executer a la main : la contrainte de collecte mord. Doit lever
--    lettre_abonnes_mode_collecte_check et ne rien inserer.
--    insert into lettre_abonnes (email, email_empreinte, statut, surface, chemin,
--      consentement_version, jeton_empreinte, jeton_expire_le, mode_collecte)
--    values ('essai@exemple.fr', repeat('a', 64), 'en_attente', 'page_lettre', '/lettre',
--      'EH0-1', repeat('b', 64), now() + interval '1 day', 'import');

-- =====================================================================
-- Fin de la migration 0001_lettre.
-- =====================================================================

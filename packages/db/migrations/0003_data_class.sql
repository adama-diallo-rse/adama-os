-- =====================================================================
-- ADAMA OS, couche C1, la classe de la donnee devient inseparable de la
-- donnee.
-- A executer dans Supabase, SQL Editor, APRES 0002_ecosystem_analytics.sql.
-- Idempotente : relancable sans casser l'existant.
--
-- ORDRE D'EXECUTION, a lire avant de coller quoi que ce soit.
-- Cette migration ajoute la valeur 'done' au type enumere trajectory_status.
-- PostgreSQL autorise l'ajout dans une transaction mais interdit d'utiliser
-- la nouvelle valeur avant la validation de cette transaction. La mise a jour
-- des lignes de trajectory qui en depend vit donc dans 0004, qui doit etre
-- executee dans une session SQL DISTINCTE. Ne pas coller 0003 et 0004
-- ensemble.
--
-- Regle de tenue : les commentaires de ce fichier suivent la convention du
-- depot et n'ont pas d'accents. Les CHAINES INSEREES, elles, sont affichees
-- telles quelles sur /metrics et dans le cockpit : elles portent les leurs.
--
-- Ce que fait cette migration :
--   1. cree le type data_class ;
--   2. ajoute data_class, method, max_age_seconds et published_at sur
--      ecosystem_analytics et sur system_metrics, sans valeur par defaut ;
--   3. classe explicitement chaque ligne existante, puis passe la colonne en
--      not null et pose les contraintes de coherence ;
--   4. tranche le sort des trois lignes source = 'demo' ;
--   5. cree ecosystem_probes, qui distingue une panne du produit d'une panne
--      du reseau du cockpit ;
--   6. ajoute la valeur 'done' a trajectory_status ;
--   7. repare le retrait de colonne de la migration 0001, qui ne retirait
--      rien (voir la section 7, c'est un vrai defaut de securite).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Le type des trois classes
-- ---------------------------------------------------------------------
-- Trois classes seulement. 'absent' et 'stale' ne sont PAS des valeurs de
-- base : ce sont des etats derives a la lecture, l'un de l'absence de valeur,
-- l'autre de l'age du releve. Les stocker reviendrait a figer une deduction
-- qui doit se refaire a chaque affichage.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'data_class') then
    create type data_class as enum ('real', 'historical', 'demo');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. ecosystem_analytics
-- ---------------------------------------------------------------------
alter table ecosystem_analytics add column if not exists data_class data_class;
alter table ecosystem_analytics add column if not exists method text;
alter table ecosystem_analytics add column if not exists max_age_seconds integer;
alter table ecosystem_analytics add column if not exists published_at timestamptz;

comment on column ecosystem_analytics.data_class is
  'C1. real, historical ou demo. Pas de valeur par defaut : classer est une decision, pas un remplissage.';
comment on column ecosystem_analytics.method is
  'C1. Comment la valeur a ete obtenue, en une phrase lisible par un humain.';
comment on column ecosystem_analytics.max_age_seconds is
  'C1. Duree de validite. Au dela, la valeur reste lisible mais porte la mention PERIMEE.';
comment on column ecosystem_analytics.published_at is
  'C1. Date de publication d''une valeur historique. Obligatoire pour data_class = historical.';

-- Classement explicite des lignes existantes. Trois cas, aucun implicite.
update ecosystem_analytics
   set data_class = 'demo',
       method = coalesce(method, 'Jeu d''illustration inséré par db:seed --demo. Ne décrit rien de réel.')
 where data_class is null and source = 'demo';

update ecosystem_analytics
   set data_class = 'real',
       method = coalesce(method, 'Relevé importé par la passerelle L9 : ' || source),
       max_age_seconds = coalesce(max_age_seconds, 172800)
 where data_class is null and source is not null and source <> 'demo';

-- Une ligne sans source ne peut pas etre presentee comme reelle. Elle n'est
-- pas non plus historique : on ne connait pas la date a laquelle elle aurait
-- ete publiee. Elle bascule du cote non reel, ou elle est visible et
-- clairement marquee, plutot que de rester une valeur nue.
do $$
declare n bigint;
begin
  select count(*) into n from ecosystem_analytics
   where data_class is null and source is null;
  if n > 0 then
    update ecosystem_analytics
       set data_class = 'demo',
           method = coalesce(method, 'Provenance inconnue, ligne antérieure à la couche C1. Présentée comme non réelle tant qu''elle n''est pas retracée.')
     where data_class is null and source is null;
    raise notice '% ligne(s) sans source classee(s) demo. A retracer ou a supprimer.', n;
  end if;
end $$;

alter table ecosystem_analytics alter column data_class set not null;

-- Coherence : une valeur reelle nomme sa source et sa methode, une valeur
-- historique porte sa date de publication. La base tient la regle, pas
-- seulement le code.
do $$
begin
  begin
    alter table ecosystem_analytics
      add constraint ecosystem_analytics_class_coherence check (
        (data_class <> 'real' or (source is not null and method is not null))
        and (data_class <> 'historical' or published_at is not null)
      );
  exception when duplicate_object then null;
  end;
end $$;

create index if not exists ecosystem_analytics_class_idx
  on ecosystem_analytics (data_class, created_at desc);

-- ---------------------------------------------------------------------
-- 3. system_metrics
-- ---------------------------------------------------------------------
-- La table n'avait aucune colonne de provenance : ses valeurs etaient saisies
-- a la main sans que rien ne le dise. C'est une provenance comme une autre,
-- et elle merite d'etre ecrite.
alter table system_metrics add column if not exists data_class data_class;
alter table system_metrics add column if not exists source text;
alter table system_metrics add column if not exists method text;
alter table system_metrics add column if not exists max_age_seconds integer;
alter table system_metrics add column if not exists published_at timestamptz;

update system_metrics
   set data_class = 'real',
       source = coalesce(source, 'Déclaration d''Adama'),
       method = coalesce(method, 'Saisi à la main depuis /checkin, puis relu à chaque mise à jour.'),
       max_age_seconds = coalesce(max_age_seconds, 604800)
 where data_class is null;

alter table system_metrics alter column data_class set not null;

do $$
begin
  begin
    alter table system_metrics
      add constraint system_metrics_class_coherence check (
        (data_class <> 'real' or (source is not null and method is not null))
        and (data_class <> 'historical' or published_at is not null)
      );
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------------
-- 4. Le sort des trois lignes de demonstration
-- ---------------------------------------------------------------------
-- Trois lignes (PME analysees 12, requetes API 1287, audits lances 4) ont ete
-- inserees par db:seed --demo et s'affichaient sans etre distinctes d'un
-- releve reel.
--
-- OPTION RETENUE, appliquee par le bloc 2 ci-dessus : requalification en
-- data_class = 'demo'. Trois raisons. Elle ne detruit rien, donc elle est
-- reversible. Elle laisse au site une occasion de montrer que le marquage de
-- classe fonctionne vraiment, ce qu'une base sans aucune ligne de
-- demonstration ne permettrait pas de verifier. Et l'interrupteur
-- ADAMA_HIDE_DEMO les fait disparaitre du rendu serveur quand la page part
-- vers un lecteur exigeant, sans qu'il faille toucher a la base.
--
-- OPTION ECARTEE, laissee en commentaire : la suppression. A n'activer que si
-- ces trois lignes doivent disparaitre definitivement. Decommenter, executer,
-- et ecrire la raison dans le message de commit.
--
-- delete from ecosystem_analytics where source = 'demo';

-- ---------------------------------------------------------------------
-- 5. ecosystem_probes, la nature de l'echec (C1-T7)
-- ---------------------------------------------------------------------
-- Jusqu'ici, une valeur 0 ecrite parce que le produit a repondu un etat non
-- sain et une absence totale de valeur parce que le delai a ete depasse se
-- ressemblaient : dans les deux cas, la seule trace etait ce qui manquait.
-- Cette table garde chaque tentative et sa nature d'echec. Le cockpit sait
-- desormais dire "le produit est tombe" et "je n'ai pas pu joindre le
-- produit", qui ne sont pas la meme information.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'probe_failure_kind') then
    create type probe_failure_kind as enum (
      'produit_non_sain',
      'delai_depasse',
      'erreur_reseau',
      'reponse_illisible'
    );
  end if;
end $$;

create table if not exists ecosystem_probes (
  id            uuid primary key default gen_random_uuid(),
  product_slug  text,
  division      text,
  source        text not null,
  status        text not null check (status in ('ok', 'unavailable', 'disabled')),
  failure_kind  probe_failure_kind,
  http_status   integer,
  latency_ms    integer,
  -- Extrait technique court, jamais un corps de reponse complet et jamais
  -- une valeur d'en-tete : une sonde ne doit pas devenir un journal de fuite.
  error_excerpt text,
  observed_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

comment on table ecosystem_probes is
  'C1-T7. Une ligne par tentative de sonde L9. Distingue produit non sain, delai depasse, erreur reseau et reponse illisible.';

-- Coherence : un echec porte sa nature, un succes n'en porte pas.
do $$
begin
  begin
    alter table ecosystem_probes
      add constraint ecosystem_probes_failure_coherence check (
        (status = 'ok' and failure_kind is null)
        or (status = 'disabled' and failure_kind is null)
        or (status = 'unavailable' and failure_kind is not null)
      );
  exception when duplicate_object then null;
  end;
end $$;

do $$
begin
  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relname = 'ecosystem_products' and n.nspname = 'public'
  ) then
    begin
      alter table ecosystem_probes
        add constraint ecosystem_probes_product_fk
        foreign key (product_slug) references ecosystem_products (slug)
        on update cascade on delete set null;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists ecosystem_probes_product_idx
  on ecosystem_probes (product_slug, observed_at desc);
create index if not exists ecosystem_probes_status_idx
  on ecosystem_probes (status, observed_at desc);

alter table ecosystem_probes enable row level security;

drop policy if exists "ecosystem_probes_public_read" on ecosystem_probes;
create policy "ecosystem_probes_public_read" on ecosystem_probes
  for select to anon, authenticated using (true);

-- Ecriture reservee au role de service : c'est le cron qui sonde, pas un
-- visiteur. Aucune policy d'insertion pour anon, volontairement.
drop policy if exists "ecosystem_probes_service_write" on ecosystem_probes;
create policy "ecosystem_probes_service_write" on ecosystem_probes
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------
-- 6. trajectory, la valeur 'done' (C1-T8)
-- ---------------------------------------------------------------------
-- Une roadmap perimee est une donnee fausse comme une autre. Il manquait
-- simplement une facon de dire qu'une etape est finie.
-- La mise a jour des lignes vit dans 0004, session SQL distincte : voir
-- l'avertissement en tete de fichier.
alter type trajectory_status add value if not exists 'done';


-- ---------------------------------------------------------------------
-- 7. Un garde-fou qui n'en etait pas un
-- ---------------------------------------------------------------------
-- Defaut trouve le 1er septembre 2026, en rejouant les migrations contre un
-- PostgreSQL 16 local. La migration 0001 se termine par :
--
--   revoke select (repo_full_name) on ecosystem_products from anon;
--
-- Cette instruction ne retire rien. PostgreSQL le documente : revoquer un
-- privilege de COLONNE ne retire pas le privilege de TABLE. Or Supabase
-- accorde un select de table a anon sur les tables du schema public. Le nom
-- des depots, y compris prives, etait donc lisible avec la cle anonyme, dans
-- le bundle client, depuis le 12 aout 2026.
--
-- Le test qui devait l'attraper existe, tests/rls.integration.test.ts, et il
-- affirme exactement le contraire de la realite. Il ne s'execute que sur
-- demande explicite avec des identifiants de base, donc il n'a jamais tourne
-- contre une vraie base. Un garde-fou qu'on n'execute pas est un garde-fou
-- qu'on croit avoir.
--
-- Le seul motif qui fonctionne : retirer le select de table, puis accorder
-- explicitement les colonnes lisibles. La consequence est assumee, un
-- `select *` par la cle anonyme est desormais refuse sur ces deux tables :
-- le code nomme toujours ses colonnes, c'est deja la regle du depot.
--
-- A REVERIFIER apres toute operation Supabase qui rejoue un
-- `grant all on all tables in schema public to anon` : elle restaurerait le
-- privilege de table et donc le defaut. Le controle (d) plus bas le dit en
-- une requete.
revoke select on ecosystem_products from anon;
grant select (
  id, slug, name, division, pillar, description, status, url,
  is_public, position, created_at, updated_at
) on ecosystem_products to anon;

-- Meme motif pour la table des sondes, des sa creation. L'extrait d'erreur
-- peut porter une origine interne : il reste hors de portee de la cle
-- anonyme, alors que le reste de la ligne est lisible pour le comptage
-- public.
revoke select on ecosystem_probes from anon;
grant select (
  id, product_slug, division, source, status, failure_kind,
  http_status, latency_ms, observed_at, created_at
) on ecosystem_probes to anon;

-- ---------------------------------------------------------------------
-- 8. Controles
-- ---------------------------------------------------------------------
-- a. aucune ligne sans classe
select 'ecosystem_analytics' as t, count(*) filter (where data_class is null) as sans_classe
from ecosystem_analytics
union all
select 'system_metrics', count(*) filter (where data_class is null) from system_metrics;

-- b. repartition des classes
select data_class, count(*) from ecosystem_analytics group by 1 order by 1;

-- c. la table des sondes existe et sa contrainte tient
select to_regclass('public.ecosystem_probes') as ecosystem_probes;

-- d. la valeur 'done' est disponible
select enumlabel from pg_enum
 where enumtypid = 'trajectory_status'::regtype order by enumsortorder;

-- e. les colonnes sensibles sont VRAIMENT hors de portee de la cle anonyme.
-- Les deux premieres colonnes doivent valoir false, les deux dernieres true.
select
  has_column_privilege('anon', 'ecosystem_products', 'repo_full_name', 'select') as repo_lisible,
  has_column_privilege('anon', 'ecosystem_probes',   'error_excerpt',  'select') as erreur_lisible,
  has_column_privilege('anon', 'ecosystem_products', 'slug',           'select') as slug_lisible,
  has_column_privilege('anon', 'ecosystem_probes',   'status',         'select') as statut_lisible;

-- =====================================================================
-- Fin de la migration 0003. Executer 0004 dans une session SQL distincte.
-- =====================================================================

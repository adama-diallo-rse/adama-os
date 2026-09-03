-- =====================================================================
-- ADAMA OS, couche C6, le journal d'architecture.
-- A executer dans Supabase, SQL Editor, APRES 0004_proof.sql, et DANS UNE
-- SESSION SQL DISTINCTE : les types enumeres crees ici ne sont utilisables
-- qu'une fois cette transaction validee, donc 0006 se colle separement.
-- Idempotente : relancable sans casser l'existant.
--
-- ATTENTION, projet Supabase PARTAGE avec STRATA Scope et Academy. Cette
-- migration ne touche qu'a decisions_log, qui appartient au cockpit.
--
-- Ce que fait cette migration :
--   1. cree les quatre types enumeres du format ADR ;
--   2. etend decisions_log, sans rien retirer ni renommer ;
--   3. MIGRE les trois decisions existantes vers le format ADR, par titre,
--      sans les remplacer ni les dupliquer ;
--   4. durcit la lecture publique : un ADR non relu par Adama n'est plus
--      lisible par la cle anonyme, meme marque publie ;
--   5. corrige le vocabulaire carbone deja ecrit en base.
--
-- Regle dure de la couche, tenue par la base et pas seulement par le code :
-- un ADR dont reviewed_by_adama est faux NE SE PUBLIE PAS. Les affirmations
-- d'un ADR portent sur le travail d'Adama ; personne d'autre ne peut les
-- valider a sa place.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Types enumeres
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'adr_status') then
    -- propose   : ecrit, pas encore tranche ;
    -- accepte   : en vigueur ;
    -- remplace  : reste en ligne, pointe vers celui qui le remplace ;
    -- abandonne : tranche puis defait, sans successeur.
    create type adr_status as enum ('propose', 'accepte', 'remplace', 'abandonne');
  end if;
  if not exists (select 1 from pg_type where typname = 'adr_scope') then
    create type adr_scope as enum ('adama-os', 'esg-optimizer', 'strata-scope', 'groupe');
  end if;
  if not exists (select 1 from pg_type where typname = 'adr_impact') then
    create type adr_impact as enum ('architecture', 'conformite', 'cout', 'produit', 'securite');
  end if;
  if not exists (select 1 from pg_type where typname = 'adr_reversibility') then
    create type adr_reversibility as enum ('forte', 'moyenne', 'faible');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Extension de decisions_log
-- ---------------------------------------------------------------------
-- Aucune colonne existante n'est retiree ni renommee : title, date,
-- category, reasoning et tags continuent d'alimenter la Couche B du cockpit
-- pendant que les nouvelles colonnes portent le format ADR.
alter table decisions_log
  add column if not exists adr_id            text,
  add column if not exists status            adr_status,
  add column if not exists scope             adr_scope,
  add column if not exists impact            adr_impact,
  add column if not exists reversibility     adr_reversibility,
  add column if not exists supersedes        text,
  add column if not exists context           jsonb,
  add column if not exists options           jsonb,
  add column if not exists decision          text,
  add column if not exists rationale         jsonb,
  add column if not exists tradeoff          text,
  add column if not exists consequence       text,
  add column if not exists evidence_refs     jsonb,
  add column if not exists reconstructed     boolean not null default false,
  add column if not exists open_questions    jsonb,
  add column if not exists reviewed_by_adama boolean not null default false,
  add column if not exists updated_at        timestamptz not null default now();

comment on column decisions_log.adr_id is
  'Identifiant stable et cite, DEC-014. Jamais reattribue : il finit dans /decisions/<adr>.';
comment on column decisions_log.supersedes is
  'adr_id de la decision remplacee. La decision remplacee reste en ligne, elle n''est jamais supprimee.';
comment on column decisions_log.rationale is
  'Les trois axes du raisonnement, technique, reglementaire, economique. La colonne reasoning garde la version d''un trait, servie a la Couche B du cockpit qui n''affiche que ce champ.';
comment on column decisions_log.consequence is
  'Ce qui a ete OBSERVE dans le code. Pas ce qui etait espere.';
comment on column decisions_log.reconstructed is
  'Vrai quand l''ADR a ete reconstruit a posteriori depuis le depot. La page l''affiche.';
comment on column decisions_log.reviewed_by_adama is
  'Faux tant qu''Adama n''a pas relu. Un ADR non relu n''est pas servi publiquement.';

-- Un identifiant d'ADR est unique, et il a une forme. DEC-1, dec-014 ou
-- DEC014 ne sont pas des identifiants : un jour l'un d'eux serait cite dans
-- une URL, et l'URL ne resoudrait rien.
create unique index if not exists decisions_log_adr_id_key
  on decisions_log (adr_id) where adr_id is not null;

-- ATTENTION, regle apprise en tentant de violer ces contraintes contre une
-- base reelle le 2 septembre 2026. Une contrainte CHECK dont l'expression
-- vaut NULL est consideree comme SATISFAITE par PostgreSQL. Or
-- `jsonb_typeof(NULL)` rend NULL, et `NULL = 'object'` rend NULL : la
-- premiere ecriture de cette contrainte laissait donc passer un ADR complet
-- sauf une colonne jsonb absente. Chaque comparaison porte desormais son
-- `is not null`, et le controle (e) en fin de fichier le prouve.
--
-- Les contraintes sont retirees puis reposees plutot qu'ajoutees sous
-- exception : une contrainte deja presente dans une version fausse ne se
-- corrigeait pas en rejouant la migration, elle etait simplement ignoree.
alter table decisions_log
  drop constraint if exists decisions_log_adr_id_format,
  drop constraint if exists decisions_log_adr_complet,
  drop constraint if exists decisions_log_supersedes_coherence;

alter table decisions_log
  add constraint decisions_log_adr_id_format
  check (adr_id is null or adr_id ~ '^DEC-[0-9]{3}$');

-- Coherence du format : une ligne qui porte un adr_id porte le format
-- complet. Une demi-migration laisserait des ADR sans contexte ni
-- consequence, affiches comme s'ils etaient complets.
alter table decisions_log
  add constraint decisions_log_adr_complet
  check (
    adr_id is null
    or (
      status is not null
      and scope is not null
      and impact is not null
      and reversibility is not null
      and decision is not null and length(btrim(decision)) > 10
      and tradeoff is not null and length(btrim(tradeoff)) > 10
      and consequence is not null and length(btrim(consequence)) > 10
      and context is not null and jsonb_typeof(context) = 'array'
      and jsonb_array_length(context) >= 1
      and options is not null and jsonb_typeof(options) = 'array'
      and jsonb_array_length(options) >= 2
      and rationale is not null and jsonb_typeof(rationale) = 'object'
      and rationale ? 'technique'
      and rationale ? 'reglementaire'
      and rationale ? 'economique'
      and evidence_refs is not null and jsonb_typeof(evidence_refs) = 'array'
      and jsonb_array_length(evidence_refs) >= 1
    )
  );

-- Un ADR remplace pointe vers son successeur, et un ADR qui ne remplace
-- rien n'en designe pas un. Sans cette regle, un statut se poserait sans
-- que le lien existe, et la page afficherait un renvoi vers nulle part.
alter table decisions_log
  add constraint decisions_log_supersedes_coherence
  check (
    supersedes is null
    or (supersedes ~ '^DEC-[0-9]{3}$' and supersedes <> adr_id)
  );

create index if not exists decisions_log_adr_idx
  on decisions_log (status, impact, date desc) where adr_id is not null;
create index if not exists decisions_log_supersedes_idx
  on decisions_log (supersedes) where supersedes is not null;

drop trigger if exists decisions_log_set_updated_at on decisions_log;
create trigger decisions_log_set_updated_at
  before update on decisions_log
  for each row execute function adama_set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Migration des trois decisions existantes
-- ---------------------------------------------------------------------
-- Elles ne sont PAS backfillees ici, et c'est volontaire. Poser un adr_id
-- sans le reste du format violerait la contrainte de completude posee juste
-- au dessus : une ligne qui porte un identifiant d'ADR porte le format
-- entier, ou elle n'en porte pas.
--
-- C'est donc le semis qui les migre, en une seule ecriture par ligne :
--   pnpm --filter @adama/db adr:seed
-- Il RETROUVE les trois lignes existantes par leur titre et les met a jour.
-- Il n'en cree pas de secondes : les trois decisions historiques gardent
-- leur identifiant technique, leur date et leur texte d'origine.
--
-- Le controle (c) en fin de fichier verifie qu'aucune ligne n'est restee au
-- format ancien apres le semis.

-- ---------------------------------------------------------------------
-- 4. Lecture publique durcie
-- ---------------------------------------------------------------------
-- La policy d'origine servait toute ligne marquee publiee. Elle est
-- remplacee par une regle qui exige en plus la relecture d'Adama pour les
-- lignes au format ADR. Les lignes anterieures au format, sans adr_id,
-- continuent de se servir comme avant : la couche B du cockpit ne casse pas.
drop policy if exists "decisions_public_read_published" on decisions_log;
create policy "decisions_public_read_published" on decisions_log
  for select to anon
  using (is_published = true and (adr_id is null or reviewed_by_adama = true));

-- La session authentifiee, elle, lit tout : c'est ce qui permet la page de
-- relecture /admin/relecture, sans creer de porte derobee cote anonyme.
drop policy if exists "decisions_auth_read_all" on decisions_log;
create policy "decisions_auth_read_all" on decisions_log
  for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- 5. Vocabulaire carbone
-- ---------------------------------------------------------------------
-- Regle de l'espace : empreinte carbone ou bilan GES, jamais « bilan
-- carbone » en nom commun. Trois chaines deja ecrites en base ne la
-- tenaient pas. Le code est corrige dans le meme commit ; ces deux ordres
-- corrigent les lignes deja inserees.
update ecosystem_products
   set description = replace(description, 'Bilan carbone Scopes', 'Empreinte carbone, scopes')
 where description like 'Bilan carbone Scopes%';

update proof_claims
   set statement = replace(statement, 'le moteur de bilan carbone du groupe', 'le moteur d''empreinte carbone du groupe')
 where statement like '%moteur de bilan carbone du groupe%';

-- ---------------------------------------------------------------------
-- 6. Controles
-- ---------------------------------------------------------------------
-- a. les colonnes du format ADR existent
select column_name from information_schema.columns
 where table_name = 'decisions_log'
   and column_name in ('adr_id', 'status', 'scope', 'impact', 'reversibility',
                       'supersedes', 'context', 'options', 'decision', 'tradeoff',
                       'consequence', 'evidence_refs', 'reconstructed', 'rationale',
                       'open_questions', 'reviewed_by_adama')
 order by column_name;

-- b. combien de lignes sont deja au format ADR complet
select count(*) filter (where adr_id is not null)        as au_format_adr,
       count(*) filter (where reviewed_by_adama)          as relues,
       count(*)                                           as total
  from decisions_log;

-- c. apres le semis : plus aucune ligne au format ancien. Doit renvoyer 0.
select count(*) as lignes_sans_identifiant_adr
  from decisions_log where adr_id is null;

-- d. aucun renvoi vers un ADR inexistant : doit renvoyer 0 lignes
select d.adr_id, d.supersedes
  from decisions_log d
 where d.supersedes is not null
   and not exists (select 1 from decisions_log s where s.adr_id = d.supersedes);

-- e. la contrainte de completude mord bien sur une colonne jsonb absente.
--    A executer a la main, hors transaction de migration : doit lever une
--    erreur decisions_log_adr_complet et n'inserer aucune ligne.
--    insert into decisions_log
--      (title, category, reasoning, adr_id, status, scope, impact,
--       reversibility, decision, tradeoff, consequence, context, options,
--       evidence_refs)
--    values ('essai', 'Produit', 'essai', 'DEC-900', 'accepte', 'groupe',
--            'produit', 'forte', 'une decision assez longue',
--            'un compromis assez long', 'une consequence assez longue',
--            '["a"]', '[{},{}]', '[{}]');

-- =====================================================================
-- Fin de la migration 0005. Passer 0006 dans une session SQL distincte,
-- puis semer le contenu : pnpm --filter @adama/db adr:seed
-- =====================================================================

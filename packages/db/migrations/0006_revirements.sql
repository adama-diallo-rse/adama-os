-- =====================================================================
-- ADAMA OS, couche C7, ce sur quoi je suis revenu.
-- A executer dans Supabase, SQL Editor, APRES 0005_adr.sql et DANS UNE
-- SESSION SQL DISTINCTE : la valeur 'remplace' du type adr_status cree par
-- 0005 n'est utilisable qu'une fois cette transaction-la validee.
-- Idempotente : relancable sans casser l'existant.
--
-- Ce que fait cette migration : une seule colonne, et les regles qui
-- empechent de s'en servir a moitie.
--
-- Aucune table nouvelle, et c'est la decision de la couche. Un revirement
-- n'est pas un objet a part : c'est la decision initiale, au statut
-- remplace, augmentee de six champs narratifs. Lui donner sa propre table
-- aurait produit deux journaux paralleles, dont l'un aurait fini par
-- contredire l'autre.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. La colonne
-- ---------------------------------------------------------------------
-- Six champs, aucun optionnel :
--   croyais     la position initiale, telle qu'elle etait defendable
--   invalide    l'observation, le fait, la contrainte, la date
--   fait        le geste concret, avec le commit ou la suppression
--   cout        du temps, du code jete, une reprise de documentation
--   coutEstime  vrai quand le cout est mesure sur le diff et non chronometre
--   regle       la regle generale, en une phrase, qui remonte vers /principes
alter table decisions_log
  add column if not exists revirement jsonb;

comment on column decisions_log.revirement is
  'C7. Les six champs narratifs d''un revirement, portes par l''ADR au statut remplace. Le champ cout est obligatoire : sans lui, un revirement ressemble a de l''amelioration continue et non a une correction.';

-- ---------------------------------------------------------------------
-- 2. Les regles
-- ---------------------------------------------------------------------
-- ATTENTION, meme regle qu'en 0005, apprise de la meme facon. Une
-- contrainte CHECK dont l'expression vaut NULL est SATISFAITE. Or, sur un
-- objet jsonb, `revirement ->> 'cout'` rend NULL quand la cle manque, donc
-- `length(btrim(NULL)) > 20` rend NULL : la premiere ecriture laissait
-- passer un revirement reduit a une seule cle. Chaque longueur passe
-- desormais par coalesce, ce qui ramene l'absence a zero et fait mordre la
-- comparaison. Le controle (d) en fin de fichier le prouve.
--
-- Les contraintes sont retirees puis reposees plutot qu'ajoutees sous
-- exception : une contrainte deja presente dans une version fausse ne se
-- corrigeait pas en rejouant la migration.
alter table decisions_log
  drop constraint if exists decisions_log_revirement_statut,
  drop constraint if exists decisions_log_revirement_complet;

-- a. Un revirement ne se porte que par une decision remplacee. Sur une
--    decision en vigueur, il decrirait un retour en arriere qui n'a pas eu
--    lieu.
alter table decisions_log
  add constraint decisions_log_revirement_statut
  check (revirement is null or status = 'remplace');

-- b. Les six champs, et le cout non vide. C'est la regle la plus importante
--    du fichier : sans cout, un revirement se lit comme une amelioration
--    continue, et la page perd exactement ce qui la rend credible.
alter table decisions_log
  add constraint decisions_log_revirement_complet
  check (
    revirement is null
    or (
      jsonb_typeof(revirement) = 'object'
      and coalesce(length(btrim(revirement ->> 'croyais')), 0) > 20
      and coalesce(length(btrim(revirement ->> 'invalide')), 0) > 20
      and coalesce(length(btrim(revirement ->> 'fait')), 0) > 20
      and coalesce(length(btrim(revirement ->> 'cout')), 0) > 20
      and coalesce(length(btrim(revirement ->> 'regle')), 0) > 10
      and revirement ? 'coutEstime'
      and jsonb_typeof(revirement -> 'coutEstime') = 'boolean'
    )
  );

-- c. Une decision remplacee reste en ligne. On ne supprime pas un ADR :
--    revenir sur une decision est ici une qualite, pas un aveu, et la trace
--    de ce retour est justement ce qu'on publie. La regle ne peut pas
--    s'ecrire en contrainte de table ; elle est tenue par le semis, qui ne
--    supprime jamais, et par ce commentaire.

create index if not exists decisions_log_revirement_idx
  on decisions_log ((revirement is not null)) where revirement is not null;

-- ---------------------------------------------------------------------
-- 3. Controles
-- ---------------------------------------------------------------------
-- a. les revirements publies, avec leur successeur
select d.adr_id,
       d.title,
       s.adr_id                       as remplace_par,
       d.revirement ->> 'regle'       as regle,
       (d.revirement ->> 'coutEstime')::boolean as cout_estime
  from decisions_log d
  left join decisions_log s on s.supersedes = d.adr_id
 where d.revirement is not null
 order by d.adr_id;

-- b. aucun revirement orphelin : chaque decision remplacee doit avoir un
--    successeur qui la designe. Doit renvoyer 0 lignes.
select d.adr_id
  from decisions_log d
 where d.status = 'remplace'
   and not exists (select 1 from decisions_log s where s.supersedes = d.adr_id);

-- c. aucun revirement sans cout. Doit renvoyer 0 lignes.
select adr_id from decisions_log
 where revirement is not null
   and coalesce(btrim(revirement ->> 'cout'), '') = '';

-- d. la contrainte mord bien sur une cle absente. Doit lever une erreur
--    decisions_log_revirement_complet, et donc ne rien inserer.
--    A executer a la main, hors transaction de migration :
--    update decisions_log
--       set revirement = '{"croyais": "une position initiale assez longue"}'
--     where adr_id = 'DEC-102';

-- =====================================================================
-- Fin de la migration 0006. Semer le contenu ensuite :
--   pnpm --filter @adama/db adr:seed
-- =====================================================================

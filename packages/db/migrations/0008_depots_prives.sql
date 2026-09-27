-- =====================================================================
-- ADAMA OS, correction FAIL-003, deux dépôts privés présentés comme lisibles
-- publiquement. A exécuter dans Supabase, SQL Editor, après 0007_graphe.sql.
-- Idempotente : relançable sans effet de plus.
--
-- Fait établi le 27 septembre 2026 par la mesure M-001
-- (scripts/mesure-m001.mjs, relevé apps/web/content/mesures/) : l'API
-- publique de GitHub répond 404 à un visiteur sans compte sur
-- adama-diallo-rse/strata-scope et iroko-software-group/esg-optimizer. Le
-- cockpit les lisait avec son jeton, et publiait pourtant ces preuves comme
-- vérifiables par un visiteur.
--
-- Ce que fait ce fichier : il corrige les deux énoncés et les quatre
-- preuves. Il ne retire rien et ne change aucun identifiant : les adresses
-- /verifier/<id> restent valides. L'ancien texte reste visible au registre
-- public des erreurs, entrée FAIL-003 (XINV-55, XDEC-26).
-- =====================================================================

update proof_claims
   set statement = 'Le code de STRATA Scope est versionné dans un dépôt privé, suivi par ce cockpit qui en relève le dernier commit.',
       updated_at = now()
 where id = 'strata-scope-depot-suivi'
   and statement <> 'Le code de STRATA Scope est versionné dans un dépôt privé, suivi par ce cockpit qui en relève le dernier commit.';

update proof_claims
   set statement = 'Le code d''ESG Optimizer est versionné dans un dépôt privé, suivi par ce cockpit qui en relève le dernier commit.',
       updated_at = now()
 where id = 'esg-optimizer-depot-suivi'
   and statement <> 'Le code d''ESG Optimizer est versionné dans un dépôt privé, suivi par ce cockpit qui en relève le dernier commit.';

update proof_evidence
   set method = 'Lecture du dernier commit du dépôt privé par le cockpit, avec son jeton de lecture. Le dépôt n''est pas public : un visiteur ne peut pas relire ce commit.',
       verifiable_by = 'adama',
       updated_at = now()
 where kind = 'depot'
   and locator in ('adama-diallo-rse/strata-scope', 'iroko-software-group/esg-optimizer')
   and verifiable_by <> 'adama';

-- ---------------------------------------------------------------------
-- Contrôles
-- ---------------------------------------------------------------------
-- a. plus aucune preuve de dépôt privé ne se déclare vérifiable par un
--    visiteur. Doit renvoyer 0 lignes.
select claim_id, locator, verifiable_by
  from proof_evidence
 where kind = 'depot'
   and locator in ('adama-diallo-rse/strata-scope', 'iroko-software-group/esg-optimizer')
   and verifiable_by = 'visiteur';

-- b. plus aucun énoncé ne promet une lecture publique. Doit renvoyer 0 lignes.
select id from proof_claims where statement ilike '%lisible publiquement%';

-- c. contre-épreuve, à faire hors de la base après exécution :
--      node scripts/mesure-m001.mjs
--    Les quatre preuves passent de « discordant » à « hors_tiers ».

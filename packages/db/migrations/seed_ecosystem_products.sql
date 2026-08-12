-- =====================================================================
-- ADAMA OS, L1-T9, registre reel du groupe (donnees, pas schema)
-- A executer APRES 0001_ecosystem_products.sql, dans Supabase -> SQL Editor.
-- Equivalent exact du bloc ecosystem_products de packages/db/src/seed.ts,
-- utile quand la connection string locale n'est pas disponible.
-- Idempotent : conflit sur slug ignore, rien n'est ecrase.
--
-- Regle tenue par la base : status 'live' exige une URL. Seuls les deux
-- produits reellement ouverts au public la portent. Les autres sont en
-- construction, sans lien et sans date promise.
-- =====================================================================

insert into ecosystem_products
  (slug, name, division, pillar, description, status, url, repo_full_name, is_public, position)
values
  ('esg-optimizer', 'ESG Optimizer', 'STRATA', 'Audit et conformite CSRD',
   'Deposez vos documents, obtenez un scoring sur les 10 standards ESRS et un rapport structure.',
   'live', 'https://esg-optimizer.fr', 'iroko-software-group/esg-optimizer', true, 10),

  ('strata-scope', 'STRATA Scope', 'STRATA', 'Empreinte carbone',
   'Bilan carbone Scopes 1, 2 et 3 sur les facteurs officiels de la Base Empreinte ADEME. Restitution BEGES, CSRD, SBTi.',
   'live', 'https://scope.esg-optimizer.fr', 'adama-diallo-rse/strata-scope', true, 20),

  ('strata-platform', 'STRATA Platform', 'STRATA', 'Site corporate du groupe',
   'La vitrine de la suite STRATA et son socle d''authentification.',
   'building', null, 'iroko-software-group/strata-platform', true, 30),

  ('strata-foundation', 'STRATA Foundation', 'STRATA', 'Point de depart ESG',
   'Un premier diagnostic de maturite durable, gratuit, pour se situer en dix minutes.',
   'building', null, 'iroko-software-group/strata-foundation', true, 40),

  ('strata-watch', 'STRATA Watch', 'STRATA', 'Veille reglementaire',
   'Veille automatisee sur les sources officielles (EFRAG, AMF, JOUE), transformee en alertes utiles.',
   'building', null, 'iroko-software-group/strata-watch', true, 50),

  ('strata-academy', 'STRATA Academy', 'STRATA', 'Formation a la durabilite',
   'Des parcours courts sur la CSRD, la VSME et le carbone, penses pour les equipes de PME.',
   'building', null, 'iroko-software-group/strata-esg-academy', true, 60),

  ('iroko-platform', 'IROKO Platform', 'IROKO', 'Operating system des entreprises africaines',
   'Le socle de la branche Afrique du groupe.',
   'building', null, 'iroko-software-group/iroko-platform', true, 70),

  ('adama-os', 'Adama OS', 'Cockpit', 'Cockpit du fondateur',
   'Ce tableau de bord. Suivi pour le feed Shipped, mais ce n''est pas un produit de la grille.',
   'building', null, 'adama-diallo-rse/adama-os', false, 999)

on conflict (slug) do nothing;

-- Controle : doit renvoyer 8 lignes, dont 2 en 'live' avec une URL.
select slug, division, status, url is not null as a_une_url, is_public
from ecosystem_products
order by position;

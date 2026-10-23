-- =====================================================================
-- ADAMA OS, 23 octobre 2026 : Pharivo, et le registre remis à l'état réel.
-- A exécuter dans Supabase, SQL Editor, après 0008_depots_prives.sql.
-- Idempotente : relançable sans effet de plus.
--
-- Pourquoi maintenant. Le 10 octobre 2026, Adama a clos sa recherche de
-- poste et garde la voie de fondateur à plein temps. Le 22 octobre, il a
-- validé son positionnement public : co-fondateur de STRATA ESG et de
-- Pharivo, et une règle d'apparition (un projet n'est nommé publiquement
-- qu'avec un produit en ligne ou un client). Le registre datait du
-- 31 août : quatre produits STRATA y figuraient « en construction » alors
-- qu'ils répondent tous en ligne, et Pharivo n'y était pas.
--
-- Ce que fait ce fichier, dans cet ordre :
--   1. il ajoute la portée « pharivo » au journal d'architecture ;
--   2. il remet à l'état relevé le 23 octobre 2026 les produits STRATA,
--      chaque adresse ayant répondu 200 depuis le poste d'Adama ;
--   3. il ajoute ESG Optimizer Africa et Pharivo ;
--   4. il retire IROKO Platform de la vitrine publique, sans effacer la
--      ligne : la règle d'apparition le place hors du profil public.
--
-- Ce qu'il ne fait PAS : il ne supprime aucune ligne, ne touche à aucune
-- preuve et à aucune métrique. Les descriptions portent désormais leurs
-- accents : ce sont des textes lus par des clients.
--
-- Retour arrière d'IROKO, si Adama le décide :
--   update ecosystem_products set is_public = true where slug = 'iroko-platform';
-- =====================================================================

-- 1. La portée Pharivo du journal d'architecture. ADD VALUE ne peut pas
--    tourner dans un bloc qui utilise la valeur : elle est posée seule.
alter type adr_scope add value if not exists 'pharivo';

-- 2. Les produits STRATA, à l'état relevé.
update ecosystem_products
   set pillar = 'Audit et conformité CSRD',
       description = 'Déposez vos documents, obtenez un scoring sur les 10 standards ESRS et un rapport structuré.',
       updated_at = now()
 where slug = 'esg-optimizer';

update ecosystem_products
   set status = 'live',
       url = 'https://www.strata-esg.fr',
       pillar = 'Site de STRATA ESG',
       description = 'Le site de STRATA ESG : ses logiciels, son accompagnement, et le point d''entrée commun des produits.',
       updated_at = now()
 where slug = 'strata-platform';

update ecosystem_products
   set status = 'live',
       url = 'https://foundation.esg-optimizer.fr',
       pillar = 'Point de départ ESG',
       description = 'Gratuit pour les PME : ce qui vous vise, où vous en êtes, l''inventaire de vos données et des ressources prêtes à l''emploi. Sans carte bancaire.',
       updated_at = now()
 where slug = 'strata-foundation';

update ecosystem_products
   set status = 'live',
       url = 'https://watch.esg-optimizer.fr',
       pillar = 'Veille réglementaire',
       description = 'Les sources réglementaires officielles, européennes et françaises, filtrées pour votre entreprise et transformées en échéances datées.',
       updated_at = now()
 where slug = 'strata-watch';

-- STRATA Academy répond en ligne, mais son catalogue est vide au
-- 23 octobre 2026 : l'adresse est publiée, le statut reste en développement.
update ecosystem_products
   set status = 'building',
       url = 'https://academy.esg-optimizer.fr',
       pillar = 'Formation à la durabilité',
       description = 'Des parcours en ligne sur la CSRD, la VSME et la taxonomie, pour les PME et leurs conseils. Le catalogue se construit.',
       updated_at = now()
 where slug = 'strata-academy';

-- 3. Les deux produits ajoutés. Ni l'un ni l'autre ne porte de dépôt :
--    ESG Optimizer Africa partage celui d'ESG Optimizer, qui est déjà
--    suivi, et le dépôt de Pharivo est privé, hors du périmètre du jeton de
--    lecture du cockpit.
insert into ecosystem_products
  (slug, name, division, pillar, description, status, url, repo_full_name, is_public, position)
values
  ('esg-optimizer-africa', 'ESG Optimizer Africa', 'STRATA', 'Cotation ESG pour l''Afrique',
   'Une cotation ESG de A à D, à présenter à sa banque ou à son donneur d''ordre, sans partager ses documents. Prix en francs CFA.',
   'live', 'https://africa.esg-optimizer.fr', null, true, 25),

  ('pharivo', 'Pharivo', 'Pharivo', 'Gestion d''officine',
   'Le logiciel de l''officine sénégalaise : comptoir, stock par lot, péremptions et prix administrés, même sans réseau.',
   'live', 'https://pharivo.com', null, true, 80)
on conflict (slug) do update
   set name = excluded.name,
       division = excluded.division,
       pillar = excluded.pillar,
       description = excluded.description,
       status = excluded.status,
       url = excluded.url,
       is_public = excluded.is_public,
       position = excluded.position,
       updated_at = now();

-- 4. IROKO Platform quitte la vitrine publique. La ligne reste, son dépôt
--    aussi : le journal de développement filtre désormais les produits non
--    publics (apps/web/lib/repos.ts, suiviPublic).
update ecosystem_products
   set is_public = false,
       pillar = 'Socle des entreprises africaines',
       description = 'Le socle commun des produits africains du groupe.',
       updated_at = now()
 where slug = 'iroko-platform';

update ecosystem_products
   set description = 'Ce tableau de bord. Suivi pour le journal de développement, ce n''est pas un produit de la grille.',
       updated_at = now()
 where slug = 'adama-os';

-- Contrôle : 10 lignes, dont 7 en 'live' avec une URL, et 8 publiques
-- (le cockpit et IROKO Platform ne le sont pas).
select slug, division, status, url, is_public, position
  from ecosystem_products
 order by position;

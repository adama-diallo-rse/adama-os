-- =====================================================================
-- ADAMA OS, 30 octobre 2026 : Conhama entre au registre des produits.
-- A exécuter dans Supabase, SQL Editor, après 0009_pharivo_et_registre.sql.
-- Idempotente : relançable sans effet de plus.
--
-- Pourquoi maintenant. Le 30 octobre 2026, Adama a demandé que la page
-- « Ce que j'ai construit » présente quatre maisons : STRATA ESG et ses
-- cinq produits, Pharivo, ADAMA OS et Conhama. Conhama répond en ligne
-- (https://conhama.com/fr, code 200 relevé le 30 octobre 2026) : la règle
-- d'apparition est tenue.
--
-- Ce que fait ce fichier : il ajoute la ligne Conhama, publique, sans
-- dépôt suivi (le dépôt est privé, hors du périmètre du jeton de lecture
-- du cockpit). Il ne supprime aucune ligne et ne touche à aucune preuve :
-- l'affirmation « conhama-en-ligne » est posée par pnpm proof:seed.
--
-- Retour arrière, si Adama le décide :
--   update ecosystem_products set is_public = false where slug = 'conhama';
-- =====================================================================

insert into ecosystem_products
  (slug, name, division, pillar, description, status, url, repo_full_name, is_public, position)
values
  ('conhama', 'Conhama', 'Conhama', 'Carte de l''économie durable',
   'La carte vivante de l''économie durable : ses acteurs cartographiés, reliés et départagés par aucune préférence. Démonstrateur en Île-de-France.',
   'live', 'https://conhama.com/fr', null, true, 90)
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

-- Contrôle : 11 lignes, dont 9 publiques.
select slug, division, status, url, is_public, position
  from ecosystem_products
 order by position;

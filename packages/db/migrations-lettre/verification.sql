\set ON_ERROR_STOP on
-- =====================================================================
-- EH0, scenario fonctionnel de la migration 0001_lettre.
--
-- A jouer sur un Postgres JETABLE, jamais sur une base reelle : il ecrit,
-- vieillit des lignes et purge. Il reproduit les roles de Supabase.
--
--   docker run -d --name lettre-pg -e POSTGRES_PASSWORD=essai postgres:17-alpine
--   docker exec lettre-pg psql -U postgres -c "create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create schema extensions;"
--   docker cp packages/db/migrations-lettre/0001_lettre.sql lettre-pg:/tmp/m.sql
--   docker cp packages/db/migrations-lettre/verification.sql lettre-pg:/tmp/s.sql
--   docker exec lettre-pg psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/m.sql
--   docker exec lettre-pg psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/s.sql
--   docker rm -f lettre-pg
--
-- Attendu : 39 lignes « ok », puis SCENARIO COMPLET, code de sortie 0.
-- Releve du 13 septembre 2026 : 39 sur 39, Postgres 17.
-- =====================================================================

create or replace function pg_temp.verifier(condition boolean, libelle text) returns void
language plpgsql as $$
begin
  if not condition then raise exception 'ECHEC : %', libelle; end if;
  raise notice 'ok : %', libelle;
end $$;

-- 1. Inscription nouvelle
select pg_temp.verifier(
  (select resultat from lettre_inscrire('a@exemple.fr', repeat('a',64), repeat('1',64), now() + interval '7 days',
     'page_lettre', '/lettre', 'www.linkedin.com', '{"utm_source":"linkedin"}', 'fr', 'EH0-1', repeat('f',64))) = 'envoyer_confirmation',
  'inscription nouvelle demande une confirmation');

select pg_temp.verifier((select statut from lettre_abonnes where email_empreinte = repeat('a',64)) = 'en_attente', 'statut en attente');
select pg_temp.verifier((select count(*) from lettre_evenements where type = 'inscription_demandee') = 1, 'evenement inscription ecrit');

-- 2. Redemande immediate avant envoi de confirmation : renvoi autorise
select pg_temp.verifier(
  (select resultat from lettre_inscrire('a@exemple.fr', repeat('a',64), repeat('2',64), now() + interval '7 days',
     'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('f',64))) = 'envoyer_confirmation',
  'renvoi possible tant que rien n''est parti');
select lettre_confirmation_envoyee((select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'msg_1');

-- 3. Redemande dans les dix minutes : refus de rythme
select pg_temp.verifier(
  (select resultat from lettre_inscrire('a@exemple.fr', repeat('a',64), repeat('3',64), now() + interval '7 days',
     'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('e',64))) = 'trop_de_demandes',
  'rythme de renvoi tenu');

-- 4. Etat du jeton courant (le 2)
select pg_temp.verifier(lettre_etat_jeton(repeat('2',64)) = 'valide', 'jeton courant valide');
select pg_temp.verifier(lettre_etat_jeton(repeat('1',64)) = 'invalide', 'ancien jeton invalide');

-- 5. Confirmation
select pg_temp.verifier(
  (select resultat from lettre_confirmer(repeat('2',64), repeat('c',64))) = 'confirme', 'confirmation par jeton');
select pg_temp.verifier(
  (select resultat from lettre_confirmer(repeat('2',64), repeat('c',64))) = 'invalide', 'jeton a usage unique');
select pg_temp.verifier(
  (select confirme_le is not null and jeton_empreinte is null from lettre_abonnes where email_empreinte = repeat('a',64)),
  'confirmation datee, jeton efface');

-- 6. Deja confirme
select pg_temp.verifier(
  (select resultat from lettre_inscrire('a@exemple.fr', repeat('a',64), repeat('4',64), now() + interval '7 days',
     'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('d',64))) = 'deja_confirme',
  'adresse deja confirmee reconnue');

-- 7. Bienvenue
select pg_temp.verifier((select count(*) from lettre_bienvenues_en_attente(10)) = 1, 'bienvenue en attente');
select lettre_bienvenue_envoyee((select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'msg_2');
select pg_temp.verifier((select count(*) from lettre_bienvenues_en_attente(10)) = 0, 'bienvenue envoyee une fois');
select pg_temp.verifier(lettre_envois_du_jour() = 2, 'deux envois comptes aujourd''hui');

-- 8. Limite par IP
do $$
begin
  for i in 1..5 loop
    perform lettre_inscrire('ip' || i || '@exemple.fr', lpad(to_hex(i), 64, 'b'), lpad(to_hex(i), 64, '9'),
      now() + interval '7 days', 'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('7',64));
  end loop;
end $$;
select pg_temp.verifier(
  (select resultat from lettre_inscrire('ip6@exemple.fr', repeat('6',64), repeat('5',64), now() + interval '7 days',
     'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('7',64))) = 'limite_ip',
  'sixieme demande depuis la meme IP refusee');

-- 9. Note trimestrielle
insert into lettre_notes (code, objet, decide, echoue, preparation, relue_desidentification)
values ('NOTE-01', 'SIGNAL, la note du trimestre', repeat('d', 130), repeat('e', 130), repeat('p', 130), true);
select pg_temp.verifier(lettre_note_demarrer((select id from lettre_notes where code = 'NOTE-01')) = 'en_cours', 'note demarree');
select pg_temp.verifier((select count(*) from lettre_destinataires_note((select id from lettre_notes where code='NOTE-01'), 100)) = 1,
  'un seul destinataire confirme');
select lettre_note_envoyee((select id from lettre_notes where code='NOTE-01'), (select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'm3');
select lettre_note_envoyee((select id from lettre_notes where code='NOTE-01'), (select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'm3bis');
select pg_temp.verifier((select count(*) from lettre_envois) = 1, 'aucun doublon d''envoi');
select pg_temp.verifier(lettre_note_clore_si_complete((select id from lettre_notes where code='NOTE-01')) = 'close', 'note close');

-- 10. Note figee apres envoi
do $$
begin
  update lettre_notes set decide = repeat('z', 130) where code = 'NOTE-01';
  raise exception 'ECHEC : une note partie a ete modifiee';
exception when raise_exception then
  if sqlerrm like 'ECHEC%' then raise; end if;
  raise notice 'ok : note partie figee';
end $$;

-- 11. Note datee refusee
do $$
begin
  insert into lettre_notes (code, objet, decide, echoue, preparation)
  values ('NOTE-02', 'SIGNAL, la note de mai', repeat('d', 130), repeat('e', 130), repeat('p', 130));
  raise exception 'ECHEC : une note datee est entree';
exception when check_violation then
  raise notice 'ok : note datee refusee par la base';
end $$;

-- 12. Collecte hors formulaire refusee
do $$
begin
  insert into lettre_abonnes (email, email_empreinte, statut, surface, chemin, consentement_version,
    jeton_empreinte, jeton_expire_le, mode_collecte)
  values ('essai@exemple.fr', repeat('0',64), 'en_attente', 'page_lettre', '/lettre', 'EH0-1',
    repeat('0',64), now() + interval '1 day', 'import');
  raise exception 'ECHEC : un import est entre';
exception when check_violation then
  raise notice 'ok : import refuse';
end $$;

-- 13. Adresse dans le journal refusee
do $$
begin
  insert into lettre_evenements (type, details) values ('purge', '{"x":"a@exemple.fr"}');
  raise exception 'ECHEC : une adresse est entree au journal';
exception when check_violation then
  raise notice 'ok : journal sans adresse';
end $$;

-- 14. Journal et consentement immuables
do $$
begin
  update lettre_evenements set details = '{}' where id = (select min(id) from lettre_evenements);
  raise exception 'ECHEC : journal modifie';
exception when raise_exception then
  if sqlerrm like 'ECHEC%' then raise; end if;
  raise notice 'ok : journal immuable';
end $$;
do $$
begin
  update lettre_consentements set texte_case = texte_case || ' ' where version = 'EH0-1';
  raise exception 'ECHEC : consentement modifie';
exception when raise_exception then
  if sqlerrm like 'ECHEC%' then raise; end if;
  raise notice 'ok : consentement immuable';
end $$;

-- 15. Export (droit d'acces)
select pg_temp.verifier(
  (lettre_exporter(repeat('a',64)) -> 'provenance' ->> 'referent_hote') is null
  and (lettre_exporter(repeat('a',64)) ->> 'statut') = 'confirme'
  and jsonb_array_length(lettre_exporter(repeat('a',64)) -> 'journal') >= 5,
  'export complet avec journal');

-- 16. Desinscription : email efface, preuve gardee
select pg_temp.verifier(
  lettre_desinscrire((select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'lien') = 'desinscrit',
  'desinscription');
select pg_temp.verifier(
  (select email is null and desinscrit_le is not null and motif_desinscription = 'lien'
     from lettre_abonnes where email_empreinte = repeat('a',64)),
  'adresse effacee, date et motif gardes');
select pg_temp.verifier(
  lettre_desinscrire((select id from lettre_abonnes where email_empreinte = repeat('a',64)), 'lien') = 'deja',
  'desinscription idempotente');
select pg_temp.verifier((select count(*) from lettre_destinataires_note(gen_random_uuid(), 100)) = 0,
  'une adresse desinscrite ne recoit plus rien');

-- 17. Reinscription : nouveau cycle, nouvelle double confirmation
select pg_temp.verifier(
  (select resultat from lettre_inscrire('a@exemple.fr', repeat('a',64), repeat('8',64), now() + interval '7 days',
     'page_lettre', '/lettre', null, '{}', 'fr', 'EH0-1', repeat('3',64))) = 'envoyer_confirmation',
  'reinscription demande une nouvelle confirmation');
select pg_temp.verifier(
  (select cycle = 2 and statut = 'en_attente' and confirme_le is null from lettre_abonnes where email_empreinte = repeat('a',64)),
  'cycle 2, ancien consentement non reveille');

-- 18. Purge : vieillir les demandes et verifier la retention
alter table lettre_abonnes disable trigger lettre_abonnes_horodatage;
update lettre_abonnes set demande_le = now() - interval '31 days' where statut = 'en_attente';
alter table lettre_abonnes enable trigger lettre_abonnes_horodatage;
select lettre_purger();
select pg_temp.verifier((select count(*) from lettre_abonnes where statut = 'en_attente') = 0, 'demandes non confirmees purgees');
select pg_temp.verifier(
  (select statut = 'expire' and email is null from lettre_abonnes where email_empreinte = repeat('a',64)),
  'cycle 2 non confirme expire, preuve du cycle 1 gardee');
select pg_temp.verifier((select count(*) from lettre_evenements where abonne_id = (select id from lettre_abonnes where email_empreinte = repeat('a',64))) >= 8,
  'journal du cycle 1 conserve');
select pg_temp.verifier((select count(*) from lettre_evenements where type = 'purge') = 1, 'purge tracee');

-- 19. Droits des roles
set role anon;
do $$
begin
  perform count(*) from lettre_abonnes;
  raise exception 'ECHEC : anon lit la liste';
exception when insufficient_privilege then
  raise notice 'ok : anon ne lit pas la liste';
end $$;
do $$
begin
  perform lettre_etat();
  raise exception 'ECHEC : anon execute une fonction';
exception when insufficient_privilege then
  raise notice 'ok : anon n''execute aucune fonction';
end $$;
reset role;
set role service_role;
do $$ begin if (lettre_etat() ->> 'expires')::int < 1 then raise exception 'ECHEC : service_role'; end if; raise notice 'ok : service_role lit l''etat'; end $$;
reset role;

select 'SCENARIO COMPLET' as fin;

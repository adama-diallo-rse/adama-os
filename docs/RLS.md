# Exercer les règles de sécurité au niveau ligne

> Écrit le 2 septembre 2026. Ce document existe parce que la garantie décrite
> ici a été affirmée deux fois et vérifiée zéro fois, et que la deuxième
> découverte est plus inquiétante que la première.

## Pourquoi ce document

`apps/web/tests/rls.integration.test.ts` ne s'exécute que sur demande, avec
trois variables d'environnement et un point d'accès qui parle comme Supabase.
Personne ne devine cette configuration. Un test qu'on ne sait pas lancer est
un test qui ne tourne pas, et un test qui ne tourne pas finit par affirmer
n'importe quoi sans que personne ne le voie.

## Les deux précédents

**12 août 2026, la garantie était fausse.** La migration `0001` posait
`revoke select (repo_full_name) ... from anon`. PostgreSQL ne laisse pas un
retrait de colonne annuler un privilège de table, et Supabase accorde un
select de table à `anon` : le nom des dépôts, y compris privés, est resté
lisible vingt jours. Le test affirmait le contraire. Il n'avait jamais tourné.
Corrigé par la migration `0003`, section 7, et la migration `0001` a été
reprise sur place : une base montée aujourd'hui depuis `0000` est donc déjà
correcte avant `0003`. C'est `0003` qui a réparé les bases déjà en service.

**2 septembre 2026, la vérification était fausse.** Au premier lancement réel
contre un vrai PostgREST, trois cas sur six passaient au vert sans que rien ne
soit refusé : le client Supabase préfixe ses requêtes de `/rest/v1`, le banc
d'essai servait à la racine, chaque requête rendait un `404`, et l'assertion
`expect(error).not.toBeNull()` était satisfaite par ce `404`. Une adresse
fausse, un service éteint ou un pare-feu produisaient donc exactement la même
conclusion qu'une politique de sécurité qui tient.

Deux corrections en sont sorties, et elles valent plus que le résultat du
test lui-même :

1. les cas de refus attendent désormais le **code PostgreSQL `42501`**, et pas
   « une erreur » ;
2. un cas de garde s'exécute d'abord et échoue si le point d'accès ne rend pas
   de données lisibles, ce qui fait tomber tout le fichier au lieu de le
   laisser virer au vert sur un banc mal branché.

**Et un troisième, dans le contrôle d'intégrité.** `pnpm integrity` ne
vérifiait que `ADAMA_TEST_DB`. Sans l'adresse et la clé, le fichier de test se
met en sommeil et **sort en code 0** : le contrôle annonçait « réussi » sur
sept cas ignorés. Il exige maintenant les trois variables, et il lit le
décompte des cas exécutés dans la sortie plutôt que le seul code de retour.

## Monter le banc d'essai

Aucune de ces étapes ne touche la production, et le point d'accès n'écoute que
sur la boucle locale.

### 1. Une base avec le schéma du cockpit

```bash
createdb adama_rls
psql -d adama_rls -c "create extension if not exists vector; create extension if not exists pgcrypto;"
for f in packages/db/migrations/00*.sql packages/db/migrations/seed_ecosystem_products.sql; do
  psql -d adama_rls -v ON_ERROR_STOP=1 -f "$f"
done
```

### 2. La ligne de base des privilèges Supabase

Une base PostgreSQL nue n'accorde rien à `anon`. Supabase, si. Sans cette
étape, tout est refusé et le test passe **pour la mauvaise raison**, ce qui
est exactement le piège que ce document décrit.

```bash
psql -d adama_rls -c "
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  grant select on all tables in schema public to anon, authenticated;
  grant all on all tables in schema public to service_role;"
```

Puis **rejouer `0003_data_class.sql`**, qui repose les retraits ciblés
par-dessus cette ligne de base. L'ordre compte : les retraits doivent venir
après les octrois, sinon ils sont annulés.

### 3. Des lignes de recette qui rendent le test signifiant

Une base vide fait passer tous les cas de refus. Il faut au moins une ligne
que la politique doit cacher :

- un produit `is_public = false` ;
- une décision `is_published = false`, et une à `true` ;
- un document et un extrait dans `rag_documents` et `rag_chunks` ;
- une sonde dont `error_excerpt` est renseigné.

### 4. PostgREST, servi sous `/rest/v1`

Le client Supabase préfixe ses requêtes. PostgREST sert à la racine. Sans
préfixe, tout rend `404`, et c'est le piège du 2 septembre.

```
db-uri     = "postgres://...@127.0.0.1:5432/adama_rls"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "<au moins 32 caracteres>"
server-port = 3999
```

PostgREST écoute donc sur **3999**. Devant lui, un mandataire minimal écoute
sur **3998** et retire le préfixe `/rest/v1` avant de transmettre. C'est ce
port **3998** que le test doit viser, jamais 3999 : pointé directement sur
PostgREST, chaque requête rend un `404`, et c'est exactement le piège décrit
plus haut.

```js
import http from "node:http";
http
  .createServer((req, res) => {
    const chemin = req.url.replace(/^\/rest\/v1/, "") || "/";
    const relais = http.request(
      {
        host: "127.0.0.1",
        port: 3999,
        path: chemin,
        method: req.method,
        headers: req.headers,
      },
      (r) => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
      },
    );
    relais.on("error", (e) => {
      res.writeHead(502);
      res.end(String(e));
    });
    req.pipe(relais);
  })
  .listen(3998, "127.0.0.1");
```

Puis fabriquer un jeton `HS256` de charge utile `{"role":"anon"}`, signé avec
le même secret que `jwt-secret`, et de durée de validité courte. Un jeton
expiré fait échouer les sept cas, ce qui est le comportement voulu depuis la
correction : une erreur d'authentification n'est pas un refus de politique.

### 5. Lancer

```bash
ADAMA_TEST_DB=1 \
ADAMA_TEST_SUPABASE_URL=http://127.0.0.1:3998 \
ADAMA_TEST_SUPABASE_ANON_KEY=<le jeton anon> \
pnpm --filter @adama/web test tests/rls.integration.test.ts
```

Le même triplet fait passer le contrôle `rls` de `pnpm integrity` de
`non_execute` à `reussi`.

## Résultat du 2 septembre 2026

Sept cas sur sept, contre PostgreSQL 16.13 et PostgREST 12.2.3, les sept
migrations rejouées depuis `0000`, la ligne de base Supabase posée puis
`0003` rejouée par-dessus.

| Ce qui est exercé                                  | Constaté                             |
| -------------------------------------------------- | ------------------------------------ |
| Le point d'accès rend des données lisibles         | oui, la garde tient                  |
| `rag_documents` et `rag_chunks` par la clé anonyme | zéro ligne visible                   |
| `decisions_log`                                    | seule la décision publiée sort       |
| `ecosystem_products.repo_full_name`                | refusé, code `42501`                 |
| `ecosystem_probes.error_excerpt`                   | refusé, code `42501`                 |
| Colonnes publiques de ces deux tables              | lisibles, le retrait n'a pas débordé |
| `ecosystem_products` en liste                      | seuls les produits publics sortent   |

Contre-épreuve exécutée le même jour : pointé sur un banc qui rend `404`, le
fichier échoue désormais sur **sept cas sur sept**. Avant la correction, trois
d'entre eux passaient.

## Ce que ce test ne prouve pas

Il prouve que les politiques et les privilèges écrits dans les migrations
produisent le comportement attendu **sur une base montée depuis ces
migrations**. Il ne dit rien de l'état réel du projet Supabase partagé, où des
octrois ont pu être posés à la main hors migration. Pour cela il faut rejouer
le même test contre une copie de la vraie base, et c'est un geste qui demande
des identifiants.

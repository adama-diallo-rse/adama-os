# La lettre SIGNAL, chantier EH0

Arrêté le 13 septembre 2026. Date de mise en service posée : samedi 3 octobre 2026.
Critère de sortie, verbatim : double confirmation, désinscription en un clic,
mention légale, et un sous-domaine d'envoi qui n'est pas celui de la
prospection STRATA.

EH0 livre tout ce qui envoie. EX1 livrera tout ce qui écrit. Les sept éléments
du périmètre, et où chacun vit :

| #   | Élément                             | Où                                                                       |
| --- | ----------------------------------- | ------------------------------------------------------------------------ |
| 1   | Page `/lettre`, un seul champ       | `apps/web/app/lettre/page.tsx`, `formulaire.tsx`                         |
| 2   | Consentement coché, jamais précoché | `formulaire.tsx`, version `EH0-1` dans `content/lettre.ts` et en base    |
| 3   | Double confirmation                 | `app/api/lettre/route.ts`, `app/lettre/actions.ts`, `lettre_confirmer`   |
| 4   | Désinscription en un clic           | lien signé dans chaque message et en-tête RFC 8058, `lettre_desinscrire` |
| 5   | Mention légale                      | `MENTION_COMPLETE` dans `content/lettre.ts`, affichée en quatre endroits |
| 6   | Sous-domaine d'envoi distinct       | `lettre.adamesg-os.fr`, refus codés dans `lib/lettre/config.ts`          |
| 7   | Outil d'envoi choisi et configuré   | Resend, compte dédié, `lib/lettre/envoi.ts`, console `/admin/lettre`     |

La liste vit dans une base dédiée, physiquement séparée du projet partagé
`strata-scope` (XINV-22, XDEC-38). Migration : `packages/db/migrations-lettre/0001_lettre.sql`.

---

## 1. L'outil d'envoi

Relevé des paliers gratuits le 13 septembre 2026, sur les pages tarifaires des
éditeurs et deux comparatifs datés. Un palier gratuit change sans préavis : il se
relit le jour de l'inscription.

| Critère              | Resend                                                                                         | Brevo                                                                                   | MailerLite                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Palier gratuit       | 3 000 envois par mois, 100 par jour, 30 jours de journaux                                      | 300 envois par jour                                                                     | 2 500 envois par mois depuis juin 2026                                 |
| Limite d'adresses    | 1 000 contacts marketing ; aucune si la liste reste dans notre base                            | 100 000 contacts                                                                        | 250 abonnés actifs depuis juin 2026                                    |
| Sous-domaine         | Recommandé par l'éditeur. DKIM `resend._domainkey`, MX et SPF sur `send`, région UE disponible | Authentification de domaine par code, DKIM et DMARC, sous-domaine possible              | Authentification de domaine ; domaine personnalisé exigé pour délivrer |
| Double confirmation  | Pas de formulaire natif : elle se construit dans le site, ce qui garde la preuve chez nous     | Native dans ses formulaires, la preuve reste chez l'éditeur                             | Native dans ses formulaires, la preuve reste chez l'éditeur            |
| Marque de l'éditeur  | Aucune                                                                                         | Logo Brevo dans les envois du palier gratuit                                            | Mention de l'éditeur sur le palier gratuit                             |
| Croisement STRATA    | Le compte existant porte `esg-optimizer.fr`, les liens d'inscription du produit                | Un compte Brevo est rattaché à `strata-esg.fr` (code de vérification et rapports DMARC) | Aucun                                                                  |
| Société et transfert | États-Unis, envoi depuis la région UE, clauses contractuelles types et cadre UE et États-Unis  | France, Union européenne                                                                | Lituanie, Union européenne                                             |

**Recommandation : Resend, dans un compte dédié à ADAMA, jamais le compte qui
porte `esg-optimizer.fr`.**

Raison, en trois points. La double confirmation et la provenance restent dans
notre base, donc la liste est cessible et portable sans exporter quoi que ce
soit d'un éditeur (EK7). Le palier gratuit couvre la phase de patience : une
confirmation, une bienvenue et une note par trimestre tiennent sous 100 envois
par jour tant que la liste compte moins de 80 adresses, et au-delà la console
étale la note sur plusieurs jours sans doublon. Aucune marque d'éditeur
n'apparaît dans une lettre dont l'argument est la sobriété.

Pourquoi un compte dédié : une suspension pour abus frappe le compte, pas le
domaine. La leçon est déjà écrite dans la page CRM « Second domaine d'envoi » :
un domaine rangé dans le même tiroir que celui qui compte n'est plus isolé.
Une lettre signalée ne doit jamais pouvoir couper les liens d'inscription
d'ESG Optimizer.

Brevo est écarté pour deux raisons : le logo sur le palier gratuit, et le
compte déjà rattaché au domaine commercial de STRATA, qui rend le mélange facile
un soir de lancement. MailerLite est écarté par son plafond de 250 abonnés.

## 2. La page `/lettre`

- **Un seul champ** : l'adresse e-mail. Aucun prénom, aucune entreprise.
- **La case**, jamais précochée, texte versionné `EH0-1` :
  « J'accepte de recevoir SIGNAL, la lettre d'ADAMA OS, et en attendant sa
  parution une note courte par trimestre. Je peux me désinscrire en un clic à
  tout moment. »
- **La mention courte**, sous le champ : « Adama Diallo, entrepreneur
  individuel, traite cette adresse pour vous envoyer SIGNAL, sur la base de
  votre consentement. Elle n'est jamais cédée ni versée à une autre liste, et
  elle est effacée dès votre désinscription. La mention complète, plus bas,
  donne les durées et vos droits. »
- **La réponse** est la même pour une adresse nouvelle, en attente ou déjà
  confirmée : la page ne sert pas à savoir qui est inscrit.
- **La collecte est fermée** tant que `LETTRE_COLLECTE` ne vaut pas `ouverte`.
  La page, le texte et la mention sont en ligne dès le déploiement, champ et
  case inactifs, pour être relus.

Changer une virgule du texte de la case ou de la mention courte impose une
version nouvelle (`EH0-2`), ajoutée par migration. L'ancienne reste en base,
immuable. Le test `tests/lettre-sql.test.ts` échoue si le texte du site et le
texte semé en base divergent.

## 3. La mention légale

| Rubrique                  | Contenu                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsable de traitement | Adama Diallo, entrepreneur individuel, SIREN 913518031, qui porte ADAMA OS EXPANSION (XDEC-33, XDEC-41)                                                                                   |
| Finalité                  | Envoyer SIGNAL et, tant qu'elle ne paraît pas, une note courte par trimestre. Aucune prospection, aucun profilage, aucune mesure d'ouverture ni de clic                                   |
| Base légale               | Consentement, case cochée puis lien confirmé                                                                                                                                              |
| Données                   | Adresse, version du consentement, page, site référent et paramètres de campagne, dates, empreinte non réversible de l'adresse IP                                                          |
| Destinataires             | Adama Diallo seul. Sous-traitants : Resend, Supabase (projet dédié), Vercel                                                                                                               |
| Transfert                 | Resend et Vercel, sociétés établies aux États-Unis ; clauses contractuelles types, et cadre UE et États-Unis pour Resend                                                                  |
| Conservation              | 30 jours sans confirmation ; tant que l'inscription dure ; à la désinscription, adresse effacée aussitôt, empreinte et dates gardées 3 ans pour la preuve                                 |
| Droits                    | Accès, rectification, effacement, limitation, opposition, portabilité, retrait ; lien de chaque message ou message au contact ; réponse sous quinze jours ; réclamation auprès de la CNIL |
| Changement de structure   | Information avant tout transfert à une société détenue par Adama Diallo, avec possibilité de se désinscrire avant                                                                         |

Où elle s'affiche, en quatre endroits :

1. **Sous le champ**, en version courte, avec la version du consentement.
2. **Sur la page `/lettre`**, en entier, ancre `#mention`, avant tout pied de page.
3. **Sur `/confidentialite`**, dans la liste des traitements, avec un lien vers la mention complète.
4. **En pied de chaque message** : responsable, absence de pistage, lien de désinscription en un clic et lien vers la mention.

Les durées ne sont pas des vœux : `/api/lettre/sync` appelle chaque jour
`lettre_purger()`, qui les applique.

## 4. Le DNS du sous-domaine d'envoi

Sous-domaine retenu : **`lettre.adamesg-os.fr`**. Expéditeur :
`Adama Diallo <signal@lettre.adamesg-os.fr>`. Réponses vers le contact du site.

État relevé le 13 septembre 2026 : zone chez OVH (`dns111.ovh.net`,
`ns111.ovh.net`), messagerie de la racine chez OVH, SPF de la racine
`v=spf1 include:mx.ovh.com -all`, aucun DMARC, aucun enregistrement sous
`lettre`. **La racine ne se touche pas** : aucun enregistrement de Resend ne va
sur `adamesg-os.fr` lui-même.

Syntaxe de l'éditeur de zone OVH, champ « Sous-domaine » relatif à
`adamesg-os.fr`. Resend indique, pour un sous-domaine, de coller `send.lettre`
et non `send.lettre.adamesg-os.fr`.

| Ordre | Type  | Sous-domaine OVH           | Priorité | Cible                                                               | Connue quand                                    |
| ----- | ----- | -------------------------- | -------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| 1     | TXT   | `resend._domainkey.lettre` |          | `p=` suivi de la clé publique                                       | **Après l'ajout du domaine dans Resend**        |
| 2     | MX    | `send.lettre`              | 10       | `feedback-smtp.eu-west-1.amazonses.com.`                            | Forme publiée par Resend, à recopier du tableau |
| 3     | TXT   | `send.lettre`              |          | `v=spf1 include:amazonses.com ~all`                                 | Forme publiée par Resend, à recopier du tableau |
| 4     | TXT   | `_dmarc.lettre`            |          | `v=DMARC1; p=none; rua=mailto:dmarc@adamesg-os.fr; adkim=s; aspf=r` | Maintenant                                      |
| 5     | CNAME | `lettre`                   |          | valeur affichée par Vercel pour le domaine `lettre.adamesg-os.fr`   | Après l'ajout du domaine dans Vercel            |

La clé DKIM n'est pas écrite ici : elle n'existe qu'une fois le domaine ajouté
dans le compte Resend dédié, et une clé inventée ferait échouer la vérification.
Le MX et le SPF suivent la forme que Resend publie pour la région Irlande ; si
le tableau affiché par Resend diffère, **c'est le tableau de Resend qui fait foi**.

En mode textuel de la zone OVH, les mêmes lignes :

```text
resend._domainkey.lettre  IN TXT   "p=<clé affichée par Resend>"
send.lettre               IN MX    10 feedback-smtp.eu-west-1.amazonses.com.
send.lettre               IN TXT   "v=spf1 include:amazonses.com ~all"
_dmarc.lettre             IN TXT   "v=DMARC1; p=none; rua=mailto:dmarc@adamesg-os.fr; adkim=s; aspf=r"
```

Le point final de la cible MX est obligatoire chez OVH : sans lui, la zone
ajoute `adamesg-os.fr` au bout.

**Ce qu'on vérifie après chaque pose**, d'abord sur le serveur faisant autorité
(aucun cache), puis sur un résolveur public :

```powershell
# 1. DKIM
Resolve-DnsName resend._domainkey.lettre.adamesg-os.fr -Type TXT -Server dns111.ovh.net
Resolve-DnsName resend._domainkey.lettre.adamesg-os.fr -Type TXT -Server 1.1.1.1
# attendu : une seule chaîne qui commence par p=, identique à celle de Resend

# 2. MX de retour
Resolve-DnsName send.lettre.adamesg-os.fr -Type MX -Server dns111.ovh.net
# attendu : NameExchange feedback-smtp.eu-west-1.amazonses.com, Preference 10, et rien sous adamesg-os.fr

# 3. SPF du sous-domaine
Resolve-DnsName send.lettre.adamesg-os.fr -Type TXT -Server dns111.ovh.net
# attendu : exactement un enregistrement v=spf1, jamais deux

# 3 bis. La racine n'a pas bougé
Resolve-DnsName adamesg-os.fr -Type TXT -Server 1.1.1.1
# attendu : toujours v=spf1 include:mx.ovh.com -all, seul SPF de la racine

# 4. DMARC
Resolve-DnsName _dmarc.lettre.adamesg-os.fr -Type TXT -Server dns111.ovh.net
# attendu : v=DMARC1; p=none; rua=mailto:dmarc@adamesg-os.fr; adkim=s; aspf=r
```

Après les poses 1 à 3 : bouton « Verify » dans Resend, statut `Verified` pour
DKIM, SPF et MX. **Aucun envoi réel avant ce statut.**

Après la pose 4 : l'adresse de rapport doit exister. Créer chez OVH une
redirection `dmarc@adamesg-os.fr` vers l'adresse de contact. Une adresse de
rapport sur un autre domaine exigerait une autorisation que Gmail ne publie pas,
et les rapports ne partiraient pas.

Test final, avant d'ouvrir la collecte : s'inscrire avec une adresse Gmail,
ouvrir le message, « Afficher l'original ». Trois lignes doivent dire `PASS` :
SPF, DKIM (`d=lettre.adamesg-os.fr`), DMARC. Si l'une manque, la collecte ne
s'ouvre pas.

DMARC reste à `p=none` tant que deux relevés de rapports n'ont montré aucun
échec d'alignement. Il passe ensuite à `p=quarantine`, par décision écrite à la
revue de trimestre.

## 5. La table de provenance, champ par champ

Table `lettre_abonnes`, une ligne par adresse. L'historique complet est dans
`lettre_evenements`, en ajout seul.

| Champ                      | Type        | Rôle                                                                       | Contrainte                                        |
| -------------------------- | ----------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| `id`                       | uuid        | Identifiant, signé dans le lien de désinscription                          | clé primaire                                      |
| `liste`                    | text        | La seule liste possible                                                    | `= 'ADAMA_SIGNAL'`                                |
| `email`                    | text        | Adresse normalisée, effacée à la désinscription                            | minuscules, forme d'adresse, nulle si désinscrite |
| `email_empreinte`          | text        | HMAC de l'adresse avec un secret absent de la base : retrouve sans exposer | unique, 64 hexadécimaux                           |
| `statut`                   | text        | `en_attente`, `confirme`, `desinscrit`, `expire`                           | cohérence imposée par statut                      |
| `cycle`                    | integer     | Numéro d'inscription, qui augmente à chaque retour après départ            | au moins 1                                        |
| `mode_collecte`            | text        | Comment l'adresse est entrée                                               | **`= 'formulaire'`, aucun import possible**       |
| `surface`                  | text        | La surface de collecte                                                     | `page_lettre`                                     |
| `chemin`                   | text        | Le chemin exact de la page                                                 | `/lettre`                                         |
| `referent_hote`            | text        | Le seul nom de domaine d'où venait la personne                             | sans chemin ni requête                            |
| `campagne`                 | jsonb       | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`                  | aucune autre clé                                  |
| `langue`                   | text        | Langue de la page lue                                                      | `fr` ou `en`                                      |
| `consentement_version`     | text        | Version exacte du texte coché                                              | clé étrangère vers `lettre_consentements`         |
| `ip_empreinte`             | text        | HMAC de l'adresse IP de la demande                                         | jamais l'adresse IP en clair                      |
| `demande_le`               | timestamptz | Date de la demande du cycle en cours                                       | non nulle                                         |
| `jeton_empreinte`          | text        | SHA-256 du jeton de confirmation                                           | unique, nul hors attente                          |
| `jeton_expire_le`          | timestamptz | Fin de validité du lien, sept jours                                        | présente en attente                               |
| `confirmations_envoyees`   | integer     | Nombre de messages de confirmation partis dans le cycle                    | 0 à 3                                             |
| `derniere_confirmation_le` | timestamptz | Dernier envoi de confirmation, pour le rythme de dix minutes               |                                                   |
| `confirme_le`              | timestamptz | Preuve de la double confirmation                                           | présente si confirmée                             |
| `confirme_ip_empreinte`    | text        | HMAC de l'adresse IP du clic de confirmation                               |                                                   |
| `bienvenue_envoyee_le`     | timestamptz | Le message de bienvenue unique est parti                                   |                                                   |
| `desinscrit_le`            | timestamptz | Date du retrait                                                            | présente si désinscrite                           |
| `motif_desinscription`     | text        | `lien`, `en_tete_un_clic`, `demande_ecrite`, `rebond`, `plainte`           | présent si désinscrite                            |
| `cree_le`, `modifie_le`    | timestamptz | Horodatage technique                                                       | déclencheur                                       |

Tables voisines : `lettre_consentements` (texte et empreinte de chaque version,
immuable), `lettre_evenements` (journal, sans adresse en clair, immuable),
`lettre_notes` (notes trimestrielles, sans date, figées une fois parties),
`lettre_envois` (une ligne par destinataire et par note, envoi reprenable).

## 6. Le message de bienvenue automatique unique

Objet : « SIGNAL, votre inscription est confirmée ».

> Votre inscription à SIGNAL est confirmée. Merci d'avoir pris ce temps.
>
> Une chose doit être dite tout de suite : cette lettre n'a pas encore commencé
> à paraître. Elle ouvrira quand son rythme pourra être tenu, et aucune date
> n'est annoncée d'ici là, parce qu'une date manquée coûte plus cher qu'une
> date absente.
>
> En attendant, une note courte vous parviendra une fois par trimestre. Trois
> paragraphes : ce qui a été décidé, ce qui a échoué, et où en est la
> préparation de la lettre. Rien d'autre ne partira vers votre adresse.
>
> Le travail, lui, se publie déjà en continu. Le journal de construction, les
> décisions d'architecture et les revirements sont en ligne, avec leurs preuves.
>
> Vous pouvez partir à tout moment, en un clic, par le lien placé en bas de
> chaque message.

Suivi des trois liens `/journal`, `/decisions`, `/revirements`, de la signature
et du pied légal. Le test `tests/lettre.test.ts` passe ce texte au contrôle
« sans date ni délai » à chaque exécution.

## 7. La note trimestrielle de patience

Quinze minutes par trimestre, au créneau du mercredi qui suit la revue. Trois
paragraphes, sans date, rédigés dans `/admin/lettre`, qui les contrôle pendant
la frappe.

```text
Objet : SIGNAL, la note du trimestre

CE QUI A ÉTÉ DÉCIDÉ
[Une décision prise ce trimestre, ce qu'elle écarte, et le lien vers sa trace
publique sur adamesg-os.fr. Entre 120 et 900 caractères.]

CE QUI A ÉCHOUÉ
[Un échec réel, ce qu'il a coûté et ce qui en est gardé. Aucun client, aucun
prospect, aucune donnée de dossier, aucun montant. Entre 120 et 900 caractères.]

OÙ EN EST LA LETTRE
[Ce qui avance vers la première lettre et ce qui manque encore. Aucune date,
aucun délai. Entre 120 et 900 caractères.]
```

Le geste, dans l'ordre : rédiger, cocher la relecture de désidentification,
enregistrer, « M'envoyer un essai », relire l'essai dans la messagerie, puis
« Envoyer le lot du jour ». La base refuse une note qui porte une année, un mois
ou un jour de la semaine, et une note non relue ne part pas. Au-delà de 80
destinataires, le lot suivant part le lendemain depuis le même bouton, et
personne ne reçoit deux fois la même note.

Question ouverte de la page 20, section XII, reprise ici : si les
désinscriptions dépassent un quart de la liste à une revue, la collecte se ferme
jusqu'à EX1. Le geste est de retirer `LETTRE_COLLECTE` et de redéployer.

## 8. Mise en service, samedi 3 octobre 2026

Le code est déployé collecte fermée. Rien ne s'ouvre avant le 1er octobre 2026
(XDEC-06). Chaque étape a sa preuve ; une étape sans preuve arrête la séquence.

**1. Compte Resend dédié.** Créer un compte sur resend.com avec un identifiant
qui n'est pas celui du compte qui porte `esg-optimizer.fr`. Domains, Add
Domain, `lettre.adamesg-os.fr`, région `eu-west-1` (Irlande). Vérifier que
Open Tracking et Click Tracking sont désactivés.
Preuve : le domaine apparaît en attente, avec son tableau de trois enregistrements.

**2. DNS.** Poser les enregistrements 1 à 4 de la section 4, dans l'ordre, avec
la vérification après chaque pose. Créer la redirection OVH
`dmarc@adamesg-os.fr`. Verify dans Resend.
Preuve : statut `Verified`.

**3. Projet Supabase dédié.** Nouveau projet `adama-lettre`, région West EU
(Irlande), mot de passe fort rangé dans le coffre. SQL Editor, coller
`packages/db/migrations-lettre/0001_lettre.sql`, exécuter.
Preuve : le contrôle a rend cinq lignes `rls = true`, `politiques = 0` ; le
contrôle b rend zéro ligne ; le contrôle c rend `EH0-1` et son empreinte.

**4. Clés.** Resend, API Keys, Create : permission « Sending access », domaine
`lettre.adamesg-os.fr`. Supabase du projet dédié, Settings, API : URL et clé
secrète. Générer le secret HMAC :

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**5. Variables de production**, collecte encore fermée :

```powershell
cd C:\Dev\adama-os\apps\web
vercel env add LETTRE_SUPABASE_URL production
vercel env add LETTRE_SUPABASE_SERVICE_ROLE_KEY production
vercel env add LETTRE_RESEND_API_KEY production
vercel env add LETTRE_EXPEDITEUR production
vercel env add LETTRE_SECRET production
vercel env add LETTRE_ADMINISTRATEURS production
vercel --prod
```

Valeur de `LETTRE_EXPEDITEUR` : `Adama Diallo <signal@lettre.adamesg-os.fr>`.
Valeur de `LETTRE_ADMINISTRATEURS` : l'adresse du compte de connexion de `/admin`.
Preuve : `/admin/lettre` affiche « Configuration complète », « Collecte fermée »,
et l'état de la liste à zéro.

**6. Entretien quotidien.**

```powershell
curl.exe -s -H "Authorization: Bearer <CRON_SECRET>" https://adamesg-os.fr/api/lettre/sync
```

Preuve : une réponse `{"ok":true,...}` avec le bilan de purge. La tâche Vercel
tourne ensuite chaque jour à 05 h 30 UTC.

**7. Ouverture et essai de bout en bout.**

```powershell
vercel env add LETTRE_COLLECTE production
vercel --prod
```

Valeur : `ouverte`. Puis, avec sa propre adresse Gmail :

1. `/lettre`, saisir l'adresse, cocher, envoyer.
2. Message de confirmation reçu. « Afficher l'original » : SPF, DKIM, DMARC à `PASS`.
3. Ouvrir le lien, appuyer sur « Confirmer mon inscription ». La page dit « Inscription confirmée ».
4. Message de bienvenue reçu. Gmail affiche « Se désinscrire » à côté de l'expéditeur.
5. Cliquer le lien de désinscription du message. La page dit « Désinscription enregistrée ».
6. Se réinscrire et confirmer : la première adresse de la liste est la sienne.

Si une seule étape échoue : `vercel env rm LETTRE_COLLECTE production`, puis
`vercel --prod`. La collecte est refermée, et rien n'a été collecté à tort.

**8. Trace.** Écrire au chantier EH0 de la base Chantiers Expansion : les trois
`PASS`, l'identifiant du message de bienvenue, la capture de l'état de
`/admin/lettre`. Passer EH0 à Fait.

## 9. Vérifications locales

Tests unitaires, sans réseau ni compte :

```powershell
cd C:\Dev\adama-os\apps\web
node node_modules/vitest/vitest.mjs run tests/vocabulaire.test.ts tests/lettre.test.ts tests/lettre-sql.test.ts tests/lettre-parcours.test.ts tests/lettre-page.test.tsx tests/angles-preuves.test.ts
```

Scénario SQL sur Postgres jetable, 39 contrôles, mode d'emploi en tête de
`packages/db/migrations-lettre/verification.sql`.

Bout en bout contre un vrai PostgREST, outil d'envoi simulé :

```powershell
docker network create lettre-net
docker run -d --name lettre-pg --network lettre-net -e POSTGRES_PASSWORD=essai postgres:17-alpine
docker exec lettre-pg psql -U postgres -c "create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create role authenticator login password 'auth' noinherit; grant anon, authenticated, service_role to authenticator; create schema extensions;"
docker cp ..\..\packages\db\migrations-lettre\0001_lettre.sql lettre-pg:/tmp/m.sql
docker exec lettre-pg psql -U postgres -v ON_ERROR_STOP=1 -f /tmp/m.sql
docker run -d --name lettre-rest --network lettre-net -p 55434:3000 -e PGRST_DB_URI=postgres://authenticator:auth@lettre-pg:5432/postgres -e PGRST_DB_SCHEMAS=public -e PGRST_DB_ANON_ROLE=anon -e PGRST_JWT_SECRET=secret-jwt-local-de-test-au-moins-32-caracteres postgrest/postgrest:v12.2.3
$env:ADAMA_TEST_LETTRE_REST = "http://localhost:55434"
$env:ADAMA_TEST_LETTRE_JWT = "<jeton HS256 portant role=service_role, signé avec le secret ci-dessus>"
node node_modules/vitest/vitest.mjs run tests/lettre.integration.test.ts
docker rm -f lettre-rest lettre-pg; docker network rm lettre-net
```

## 10. Ce que la plomberie refuse, et où le refus est écrit

| Refus                                                   | Où                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| Une base de lettre qui serait le projet partagé         | `lib/lettre/config.ts` et premier bloc de la migration          |
| Un expéditeur sur la racine ou sur un domaine de STRATA | `lib/lettre/config.ts`, rejoué par `lib/lettre/envoi.ts`        |
| Une adresse entrée autrement que par le formulaire      | contrainte `mode_collecte`, aucune fonction d'import            |
| Une confirmation par simple ouverture du lien           | `app/api/lettre/route.ts`, bouton sur la page                   |
| Un message de liste sans désinscription en un clic      | `charge()` dans `lib/lettre/envoi.ts`                           |
| Une adresse en clair dans le journal                    | contrainte `lettre_evenements_sans_adresse`                     |
| Une note datée, non relue, ou réécrite après envoi      | contraintes et déclencheur de `lettre_notes`                    |
| Un compteur d'inscrits publié                           | aucune lecture publique de la base dédiée, console privée seule |
| Un compte de session qui n'est pas nommé administrateur | `estAdministrateur()`, `LETTRE_ADMINISTRATEURS`                 |

L'ancien formulaire de l'accueil écrivait dans la table `leads` du projet
partagé, sans consentement ni double confirmation. Il est remplacé par un renvoi
vers `/lettre`. Relevé en lecture seule le 13 septembre 2026 : la table `leads`
ne contenait aucune ligne. Rien n'a été migré, et rien ne le sera.

## 11. Les demandes de conseil, EG0, même projet dédié

Les demandes recevables de `/travaillez-avec-moi` vivent dans le projet
Supabase de la lettre, jamais dans `strata-scope` (protection 4 de la branche
EK). Une demande que la règle d'acceptation refuse n'est jamais enregistrée.

1. Dans l'éditeur SQL du projet dédié, jouer
   `packages/db/migrations-lettre/0002_conseil.sql`. Les contrôles en fin de
   fichier doivent rendre deux tables à RLS active sans politique, puis zéro
   fonction exécutable par `anon`.
2. Poser `CONSEIL_DEMANDES=ouvertes` en Production sur Vercel, puis
   redéployer.
3. Essai de bout en bout : une demande recevable depuis une navigation
   privée. Preuve : la notification arrive dans la boîte de l'éditeur, et la
   demande apparaît sur `/admin/demandes`. L'effacer ensuite depuis la
   console.

Tant que l'étape 2 n'est pas faite, le formulaire qualifie la demande puis
propose un courriel pré-rempli : rien n'est enregistré.

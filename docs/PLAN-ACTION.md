# Plan d'action, Adama OS

> Établi le 19 juillet 2026, après le recentrage sur le périmètre groupe IROKO SOFTWARE GROUP.
> Toutes les commandes sont en PowerShell, depuis Windows. Repo : `C:\Dev\adama-os`, branche `main`.
> À faire dans l'ordre. Les étapes 1 à 4 sont bloquantes ou à fort impact, le reste peut attendre.

---

## Étape 0. Vérifier ton environnement local

Tes fichiers `.env` locaux n'existent pas dans le repo. Sans eux, aucune commande de base de données ni d'ingestion ne tournera.

```powershell
cd C:\Dev\adama-os

# Vérifier ce qui manque
Test-Path "apps\web\.env.local"
Test-Path "packages\db\.env"
```

Si l'un des deux renvoie `False`, crée-le à partir de son modèle :

```powershell
Copy-Item "apps\web\.env.example" "apps\web\.env.local"
Copy-Item "packages\db\.env.example" "packages\db\.env"
```

Puis ouvre les deux fichiers et renseigne les valeurs. La liste complète des clés, avec leur rôle et si elles sont exposées au navigateur, est dans `docs/SECRETS.md`.

Minimum vital pour que le dashboard tourne en local :

| Fichier | Clés à renseigner |
| --- | --- |
| `apps\web\.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `DATABASE_URL` |
| `packages\db\.env` | `DATABASE_URL`, `OPENAI_API_KEY` |

`DATABASE_URL` : Supabase → ton projet → Project Settings → Database → Connection string → **Transaction pooler**. Mot de passe inclus dans l'URL.

Vérifie ensuite que tout démarre :

```powershell
pnpm install
pnpm dev
```

Ouvre `http://localhost:3000`. Si le dashboard s'affiche, tu es bon.

---

## Étape 1. Commiter la documentation mise à jour

**Attention, piège.** `git status` remonte tout le repo comme modifié, y compris des fichiers que personne n'a touchés (`turbo.json`, `packages/ui/src/lib/cn.ts`, etc.). Ce ne sont pas de vraies modifications : c'est une conversion de fins de ligne CRLF vers LF. Si tu fais `git add .`, tu noies ton travail dans 90 fichiers de bruit et le diff devient illisible.

Stage donc uniquement les fichiers réellement modifiés :

```powershell
cd C:\Dev\adama-os

git add README.md ROADMAP.md ADAMA_OS_BLUEPRINT.md .gitignore .prettierignore docs/

# Vérifier ce qui va partir (doit lister 9 fichiers, pas 90)
git status --short
```

Tu dois voir exactement ceci :

```
M  .gitignore
M  .prettierignore
M  ADAMA_OS_BLUEPRINT.md
M  README.md
M  ROADMAP.md
M  docs/ECOSYSTEME-STRATA.md
M  docs/PHASE-0-L1-DONNEES.md
M  docs/PHASE-0-SETUP.md
M  docs/SECRETS.md
A  docs/PLAN-ACTION.md
```

Si c'est bon :

```powershell
git commit -m "docs: alignement sur le perimetre groupe IROKO, retrait des references mortes (engine, Railway, Sanity, Polar, Mistral)"
git push origin main
```

---

## Étape 2. Le domaine (L0-T6), la priorité absolue

C'est le seul reste de la Phase 0 et il bloque tout partage externe. Un dashboard sur une URL `vercel.app` perd une grande partie de son effet auprès d'un recruteur.

**2.1. Acheter le domaine.** Chez OVH, Namecheap ou Cloudflare Registrar. Prends quelque chose de court et prononçable à l'oral en entretien.

**2.2. Ajouter le domaine dans Vercel.**

1. Vercel → projet `adama-os` → Settings → Domains.
2. Ajouter le domaine racine (ex : `tondomaine.fr`) **et** `www.tondomaine.fr`.
3. Vercel affiche les enregistrements DNS à créer. **Recopie les valeurs affichées par Vercel**, ne recopie pas des valeurs trouvées ailleurs, elles changent.

**2.3. Créer les enregistrements chez ton registrar.** Zone DNS → ajouter l'enregistrement A pour l'apex et le CNAME pour `www`, tels que donnés par Vercel. La propagation prend de quelques minutes à quelques heures.

**2.4. Choisir la redirection canonique.** Dans Vercel, décide si `www` redirige vers l'apex ou l'inverse, et n'en change plus. Le HTTPS s'active automatiquement via Let's Encrypt.

**2.5. Ajouter la variable d'environnement.**

Vercel → Settings → Environment Variables → ajouter :

```
NEXT_PUBLIC_SITE_URL = https://tondomaine.fr
```

Sur les trois environnements (Production, Preview, Development).

**2.6. Faire le ménage dans le code.** Le sitemap, le robots.txt, les métadonnées Open Graph et le JSON-LD doivent utiliser cette origine et non une URL `vercel.app`. Colle le **prompt L0** de `ROADMAP.md` (Partie 7) dans Claude Code, il fait l'audit et le diff.

**2.7. Vérifier.** Une fois déployé :

```powershell
start https://tondomaine.fr/sitemap.xml
start https://tondomaine.fr/robots.txt
```

Aucune URL `vercel.app` ne doit apparaître dedans.

---

## Étape 3. Ingérer le corpus RAG (L3-T1)

Toute la chaîne RAG est codée et branchée. La base vectorielle est vide. C'est ce qui sépare un agent démontrable d'un agent muet.

**3.1. Récupérer les documents.** Tu n'as aujourd'hui que ton CV en PDF dans le repo. Il te faut au minimum :

| Document | Où le trouver |
| --- | --- |
| Normes ESRS (Set 1) | efrag.org, section Sustainability Reporting, téléchargement des ESRS |
| Standard VSME | efrag.org, VSME Standard |
| Ton CV | déjà présent : `apps\web\public\adama-diallo-cv.pdf` |
| Notice méthodologique ESG Optimizer | `C:\Dev\ESG-Optimizer\Notice_methodologique_ESG_Optimizer.pdf` |

Range-les dans un dossier de travail, par exemple `C:\Dev\adama-os\corpus\` (déjà ignoré par git si tu ajoutes `corpus/` au `.gitignore`, ce que je te conseille pour ne pas versionner des PDF lourds).

**3.2. Durcir le script avant de le lancer.** Colle le **prompt L3** de `ROADMAP.md` (Partie 7) dans Claude Code. Il audite l'idempotence, la gestion d'erreurs, le coût, et ajoute une commande de vérification.

**3.3. Ingérer, document par document.** Le script prend un fichier à la fois, avec une source et une langue :

```powershell
cd C:\Dev\adama-os

pnpm --filter @adama/db rag:ingest -- "corpus\ESRS-Set1.pdf" --source ESRS --lang fr --title "ESRS Set 1"
pnpm --filter @adama/db rag:ingest -- "corpus\VSME-Standard.pdf" --source VSME --lang fr --title "Standard VSME"
pnpm --filter @adama/db rag:ingest -- "apps\web\public\adama-diallo-cv.pdf" --source CV --lang fr --title "CV Adama Diallo"
```

L'ingestion est idempotente : ré-ingérer un document avec la même source et le même titre remplace l'ancien et supprime ses chunks. Tu peux relancer sans crainte de doublon.

**3.4. Vérifier que le retrieval fonctionne.** Lance `pnpm dev`, ouvre le dashboard, appelle adama.ai (ou `Ctrl+K` puis `ask adama`) et pose trois questions dont tu connais la réponse, par exemple :

- « Que couvre l'ESRS E1 ? »
- « Quelles sont les obligations du standard VSME pour une PME de 40 salariés ? »
- « Quelle est mon expérience en ESG ? »

Chaque réponse doit citer ses sources. Si l'agent refuse de répondre, c'est que l'ingestion n'a pas abouti, pas que le garde-fou est trop strict.

---

## Étape 4. Créer les funnels PostHog (L8-T7)

Il n'y a rien à coder. Les événements sont déjà émis par l'application. Il manque uniquement la configuration dans l'interface.

**4.1. Prérequis.** `NEXT_PUBLIC_POSTHOG_KEY` doit être renseignée dans Vercel. Sans elle, l'analytics est inactif et aucun événement ne remonte.

PostHog → Project Settings → Project API Key. Colle-la dans Vercel → Settings → Environment Variables. Vérifie aussi que `NEXT_PUBLIC_POSTHOG_HOST` vaut `https://eu.i.posthog.com` (région UE, obligatoire pour ta position RGPD).

**4.2. Vérifier que les événements arrivent.** PostHog → Activity. Ouvre ton dashboard en navigation privée, accepte le bandeau de consentement, clique sur « Recruter l'Architecte ». Tu dois voir apparaître `recruiter_intent`.

**4.3. Créer le funnel recrutement.** PostHog → Product Analytics → New insight → Funnel.

| Étape | Événement |
| --- | --- |
| 1 | `$pageview` |
| 2 | `recruiter_intent` |
| 3 | `cv_download` ou réservation Cal.com |

Fenêtre de conversion : 1 jour. Enregistre sous « Funnel recrutement ».

**4.4. Créer le funnel produit.**

| Étape | Événement |
| --- | --- |
| 1 | `$pageview` |
| 2 | `strata_outbound` (deviendra `ecosystem_outbound` après L6-T14) |

Ajoute une décomposition (breakdown) par `product` pour voir quel produit attire le plus. Enregistre sous « Funnel produit ».

---

## Étape 5. Les chantiers de code, dans l'ordre

Chacun a un prompt expert prêt à coller dans Claude Code, dans la **Partie 7 de `ROADMAP.md`**. Tu ouvres Claude Code à la racine `C:\Dev\adama-os`, tu colles le prompt, tu relis le diff.

| Ordre | Chantier | Prompt | Pourquoi maintenant |
| --- | --- | --- | --- |
| 1 | **L5-T2, feed Shipped multi-repo** | Prompt L5 | Ton feed ne lit qu'`adama-os`. L'essentiel de ton travail est dans `esg-optimizer`, `strata-scope`, `strata-watch`, `iroko-platform`. Tu affiches une fraction infime de ton exécution devant un recruteur. Meilleur rapport gain sur effort du repo. |
| 2 | **L1-T9 et L1-T10, registre produits et analytics groupe** | Prompt L1 | Prérequis technique des deux chantiers suivants. |
| 3 | **L4-T14, Couche D en vue groupe** | Prompt L4 | La Couche D montre encore une suite ESG, pas un groupe à quatre divisions. |
| 4 | **L6-T13 et L6-T14, hub écosystème** | Prompt L6 | `/strata` devient `/ecosysteme`, avec redirection 301 pour ne pas casser les liens déjà partagés. |
| 5 | **L8, durcissement** | Prompt L8 | Bilingue, SEO, accessibilité, perf, sécurité. C'est du P4, pas avant fin septembre. |
| 6 | **L7, média** | Prompt L7 | P4 également. Rien avant que les chantiers 1 à 4 soient faits. |

Pour le feed multi-repo (chantier 1), tu auras besoin d'un token GitHub :

1. github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens.
2. Portée : lecture seule (`Contents: Read-only`, `Metadata: Read-only`) sur les repos de l'organisation `iroko-software-group` et sur `adama-os`.
3. Colle-le dans Vercel sous `GITHUB_TOKEN` et dans `apps\web\.env.local` pour le local.

Sans token tu es limité à 60 requêtes par heure, ce qui ne suffit pas pour sept repos.

---

## Étape 6. Optionnel, régler les fins de ligne une bonne fois

Ton repo a été commité en CRLF depuis Windows et le working tree est passé en LF. Tant que ce n'est pas réglé, chaque `git status` remontera tout le repo comme modifié, et tu devras continuer à stager fichier par fichier.

Fais-le dans un commit **isolé**, jamais mélangé à du travail réel :

```powershell
cd C:\Dev\adama-os

# 1. Créer le fichier de normalisation
@"
* text=auto eol=lf
*.png binary
*.jpg binary
*.pdf binary
*.ico binary
"@ | Set-Content -Encoding utf8 .gitattributes

# 2. Renormaliser tout le repo
git add --renormalize .
git add .gitattributes

# 3. Commit dédié
git commit -m "chore: normalisation des fins de ligne en LF (.gitattributes)"
git push origin main
```

Après ça, `git status` sera propre et ne remontera que tes vraies modifications.

---

## Récapitulatif, ce qui te reste vraiment

| Action | Durée estimée | Impact |
| --- | --- | --- |
| Créer les `.env` locaux | 15 min | Bloquant pour tout le reste |
| Commiter la doc | 5 min | Trace de la décision |
| Acheter et brancher le domaine | 1 h, plus la propagation DNS | **Bloquant pour tout partage externe** |
| Ingérer le corpus RAG | 2 h, dont le téléchargement des normes | Rend adama.ai démontrable |
| Configurer les funnels PostHog | 30 min | Mesure tes deux sorties |
| Feed multi-repo (prompt L5) | 1 séance | **Plus gros gain de crédibilité** |
| Registre produits, Couche D, hub (prompts L1, L4, L6) | 2 à 3 séances | Le dashboard raconte enfin le groupe |
| Normalisation des fins de ligne | 10 min | Confort quotidien |

Le trio qui débloque tout : **domaine, corpus RAG, feed multi-repo**. Le reste peut suivre son calendrier de phase.

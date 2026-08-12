# Phase 0, mise en place (L0 Infra)

Ordre exact des opérations. Tout part de la racine `C:\DEV\Adama OS`.

## 0. Prérequis (une fois)

```powershell
node -v            # doit afficher 20.9+ (idéalement 22)
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm -v            # doit afficher 9.15.4
```

## 1. Installer et tester en local

```powershell
cd "C:\DEV\Adama OS"
pnpm install
pnpm dev
```

Ouvrir http://localhost:3000 → la page "Adama OS" doit s'afficher.
Arrêter avec Ctrl+C.

## 2. shadcn/ui (L0-T4), style new-york, base color zinc

```powershell
cd "C:\DEV\Adama OS\apps\web"
pnpm dlx shadcn@latest init
```

Réponses :

- Style : **new-york** (si la question apparaît)
- Base color : **Zinc**
- CSS variables : **Yes**

Tester un composant :

```powershell
pnpm dlx shadcn@latest add button
```

## 3. Git + repo GitHub privé (L0-T1)

```powershell
cd "C:\DEV\Adama OS"
git init
git add .
git commit -m "chore: scaffold monorepo phase 0"
git branch -M main
```

Créer le repo **privé** `adama-os` sur https://github.com/new (ne rien cocher : pas de README, pas de .gitignore), puis :

```powershell
git remote add origin https://github.com/<ton-user>/adama-os.git
git push -u origin main
```

## 4. Vercel (L0-T5), web + preview deploys

1. https://vercel.com/new → importer `adama-os`.
2. **Root Directory** = `apps/web`.
3. Framework : Next.js (auto). Build : `next build` (auto). Install : `pnpm install` (auto).
4. Deploy.

Les preview deploys sur les PR sont activés par défaut. Vérifier :
créer une branche, pousser, ouvrir une PR → Vercel poste une URL de preview.

## 5. ~~Railway (L0-T7), engine FastAPI~~ ANNULÉ

Étape supprimée le 13 juillet 2026. `services/engine` faisait doublon avec le moteur carbone de STRATA Scope et aucune route web ne l'appelait. Le service a été retiré du repo, il n'y a plus rien à déployer sur Railway. Voir la couche L2 de `ROADMAP.md`.

## 6. Domaine + DNS (L0-T6), SEULE ÉTAPE RESTANTE DE LA PHASE 0

Quand le domaine est acheté (OVH ou autre registrar) :

1. Vercel → projet → Settings → Domains → ajouter le domaine (apex + `www`).
2. Vercel donne les enregistrements DNS (A `76.76.21.21` pour l'apex, CNAME `cname.vercel-dns.com` pour `www`). Vérifier les valeurs affichées par Vercel plutôt que de recopier celles-ci, elles peuvent changer.
3. Registrar → zone DNS → créer ces enregistrements.
4. HTTPS s'active automatiquement (Let's Encrypt via Vercel).
5. Choisir la redirection canonique (apex vers www, ou l'inverse) et s'y tenir.
6. Renseigner `NEXT_PUBLIC_SITE_URL` dans Vercel, puis vérifier que `app/sitemap.ts`, `app/robots.ts`, les métadonnées Open Graph et le JSON-LD utilisent bien cette origine et non une URL `vercel.app`.

## État cible atteint

`git push` sur `main` → déploie le web sur Vercel. PR → preview deploy.

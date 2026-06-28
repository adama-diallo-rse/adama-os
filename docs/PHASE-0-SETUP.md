# Phase 0 — Mise en place (L0 Infra)

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

## 2. shadcn/ui (L0-T4) — style new-york, base color zinc

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

## 4. Vercel (L0-T5) — web + preview deploys

1. https://vercel.com/new → importer `adama-os`.
2. **Root Directory** = `apps/web`.
3. Framework : Next.js (auto). Build : `next build` (auto). Install : `pnpm install` (auto).
4. Deploy.

Les preview deploys sur les PR sont activés par défaut. Vérifier :
créer une branche, pousser, ouvrir une PR → Vercel poste une URL de preview.

## 5. Railway (L0-T7) — engine FastAPI

1. https://railway.app → New Project → Deploy from GitHub repo → `adama-os`.
2. Dans Settings du service : **Root Directory** = `services/engine`.
3. Railway détecte Python (requirements.txt) et démarre via `railway.json`.
4. Generate Domain → tester `https://<url>.railway.app/health`.

## 6. Domaine + DNS (L0-T6) — plus tard (OVH)

Quand le domaine est acheté sur OVH :

1. Vercel → projet → Settings → Domains → ajouter le domaine.
2. Vercel donne les enregistrements DNS (A `76.76.21.21` pour l'apex, CNAME `cname.vercel-dns.com` pour `www`).
3. OVH → zone DNS → créer ces enregistrements.
4. HTTPS s'active automatiquement (Let's Encrypt via Vercel).

## État cible atteint

`git push` sur `main` → déploie web (Vercel) + engine (Railway). PR → preview deploy.

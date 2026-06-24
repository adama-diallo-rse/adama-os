# Adama Engine (FastAPI)

Service backend déployé sur Railway. Placeholder Phase 0.

## Lancer en local

```bash
cd services/engine
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Tester: http://localhost:8000/health doit renvoyer `{"status":"ok"}`.

## Déploiement Railway

Railway détecte Python via `requirements.txt` (builder Nixpacks) et démarre
avec la commande définie dans `railway.json` / `Procfile`.

Dans les réglages du service Railway, mettre **Root Directory = `services/engine`**.

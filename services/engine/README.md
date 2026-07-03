# Adama Engine (FastAPI)

Service backend déployé sur Railway.

## Structure

- `main.py` : app FastAPI et endpoints (`/health`, `POST /audit-express`)
- `schemas.py` : modèles Pydantic entrée/sortie
- `core/carbon.py` : calcul Scopes 1-2-3, fonctions pures, facteurs surchargeables
- `core/materiality.py` : matrice de double matérialité (CSRD)
- `tests/` : suite pytest

## Lancer en local

```bash
cd services/engine
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn main:app --reload --port 8000
```

Tester: http://localhost:8000/health doit renvoyer `{"status":"ok"}`.
Doc interactive: http://localhost:8000/docs

## Tests

```bash
cd services/engine
pytest
```

## Exemple audit express

```bash
curl -X POST http://localhost:8000/audit-express -H "Content-Type: application/json" -d "{\"company\":{\"name\":\"Demo\",\"sector\":\"services\",\"employees\":10},\"scope2\":{\"electricite_fr_kwh\":25000},\"purchases_eur\":100000,\"issues\":[{\"name\":\"Climat\",\"impact_score\":4,\"financial_score\":4}]}"
```

## Déploiement Railway

Railway détecte Python via `requirements.txt` (builder Nixpacks) et démarre
avec la commande définie dans `railway.json` / `Procfile`.

Dans les réglages du service Railway, mettre **Root Directory = `services/engine`**.

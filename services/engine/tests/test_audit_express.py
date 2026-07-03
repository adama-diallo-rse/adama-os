"""Tests de l'endpoint POST /audit-express."""

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def payload_complet() -> dict:
    return {
        "company": {
            "name": "Boulangerie Dupont",
            "sector": "commerce",
            "employees": 12,
            "revenue_eur": 850000,
        },
        "scope1": {"gaz_naturel_kwh": 45000, "diesel_l": 800},
        "scope2": {"electricite_fr_kwh": 30000},
        "purchases_eur": 320000,
        "travel": {"voiture_km": 9000},
        "issues": [
            {"name": "Climat", "impact_score": 4.5, "financial_score": 4.0},
            {"name": "Gaspillage alimentaire", "impact_score": 4.0, "financial_score": 2.5},
            {"name": "Mecenat local", "impact_score": 1.0, "financial_score": 0.5},
        ],
    }


class TestAuditExpressNominal:
    def test_status_200(self):
        assert client.post("/audit-express", json=payload_complet()).status_code == 200

    def test_calcul_carbone_coherent(self):
        data = client.post("/audit-express", json=payload_complet()).json()
        carbon = data["carbon"]
        # scope1 = 45000 * 0.204 + 800 * 2.68 = 11324 kg = 11.324 t
        assert carbon["scope1_t"] == pytest.approx(11.324)
        # scope2 = 30000 * 0.052 = 1.56 t
        assert carbon["scope2_t"] == pytest.approx(1.56)
        # scope3 = 320000 * 0.25 + 9000 * 0.193 = 81.737 t
        assert carbon["scope3_t"] == pytest.approx(81.737)
        assert carbon["total_t"] == pytest.approx(94.621)
        assert sum(carbon["breakdown_pct"].values()) == pytest.approx(100, abs=0.2)

    def test_intensites_presentes(self):
        carbon = client.post("/audit-express", json=payload_complet()).json()["carbon"]
        assert carbon["intensity_per_employee_t"] == pytest.approx(94.621 / 12, abs=0.01)
        assert carbon["intensity_kg_per_eur"] is not None

    def test_materialite(self):
        data = client.post("/audit-express", json=payload_complet()).json()
        mat = data["materiality"]
        assert mat["threshold"] == 3.0
        assert mat["top_issues"][0] == "Climat"
        quadrants = {i["name"]: i["quadrant"] for i in mat["issues"]}
        assert quadrants["Climat"] == "materialite_double"
        assert quadrants["Gaspillage alimentaire"] == "materialite_impact"
        assert quadrants["Mecenat local"] == "non_materiel"

    def test_recommandations_non_vides(self):
        data = client.post("/audit-express", json=payload_complet()).json()
        assert len(data["recommendations"]) >= 2
        assert any("scope3" in r for r in data["recommendations"])
        assert any("Climat" in r for r in data["recommendations"])


class TestAuditExpressCasLimites:
    def test_minimal_sans_donnees(self):
        resp = client.post("/audit-express", json={"company": {"name": "Test SARL"}})
        assert resp.status_code == 200
        data = resp.json()
        assert data["carbon"]["total_t"] == 0.0
        assert data["materiality"] is None
        assert data["carbon"]["intensity_per_employee_t"] is None
        assert len(data["recommendations"]) == 2

    def test_seuil_personnalise(self):
        body = payload_complet()
        body["materiality_threshold"] = 2.0
        mat = client.post("/audit-express", json=body).json()["materiality"]
        quadrants = {i["name"]: i["quadrant"] for i in mat["issues"]}
        assert quadrants["Gaspillage alimentaire"] == "materialite_double"


class TestAuditExpressValidation:
    def test_nom_entreprise_obligatoire(self):
        assert client.post("/audit-express", json={}).status_code == 422

    def test_cle_energie_inconnue_renvoie_422(self):
        body = payload_complet()
        body["scope1"] = {"charbon_kg": 100}
        resp = client.post("/audit-express", json=body)
        assert resp.status_code == 422
        assert "Cle inconnue" in resp.json()["detail"]

    def test_consommation_negative_renvoie_422(self):
        body = payload_complet()
        body["scope2"] = {"electricite_fr_kwh": -10}
        assert client.post("/audit-express", json=body).status_code == 422

    def test_score_hors_bornes_renvoie_422(self):
        body = payload_complet()
        body["issues"][0]["impact_score"] = 7
        assert client.post("/audit-express", json=body).status_code == 422

    def test_enjeu_en_double_renvoie_422(self):
        body = payload_complet()
        body["issues"].append({"name": "climat", "impact_score": 1, "financial_score": 1})
        resp = client.post("/audit-express", json=body)
        assert resp.status_code == 422
        assert "double" in resp.json()["detail"]

    def test_achats_negatifs_renvoie_422(self):
        body = payload_complet()
        body["purchases_eur"] = -1
        assert client.post("/audit-express", json=body).status_code == 422

"""Tests du module core.carbon."""

import pytest

from core.carbon import (
    CarbonFootprint,
    SCOPE1_FACTORS,
    compute_footprint,
    compute_scope1,
    compute_scope2,
    compute_scope3,
)


class TestScope1:
    def test_vide_donne_zero(self):
        assert compute_scope1({}) == 0.0

    def test_diesel_seul(self):
        assert compute_scope1({"diesel_l": 1000}) == pytest.approx(2680.0)

    def test_combinaison_carburants(self):
        result = compute_scope1({"diesel_l": 100, "gaz_naturel_kwh": 1000})
        assert result == pytest.approx(100 * 2.68 + 1000 * 0.204)

    def test_facteurs_personnalises(self):
        assert compute_scope1({"diesel_l": 10}, factors={"diesel_l": 3.0}) == 30.0

    def test_cle_inconnue_leve_valueerror(self):
        with pytest.raises(ValueError, match="Cle inconnue"):
            compute_scope1({"charbon_kg": 50})

    def test_valeur_negative_leve_valueerror(self):
        with pytest.raises(ValueError, match="negative"):
            compute_scope1({"diesel_l": -5})


class TestScope2:
    def test_electricite_france(self):
        assert compute_scope2({"electricite_fr_kwh": 10000}) == pytest.approx(520.0)

    def test_cle_scope1_refusee_en_scope2(self):
        with pytest.raises(ValueError):
            compute_scope2({"diesel_l": 100})


class TestScope3:
    def test_achats_secteur_services(self):
        assert compute_scope3(purchases_eur=100000, sector="services") == pytest.approx(11000.0)

    def test_secteur_inconnu_utilise_defaut(self):
        assert compute_scope3(purchases_eur=1000, sector="agriculture") == pytest.approx(250.0)

    def test_sans_secteur_utilise_defaut(self):
        assert compute_scope3(purchases_eur=1000) == pytest.approx(250.0)

    def test_ratio_force(self):
        assert compute_scope3(purchases_eur=1000, purchase_factor=0.5) == 500.0

    def test_deplacements(self):
        result = compute_scope3(travel={"voiture_km": 1000, "train_km": 10000})
        assert result == pytest.approx(1000 * 0.193 + 10000 * 0.0029)

    def test_achats_negatifs_leve_valueerror(self):
        with pytest.raises(ValueError):
            compute_scope3(purchases_eur=-1)

    def test_mode_transport_inconnu_leve_valueerror(self):
        with pytest.raises(ValueError):
            compute_scope3(travel={"fusee_km": 1})


class TestCarbonFootprint:
    def _footprint(self) -> CarbonFootprint:
        return CarbonFootprint(scope1_kg=1000, scope2_kg=500, scope3_kg=8500)

    def test_totaux(self):
        fp = self._footprint()
        assert fp.total_kg == 10000
        assert fp.total_t == 10.0

    def test_repartition_pct(self):
        pct = self._footprint().breakdown_pct()
        assert pct == {"scope1": 10.0, "scope2": 5.0, "scope3": 85.0}

    def test_repartition_total_nul(self):
        fp = CarbonFootprint(0, 0, 0)
        assert fp.breakdown_pct() == {"scope1": 0.0, "scope2": 0.0, "scope3": 0.0}

    def test_intensite_par_salarie(self):
        assert self._footprint().intensity_per_employee_t(10) == 1.0

    def test_intensite_salaries_invalide(self):
        with pytest.raises(ValueError):
            self._footprint().intensity_per_employee_t(0)

    def test_intensite_par_ca(self):
        assert self._footprint().intensity_per_revenue_kg_per_eur(100000) == 0.1

    def test_immutabilite(self):
        with pytest.raises(Exception):
            self._footprint().scope1_kg = 0  # type: ignore[misc]


class TestComputeFootprint:
    def test_cas_complet(self):
        fp = compute_footprint(
            scope1={"diesel_l": 1000},
            scope2={"electricite_fr_kwh": 10000},
            purchases_eur=100000,
            sector="services",
            travel={"avion_km": 5000},
        )
        assert fp.scope1_kg == pytest.approx(2680.0)
        assert fp.scope2_kg == pytest.approx(520.0)
        assert fp.scope3_kg == pytest.approx(11000.0 + 5000 * 0.23)

    def test_entrees_vides(self):
        assert compute_footprint().total_kg == 0.0

    def test_purete_pas_de_mutation_des_facteurs(self):
        before = dict(SCOPE1_FACTORS)
        compute_scope1({"diesel_l": 10}, factors={"diesel_l": 99.0})
        assert SCOPE1_FACTORS == before

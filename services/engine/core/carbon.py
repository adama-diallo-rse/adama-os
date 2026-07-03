"""Module carbon : calcul d'empreinte carbone Scopes 1, 2 et 3.

Fonctions pures, sans effet de bord ni I/O. Les facteurs d'emission sont des
ordres de grandeur inspires de la Base Carbone ADEME, exprimes en kgCO2e par
unite d'activite. Ils sont surchargeables via les parametres `factors` pour
permettre des mises a jour sans toucher au code appelant.

Convention d'unites :
- entrees : litres (carburants), kWh (energie), euros (achats), km (deplacements)
- calculs internes : kgCO2e
- restitution : kgCO2e et tCO2e via CarbonFootprint
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Mapping

# ---------------------------------------------------------------------------
# Facteurs d'emission par defaut (kgCO2e / unite)
# ---------------------------------------------------------------------------

SCOPE1_FACTORS: dict[str, float] = {
    "diesel_l": 2.68,          # gazole routier, combustion
    "essence_l": 2.28,         # essence, combustion
    "gaz_naturel_kwh": 0.204,  # gaz naturel, combustion (PCS)
    "fioul_l": 3.25,           # fioul domestique
    "gpl_l": 1.86,             # GPL
}

SCOPE2_FACTORS: dict[str, float] = {
    "electricite_fr_kwh": 0.052,   # mix electrique France
    "electricite_eu_kwh": 0.23,    # mix electrique Europe moyen
    "chaleur_reseau_kwh": 0.15,    # reseau de chaleur moyen
}

# Ratios monetaires pour les achats (kgCO2e / euro), par secteur
PURCHASE_FACTORS_BY_SECTOR: dict[str, float] = {
    "services": 0.11,
    "industrie": 0.35,
    "commerce": 0.25,
    "construction": 0.30,
}
DEFAULT_PURCHASE_FACTOR: float = 0.25

# Deplacements professionnels (kgCO2e / km)
TRAVEL_FACTORS: dict[str, float] = {
    "voiture_km": 0.193,
    "train_km": 0.0029,   # TGV / TER France
    "avion_km": 0.23,
}


# ---------------------------------------------------------------------------
# Helpers de validation
# ---------------------------------------------------------------------------

def _validate_activity(
    activity: Mapping[str, float],
    factors: Mapping[str, float],
    label: str,
) -> None:
    for key, value in activity.items():
        if key not in factors:
            valid = ", ".join(sorted(factors))
            raise ValueError(
                f"Cle inconnue '{key}' pour {label}. Cles valides : {valid}"
            )
        if value < 0:
            raise ValueError(f"Valeur negative interdite pour '{key}' ({value})")


def _weighted_sum(
    activity: Mapping[str, float],
    factors: Mapping[str, float],
) -> float:
    return sum(qty * factors[key] for key, qty in activity.items())


# ---------------------------------------------------------------------------
# Calculs par scope
# ---------------------------------------------------------------------------

def compute_scope1(
    consumptions: Mapping[str, float],
    factors: Mapping[str, float] | None = None,
) -> float:
    """Emissions directes (combustion de carburants et combustibles), en kgCO2e.

    `consumptions` mappe une cle de SCOPE1_FACTORS vers une quantite
    (ex. {"diesel_l": 1200, "gaz_naturel_kwh": 15000}).
    """
    factors = dict(SCOPE1_FACTORS if factors is None else factors)
    _validate_activity(consumptions, factors, "le scope 1")
    return _weighted_sum(consumptions, factors)


def compute_scope2(
    consumptions: Mapping[str, float],
    factors: Mapping[str, float] | None = None,
) -> float:
    """Emissions indirectes liees a l'energie achetee, en kgCO2e."""
    factors = dict(SCOPE2_FACTORS if factors is None else factors)
    _validate_activity(consumptions, factors, "le scope 2")
    return _weighted_sum(consumptions, factors)


def compute_scope3(
    purchases_eur: float = 0.0,
    sector: str | None = None,
    travel: Mapping[str, float] | None = None,
    purchase_factor: float | None = None,
    travel_factors: Mapping[str, float] | None = None,
) -> float:
    """Emissions indirectes amont simplifiees (achats + deplacements), en kgCO2e.

    Les achats utilisent un ratio monetaire sectoriel ; `purchase_factor`
    permet de forcer un ratio specifique. Les deplacements utilisent
    TRAVEL_FACTORS (voiture_km, train_km, avion_km).
    """
    if purchases_eur < 0:
        raise ValueError(f"Montant d'achats negatif interdit ({purchases_eur})")

    if purchase_factor is None:
        key = sector.strip().lower() if sector else ""
        purchase_factor = PURCHASE_FACTORS_BY_SECTOR.get(key, DEFAULT_PURCHASE_FACTOR)
    if purchase_factor < 0:
        raise ValueError("Le ratio monetaire doit etre positif")

    total = purchases_eur * purchase_factor

    if travel:
        t_factors = dict(TRAVEL_FACTORS if travel_factors is None else travel_factors)
        _validate_activity(travel, t_factors, "les deplacements (scope 3)")
        total += _weighted_sum(travel, t_factors)

    return total


# ---------------------------------------------------------------------------
# Resultat agrege
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class CarbonFootprint:
    """Empreinte carbone agregee. Valeurs en kgCO2e."""

    scope1_kg: float
    scope2_kg: float
    scope3_kg: float

    @property
    def total_kg(self) -> float:
        return self.scope1_kg + self.scope2_kg + self.scope3_kg

    @property
    def total_t(self) -> float:
        return self.total_kg / 1000.0

    def breakdown_pct(self) -> dict[str, float]:
        """Repartition en pourcentage par scope (0 partout si total nul)."""
        total = self.total_kg
        if total == 0:
            return {"scope1": 0.0, "scope2": 0.0, "scope3": 0.0}
        return {
            "scope1": round(100 * self.scope1_kg / total, 1),
            "scope2": round(100 * self.scope2_kg / total, 1),
            "scope3": round(100 * self.scope3_kg / total, 1),
        }

    def intensity_per_employee_t(self, employees: int) -> float:
        """Intensite en tCO2e par salarie."""
        if employees <= 0:
            raise ValueError("Le nombre de salaries doit etre strictement positif")
        return self.total_t / employees

    def intensity_per_revenue_kg_per_eur(self, revenue_eur: float) -> float:
        """Intensite en kgCO2e par euro de chiffre d'affaires."""
        if revenue_eur <= 0:
            raise ValueError("Le chiffre d'affaires doit etre strictement positif")
        return self.total_kg / revenue_eur


def compute_footprint(
    scope1: Mapping[str, float] | None = None,
    scope2: Mapping[str, float] | None = None,
    purchases_eur: float = 0.0,
    sector: str | None = None,
    travel: Mapping[str, float] | None = None,
) -> CarbonFootprint:
    """Calcule l'empreinte complete a partir des entrees brutes."""
    return CarbonFootprint(
        scope1_kg=compute_scope1(scope1 or {}),
        scope2_kg=compute_scope2(scope2 or {}),
        scope3_kg=compute_scope3(purchases_eur, sector, travel),
    )

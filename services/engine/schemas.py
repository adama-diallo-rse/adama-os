"""Schemas Pydantic de l'API Adama Engine (entrees et sorties)."""

from __future__ import annotations

from pydantic import BaseModel, Field

from core.materiality import DEFAULT_THRESHOLD

# ---------------------------------------------------------------------------
# Entrees
# ---------------------------------------------------------------------------


class CompanyIn(BaseModel):
    name: str = Field(min_length=1, description="Raison sociale")
    sector: str | None = Field(
        default=None,
        description="Secteur : services, industrie, commerce, construction",
    )
    employees: int | None = Field(default=None, ge=1, description="Effectif")
    revenue_eur: float | None = Field(default=None, gt=0, description="CA annuel en euros")


class IssueIn(BaseModel):
    name: str = Field(min_length=1, description="Nom de l'enjeu ESG")
    impact_score: float = Field(ge=0, le=5, description="Materialite d'impact (0 a 5)")
    financial_score: float = Field(ge=0, le=5, description="Materialite financiere (0 a 5)")


class AuditExpressRequest(BaseModel):
    """Entrees courtes pour un audit express ESG."""

    company: CompanyIn
    scope1: dict[str, float] = Field(
        default_factory=dict,
        description="Consommations directes, ex. {'diesel_l': 1200}",
    )
    scope2: dict[str, float] = Field(
        default_factory=dict,
        description="Energie achetee, ex. {'electricite_fr_kwh': 25000}",
    )
    purchases_eur: float = Field(default=0, ge=0, description="Achats annuels en euros")
    travel: dict[str, float] = Field(
        default_factory=dict,
        description="Deplacements pro, ex. {'voiture_km': 15000, 'avion_km': 8000}",
    )
    issues: list[IssueIn] = Field(default_factory=list, description="Enjeux ESG a positionner")
    materiality_threshold: float = Field(
        default=DEFAULT_THRESHOLD, gt=0, le=5, description="Seuil de materialite"
    )


# ---------------------------------------------------------------------------
# Sorties
# ---------------------------------------------------------------------------


class CarbonReport(BaseModel):
    scope1_t: float
    scope2_t: float
    scope3_t: float
    total_t: float
    breakdown_pct: dict[str, float]
    intensity_per_employee_t: float | None = None
    intensity_kg_per_eur: float | None = None


class IssueOut(BaseModel):
    name: str
    impact_score: float
    financial_score: float
    priority_score: float
    quadrant: str


class MaterialityReport(BaseModel):
    threshold: float
    issues: list[IssueOut]
    counts: dict[str, int]
    top_issues: list[str]


class AuditExpressResponse(BaseModel):
    """Mini-rapport d'audit express."""

    company: str
    carbon: CarbonReport
    materiality: MaterialityReport | None = None
    recommendations: list[str]

from fastapi import FastAPI, HTTPException

from core.carbon import CarbonFootprint, compute_footprint
from core.materiality import (
    QUADRANT_DOUBLE,
    MaterialityIssue,
    MaterialityMatrix,
    build_matrix,
    classify_issue,
)
from schemas import (
    AuditExpressRequest,
    AuditExpressResponse,
    CarbonReport,
    IssueOut,
    MaterialityReport,
)

app = FastAPI(title="Adama Engine", version="0.2.0")


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "adama-engine", "status": "ok"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Audit express (L2-T3)
# ---------------------------------------------------------------------------


def _carbon_report(fp: CarbonFootprint, employees: int | None, revenue: float | None) -> CarbonReport:
    return CarbonReport(
        scope1_t=round(fp.scope1_kg / 1000, 3),
        scope2_t=round(fp.scope2_kg / 1000, 3),
        scope3_t=round(fp.scope3_kg / 1000, 3),
        total_t=round(fp.total_t, 3),
        breakdown_pct=fp.breakdown_pct(),
        intensity_per_employee_t=(
            round(fp.intensity_per_employee_t(employees), 3) if employees else None
        ),
        intensity_kg_per_eur=(
            round(fp.intensity_per_revenue_kg_per_eur(revenue), 4) if revenue else None
        ),
    )


def _materiality_report(matrix: MaterialityMatrix) -> MaterialityReport:
    issues_out = [
        IssueOut(
            name=i.name,
            impact_score=i.impact_score,
            financial_score=i.financial_score,
            priority_score=i.priority_score,
            quadrant=classify_issue(i, matrix.threshold),
        )
        for i in matrix.issues
    ]
    return MaterialityReport(
        threshold=matrix.threshold,
        issues=issues_out,
        counts=matrix.counts(),
        top_issues=[i.name for i in matrix.material_issues[:3]],
    )


def _recommendations(fp: CarbonFootprint, matrix: MaterialityMatrix | None) -> list[str]:
    recos: list[str] = []

    if fp.total_kg > 0:
        pct = fp.breakdown_pct()
        dominant = max(pct, key=lambda k: pct[k])
        actions = {
            "scope1": "reduire les consommations directes de carburants "
                      "(sobriete, motorisations alternatives)",
            "scope2": "optimiser les consommations d'energie et etudier "
                      "un contrat d'electricite bas carbone",
            "scope3": "engager les fournisseurs principaux et rationaliser "
                      "les achats et deplacements",
        }
        recos.append(
            f"Poste dominant : {dominant} ({pct[dominant]}% du total). "
            f"Priorite : {actions[dominant]}."
        )
    else:
        recos.append(
            "Aucune donnee d'activite fournie : completer les consommations "
            "d'energie, les achats et les deplacements pour fiabiliser le bilan."
        )

    if matrix is not None:
        doubles = matrix.quadrants.get(QUADRANT_DOUBLE, ())
        if doubles:
            recos.append(
                "Enjeux en double materialite a traiter en priorite : "
                + ", ".join(doubles) + "."
            )
        elif matrix.issues:
            recos.append(
                "Aucun enjeu en double materialite au seuil retenu : "
                "verifier la notation ou abaisser le seuil."
            )
    else:
        recos.append(
            "Ajouter une liste d'enjeux ESG notes pour construire la matrice "
            "de double materialite."
        )

    return recos


@app.post("/audit-express", response_model=AuditExpressResponse)
def audit_express(payload: AuditExpressRequest) -> AuditExpressResponse:
    """Transforme des entrees courtes en mini-rapport carbone + materialite."""
    try:
        footprint = compute_footprint(
            scope1=payload.scope1,
            scope2=payload.scope2,
            purchases_eur=payload.purchases_eur,
            sector=payload.company.sector,
            travel=payload.travel,
        )
        matrix = None
        if payload.issues:
            matrix = build_matrix(
                (
                    MaterialityIssue(i.name, i.impact_score, i.financial_score)
                    for i in payload.issues
                ),
                threshold=payload.materiality_threshold,
            )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return AuditExpressResponse(
        company=payload.company.name,
        carbon=_carbon_report(footprint, payload.company.employees, payload.company.revenue_eur),
        materiality=_materiality_report(matrix) if matrix else None,
        recommendations=_recommendations(footprint, matrix),
    )

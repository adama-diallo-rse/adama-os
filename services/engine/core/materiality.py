"""Module materiality : analyse de double materialite (CSRD).

Chaque enjeu ESG est note sur deux axes (echelle 0 a 5) :
- materialite d'impact : impact de l'entreprise sur l'environnement et la societe
- materialite financiere : impact de l'enjeu sur la performance de l'entreprise

Un seuil (par defaut 3.0) determine le quadrant de chaque enjeu dans la
matrice. Fonctions pures, sans I/O.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

SCORE_MIN = 0.0
SCORE_MAX = 5.0
DEFAULT_THRESHOLD = 3.0

# Quadrants possibles
QUADRANT_DOUBLE = "materialite_double"
QUADRANT_IMPACT = "materialite_impact"
QUADRANT_FINANCIAL = "materialite_financiere"
QUADRANT_NONE = "non_materiel"

ALL_QUADRANTS = (QUADRANT_DOUBLE, QUADRANT_IMPACT, QUADRANT_FINANCIAL, QUADRANT_NONE)


@dataclass(frozen=True)
class MaterialityIssue:
    """Un enjeu ESG note sur les deux axes de materialite."""

    name: str
    impact_score: float
    financial_score: float

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise ValueError("Le nom de l'enjeu ne peut pas etre vide")
        for label, score in (
            ("impact_score", self.impact_score),
            ("financial_score", self.financial_score),
        ):
            if not (SCORE_MIN <= score <= SCORE_MAX):
                raise ValueError(
                    f"{label} de '{self.name}' doit etre entre "
                    f"{SCORE_MIN} et {SCORE_MAX} (recu : {score})"
                )

    @property
    def priority_score(self) -> float:
        """Score de priorisation : somme des deux axes (0 a 10)."""
        return self.impact_score + self.financial_score


def classify_issue(issue: MaterialityIssue, threshold: float = DEFAULT_THRESHOLD) -> str:
    """Retourne le quadrant de l'enjeu selon le seuil de materialite."""
    if not (SCORE_MIN < threshold <= SCORE_MAX):
        raise ValueError(f"Seuil invalide : {threshold} (attendu dans ]0, {SCORE_MAX}])")
    impact = issue.impact_score >= threshold
    financial = issue.financial_score >= threshold
    if impact and financial:
        return QUADRANT_DOUBLE
    if impact:
        return QUADRANT_IMPACT
    if financial:
        return QUADRANT_FINANCIAL
    return QUADRANT_NONE


@dataclass(frozen=True)
class MaterialityMatrix:
    """Matrice de double materialite construite a partir d'une liste d'enjeux."""

    threshold: float
    issues: tuple[MaterialityIssue, ...]
    quadrants: dict[str, tuple[str, ...]] = field(default_factory=dict)

    @property
    def material_issues(self) -> tuple[MaterialityIssue, ...]:
        """Enjeux materiels (au moins un axe au-dessus du seuil), tries par priorite."""
        return tuple(
            i for i in self.issues
            if classify_issue(i, self.threshold) != QUADRANT_NONE
        )

    def counts(self) -> dict[str, int]:
        return {q: len(self.quadrants.get(q, ())) for q in ALL_QUADRANTS}


def build_matrix(
    issues: Iterable[MaterialityIssue],
    threshold: float = DEFAULT_THRESHOLD,
) -> MaterialityMatrix:
    """Construit la matrice : enjeux tries par priorite decroissante et quadrants.

    Leve ValueError si deux enjeux portent le meme nom (insensible a la casse).
    """
    issues_list = list(issues)
    seen: set[str] = set()
    for issue in issues_list:
        key = issue.name.strip().lower()
        if key in seen:
            raise ValueError(f"Enjeu en double : '{issue.name}'")
        seen.add(key)

    ordered = tuple(
        sorted(issues_list, key=lambda i: (-i.priority_score, i.name.lower()))
    )

    quadrants: dict[str, list[str]] = {q: [] for q in ALL_QUADRANTS}
    for issue in ordered:
        quadrants[classify_issue(issue, threshold)].append(issue.name)

    return MaterialityMatrix(
        threshold=threshold,
        issues=ordered,
        quadrants={q: tuple(names) for q, names in quadrants.items()},
    )

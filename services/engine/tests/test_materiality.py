"""Tests du module core.materiality."""

import pytest

from core.materiality import (
    QUADRANT_DOUBLE,
    QUADRANT_FINANCIAL,
    QUADRANT_IMPACT,
    QUADRANT_NONE,
    MaterialityIssue,
    build_matrix,
    classify_issue,
)


def issue(name="Climat", impact=4.0, financial=4.0) -> MaterialityIssue:
    return MaterialityIssue(name=name, impact_score=impact, financial_score=financial)


class TestMaterialityIssue:
    def test_creation_valide(self):
        i = issue()
        assert i.priority_score == 8.0

    def test_bornes_acceptees(self):
        issue(impact=0.0, financial=5.0)

    def test_score_trop_haut_leve_valueerror(self):
        with pytest.raises(ValueError, match="entre"):
            issue(impact=5.1)

    def test_score_negatif_leve_valueerror(self):
        with pytest.raises(ValueError):
            issue(financial=-0.1)

    def test_nom_vide_leve_valueerror(self):
        with pytest.raises(ValueError, match="vide"):
            issue(name="  ")


class TestClassifyIssue:
    def test_double_materialite(self):
        assert classify_issue(issue(impact=4, financial=3)) == QUADRANT_DOUBLE

    def test_impact_seul(self):
        assert classify_issue(issue(impact=4, financial=2)) == QUADRANT_IMPACT

    def test_financiere_seule(self):
        assert classify_issue(issue(impact=1, financial=5)) == QUADRANT_FINANCIAL

    def test_non_materiel(self):
        assert classify_issue(issue(impact=1, financial=1)) == QUADRANT_NONE

    def test_seuil_inclusif(self):
        assert classify_issue(issue(impact=3.0, financial=3.0)) == QUADRANT_DOUBLE

    def test_seuil_personnalise(self):
        assert classify_issue(issue(impact=2, financial=2), threshold=2.0) == QUADRANT_DOUBLE

    def test_seuil_invalide_leve_valueerror(self):
        with pytest.raises(ValueError, match="Seuil"):
            classify_issue(issue(), threshold=0.0)


class TestBuildMatrix:
    def _issues(self):
        return [
            issue("Biodiversite", impact=4, financial=1),
            issue("Climat", impact=5, financial=5),
            issue("Cyber", impact=1, financial=4),
            issue("Mecenat", impact=1, financial=1),
        ]

    def test_tri_par_priorite_decroissante(self):
        matrix = build_matrix(self._issues())
        assert [i.name for i in matrix.issues] == ["Climat", "Biodiversite", "Cyber", "Mecenat"]

    def test_quadrants(self):
        matrix = build_matrix(self._issues())
        assert matrix.quadrants[QUADRANT_DOUBLE] == ("Climat",)
        assert matrix.quadrants[QUADRANT_IMPACT] == ("Biodiversite",)
        assert matrix.quadrants[QUADRANT_FINANCIAL] == ("Cyber",)
        assert matrix.quadrants[QUADRANT_NONE] == ("Mecenat",)

    def test_counts(self):
        counts = build_matrix(self._issues()).counts()
        assert counts == {
            QUADRANT_DOUBLE: 1,
            QUADRANT_IMPACT: 1,
            QUADRANT_FINANCIAL: 1,
            QUADRANT_NONE: 1,
        }

    def test_material_issues_exclut_non_materiel(self):
        names = [i.name for i in build_matrix(self._issues()).material_issues]
        assert "Mecenat" not in names
        assert names[0] == "Climat"

    def test_egalite_priorite_tri_alphabetique(self):
        matrix = build_matrix([issue("B", 3, 3), issue("A", 3, 3)])
        assert [i.name for i in matrix.issues] == ["A", "B"]

    def test_doublon_leve_valueerror(self):
        with pytest.raises(ValueError, match="double"):
            build_matrix([issue("Climat"), issue("climat ")])

    def test_liste_vide(self):
        matrix = build_matrix([])
        assert matrix.issues == ()
        assert sum(matrix.counts().values()) == 0

"use client";

// =====================================================================
// C5-T7, la grille de surface des fiches projet.
//
// Extrait de dashboard.tsx le 1er septembre 2026, non par gout de la
// decoupe mais parce que le budget de docs/BUDGET.md plafonne le plus gros
// composant a sept cents lignes, et que la regle dit exactement quoi faire
// quand on l'atteint : decouper avant d'ajouter.
//
// Quatre informations par carte, pas plus : le probleme en une ligne, le
// role en un mot, l'etat, et une preuve. Le lien de verification n'apparait
// que si le registre sert reellement l'affirmation : une carte qui
// promettrait une preuve introuvable serait le defaut que ce site combat.
// =====================================================================

import { useState } from "react";
import Link from "next/link";
import { BrandSignature, divisionName } from "./brand-signature";
import { ProjectArt } from "./portfolio-art";
import type { CarteProjet } from "../content/projets";
import type { ClaimState } from "../lib/proof/types";

// L'identite visuelle par projet appartient a la charte, pas au contenu :
// elle vit donc ici et non dans les fiches.
const ART_PROJET: Record<
  string,
  { brand: "strata" | "iroko" | null; legende: string }
> = {
  "esg-optimizer": { brand: "strata", legende: "AUDIT ET CONFORMITÉ" },
  "strata-scope": { brand: "strata", legende: "EMPREINTE CARBONE" },
  "adama-os": { brand: null, legende: "COCKPIT ET PREUVE" },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectGrid({
  cartes,
  categories,
  proofStates,
}: {
  cartes: CarteProjet[];
  categories: string[];
  proofStates: Record<string, ClaimState>;
}) {
  const [filter, setFilter] = useState<string>("Tout");
  const visibleProjects = cartes.filter(
    (p) => filter === "Tout" || p.categorie === filter,
  );

  return (
    <>
      <div
        className="project-filter"
        role="group"
        aria-label="Filtrer les projets"
      >
        {categories.map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value}
            {value === "Tout" && <span>{cartes.length}</span>}
          </button>
        ))}
        <span className="filter-caption" aria-live="polite">
          {visibleProjects.length} fiche
          {visibleProjects.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="projects-grid">
        {visibleProjects.map((projet) => {
          const art = ART_PROJET[projet.slug];
          const preuve = proofStates[projet.preuveVedette];
          return (
            // La classe de carte est celle de la CHARTE, pas celle du slug.
            // portfolio.css habille .project-strata, .project-iroko et
            // .project-adama : fond, couleur d'encre, echelle de la
            // sculpture. Emettre `project-esg-optimizer` faisait tomber
            // toutes ces regles en silence, et la carte Adama OS se
            // retrouvait en creme sur creme, illisible. Trouve le
            // 2 septembre 2026 par la mesure de contraste, pas a l'oeil.
            <article
              className={`project-card project-${art?.brand ?? "adama"}`}
              data-projet={projet.slug}
              key={projet.slug}
            >
              <Link
                href={`/projets/${projet.slug}`}
                className="project-image-link"
                aria-label={`Ouvrir la fiche ${projet.titre}`}
                tabIndex={-1}
              >
                <div className="project-art">
                  <span className="project-art-label">
                    {projet.categorie} / {divisionName(projet.division)}
                  </span>
                  {art?.brand ? (
                    <div className={"project-brand-art brand-art-" + art.brand}>
                      <BrandSignature brand={art.brand} />
                    </div>
                  ) : (
                    <ProjectArt kind="adama" />
                  )}
                  {/* Le nom du produit figure dans l'illustration de toutes
                      les cartes, et pas seulement de celle du cockpit : sans
                      lui, les deux fiches STRATA ESG sont deux cartes jumelles
                      que seul un libelle de six pixels distingue. La charte
                      le prevoyait deja, la regle
                      .project-strata .project-art-name existe depuis la
                      refonte du 31 aout et n'etait appliquee a rien. */}
                  <span className="project-art-name">
                    {projet.titre}
                    <span>{art?.legende}</span>
                  </span>
                  <span className="project-arrow">
                    <Arrow diagonal />
                  </span>
                </div>
              </Link>
              <h3>{projet.titre}</h3>
              <p>{projet.resume}</p>
              <dl className="project-facts">
                <div>
                  <dt>Mon rôle</dt>
                  <dd>{projet.roleEnUnMot}</dd>
                </div>
                <div>
                  <dt>État</dt>
                  <dd data-etat={projet.etat}>{projet.etatLabel}</dd>
                </div>
                <div>
                  <dt>Preuve</dt>
                  <dd>
                    {preuve ? (
                      <Link href={`/verifier/${projet.preuveVedette}`}>
                        Vérifier <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      "non servie aujourd’hui"
                    )}
                  </dd>
                </div>
              </dl>
              <Link href={`/projets/${projet.slug}`} className="project-link">
                Lire la fiche complète
                <Arrow />
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}

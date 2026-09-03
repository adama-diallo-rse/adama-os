"use client";
import { useState } from "react";
import { BrandSignature, divisionName } from "./brand-signature";
import { ProductMark } from "./product-mark";
import { OutboundLink } from "./outbound-link";
import type { EcosystemProductRow, EcosystemStatus } from "./types";

const divisions = [
  {
    key: "STRATA",
    id: "strata",
    brand: "strata",
    title: "Le reporting de durabilité.",
    description:
      "Conformité CSRD, calcul carbone, veille et formation. Des outils pour organiser les données ESG des PME européennes.",
    label: "DURABILITÉ / EUROPE",
  },
  {
    key: "IROKO",
    id: "iroko",
    brand: "iroko",
    title: "La gestion, au quotidien.",
    description:
      "Facturation et encaissements pour les entreprises d’Afrique de l’Ouest, avec les moyens de paiement qu’elles utilisent : Wave et Orange Money.",
    label: "GESTION / AFRIQUE DE L’OUEST",
  },
  {
    key: "Cockpit",
    id: "cockpit",
    brand: "adama",
    title: "Adama OS, l’atelier.",
    description:
      "Ce portfolio rassemble mon parcours, mes projets et mon journal de développement.",
    label: "PORTFOLIO / DÉVELOPPEMENT",
  },
] as const;
const labels: Record<EcosystemStatus, string> = {
  live: "En ligne",
  building: "En développement",
  planned: "À l’étude",
};
const filters = ["Tous les produits", "En ligne", "En développement"] as const;

export function EcosystemCatalog({
  products,
}: {
  products: EcosystemProductRow[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>(filters[0]);
  const shown = products.filter(
    (p) =>
      filter === filters[0] ||
      (filter === filters[1]
        ? p.status === "live" && p.url
        : p.status !== "live"),
  );
  const extra = [...new Set(products.map((p) => p.division))].filter(
    (d) => !["STRATA", "STRATA ESG", "IROKO", "Cockpit"].includes(d),
  );
  return (
    <>
      <nav className="division-nav" aria-label="Divisions de l’écosystème">
        {divisions.map((d) => (
          <a href={"#" + d.id} key={d.key}>
            {divisionName(d.key)} <span aria-hidden="true">↓</span>
          </a>
        ))}
      </nav>
      {products.length > 0 && (
        <div className="catalog-filters">
          <div role="group" aria-label="Filtrer les produits par avancement">
            {filters.map((f) => (
              <button
                type="button"
                key={f}
                aria-pressed={f === filter}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <span role="status">
            {shown.length} produit{shown.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
      {products.length === 0 && (
        <div className="catalog-unavailable" role="status">
          Le registre produits n’a pas pu être chargé. Les présentations
          ci-dessous restent disponibles, mais aucun statut ni lien produit ne
          peut être confirmé.
        </div>
      )}
      {divisions.map((division, index) => {
        const list = shown.filter(
          (p) =>
            p.division === division.key ||
            (division.key === "STRATA" && p.division === "STRATA ESG"),
        );
        return (
          <section
            className="division-section"
            id={division.id}
            key={division.key}
            aria-labelledby={division.id + "-title"}
          >
            <div className="division-identity">
              <div className={"division-logo logo-" + division.brand}>
                <BrandSignature brand={division.brand} />
              </div>
              <p className="portfolio-label">
                0{index + 1} / {division.label}
              </p>
              <h2 id={division.id + "-title"}>{division.title}</h2>
              <p>{division.description}</p>
            </div>
            <div className="division-products">
              {list.length > 0 ? (
                list.map((p) => <ProductTile key={p.slug} product={p} />)
              ) : (
                <p className="catalog-empty">
                  {products.length === 0
                    ? "Les fiches produits réapparaîtront dès que le registre sera accessible."
                    : filter === filters[0]
                      ? "Aucun produit publié dans cette division."
                      : "Aucun produit ne correspond à ce filtre dans cette division."}
                </p>
              )}
            </div>
          </section>
        );
      })}
      {extra.map((division) => (
        <section className="division-section" key={division}>
          <div className="division-identity">
            <h2>{divisionName(division)}</h2>
          </div>
          <div className="division-products">
            {shown
              .filter((p) => p.division === division)
              .map((p) => (
                <ProductTile key={p.slug} product={p} />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

function ProductTile({ product: p }: { product: EcosystemProductRow }) {
  const content = (
    <>
      <div className="product-tile-top">
        <ProductMark slug={p.slug} taille={26} />
        <span className={"product-status status-" + p.status}>
          <i aria-hidden="true" />
          {labels[p.status] ?? "En développement"}
        </span>
        <span aria-hidden="true">{p.url ? "↗" : ""}</span>
      </div>
      <p className="product-pillar">{p.pillar ?? divisionName(p.division)}</p>
      <h3>{p.name}</h3>
      {p.description && <p className="product-description">{p.description}</p>}
      <span className="product-tile-action">
        {p.url ? "Découvrir le produit" : "Pas encore d’accès public"}
        {p.url && <span aria-hidden="true">→</span>}
      </span>
    </>
  );
  return p.url ? (
    <OutboundLink
      href={p.url}
      product={p.slug}
      division={p.division}
      source="ecosysteme"
      className="product-tile product-tile-link"
    >
      {content}
    </OutboundLink>
  ) : (
    <article className="product-tile">{content}</article>
  );
}

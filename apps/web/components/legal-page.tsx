import type { ReactNode } from "react";
import Link from "next/link";
import { PageIntro, PageShell } from "./page-shell";
import { LEGAL_UPDATED_AT } from "../lib/legal";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function LegalDefinitionList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="legal-definitions">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PageShell className="legal-page">
      <PageIntro
        eyebrow="INFORMATIONS / ADAMA OS"
        title={title}
        description={intro}
      />
      <div className="legal-layout">
        <aside className="legal-sidebar">
          <p className="portfolio-label">SUR CETTE PAGE</p>
          <nav aria-label="Informations du site">
            <Link
              href="/mentions-legales"
              aria-current={title === "Mentions légales" ? "page" : undefined}
            >
              Mentions légales ↗
            </Link>
            <Link
              href="/confidentialite"
              aria-current={
                title.includes("Confidentialité") ||
                title.includes("confidentialité")
                  ? "page"
                  : undefined
              }
            >
              Confidentialité ↗
            </Link>
          </nav>
          <p>
            Mise à jour
            <br />
            <strong>{LEGAL_UPDATED_AT}</strong>
          </p>
        </aside>
        <div className="legal-content">{children}</div>
      </div>
    </PageShell>
  );
}

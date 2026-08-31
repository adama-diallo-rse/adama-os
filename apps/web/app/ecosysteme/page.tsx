import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { EcosystemCatalog } from "../../components/ecosystem-catalog";
import type { EcosystemProductRow } from "../../components/types";
import { createPublicClient } from "../../lib/supabase/public";
import { SITE_URL, absoluteUrl } from "../../lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Écosystème, STRATA ESG et IROKO Software Group",
  description:
    "Les projets d’Adama Diallo : reporting de durabilité avec STRATA ESG, gestion d’entreprise avec IROKO Software Group. Produits, liens et avancement.",
  alternates: { canonical: "/ecosysteme" },
  openGraph: {
    title: "STRATA ESG & IROKO Software Group",
    description: "Les produits, leurs liens et leur avancement.",
    url: "/ecosysteme",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

async function chargerProduits(): Promise<EcosystemProductRow[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ecosystem_products")
    .select("slug, name, division, pillar, description, status, url, position")
    .order("position", { ascending: true });
  if (error) {
    console.error("[ecosysteme] registre illisible :", error.message);
    return [];
  }
  return (data as EcosystemProductRow[]) ?? [];
}

export default async function EcosystemePage() {
  const produits = await chargerProduits();
  const enLigne = produits.filter((p) => p.status === "live" && p.url);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": SITE_URL + "#organisation",
        name: "STRATA ESG",
        description: "Logiciels de reporting de durabilité.",
        url: absoluteUrl("/ecosysteme#strata"),
        founder: { "@type": "Person", name: "Adama Diallo" },
      },
      {
        "@type": "Organization",
        "@id": SITE_URL + "#iroko",
        name: "IROKO Software Group",
        url: absoluteUrl("/ecosysteme#iroko"),
        founder: { "@type": "Person", name: "Adama Diallo" },
      },
      ...enLigne.map((p) => ({
        "@type": "SoftwareApplication",
        name: p.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: p.url,
        description: p.description ?? p.pillar ?? undefined,
        publisher: {
          "@id":
            SITE_URL + (p.division === "IROKO" ? "#iroko" : "#organisation"),
        },
      })),
    ],
  };
  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageIntro
        eyebrow="LES PROJETS / ÉCOSYSTÈME"
        title={
          <>
            Des logiciels,
            <br />
            <span className="serif">des usages précis.</span>
          </>
        }
        description="Je développe STRATA ESG pour le reporting de durabilité et IROKO Software Group pour la gestion d’entreprise en Afrique de l’Ouest. Retrouvez ici les produits et leur avancement."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">DANS LE REGISTRE</span>
            {produits.length > 0 ? (
              <>
                <strong>{String(enLigne.length).padStart(2, "0")}</strong>
                <p>
                  produit{enLigne.length > 1 ? "s" : ""} accessible
                  {enLigne.length > 1 ? "s" : ""} en ligne
                </p>
              </>
            ) : (
              <p>La liste des produits est momentanément indisponible.</p>
            )}
            <Link href="/metrics">Consulter les métriques ↗</Link>
          </div>
        }
      />
      <EcosystemCatalog products={produits} />
      <section className="page-next">
        <div>
          <p className="portfolio-label">POUR ALLER PLUS LOIN</p>
          <h2>
            Suivre les <span className="serif">projets.</span>
          </h2>
          <p>
            Les relevés publiés sont consultables avec leur date et leur source.
          </p>
        </div>
        <Link href="/metrics" className="portfolio-button primary">
          Voir les métriques <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </PageShell>
  );
}

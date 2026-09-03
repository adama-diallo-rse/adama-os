import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { EcosystemCatalog } from "../../components/ecosystem-catalog";
import { EcosystemMapView } from "../../components/ecosystem-map";
import type { EcosystemProductRow } from "../../components/types";
import { createPublicClient } from "../../lib/supabase/public";
import { SITE_URL, absoluteUrl } from "../../lib/site";
import { buildEcosystemMap } from "../../lib/ecosystem/map";
import { fetchShippedFeed } from "../../lib/github";
import { listClaims } from "../../lib/proof/claims";
import { ROLES_DIVISION } from "../../content/divisions";

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

/**
 * C4-T7. Une affirmation par produit, quand le registre de preuve en sert
 * une. Un produit sans affirmation n'obtient pas de lien de verification :
 * proposer un lien mort couterait plus cher que ne rien proposer.
 */
async function chargerPreuvesProduit(): Promise<Record<string, string>> {
  const claims = await listClaims().catch(() => []);
  const par: Record<string, string> = {};
  for (const c of claims) {
    if (c.row.subject_type === "produit" && c.row.subject_ref) {
      par[c.row.subject_ref] = c.row.id;
    }
  }
  return par;
}

export default async function EcosystemePage() {
  // C4-T5 : si le registre ne repond pas, la carte ne se rend pas. Les trois
  // lectures partent en parallele, aucune ne bloque les autres.
  const [produits, feed, preuves] = await Promise.all([
    chargerProduits(),
    fetchShippedFeed(60).catch(() => null),
    chargerPreuvesProduit(),
  ]);

  const activite: Record<string, string> = {};
  for (const commit of feed?.commits ?? []) {
    const connu = activite[commit.repo];
    if (!connu || commit.date > connu) {
      activite[commit.repo] = commit.date;
    }
  }

  const carte = buildEcosystemMap({
    products: produits,
    repos: feed?.repos ?? [],
    activity: activite,
    proofs: preuves,
    observedAt: new Date().toISOString(),
  });

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
      <EcosystemMapView
        map={carte}
        repos={feed?.repos ?? []}
        roles={ROLES_DIVISION}
      />
      <EcosystemCatalog products={produits} />
      <section className="page-next">
        <div>
          <p className="portfolio-label">POUR ALLER PLUS LOIN</p>
          <h2>
            Suivre la <span className="serif">construction.</span>
          </h2>
          <p>
            Le journal rassemble les contributions réelles de ces dépôts,
            regroupées par chantier, et nomme ceux qu’il ne peut pas lire.
          </p>
        </div>
        <Link href="/journal" className="portfolio-button primary">
          Ouvrir le journal de construction <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

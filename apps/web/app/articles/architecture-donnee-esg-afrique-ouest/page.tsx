import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../components/article-afrique";
import { ARTICLE_ARCHITECTURE_FR } from "../../../content/articles-afrique";
import { absoluteUrl } from "../../../lib/site";

const CHEMIN = "/articles/architecture-donnee-esg-afrique-ouest";
const CHEMIN_EN = "/en/articles/west-african-esg-data-architecture";

export const metadata: Metadata = {
  title: ARTICLE_ARCHITECTURE_FR.titre,
  description: ARTICLE_ARCHITECTURE_FR.sousTitre,
  alternates: {
    canonical: CHEMIN,
    languages: { "fr-FR": CHEMIN, "en-GB": CHEMIN_EN },
  },
  openGraph: {
    title: ARTICLE_ARCHITECTURE_FR.titre,
    description: ARTICLE_ARCHITECTURE_FR.sousTitre,
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    alternateLocale: ["en_GB"],
    type: "article",
    publishedTime: ARTICLE_ARCHITECTURE_FR.dateIso,
    modifiedTime: ARTICLE_ARCHITECTURE_FR.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_ARCHITECTURE_FR.titre,
  description: ARTICLE_ARCHITECTURE_FR.sousTitre,
  inLanguage: ARTICLE_ARCHITECTURE_FR.codeLangue,
  datePublished: ARTICLE_ARCHITECTURE_FR.dateIso,
  dateModified: ARTICLE_ARCHITECTURE_FR.dateIso,
  mainEntityOfPage: absoluteUrl(CHEMIN),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleArchitectureAfriqueFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_ARCHITECTURE_FR} />
    </>
  );
}

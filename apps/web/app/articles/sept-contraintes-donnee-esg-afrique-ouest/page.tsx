import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../components/article-afrique";
import { ARTICLE_CONTRAINTES_FR } from "../../../content/articles-afrique";
import { absoluteUrl } from "../../../lib/site";

const CHEMIN = "/articles/sept-contraintes-donnee-esg-afrique-ouest";
const CHEMIN_EN = "/en/articles/seven-constraints-west-african-esg-data";

export const metadata: Metadata = {
  title: ARTICLE_CONTRAINTES_FR.titre,
  description: ARTICLE_CONTRAINTES_FR.sousTitre,
  alternates: {
    canonical: CHEMIN,
    languages: { "fr-FR": CHEMIN, "en-GB": CHEMIN_EN },
  },
  openGraph: {
    title: ARTICLE_CONTRAINTES_FR.titre,
    description: ARTICLE_CONTRAINTES_FR.sousTitre,
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    alternateLocale: ["en_GB"],
    type: "article",
    publishedTime: ARTICLE_CONTRAINTES_FR.dateIso,
    modifiedTime: ARTICLE_CONTRAINTES_FR.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_CONTRAINTES_FR.titre,
  description: ARTICLE_CONTRAINTES_FR.sousTitre,
  inLanguage: ARTICLE_CONTRAINTES_FR.codeLangue,
  datePublished: ARTICLE_CONTRAINTES_FR.dateIso,
  dateModified: ARTICLE_CONTRAINTES_FR.dateIso,
  mainEntityOfPage: absoluteUrl(CHEMIN),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleContraintesAfriqueFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_CONTRAINTES_FR} />
    </>
  );
}

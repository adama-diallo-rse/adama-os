import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../../components/article-afrique";
import { ARTICLE_ARCHITECTURE_EN } from "../../../../content/articles-afrique";
import { absoluteUrl } from "../../../../lib/site";

const PATH = "/en/articles/west-african-esg-data-architecture";
const PATH_FR = "/articles/architecture-donnee-esg-afrique-ouest";

export const metadata: Metadata = {
  title: ARTICLE_ARCHITECTURE_EN.titre,
  description: ARTICLE_ARCHITECTURE_EN.sousTitre,
  alternates: {
    canonical: PATH,
    languages: { "fr-FR": PATH_FR, "en-GB": PATH },
  },
  openGraph: {
    title: ARTICLE_ARCHITECTURE_EN.titre,
    description: ARTICLE_ARCHITECTURE_EN.sousTitre,
    url: PATH,
    siteName: "ADAMA OS",
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
    type: "article",
    publishedTime: ARTICLE_ARCHITECTURE_EN.dateIso,
    modifiedTime: ARTICLE_ARCHITECTURE_EN.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_ARCHITECTURE_EN.titre,
  description: ARTICLE_ARCHITECTURE_EN.sousTitre,
  inLanguage: ARTICLE_ARCHITECTURE_EN.codeLangue,
  datePublished: ARTICLE_ARCHITECTURE_EN.dateIso,
  dateModified: ARTICLE_ARCHITECTURE_EN.dateIso,
  mainEntityOfPage: absoluteUrl(PATH),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleArchitectureAfricaEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_ARCHITECTURE_EN} />
    </>
  );
}

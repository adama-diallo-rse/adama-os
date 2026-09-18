import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../../components/article-afrique";
import { ARTICLE_CONTRAINTES_EN } from "../../../../content/articles-afrique";
import { absoluteUrl } from "../../../../lib/site";

const PATH = "/en/articles/seven-constraints-west-african-esg-data";
const PATH_FR = "/articles/sept-contraintes-donnee-esg-afrique-ouest";

export const metadata: Metadata = {
  title: ARTICLE_CONTRAINTES_EN.titre,
  description: ARTICLE_CONTRAINTES_EN.sousTitre,
  alternates: {
    canonical: PATH,
    languages: { "fr-FR": PATH_FR, "en-GB": PATH },
  },
  openGraph: {
    title: ARTICLE_CONTRAINTES_EN.titre,
    description: ARTICLE_CONTRAINTES_EN.sousTitre,
    url: PATH,
    siteName: "ADAMA OS",
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
    type: "article",
    publishedTime: ARTICLE_CONTRAINTES_EN.dateIso,
    modifiedTime: ARTICLE_CONTRAINTES_EN.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_CONTRAINTES_EN.titre,
  description: ARTICLE_CONTRAINTES_EN.sousTitre,
  inLanguage: ARTICLE_CONTRAINTES_EN.codeLangue,
  datePublished: ARTICLE_CONTRAINTES_EN.dateIso,
  dateModified: ARTICLE_CONTRAINTES_EN.dateIso,
  mainEntityOfPage: absoluteUrl(PATH),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleConstraintsAfricaEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_CONTRAINTES_EN} />
    </>
  );
}

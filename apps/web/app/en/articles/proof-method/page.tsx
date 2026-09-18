import type { Metadata } from "next";
import { ArticleMethodePreuvePage } from "../../../../components/article-methode-preuve";
import { ARTICLE_PREUVE_EN } from "../../../../content/article-methode-preuve";
import { absoluteUrl } from "../../../../lib/site";

const PATH = "/en/articles/proof-method";
const PATH_FR = "/articles/methode-de-preuve";

export const metadata: Metadata = {
  title: ARTICLE_PREUVE_EN.titre,
  description: ARTICLE_PREUVE_EN.sousTitre,
  alternates: {
    canonical: PATH,
    languages: { "fr-FR": PATH_FR, "en-GB": PATH },
  },
  openGraph: {
    title: ARTICLE_PREUVE_EN.titre,
    description: ARTICLE_PREUVE_EN.sousTitre,
    url: PATH,
    siteName: "ADAMA OS",
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
    type: "article",
    publishedTime: ARTICLE_PREUVE_EN.dateIso,
    modifiedTime: ARTICLE_PREUVE_EN.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_PREUVE_EN.titre,
  description: ARTICLE_PREUVE_EN.sousTitre,
  inLanguage: ARTICLE_PREUVE_EN.codeLangue,
  datePublished: ARTICLE_PREUVE_EN.dateIso,
  dateModified: ARTICLE_PREUVE_EN.dateIso,
  mainEntityOfPage: absoluteUrl(PATH),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleMethodePreuveEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleMethodePreuvePage article={ARTICLE_PREUVE_EN} />
    </>
  );
}

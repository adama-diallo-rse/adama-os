import type { Metadata } from "next";
import { ArticleMethodePreuvePage } from "../../../components/article-methode-preuve";
import { ARTICLE_PREUVE_FR } from "../../../content/article-methode-preuve";
import { absoluteUrl } from "../../../lib/site";

const CHEMIN = "/articles/methode-de-preuve";
const CHEMIN_EN = "/en/articles/proof-method";

export const metadata: Metadata = {
  title: ARTICLE_PREUVE_FR.titre,
  description: ARTICLE_PREUVE_FR.sousTitre,
  alternates: {
    canonical: CHEMIN,
    languages: { "fr-FR": CHEMIN, "en-GB": CHEMIN_EN },
  },
  openGraph: {
    title: ARTICLE_PREUVE_FR.titre,
    description: ARTICLE_PREUVE_FR.sousTitre,
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    alternateLocale: ["en_GB"],
    type: "article",
    publishedTime: ARTICLE_PREUVE_FR.dateIso,
    modifiedTime: ARTICLE_PREUVE_FR.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_PREUVE_FR.titre,
  description: ARTICLE_PREUVE_FR.sousTitre,
  inLanguage: ARTICLE_PREUVE_FR.codeLangue,
  datePublished: ARTICLE_PREUVE_FR.dateIso,
  dateModified: ARTICLE_PREUVE_FR.dateIso,
  mainEntityOfPage: absoluteUrl(CHEMIN),
  author: { "@type": "Person", name: "Adama Diallo" },
  publisher: { "@type": "Organization", name: "ADAMA OS" },
};

export default function ArticleMethodePreuveFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleMethodePreuvePage article={ARTICLE_PREUVE_FR} />
    </>
  );
}

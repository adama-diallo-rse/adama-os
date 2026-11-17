import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../../components/article-afrique";
import { ARTICLE_DEFORESTATION_EN } from "../../../../content/articles-afrique";
import { absoluteUrl } from "../../../../lib/site";
import { refPersonne } from "../../../../lib/entites";

const CHEMIN = "/en/articles/eudr-west-africa-origin-data";
const CHEMIN_FR = "/articles/reglement-deforestation-rdue-afrique-ouest";

// Le titre de la page est plus court que celui de l'article, pour la même
// raison que la version française : la requête visée tient en tête.
export const metadata: Metadata = {
  title: "EUDR in West Africa: proving where it was grown",
  description: ARTICLE_DEFORESTATION_EN.sousTitre,
  alternates: {
    canonical: CHEMIN,
    languages: { "fr-FR": CHEMIN_FR, "en-GB": CHEMIN },
  },
  openGraph: {
    title: ARTICLE_DEFORESTATION_EN.titre,
    description: ARTICLE_DEFORESTATION_EN.sousTitre,
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
    type: "article",
    publishedTime: ARTICLE_DEFORESTATION_EN.dateIso,
    modifiedTime: ARTICLE_DEFORESTATION_EN.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_DEFORESTATION_EN.titre,
  description: ARTICLE_DEFORESTATION_EN.sousTitre,
  inLanguage: ARTICLE_DEFORESTATION_EN.codeLangue,
  datePublished: ARTICLE_DEFORESTATION_EN.dateIso,
  dateModified: ARTICLE_DEFORESTATION_EN.dateIso,
  mainEntityOfPage: absoluteUrl(CHEMIN),
  author: refPersonne(),
  publisher: { "@type": "Organization", name: "ADAMA OS" },
  citation: ARTICLE_DEFORESTATION_EN.sources?.liens.map((l) => l.href),
};

export default function ArticleDeforestationAfriqueEn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_DEFORESTATION_EN} />
    </>
  );
}

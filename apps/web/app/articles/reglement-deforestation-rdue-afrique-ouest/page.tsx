import type { Metadata } from "next";
import { ArticleAfriquePage } from "../../../components/article-afrique";
import { ARTICLE_DEFORESTATION_FR } from "../../../content/articles-afrique";
import { absoluteUrl } from "../../../lib/site";
import { refPersonne } from "../../../lib/entites";

const CHEMIN = "/articles/reglement-deforestation-rdue-afrique-ouest";
const CHEMIN_EN = "/en/articles/eudr-west-africa-origin-data";

// Le titre de la page est plus court que celui de l'article : un moteur
// coupe au-delà d'une soixantaine de caractères, et la requête visée,
// « règlement déforestation Afrique de l'Ouest », doit tenir en tête.
export const metadata: Metadata = {
  title: "Règlement déforestation (RDUE) en Afrique de l’Ouest",
  description: ARTICLE_DEFORESTATION_FR.sousTitre,
  alternates: {
    canonical: CHEMIN,
    languages: { "fr-FR": CHEMIN, "en-GB": CHEMIN_EN },
  },
  openGraph: {
    title: ARTICLE_DEFORESTATION_FR.titre,
    description: ARTICLE_DEFORESTATION_FR.sousTitre,
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    alternateLocale: ["en_GB"],
    type: "article",
    publishedTime: ARTICLE_DEFORESTATION_FR.dateIso,
    modifiedTime: ARTICLE_DEFORESTATION_FR.dateIso,
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: ARTICLE_DEFORESTATION_FR.titre,
  description: ARTICLE_DEFORESTATION_FR.sousTitre,
  inLanguage: ARTICLE_DEFORESTATION_FR.codeLangue,
  datePublished: ARTICLE_DEFORESTATION_FR.dateIso,
  dateModified: ARTICLE_DEFORESTATION_FR.dateIso,
  mainEntityOfPage: absoluteUrl(CHEMIN),
  author: refPersonne(),
  publisher: { "@type": "Organization", name: "ADAMA OS" },
  citation: ARTICLE_DEFORESTATION_FR.sources?.liens.map((l) => l.href),
};

export default function ArticleDeforestationAfriqueFr() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <ArticleAfriquePage article={ARTICLE_DEFORESTATION_FR} />
    </>
  );
}

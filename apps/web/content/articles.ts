import { ARTICLE_PREUVE_EN, ARTICLE_PREUVE_FR } from "./article-methode-preuve";
import {
  ARTICLE_ARCHITECTURE_EN,
  ARTICLE_ARCHITECTURE_FR,
  ARTICLE_CONTRAINTES_EN,
  ARTICLE_CONTRAINTES_FR,
} from "./articles-afrique";

// =====================================================================
// EC4, le temps « Apprendre » : l'index des notes de fond publiees.
//
// Les titres, dates et sous-titres se lisent dans le contenu de chaque
// article, jamais recopies : un titre corrige dans l'article l'est ici du
// meme geste. Seuls le chemin et le code de la serie s'ecrivent ici.
// =====================================================================

type EntreeArticle = {
  code: string;
  serie: string;
  href: string;
  titre: string;
  sousTitre: string;
  date: string;
  dateIso: string;
  lecture: string;
  en: { href: string; titre: string };
};

export const ARTICLES: readonly EntreeArticle[] = [
  {
    code: "AXP-71",
    serie: "Méthode de preuve",
    href: "/articles/methode-de-preuve",
    titre: ARTICLE_PREUVE_FR.titre,
    sousTitre: ARTICLE_PREUVE_FR.sousTitre,
    date: ARTICLE_PREUVE_FR.date,
    dateIso: ARTICLE_PREUVE_FR.dateIso,
    lecture: ARTICLE_PREUVE_FR.dureeLecture,
    en: {
      href: ARTICLE_PREUVE_FR.autreLangue.href,
      titre: ARTICLE_PREUVE_EN.titre,
    },
  },
  {
    code: "AXP-122",
    serie: "Afrique de l’Ouest, publication 1",
    href: "/articles/sept-contraintes-donnee-esg-afrique-ouest",
    titre: ARTICLE_CONTRAINTES_FR.titre,
    sousTitre: ARTICLE_CONTRAINTES_FR.sousTitre,
    date: ARTICLE_CONTRAINTES_FR.date,
    dateIso: ARTICLE_CONTRAINTES_FR.dateIso,
    lecture: ARTICLE_CONTRAINTES_FR.lecture,
    en: {
      href: ARTICLE_CONTRAINTES_FR.autreLangue.href,
      titre: ARTICLE_CONTRAINTES_EN.titre,
    },
  },
  {
    code: "AXP-122",
    serie: "Afrique de l’Ouest, publication 2",
    href: "/articles/architecture-donnee-esg-afrique-ouest",
    titre: ARTICLE_ARCHITECTURE_FR.titre,
    sousTitre: ARTICLE_ARCHITECTURE_FR.sousTitre,
    date: ARTICLE_ARCHITECTURE_FR.date,
    dateIso: ARTICLE_ARCHITECTURE_FR.dateIso,
    lecture: ARTICLE_ARCHITECTURE_FR.lecture,
    en: {
      href: ARTICLE_ARCHITECTURE_FR.autreLangue.href,
      titre: ARTICLE_ARCHITECTURE_EN.titre,
    },
  },
] as const;

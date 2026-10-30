import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { SceneIsometrique } from "../../components/kit/scene-isometrique";
import { Accent, Fleche } from "../../components/kit/elements";
import { TableauRegimes } from "../../components/accueil/tableau-regimes";
import {
  BlocRubrique,
  BrancheFermee,
  SectionCatalogue,
} from "../../components/catalogue/objets";
import { RUBRIQUES, tousLesObjets } from "../../content/catalogue";
import { EXPANSION_MATURITY } from "../../content/expansion";

export const metadata: Metadata = {
  title: "Le catalogue",
  description:
    "Tout ce qu’ADAMA OS publie, rangé en sept rubriques : articles, méthodes et leur état, registres, outils publics. Le gratuit ne recule jamais.",
  alternates: { canonical: "/catalogue" },
  openGraph: {
    title: "Le catalogue d’ADAMA OS",
    description:
      "Sept rubriques, chaque objet avec son état de maturité. Aucun prix, aucune date promise.",
    url: "/catalogue",
  },
};

// Les six engagements, repris de la voix d'ADAMA OS
// (brand/ADAMA_OS_VOIX_2026.md, « Nous sommes, nous ne sommes pas »).
const ENGAGEMENTS = [
  { titre: "Précis", contraire: "plutôt que vague" },
  { titre: "Sobre", contraire: "plutôt que promotionnel" },
  { titre: "Technique", contraire: "sans complexité inutile" },
  { titre: "Vérifiable", contraire: "jamais affirmatif sans preuve" },
  { titre: "Ouvert sur les limites", contraire: "jamais certain par posture" },
  { titre: "Utile", contraire: "plutôt que décoratif" },
] as const;

const FAQ = [
  {
    q: "Faut-il un compte pour lire le catalogue ?",
    r: "Non. Tout ce qui est rangé ici est public, sans compte et sans adresse. Le régime OPEN le reste pour toujours : rien de ce qui est public aujourd’hui ne passera derrière un paiement.",
  },
  {
    q: "Que veut dire l’état affiché sur chaque objet ?",
    r: `Il dit où en est l’objet, jamais où il devrait en être. ${EXPANSION_MATURITY.map((e) => `${e.name} : ${e.detail.toLowerCase()}`).join(" ; ")}.`,
  },
  {
    q: "Quand s’ouvrent les titres, les systèmes et les parcours ?",
    r: "Aucune date n’est promise. Une branche s’ouvre quand son premier objet a servi au moins une fois en vrai, et la lettre SIGNAL l’annonce ce jour-là.",
  },
  {
    q: "Le catalogue vend-il STRATA ESG ?",
    r: "Non. ADAMA OS montre comment construire ; STRATA ESG livre le logiciel. Un objet qui croise un produit le dit et renvoie vers lui, sans jamais faire croire qu’un achat ici donne accès au logiciel.",
  },
] as const;

export default function PageCatalogue() {
  const nombre = tousLesObjets().length;
  return (
    <PageShell className="page-catalogue">
      <PageIntro
        numero="CAT"
        eyebrow="OPEN / le catalogue"
        title={
          <>
            Tout ce qui est ouvert, rangé par <Accent>question.</Accent>
          </>
        }
        description={`${nombre} objets publics, en sept rubriques. Chacun dit sa forme et son état de maturité, et mène à une page qui existe aujourd’hui.`}
        aside={
          <div data-parallaxe>
            <SceneIsometrique titre="Strates de données, registre, sceau, et la ligne de provenance entre Dakar et Paris" />
          </div>
        }
      />

      <nav className="catalogue-index" aria-label="Les rubriques">
        <ol>
          {RUBRIQUES.map((r, i) => (
            <li key={r.code}>
              <a href={`#${r.code}`}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {r.titre}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="catalogue-rubriques">
        {RUBRIQUES.map((r, i) => (
          <BlocRubrique
            key={r.code}
            rubrique={r}
            numero={String(i + 1).padStart(2, "0")}
          />
        ))}
      </div>

      <SectionCatalogue
        id="regimes"
        numero="08"
        surTitre="Les régimes"
        titre={
          <>
            Le gratuit ne recule <Accent>jamais.</Accent>
          </>
        }
        intro="Quatre régimes, une seule règle commune : une preuve reste vérifiable sans payer."
      >
        <div className="bloc-sombre">
          <TableauRegimes />
        </div>
      </SectionCatalogue>

      <SectionCatalogue
        id="vagues"
        numero="09"
        surTitre="Ce qui s’ouvre par vagues"
        titre="Trois branches, encore fermées."
        intro="Elles s’ajoutent au laboratoire public, elles ne lui reprennent rien."
      >
        <div className="branches-fermees">
          <BrancheFermee
            code="PRESS"
            regle="Aucun titre ne publie une affirmation sans sa source."
          >
            <h3>Les titres et les fiches vivantes</h3>
            <p>
              Des écrits longs, mis à jour, avec leurs sources et leur registre
              d’allégations.
            </p>
            <Link href="/bibliotheque">
              La bibliothèque <Fleche />
            </Link>
          </BrancheFermee>
          <BrancheFermee
            code="FORGE"
            regle="Un système n’est publié qu’après avoir servi au moins une fois en vrai."
          >
            <h3>Les systèmes installables</h3>
            <p>Des gabarits et des kits extraits du travail réel.</p>
            <Link href="/outils">
              Les outils <Fleche />
            </Link>
          </BrancheFermee>
          <BrancheFermee
            code="ATELIER"
            regle="Un parcours atteste une capacité de conception sur un projet rendu, rien de plus."
          >
            <h3>Les parcours</h3>
            <p>Comprendre, concevoir, construire, exploiter.</p>
            <Link href="/parcours">
              Les parcours <Fleche />
            </Link>
          </BrancheFermee>
        </div>
      </SectionCatalogue>

      <SectionCatalogue
        id="engagements"
        numero="10"
        surTitre="La voix"
        titre="Six engagements, tenus partout."
      >
        <ul className="engagements" data-cartes>
          {ENGAGEMENTS.map((e, n) => (
            <li key={e.titre}>
              <span className="engagements-numero">
                {String(n + 1).padStart(2, "0")}
              </span>
              <strong>{e.titre}</strong>
              <span>{e.contraire}</span>
            </li>
          ))}
        </ul>
      </SectionCatalogue>

      <SectionCatalogue
        id="questions"
        numero="11"
        surTitre="Questions"
        titre="Ce qu’on demande souvent."
      >
        <div className="faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div>
                <p>{f.r}</p>
              </div>
            </details>
          ))}
        </div>
      </SectionCatalogue>

      <section className="appel-page" aria-labelledby="appel-catalogue">
        <h2 id="appel-catalogue">
          Un problème qui ne rentre dans aucune <Accent>rubrique ?</Accent>
        </h2>
        <div className="appel-page-actions">
          <Link
            href="/travaillez-avec-moi"
            className="bouton bouton-plein bouton-magnetique"
          >
            Échanger <Fleche />
          </Link>
          <Link href="/lettre" className="bouton bouton-contour">
            Recevoir la lettre SIGNAL <Fleche />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

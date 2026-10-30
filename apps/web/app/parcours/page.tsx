import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { Accent, Fleche } from "../../components/kit/elements";
import {
  BrancheFermee,
  SectionCatalogue,
} from "../../components/catalogue/objets";

// ATELIER, les parcours (refonte du 30 octobre 2026). Aucun parcours n'est
// ouvert. La page dit la structure arrêtée (comprendre, concevoir,
// construire, exploiter), la frontière avec STRATA Academy, et ce qu'un
// parcours ne fera jamais. Le vocabulaire fermé d'ADEC-19 s'applique.
export const metadata: Metadata = {
  title: "Parcours",
  description:
    "Les parcours ATELIER d’ADAMA OS : comprendre, concevoir, construire, exploiter un système de donnée de durabilité. Aucun parcours n’est encore ouvert.",
  alternates: { canonical: "/parcours" },
};

const TEMPS = [
  {
    titre: "Comprendre",
    texte:
      "Lire une exigence de durabilité comme un modèle de donnée : qui produit quoi, à partir de quelle source.",
  },
  {
    titre: "Concevoir",
    texte:
      "Dessiner le système avant l’outil : les objets, leurs liens, et la preuve attendue à chaque étape.",
  },
  {
    titre: "Construire",
    texte:
      "Passer du schéma à un actif vérifiable, en suivant la chaîne idée, expérience, décision, méthode, actif.",
  },
  {
    titre: "Exploiter",
    texte:
      "Tenir le système dans le temps : ses pannes, ses erreurs publiées, ses décisions remplacées.",
  },
] as const;

export default function PageParcours() {
  return (
    <PageShell className="page-parcours">
      <PageIntro
        numero="ATELIER"
        eyebrow="Parcours / transmission"
        title={
          <>
            Apprendre à construire, sur un projet <Accent>rendu.</Accent>
          </>
        }
        description="Les parcours ATELIER enseigneront la conception de systèmes de donnée de durabilité. Aucun n’est encore ouvert ; voici leur structure, et leurs limites."
      />

      <SectionCatalogue
        id="structure"
        numero="01"
        surTitre="La structure"
        titre="Quatre temps, dans cet ordre."
      >
        <ol
          className="etapes"
          data-carrousel
          tabIndex={0}
          aria-label="Les quatre temps, défilables"
        >
          {TEMPS.map((t, i) => (
            <li key={t.titre}>
              <span className="etapes-numero">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{t.titre}</h3>
              <p>{t.texte}</p>
            </li>
          ))}
        </ol>
      </SectionCatalogue>

      <SectionCatalogue
        id="frontiere"
        numero="02"
        surTitre="La frontière"
        titre="Ce qu’un parcours ne fera jamais."
      >
        <ul className="liste-frontiere">
          <li>
            <strong>Attester une compétence ESG d’une personne.</strong> C’est
            le rôle de STRATA Academy, et de lui seul.
          </li>
          <li>
            <strong>Promettre un résultat.</strong> Un parcours transmet une
            méthode et l’éprouve sur un projet rendu, pas davantage.
          </li>
          <li>
            <strong>Livrer un logiciel.</strong> Ce qui prend la forme d’un
            logiciel relève de STRATA ESG.
          </li>
        </ul>
      </SectionCatalogue>

      <SectionCatalogue
        id="ouverture"
        numero="03"
        surTitre="L’ouverture"
        titre="Pas encore ouvert."
      >
        <BrancheFermee
          code="ATELIER"
          regle="Un parcours s’ouvre quand son premier atelier court a eu lieu en vrai, et la lettre l’annonce ce jour-là."
        >
          <p>
            En attendant, la méthode, les fiches et les décisions sont publiques
            : tout ce qu’un parcours enseignera se lit déjà.
          </p>
          <div className="branche-fermee-liens">
            <Link href="/methode">
              Lire la méthode <Fleche />
            </Link>
            <Link href="/lettre">
              Recevoir la lettre SIGNAL <Fleche />
            </Link>
          </div>
        </BrancheFermee>
      </SectionCatalogue>
    </PageShell>
  );
}

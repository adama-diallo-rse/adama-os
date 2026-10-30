import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { Accent, Etat, Fleche } from "../../components/kit/elements";
import {
  BrancheFermee,
  SectionCatalogue,
} from "../../components/catalogue/objets";
import { ARTICLES } from "../../content/articles";

// PRESS, la bibliothèque (refonte du 30 octobre 2026). Elle range les notes
// de fond déjà publiées, bilingues, et dit en clair qu'aucun titre n'est
// encore paru. Aucun titre à venir n'est annoncé, aucune date n'est promise.
export const metadata: Metadata = {
  title: "Bibliothèque",
  description:
    "Les notes de fond d’ADAMA OS, en français et en anglais, avec leur date et leur temps de lecture. Les titres de la branche PRESS ne sont pas encore parus.",
  alternates: { canonical: "/bibliotheque" },
};

export default function PageBibliotheque() {
  return (
    <PageShell className="page-bibliotheque">
      <PageIntro
        numero="PRESS"
        eyebrow="Bibliothèque / notes de fond"
        title={
          <>
            Des écrits longs, sourcés, <Accent>datés.</Accent>
          </>
        }
        description="Chaque note porte sa date, ses sources et ses preuves cassées quand il y en a. Elles sont publiques, en français et en anglais."
      />

      <SectionCatalogue
        id="notes"
        numero="01"
        surTitre="Notes de fond publiées"
        titre="À lire aujourd’hui."
      >
        <ul className="rubrique-objets bibliotheque-notes" data-cartes>
          {ARTICLES.map((a) => (
            <li key={a.href} className="objet">
              <Link href={a.href}>
                <span className="objet-tete">
                  <span>
                    {a.code} · {a.serie}
                  </span>
                  <Etat valeur="OUVERT" />
                </span>
                <h3>{a.titre}</h3>
                <p>{a.sousTitre}</p>
                <p className="objet-meta">
                  <time dateTime={a.dateIso}>{a.date}</time> · {a.lecture}
                </p>
                <Fleche />
              </Link>
              <Link href={a.en.href} className="objet-autre-langue" lang="en">
                English version: {a.en.titre}
              </Link>
            </li>
          ))}
        </ul>
      </SectionCatalogue>

      <SectionCatalogue
        id="titres"
        numero="02"
        surTitre="Les titres"
        titre="Aucun titre n’est encore paru."
      >
        <BrancheFermee
          code="PRESS"
          regle="Un titre n’affirme que ce que le cockpit peut prouver : chaque affirmation forte renvoie à une décision publiée, une preuve horodatée ou un dépôt lisible."
        >
          <p>
            Un titre sera un écrit long tenu à jour, avec ses sources, son
            registre d’allégations et le journal de ses versions. Le premier
            paraîtra quand la chaîne qui mène du carnet au titre aura servi une
            fois, de bout en bout. La lettre l’annoncera ce jour-là.
          </p>
          <div className="branche-fermee-liens">
            <Link href="/playbooks">
              Les fiches vivantes <Fleche />
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

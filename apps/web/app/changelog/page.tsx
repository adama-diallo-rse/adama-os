import type { Metadata } from "next";
import { PageIntro, PageShell } from "../../components/page-shell";

export const metadata: Metadata = {
  title: "Changelog hebdomadaire",
  description:
    "Huit lignes par semaine sur ce qui a été fait, décidé et appris.",
  alternates: { canonical: "/changelog" },
};

const lignes = [
  [
    "Fait",
    "La page publique du changelog et la chaîne écrite EV1 sont structurées dans le dépôt.",
  ],
  [
    "Fait",
    "La matière est dérivée de l'historique réel du dépôt, sans attribuer un commit à la mauvaise semaine.",
  ],
  ["Fait", "Le gabarit tient dans le créneau hebdomadaire de quinze minutes."],
  ["Décidé", "Une édition reste visible même lorsque la semaine est vide."],
  ["Décidé", "Les branches git ne sont jamais exposées dans le texte public."],
  [
    "Appris",
    "La chaîne doit séparer capture, rédaction, relecture et archive.",
  ],
  [
    "Appris",
    "La vérification publique est un critère de publication distinct du build.",
  ],
  [
    "Appris",
    "La prochaine vérification porte sur quatre objets consécutifs parcourant EV1.",
  ],
] as const;

export default function ChangelogPage() {
  return (
    <PageShell className="systeme-page">
      <PageIntro
        eyebrow="CONSTRUCTION / CHANGELOG"
        title={
          <>
            Ce qui a changé,
            <br />
            <span className="serif">sans réécriture.</span>
          </>
        }
        description="Une édition courte, datée et vérifiable. Les faits restent visibles à côté de leurs corrections."
      />
      <section aria-labelledby="semaine-2026-38">
        <p className="portfolio-label">SEMAINE DU 14 AU 20 SEPTEMBRE 2026</p>
        <h2 id="semaine-2026-38">Semaine 6</h2>
        <ol>
          {lignes.map(([bloc, ligne], index) => (
            <li key={`${bloc}-${index}`}>
              <strong>{bloc}</strong> {ligne}
            </li>
          ))}
        </ol>
      </section>
    </PageShell>
  );
}

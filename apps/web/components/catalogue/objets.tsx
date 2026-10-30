import Link from "next/link";
import type { ReactNode } from "react";
import { Etat, Fleche, SurTitre } from "../kit/elements";
import type { ObjetCatalogue, Rubrique } from "../../content/catalogue";

/** Une carte d'objet du catalogue : sa forme, son état, son résumé. */
export function CarteObjet({ objet }: { objet: ObjetCatalogue }) {
  const corps = (
    <>
      <span className="objet-tete">
        <span>{objet.forme}</span>
        <Etat valeur={objet.etat} />
      </span>
      <h3>{objet.titre}</h3>
      <p>{objet.resume}</p>
      <Fleche diagonale={objet.externe} />
    </>
  );
  return (
    <li className="objet">
      {objet.externe ? (
        <a href={objet.href} target="_blank" rel="noopener noreferrer">
          {corps}
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      ) : (
        <Link href={objet.href}>{corps}</Link>
      )}
    </li>
  );
}

/** Une rubrique entière : sa question, puis ses objets. */
export function BlocRubrique({
  rubrique,
  numero,
}: {
  rubrique: Rubrique;
  numero: string;
}) {
  return (
    <section
      id={rubrique.code}
      className="rubrique"
      aria-labelledby={`rubrique-${rubrique.code}`}
    >
      <div className="rubrique-tete">
        <SurTitre numero={numero}>Rubrique</SurTitre>
        <h2 id={`rubrique-${rubrique.code}`}>{rubrique.titre}</h2>
        <p>{rubrique.question}</p>
      </div>
      <ul className="rubrique-objets" data-cartes>
        {rubrique.objets.map((o) => (
          <CarteObjet key={o.href} objet={o} />
        ))}
      </ul>
    </section>
  );
}

/** Une section de page de catalogue, avec son sur-titre numéroté. */
export function SectionCatalogue({
  id,
  numero,
  surTitre,
  titre,
  intro,
  children,
}: {
  id: string;
  numero: string;
  surTitre: string;
  titre: ReactNode;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="section-catalogue"
      aria-labelledby={`${id}-titre`}
    >
      <div className="section-tete">
        <SurTitre numero={numero}>{surTitre}</SurTitre>
        <h2 id={`${id}-titre`}>{titre}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** L'état honnête d'une branche qui n'est pas ouverte. */
export function BrancheFermee({
  code,
  regle,
  children,
}: {
  code: string;
  regle: string;
  children: ReactNode;
}) {
  return (
    <div className="branche-fermee">
      <p className="branche-fermee-tete">
        <span className="grand-menu-code">{code}</span>
        <Etat valeur="Pas encore ouvert" />
      </p>
      <div className="branche-fermee-corps">{children}</div>
      <p className="branche-fermee-regle">
        <span>La règle</span> {regle}
      </p>
    </div>
  );
}

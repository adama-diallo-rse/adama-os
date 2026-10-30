import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { Accent, Etat, Fleche } from "../../components/kit/elements";
import {
  BrancheFermee,
  SectionCatalogue,
} from "../../components/catalogue/objets";
import { METHODES } from "../../content/methodes";

// PRESS, les playbooks vivants (refonte du 30 octobre 2026). Aucun playbook
// n'est paru. Ce qui s'en approche le plus aujourd'hui, ce sont les fiches
// de méthode : versionnées, revues, avec leur journal. Elles sont rangées
// ici telles qu'elles sont, avec leur état réel.
export const metadata: Metadata = {
  title: "Playbooks",
  description:
    "Les fiches vivantes d’ADAMA OS : chaque méthode avec sa version, sa date de revue et son état. Les playbooks de la branche PRESS ne sont pas encore parus.",
  alternates: { canonical: "/playbooks" },
};

export default function PagePlaybooks() {
  return (
    <PageShell className="page-playbooks">
      <PageIntro
        numero="PRESS"
        eyebrow="Playbooks / fiches vivantes"
        title={
          <>
            Des fiches qui gardent leur <Accent>journal.</Accent>
          </>
        }
        description="Un playbook vivant se met à jour sans effacer ce qu’il disait avant. Aucun n’est encore paru ; les fiches de méthode suivent déjà cette règle."
      />

      <SectionCatalogue
        id="fiches"
        numero="01"
        surTitre="Fiches de méthode"
        titre="Versionnées, revues, datées."
      >
        <ul className="rubrique-objets" data-cartes>
          {METHODES.map((m) => (
            <li key={m.identifiant} className="objet">
              <Link href={`/methodes/${m.identifiant.toLowerCase()}`}>
                <span className="objet-tete">
                  <span>
                    {m.identifiant} · version {m.version}
                  </span>
                  <Etat valeur={m.etat} />
                </span>
                <h3>{m.nomAffiche}</h3>
                <p className="objet-meta">
                  Dernière revue le{" "}
                  <time dateTime={m.dateDerniereRevue}>
                    {m.dateDerniereRevue}
                  </time>
                  , {m.journal.length} entrée
                  {m.journal.length > 1 ? "s" : ""} au journal
                </p>
                <Fleche />
              </Link>
            </li>
          ))}
        </ul>
      </SectionCatalogue>

      <SectionCatalogue
        id="playbooks"
        numero="02"
        surTitre="Les playbooks"
        titre="Aucun playbook n’est encore paru."
      >
        <BrancheFermee
          code="PRESS"
          regle="Un playbook n’est publié qu’avec ses sources, et chaque mise à jour laisse la version précédente lisible."
        >
          <p>
            Le premier sortira de la même chaîne que les titres de la
            bibliothèque. Aucune date n’est promise.
          </p>
          <div className="branche-fermee-liens">
            <Link href="/bibliotheque">
              La bibliothèque <Fleche />
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

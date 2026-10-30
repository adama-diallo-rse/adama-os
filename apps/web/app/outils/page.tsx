import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { Accent, Etat, Fleche } from "../../components/kit/elements";
import {
  BrancheFermee,
  SectionCatalogue,
} from "../../components/catalogue/objets";
import { listClaims } from "../../lib/proof/claims";
import { CLAIM_STATE_LABEL } from "../../lib/proof/types";
import { ERREURS } from "../../content/erreurs";
import { REGISTRE_ADR } from "../../content/decisions";

// FORGE, la surface des outils (refonte du 30 octobre 2026). Chaque tuile
// montre l'outil en usage : une vraie interface, réduite, reproduite en
// HTML, avec les valeurs que l'outil sert réellement à ce rendu. Aucune
// capture, aucune valeur d'exemple présentée comme réelle.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Outils",
  description:
    "Les outils publics d’ADAMA OS, en usage : vérifier une affirmation, lire la sortie machine, mesurer une déclaration VSME, consulter les registres.",
  alternates: { canonical: "/outils" },
};

const ETAPES = [
  {
    titre: "Choisir une affirmation",
    texte:
      "Sur une page, dans le registre de preuve ou dans la sortie machine : chaque affirmation a un identifiant.",
  },
  {
    titre: "Lire sa source",
    texte:
      "L’adresse de vérification donne la source exacte, sa classe de donnée et la date de lecture.",
  },
  {
    titre: "Comparer la date",
    texte:
      "Une source lue il y a longtemps est signalée périmée. Une source injoignable le dit en toutes lettres.",
  },
  {
    titre: "Citer sans déformer",
    texte:
      "La citation se copie avec son empreinte : une citation altérée ne correspond plus.",
  },
] as const;

const OUTILS = [
  "Vérifier une affirmation",
  "Sortie machine",
  "Simulateur VSME",
  "Registres",
] as const;

const CRITERES: { libelle: string; valeurs: readonly boolean[] }[] = [
  { libelle: "Sans compte", valeurs: [true, true, true, true] },
  {
    libelle: "Calcul dans le navigateur, sans envoi",
    valeurs: [false, false, true, false],
  },
  { libelle: "Lisible par un programme", valeurs: [false, true, false, false] },
  { libelle: "Source et date affichées", valeurs: [true, true, false, true] },
];

export default async function PageOutils() {
  const claims = await listClaims().catch(() => []);
  const reelle = claims.find((c) => c.state === "real") ?? claims[0];
  const erreur = ERREURS[0];
  const decision = REGISTRE_ADR.at(-1);

  return (
    <PageShell className="page-outils">
      <PageIntro
        numero="FORGE"
        eyebrow="Outils / en usage"
        title={
          <>
            Des outils qu’on peut ouvrir <Accent>maintenant.</Accent>
          </>
        }
        description="Gratuits, sans compte. Chaque tuile reproduit l’outil tel qu’il répond à cet instant, avec ses vraies valeurs."
      />

      <section className="tuiles" aria-label="Les outils" data-cartes>
        <article className="tuile" data-taille="large">
          <div className="tuile-apercu" aria-hidden="true" data-revele-media>
            <div className="mini">
              {reelle ? (
                <>
                  <div className="mini-ligne">
                    <span>Affirmation</span>
                    <strong>{reelle.row.id}</strong>
                  </div>
                  <div className="mini-ligne">
                    <span>Énoncé</span>
                    <span>{reelle.row.statement}</span>
                  </div>
                  <div className="mini-ligne">
                    <span>Classe</span>
                    <Etat valeur={CLAIM_STATE_LABEL[reelle.state]} />
                  </div>
                  <div className="mini-ligne">
                    <span>Lu le</span>
                    <span>
                      {reelle.claim.fetchedAt
                        ? reelle.claim.fetchedAt.slice(0, 10)
                        : "date absente"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="mini-ligne">
                  <span>Registre</span>
                  <span>injoignable à ce rendu</span>
                </div>
              )}
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Vérifier une affirmation</h3>
            <p>
              Une adresse publique par affirmation : source, classe de donnée,
              date de lecture.
            </p>
            <Link href={reelle ? `/verifier/${reelle.row.id}` : "/preuves"}>
              Ouvrir la vérification <Fleche />
            </Link>
          </div>
        </article>

        <article className="tuile" data-taille="petite">
          <div className="tuile-apercu" aria-hidden="true">
            <pre className="mini mini-code">{`{
  "claims": [
    {
      "id": "${reelle?.row.id ?? "…"}",
      "state": "${reelle?.state ?? "…"}"
    }
  ]
}`}</pre>
          </div>
          <div className="tuile-corps">
            <h3>La sortie machine</h3>
            <p>Les mêmes affirmations, servies en JSON.</p>
            <a href="/.well-known/adama-os.json">
              Lire le JSON <Fleche />
            </a>
          </div>
        </article>

        <article className="tuile" data-taille="moyenne">
          <div className="tuile-apercu" aria-hidden="true">
            <div className="mini">
              <div className="mini-ligne">
                <span>Environnement</span>
                <span>critère par critère</span>
              </div>
              <div className="mini-champ">Part d’énergie renouvelable</div>
              <div className="mini-champ">
                Émissions GES mesurées (Scopes 1-2)
              </div>
              <div className="mini-champ">Plan de réduction carbone</div>
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Le simulateur VSME</h3>
            <p>
              Mesurer la complétude d’une déclaration, critère par critère, sans
              rien envoyer.
            </p>
            <Link href="/os#simulateur">
              Ouvrir le simulateur <Fleche />
            </Link>
          </div>
        </article>

        <article className="tuile" data-taille="moyenne">
          <div className="tuile-apercu" aria-hidden="true">
            <div className="mini">
              {erreur ? (
                <>
                  <div className="mini-ligne">
                    <span>{erreur.id}</span>
                    <span>{erreur.date}</span>
                  </div>
                  <div className="mini-ligne">
                    <span>Catégorie</span>
                    <span>{erreur.categorie}</span>
                  </div>
                  <div className="mini-ligne">
                    <span>Statut</span>
                    <span>{erreur.statut}</span>
                  </div>
                </>
              ) : null}
              {decision ? (
                <div className="mini-ligne">
                  <span>{decision.adrId}</span>
                  <span>{decision.titre}</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="tuile-corps">
            <h3>Les registres</h3>
            <p>
              Erreurs, décisions et revirements : chaque entrée garde sa date et
              sa correction.
            </p>
            <Link href="/erreurs">
              Ouvrir le registre des erreurs <Fleche />
            </Link>
          </div>
        </article>
      </section>

      <SectionCatalogue
        id="mode-emploi"
        numero="01"
        surTitre="Mode d’emploi"
        titre={
          <>
            Vérifier en quatre <Accent>gestes.</Accent>
          </>
        }
      >
        <ol
          className="etapes"
          data-carrousel
          tabIndex={0}
          aria-label="Les quatre gestes, défilables"
        >
          {ETAPES.map((e, i) => (
            <li key={e.titre}>
              <span className="etapes-numero">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{e.titre}</h3>
              <p>{e.texte}</p>
            </li>
          ))}
        </ol>
      </SectionCatalogue>

      <SectionCatalogue
        id="comparer"
        numero="02"
        surTitre="Comparer"
        titre="Quel outil pour quel usage."
      >
        <div
          className="regimes-defile regimes-clair"
          role="region"
          aria-label="Comparaison des outils, défilable"
          tabIndex={0}
        >
          <table className="regimes comparatif">
            <caption className="sr-only">
              Les outils publics, comparés critère par critère
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Critère</span>
                </th>
                {OUTILS.map((o) => (
                  <th scope="col" key={o}>
                    {o}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERES.map((c) => (
                <tr key={c.libelle}>
                  <th scope="row">{c.libelle}</th>
                  {c.valeurs.map((v, i) => (
                    <td key={OUTILS[i]}>
                      {v ? (
                        <span className="regime-oui">
                          <span aria-hidden="true">✓</span> Oui
                        </span>
                      ) : (
                        <span className="regime-non">
                          <span aria-hidden="true">·</span> Non
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCatalogue>

      <SectionCatalogue
        id="systemes"
        numero="03"
        surTitre="FORGE"
        titre="Les systèmes installables."
      >
        <BrancheFermee
          code="FORGE"
          regle="Un système n’est publié qu’après avoir servi au moins une fois en vrai, et il porte sa clause de renvoi vers le produit qu’il croise."
        >
          <h3>Aucun système n’est publié.</h3>
          <p>
            Les gabarits et les kits s’extraient du travail réel de STRATA ESG
            et de Pharivo. Le premier sera annoncé par la lettre, le jour de sa
            publication.
          </p>
          <Link href="/lettre">
            Recevoir la lettre SIGNAL <Fleche />
          </Link>
        </BrancheFermee>
      </SectionCatalogue>
    </PageShell>
  );
}

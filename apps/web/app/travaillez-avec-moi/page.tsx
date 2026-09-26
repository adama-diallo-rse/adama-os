import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  CAPACITE,
  CLAUSE_RENVOI,
  CONDITIONS,
  INTERDITS,
  MENTION_DEMANDE,
  PORTES,
  VERROUS,
  periodeCourante,
  type CodePorte,
} from "../../content/conseil";
import { URL_STRATA } from "../../content/parcours";
import { EDITEUR } from "../../lib/legal";
import { lireConfigLettre } from "../../lib/lettre/config";
import { CODES_PORTE } from "../../lib/conseil/qualification";
import { FormulaireDemande } from "./formulaire";

// =====================================================================
// EG0, AXP-59, la page « travaillez avec moi ».
//
// Une page, quatre chemins, un formulaire commun. Le visiteur se range
// lui-meme, ce qui qualifie la demande avant le premier echange.
//
// Aucun prix sur cette page (EG0) : le prix vient apres la qualification,
// dans la proposition ecrite, ou sur la page du format quand il sert de
// filtre (le diagnostic court). Le plafond de capacite est affiche comme
// une regle tenue, pas comme une excuse (EG9).
// =====================================================================

export const metadata: Metadata = {
  title: "Travailler ensemble",
  description:
    "Quatre portes pour faire relire un système de donnée, de preuve ou d’intelligence artificielle appliqué à l’ESG. Un formulaire commun, une règle d’acceptation écrite, une réponse à chaque demande.",
  alternates: { canonical: "/travaillez-avec-moi" },
  openGraph: {
    title: "Travailler ensemble, quatre portes",
    description:
      "Construire, donnée, intelligence artificielle, système. Le visiteur se range lui-même, la règle d’acceptation est publique.",
    url: "/travaillez-avec-moi",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function lirePorte(brut: string | string[] | undefined): CodePorte | null {
  return typeof brut === "string" &&
    (CODES_PORTE as readonly string[]).includes(brut)
    ? (brut as CodePorte)
    : null;
}

export default async function TravaillezAvecMoiPage({ searchParams }: Props) {
  const porteInitiale = lirePorte((await searchParams).porte);
  const periode = periodeCourante();
  const relie = lireConfigLettre().ok;
  const verrouAssurance = VERROUS.assurance;

  return (
    <PageShell className="conseil-page">
      <PageIntro
        eyebrow="TRAVAILLER ENSEMBLE / QUATRE PORTES"
        title={
          <>
            Choisissez la porte
            <br />
            <span className="serif">qui ressemble à votre problème.</span>
          </>
        }
        description="Chaque porte part d’un problème dit avec les mots de celles et ceux qui le vivent. Vous vous rangez vous-même, la règle d’acceptation s’applique sous vos yeux, et chaque demande reçoit une réponse écrite."
        aside={
          <div className="intro-note conseil-capacite-note">
            <span className="intro-note-label">
              CAPACITÉ, {periode.libelle.toUpperCase()}
            </span>
            <strong>{periode.plafond}</strong>
            <p>
              Le plafond est écrit avant la première mission et publié ici. Il
              protège le temps de construction des systèmes que vous lisez sur
              ce site.
            </p>
          </div>
        }
      />

      <section className="conseil-portes" aria-labelledby="portes-titre">
        <h2 id="portes-titre" className="sr-only">
          Les quatre portes
        </h2>
        <ol>
          {PORTES.map((porte) => (
            <li key={porte.code} id={`porte-${porte.code}`}>
              <article className="conseil-porte">
                <header>
                  <span className="conseil-porte-numero">{porte.numero}</span>
                  <h3>{porte.titre}</h3>
                </header>
                <blockquote>« {porte.probleme} »</blockquote>
                <dl>
                  <div>
                    <dt>En premier</dt>
                    <dd>{porte.premierPas}</dd>
                  </div>
                  <div>
                    <dt>Ce que vous recevez</dt>
                    <dd>
                      <ul>
                        {porte.livre.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt>Ce que vous ne recevez pas</dt>
                    <dd>{porte.neLivrePas}</dd>
                  </div>
                  <div>
                    <dt>Ordre de grandeur</dt>
                    <dd className="conseil-duree">{porte.duree}</dd>
                  </div>
                </dl>
                {porte.ouverture ? (
                  <p className="conseil-porte-ouverture">{porte.ouverture}</p>
                ) : null}
                <footer>
                  <Link
                    href={`?porte=${porte.code}#demande`}
                    scroll={false}
                    className="conseil-porte-choisir"
                  >
                    Entrer par cette porte <span aria-hidden="true">→</span>
                  </Link>
                  <Link href={porte.suite.href} className="conseil-porte-suite">
                    {porte.suite.libelle}
                  </Link>
                </footer>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section className="conseil-regle" aria-labelledby="regle-titre">
        <div className="conseil-regle-tete">
          <p className="portfolio-label">LA RÈGLE D’ACCEPTATION</p>
          <h2 id="regle-titre">
            Une mission se refuse{" "}
            <span className="serif">si une seule condition manque.</span>
          </h2>
          <p>
            Elle est écrite avant la première demande, et elle vaut pour
            chacune. La lire avant d’écrire vous fait gagner du temps.
          </p>
        </div>
        <div className="conseil-regle-colonnes">
          <ol className="conseil-conditions">
            {CONDITIONS.map((c) => (
              <li key={c.code}>
                <span>{c.numero}</span>
                <div>
                  <p>{c.texte}</p>
                  <small>{c.verification}</small>
                </div>
              </li>
            ))}
          </ol>
          <ul className="conseil-interdits" aria-label="Les quatre interdits">
            {INTERDITS.map((i) => (
              <li key={i.code}>
                <strong>{i.titre}</strong>
                <p>{i.texte}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="conseil-demande"
        id="demande"
        aria-labelledby="demande-titre"
      >
        <div className="conseil-demande-tete">
          <p className="portfolio-label">LE FORMULAIRE COMMUN</p>
          <h2 id="demande-titre">
            Décrivez le problème,{" "}
            <span className="serif">pas la solution.</span>
          </h2>
          <p>
            Quatre questions pour vous ranger, puis le problème. Si la règle ne
            peut pas être tenue, vous le saurez avant d’avoir écrit une ligne,
            avec l’adresse qui vous servira mieux.
          </p>
        </div>
        <FormulaireDemande
          key={porteInitiale ?? "aucune"}
          portes={PORTES.map((p) => ({
            code: p.code,
            numero: p.numero,
            titre: p.titre,
          }))}
          porteInitiale={porteInitiale}
          conditions={CONDITIONS.map((c) => ({
            numero: c.numero,
            texte: c.texte,
          }))}
          mentionVersion={MENTION_DEMANDE.version}
          texteCase={MENTION_DEMANDE.texteCase}
          relie={relie}
          plafond={periode.plafond}
          mention={
            <>
              <dl>
                {MENTION_DEMANDE.lignes.map((l) => (
                  <div key={l.label}>
                    <dt>{l.label}</dt>
                    <dd>{l.valeur}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Accès, rectification et effacement :{" "}
                <a href={`mailto:${EDITEUR.contact}`}>{EDITEUR.contact}</a>. La
                politique du site entier est sur la page{" "}
                <Link href="/confidentialite">confidentialité</Link>.
              </p>
            </>
          }
        />
      </section>

      <section className="conseil-capacite" aria-labelledby="capacite-titre">
        <div className="conseil-capacite-tete">
          <p className="portfolio-label">LE PLAFOND, PÉRIODE PAR PÉRIODE</p>
          <h2 id="capacite-titre">
            Peu de missions,{" "}
            <span className="serif">et c’est écrit d’avance.</span>
          </h2>
          <p>
            Une revue demande du temps de lecture que rien ne remplace. Le
            plafond se fixe avant la première vente, parce qu’après il se
            négocie avec soi-même.
          </p>
        </div>
        <ol className="conseil-periodes">
          {CAPACITE.map((p) => (
            <li
              key={p.debut}
              data-courante={p.debut === periode.debut ? "oui" : "non"}
            >
              <span className="conseil-periode-libelle">{p.libelle}</span>
              <strong>{p.plafond}</strong>
              {p.debut === periode.debut ? (
                <span className="conseil-periode-marque">Période en cours</span>
              ) : null}
            </li>
          ))}
        </ol>
        {!verrouAssurance.leve ? (
          <p className="conseil-verrou">
            <span>{verrouAssurance.code}</span>
            Aucune revue n’est vendue avant la souscription de{" "}
            {verrouAssurance.objet} qui la couvre. Une demande reçue avant est
            lue, qualifiée et datée : elle n’est pas vendue.
          </p>
        ) : null}
      </section>

      <section className="review-boundary">
        <div>
          <p className="portfolio-label">FRONTIÈRE</p>
          <h2>
            ADAMA OS explique la construction. STRATA ESG livre le logiciel.
          </h2>
        </div>
        <p>{CLAUSE_RENVOI}</p>
        <a href={URL_STRATA} target="_blank" rel="noopener noreferrer">
          Voir STRATA ESG ↗
        </a>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">PAS ENCORE PRÊT</p>
          <h2>
            Lire la méthode <span className="serif">avant d’écrire.</span>
          </h2>
          <p>
            La méthode publique relie une idée, une décision, une preuve et un
            actif réutilisable. Elle suffit parfois à trancher seul.
          </p>
        </div>
        <Link href="/methode" className="portfolio-button primary">
          Lire la méthode <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

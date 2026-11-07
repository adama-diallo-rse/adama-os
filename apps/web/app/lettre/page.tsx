import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  BLOCS_LETTRE,
  CONSENTEMENT,
  ENGAGEMENTS,
  ETATS_PAGE,
  MENTION_COMPLETE,
  estEtatPage,
} from "../../content/lettre";
import { EDITEUR } from "../../lib/legal";
import { lireConfigLettre } from "../../lib/lettre/config";
import { numeroAffiche } from "../../lib/lettre/editions";
import { COOKIE_CONFIRMATION } from "../../lib/lettre/parcours";
import { lireArchive } from "../../lib/lettre/public";
import { confirmer } from "./actions";
import { BoutonConfirmer, FormulaireLettre } from "./formulaire";

// =====================================================================
// EH0, la page de la lettre SIGNAL.
//
// Ordre de lecture voulu : ce que la lettre est et n'est pas encore, ce
// qu'elle contient, le formulaire, ce que la plomberie tient, la frontiere
// avec STRATA ESG, puis la mention complete. La mention n'est pas en pied de
// page ni derriere un lien : elle est sur la page ou l'adresse se donne.
//
// La page ne publie aucun compteur d'inscrits (XINV-21). Elle ne promet
// aucune date de parution. Tant qu'aucun numero n'est parti, c'est la
// premiere chose qu'elle dit ; des le premier envoi (EH4), elle montre le
// dernier numero et l'archive de tous ceux qui sont parus, lue en base.
//
// Rendu a la demande : l'etat d'ouverture de la collecte et la presence du
// cookie de confirmation se lisent a chaque requete.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SIGNAL, la lettre",
  description:
    "La lettre d’ADAMA OS sur la construction de systèmes pour la donnée de durabilité. Double confirmation, désinscription en un clic, aucune mesure d’ouverture.",
  alternates: { canonical: "/lettre" },
  openGraph: {
    title: "SIGNAL, la lettre d’ADAMA OS",
    description:
      "Suivre le travail, pas le bruit. Un signal, un système, une décision, une construction, une idée.",
    url: "/lettre",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LettrePage({ searchParams }: Props) {
  const params = await searchParams;
  const etat = typeof params.etat === "string" ? params.etat : undefined;
  const etapeConfirmer = params.etape === "confirmer";
  const jetonPresent = Boolean(
    (await cookies()).get(COOKIE_CONFIRMATION)?.value,
  );
  const lecture = lireConfigLettre();
  const ouverte = lecture.ok && lecture.config.collecteOuverte;
  const archive = await lireArchive();
  const parus = archive.etat === "ok" ? archive.editions : [];
  const dernier = parus[0] ?? null;

  const etatAffiche =
    etapeConfirmer && !jetonPresent
      ? ETATS_PAGE["lien-invalide"]
      : estEtatPage(etat)
        ? ETATS_PAGE[etat]
        : null;
  const etatPositif = etat === "confirme" || etat === "desinscrit";

  return (
    <PageShell className="lettre-page">
      <PageIntro
        eyebrow="RESSOURCES / SIGNAL, LA LETTRE"
        title={
          <>
            Suivre le travail,
            <br />
            <span className="serif">pas le bruit.</span>
          </>
        }
        description="Une lettre sur la construction de systèmes qui rendent la donnée de durabilité exploitable et vérifiable : un fait extérieur, ce qu’il change dans un système, la décision prise, ce qui a été construit, et une idée encore fermée."
        aside={
          dernier ? (
            <div className="intro-note lettre-parution">
              <span className="intro-note-label">DERNIER NUMÉRO</span>
              <strong>#{numeroAffiche(dernier.contenu.numero)}</strong>
              <p>
                <Link href={`/lettre/${numeroAffiche(dernier.contenu.numero)}`}>
                  {dernier.contenu.fr.titre}
                </Link>
                . Un numéro toutes les deux semaines, quand il est prêt, et
                jamais un numéro rempli pour tenir le calendrier.
              </p>
            </div>
          ) : (
            <div className="intro-note lettre-parution">
              <span className="intro-note-label">PARUTION</span>
              <strong>Pas encore.</strong>
              <p>
                La lettre n’a pas commencé à paraître. Elle ouvrira quand son
                rythme pourra être tenu. D’ici là, une note courte par
                trimestre.
              </p>
            </div>
          )
        }
      />

      {etapeConfirmer && jetonPresent ? (
        <section
          className="lettre-confirmation"
          aria-labelledby="confirmation-titre"
        >
          <div>
            <p className="portfolio-label">DERNIÈRE ÉTAPE</p>
            <h2 id="confirmation-titre">
              Confirmez votre <span className="serif">inscription.</span>
            </h2>
            <p>
              Votre adresse attend ce geste. En confirmant, vous acceptez le
              texte ci-dessous, dans sa version {CONSENTEMENT.version}.
            </p>
            <blockquote>{CONSENTEMENT.texteCase}</blockquote>
          </div>
          <form action={confirmer}>
            <BoutonConfirmer />
            <p>
              Ce n’est pas vous ? Fermez simplement cette page. Sans
              confirmation, l’adresse est supprimée trente jours après la
              demande.
            </p>
          </form>
        </section>
      ) : null}

      {etatAffiche ? (
        <aside
          className="lettre-etat"
          data-ton={etatPositif ? "positif" : "neutre"}
          role="status"
          aria-live="polite"
        >
          <span className="lettre-etat-marque" aria-hidden="true" />
          <div>
            <h2>{etatAffiche.titre}</h2>
            <p>{etatAffiche.texte}</p>
          </div>
        </aside>
      ) : null}

      <section
        className="lettre-inscription"
        id="inscription"
        aria-labelledby="inscription-titre"
      >
        <div className="lettre-contenu">
          <p className="portfolio-label">CE QUE CONTIENT UNE LETTRE</p>
          <h2 id="inscription-titre">
            Cinq blocs, <span className="serif">toujours dans cet ordre.</span>
          </h2>
          <ol className="lettre-blocs">
            {BLOCS_LETTRE.map((bloc) => (
              <li key={bloc.code}>
                <span className="lettre-bloc-code">{bloc.code}</span>
                <div>
                  <h3>{bloc.nom}</h3>
                  <p>{bloc.texte}</p>
                </div>
              </li>
            ))}
          </ol>
          {dernier ? (
            <p className="lettre-attente">
              <span>DEUX LANGUES, UN NUMÉRO</span>
              Chaque numéro paraît en français et en anglais, et vous le recevez
              dans la langue choisie à l’inscription. Rien d’autre ne part vers
              votre adresse.
            </p>
          ) : (
            <p className="lettre-attente">
              <span>EN ATTENDANT</span>
              Une note courte par trimestre, en trois paragraphes : ce qui a été
              décidé, ce qui a échoué, et où en est la préparation de la lettre.
              Rien d’autre ne part vers votre adresse.
            </p>
          )}
        </div>

        <FormulaireLettre
          ouverte={ouverte}
          version={CONSENTEMENT.version}
          texteCase={CONSENTEMENT.texteCase}
          texteMention={CONSENTEMENT.texteMention}
        />
      </section>

      {parus.length > 0 ? (
        <section
          className="lettre-numeros"
          id="numeros"
          aria-labelledby="numeros-titre"
        >
          <div className="lettre-engagements-tete">
            <p className="portfolio-label">LES NUMÉROS PARUS</p>
            <h2 id="numeros-titre">
              Tout ce qui est paru{" "}
              <span className="serif">reste en ligne.</span>
            </h2>
            <p>
              Chaque numéro garde sa source, sa version et l’historique de ses
              corrections, en français et en anglais.
            </p>
          </div>
          <ol className="lettre-numeros-liste" data-cartes>
            {parus.map((e) => {
              const n = numeroAffiche(e.contenu.numero);
              return (
                <li key={e.id}>
                  <Link href={`/lettre/${n}`}>
                    <span className="lettre-numeros-code">#{n}</span>
                    <span className="lettre-numeros-titre">
                      {e.contenu.fr.titre}
                    </span>
                    <span className="lettre-numeros-en" lang="en">
                      {e.contenu.en.titre}
                    </span>
                    <span className="lettre-numeros-date">
                      {e.envoi_termine_le
                        ? new Intl.DateTimeFormat("fr-FR", {
                            dateStyle: "long",
                            timeZone: "Europe/Paris",
                          }).format(new Date(e.envoi_termine_le))
                        : ""}
                      {e.version > 1 ? ` · version ${e.version}` : ""}
                    </span>
                    <span className="lettre-numeros-fleche" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section
        className="lettre-engagements"
        aria-labelledby="engagements-titre"
      >
        <div className="lettre-engagements-tete">
          <p className="portfolio-label">CE QUE LA LETTRE TIENT</p>
          <h2 id="engagements-titre">
            Quatre règles,{" "}
            <span className="serif">vérifiables dans le code.</span>
          </h2>
        </div>
        <ol>
          {ENGAGEMENTS.map((engagement, index) => (
            <li key={engagement.titre}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{engagement.titre}</h3>
              <p>{engagement.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="review-boundary lettre-frontiere">
        <div>
          <p className="portfolio-label">FRONTIÈRE</p>
          <h2>SIGNAL est la lettre d’ADAMA OS, pas un envoi de STRATA ESG.</h2>
        </div>
        <p>
          Deux listes, deux consentements, deux domaines d’envoi. Une
          inscription ici ne vous inscrit nulle part ailleurs, et aucune adresse
          donnée à STRATA ESG ne se retrouve ici. La lettre part d’un
          sous-domaine qui lui est propre.
        </p>
        <Link href="/ecosysteme#strata">Voir ce que fait STRATA ESG ↗</Link>
      </section>

      <section
        className="lettre-mention"
        id="mention"
        aria-labelledby="mention-titre"
      >
        <div className="lettre-mention-tete">
          <p className="portfolio-label">MENTION D’INFORMATION</p>
          <h2 id="mention-titre">
            Ce qui est fait de <span className="serif">votre adresse.</span>
          </h2>
          <p>
            Pour toute demande :{" "}
            <a href={`mailto:${EDITEUR.contact}`}>{EDITEUR.contact}</a>. La
            politique du site entier est sur la page{" "}
            <Link href="/confidentialite">confidentialité</Link>.
          </p>
        </div>
        <dl>
          {MENTION_COMPLETE.map((ligne) => (
            <div key={ligne.label}>
              <dt>{ligne.label}</dt>
              <dd>{ligne.valeur}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">
            {dernier ? "ENTRE DEUX NUMÉROS" : "EN ATTENDANT LA LETTRE"}
          </p>
          <h2>
            Le travail se publie{" "}
            <span className="serif">{dernier ? "en continu." : "déjà."}</span>
          </h2>
          <p>
            Le journal de construction agrège les contributions réelles des
            dépôts, sans en inventer aucune.
          </p>
        </div>
        <Link href="/journal" className="portfolio-button primary">
          Lire le journal <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

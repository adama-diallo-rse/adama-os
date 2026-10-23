import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/page-shell";
import { SkillCards } from "../../components/skill-cards";
import { HireActions } from "../../components/hire-actions";
import { OrgMark } from "../../components/org-logo";
import { OutboundLink } from "../../components/outbound-link";
import { DataClassMark } from "../../components/proof/data-class";
import { CONTACT_EMAIL } from "../../components/types";
import {
  EXPERIENCES,
  FORMATION,
  IDENTITE,
  ORGANISATIONS_ACTUELLES,
  OUVERTURE,
  PORTES_ENTREE,
  POSTE_ACTUEL,
  TITRE_COURT,
} from "../../content/profil";
import { cartesProjet } from "../../content/projets";
import { listClaims } from "../../lib/proof/claims";
import type { ClaimState } from "../../lib/proof/types";
import { absoluteUrl } from "../../lib/site";

// =====================================================================
// C9-T3, le profil professionnel (ex parcours recruteur).
//
// Un parcours autonome et complet, pour une personne qui a quatre-vingt-dix
// secondes et n'est pas ingenieur : un client, un partenaire, un financeur,
// un jury. Jusqu'au 23 octobre 2026, cette page servait une recherche de
// poste, close le 10 octobre. L'adresse /recruteur est conservee, parce que
// des liens partages y menent ; la section 06 dit desormais a qui
// s'adresser, plus ce que je cherche.
//
// Regle de la couche, tenue ici : cette page NE DUPLIQUE AUCUN CONTENU.
// Elle compose les memes sources que le reste du site, les fiches projet de
// la couche C5, le registre de preuve de la couche C2, et la source unique
// de profil. Une phrase reecrite ici serait une phrase de plus a tenir a
// jour, et la premiere a devenir fausse.
//
// Sept sections, dans cet ordre, parce que c'est l'ordre dans lequel la
// question se pose : qui, quoi, quelles preuves, quels projets, quel
// parcours, travailler ensemble, comment me joindre.
// =====================================================================

export const dynamic = "force-dynamic";

/** Le produit du registre vers lequel mene chaque porte, pour la mesure des
 *  sorties. La porte des partenaires n'a pas d'adresse, donc pas d'entree. */
const PRODUIT_DE_PORTE: Record<string, string> = {
  strata: "strata-platform",
  pharivo: "pharivo",
};

/** Trois preuves, les plus fortes. L'ordre vient du registre lui-meme, il
 *  n'est pas recalcule ici : le classement editorial appartient au registre. */
const PREUVES_EN_TETE = 3;

export const metadata: Metadata = {
  title: "Profil professionnel",
  description: `${IDENTITE.situation} ${IDENTITE.capacite}`,
  alternates: { canonical: "/recruteur" },
  openGraph: {
    title: "Adama Diallo, profil professionnel",
    description: IDENTITE.situation,
    url: "/recruteur",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "profile",
  },
};

function Section({
  numero,
  titre,
  duree,
  children,
}: {
  numero: string;
  titre: string;
  duree: string;
  children: React.ReactNode;
}) {
  return (
    <section className="hire-section" aria-labelledby={`hire-${numero}`}>
      <header className="hire-section-head">
        <p className="portfolio-label" id={`hire-${numero}`}>
          <span>{numero} /</span> {titre}
        </p>
        <span className="hire-duree">{duree}</span>
      </header>
      {children}
    </section>
  );
}

export default async function RecruteurPage() {
  const maintenant = new Date();
  const claims = await listClaims({ visibility: ["public"], now: maintenant });
  const preuves = claims.slice(0, PREUVES_EN_TETE);
  const proofStates: Record<string, ClaimState> = {};
  for (const c of claims) {
    proofStates[c.row.id] = c.state;
  }
  const cartes = cartesProjet();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/recruteur"),
    inLanguage: "fr-FR",
    mainEntity: {
      "@type": "Person",
      name: IDENTITE.nom,
      jobTitle: POSTE_ACTUEL,
      description: IDENTITE.capacite,
      worksFor: ORGANISATIONS_ACTUELLES.map((o) => ({
        "@type": "Organization",
        name: o.organisation,
      })),
    },
  };

  return (
    <PageShell tools={false} className="hire-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* 01. Qui, en une phrase. */}
      <header className="hire-intro">
        <div className="hire-section-head">
          <p className="portfolio-label">
            <span>01 /</span> QUI
          </p>
          <span className="hire-duree">10 secondes</span>
        </div>
        <p className="hero-eyebrow">
          <span className="status-dot" /> {TITRE_COURT.affiche}
        </p>
        <h1>
          {IDENTITE.prenom} <span className="serif">{IDENTITE.patronyme}.</span>
        </h1>
        <p className="hire-capacite">{IDENTITE.capacite}</p>
        <p className="hire-situation">{IDENTITE.situation}</p>
        <p className="hire-dispo">
          <span className="note-line" aria-hidden="true" />
          <strong>{OUVERTURE}</strong>
        </p>
        <HireActions source="recruteur" />
      </header>

      {/* 02. Ce que je sais faire. */}
      <Section numero="02" titre="CE QUE JE SAIS FAIRE" duree="20 secondes">
        <SkillCards proofStates={proofStates} titre="TROIS DOMAINES" compact />
      </Section>

      {/* 03. Trois preuves, verifiables par n'importe quel visiteur. */}
      <Section numero="03" titre="TROIS PREUVES" duree="20 secondes">
        {preuves.length === 0 ? (
          <p className="hire-vide">
            Le registre de preuve ne répond pas. Rien n’est affiché à la place :
            c’est la règle qui gouverne tout ce site, et elle vaut aussi quand
            elle dérange.
          </p>
        ) : (
          <ol className="hire-preuves">
            {preuves.map((c) => (
              <li key={c.row.id}>
                <p className="hire-preuve-statement">{c.row.statement}</p>
                <div className="hire-preuve-foot">
                  <DataClassMark claim={c.claim} state={c.state} />
                  <Link href={`/verifier/${c.row.id}`}>
                    Vérifier <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="hire-plus">
          Toutes les affirmations de ce site, avec leur état de fraîcheur, sont
          dans{" "}
          <Link href="/preuves">
            l’index des preuves <span aria-hidden="true">↗</span>
          </Link>
          .
        </p>
      </Section>

      {/* 04. Projets, quatre maximum. */}
      <Section numero="04" titre="PROJETS" duree="15 secondes">
        <ul className="hire-projets">
          {cartes.map((projet) => (
            <li key={projet.slug}>
              <div className="hire-projet-head">
                <h3>{projet.titre}</h3>
                <span data-etat={projet.etat}>{projet.etatLabel}</span>
              </div>
              <p>{projet.resume}</p>
              <p className="hire-projet-role">
                Mon rôle : <strong>{projet.roleEnUnMot}</strong>
              </p>
              <Link href={`/projets/${projet.slug}`}>
                Lire la fiche <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 05. Experiences et formation. La marque de l'organisation precede son
          nom, en encre et sans etat au survol : cette page se lit vite, et
          souvent sur papier. Elle est decorative, le nom qui suit porte
          l'information. */}
      <Section numero="05" titre="EXPÉRIENCES ET FORMATION" duree="10 secondes">
        <ul className="hire-experiences">
          {EXPERIENCES.map((exp) => (
            <li key={exp.id}>
              <span className="hire-exp-org">
                <OrgMark
                  id={exp.id}
                  nom={exp.organisation}
                  decoratif
                  couleurAuSurvol={false}
                  hauteur={30}
                />
                {exp.organisation}
                {exp.precision ? <small>{exp.precision}</small> : null}
              </span>
              <span className="hire-exp-role">{exp.role}</span>
              <span className="hire-exp-cat">{exp.categorie}</span>
            </li>
          ))}
          {FORMATION.map((f) => (
            <li key={f.id}>
              <span className="hire-exp-org">
                <OrgMark
                  id={f.id}
                  nom={f.organisation}
                  decoratif
                  couleurAuSurvol={false}
                  hauteur={30}
                />
                {f.organisation}
                <small>{f.precision}</small>
              </span>
              <span className="hire-exp-role">Formation</span>
              <span className="hire-exp-cat">FORMATION</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 06. Travailler ensemble. Trois publics, chacun avec l'adresse de la
          maison qui lui repond. Aucun prix ni aucune offre ici : les
          conditions vivent sur le site de chaque maison. */}
      <Section numero="06" titre="TRAVAILLER ENSEMBLE" duree="10 secondes">
        <dl className="hire-recherche hire-portes">
          {PORTES_ENTREE.map((porte) => (
            <div key={porte.id}>
              <dt>{porte.public}</dt>
              <dd>
                {porte.objet}
                {porte.lien ? (
                  <>
                    {" "}
                    <OutboundLink
                      href={porte.lien}
                      product={PRODUIT_DE_PORTE[porte.id] ?? porte.id}
                      division={porte.id === "pharivo" ? "Pharivo" : "STRATA"}
                      source="profil"
                    >
                      {porte.libelleLien} <span aria-hidden="true">↗</span>
                    </OutboundLink>
                  </>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* 07. CV et contact. */}
      <Section numero="07" titre="CV ET CONTACT" duree="5 secondes">
        <div className="hire-contact">
          <p>
            Écrivez-moi directement, ou réservez un créneau. Je réponds à chaque
            message.
          </p>
          <a className="hire-mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL} <span aria-hidden="true">↗</span>
          </a>
          <HireActions source="recruteur-bas" />
        </div>
      </Section>

      {/* C10-T10, la bascule croisee. Les deux publics arrivent souvent par
          le mauvais bout, et rien ne doit les y retenir. Un lecteur technique
          qui atterrit ici doit pouvoir passer a l'inspection en un geste. */}
      <section className="page-next">
        <div>
          <p className="portfolio-label">SI VOUS ÊTES INGÉNIEUR</p>
          <h2>
            L’autre lecture, <span className="serif">celle du code.</span>
          </h2>
          <p>
            L’inventaire généré du dépôt, les frontières de données, les
            contrats des interfaces publiques et les dix contrôles d’intégrité.
            Vingt à quarante minutes.
          </p>
        </div>
        <Link href="/technique" className="portfolio-button primary">
          Ouvrir la vue technique <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">POUR ALLER PLUS LOIN</p>
          <h2>
            Comment je décide,{" "}
            <span className="serif">et ce que ça coûte.</span>
          </h2>
          <p>
            Le journal des décisions d’architecture, ce sur quoi je suis revenu,
            et les six principes qui en sont dérivés.
          </p>
        </div>
        <Link href="/decisions" className="portfolio-button primary">
          Ouvrir le journal <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

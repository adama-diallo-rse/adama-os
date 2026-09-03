// =====================================================================
// C5-T4, le rendu d'une fiche projet.
//
// Huit blocs, dans l'ordre, aucun optionnel. Le type FicheProjet les rend
// obligatoires a la compilation : une fiche a laquelle il manque un bloc ne
// compile pas, donc la construction s'arrete.
//
// La double lecture. Un recruteur doit pouvoir lire 01, 02 et 07 puis
// repartir sans avoir l'impression d'avoir saute des choses ; un directeur
// technique doit trouver 03, 04 et 06. Le dispositif retenu est le sommaire
// lateral, qui annonce les huit blocs des la premiere seconde : ce qu'on
// voit annonce, on ne croit pas l'avoir manque.
//
// Ce composant ne recopie AUCUNE preuve et AUCUNE decision. Le bloc 05
// recoit les affirmations lues dans proof_claims, le bloc 04 les decisions
// lues dans decisions_log. Une fiche declare a quels sujets elle se
// rattache, rien de plus.
// =====================================================================

import Link from "next/link";
import { Proof } from "./proof/proof";
import {
  BLOCS,
  DOMAINES_ROLE,
  DOMAINE_LABEL,
  ETAT_LABEL,
  type FicheProjet,
} from "../content/projets";
import type { ProofClaim } from "../lib/proof/claims";
import {
  IMPACT_LABEL,
  REVERSIBILITE_COURT,
  STATUT_LABEL,
  type Adr,
} from "../lib/adr";

export function ProjectSheet({
  fiche,
  claims,
  decisions,
}: {
  fiche: FicheProjet;
  claims: ProofClaim[];
  decisions: Adr[];
}) {
  return (
    <div className="case-layout">
      {/* Sommaire lateral au dessus de 1100 pixels, replie en haut en
          dessous. C'est lui qui rend la double lecture possible. */}
      <nav className="case-toc" aria-label="Les huit blocs de la fiche">
        <p className="portfolio-label">LA FICHE</p>
        <ol>
          {BLOCS.map((bloc) => (
            <li key={bloc.id}>
              <a href={`#bloc-${bloc.id}`}>
                <span>{bloc.numero}</span> {bloc.titre}
              </a>
            </li>
          ))}
        </ol>
        <p className="case-toc-note">
          Même gabarit sur les trois fiches. Elles se comparent.
        </p>
      </nav>

      <div className="case-body">
        {/* 01 Probleme ------------------------------------------------ */}
        <section id="bloc-probleme" className="case-bloc">
          <h2>
            <span>01</span> Problème
          </h2>
          {fiche.probleme.map((paragraphe) => (
            <p key={paragraphe.slice(0, 40)}>{paragraphe}</p>
          ))}
        </section>

        {/* 02 Mon role ------------------------------------------------ */}
        <section id="bloc-role" className="case-bloc case-bloc--role">
          <h2>
            <span>02</span> Mon rôle
          </h2>
          {fiche.role.aValider ? (
            <p className="case-avalider" role="note">
              <strong>Formulation proposée, en attente de relecture.</strong> Ce
              bloc a été rédigé à partir de ce que le dépôt démontre. Tant
              qu’Adama ne l’a pas relu, il n’est pas donné comme sa parole. Les
              questions auxquelles lui seul peut répondre sont listées en fin de
              bloc.
            </p>
          ) : null}
          <table className="case-roles">
            <caption className="proof-sr">
              Niveau de responsabilité par domaine. Deux valeurs seulement,
              responsable ou contributeur. Aucun pourcentage, aucune barre de
              niveau.
            </caption>
            <tbody>
              {DOMAINES_ROLE.map((domaine) => (
                <tr key={domaine}>
                  <th scope="row">{DOMAINE_LABEL[domaine]}</th>
                  <td data-niveau={fiche.role.niveaux[domaine]}>
                    {fiche.role.niveaux[domaine]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="case-role-phrases">
            {fiche.role.phrases.map((phrase) => (
              <p key={phrase.slice(0, 40)}>{phrase}</p>
            ))}
          </div>
          {fiche.role.questions.length > 0 ? (
            <div className="case-questions">
              <p className="portfolio-label">CE QUE SEUL ADAMA PEUT TRANCHER</p>
              <ul>
                {fiche.role.questions.map((q) => (
                  <li key={q.slice(0, 40)}>{q}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* 03 Architecture et stack ----------------------------------- */}
        <section id="bloc-architecture" className="case-bloc">
          <h2>
            <span>03</span> Architecture et stack
          </h2>
          <figure className="case-schema">
            <div className="case-schema-flow" aria-hidden="true">
              {fiche.architecture.schema.colonnes.map((colonne, index) => (
                <div className="case-schema-col" key={colonne.titre}>
                  <span className="case-schema-titre">{colonne.titre}</span>
                  <ul>
                    {colonne.noeuds.map((noeud) => (
                      <li key={noeud}>{noeud}</li>
                    ))}
                  </ul>
                  {index < fiche.architecture.schema.colonnes.length - 1 ? (
                    <span className="case-schema-arrow">→</span>
                  ) : null}
                </div>
              ))}
            </div>
            <figcaption>
              <span className="proof-sr">{fiche.architecture.schema.flux}</span>
              <span aria-hidden="true">
                {fiche.architecture.schema.legende}
              </span>
            </figcaption>
          </figure>
          <p className="portfolio-label">
            TECHNOLOGIES RÉELLEMENT INSTALLÉES
            {fiche.architecture.stackSource === "inventaire"
              ? " · LISTE VÉRIFIÉE PAR L’INVENTAIRE"
              : " · LISTE SAISIE ET RELUE"}
          </p>
          <ul className="case-stack">
            {fiche.architecture.stack.map((techno) => (
              <li key={techno.nom}>
                <code>{techno.nom}</code>
                <span>{techno.role}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 04 Decisions ----------------------------------------------- */}
        <section id="bloc-decisions" className="case-bloc">
          <h2>
            <span>04</span> Décisions
          </h2>
          {decisions.length === 0 ? (
            <p className="case-vide">
              Le journal d’architecture ne sert aucune décision pour ce projet
              aujourd’hui. Rien n’est écrit ici à la place : les décisions
              vivent dans un registre, elles ne se recopient pas dans une fiche.
            </p>
          ) : (
            <ul className="case-decisions">
              {decisions.map((adr) => (
                <li key={adr.adr_id}>
                  <Link href={`/decisions/${adr.adr_id}`}>
                    <span className="case-adr-id">{adr.adr_id}</span>
                    <span className="case-adr-titre">{adr.title}</span>
                  </Link>
                  <span className="case-adr-meta">
                    {STATUT_LABEL[adr.status]} · {IMPACT_LABEL[adr.impact]} ·{" "}
                    {REVERSIBILITE_COURT[adr.reversibility]}
                  </span>
                  <p>{adr.tradeoff}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 05 Preuves ------------------------------------------------- */}
        <section id="bloc-preuves" className="case-bloc">
          <h2>
            <span>05</span> Preuves
          </h2>
          {claims.length === 0 ? (
            <p className="case-vide">
              Le registre de preuve ne sert aucune affirmation pour ce projet
              aujourd’hui. Une affirmation sans preuve n’est pas grisée, elle
              est absente : c’est la règle du site, et elle vaut aussi ici.
            </p>
          ) : (
            <div className="case-preuves">
              {claims.map((claim) => (
                <Proof key={claim.row.id} claim={claim} showProvenance />
              ))}
            </div>
          )}
        </section>

        {/* 06 Compromis ----------------------------------------------- */}
        <section id="bloc-compromis" className="case-bloc case-bloc--compromis">
          <h2>
            <span>06</span> Compromis
          </h2>
          <p className="case-bloc-intro">
            Ce qui a été volontairement refusé, et ce que ce refus coûte.
          </p>
          <ul className="case-compromis">
            {fiche.compromis.map((c) => (
              <li key={c.refuse}>
                <p className="case-refuse">{c.refuse}</p>
                <p className="case-raison">{c.raison}</p>
                <p className="case-cout">
                  <span>Ce que ça coûte</span> {c.cout}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 07 Etat ---------------------------------------------------- */}
        <section id="bloc-etat" className="case-bloc">
          <h2>
            <span>07</span> État
          </h2>
          <p className="case-etat" data-etat={fiche.etat.valeur}>
            {ETAT_LABEL[fiche.etat.valeur]}
          </p>
          <p>{fiche.etat.precision}</p>
        </section>

        {/* 08 Suite --------------------------------------------------- */}
        <section id="bloc-suite" className="case-bloc">
          <h2>
            <span>08</span> Suite
          </h2>
          <ul className="case-suite">
            {fiche.suite.map((ligne) => (
              <li key={ligne.slice(0, 40)}>{ligne}</li>
            ))}
          </ul>
          <p className="case-sans-promesse">
            Sans date annoncée. Une date de livraison qui n’engage personne
            n’est pas une information.
          </p>
        </section>
      </div>
    </div>
  );
}

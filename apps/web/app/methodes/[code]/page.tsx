import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageIntro, PageShell } from "../../../components/page-shell";
import {
  CANDIDATES_M001,
  MESURE_M001,
  PROBLEME_M001,
  REGLE_PASSAGE_M001,
} from "../../../content/dossier-m001";
import { RELEVES_M001, totauxDe } from "../../../content/mesures";
import {
  METHODES,
  NIVEAUX_VISIBILITE,
  methodeDe,
  texteClauseRenvoi,
  type FicheMethode,
  type LienPublic,
} from "../../../content/methodes";

// EM0, EM1 et EM2 : la fiche d'une méthode, ses dix-sept champs dans
// l'ordre de la fiche type, et pour M-001 son dossier de référence avec la
// mesure de résultat. Un champ sans valeur s'affiche comme un manque.

export const dynamicParams = false;

export function generateStaticParams() {
  return METHODES.map((m) => ({ code: m.identifiant.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const methode = methodeDe(code);
  if (!methode) return {};
  return {
    title: `${methode.identifiant}, ${methode.nomAffiche}`,
    description: `Fiche de méthode, état ${methode.etat}. ${methode.pourMonter}`,
    alternates: { canonical: `/methodes/${code}` },
  };
}

const dateLongue = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${date.slice(0, 10)}T12:00:00+02:00`));

function Lien({ lien }: { lien: LienPublic }) {
  return lien.href.startsWith("/") ? (
    <Link href={lien.href}>{lien.libelle}</Link>
  ) : (
    <a href={lien.href} target="_blank" rel="noopener noreferrer">
      {lien.libelle} <span aria-hidden="true">↗</span>
    </a>
  );
}

const Manque = ({ children }: { children: ReactNode }) => (
  <span className="strates-manque">{children}</span>
);

function lignesFiche(m: FicheMethode): [string, ReactNode][] {
  return [
    ["Identifiant", <code key="id">{m.identifiant}</code>],
    [
      "Nom",
      m.nom === m.nomAffiche ? (
        m.nom
      ) : (
        <>
          {m.nomAffiche}
          <small> Identifiant stable : {m.nom}</small>
        </>
      ),
    ],
    ["Version", m.version],
    [
      "État de maturité",
      <>
        <span className="strates-etat" data-etat={m.etat}>
          {m.etat}
        </span>
        <small>
          {" "}
          Justifié par <Lien lien={m.preuveEtat} />, le{" "}
          {dateLongue(m.preuveEtat.date)}.
        </small>
      </>,
    ],
    [
      "Utilisée dans",
      m.utiliseeDans.length ? (
        <ul>
          {m.utiliseeDans.map((l) => (
            <li key={l.href}>
              <Lien lien={l} />
            </li>
          ))}
        </ul>
      ) : (
        <Manque>Manque : aucun usage publié.</Manque>
      ),
    ],
    ["Date de documentation", dateLongue(m.dateDocumentation)],
    [
      "Composants",
      <ul key="c">
        {m.composants.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>,
    ],
    [
      "Dépendances",
      m.dependances.length
        ? m.dependances.map((d, i) => (
            <span key={d}>
              {i > 0 && ", "}
              <Link href={`/methodes/${d.toLowerCase()}`}>{d}</Link>
            </span>
          ))
        : "Aucune dépendance déclarée.",
    ],
    [
      "Limites connues",
      <ul key="l">
        {m.limitesConnues.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>,
    ],
    [
      "Journal des versions",
      <ul key="j">
        {m.journal.map((v) => (
          <li key={`${v.version}-${v.date}`}>
            <code>{v.version}</code> {dateLongue(v.date)}, {v.changement}
          </li>
        ))}
      </ul>,
    ],
    ["Droits", m.droits],
    ["Source", <Lien key="s" lien={m.source} />],
    ["Date de dernière revue", dateLongue(m.dateDerniereRevue)],
    [
      "Niveau de visibilité",
      `${m.visibilite}, ${NIVEAUX_VISIBILITE[m.visibilite].toLowerCase()}`,
    ],
    [
      "Clause de renvoi STRATA",
      <>
        {texteClauseRenvoi(m.clauseRenvoi)}
        {m.clauseRenvoi.produit !== null && (
          <small>
            {" "}
            Prix relevé sur{" "}
            <a
              href={m.clauseRenvoi.grille}
              target="_blank"
              rel="noopener noreferrer"
            >
              la grille publique de STRATA ESG
            </a>{" "}
            le {dateLongue(m.clauseRenvoi.prixVerifieLe)}.
          </small>
        )}
      </>,
    ],
    ["Ce qu’il faut pour monter", m.pourMonter],
    [
      "Mesure de résultat publiée",
      m.mesure ? (
        <>
          <Link href={m.mesure.href}>{m.mesure.titre}</Link>
          <small>
            {" "}
            Relevé du {dateLongue(m.mesure.releveLe)}. {m.mesure.resultat}
          </small>
        </>
      ) : (
        <Manque>Aucune mesure publiée.</Manque>
      ),
    ],
  ];
}

const VERDICTS: Record<string, string> = {
  concordant: "Concordante",
  valeur_changee: "Reproduite, valeur changée",
  discordant: "Discordante",
  non_reproductible: "Non reproductible",
  hors_tiers: "Déclarée hors tiers",
};

function DossierM001() {
  const releve = RELEVES_M001[0];
  if (!releve) return null;
  const t = totauxDe(releve);
  const historique = RELEVES_M001.map((r) => ({
    releve: r,
    totaux: totauxDe(r),
  }));
  // Le résultat défavorable reste affiché, daté du relevé qui l'a porté,
  // même quand un relevé plus récent ne compte plus de discordance.
  const defavorable = [...historique]
    .reverse()
    .find((h) => h.totaux.discordant > 0);
  return (
    <>
      <section className="strates-dossier" aria-labelledby="probleme">
        <p className="portfolio-label">DOSSIER DE RÉFÉRENCE / 01</p>
        <h2 id="probleme">Ce que la méthode résout.</h2>
        <div>
          {PROBLEME_M001.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section
        className="strates-mesure"
        id="mesure"
        aria-labelledby="titre-mesure"
      >
        <header>
          <div>
            <p className="portfolio-label">
              DOSSIER DE RÉFÉRENCE / 02 / MESURE DE RÉSULTAT
            </p>
            <h2 id="titre-mesure">{MESURE_M001.nom}.</h2>
            <p>{MESURE_M001.definition}</p>
          </div>
          <div className="strates-chiffre">
            <strong>
              {t.concordant}/{t.preuves}
            </strong>
            <span>
              preuves reproduites, soit {t.taux ?? 0} %. Relevé du{" "}
              <time dateTime={releve.releveLe}>
                {dateLongue(releve.releveLe)}
              </time>
              , recalculé depuis le fichier publié.
            </span>
            <i
              aria-hidden="true"
              style={{
                ["--part" as string]: t.preuves ? t.concordant / t.preuves : 0,
              }}
            />
          </div>
        </header>

        <dl className="strates-protocole">
          {(
            [
              ["Formule", MESURE_M001.formule],
              ["Source", MESURE_M001.source],
              ["Périmètre", MESURE_M001.perimetre],
              ["Méthode", MESURE_M001.methode],
              ["Ce qu’elle prouve", MESURE_M001.prouve],
            ] as const
          ).map(([dt, dd]) => (
            <div key={dt}>
              <dt>{dt}</dt>
              <dd>{dd}</dd>
            </div>
          ))}
          <div>
            <dt>Ce qu’elle ne prouve pas</dt>
            <dd>
              <ul>
                {MESURE_M001.neProuvePas.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>Rejouer</dt>
            <dd>
              <code>{MESURE_M001.commande}</code>, depuis une copie du{" "}
              <a
                href="https://github.com/adama-diallo-rse/adama-os/blob/main/scripts/mesure-m001.mjs"
                target="_blank"
                rel="noopener noreferrer"
              >
                dépôt public
              </a>
              , sans compte ni jeton.
            </dd>
          </div>
        </dl>

        <div
          className="strates-table"
          role="region"
          aria-label="Les preuves relevées"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Affirmation</th>
                <th scope="col">Nature</th>
                <th scope="col">Publié</th>
                <th scope="col">Ré-observé</th>
                <th scope="col">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {releve.preuves.map((p, i) => (
                <tr
                  key={`${p.affirmation}-${p.adresse}-${i}`}
                  data-verdict={p.verdict}
                >
                  <td>
                    <Link href={`/verifier/${p.affirmation}`}>
                      {p.affirmation}
                    </Link>
                  </td>
                  <td>{p.nature}</td>
                  <td>{p.publie}</td>
                  <td>{p.reobserve}</td>
                  <td>{VERDICTS[p.verdict] ?? p.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {defavorable && (
          <aside className="strates-negatif">
            <p className="portfolio-label">
              RÉSULTAT DÉFAVORABLE, PUBLIÉ AUSSI
            </p>
            <p>
              Au relevé du {dateLongue(defavorable.releve.releveLe)},{" "}
              {defavorable.totaux.discordant} preuves étaient discordantes :
              deux dépôts privés étaient présentés comme lisibles par un
              visiteur. L’erreur est inscrite au registre public, avec l’ancien
              texte à côté de ce qui est vrai.
            </p>
            <Link href="/erreurs#fail-003">
              Lire FAIL-003 <span aria-hidden="true">→</span>
            </Link>
          </aside>
        )}

        <div className="strates-releves">
          <p className="portfolio-label">
            RELEVÉS PUBLIÉS / DU PLUS RÉCENT AU PLUS ANCIEN
          </p>
          <ol>
            {historique.map(({ releve: r, totaux: h }) => (
              <li key={r.releveLe}>
                <time dateTime={r.releveLe}>{dateLongue(r.releveLe)}</time>
                <strong>
                  {h.concordant}/{h.preuves}
                </strong>
                <span>
                  {h.discordant} discordante{h.discordant > 1 ? "s" : ""},{" "}
                  {h.horsTiers} déclarée{h.horsTiers > 1 ? "s" : ""} hors tiers
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="strates-candidates">
          <p className="portfolio-label">POURQUOI CETTE MESURE</p>
          <ul>
            {CANDIDATES_M001.map((c) => (
              <li key={c.nom} data-retenue={c.retenue}>
                <strong>
                  {c.nom}
                  {c.retenue ? ", retenue" : ", écartée"}
                </strong>
                <p>{c.raison}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="strates-dossier" aria-labelledby="passage">
        <p className="portfolio-label">DOSSIER DE RÉFÉRENCE / 03</p>
        <h2 id="passage">
          Ce qui ferait monter l’état, et le ferait redescendre.
        </h2>
        <div>
          <ol>
            {REGLE_PASSAGE_M001.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <p className="strates-constat">{REGLE_PASSAGE_M001.constat}</p>
          <p>{REGLE_PASSAGE_M001.redescente}</p>
        </div>
      </section>
    </>
  );
}

export default async function MethodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const methode = methodeDe(code);
  if (!methode) notFound();

  return (
    <PageShell className="methode-fiche-page strates-page">
      <PageIntro
        eyebrow={`${methode.identifiant} / ${methode.codeAxp} / VERSION ${methode.version}`}
        title={methode.nomAffiche}
        description={`Fiche de méthode au format à dix-sept champs. ${methode.composants.join(" ")}`}
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ÉTAT DE MATURITÉ</span>
            <strong className="strates-etat-grand" data-etat={methode.etat}>
              {methode.etat}
            </strong>
            <p>Pour monter : {methode.pourMonter}</p>
          </div>
        }
      />

      <section
        className="strates-fiche"
        aria-label="Les dix-sept champs de la fiche"
      >
        <dl>
          {lignesFiche(methode).map(([champ, valeur], index) => (
            <div key={champ} style={{ ["--rang" as string]: index }}>
              <dt>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {champ}
              </dt>
              <dd>{valeur}</dd>
            </div>
          ))}
        </dl>
      </section>

      {methode.identifiant === "M-001" && <DossierM001 />}

      <section className="page-next">
        <div>
          <p className="portfolio-label">BIBLIOTHÈQUE</p>
          <h2>
            Les six autres méthodes,
            <span className="serif"> au même format.</span>
          </h2>
        </div>
        <Link href="/methodes" className="portfolio-button primary">
          Toutes les méthodes <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

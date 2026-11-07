import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import {
  estAdministrateur,
  lireConfigLettre,
} from "../../../lib/lettre/config";
import { editionVide, numeroAffiche } from "../../../lib/lettre/editions";
import {
  type EtatListe,
  type LigneNote,
  etatListe,
  listerNotes,
} from "../../../lib/lettre/registre";
import {
  type LigneEdition,
  listerEditions,
} from "../../../lib/lettre/registre-editions";
import { createClient } from "../../../lib/supabase/server";
import { STOCK_SIGNAL } from "../../../content/signal-stock";
import {
  envoyerLotDuJour,
  envoyerLotEditionDuJour,
  importerStockSignal,
  supprimerBrouillonEdition,
} from "./actions";
import { LexiqueAnglaisEH1 } from "./lexique-anglais";
import { ExerciceDroits, RedactionNote } from "./redaction";
import { RedactionEdition } from "./redaction-edition";

// =====================================================================
// EH0, la console privee de la lettre.
//
// Ce qui se lit ici ne sort jamais : aucun compteur d'inscrits n'est publie
// (XINV-21). La console dit si la plomberie est complete, ce que la liste
// contient, et porte les gestes recurrents : le numero de SIGNAL (EH4), la
// note du trimestre et les demandes de personnes, acces ou effacement.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console de la lettre",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function dateHeure(iso: string | null): string {
  if (!iso) return "jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

const LIBELLES_STATUT = {
  brouillon: "Brouillon",
  envoi_en_cours: "Envoi en cours",
  envoyee: "Envoyée",
} as const;

const LIBELLES_STATUT_EDITION = {
  brouillon: "Brouillon",
  envoi_en_cours: "Envoi en cours",
  envoyee: "Paru",
} as const;

export default async function ConsoleLettrePage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const utilisateur = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;
  if (!utilisateur) {
    redirect("/login?redirect=/admin/lettre");
  }

  const lecture = lireConfigLettre();
  const administrateur =
    lecture.ok && estAdministrateur(lecture.config, utilisateur.email);

  let etat: EtatListe | null = null;
  let notes: LigneNote[] = [];
  let editions: LigneEdition[] = [];
  let erreurBase: string | null = null;
  let erreurEditions: string | null = null;
  if (lecture.ok && administrateur) {
    try {
      [etat, notes] = await Promise.all([
        etatListe(lecture.config),
        listerNotes(lecture.config),
      ]);
    } catch (erreur) {
      erreurBase =
        erreur instanceof Error
          ? erreur.message
          : "Base de la lettre illisible.";
    }
    if (!erreurBase) {
      try {
        editions = await listerEditions(lecture.config);
      } catch (erreur) {
        erreurEditions =
          erreur instanceof Error ? erreur.message : "Éditions illisibles.";
      }
    }
  }

  const editionChoisie =
    typeof params.edition === "string"
      ? (editions.find((e) => e.id === params.edition) ?? null)
      : null;
  const prochainNumero =
    editions.reduce((max, e) => Math.max(max, e.contenu.numero), 0) + 1;
  const stockManquant = STOCK_SIGNAL.filter(
    (s) => !editions.some((e) => e.contenu.numero === s.numero),
  ).length;

  const noteChoisie =
    typeof params.note === "string"
      ? (notes.find((n) => n.id === params.note) ?? null)
      : null;
  const ok = typeof params.ok === "string" ? params.ok : null;
  const erreur = typeof params.erreur === "string" ? params.erreur : null;

  return (
    <PageShell tools={false} className="lettre-page">
      <PageIntro
        eyebrow="ESPACE PRIVÉ / LETTRE SIGNAL"
        title={
          <>
            La lettre, <span className="serif">sa plomberie.</span>
          </>
        }
        description={`Connecté : ${utilisateur.email ?? ""}`}
        aside={
          <Link href="/admin" className="header-contact">
            Retour à l’administration ↗
          </Link>
        }
      />

      <div className="lettre-console">
        {ok ? (
          <p className="lettre-console-ok" role="status">
            {ok}
          </p>
        ) : null}
        {erreur ? (
          <p className="lettre-console-alerte" role="alert">
            {erreur}
          </p>
        ) : null}

        <section aria-labelledby="config-titre">
          <p className="portfolio-label">1. PLOMBERIE</p>
          <h2 id="config-titre">Configuration</h2>
          {!lecture.ok ? (
            <div className="lettre-console-alerte" role="alert">
              La lettre n’est pas configurée sur cet environnement. Rien ne peut
              partir.
              {lecture.manquants.length ? (
                <ul>
                  {lecture.manquants.map((m) => (
                    <li key={m}>manquant : {m}</li>
                  ))}
                </ul>
              ) : null}
              {lecture.refus.length ? (
                <ul>
                  {lecture.refus.map((r) => (
                    <li key={r}>refus : {r}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : !administrateur ? (
            <p className="lettre-console-alerte" role="alert">
              Ce compte n’est pas nommé dans LETTRE_ADMINISTRATEURS. La console
              reste fermée.
            </p>
          ) : (
            <p className="lettre-console-ok">
              Configuration complète. Expédition depuis{" "}
              <strong>{lecture.config.domaineEnvoi}</strong>, réponses vers{" "}
              <strong>{lecture.config.reponse}</strong>, plafond de{" "}
              {lecture.config.plafondJour} envois par jour. Collecte{" "}
              <strong>
                {lecture.config.collecteOuverte ? "ouverte" : "fermée"}
              </strong>
              .
            </p>
          )}
          {erreurBase ? (
            <p className="lettre-console-alerte" role="alert">
              La base dédiée ne répond pas : {erreurBase}. Vérifier que la
              migration 0001_lettre a été jouée dans le projet dédié.
            </p>
          ) : null}
        </section>

        {etat ? (
          <section aria-labelledby="liste-titre">
            <p className="portfolio-label">2. LISTE, LECTURE PRIVÉE</p>
            <h2 id="liste-titre">État de la liste</h2>
            <dl className="lettre-tuiles">
              <div>
                <dt>Confirmées</dt>
                <dd>{etat.confirmes}</dd>
              </div>
              <div>
                <dt>En attente</dt>
                <dd>{etat.en_attente}</dd>
              </div>
              <div>
                <dt>Désinscrites</dt>
                <dd>{etat.desinscrits}</dd>
              </div>
              <div>
                <dt>Bienvenues à rejouer</dt>
                <dd>{etat.bienvenues_en_attente}</dd>
              </div>
              <div>
                <dt>Envois du jour</dt>
                <dd>{etat.envois_du_jour}</dd>
              </div>
              {typeof etat.editions_parues === "number" ? (
                <div>
                  <dt>Numéros parus</dt>
                  <dd>{etat.editions_parues}</dd>
                </div>
              ) : null}
              {typeof etat.confirmes_en === "number" ? (
                <div>
                  <dt>Lecteurs FR / EN</dt>
                  <dd>
                    {etat.confirmes_fr ?? 0} / {etat.confirmes_en}
                  </dd>
                </div>
              ) : null}
            </dl>
            <p className="auth-note" style={{ marginTop: 12 }}>
              Dernière purge de rétention : {dateHeure(etat.derniere_purge)}.
              Consentement en vigueur : {etat.consentement_version ?? "aucun"}.
            </p>
          </section>
        ) : null}

        {lecture.ok && administrateur && !erreurBase ? (
          <>
            <section aria-labelledby="lexique-eh1-titre">
              <p className="portfolio-label">3. EH1, VOCABULAIRE ANGLAIS</p>
              <h2 id="lexique-eh1-titre">Liste provisoire avant EB11</h2>
              <p className="auth-note">
                Les douze interdits d’ADEC-19, leurs équivalents anglais et la
                différence entre un usage anglais protégé ou banal.
              </p>
              <LexiqueAnglaisEH1 />
            </section>

            <section
              id="editions"
              className="edition-console"
              aria-labelledby="editions-titre"
            >
              <p className="portfolio-label">4. SIGNAL, LES NUMÉROS</p>
              <h2 id="editions-titre">
                {editionChoisie
                  ? editionChoisie.statut === "brouillon"
                    ? `Modifier SIGNAL #${numeroAffiche(editionChoisie.contenu.numero)}`
                    : `Corriger SIGNAL #${numeroAffiche(editionChoisie.contenu.numero)}`
                  : "Rédiger un numéro"}
              </h2>
              <p className="auth-note">
                Cinq blocs, deux langues, un numéro à vie. Chaque abonné reçoit
                le numéro dans sa langue. Les numéros partent dans l’ordre, par
                lots, dans la limite du plafond du jour ; une fois parti, un
                numéro a sa page publique et ne change plus que par une
                correction motivée.
              </p>
              {erreurEditions ? (
                <p className="lettre-console-alerte" role="alert">
                  Les éditions ne sont pas lisibles : {erreurEditions}. Jouer la
                  migration 0003_editions dans le projet dédié.
                </p>
              ) : (
                <>
                  {stockManquant > 0 ? (
                    <form
                      action={importerStockSignal}
                      className="edition-stock"
                    >
                      <p>
                        <strong>Stock EX1.</strong> {stockManquant} numéro
                        {stockManquant > 1 ? "s" : ""} rédigé
                        {stockManquant > 1 ? "s" : ""} et pas encore dans la
                        base. L’import les crée en brouillons non relus.
                      </p>
                      <button type="submit" className="portfolio-button ghost">
                        Importer le stock
                      </button>
                    </form>
                  ) : null}
                  {editions.length ? (
                    <ol className="edition-liste">
                      {editions.map((e) => (
                        <li key={e.id} data-statut={e.statut}>
                          <div className="edition-liste-tete">
                            <code>#{numeroAffiche(e.contenu.numero)}</code>
                            <span
                              className="edition-statut"
                              data-statut={e.statut}
                            >
                              {LIBELLES_STATUT_EDITION[e.statut]}
                            </span>
                            {e.version > 1 ? (
                              <span className="edition-version">
                                v{e.version}
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <strong>{e.contenu.fr.titre}</strong>
                            <p className="auth-note">
                              {e.contenu.en.titre}. {e.envois} envoi
                              {e.envois > 1 ? "s" : ""}.{" "}
                              {e.statut === "brouillon"
                                ? e.relue
                                  ? "Relu, prêt à partir."
                                  : "Relecture à cocher."
                                : e.envoi_termine_le
                                  ? `Paru le ${dateHeure(e.envoi_termine_le)}.`
                                  : `Envoi commencé le ${dateHeure(e.envoi_commence_le)}.`}
                            </p>
                          </div>
                          <div className="lettre-actions">
                            <Link
                              href={`/admin/lettre?edition=${e.id}#editions`}
                              className="portfolio-button ghost"
                            >
                              {e.statut === "brouillon"
                                ? "Modifier"
                                : "Corriger"}
                            </Link>
                            {e.statut !== "envoyee" ? (
                              <form action={envoyerLotEditionDuJour}>
                                <input type="hidden" name="id" value={e.id} />
                                <button
                                  type="submit"
                                  className="portfolio-button primary"
                                  disabled={!e.relue}
                                  title={
                                    e.relue
                                      ? undefined
                                      : "Relecture à cocher avant l’envoi"
                                  }
                                >
                                  {e.statut === "envoi_en_cours"
                                    ? "Envoyer le lot suivant"
                                    : "Envoyer le lot du jour"}
                                </button>
                              </form>
                            ) : (
                              <Link
                                href={`/lettre/${numeroAffiche(e.contenu.numero)}`}
                                className="portfolio-button ghost"
                              >
                                Voir en ligne ↗
                              </Link>
                            )}
                            {e.statut === "brouillon" ? (
                              <form
                                action={supprimerBrouillonEdition}
                                className="edition-suppression"
                              >
                                <input type="hidden" name="id" value={e.id} />
                                <label className="lettre-coche">
                                  <input
                                    type="checkbox"
                                    name="confirme"
                                    value="oui"
                                    required
                                  />
                                  Confirmer
                                </label>
                                <button
                                  type="submit"
                                  className="portfolio-button ghost"
                                >
                                  Supprimer
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  <RedactionEdition
                    key={editionChoisie?.id ?? `nouveau-${prochainNumero}`}
                    initiale={
                      editionChoisie?.contenu ?? editionVide(prochainNumero)
                    }
                    id={editionChoisie?.id ?? null}
                    parti={
                      editionChoisie
                        ? editionChoisie.statut !== "brouillon"
                        : false
                    }
                    relueInitiale={editionChoisie?.relue ?? false}
                    version={editionChoisie?.version ?? 1}
                  />
                  {editionChoisie ? (
                    <p className="auth-note">
                      <Link href="/admin/lettre#editions">
                        Abandonner et rédiger un nouveau numéro
                      </Link>
                    </p>
                  ) : null}
                </>
              )}
            </section>

            <section aria-labelledby="notes-titre">
              <p className="portfolio-label">5. NOTE DU TRIMESTRE</p>
              <h2 id="notes-titre">
                {noteChoisie
                  ? `Modifier ${noteChoisie.code}`
                  : "Rédiger la note"}
              </h2>
              {notes.length ? (
                <div className="lettre-notes">
                  {notes.map((n) => (
                    <article key={n.id}>
                      <div>
                        <code>{n.code}</code> · {LIBELLES_STATUT[n.statut]} ·{" "}
                        {n.envois} envoi{n.envois > 1 ? "s" : ""}
                        <p className="auth-note">
                          {n.objet}. Créée le {dateHeure(n.cree_le)}.
                          {n.envoi_termine_le
                            ? ` Partie en entier le ${dateHeure(n.envoi_termine_le)}.`
                            : ""}
                        </p>
                      </div>
                      <div className="lettre-actions">
                        {n.statut === "brouillon" ? (
                          <Link
                            href={`/admin/lettre?note=${n.id}`}
                            className="portfolio-button ghost"
                          >
                            Modifier
                          </Link>
                        ) : null}
                        {n.statut !== "envoyee" ? (
                          <form action={envoyerLotDuJour}>
                            <input type="hidden" name="id" value={n.id} />
                            <button
                              type="submit"
                              className="portfolio-button primary"
                              disabled={!n.relue_desidentification}
                              title={
                                n.relue_desidentification
                                  ? undefined
                                  : "Relecture de désidentification à cocher"
                              }
                            >
                              Envoyer le lot du jour
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
              <RedactionNote
                key={noteChoisie?.id ?? "nouvelle"}
                initiale={
                  noteChoisie
                    ? {
                        id: noteChoisie.id,
                        code: noteChoisie.code,
                        objet: noteChoisie.objet,
                        decide: noteChoisie.decide,
                        echoue: noteChoisie.echoue,
                        preparation: noteChoisie.preparation,
                        relue: noteChoisie.relue_desidentification,
                      }
                    : null
                }
              />
            </section>

            <section aria-labelledby="droits-titre">
              <p className="portfolio-label">6. DEMANDES DE PERSONNES</p>
              <h2 id="droits-titre">Accès et effacement</h2>
              <p className="auth-note">
                Une demande reçue par écrit se traite ici, puis la réponse part
                depuis la messagerie, sous quinze jours.
              </p>
              <ExerciceDroits />
            </section>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}

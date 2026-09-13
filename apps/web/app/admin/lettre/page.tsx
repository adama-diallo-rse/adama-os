import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import {
  estAdministrateur,
  lireConfigLettre,
} from "../../../lib/lettre/config";
import {
  type EtatListe,
  type LigneNote,
  etatListe,
  listerNotes,
} from "../../../lib/lettre/registre";
import { createClient } from "../../../lib/supabase/server";
import { envoyerLotDuJour } from "./actions";
import { ExerciceDroits, RedactionNote } from "./redaction";

// =====================================================================
// EH0, la console privee de la lettre.
//
// Ce qui se lit ici ne sort jamais : aucun compteur d'inscrits n'est publie
// (XINV-21). La console dit si la plomberie est complete, ce que la liste
// contient, et porte les deux gestes recurrents : la note du trimestre et
// les demandes de personnes, acces ou effacement.
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
  let erreurBase: string | null = null;
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
  }

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
            </dl>
            <p className="auth-note" style={{ marginTop: 12 }}>
              Dernière purge de rétention : {dateHeure(etat.derniere_purge)}.
              Consentement en vigueur : {etat.consentement_version ?? "aucun"}.
            </p>
          </section>
        ) : null}

        {lecture.ok && administrateur && !erreurBase ? (
          <>
            <section aria-labelledby="notes-titre">
              <p className="portfolio-label">3. NOTE DU TRIMESTRE</p>
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
              <p className="portfolio-label">4. DEMANDES DE PERSONNES</p>
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

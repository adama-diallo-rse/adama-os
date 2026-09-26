import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import {
  PORTES,
  VERROUS,
  periodeCourante,
  reponseReception,
} from "../../../content/conseil";
import { CHOIX_ECHEANCE } from "../../../lib/conseil/qualification";
import {
  listerDemandes,
  type LigneDemande,
} from "../../../lib/conseil/registre";
import {
  estAdministrateur,
  lireConfigLettre,
} from "../../../lib/lettre/config";
import { createClient } from "../../../lib/supabase/server";
import { BoutonPurge, ControlesDemande } from "./controles";

// =====================================================================
// EG0, la console privee des demandes de conseil.
//
// Ce qui se lit ici ne sort jamais. La console montre chaque demande
// recevable, son age, et les deux controles qui restent a la main avant
// toute reponse : l'absence de la liste de STRATA ESG et la condition 4.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console des demandes",
  robots: { index: false, follow: false },
};

const LIBELLES = {
  recue: "Reçue",
  acceptee: "Acceptée",
  refusee: "Refusée",
  close: "Close",
} as const;

function date(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

function age(iso: string): string {
  // Page rendue a chaque requete (force-dynamic) : l'age se lit a l'heure
  // de la requete, et c'est ce qu'il doit dire.
  const jours = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return jours <= 0
    ? "aujourd’hui"
    : `il y a ${jours} jour${jours > 1 ? "s" : ""}`;
}

export default async function ConsoleDemandesPage() {
  const supabase = await createClient();
  const utilisateur = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;
  if (!utilisateur) redirect("/login?redirect=/admin/demandes");

  const lecture = lireConfigLettre();
  const administrateur =
    lecture.ok && estAdministrateur(lecture.config, utilisateur.email);

  let demandes: LigneDemande[] = [];
  let erreur: string | null = null;
  if (lecture.ok && administrateur) {
    try {
      demandes = await listerDemandes(lecture.config);
    } catch {
      erreur =
        "Les demandes n’ont pas pu être lues. La migration 0002_conseil est-elle jouée dans le projet dédié ?";
    }
  }
  const periode = periodeCourante();
  const aLire = demandes.filter((d) => d.statut === "recue").length;

  return (
    <PageShell tools={false} className="demandes-page">
      <PageIntro
        eyebrow="ESPACE PRIVÉ / DEMANDES DE CONSEIL"
        title={
          <>
            Les demandes <span className="serif">recevables.</span>
          </>
        }
        description="Seules les demandes qui tiennent les trois conditions déclarées arrivent ici. Deux contrôles restent à la main avant toute réponse, et chaque demande reçoit une réponse écrite."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">À LIRE</span>
            <strong>{aLire}</strong>
            <p>
              {periode.libelle} : {periode.plafond.toLowerCase()}
            </p>
          </div>
        }
      />
      <div className="private-content">
        <Link href="/admin" className="portfolio-button ghost">
          ← Retour à l’administration
        </Link>
        {!lecture.ok ? (
          <p role="alert" className="form-error">
            La configuration du projet dédié est incomplète. Variables
            manquantes : {lecture.manquants.join(", ") || "aucune"}.{" "}
            {lecture.refus.join(" ")}
          </p>
        ) : !administrateur ? (
          <p role="alert" className="form-error">
            Ce compte n’est pas nommé dans LETTRE_ADMINISTRATEURS.
          </p>
        ) : erreur ? (
          <p role="alert" className="form-error">
            {erreur}
          </p>
        ) : demandes.length === 0 ? (
          <p className="demandes-vide">Aucune demande pour le moment.</p>
        ) : (
          <ol className="demandes-liste">
            {demandes.map((d) => {
              const porte = PORTES.find((p) => p.code === d.porte);
              const echeance = CHOIX_ECHEANCE.find(
                (c) => c.valeur === d.echeance,
              );
              return (
                <li key={d.id} id={d.id} data-statut={d.statut}>
                  <header>
                    <span className="demandes-porte">
                      {porte ? `${porte.numero} ${porte.titre}` : d.porte}
                    </span>
                    <span className="demandes-statut">
                      {LIBELLES[d.statut]}
                    </span>
                    <time dateTime={d.recue_le}>
                      {date(d.recue_le)}, {age(d.recue_le)}
                    </time>
                  </header>
                  <h2>{d.organisation}</h2>
                  <p className="demandes-qui">
                    {d.nom} · <a href={`mailto:${d.email}`}>{d.email}</a> ·{" "}
                    {echeance?.libelle ?? d.echeance}
                  </p>
                  <blockquote>{d.probleme}</blockquote>
                  <ControlesDemande
                    id={d.id}
                    statut={d.statut}
                    strataVerifie={d.strata_verifie}
                    condition4={d.condition_4_verifiee}
                    note={d.note_interne ?? ""}
                    reponseAcceptation={reponseReception({
                      nom: d.nom ?? "",
                      porte: porte?.titre ?? d.porte,
                      recueLe: date(d.recue_le),
                      plafond: periode.plafond,
                      assuranceLevee: VERROUS.assurance.leve,
                    })}
                  />
                </li>
              );
            })}
          </ol>
        )}
        {lecture.ok && administrateur ? <BoutonPurge /> : null}
      </div>
    </PageShell>
  );
}

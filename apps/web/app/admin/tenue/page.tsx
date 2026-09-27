import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import {
  estAdministrateur,
  lireConfigLettre,
} from "../../../lib/lettre/config";
import { etatListe } from "../../../lib/lettre/registre";
import { createClient } from "../../../lib/supabase/server";
import {
  INDICATEURS_ES0,
  premierDimancheApres,
  releverTenue,
  type CodeIndicateur,
} from "../../../content/tenue";

// =====================================================================
// ES0, le tableau de bord privé de la branche. Rien de ce qui se lit ici ne
// sort : aucun de ces huit chiffres n'est publié (XINV-11, XINV-21). La
// copie datée du relevé mensuel se tient dans la base Notion « Tableau de
// bord ES0 », le premier dimanche du mois, en vingt minutes au plus.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tableau de bord de la branche",
  robots: { index: false, follow: false },
};

const dateHeure = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));

const dateLongue = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

export default async function TenuePage() {
  const supabase = await createClient();
  const utilisateur = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;
  if (!utilisateur) {
    redirect("/login?redirect=/admin/tenue");
  }

  const lecture = lireConfigLettre();
  const administrateur =
    lecture.ok && estAdministrateur(lecture.config, utilisateur.email);

  const externes: Parameters<typeof releverTenue>[0] = {
    heures: {
      raison:
        "Lu dans la base Notion « Relevé des heures » au rite du premier dimanche, pas par cette page.",
    },
  };
  if (!lecture.ok) {
    externes.adresses = {
      raison: "Projet adama-lettre non configuré pour cet environnement.",
    };
  } else if (!administrateur) {
    externes.adresses = { raison: "Réservé aux administrateurs de la lettre." };
  } else {
    try {
      const etat = await etatListe(lecture.config);
      externes.adresses = {
        valeur: String(etat.confirmes),
        releveLe: new Date().toISOString(),
      };
    } catch (erreur) {
      externes.adresses = {
        raison:
          erreur instanceof Error
            ? `Base de la lettre illisible : ${erreur.message}`
            : "Base de la lettre illisible.",
      };
    }
  }

  const valeurs = new Map(
    releverTenue(externes).map((v) => [v.code, v] as const),
  );
  const prochainReleve = premierDimancheApres(new Date());

  return (
    <PageShell tools={false} className="tenue-page strates-page">
      <PageIntro
        eyebrow="ESPACE PRIVÉ / ES0 / TENUE DE LA BRANCHE"
        title={
          <>
            Huit chiffres relevés,
            <br />
            <span className="serif">aucun estimé.</span>
          </>
        }
        description="Une case sans source reste vide et dit pourquoi. Aucun de ces chiffres ne sort de cette page : ils nourrissent les seuils d’arrêt d’ES1 et la règle de charge d’ET9."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">PROCHAIN RELEVÉ</span>
            <strong>{dateLongue(prochainReleve)}</strong>
            <p>
              Premier dimanche du mois, vingt minutes au plus. Deux revues
              manquées rouvrent les critères d’arrêt.
            </p>
          </div>
        }
      />

      <section className="strates-tenue" aria-label="Les huit indicateurs">
        <ol>
          {INDICATEURS_ES0.map((def, index) => {
            const v = valeurs.get(def.code as CodeIndicateur);
            return (
              <li
                key={def.code}
                data-vide={!v?.valeur}
                style={{ ["--rang" as string]: index }}
              >
                <header>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{def.libelle}</h2>
                  <strong>{v?.valeur ?? "Vide"}</strong>
                </header>
                <p>{def.compte}</p>
                <dl>
                  <div>
                    <dt>Source</dt>
                    <dd>{def.source}</dd>
                  </div>
                  <div>
                    <dt>Geste</dt>
                    <dd>{def.geste}</dd>
                  </div>
                  <div>
                    <dt>Fréquence</dt>
                    <dd>{def.frequence}</dd>
                  </div>
                  <div>
                    <dt>{v?.valeur ? "Relevé le" : "Pourquoi vide"}</dt>
                    <dd>
                      {v?.valeur && v.releveLe
                        ? dateHeure(v.releveLe)
                        : v?.raison}
                      {!v?.valeur && def.sourceAbsente && (
                        <small>
                          {" "}
                          Source attendue : {def.sourceAbsente.chantier}
                        </small>
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">RETOUR</p>
          <h2>
            L’administration, <span className="serif">et la lettre.</span>
          </h2>
        </div>
        <Link href="/admin" className="portfolio-button primary">
          Administration <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { BuildLog, lireFiltres } from "../../components/build-log";
import { EngineeringTimeline } from "../../components/engineering-timeline";
import { JALONS } from "../../content/jalons";
import { fetchShippedFeed } from "../../lib/github";

// =====================================================================
// C8, le journal de construction.
//
// Deux blocs, et ils ne disent pas la meme chose :
//   1. le journal, qui montre l'activite reelle, regroupee par chantier,
//      avec sa matiere brute a un clic ;
//   2. la frise d'ingenierie, qui montre la trajectoire, decision par
//      decision, avec sa trace dans le depot.
//
// L'etat de la vue et des filtres vit dans l'URL : un lien envoye ouvre la
// meme lecture, et le basculement fonctionne sans JavaScript.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal de construction",
  description:
    "Les contributions réelles des dépôts du groupe, regroupées par chantier, avec les messages de commit bruts à un clic. Et la frise des décisions qui ont donné sa forme au système.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Journal de construction",
    description:
      "Ce que j’ai livré, la matière brute derrière, et les décisions qui expliquent la forme du système.",
    url: "/journal",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtres = lireFiltres(params);
  // 300 : de quoi couvrir « tout » sans plafonner la lecture. Le decoupage
  // par periode se fait ensuite, sur la liste complete.
  const feed = await fetchShippedFeed(300).catch(() => null);

  return (
    <PageShell className="systeme-page">
      <PageIntro
        eyebrow="CONSTRUCTION / JOURNAL"
        title={
          <>
            Ce que j’ai construit,
            <br />
            <span className="serif">commit par commit.</span>
          </>
        }
        description="Un message de commit ne prouve rien à qui n’est pas dans le code. Un titre écrit librement ne prouve rien non plus. Ce journal fait la seule chose honnête entre les deux : il regroupe des commits réels sous des titres relus, et il garde la matière brute à un clic."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">DÉPÔTS SUIVIS</span>
            <strong>{feed?.repos.filter((r) => r.ok).length ?? 0}</strong>
            <p>
              {(feed?.repos.filter((r) => r.ok).length ?? 0) > 1
                ? "dépôts réellement lus"
                : "dépôt réellement lu"}{" "}
              sur {feed?.repos.length ?? 0}{" "}
              {(feed?.repos.length ?? 0) > 1 ? "suivis" : "suivi"}. Les autres
              sont nommés plus bas.
            </p>
            <Link href="/decisions">Lire les décisions ↗</Link>
          </div>
        }
      />

      {feed ? (
        <BuildLog
          commits={feed.commits}
          repos={feed.repos}
          filtres={filtres}
          source={feed.source}
          sourceReason={feed.sourceReason}
        />
      ) : (
        <section className="log-unavailable">
          <p className="portfolio-label">LE JOURNAL</p>
          <h2>
            Les contributions{" "}
            <span className="serif">ne sont pas lisibles.</span>
          </h2>
          <p>
            L’hébergeur des dépôts n’a pas répondu. Rien n’est affiché à la
            place : ni un historique figé, ni un compteur arrondi. Le code reste
            consultable sur les dépôts eux-mêmes.
          </p>
        </section>
      )}

      <EngineeringTimeline jalons={JALONS} />

      <section className="page-next">
        <div>
          <p className="portfolio-label">LE RAISONNEMENT COMPLET</p>
          <h2>
            Chaque décision, <span className="serif">avec ses options.</span>
          </h2>
          <p>
            Le journal d’architecture donne pour chaque décision les options
            écartées, le compromis accepté et son degré de réversibilité.
          </p>
        </div>
        <Link href="/decisions" className="portfolio-button primary">
          Ouvrir le journal d’architecture <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}

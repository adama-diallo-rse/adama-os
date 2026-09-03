// =====================================================================
// C8-T3 a C8-T6, le journal de construction.
//
// Composant SERVEUR, et c'est un choix. L'etat de la vue et des filtres vit
// dans l'URL, pas dans le navigateur : un lien envoye a quelqu'un ouvre
// exactement la meme lecture, le basculement fonctionne sans JavaScript, et
// la page s'imprime dans l'etat ou elle est lue. Le stockage du navigateur
// aurait donne l'inverse des trois.
//
// Le geste central de l'ecran est le basculement lisible / brut. Il ne dit
// pas « faites-moi confiance », il dit « voici la matiere brute ». Il est
// donc place en tete, a cote du titre, et jamais dans un menu.
// =====================================================================

import Link from "next/link";
import { divisionName } from "./brand-signature";
import { TrackView } from "./analytics-tracker";
import { EVENT_BUILD_LOG_RAW } from "../lib/analytics-events";
import type { CommitRow, RepoStatusRow } from "./types";
import {
  filtrerPeriode,
  lignesLisibles,
  metriques,
  type LigneJournal,
} from "../lib/chantiers";

export type JournalFiltres = {
  vue: "lisible" | "brut";
  division: string | null;
  depot: string | null;
  /** Fenêtre en jours. Null : toute la période connue. */
  jours: number | null;
};

const PERIODES: { label: string; jours: number | null; cle: string }[] = [
  { label: "30 jours", jours: 30, cle: "30" },
  { label: "90 jours", jours: 90, cle: "90" },
  { label: "Tout", jours: null, cle: "tout" },
];

/** Lit les filtres depuis les paramètres d'URL. Toute valeur inconnue est
 *  ignorée : un lien mal recopié affiche la vue par défaut, pas une erreur. */
export function lireFiltres(
  params: Record<string, string | string[] | undefined>,
): JournalFiltres {
  const un = (k: string): string | null => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() ? s.trim() : null;
  };
  const periode = un("periode");
  return {
    vue: un("vue") === "brut" ? "brut" : "lisible",
    division: un("division"),
    depot: un("depot"),
    jours: periode === "tout" ? null : periode === "90" ? 90 : 30,
  };
}

function lien(base: JournalFiltres, patch: Partial<JournalFiltres>): string {
  const f = { ...base, ...patch };
  const p = new URLSearchParams();
  if (f.vue === "brut") p.set("vue", "brut");
  if (f.division) p.set("division", f.division);
  if (f.depot) p.set("depot", f.depot);
  p.set("periode", f.jours === null ? "tout" : String(f.jours));
  return `/journal?${p.toString()}`;
}

function dateCourte(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function dateHeure(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(
    d.getUTCHours(),
  )}:${p(d.getUTCMinutes())} UTC`;
}

function LigneLisible({ ligne }: { ligne: LigneJournal }) {
  const premier = ligne.commits[0];
  return (
    <li className="log-entry" data-mode={ligne.mode}>
      <div className="log-entry-head">
        <time className="log-date" dateTime={ligne.date}>
          {dateCourte(ligne.date)}
        </time>
        <h3>{ligne.titre}</h3>
        <span className="log-count">
          {ligne.commits.length} commit{ligne.commits.length > 1 ? "s" : ""}
        </span>
      </div>
      {ligne.resume ? <p className="log-resume">{ligne.resume}</p> : null}
      <p className="log-meta">
        <span className="log-mode">
          {ligne.mode === "resume-relu"
            ? "titre écrit et relu"
            : "libellé dérivé du préfixe de commit"}
        </span>
        {ligne.depots.map((d) => (
          <span key={d} className="log-repo">
            {d}
          </span>
        ))}
        {ligne.divisions.map((d) => (
          <span key={d} className="log-division">
            {divisionName(d)}
          </span>
        ))}
      </p>
      <p className="log-links">
        {premier ? (
          <a href={premier.url} target="_blank" rel="noreferrer">
            Voir les commits <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {ligne.adr.map((id) => (
          <Link key={id} href={`/decisions/${id}`}>
            {id}
          </Link>
        ))}
        {ligne.projet ? (
          <Link href={`/projets/${ligne.projet}`}>Fiche projet</Link>
        ) : null}
      </p>
    </li>
  );
}

function LigneBrute({ commit }: { commit: CommitRow }) {
  return (
    <li className="log-raw">
      <a href={commit.url} target="_blank" rel="noreferrer">
        <span className="log-sha">{commit.sha}</span>
        <span className="log-message">{commit.message}</span>
        <span className="log-raw-repo">{commit.repo}</span>
        <time dateTime={commit.date}>{dateHeure(commit.date)}</time>
      </a>
    </li>
  );
}

export function BuildLog({
  commits,
  repos,
  filtres,
  source,
  sourceReason,
}: {
  commits: CommitRow[];
  repos: RepoStatusRow[];
  filtres: JournalFiltres;
  source: "registre" | "environnement" | "repli";
  sourceReason: string | null;
}) {
  const parPeriode = filtrerPeriode(commits, filtres.jours);
  const filtres_appliques = parPeriode.filter(
    (c) =>
      (!filtres.division || c.division === filtres.division) &&
      (!filtres.depot || c.repo === filtres.depot),
  );
  const m = metriques(filtres_appliques);
  const lignes = lignesLisibles(filtres_appliques);
  const divisions = Array.from(
    new Set(commits.map((c) => c.division).filter(Boolean)),
  ).sort();
  const depots = Array.from(new Set(commits.map((c) => c.repo))).sort();
  const absents = repos.filter((r) => !r.ok);

  return (
    <section className="log-section" aria-labelledby="journal-title">
      {/* C13-T1. Le basculement en vue brute est le geste le plus parlant de
          cette page : il mesure les lecteurs qui veulent voir la matiere. */}
      {filtres.vue === "brut" ? (
        <TrackView event={EVENT_BUILD_LOG_RAW} />
      ) : null}
      <div className="log-head">
        <div>
          <p className="portfolio-label">JOURNAL DE CONSTRUCTION</p>
          <h2 id="journal-title">
            Ce que j’ai livré,{" "}
            <span className="serif">et la matière brute derrière.</span>
          </h2>
        </div>
        <div className="log-switch" role="group" aria-label="Vue du journal">
          <Link
            href={lien(filtres, { vue: "lisible" })}
            aria-current={filtres.vue === "lisible" ? "true" : undefined}
            data-active={filtres.vue === "lisible"}
          >
            Lisible
          </Link>
          <Link
            href={lien(filtres, { vue: "brut" })}
            aria-current={filtres.vue === "brut" ? "true" : undefined}
            data-active={filtres.vue === "brut"}
          >
            Brut
          </Link>
        </div>
      </div>

      <p className="log-switch-note">
        La vue lisible regroupe les commits par chantier, avec un titre écrit et
        relu. La vue brute donne les messages de commit tels quels. Je ne vous
        demande pas de me croire sur le premier : le second est à un clic.
      </p>

      {/* C8-T5, les trois seules mesures honnêtes. */}
      <dl className="log-metrics">
        <div>
          <dt>Contributions</dt>
          <dd>{m.commits}</dd>
          <p>Journal public des dépôts, filtrage du bruit appliqué.</p>
        </div>
        <div>
          <dt>Dépôts actifs</dt>
          <dd>
            {m.depotsActifs}{" "}
            <span>
              / {repos.length} {repos.length > 1 ? "suivis" : "suivi"}
            </span>
          </dd>
          <p>Dépôts ayant au moins une contribution sur la période lue.</p>
        </div>
        <div>
          <dt>Régularité</dt>
          <dd>
            {m.joursActifs}{" "}
            <span>
              / {m.joursDeLaPeriode} {m.joursDeLaPeriode > 1 ? "jours" : "jour"}
            </span>
          </dd>
          <p>
            Jours portant au moins une contribution, sur l’étendue observée.
          </p>
        </div>
      </dl>
      <p className="log-metrics-note">
        Il n’y a volontairement ici ni fréquence de déploiement, ni délai de
        mise en production, ni taux d’échec, ni temps de rétablissement. Ce
        dépôt n’a pas d’intégration continue : ces valeurs ne sont pas mesurées,
        et les afficher reviendrait à les inventer.
      </p>

      <div className="log-filters">
        <div className="log-filter-group" role="group" aria-label="Période">
          <span>Période</span>
          {PERIODES.map((p) => (
            <Link
              key={p.cle}
              href={lien(filtres, { jours: p.jours })}
              data-active={filtres.jours === p.jours}
            >
              {p.label}
            </Link>
          ))}
        </div>
        {divisions.length > 0 ? (
          <div className="log-filter-group" role="group" aria-label="Division">
            <span>Division</span>
            <Link
              href={lien(filtres, { division: null })}
              data-active={filtres.division === null}
            >
              Toutes
            </Link>
            {divisions.map((d) => (
              <Link
                key={d}
                href={lien(filtres, { division: d })}
                data-active={filtres.division === d}
              >
                {divisionName(d)}
              </Link>
            ))}
          </div>
        ) : null}
        {depots.length > 1 ? (
          <div className="log-filter-group" role="group" aria-label="Dépôt">
            <span>Dépôt</span>
            <Link
              href={lien(filtres, { depot: null })}
              data-active={filtres.depot === null}
            >
              Tous
            </Link>
            {depots.map((d) => (
              <Link
                key={d}
                href={lien(filtres, { depot: d })}
                data-active={filtres.depot === d}
              >
                {d.split("/")[1] ?? d}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {filtres_appliques.length === 0 ? (
        <p className="log-empty">
          Aucune contribution sur cette période avec ces filtres. Rien n’est
          affiché plutôt qu’un historique élargi en silence.
        </p>
      ) : filtres.vue === "lisible" ? (
        <ul className="log-entries">
          {lignes.map((l) => (
            <LigneLisible key={l.id} ligne={l} />
          ))}
        </ul>
      ) : (
        <ul className="log-raws">
          {filtres_appliques.map((c) => (
            <LigneBrute key={`${c.repo}-${c.sha}`} commit={c} />
          ))}
        </ul>
      )}

      {/* C8-T6 et C3-T6, les dépôts que le journal ne lit pas. */}
      <div className="log-absents">
        <h3>Ce que ce journal ne montre pas</h3>
        {sourceReason ? (
          <p className="log-source-warn">{sourceReason}</p>
        ) : null}
        {absents.length > 0 ? (
          <ul>
            {absents.map((r) => (
              <li key={r.fullName}>
                <code>{r.fullName}</code> · {r.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {repos.length > 1
              ? `Les ${repos.length} dépôts suivis ont tous répondu`
              : "Le dépôt suivi a répondu"}
            {source === "registre" ? ", et la liste vient du registre" : ""}.
          </p>
        )}
        <p className="log-absents-note">
          Les huit dépôts du groupe vivent sur deux propriétaires. Un jeton de
          lecture à portée fine n’en couvre qu’un seul, donc sept entrées sur
          huit au mieux. Le seul jeton qui couvrirait les huit donnerait aussi
          l’écriture, et ce n’est pas un compromis que je fais pour un feed.
        </p>
      </div>
    </section>
  );
}

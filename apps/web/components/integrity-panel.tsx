// =====================================================================
// C12-T2, l'affichage des dix controles.
//
// Trois exigences gouvernent ce composant, et elles priment sur l'esthetique.
//
//   1. Le resultat est CALCULE. La commande qui le produit est affichee
//      au-dessus, avec sa date d'execution : le lecteur doit comprendre en
//      regardant le bloc qu'il regarde la sortie d'un programme, pas une
//      auto-declaration.
//   2. Au-dela de sept jours, l'AGE devient l'information principale et il
//      passe devant le resultat. Un controle vert d'il y a trois semaines ne
//      dit rien du present, et le presenter comme s'il le disait serait le
//      meme mensonge que la valeur perimee que la couche C1 a supprimee.
//   3. Un controle en echec n'est jamais masque, et jamais dramatise. Pas de
//      rouge d'alerte, pas de bandeau : la meme ligne que les autres, avec un
//      libelle qui dit ce qui s'est passe.
//
// Ce qu'on ne trouvera pas ici : un anneau de progression, un score global
// sur cent, une note, un pourcentage arrondi. Il n'y a pas de note, il y a
// dix faits.
// =====================================================================

import {
  CONTROL_DESCRIPTION,
  CONTROL_LABEL,
  FRAICHEUR_INTEGRITE_JOURS,
  type ControlStatus,
  type IntegrityReport,
} from "../lib/integrity";

function Glyphe({ status }: { status: ControlStatus }) {
  const common = {
    className: "integrity-glyph",
    viewBox: "0 0 12 12",
    "aria-hidden": true,
    focusable: "false" as const,
  };
  if (status === "reussi") {
    return (
      <svg {...common}>
        <path
          d="M1.6 6.4 4.6 9.4 10.4 2.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }
  if (status === "echoue") {
    return (
      <svg {...common}>
        <path
          d="M2.2 2.2 9.8 9.8M9.8 2.2 2.2 9.8"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path
        d="M2.2 6h7.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="2 1.6"
      />
    </svg>
  );
}

function dateLongue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

export function IntegrityPanel({
  rapport,
}: {
  rapport: IntegrityReport | null;
}) {
  if (!rapport) {
    return (
      <div className="integrity-panel integrity-panel--absent">
        <p className="integrity-command">
          <span aria-hidden="true">$</span> pnpm integrity
        </p>
        <p>
          Cette commande n’a jamais été exécutée sur cette version. Aucun
          résultat n’est affiché à la place : ni un vert par défaut, ni un zéro.
          Le bloc reste vide, et c’est l’information.
        </p>
      </div>
    );
  }

  const compte = {
    reussi: rapport.controls.filter((c) => c.status === "reussi").length,
    echoue: rapport.controls.filter((c) => c.status === "echoue").length,
    non_execute: rapport.controls.filter((c) => c.status === "non_execute")
      .length,
  };

  return (
    <div
      className="integrity-panel"
      data-perime={rapport.perime || undefined}
      aria-labelledby="integrite-title"
    >
      <div className="integrity-head">
        <p className="integrity-command">
          <span aria-hidden="true">$</span> pnpm integrity
        </p>
        <h3 id="integrite-title">
          {rapport.controls.length} contrôles, calculés
        </h3>
        {/* C12-T2 : au-dela du seuil, l'age passe devant le resultat. */}
        {rapport.perime ? (
          <p className="integrity-age integrity-age--perime">
            Dernière exécution il y a {rapport.ageJours} jours. Au-delà de{" "}
            {FRAICHEUR_INTEGRITE_JOURS} jours, l’âge compte plus que le résultat
            : ce qui suit décrit un état passé, pas l’état actuel.
          </p>
        ) : (
          <p className="integrity-age">
            Exécutée le{" "}
            <time dateTime={rapport.executedAt}>
              {dateLongue(rapport.executedAt)}
            </time>{" "}
            UTC, il y a {rapport.ageJours} jour
            {rapport.ageJours > 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <ul className="integrity-count" aria-label="Répartition des contrôles">
        {(["reussi", "echoue", "non_execute"] as ControlStatus[]).map((s) => (
          <li key={s} data-status={s}>
            <strong>{compte[s]}</strong>
            <span>{CONTROL_LABEL[s]}</span>
          </li>
        ))}
      </ul>

      <ul className="integrity-list">
        {rapport.controls.map((c) => (
          <li key={c.id} data-status={c.status}>
            <span className="integrity-mark">
              <Glyphe status={c.status} />
              <span className="integrity-mark-label">
                {CONTROL_LABEL[c.status]}
              </span>
              <span className="proof-sr">{CONTROL_DESCRIPTION[c.status]}</span>
            </span>
            <span className="integrity-label">{c.label}</span>
            <span className="integrity-detail">{c.detail}</span>
            {c.status !== "reussi" ? (
              <span className="integrity-message">{c.message}</span>
            ) : null}
          </li>
        ))}
      </ul>

      <p className="integrity-foot">
        {rapport.buildInclus
          ? "La construction de production fait partie de cette exécution."
          : "La construction de production n’a pas été relancée pendant cette exécution, et le contrôle correspondant est marqué non exécuté."}{" "}
        {rapport.modesDePanneConformes
          ? "Les huit modes de panne, plus le cas nominal, se comportent comme la page des pannes l’annonce."
          : "Au moins un scénario de panne ne se comporte pas comme la page l’annonce."}
      </p>
    </div>
  );
}

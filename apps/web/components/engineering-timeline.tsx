// =====================================================================
// C8-T8, la frise d'ingenierie.
//
// Complementaire du journal, et volontairement plus courte. Le journal dit
// l'activite ; la frise dit la trajectoire. Un lecteur qui ne lit qu'une
// chose sur cette page doit lire celle-ci : douze decisions expliquent
// pourquoi le systeme a cette forme, mille commits ne l'expliquent pas.
//
// Chaque jalon porte sa trace dans le depot. Un jalon sans trace ne se rend
// pas : la garde est ici, et tests/journal.test.tsx la verrouille.
// =====================================================================

import Link from "next/link";
import type { Jalon } from "../content/jalons";

const NATURE_LABEL: Record<Jalon["nature"], string> = {
  decision: "DÉCISION",
  livraison: "LIVRAISON",
  revirement: "REVIREMENT",
};

function dateLongue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function EngineeringTimeline({ jalons }: { jalons: readonly Jalon[] }) {
  // Un jalon sans trace n'est pas un jalon, c'est un souvenir.
  const retenus = [...jalons]
    .filter((j) => j.trace.trim().length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const revirements = retenus.filter((j) => j.nature === "revirement").length;

  return (
    <section className="frise-section" id="frise" aria-labelledby="frise-title">
      <div className="frise-intro">
        <p className="portfolio-label">FRISE D’INGÉNIERIE</p>
        <h2 id="frise-title">
          {retenus.length} décisions,{" "}
          <span className="serif">et ce qu’elles ont coûté.</span>
        </h2>
        <p>
          Le journal ci-dessus dit ce que j’ai fait. Cette frise dit pourquoi le
          système a cette forme. {revirements} d’entre elles sont des
          revirements : j’avais tranché dans un sens, et j’ai changé d’avis en
          payant le retrait.
        </p>
      </div>

      <ol className="frise-list">
        {retenus.map((j) => (
          <li key={j.id} className="frise-entry" data-nature={j.nature}>
            <div className="frise-entry-head">
              <time dateTime={j.date}>{dateLongue(j.date)}</time>
              <span className="frise-nature">{NATURE_LABEL[j.nature]}</span>
            </div>
            <h3>{j.titre}</h3>
            <p className="frise-quoi">{j.quoi}</p>
            <p className="frise-trace">
              <span>Trace</span>
              <code>{j.trace}</code>
            </p>
            {j.adr ? (
              <p className="frise-adr">
                <Link href={`/decisions/${j.adr}`}>
                  Lire la décision {j.adr} <span aria-hidden="true">→</span>
                </Link>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

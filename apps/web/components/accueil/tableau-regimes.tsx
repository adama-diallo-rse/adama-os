import Link from "next/link";
import { CRITERES_REGIME, REGIMES, type Regime } from "../../content/regimes";

function Cellule({ valeur }: { valeur: Regime[keyof Regime] }) {
  if (typeof valeur === "boolean") {
    return valeur ? (
      <span className="regime-oui">
        <span aria-hidden="true">✓</span> Oui
      </span>
    ) : (
      <span className="regime-non">
        <span aria-hidden="true">·</span> Non
      </span>
    );
  }
  return <>{valeur}</>;
}

/**
 * Les régimes d'accès (AXP-107), comparés colonne par colonne. Aucun prix :
 * un régime fermé le dit en toutes lettres, et la preuve reste vérifiable
 * sans payer dans les quatre.
 */
export function TableauRegimes() {
  return (
    <div
      className="regimes-defile"
      role="region"
      aria-label="Tableau des régimes, défilable"
      tabIndex={0}
    >
      <table className="regimes">
        <caption className="sr-only">
          Les quatre régimes d’accès d’ADAMA OS, comparés critère par critère
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Critère</span>
            </th>
            {REGIMES.map((r) => (
              <th
                scope="col"
                key={r.code}
                data-ouvert={r.ouvert ? "oui" : "non"}
              >
                <span className="regime-code">{r.code}</span>
                <span className="regime-titre">{r.titre}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CRITERES_REGIME.map((critere) => (
            <tr key={critere.cle}>
              <th scope="row">{critere.libelle}</th>
              {REGIMES.map((r) => (
                <td key={r.code} data-ouvert={r.ouvert ? "oui" : "non"}>
                  <Cellule valeur={r[critere.cle]} />
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row">
              <span className="sr-only">Aller plus loin</span>
            </th>
            {REGIMES.map((r) => (
              <td key={r.code}>
                <Link href={r.href} className="regime-lien">
                  {r.ouvert ? "Ouvrir" : "Lire ce qui se prépare"}
                  <span className="sr-only"> : régime {r.code}</span>
                  <span aria-hidden="true"> →</span>
                </Link>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

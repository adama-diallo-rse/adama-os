// =====================================================================
// C10-T2, l'inventaire, rendu tel qu'il a ete mesure.
//
// Aucun nombre n'est ecrit dans ce fichier. Tous viennent de
// docs/inventory.json, produit par `pnpm inventory`. Le traitement visuel
// doit faire SENTIR cela : la commande qui produit les chiffres est affichee
// au-dessus d'eux, comme une invite de terminal, et non reléguée en note de
// bas de page. Un lecteur technique doit comprendre en un coup d'oeil qu'il
// regarde la sortie d'un programme, pas une auto-declaration.
//
// tests/technique.test.tsx echoue si un chiffre d'inventaire venait a etre
// ecrit en dur dans la page ou dans ce composant.
// =====================================================================

import type { InventoryBudget, InventorySurface } from "../lib/inventory";

const LIBELLES: { cle: keyof InventorySurface; label: string }[] = [
  { cle: "pages", label: "Routes de page" },
  { cle: "api_routes", label: "Routes d’interface" },
  { cle: "components", label: "Composants" },
  { cle: "lib_modules", label: "Modules de bibliothèque" },
  { cle: "tables", label: "Tables" },
  { cle: "enums", label: "Types énumérés" },
  { cle: "migrations", label: "Migrations" },
  { cle: "policies", label: "Règles de sécurité par ligne" },
  { cle: "test_files", label: "Fichiers de test" },
  { cle: "test_cases", label: "Cas de test" },
  { cle: "dependencies", label: "Dépendances déclarées" },
];

export function TechInventory({
  surface,
  budgets,
}: {
  surface: InventorySurface;
  budgets: InventoryBudget[];
}) {
  const depasses = budgets.filter((b) => b.over);
  return (
    <div className="tech-inventory">
      <p className="tech-command">
        <span aria-hidden="true">$</span> pnpm inventory
      </p>
      <p className="tech-command-note">
        Ces nombres sont la sortie de cette commande, versionnée dans le dépôt.
        Aucun n’est saisi. La vérification locale s’arrête avant le typecheck si
        l’inventaire a bougé sans être régénéré : un dépôt dont l’inventaire
        ment n’a pas besoin d’être construit.
      </p>

      <dl className="tech-counts">
        {LIBELLES.map(({ cle, label }) => (
          <div key={cle}>
            <dt>{label}</dt>
            <dd>{surface[cle]}</dd>
          </div>
        ))}
      </dl>

      <div className="tech-budgets">
        <h3>Budget de complexité</h3>
        <p>
          Chaque plafond est mesuré à chaque exécution. Un dépassement fait
          échouer la commande, il ne produit pas un avertissement qu’on finit
          par ne plus lire. Un plafond se relève par écrit, jamais en silence.
        </p>
        <ul>
          {budgets.map((b) => (
            <li key={b.id} data-over={b.over || undefined}>
              <span className="tech-budget-label">{b.label}</span>
              <span className="tech-budget-value">
                {b.value} <span aria-hidden="true">/</span>{" "}
                <span className="tech-budget-max">{b.max}</span>
              </span>
              <span className="tech-budget-state">
                {b.broken
                  ? "ancrage de mesure perdu"
                  : b.over
                    ? "dépassé"
                    : "tenu"}
              </span>
            </li>
          ))}
        </ul>
        {depasses.length > 0 ? (
          <p className="tech-budget-warn">
            {depasses.length} plafond{depasses.length > 1 ? "s" : ""} dépassé
            {depasses.length > 1 ? "s" : ""} au moment de la dernière mesure. Ce
            n’est pas masqué ici : un budget qu’on cache quand il déborde n’est
            pas un budget.
          </p>
        ) : null}
      </div>
    </div>
  );
}

// =====================================================================
// Les illustrations des quatre portes (refonte du 30 octobre 2026).
//
// Une scène par porte, dessinée dans la grammaire du symbole : des bandes,
// une grille, un sceau latérite. Aucune image, aucun personnage, aucune
// métaphore sans fonction : chaque dessin montre l'objet de la porte.
// =====================================================================

type Code = "construire" | "donnee" | "ia" | "systeme";

const LEGENDES: Record<Code, string> = {
  construire: "Trois bandes posées sur un plan, une quatrième en cours de pose",
  donnee: "Des lignes de données qui convergent vers une source unique",
  ia: "Une proposition du moteur, arrêtée par la frontière avant la décision",
  systeme: "Quatre blocs reliés, dont un seul porte le sceau",
};

function Grille() {
  return (
    <g opacity={0.35}>
      {Array.from({ length: 11 }, (_, i) => (
        <path
          key={`v${i}`}
          d={`M${20 + i * 20} 10v140`}
          className="porte-grille"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={`h${i}`}
          d={`M10 ${20 + i * 20}h220`}
          className="porte-grille"
        />
      ))}
    </g>
  );
}

export function IllustrationPorte({ code }: { code: string }) {
  const c = (["construire", "donnee", "ia", "systeme"] as const).find(
    (x) => x === code,
  );
  if (!c) return null;
  return (
    <svg
      viewBox="0 0 240 160"
      role="img"
      aria-label={LEGENDES[c]}
      className="porte-dessin"
    >
      <Grille />
      {c === "construire" ? (
        <g>
          <rect x="44" y="40" width="30" height="84" className="porte-bande" />
          <rect x="80" y="50" width="30" height="84" className="porte-bande" />
          <rect x="116" y="40" width="30" height="84" className="porte-bande" />
          <rect
            x="158"
            y="30"
            width="30"
            height="84"
            className="porte-contour"
          />
          <path d="M152 118 186 26" className="porte-trait" />
          <rect x="122" y="56" width="18" height="18" className="porte-sceau" />
        </g>
      ) : null}
      {c === "donnee" ? (
        <g>
          {[36, 60, 84, 108, 132].map((y, i) => (
            <path
              key={y}
              d={`M24 ${y}C90 ${y} 120 80 168 80`}
              className={i === 2 ? "porte-trait" : "porte-ligne"}
            />
          ))}
          <rect x="168" y="62" width="40" height="36" className="porte-bande" />
          <rect x="179" y="71" width="18" height="18" className="porte-sceau" />
        </g>
      ) : null}
      {c === "ia" ? (
        <g>
          <rect
            x="30"
            y="46"
            width="64"
            height="64"
            className="porte-contour"
          />
          <path d="M40 60h44M40 74h36M40 88h40" className="porte-ligne" />
          <path d="M94 78h44" className="porte-trait" />
          <path d="M146 30v100" className="porte-frontiere" />
          <rect x="160" y="54" width="48" height="48" className="porte-bande" />
          <rect x="175" y="69" width="18" height="18" className="porte-sceau" />
        </g>
      ) : null}
      {c === "systeme" ? (
        <g>
          <path
            d="M70 56h100M70 56v52M170 56v52M70 108h100"
            className="porte-ligne"
          />
          <rect x="50" y="36" width="40" height="40" className="porte-bande" />
          <rect x="150" y="36" width="40" height="40" className="porte-bande" />
          <rect x="50" y="88" width="40" height="40" className="porte-bande" />
          <rect
            x="150"
            y="88"
            width="40"
            height="40"
            className="porte-contour"
          />
          <rect x="161" y="99" width="18" height="18" className="porte-sceau" />
        </g>
      ) : null}
    </svg>
  );
}

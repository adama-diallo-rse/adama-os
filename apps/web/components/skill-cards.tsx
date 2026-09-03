// =====================================================================
// C9-T2, les trois cartes de competence.
//
// Trois cartes, pas dix competences. Un recruteur des ressources humaines
// doit pouvoir classer le profil sans comprendre l'architecture.
//
// Regle de la couche, tenue ici : chaque carte est adossee a une preuve du
// registre C2, jamais a une autoevaluation. Aucune barre de niveau, aucune
// note sur cinq, aucun pourcentage de maitrise : ces objets sont arbitraires
// et ils decredibilisent ce qui les entoure.
//
// Le lien de verification n'apparait QUE si l'affirmation est reellement
// servie par le registre. Une carte qui promettrait une preuve introuvable
// serait exactement le defaut que ce site combat.
// =====================================================================

import Link from "next/link";
import { COMPETENCES } from "../content/profil";
import type { ClaimState } from "../lib/proof/types";

export function SkillCards({
  proofStates,
  titre = "CE QUE JE SAIS FAIRE",
  compact = false,
}: {
  /** Etat des affirmations servies, indexe par identifiant. */
  proofStates: Record<string, ClaimState>;
  titre?: string;
  /** Vrai sur le mode recruteur : moins de blanc, meme contenu. */
  compact?: boolean;
}) {
  return (
    <section
      className={`skill-cards${compact ? " skill-cards--compact" : ""}`}
      aria-labelledby="competences-title"
    >
      {/* Un titre de section, et non un paragraphe : sans lui, la page
          saute de h1 a h3 et un lecteur d'ecran perd la hierarchie. La
          classe portfolio-label emploie la propriete raccourcie font, qui
          remet la graisse a normal : le rendu est identique a celui d'un
          paragraphe. */}
      <h2 className="portfolio-label" id="competences-title">
        {titre}
      </h2>
      <div className="skill-grid">
        {COMPETENCES.map((domaine) => {
          const etat = proofStates[domaine.preuveId];
          return (
            <article className="skill-card" key={domaine.id}>
              <h3>{domaine.titre}</h3>
              <ul className="skill-matieres">
                {domaine.matieres.map((matiere) => (
                  <li key={matiere}>{matiere}</li>
                ))}
              </ul>
              <p>{domaine.fait}</p>
              {etat ? (
                <Link
                  className="skill-proof"
                  href={`/verifier/${domaine.preuveId}`}
                >
                  Vérifier cette compétence
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="skill-proof skill-proof--absente">
                  Preuve non servie aujourd’hui
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

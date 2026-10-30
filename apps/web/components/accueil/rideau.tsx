import { Symbole } from "../marque/symbole";

/**
 * Le rideau d'épure, seul chargement autorisé (moins de 1,2 seconde).
 *
 * Le symbole se dessine en traits de construction (cotes, axes, cercle du
 * sceau, ligne de provenance), puis prend matière, puis le rideau se lève.
 * Il n'existe que si le script du document a posé `data-rideau` avant la
 * première peinture : première visite, hors réduction de mouvement. Sans
 * script, à la seconde visite ou sous réduction de mouvement, il reste
 * `display: none` et le titre est visible d'emblée.
 */
export function Rideau() {
  return (
    <div className="rideau" aria-hidden="true">
      <div className="rideau-planche">
        <Symbole variante="epure" className="rideau-epure" />
        <Symbole className="rideau-plein" />
        <p className="rideau-legende">
          <span>ADAMA OS</span>
          <span>épure 1:1, grille 48</span>
        </p>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  LEXIQUE_ANGLAIS_PROVISOIRE_EH1,
  type UsageAnglaisEH1,
} from "../../../lib/vocabulaire";

type Filtre = "tous" | UsageAnglaisEH1;

const FILTRES: readonly { valeur: Filtre; libelle: string }[] = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "protégé", libelle: "Protégés en anglais" },
  { valeur: "banal", libelle: "Banals en anglais" },
];

function normaliser(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function LexiqueAnglaisEH1() {
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [recherche, setRecherche] = useState("");

  const lignes = useMemo(() => {
    const requete = normaliser(recherche.trim());
    return LEXIQUE_ANGLAIS_PROVISOIRE_EH1.flatMap((entree) =>
      entree.anglais
        .filter(
          (equivalent) => filtre === "tous" || equivalent.usage === filtre,
        )
        .filter((equivalent) => {
          if (!requete) return true;
          return normaliser(
            `${entree.francais} ${equivalent.terme} ${equivalent.precision}`,
          ).includes(requete);
        })
        .map((equivalent) => ({ francais: entree.francais, ...equivalent })),
    );
  }, [filtre, recherche]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="lexique-eh1">
        <div className="lexique-eh1-regle" role="note">
          <span>RÈGLE ACTIVE</span>
          <p>
            Le statut décrit l’usage anglais. Tous ces termes restent interdits
            dans SIGNAL, y compris <code>certified</code>. EB11 remplacera cette
            liste en vague X5.
          </p>
        </div>

        <div className="lexique-eh1-outils">
          <label>
            <span>Rechercher</span>
            <input
              type="search"
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              placeholder="Terme français ou anglais"
            />
          </label>
          <div className="lexique-eh1-filtres" aria-label="Filtrer par usage">
            {FILTRES.map((option) => (
              <button
                key={option.valeur}
                type="button"
                aria-pressed={filtre === option.valeur}
                onClick={() => setFiltre(option.valeur)}
              >
                {option.libelle}
              </button>
            ))}
          </div>
        </div>

        <p className="lexique-eh1-compte" aria-live="polite">
          {lignes.length} équivalent{lignes.length > 1 ? "s" : ""} affiché
          {lignes.length > 1 ? "s" : ""} sur 12 entrées françaises
        </p>

        <div
          className="lexique-eh1-table"
          role="table"
          aria-label="Liste anglaise provisoire EH1"
        >
          <div className="lexique-eh1-entete" role="row">
            <span role="columnheader">ADEC-19</span>
            <span role="columnheader">Équivalent anglais</span>
            <span role="columnheader">Usage anglais</span>
            <span role="columnheader">Lecture</span>
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            {lignes.map((ligne) => (
              <motion.div
                layout
                key={`${ligne.francais}-${ligne.terme}`}
                role="row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="lexique-eh1-ligne"
              >
                <strong role="cell">{ligne.francais}</strong>
                <code role="cell">{ligne.terme}</code>
                <span role="cell" data-usage={ligne.usage}>
                  {ligne.usage}
                </span>
                <p role="cell">{ligne.precision}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {lignes.length === 0 ? (
          <p className="lexique-eh1-vide" role="status">
            Aucun équivalent ne correspond à cette recherche.
          </p>
        ) : null}
      </div>
    </MotionConfig>
  );
}

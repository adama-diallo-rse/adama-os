"use client";

// =====================================================================
// EH4, la redaction d'un numero de SIGNAL.
//
// Deux langues dans un seul formulaire, parce que l'anglais n'est pas une
// edition de plus : les deux versions partent ensemble, chaque abonne recoit
// la sienne. Le controle tourne pendant la frappe avec le meme examen que le
// serveur (lib/lettre/editions.ts) ; l'apercu est le composant de la page
// publique du numero.
//
// Un numero parti ne se modifie plus : le formulaire passe en mode
// correction, demande un motif, et la base garde le texte d'avant.
// =====================================================================

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useActionState, useMemo, useState } from "react";
import { EditionLue } from "../../../components/lettre/edition-lue";
import {
  BLOCS_EDITION,
  LONGUEUR_BLOC,
  LONGUEUR_TITRE_EDITION,
  examinerEdition,
  numeroAffiche,
  type ContenuEdition,
  type Langue,
  type VersionEdition,
} from "../../../lib/lettre/editions";
import {
  enregistrerEdition,
  envoyerEssaiEdition,
  type EtatConsole,
} from "./actions";
import { Bouton, Retour } from "./redaction";

const REPOS: EtatConsole = { statut: "repos" };

const ONGLETS: { langue: Langue; libelle: string }[] = [
  { langue: "fr", libelle: "Français" },
  { langue: "en", libelle: "English" },
];

function Compteur({
  valeur,
  min,
  max,
}: {
  valeur: string;
  min: number;
  max: number;
}) {
  const n = valeur.trim().length;
  return (
    <span
      className="lettre-compteur"
      data-hors={n < min || n > max ? "oui" : "non"}
    >
      {n} / {min} à {max}
    </span>
  );
}

export function RedactionEdition({
  initiale,
  id,
  parti,
  relueInitiale,
  version,
}: {
  initiale: ContenuEdition;
  id: string | null;
  /** Le numero est parti : le formulaire corrige au lieu d'ecrire. */
  parti: boolean;
  relueInitiale: boolean;
  version: number;
}) {
  const [etatEnregistrement, enregistrer] = useActionState(
    enregistrerEdition,
    REPOS,
  );
  const [etatEssai, essayer] = useActionState(envoyerEssaiEdition, REPOS);
  const [edition, setEdition] = useState<ContenuEdition>(initiale);
  const [onglet, setOnglet] = useState<Langue>("fr");
  const [apercu, setApercu] = useState<Langue>("fr");
  const [relue, setRelue] = useState(relueInitiale);
  const [motif, setMotif] = useState("");
  const verdict = useMemo(() => examinerEdition(edition), [edition]);
  const idCourant = etatEnregistrement.editionId ?? id ?? "";
  const n = numeroAffiche(edition.numero || 0);

  const saisir =
    (langue: Langue, cle: keyof VersionEdition) => (valeur: string) =>
      setEdition((e) => ({
        ...e,
        [langue]: { ...e[langue], [cle]: valeur.replace(/\n+/g, " ") },
      }));

  const bloquantsMotif =
    parti && (motif.trim().length < 10 || motif.trim().length > 400);

  return (
    <MotionConfig reducedMotion="user">
      <form className="lettre-redaction edition-redaction" action={enregistrer}>
        <input type="hidden" name="id" value={idCourant} />

        <div className="edition-redaction-tete">
          <label>
            Numéro
            <small>Attribué à vie. Une correction ne crée pas de numéro.</small>
            <input
              type="number"
              name="numero"
              min={1}
              max={9999}
              value={edition.numero || ""}
              readOnly={Boolean(id)}
              onChange={(e) =>
                setEdition((x) => ({
                  ...x,
                  numero: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
              required
            />
          </label>
          <div
            className="edition-onglets"
            role="tablist"
            aria-label="Langue de rédaction"
          >
            {ONGLETS.map((o) => (
              <button
                key={o.langue}
                type="button"
                role="tab"
                id={`onglet-${o.langue}`}
                aria-selected={onglet === o.langue}
                aria-controls={`panneau-${o.langue}`}
                onClick={() => setOnglet(o.langue)}
              >
                {onglet === o.langue ? (
                  <motion.span
                    layoutId="edition-onglet-actif"
                    className="edition-onglet-fond"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="edition-onglet-libelle">{o.libelle}</span>
              </button>
            ))}
          </div>
        </div>

        {ONGLETS.map(({ langue }) => {
          const v = edition[langue];
          return (
            <div
              key={langue}
              id={`panneau-${langue}`}
              role="tabpanel"
              aria-labelledby={`onglet-${langue}`}
              hidden={onglet !== langue}
              className="edition-panneau"
            >
              <label>
                {langue === "fr" ? "Titre" : "Title"}
                <small>
                  Entre {LONGUEUR_TITRE_EDITION.min} et{" "}
                  {LONGUEUR_TITRE_EDITION.max} caractères. L’objet du message
                  sera « SIGNAL #{n}, {v.titre || "…"} ».
                </small>
                <input
                  type="text"
                  name={`titre_${langue}`}
                  value={v.titre}
                  maxLength={LONGUEUR_TITRE_EDITION.max}
                  onChange={(e) => saisir(langue, "titre")(e.target.value)}
                />
              </label>
              {BLOCS_EDITION.map((b) => (
                <div key={b.cle} className="edition-champ">
                  <label>
                    <span className="edition-etiquette">
                      <span>{b.code}</span> {langue === "fr" ? b.fr : b.en}
                    </span>
                    <small>{b.consigne}</small>
                    <textarea
                      name={`${b.cle}_${langue}`}
                      value={v[b.cle]}
                      maxLength={LONGUEUR_BLOC.max}
                      onChange={(e) => saisir(langue, b.cle)(e.target.value)}
                    />
                    <Compteur
                      valeur={v[b.cle]}
                      min={LONGUEUR_BLOC.min}
                      max={LONGUEUR_BLOC.max}
                    />
                  </label>
                  {b.cle === "signal" ? (
                    <label className="edition-source">
                      {langue === "fr"
                        ? "Source primaire, adresse https"
                        : "Primary source, https address"}
                      <input
                        type="url"
                        name={`source_${langue}`}
                        value={v.source}
                        placeholder="https://"
                        onChange={(e) =>
                          saisir(langue, "source")(e.target.value)
                        }
                      />
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}

        <AnimatePresence initial={false}>
          {verdict.bloquants.length > 0 ? (
            <motion.ul
              key="bloquants"
              className="lettre-constats"
              aria-live="polite"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {verdict.bloquants.map((b) => (
                <li key={b} data-niveau="interdit">
                  {b}
                </li>
              ))}
            </motion.ul>
          ) : (
            <motion.p
              key="propre"
              className="lettre-console-ok"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Aucun point bloquant dans les deux langues. La relecture humaine
              reste obligatoire.
            </motion.p>
          )}
        </AnimatePresence>
        {verdict.constats.some((c) => c.niveau === "relire") ? (
          <ul className="lettre-constats">
            {verdict.constats
              .filter((c) => c.niveau === "relire")
              .map((c, i) => (
                <li key={`${c.terme}-${i}`} data-niveau="relire">
                  <code>{c.terme}</code> : {c.regle}
                </li>
              ))}
          </ul>
        ) : null}

        {parti ? (
          <label>
            Motif de la correction
            <small>
              Publié sous le numéro, avec le texte d’avant. Entre 10 et 400
              caractères. Version actuelle : {version}.
            </small>
            <input
              type="text"
              name="motif"
              value={motif}
              maxLength={400}
              onChange={(e) => setMotif(e.target.value)}
              required
            />
          </label>
        ) : (
          <label className="lettre-coche">
            <input
              type="checkbox"
              name="relue"
              value="oui"
              checked={relue}
              onChange={(e) => setRelue(e.target.checked)}
            />
            Relu dans les deux langues : sources ouvertes et exactes, aucun
            client, aucun prospect, aucun prix, aucune donnée de dossier, et
            chaque construction renvoie à une preuve publique.
          </label>
        )}

        <div className="edition-apercu">
          <div className="edition-apercu-tete">
            <p className="portfolio-label">APERÇU, TEL QUE LU EN LIGNE</p>
            <div
              className="edition-bascule"
              role="group"
              aria-label="Langue de l’aperçu"
            >
              {ONGLETS.map((o) => (
                <button
                  key={o.langue}
                  type="button"
                  aria-pressed={apercu === o.langue}
                  onClick={() => setApercu(o.langue)}
                >
                  {o.langue.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={apercu}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <EditionLue
                edition={edition}
                langue={apercu}
                titreNiveau={3}
                version={parti ? version : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lettre-actions">
          <Bouton desactive={verdict.bloquants.length > 0 || bloquantsMotif}>
            {parti
              ? `Corriger SIGNAL #${n}`
              : id
                ? `Enregistrer SIGNAL #${n}`
                : "Enregistrer le numéro"}
          </Bouton>
          <Bouton
            variante="ghost"
            formAction={essayer}
            desactive={verdict.bloquants.length > 0}
          >
            M’envoyer les deux essais
          </Bouton>
        </div>
        <Retour etat={etatEnregistrement} />
        <Retour etat={etatEssai} />
      </form>
    </MotionConfig>
  );
}

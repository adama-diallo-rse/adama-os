"use client";

// =====================================================================
// EH0, la redaction de la note trimestrielle et l'exercice des droits.
//
// Le controle tourne pendant la frappe, avec le meme examen que le serveur
// (lib/lettre/messages.ts, examinerNote) : ce qui est rouge ici sera refuse
// a l'enregistrement, ce qui est ambre doit etre relu. L'apercu montre les
// trois paragraphes dans l'ordre ou l'abonne les lira.
// =====================================================================

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  LONGUEUR_OBJET,
  LONGUEUR_PARAGRAPHE,
  OBJET_NOTE_PAR_DEFAUT,
  SECTIONS_NOTE,
  examinerNote,
  type Note,
} from "../../../lib/lettre/messages";
import {
  enregistrerNote,
  envoyerEssai,
  exercerDroit,
  type EtatConsole,
} from "./actions";

const REPOS: EtatConsole = { statut: "repos" };

function Retour({ etat }: { etat: EtatConsole }) {
  return (
    <AnimatePresence initial={false}>
      {etat.statut !== "repos" ? (
        <motion.div
          key={`${etat.statut}-${etat.message}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className={
            etat.statut === "ok" ? "lettre-console-ok" : "lettre-console-alerte"
          }
          role={etat.statut === "ok" ? "status" : "alert"}
        >
          {etat.message}
          {etat.details?.length ? (
            <ul>
              {etat.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Bouton({
  children,
  variante = "primary",
  formAction,
  desactive = false,
}: {
  children: string;
  variante?: "primary" | "ghost";
  formAction?: (donnees: FormData) => void;
  desactive?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`portfolio-button ${variante}`}
      formAction={formAction}
      disabled={pending || desactive}
      aria-busy={pending}
    >
      {pending ? "En cours" : children}
    </button>
  );
}

export function RedactionNote({
  initiale,
}: {
  initiale: (Note & { id: string; code: string; relue: boolean }) | null;
}) {
  const [etatEnregistrement, enregistrer] = useActionState(
    enregistrerNote,
    REPOS,
  );
  const [etatEssai, essayer] = useActionState(envoyerEssai, REPOS);
  const [note, setNote] = useState<Note>({
    objet: initiale?.objet ?? OBJET_NOTE_PAR_DEFAUT,
    decide: initiale?.decide ?? "",
    echoue: initiale?.echoue ?? "",
    preparation: initiale?.preparation ?? "",
  });
  const [relue, setRelue] = useState(initiale?.relue ?? false);
  const verdict = useMemo(() => examinerNote(note), [note]);
  const id = etatEnregistrement.noteId ?? initiale?.id ?? "";

  const saisie = (cle: keyof Note) => (valeur: string) =>
    setNote((n) => ({ ...n, [cle]: valeur }));

  return (
    <MotionConfig reducedMotion="user">
      <form className="lettre-redaction" action={enregistrer}>
        <input type="hidden" name="id" value={id} />
        <label>
          Objet
          <small>
            Sans date. Entre {LONGUEUR_OBJET.min} et {LONGUEUR_OBJET.max}{" "}
            caractères.
          </small>
          <input
            type="text"
            name="objet"
            value={note.objet}
            onChange={(e) => saisie("objet")(e.target.value)}
            maxLength={LONGUEUR_OBJET.max}
            required
          />
        </label>

        {SECTIONS_NOTE.map((section) => {
          const longueur = note[section.cle].trim().length;
          const hors =
            longueur < LONGUEUR_PARAGRAPHE.min ||
            longueur > LONGUEUR_PARAGRAPHE.max;
          return (
            <label key={section.cle}>
              {section.etiquette}
              <small>{section.consigne}</small>
              <textarea
                name={section.cle}
                value={note[section.cle]}
                onChange={(e) =>
                  saisie(section.cle)(e.target.value.replace(/\n+/g, " "))
                }
                maxLength={LONGUEUR_PARAGRAPHE.max}
                required
              />
              <span
                className="lettre-compteur"
                data-hors={hors ? "oui" : "non"}
              >
                {longueur} / {LONGUEUR_PARAGRAPHE.min} à{" "}
                {LONGUEUR_PARAGRAPHE.max}
              </span>
            </label>
          );
        })}

        {verdict.constats.length > 0 ? (
          <ul className="lettre-constats" aria-live="polite">
            {verdict.constats.map((c, i) => (
              <li key={`${c.terme}-${i}`} data-niveau={c.niveau}>
                <code>{c.terme}</code> : {c.regle}
              </li>
            ))}
          </ul>
        ) : (
          <p className="lettre-console-ok">
            Aucun mot fermé, aucune date, aucun délai repéré. La relecture
            humaine reste obligatoire.
          </p>
        )}

        <label className="lettre-coche">
          <input
            type="checkbox"
            name="relue"
            value="oui"
            checked={relue}
            onChange={(e) => setRelue(e.target.checked)}
          />
          Relue : aucun client, aucun prospect, aucune donnée de dossier, aucun
          prix négocié, aucun montant de revenu, même anonymisé.
        </label>

        <div className="lettre-apercu" aria-label="Aperçu de la note">
          <p className="portfolio-label">APERÇU</p>
          <h3>{note.objet}</h3>
          {SECTIONS_NOTE.map((s) => (
            <div key={s.cle}>
              <h4>{s.etiquette}</h4>
              <p>{note[s.cle] || "…"}</p>
            </div>
          ))}
        </div>

        <div className="lettre-actions">
          <Bouton desactive={verdict.bloquants.length > 0}>
            {initiale ? `Enregistrer ${initiale.code}` : "Enregistrer la note"}
          </Bouton>
          <Bouton
            variante="ghost"
            formAction={essayer}
            desactive={verdict.bloquants.length > 0}
          >
            M’envoyer un essai
          </Bouton>
        </div>
        <Retour etat={etatEnregistrement} />
        <Retour etat={etatEssai} />
      </form>
    </MotionConfig>
  );
}

export function ExerciceDroits() {
  const [etat, agir] = useActionState(exercerDroit, REPOS);
  const [confirme, setConfirme] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <form action={agir}>
        <div className="lettre-droits">
          <label className="lettre-redaction">
            Adresse de la personne
            <input type="email" name="adresse" required autoComplete="off" />
          </label>
          <button
            type="submit"
            name="droit"
            value="acces"
            className="portfolio-button ghost"
          >
            Exporter ses données
          </button>
          <button
            type="submit"
            name="droit"
            value="effacement"
            className="portfolio-button primary"
            disabled={!confirme}
          >
            Effacer l’adresse
          </button>
        </div>
        <label className="lettre-coche" style={{ marginTop: 12 }}>
          <input
            type="checkbox"
            name="confirme"
            value="oui"
            checked={confirme}
            onChange={(e) => setConfirme(e.target.checked)}
          />
          Je confirme une demande d’effacement reçue par écrit de cette
          personne.
        </label>
        <Retour etat={etat} />
        {etat.export ? (
          <pre className="lettre-export">{etat.export}</pre>
        ) : null}
      </form>
    </MotionConfig>
  );
}

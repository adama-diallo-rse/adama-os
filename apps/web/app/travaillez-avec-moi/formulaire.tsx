"use client";

// =====================================================================
// EG0, le formulaire commun des quatre portes.
//
// Le visiteur se range lui-meme : la porte, ce qu'il attend en sortie, sa
// relation avec STRATA ESG et son echeance. Chaque reponse fait avancer le
// panneau de qualification, qui applique la meme fonction pure que le
// serveur. Quand une condition manque, le refus s'affiche AVANT que la
// personne ait ecrit son probleme : elle ne perd pas dix minutes a decrire
// une demande que la regle refusera, et elle repart avec la bonne adresse.
//
// Le serveur rejoue la qualification quoi que le navigateur ait affiche.
// Sans JavaScript, le formulaire s'envoie et la reponse revient pareil.
// =====================================================================

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import type { CodePorte } from "../../content/conseil";
import {
  BORNES,
  CHOIX_ATTENDU,
  CHOIX_ECHEANCE,
  CHOIX_STRATA,
  REFUS,
  phraseRefus,
  qualifier,
  type Attendu,
  type Echeance,
  type RelationStrata,
} from "../../lib/conseil/qualification";
import { deposerDemande, type EtatDemande } from "./actions";

const ENTREE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

type Option = { valeur: string; libelle: string };

type PorteChoix = { code: CodePorte; numero: string; titre: string };

type EtatCondition = "attente" | "tenue" | "manquante" | "manuelle";

function Choix({
  nom,
  legende,
  aide,
  options,
  valeur,
  onChange,
  erreur,
  colonnes = 1,
}: {
  nom: string;
  legende: string;
  aide?: string;
  options: readonly Option[];
  valeur: string;
  onChange: (v: string) => void;
  erreur?: string;
  colonnes?: 1 | 2;
}) {
  const id = useId();
  return (
    <fieldset
      className="conseil-choix"
      data-colonnes={colonnes}
      aria-describedby={
        erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined
      }
      aria-invalid={erreur ? true : undefined}
    >
      <legend>{legende}</legend>
      {aide ? (
        <p className="conseil-aide" id={`${id}-aide`}>
          {aide}
        </p>
      ) : null}
      <div className="conseil-options">
        {options.map((o) => (
          <label
            key={o.valeur}
            data-choisi={valeur === o.valeur ? "oui" : "non"}
          >
            <input
              type="radio"
              name={nom}
              value={o.valeur}
              checked={valeur === o.valeur}
              onChange={() => onChange(o.valeur)}
            />
            <span className="conseil-option-marque" aria-hidden="true" />
            <span>{o.libelle}</span>
          </label>
        ))}
      </div>
      {erreur ? (
        <p className="conseil-erreur" id={`${id}-erreur`}>
          {erreur}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Le message de repli, pre-rempli avec les reponses deja donnees. */
function lienRepli(
  contact: string,
  r: Record<"porte" | "attendu" | "strata" | "echeance" | "probleme", string>,
): string {
  const libelle = (liste: readonly Option[], v: string) =>
    liste.find((o) => o.valeur === v)?.libelle ?? "non renseigné";
  const corps = [
    "Bonjour Adama,",
    "",
    `Porte : ${r.porte || "non renseignée"}`,
    `Ce que j’attends : ${libelle(CHOIX_ATTENDU, r.attendu)}`,
    `Relation avec STRATA ESG : ${libelle(CHOIX_STRATA, r.strata)}`,
    `Échéance : ${libelle(CHOIX_ECHEANCE, r.echeance)}`,
    "",
    "Le problème :",
    r.probleme.trim() || "",
    "",
  ].join("\n");
  return `mailto:${contact}?subject=${encodeURIComponent(
    "Demande par les quatre portes",
  )}&body=${encodeURIComponent(corps)}`;
}

function Bouton({ desactive }: { desactive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="portfolio-button primary conseil-envoyer"
      disabled={pending || desactive}
      aria-disabled={pending || desactive}
    >
      {pending ? "Envoi en cours" : "Envoyer la demande"}
      <span aria-hidden="true">→</span>
    </button>
  );
}

function LigneCondition({
  numero,
  texte,
  etat,
}: {
  numero: number;
  texte: string;
  etat: EtatCondition;
}) {
  const libelle = {
    attente: "à renseigner",
    tenue: "tenue",
    manquante: "manquante",
    manuelle: "vérifiée de mon côté",
  }[etat];
  return (
    <li className="conseil-condition" data-etat={etat}>
      <span className="conseil-condition-numero">{numero}</span>
      <span className="conseil-condition-texte">{texte}</span>
      <motion.span
        key={etat}
        className="conseil-condition-etat"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.24 }}
      >
        {libelle}
      </motion.span>
    </li>
  );
}

export function FormulaireDemande({
  portes,
  porteInitiale,
  conditions,
  mentionVersion,
  texteCase,
  mention,
  relie,
  contact,
  plafond,
}: {
  portes: readonly PorteChoix[];
  porteInitiale: CodePorte | null;
  conditions: readonly { numero: number; texte: string }[];
  mentionVersion: string;
  texteCase: string;
  mention: ReactNode;
  relie: boolean;
  /** Adresse de repli tant que la reception en ligne n'est pas ouverte. */
  contact: string;
  /** Le plafond de la periode en cours, dit apres la reception. */
  plafond: string;
}) {
  const [etat, action] = useActionState<EtatDemande, FormData>(deposerDemande, {
    statut: "repos",
  });
  const [porte, setPorte] = useState<string>(porteInitiale ?? "");
  const [attendu, setAttendu] = useState<string>("");
  const [strata, setStrata] = useState<string>("");
  const [echeance, setEcheance] = useState<string>("");
  const [probleme, setProbleme] = useState("");
  const [accord, setAccord] = useState(false);
  const annonce = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (etat.statut !== "repos") annonce.current?.focus();
  }, [etat]);

  const porteChoisie = portes.find((p) => p.code === porte);
  const libellePorte = porteChoisie
    ? `${porteChoisie.numero} ${porteChoisie.titre}`
    : "";

  // La meme regle que le serveur, sur ce qui est deja renseigne.
  const complet = Boolean(attendu && strata && echeance);
  const qualification = complet
    ? qualifier({
        attendu: attendu as Attendu,
        strata: strata as RelationStrata,
        echeance: echeance as Echeance,
      })
    : null;
  const refusLocal =
    qualification?.verdict === "refus" ? qualification.principal : null;

  const etatStrata: EtatCondition = !strata
    ? "attente"
    : strata === "aucune"
      ? "tenue"
      : "manquante";
  const etatConception: EtatCondition = !attendu
    ? "attente"
    : attendu === "architecture"
      ? "tenue"
      : "manquante";
  const etatDelai: EtatCondition = !echeance
    ? "attente"
    : echeance === "moins-2-semaines"
      ? "manquante"
      : "tenue";
  const etats: EtatCondition[] = [
    etatStrata,
    etatConception,
    etatDelai,
    "manuelle",
  ];

  const erreur = etat.statut === "erreur" ? etat : null;
  const champErreur = (champ: string) =>
    erreur?.champ === champ ? erreur.message : undefined;

  const refusServeur = etat.statut === "refus" ? etat : null;
  const motifAffiche = refusServeur?.motif ?? refusLocal;
  const recue = etat.statut === "recue" ? etat : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="conseil-demande-grille">
        <AnimatePresence mode="wait" initial={false}>
          {recue ? (
            <motion.div
              key="recue"
              className="conseil-recue"
              ref={annonce}
              tabIndex={-1}
              role="status"
              {...ENTREE}
            >
              <svg
                className="conseil-recue-trace"
                viewBox="0 0 64 48"
                aria-hidden="true"
              >
                <motion.path
                  d="M6 26 L24 42 L58 6"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </svg>
              <p className="portfolio-label">DEMANDE REÇUE</p>
              <h3>
                Elle est datée, <span className="serif">et elle sera lue.</span>
              </h3>
              <p>
                Reçue le{" "}
                <time dateTime={recue.recueLe}>
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "long",
                    timeStyle: "short",
                    timeZone: "Europe/Paris",
                  }).format(new Date(recue.recueLe))}
                </time>
                . Deux contrôles restent de mon côté avant toute réponse : votre
                organisation face à STRATA ESG, et la condition 4.
              </p>
              <p>
                Chaque demande reçoit une réponse écrite, qu’elle aboutisse ou
                non. Capacité de la période : {plafond.toLowerCase()} La réponse
                le dira, avec une date de premier échange.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="formulaire"
              action={action}
              className="conseil-formulaire"
              noValidate
              {...ENTREE}
            >
              <input type="hidden" name="version" value={mentionVersion} />
              <div className="conseil-piege" aria-hidden="true">
                <label>
                  Site web
                  <input
                    type="text"
                    name="site_web"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <Choix
                nom="porte"
                legende="1. La porte"
                options={portes.map((p) => ({
                  valeur: p.code,
                  libelle: `${p.numero} ${p.titre}`,
                }))}
                valeur={porte}
                onChange={setPorte}
                erreur={champErreur("porte")}
                colonnes={2}
              />
              <Choix
                nom="attendu"
                legende="2. Ce que vous attendez en sortie"
                options={CHOIX_ATTENDU}
                valeur={attendu}
                onChange={setAttendu}
                erreur={champErreur("attendu")}
              />
              <Choix
                nom="strata"
                legende="3. Votre relation avec STRATA ESG"
                aide="Une organisation cliente ou en discussion avec STRATA ESG est servie par STRATA ESG, jamais par une revue."
                options={CHOIX_STRATA}
                valeur={strata}
                onChange={setStrata}
                erreur={champErreur("strata")}
              />
              <Choix
                nom="echeance"
                legende="4. Votre échéance"
                options={CHOIX_ECHEANCE}
                valeur={echeance}
                onChange={setEcheance}
                erreur={champErreur("echeance")}
                colonnes={2}
              />

              <AnimatePresence initial={false}>
                {refusLocal ? null : (
                  <motion.div
                    key="identite"
                    className="conseil-identite"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="conseil-champ">
                      <label htmlFor={`${id}-probleme`}>
                        5. Le problème, pas la solution
                      </label>
                      <p className="conseil-aide" id={`${id}-probleme-aide`}>
                        Le contexte, le blocage, ce qui a déjà été essayé, et
                        qui devra défendre le système. Aucun document
                        confidentiel, aucune donnée de dossier.
                      </p>
                      <textarea
                        id={`${id}-probleme`}
                        name="probleme"
                        rows={7}
                        maxLength={BORNES.probleme.max}
                        value={probleme}
                        onChange={(e) => setProbleme(e.target.value)}
                        aria-describedby={`${id}-probleme-aide ${id}-compte`}
                        aria-invalid={
                          champErreur("probleme") ? true : undefined
                        }
                      />
                      <p className="conseil-compte" id={`${id}-compte`}>
                        {probleme.trim().length < BORNES.probleme.min
                          ? `${BORNES.probleme.min - probleme.trim().length} caractères encore, au moins`
                          : `${probleme.length} sur ${BORNES.probleme.max}`}
                      </p>
                      {champErreur("probleme") ? (
                        <p className="conseil-erreur">
                          {champErreur("probleme")}
                        </p>
                      ) : null}
                    </div>
                    <div className="conseil-ligne">
                      <div className="conseil-champ">
                        <label htmlFor={`${id}-organisation`}>
                          6. Votre organisation
                        </label>
                        <input
                          id={`${id}-organisation`}
                          name="organisation"
                          autoComplete="organization"
                          maxLength={BORNES.organisation.max}
                          aria-invalid={
                            champErreur("organisation") ? true : undefined
                          }
                        />
                        {champErreur("organisation") ? (
                          <p className="conseil-erreur">
                            {champErreur("organisation")}
                          </p>
                        ) : null}
                      </div>
                      <div className="conseil-champ">
                        <label htmlFor={`${id}-nom`}>7. Votre nom</label>
                        <input
                          id={`${id}-nom`}
                          name="nom"
                          autoComplete="name"
                          maxLength={BORNES.nom.max}
                          aria-invalid={champErreur("nom") ? true : undefined}
                        />
                        {champErreur("nom") ? (
                          <p className="conseil-erreur">{champErreur("nom")}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="conseil-champ">
                      <label htmlFor={`${id}-email`}>
                        8. Votre adresse professionnelle
                      </label>
                      <input
                        id={`${id}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={champErreur("email") ? true : undefined}
                      />
                      {champErreur("email") ? (
                        <p className="conseil-erreur">{champErreur("email")}</p>
                      ) : null}
                    </div>
                    <label className="conseil-accord">
                      <input
                        type="checkbox"
                        name="consentement"
                        value="oui"
                        checked={accord}
                        onChange={(e) => setAccord(e.target.checked)}
                        aria-invalid={
                          champErreur("consentement") ? true : undefined
                        }
                      />
                      <span>{texteCase}</span>
                    </label>
                    {champErreur("consentement") ? (
                      <p className="conseil-erreur">
                        {champErreur("consentement")}
                      </p>
                    ) : null}
                    <details className="conseil-mention">
                      <summary>Ce qui est fait de votre demande</summary>
                      {mention}
                    </details>
                    <div
                      className="conseil-annonce"
                      ref={annonce}
                      tabIndex={-1}
                      role="alert"
                      aria-live="assertive"
                    >
                      {erreur && !erreur.champ ? erreur.message : null}
                    </div>
                    {relie ? (
                      <Bouton desactive={false} />
                    ) : (
                      <div className="conseil-indisponible">
                        <p>
                          La réception en ligne n’est pas encore ouverte. La
                          règle vient de vous ranger : écrivez directement, vos
                          réponses sont déjà reprises dans le message.
                        </p>
                        <a
                          href={lienRepli(contact, {
                            porte: libellePorte,
                            attendu,
                            strata,
                            echeance,
                            probleme,
                          })}
                          className="portfolio-button primary"
                        >
                          Écrire à {contact} <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>

        <aside
          className="conseil-panneau"
          aria-labelledby={`${id}-panneau`}
          data-verdict={
            recue
              ? "recue"
              : motifAffiche
                ? "refus"
                : qualification?.verdict === "recevable"
                  ? "recevable"
                  : "attente"
          }
        >
          <p className="portfolio-label" id={`${id}-panneau`}>
            LA RÈGLE, APPLIQUÉE EN DIRECT
          </p>
          <h3>
            Quatre conditions, <span className="serif">toutes à la fois.</span>
          </h3>
          <ol>
            {conditions.map((c, i) => (
              <LigneCondition
                key={c.numero}
                numero={c.numero}
                texte={c.texte}
                etat={
                  recue
                    ? i === 3
                      ? "manuelle"
                      : "tenue"
                    : (etats[i] ?? "attente")
                }
              />
            ))}
          </ol>
          <AnimatePresence mode="wait" initial={false}>
            {motifAffiche && !recue ? (
              <motion.div
                key={`refus-${motifAffiche}`}
                className="conseil-refus"
                role="status"
                aria-live="polite"
                {...ENTREE}
              >
                <p className="conseil-refus-label">
                  LA RÉPONSE, TELLE QU’ELLE PART
                </p>
                <blockquote>
                  {refusServeur?.reponse ?? phraseRefus(motifAffiche)}
                </blockquote>
                {REFUS[motifAffiche].lien ? (
                  <a
                    href={REFUS[motifAffiche].lien?.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="conseil-refus-lien"
                  >
                    {REFUS[motifAffiche].lien?.libelle}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : null}
                <p className="conseil-refus-note">
                  Rien de ce que vous avez saisi n’est enregistré.
                </p>
              </motion.div>
            ) : qualification?.verdict === "recevable" && !recue ? (
              <motion.p
                key="recevable"
                className="conseil-recevable"
                {...ENTREE}
              >
                Les trois conditions qui dépendent de vous sont tenues. La
                quatrième se vérifie de mon côté, avant toute proposition.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>
    </MotionConfig>
  );
}

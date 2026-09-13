"use client";

// =====================================================================
// EH0, le formulaire de /lettre.
//
// Un seul champ visible, l'adresse. Une case de consentement jamais cochee
// d'avance : son etat initial est `false` et rien dans ce composant ne le
// change sans un geste de la personne. Le test tests/lettre-page.test.tsx
// le verifie au rendu.
//
// Le formulaire fonctionne sans JavaScript : l'action serveur recoit les
// champs, et React rejoue l'etat au rechargement. Avec JavaScript, la
// validation se fait avant l'envoi, l'erreur est annoncee aux lecteurs
// d'ecran, et la reponse remplace le formulaire par une transition courte,
// neutralisee quand le systeme demande moins de mouvement.
//
// Provenance : le site d'ou vient la personne et les parametres de
// campagne du lien sont lus ici, dans le navigateur, et envoyes avec la
// demande. Le serveur les borne et n'en garde que le nom de domaine.
// =====================================================================

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useFormStatus } from "react-dom";
import { inscrire, type EtatFormulaire } from "./actions";

const CLES_CAMPAGNE = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
] as const;

const ADRESSE_PLAUSIBLE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

const ENTREE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

export function FormulaireLettre({
  ouverte,
  version,
  texteCase,
  texteMention,
}: {
  ouverte: boolean;
  version: string;
  texteCase: string;
  texteMention: string;
}) {
  const [etat, action, enCours] = useActionState<EtatFormulaire, FormData>(
    inscrire,
    { statut: "repos" },
  );
  const [adresse, setAdresse] = useState("");
  const [accord, setAccord] = useState(false);
  const [locale, setLocale] = useState<EtatFormulaire | null>(null);
  const [vue, setVue] = useState<"formulaire" | "envoye">("formulaire");
  const [etatLu, setEtatLu] = useState(etat);
  const annonce = useRef<HTMLElement | null>(null);
  const provenance = useRef<Record<string, HTMLInputElement | null>>({});
  const id = useId();

  // Une reponse nouvelle de l'action ajuste l'etat pendant le rendu, et non
  // dans un effet : React rejoue alors ce seul composant, sans cascade.
  if (etat !== etatLu) {
    setEtatLu(etat);
    if (etat.statut === "envoye") {
      setVue("envoye");
      setAdresse("");
      setAccord(false);
    }
  }

  useEffect(() => {
    if (etat.statut !== "repos") {
      annonce.current?.focus();
    }
  }, [etat]);

  const courant = locale ?? etat;
  const erreurAdresse =
    courant.statut === "erreur" && courant.champ === "adresse";
  const erreurAccord =
    courant.statut === "erreur" && courant.champ === "consentement";

  function avantEnvoi(evenement: FormEvent<HTMLFormElement>) {
    if (!ADRESSE_PLAUSIBLE.test(adresse.trim())) {
      evenement.preventDefault();
      setLocale({
        statut: "erreur",
        champ: "adresse",
        message: "Cette adresse ne semble pas valide. Vérifiez-la.",
      });
      return;
    }
    if (!accord) {
      evenement.preventDefault();
      setLocale({
        statut: "erreur",
        champ: "consentement",
        message:
          "Cochez la case pour donner votre accord. Elle n’est jamais cochée d’avance.",
      });
      return;
    }
    // La provenance se lit au moment de l'envoi, dans le navigateur : le site
    // d'ou vient la personne et les parametres de campagne du lien. Les
    // champs caches sont remplis avant que React ne lise le formulaire.
    const champs = provenance.current;
    if (champs.referent) champs.referent.value = document.referrer;
    const params = new URLSearchParams(window.location.search);
    for (const cle of CLES_CAMPAGNE) {
      const champ = champs[cle];
      if (champ) champ.value = params.get(cle) ?? "";
    }
    setLocale(null);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="lettre-carte" data-ouverte={ouverte ? "oui" : "non"}>
        <AnimatePresence mode="wait" initial={false}>
          {vue === "envoye" ? (
            <motion.div key="envoye" className="lettre-envoye" {...ENTREE}>
              <svg
                className="lettre-envoye-trace"
                viewBox="0 0 64 48"
                aria-hidden="true"
              >
                <motion.path
                  d="M4 8h56v32H4z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.path
                  d="M4 8l28 20L60 8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                />
              </svg>
              <p className="portfolio-label">DEMANDE REÇUE</p>
              <h3
                tabIndex={-1}
                ref={(noeud) => {
                  annonce.current = noeud;
                }}
              >
                Il reste un geste, dans votre messagerie.
              </h3>
              <p role="status">{etat.message}</p>
              <button
                type="button"
                className="lettre-lien"
                onClick={() => {
                  setVue("formulaire");
                  setLocale(null);
                }}
              >
                Utiliser une autre adresse
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="formulaire"
              action={action}
              onSubmit={avantEnvoi}
              noValidate
              aria-describedby={`${id}-mention`}
              {...ENTREE}
            >
              <p className="portfolio-label">
                <span aria-hidden="true">●</span> RECEVOIR SIGNAL
              </p>
              {!ouverte ? (
                <p className="lettre-fermee" role="note">
                  La collecte n’est pas encore ouverte. Elle s’ouvre le jour où
                  l’envoi est vérifié de bout en bout. Le texte et la mention
                  sont en ligne dès maintenant, pour être relus.
                </p>
              ) : null}

              <input type="hidden" name="version" value={version} />
              {["referent", ...CLES_CAMPAGNE].map((nom) => (
                <input
                  key={nom}
                  type="hidden"
                  name={nom}
                  defaultValue=""
                  ref={(noeud) => {
                    provenance.current[nom] = noeud;
                  }}
                />
              ))}
              <div className="lettre-piege" aria-hidden="true">
                <label htmlFor={`${id}-site`}>Ne pas remplir</label>
                <input
                  id={`${id}-site`}
                  name="site_web"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

              <label className="lettre-libelle" htmlFor={`${id}-adresse`}>
                Adresse e-mail
              </label>
              <input
                id={`${id}-adresse`}
                className="lettre-champ"
                name="adresse"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                required
                disabled={!ouverte}
                value={adresse}
                onChange={(e) => {
                  setAdresse(e.target.value);
                  if (erreurAdresse) setLocale(null);
                }}
                aria-invalid={erreurAdresse}
                aria-describedby={erreurAdresse ? `${id}-erreur` : undefined}
                placeholder="vous@domaine.fr"
              />

              <div
                className="lettre-accord"
                data-erreur={erreurAccord ? "oui" : "non"}
              >
                <input
                  id={`${id}-accord`}
                  name="consentement"
                  type="checkbox"
                  value="oui"
                  checked={accord}
                  disabled={!ouverte}
                  onChange={(e) => {
                    setAccord(e.target.checked);
                    if (erreurAccord) setLocale(null);
                  }}
                  aria-invalid={erreurAccord}
                  aria-describedby={erreurAccord ? `${id}-erreur` : undefined}
                />
                <label htmlFor={`${id}-accord`}>{texteCase}</label>
              </div>

              <AnimatePresence initial={false}>
                {courant.statut === "erreur" ? (
                  <motion.div
                    key={courant.message}
                    className="lettre-erreur"
                    id={`${id}-erreur`}
                    role="alert"
                    tabIndex={-1}
                    ref={(noeud: HTMLDivElement | null) => {
                      annonce.current = noeud;
                    }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {courant.message}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <BoutonEnvoi desactive={!ouverte || enCours} />

              <p className="lettre-mention-courte" id={`${id}-mention`}>
                {texteMention} <a href="#mention">Lire la mention complète</a>.
                <span className="lettre-version">
                  Texte de consentement {version}
                </span>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function BoutonEnvoi({ desactive }: { desactive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="lettre-bouton"
      disabled={desactive || pending}
      aria-busy={pending}
    >
      <span>
        {pending ? "Envoi en cours" : "Recevoir le lien de confirmation"}
      </span>
      <span aria-hidden="true" className="lettre-bouton-fleche">
        →
      </span>
    </button>
  );
}

/** Le bouton de la derniere etape, sur la page de confirmation. */
export function BoutonConfirmer() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="lettre-bouton lettre-bouton-clair"
      disabled={pending}
      aria-busy={pending}
    >
      <span>
        {pending ? "Confirmation en cours" : "Confirmer mon inscription"}
      </span>
      <span aria-hidden="true" className="lettre-bouton-fleche">
        →
      </span>
    </button>
  );
}

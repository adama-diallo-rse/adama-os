"use client";

import { useActionState, useState } from "react";
import {
  changerStatut,
  effacerDemande,
  lancerPurge,
  type EtatAction,
} from "./actions";

const REPOS: EtatAction = { statut: "repos" };

function Retour({ etat }: { etat: EtatAction }) {
  if (etat.statut === "repos") return null;
  return (
    <p
      className={etat.statut === "ok" ? "demandes-ok" : "form-error"}
      role={etat.statut === "ok" ? "status" : "alert"}
    >
      {etat.message}
    </p>
  );
}

export function ControlesDemande({
  id,
  statut,
  strataVerifie,
  condition4,
  note,
  reponseAcceptation,
}: {
  id: string;
  statut: string;
  strataVerifie: boolean;
  condition4: boolean;
  note: string;
  reponseAcceptation: string;
}) {
  const [etat, action, enCours] = useActionState(changerStatut, REPOS);
  const [etatEffacer, actionEffacer] = useActionState(effacerDemande, REPOS);
  const [copie, setCopie] = useState(false);
  return (
    <div className="demandes-controles">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <label>
          <input
            type="checkbox"
            name="strata_verifie"
            value="oui"
            defaultChecked={strataVerifie}
          />
          Absente de la liste des clients et prospects de STRATA ESG
        </label>
        <label>
          <input
            type="checkbox"
            name="condition_4"
            value="oui"
            defaultChecked={condition4}
          />
          Condition 4 tenue : aucun contrat de travail ne l’interdit
        </label>
        <label className="demandes-note">
          Note interne, jamais envoyée
          <textarea name="note" rows={2} defaultValue={note} maxLength={2000} />
        </label>
        <div className="demandes-boutons">
          <select name="statut" defaultValue={statut} aria-label="Statut">
            <option value="recue">Reçue</option>
            <option value="acceptee">Acceptée</option>
            <option value="refusee">Refusée</option>
            <option value="close">Close</option>
          </select>
          <button
            type="submit"
            className="portfolio-button ghost"
            disabled={enCours}
          >
            Enregistrer
          </button>
          <button
            type="button"
            className="portfolio-button ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(reponseAcceptation);
              setCopie(true);
            }}
          >
            {copie ? "Réponse copiée" : "Copier la réponse de réception"}
          </button>
        </div>
        <Retour etat={etat} />
      </form>
      <form action={actionEffacer} className="demandes-effacer">
        <input type="hidden" name="id" value={id} />
        <label>
          <input type="checkbox" name="confirmer" value="oui" />
          Effacer cette demande, sur demande de la personne
        </label>
        <button type="submit" className="portfolio-button ghost">
          Effacer
        </button>
        <Retour etat={etatEffacer} />
      </form>
    </div>
  );
}

export function BoutonPurge() {
  const [etat, action, enCours] = useActionState(
    async () => lancerPurge(),
    REPOS,
  );
  return (
    <form action={action} className="demandes-purge">
      <button
        type="submit"
        className="portfolio-button ghost"
        disabled={enCours}
      >
        Effacer les demandes de plus de douze mois
      </button>
      <Retour etat={etat} />
    </form>
  );
}

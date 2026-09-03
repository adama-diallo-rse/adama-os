"use client";

// =====================================================================
// Définition d'un mot de passe après un lien de récupération.
//
// Pourquoi cette page vit HORS de /admin : le middleware renvoie vers /login
// toute requête sur /admin sans session. Or au moment où le navigateur arrive
// ici, la session n'existe pas encore, elle est dans le fragment d'URL et
// personne ne l'a lue. Placer la page sous /admin la rendrait donc
// inatteignable exactement quand elle sert.
//
// Elle n'est pas ouverte pour autant : sans jeton valide, aucun formulaire ne
// s'affiche, et `updateUser` échouerait de toute façon sans session.
// =====================================================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

/** Longueur minimale exigée, alignée sur le défaut de Supabase. */
const LONGUEUR_MINIMALE = 12;

type Etat = "verification" | "pret" | "sans-session" | "enregistre";

export function FormulaireMotDePasse({
  erreurInitiale,
}: {
  erreurInitiale?: string;
}) {
  const router = useRouter();
  const [etat, setEtat] = useState<Etat>("verification");
  const [erreur, setErreur] = useState<string | null>(erreurInitiale ?? null);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    let annule = false;

    async function reprendre() {
      const supabase = createClient();

      if (!supabase) {
        if (!annule) {
          setErreur("Supabase n’est pas configuré.");
          setEtat("sans-session");
        }
        return;
      }

      // Variante fragment : Supabase dépose les jetons après le dièse, que le
      // serveur ne voit jamais. C'est ici, et seulement ici, qu'ils peuvent
      // être lus et transformés en session.
      const fragment = window.location.hash.startsWith("#")
        ? new URLSearchParams(window.location.hash.slice(1))
        : null;

      const messageFragment = fragment?.get("error_description");
      if (messageFragment) {
        if (!annule) {
          setErreur(messageFragment.replace(/\+/g, " "));
          setEtat("sans-session");
        }
        return;
      }

      const accessToken = fragment?.get("access_token");
      const refreshToken = fragment?.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        // Le fragment est retiré de la barre d'adresse une fois consommé : il
        // porte un jeton, il n'a rien à faire dans un historique ni dans un
        // lien recopié.
        window.history.replaceState(null, "", window.location.pathname);
        if (error) {
          if (!annule) {
            setErreur(error.message);
            setEtat("sans-session");
          }
          return;
        }
      }

      const { data } = await supabase.auth.getUser();
      if (annule) {
        return;
      }
      setEtat(data.user ? "pret" : "sans-session");
    }

    void reprendre();
    return () => {
      annule = true;
    };
  }, []);

  async function enregistrer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErreur(null);

    if (motDePasse.length < LONGUEUR_MINIMALE) {
      setErreur(
        `Le mot de passe doit faire au moins ${LONGUEUR_MINIMALE} caractères.`,
      );
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur("Les deux saisies ne sont pas identiques.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setErreur("Supabase n’est pas configuré.");
      return;
    }

    setEnvoi(true);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnvoi(false);

    if (error) {
      setErreur(error.message);
      return;
    }

    setEtat("enregistre");
    router.replace("/admin");
  }

  if (etat === "verification") {
    return <p className="auth-note">Vérification du lien…</p>;
  }

  if (etat === "sans-session") {
    return (
      <div className="auth-form">
        <p className="form-error" role="alert">
          {erreur ??
            "Ce lien n’est plus valide. Un lien de récupération ne sert qu’une fois."}
        </p>
        <p className="auth-note">
          Demandez-en un nouveau depuis la page de connexion, et ouvrez-le une
          seule fois, sans le rouvrir depuis l’historique.
        </p>
        <a className="portfolio-text-link" href="/login">
          Retour à la connexion <span aria-hidden="true">→</span>
        </a>
      </div>
    );
  }

  if (etat === "enregistre") {
    return (
      <p className="auth-note">
        Mot de passe enregistré, ouverture de l’atelier…
      </p>
    );
  }

  return (
    <form className="auth-form" onSubmit={enregistrer}>
      <label htmlFor="mdp-nouveau">Nouveau mot de passe</label>
      <input
        id="mdp-nouveau"
        type="password"
        required
        minLength={LONGUEUR_MINIMALE}
        autoComplete="new-password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
      />
      <label htmlFor="mdp-confirmation">Confirmation</label>
      <input
        id="mdp-confirmation"
        type="password"
        required
        minLength={LONGUEUR_MINIMALE}
        autoComplete="new-password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
      />
      {erreur && (
        <p className="form-error" role="alert">
          {erreur}
        </p>
      )}
      <button
        type="submit"
        className="portfolio-button primary"
        disabled={envoi}
      >
        {envoi ? "Enregistrement…" : "Enregistrer"}{" "}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

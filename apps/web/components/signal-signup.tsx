"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "../lib/supabase/client";

type Etat = "idle" | "sending" | "done" | "error";

export function SignalSignup() {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<Etat>("idle");

  async function inscrire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const adresse = email.trim().toLowerCase();
    if (etat === "sending" || !/^\S+@\S+\.\S+$/.test(adresse)) {
      setEtat("error");
      return;
    }
    setEtat("sending");
    const supabase = createClient();
    if (!supabase) {
      setEtat("error");
      return;
    }
    try {
      const { error } = await supabase.from("leads").insert({
        email: adresse,
        source: "newsletter",
        context: {
          publication: "signal",
          path: window.location.pathname,
        },
      });
      if (error) {
        setEtat("error");
        return;
      }
      setEtat("done");
      setEmail("");
    } catch {
      setEtat("error");
    }
  }

  return (
    <section className="signal-signup" aria-labelledby="signal-title">
      <div>
        <p className="portfolio-label">SIGNAL / LETTRE DE RECHERCHE</p>
        <h2 id="signal-title">Suivre le travail, pas le bruit.</h2>
        <p>
          Décisions, erreurs, méthodes et nouveaux actifs. Un envoi quand un
          travail mérite réellement d’être publié.
        </p>
      </div>
      {etat === "done" ? (
        <p className="signal-status" role="status">
          Adresse enregistrée. Le prochain signal arrivera par email.
        </p>
      ) : (
        <form onSubmit={inscrire} noValidate>
          <label htmlFor="signal-email">Adresse email</label>
          <div>
            <input
              id="signal-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@entreprise.fr"
            />
            <button type="submit" disabled={etat === "sending"}>
              {etat === "sending" ? "Enregistrement" : "Recevoir SIGNAL"}
            </button>
          </div>
          <p className="signal-help">
            Pas de cadence artificielle. Désinscription possible à chaque envoi.
          </p>
          {etat === "error" ? (
            <p className="signal-error" role="alert">
              L’adresse n’a pas été enregistrée. Vérifiez-la ou réessayez plus
              tard.
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}

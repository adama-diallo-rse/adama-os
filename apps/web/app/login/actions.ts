"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { absoluteUrl } from "../../lib/site";

export async function login(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured");
  }

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/admin");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(redirectTo || "/admin");
}

export async function logout() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

/**
 * Demande d'un lien de récupération.
 *
 * Le lien renvoie vers /mot-de-passe et non vers la racine : c'est le défaut
 * du 3 septembre 2026, où Supabase repliait sur son Site URL faute de
 * destination explicite, et où la page d'arrivée ne savait rien faire du
 * jeton. La destination est donnée ici, elle ne dépend plus d'un réglage.
 *
 * La réponse est la même que l'adresse existe ou non : dire « cette adresse
 * est inconnue » transformerait le formulaire en test d'existence de compte.
 */
export async function demanderReinitialisation(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20n%27est%20pas%20configur%C3%A9");
  }

  const email = String(formData.get("email") ?? "").trim();

  if (email !== "") {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absoluteUrl("/mot-de-passe"),
    });
  }

  redirect("/login?envoye=1");
}

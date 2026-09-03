// =====================================================================
// Reprise d'un lien d'authentification Supabase, variante PKCE.
//
// Le défaut que cette route ferme, constaté le 3 septembre 2026 : un lien de
// récupération de mot de passe arrivait sur la racine du site, où rien ne le
// ramassait. Supabase avait bien validé le jeton de son côté, l'écran
// affichait la page d'accueil avec une erreur dans le fragment d'URL, et
// aucune session n'était posée. Le site n'avait ni cette route ni la page qui
// va avec : se connecter était donc impossible, un mot de passe ne pouvant
// pas être défini.
//
// Supabase émet deux formes de lien selon la configuration du projet. Celle-ci
// arrive en clair dans la requête, `?code=`, et s'échange contre une session
// côté serveur. L'autre dépose les jetons dans le FRAGMENT, que le serveur ne
// reçoit jamais : elle est traitée dans le navigateur par app/mot-de-passe.
// Les deux existent, les deux sont couvertes.
// =====================================================================
import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Destination par défaut après un lien de récupération. */
const APRES_RECUPERATION = "/mot-de-passe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const erreur = url.searchParams.get("error_description");

  // Une redirection ne sort jamais du site : `next` est traité comme un chemin
  // et jamais comme une adresse, sinon le lien devient une redirection ouverte.
  const demande = url.searchParams.get("next") ?? APRES_RECUPERATION;
  const suite =
    demande.startsWith("/") && !demande.startsWith("//")
      ? demande
      : APRES_RECUPERATION;

  if (erreur) {
    return NextResponse.redirect(
      new URL(`/mot-de-passe?error=${encodeURIComponent(erreur)}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/mot-de-passe?error=Lien%20incomplet", url.origin),
    );
  }

  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL(
        "/login?error=Supabase%20n%27est%20pas%20configur%C3%A9",
        url.origin,
      ),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/mot-de-passe?error=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(suite, url.origin));
}

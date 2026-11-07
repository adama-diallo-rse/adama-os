import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { cartesProjet, categoriesProjet } from "../content/projets";
import { chargerDonnees } from "../lib/accueil";
import { IDENTITE, POSITIONNEMENT } from "../content/profil";
import {
  CarteParisDakar,
  SceneTransformation,
} from "../components/kit/illustrations-offre";

// 7 novembre 2026, seconde passe : l'accueil se présente aux moteurs et aux
// aperçus de lien par ce qu'est ADAMA OS, des logiciels en service, des
// méthodes publiées et un accompagnement. L'accompagnement n'en est qu'un
// volet ; il garde sa propre page et son propre titre.
const TITRE_ACCUEIL =
  "ADAMA OS | Construire ce qui marche, prouver ce qu’on affirme";

export const metadata: Metadata = {
  title: { absolute: TITRE_ACCUEIL },
  description: `${POSITIONNEMENT.fr} ${IDENTITE.situation}`,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITRE_ACCUEIL,
    description: POSITIONNEMENT.fr,
    url: "/",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE_ACCUEIL,
    description: POSITIONNEMENT.fr,
  },
};

// Page serveur : charge les données publiques (RLS, clé anon) puis délègue
// le rendu au composant Dashboard, l'accueil commercial du 7 novembre 2026.
// Le cockpit complet, le moteur et les preuves citables vivent sur /os.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Les parametres sont lus AVANT le chargement : une requete qui finit en
  // redirection n'a aucune raison d'appeler GitHub, Supabase et les sondes
  // produit au prealable.
  const params = await searchParams;

  // L6-T4 puis C9-T4 : ?for=recruiter reste un alias vivant, il ne disparait
  // pas. Un lien envoye par courriel il y a trois mois doit continuer de
  // fonctionner.
  //
  // C'est une REDIRECTION et non plus une seconde vue. La vue precedente
  // rendait un parcours recruteur distinct de /a-propos : deux surfaces
  // pour le meme lecteur, qui divergeaient deja au 2 septembre 2026, l'une
  // vendant une capacite et l'autre une situation. Un alias mene au meme
  // endroit, sinon ce n'est pas un alias, c'est un second site.
  if (params.for === "recruiter") {
    redirect("/a-propos");
  }

  // C10-T9, l'alias symetrique. ?mode=technical ouvre directement la lecture
  // technique. Ce n'est pas un second site : c'est un ORDRE DE LECTURE, et
  // c'est pourquoi il redirige au lieu de rendre une seconde vue. Le
  // parametre vit dans l'URL et jamais dans le stockage du navigateur, pour
  // qu'un lien envoye a un directeur technique ouvre la bonne page chez lui
  // comme chez n'importe qui d'autre.
  if (params.mode === "technical" || params.for === "cto") {
    redirect("/technique");
  }

  const data = await chargerDonnees();

  return (
    <Dashboard
      data={data}
      cartes={cartesProjet()}
      categories={categoriesProjet()}
      carte={
        <CarteParisDakar titre="Carte de l’Afrique et de l’Europe de l’Ouest : le Sénégal en latérite, Dakar relié à Paris par une ligne pointillée de 4 200 kilomètres." />
      }
      scene={
        <SceneTransformation titre="À gauche, des idées éparses, certaines en pointillé. Une ligne de six étapes les mène à droite vers un système posé : trois strates, un sceau, un tableau de pilotage et un baobab." />
      }
    />
  );
}

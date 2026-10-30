import { redirect } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { cartesProjet, categoriesProjet } from "../content/projets";
import { chargerDonnees, preuvesCitables } from "../lib/accueil";
import { SITE_URL } from "../lib/site";
import { ARTICLES } from "../content/articles";
import { METHODES } from "../content/methodes";
import { PORTES } from "../content/conseil";
import type { ResumeAccueil } from "../components/dashboard";

// Les registres lus au rendu serveur, réduits à ce que l'accueil affiche :
// le composant client ne transporte jamais les textes entiers.
const RESUME: ResumeAccueil = {
  articles: ARTICLES.map((a) => ({
    href: a.href,
    code: a.code,
    titre: a.titre,
  })),
  methodes: {
    total: METHODES.length,
    essayees: METHODES.filter((m) => m.etat === "TESTÉ" || m.etat === "PROUVÉ")
      .length,
  },
  portes: PORTES.map((p) => ({ code: p.code, titre: p.titre })),
};

// Page serveur : charge les données publiques (RLS, clé anon) puis délègue
// le rendu au composant Dashboard, l'accueil en cinq actes (refonte du
// 30 octobre 2026). Le cockpit complet vit désormais sur /os.
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
  // rendait un parcours recruteur distinct de /recruteur : deux surfaces
  // pour le meme lecteur, qui divergeaient deja au 2 septembre 2026, l'une
  // vendant une capacite et l'autre une situation. Un alias mene au meme
  // endroit, sinon ce n'est pas un alias, c'est un second site.
  if (params.for === "recruiter") {
    redirect("/recruteur");
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
      citations={preuvesCitables(data.proofs, SITE_URL)}
      resume={RESUME}
    />
  );
}

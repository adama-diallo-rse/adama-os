// =====================================================================
// Le fil d'Ariane déclaré aux moteurs, 14 novembre 2026.
//
// Dans un résultat de recherche, une page sans fil d'Ariane s'affiche avec
// son adresse brute : « adamesg-os.fr › travaillez-avec-moi ». Avec lui,
// le moteur écrit « ADAMA OS › Travailler ensemble ». Le fil ne s'affiche
// pas à l'écran, où le sur-titre de chaque page joue déjà ce rôle : il est
// servi en données structurées par le kit de page intérieure.
//
// Une seule table, celle des pages qui existent. Un segment d'adresse qui
// n'a pas de page à lui (« /en/articles », « /verifier ») n'entre pas dans
// le fil : un maillon qui mène à une page introuvable est un défaut, pas
// une précision. tests/referencement.test.ts vérifie que chaque page
// publique du dossier app/ a son libellé ici.
// =====================================================================

import { absoluteUrl } from "./site";

/**
 * Les pages publiques et le nom sous lequel un moteur les affiche. Les
 * notes de fond y figurent sous un nom court, celui de leur adresse : la
 * table est lue par un composant client, elle n'importe donc pas le texte
 * des articles pour en lire le titre.
 */
export const PAGES: Readonly<Record<string, string>> = {
  "/a-propos": "À propos",
  "/articles": "Notes de fond",
  "/articles/architecture-donnee-esg-afrique-ouest":
    "Architecture de la donnée ESG en Afrique de l’Ouest",
  "/articles/methode-de-preuve": "Méthode de preuve",
  "/articles/reglement-deforestation-rdue-afrique-ouest":
    "Règlement déforestation en Afrique de l’Ouest",
  "/articles/sept-contraintes-donnee-esg-afrique-ouest":
    "Sept contraintes de la donnée ESG en Afrique de l’Ouest",
  "/bibliotheque": "Guides et notes de fond",
  "/catalogue": "Ressources",
  "/changelog": "Journal des versions",
  "/comment-je-travaille": "Comment je travaille",
  "/confiance": "Frontières de données",
  "/confidentialite": "Confidentialité",
  "/decisions": "Décisions d’architecture",
  "/diagnostic": "Diagnostic",
  "/ecosysteme": "Écosystème",
  "/ecriture": "Écriture et assistance",
  "/en": "English",
  "/en/articles/proof-method": "Proof method",
  "/en/articles/eudr-west-africa-origin-data": "EUDR in West Africa",
  "/en/articles/seven-constraints-west-african-esg-data":
    "Seven constraints of West African ESG data",
  "/en/articles/west-african-esg-data-architecture":
    "West African ESG data architecture",
  "/erreurs": "Registre des erreurs",
  "/expansion": "Plan d’expansion",
  "/journal": "Journal de construction",
  "/lettre": "Lettre SIGNAL",
  "/mentions-legales": "Mentions légales",
  "/methode": "Méthode de provenance",
  "/methodes": "Méthodes",
  "/metrics": "Métriques publiques",
  "/os": "État du système",
  "/outils": "Outils gratuits",
  "/parcours": "Parcours",
  "/playbooks": "Playbooks",
  "/preuves": "Preuves",
  "/principes": "Principes",
  "/projets": "Réalisations",
  "/revirements": "Revirements",
  "/revue-architecture": "Revue d’architecture",
  "/systeme": "Fonctionnement du site",
  "/systeme/pannes": "Santé et modes de panne",
  "/technique": "Vue technique",
  "/travaillez-avec-moi": "Travailler ensemble",
};

/**
 * Les familles de pages dont le parent ne se lit pas dans l'adresse : une
 * page de vérification n'a pas d'index à /verifier, sa liste est /preuves.
 */
const PARENTS: Readonly<Record<string, string>> = {
  "/verifier": "/preuves",
};

/** Les surfaces privées : aucun fil, elles ne sont pas indexées. */
const PRIVEES = ["/admin", "/checkin", "/login", "/mot-de-passe", "/auth"];

type Maillon = { nom: string; chemin: string };

/** Le nom d'une page sans libellé : son dernier segment, rendu lisible. */
function nomDeSegment(segment: string): string {
  const texte = decodeURIComponent(segment);
  // Les identifiants (ADR-0007, M-001, 042) se lisent tels quels.
  if (/^[a-z]{1,4}-\d+/i.test(texte) || /^\d+$/.test(texte)) {
    return texte.toUpperCase();
  }
  const mots = texte.replace(/-/g, " ");
  return mots.charAt(0).toUpperCase() + mots.slice(1);
}

/**
 * Le fil d'une adresse, de l'accueil à la page. Vide pour l'accueil et
 * pour les surfaces privées.
 */
export function filAriane(pathname: string | null | undefined): Maillon[] {
  if (!pathname) return [];
  const chemin = pathname.replace(/\/+$/, "") || "/";
  if (chemin === "/") return [];
  if (PRIVEES.some((p) => chemin === p || chemin.startsWith(`${p}/`))) {
    return [];
  }

  const segments = chemin.split("/").filter(Boolean);
  const fil: Maillon[] = [{ nom: "ADAMA OS", chemin: "/" }];
  let courant = "";
  segments.forEach((segment, i) => {
    courant += `/${segment}`;
    const dernier = i === segments.length - 1;
    const parent = PARENTS[courant];
    if (parent && !dernier) {
      fil.push({ nom: PAGES[parent] ?? nomDeSegment(parent), chemin: parent });
      return;
    }
    const nom = PAGES[courant];
    if (nom) fil.push({ nom, chemin: courant });
    else if (dernier) fil.push({ nom: nomDeSegment(segment), chemin: courant });
  });
  return fil;
}

/** Le fil, au format BreadcrumbList. Nul quand il n'y a rien à déclarer. */
export function filArianeJsonLd(pathname: string | null | undefined) {
  const fil = filAriane(pathname);
  if (fil.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fil.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.nom,
      item: absoluteUrl(m.chemin),
    })),
  };
}

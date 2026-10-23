import type { CSSProperties } from "react";
import Image from "next/image";
import { BrandSignature } from "./brand-signature";

// =====================================================================
// Les marques des organisations citees sur le site.
//
// Meme regle que ART_PROJET dans project-grid.tsx : content/profil.ts dit
// QUI est cite, ce fichier dit a quoi cela ressemble. Une identite visuelle
// n'est pas du contenu, elle appartient a la charte.
//
// Deux etats par marque, et c'est un arbitrage, pas un effet. Quatre logos
// en couleurs pleines poses sur la creme feraient quatre accidents
// chromatiques dans une page qui tient sur une palette fermee : le rouge
// UPEC, le cyan AG2R, le degrade Younivibe et le rouge AFEV se battraient
// entre eux et avec l'or. Au repos, la page affiche donc la version encre,
// qui est la declinaison monochrome que la plupart des chartes prevoient.
// Au survol et au focus, la version couleur apparait : un logo
// d'organisation doit pouvoir se montrer tel qu'il est.
//
// Les fichiers de public/logos sont derives des originaux fournis par Adama.
// Le fond blanc a ete retire en calculant la couverture d'encre de chaque
// pixel, la version encre reprend cette couverture avec la seule couleur
// #0D1B2A. Aucun trace n'a ete redessine, aucune proportion modifiee.
// =====================================================================

type MarqueOrg = {
  /** Nom de base dans public/logos. Le suffixe -encre porte la version encre. */
  fichier: string;
  /** Dimensions intrinseques du fichier, pour reserver la place au premier rendu. */
  largeur: number;
  hauteur: number;
  /** Hauteur d'affichage, reglee marque par marque pour equilibrer la bande. */
  affichage: number;
};

const MARQUES: Record<string, MarqueOrg> = {
  ag2r: {
    fichier: "ag2r-la-mondiale",
    largeur: 368,
    hauteur: 140,
    affichage: 44,
  },
  younivibe: {
    fichier: "younivibe",
    largeur: 146,
    hauteur: 140,
    affichage: 40,
  },
  afev: { fichier: "afev", largeur: 361, hauteur: 140, affichage: 38 },
  upec: { fichier: "upec", largeur: 171, hauteur: 140, affichage: 44 },
};

/** La marque d'une organisation, ou null si aucune n'a ete fournie. */
function marqueDe(id: string): MarqueOrg | null {
  return MARQUES[id] ?? null;
}

/**
 * Une marque d'organisation. `nom` sert de texte alternatif : c'est le seul
 * endroit ou le nom est ecrit quand le logo le porte deja, un lecteur d'ecran
 * ne doit pas entendre deux fois la meme organisation.
 *
 * `decoratif` a true quand le nom est deja ecrit a cote en clair : la marque
 * devient une illustration et sort de l'arbre d'accessibilite, plutot que de
 * faire repeter l'organisation.
 *
 * `couleurAuSurvol` a false n'emet que la version encre. C'est le reglage du
 * mode recruteur et de l'impression, ou une image de plus n'apporte rien.
 */
function OrgLogo({
  id,
  nom,
  decoratif = false,
  couleurAuSurvol = true,
  hauteur: hauteurDemandee,
  className = "",
}: {
  id: string;
  nom: string;
  decoratif?: boolean;
  couleurAuSurvol?: boolean;
  hauteur?: number;
  className?: string;
}) {
  const marque = marqueDe(id);
  if (!marque) return null;
  const hauteur = hauteurDemandee ?? marque.affichage;
  const largeur = Math.round((marque.largeur * hauteur) / marque.hauteur);
  return (
    <span
      className={`org-logo ${className}`.trim()}
      style={{ width: largeur, height: hauteur }}
    >
      <Image
        className="org-logo-encre"
        src={`/logos/${marque.fichier}-encre.webp`}
        alt={decoratif ? "" : nom}
        aria-hidden={decoratif || undefined}
        width={largeur}
        height={hauteur}
      />
      {couleurAuSurvol && (
        <Image
          className="org-logo-couleur"
          src={`/logos/${marque.fichier}.webp`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={largeur}
          height={hauteur}
        />
      )}
    </span>
  );
}

// =====================================================================
// Les deux maisons, 23 octobre 2026.
//
// STRATA ESG et Pharivo entrent dans les experiences comme des activites,
// pas comme des employeurs. Leur marque n'est pas un fichier fourni et
// retouche comme les quatre logos ci-dessus : c'est le mot-symbole que
// chaque maison sert elle-meme, trace en ligne et peint a la couleur du
// texte. Il suit donc la meme regle d'etat sans fichier de plus : encre au
// repos, couleur de la maison au survol, encre seule en impression.
// =====================================================================

const MAISONS: Record<string, "strata" | "pharivo"> = {
  strata: "strata",
  pharivo: "pharivo",
};

/** La maison d'une experience, ou null quand ce n'en est pas une. */
function maisonDe(id: string): "strata" | "pharivo" | null {
  return MAISONS[id] ?? null;
}

/** Vrai quand l'organisation se montre par une marque plutot que par son nom. */
export function aUneMarque(id: string): boolean {
  return marqueDe(id) !== null || maisonDe(id) !== null;
}

/**
 * La marque d'une organisation, qu'elle soit un fichier fourni ou le
 * mot-symbole d'une maison. Meme contrat que OrgLogo : `nom` nomme la
 * marque quand rien d'autre ne l'ecrit, `decoratif` la sort de l'arbre
 * d'accessibilite quand le nom figure deja a cote.
 */
export function OrgMark({
  id,
  nom,
  decoratif = false,
  couleurAuSurvol = true,
  hauteur,
  className = "",
}: {
  id: string;
  nom: string;
  decoratif?: boolean;
  couleurAuSurvol?: boolean;
  hauteur?: number;
  className?: string;
}) {
  const maison = maisonDe(id);
  if (!maison) {
    return (
      <OrgLogo
        id={id}
        nom={nom}
        decoratif={decoratif}
        couleurAuSurvol={couleurAuSurvol}
        hauteur={hauteur}
        className={className}
      />
    );
  }
  return (
    <span
      className={`org-maison org-maison--${maison} ${
        couleurAuSurvol ? "" : "org-maison--encre"
      } ${className}`.trim()}
      style={{ "--maison-hauteur": `${hauteur ?? 30}px` } as CSSProperties}
      aria-hidden={decoratif || undefined}
    >
      <BrandSignature brand={maison} />
    </span>
  );
}

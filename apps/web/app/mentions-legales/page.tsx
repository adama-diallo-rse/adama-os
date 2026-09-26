import type { Metadata } from "next";
import {
  LegalDefinitionList,
  LegalPage,
  LegalSection,
} from "../../components/legal-page";
import { EDITEUR, PORTEUR_CONSEIL } from "../../lib/legal";
import { SITE_HOST } from "../../lib/site";

// L10-T2, mentions légales du cockpit.
// Ce site est édité par une personne physique, à titre personnel. Les
// mentions des produits du groupe sont différentes : ne rien recopier d'un
// produit vers ici, ni l'inverse, l'éditeur et les finalités ne sont pas les
// mêmes.
export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergeur et conditions d'utilisation d'Adama OS, tableau de bord personnel d'Adama Diallo.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Adama OS est un laboratoire public, publié à titre individuel. Il présente une activité de conseil, n’encaisse aucun paiement en ligne, n’héberge aucun produit et ne traite aucune donnée client."
    >
      <LegalSection title="Éditeur">
        <LegalDefinitionList
          items={[
            { label: "Responsable", value: EDITEUR.nom },
            { label: "Statut", value: EDITEUR.statut },
            { label: "Objet du site", value: EDITEUR.objet },
            {
              label: "Contact",
              value: (
                <a
                  href={`mailto:${EDITEUR.contact}`}
                  className="text-emerald underline decoration-dotted hover:text-emerald-bright"
                >
                  {EDITEUR.contact}
                </a>
              ),
            },
            { label: "Domaine", value: SITE_HOST },
            {
              label: "Activité de conseil",
              value: `${PORTEUR_CONSEIL.nom}, ${PORTEUR_CONSEIL.statut}, SIREN ${PORTEUR_CONSEIL.siren}`,
            },
          ]}
        />
        <p>
          Directeur de la publication : {EDITEUR.nom}. Aucune vente n&apos;est
          conclue et aucun paiement n&apos;est perçu sur ce site. Les conditions
          de vente seront publiées avant tout encaissement.
        </p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <LegalDefinitionList
          items={[
            {
              label: "Hébergeur",
              value:
                "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
            },
            {
              label: "Exécution",
              value:
                "région cdg1 (Paris), configurée dans apps/web/vercel.json",
            },
            {
              label: "Base de données",
              value: "Supabase, région Union européenne (Irlande)",
            },
          ]}
        />
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          Le code source du cockpit est publié sur GitHub et reste la propriété
          de son auteur. Les marques, noms de produits et contenus des tiers
          cités appartiennent à leurs titulaires respectifs.
        </p>
        <p>
          Les documents de référence utilisés par l&apos;agent conversationnel
          (normes et standards de reporting de durabilité) ne sont ni
          redistribués ni republiés : seules des citations courtes apparaissent
          dans les réponses, avec leur source.
        </p>
      </LegalSection>

      <LegalSection title="Nature des informations publiées">
        <p>
          Les chiffres affichés proviennent des sources indiquées à côté
          d&apos;eux. Aucune valeur n&apos;est simulée pour meubler une carte :
          en l&apos;absence de relevé, le site affiche son état vide.
        </p>
        <p>
          Les informations réglementaires diffusées ici sont données à titre
          d&apos;information. Elles ne constituent ni un conseil juridique, ni
          un avis de conformité.
        </p>
      </LegalSection>

      <LegalSection title="Signalement">
        <p>
          Toute erreur factuelle, tout contenu contestable ou toute demande liée
          aux données personnelles peut être signalé à {EDITEUR.contact}.
          Réponse sous quinze jours.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

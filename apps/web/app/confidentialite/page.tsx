import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalDefinitionList,
  LegalPage,
  LegalSection,
} from "../../components/legal-page";
import {
  AUTOMATED_PROCESSING_NOTICE,
  EDITEUR,
  SOUS_TRAITANTS,
} from "../../lib/legal";

// L10-T2, politique de confidentialité et de cookies du cockpit.
// Écrite à partir de ce que le code fait réellement, pas d'un modèle : chaque
// sous-traitant listé ici correspond à une dépendance présente dans le dépôt.
export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Données traitées par Adama OS, sous-traitants, durées de conservation, cookies et exercice des droits.",
  alternates: { canonical: "/confidentialite" },
  robots: { index: true, follow: true },
};

type Traitement = {
  finalite: string;
  donnees: string;
  base: string;
  duree: string;
};

const TRAITEMENTS: Traitement[] = [
  {
    finalite: "Prise de contact recruteur",
    donnees: "adresse e-mail, contexte du clic (page, intention déclarée)",
    base: "consentement, formulaire volontaire",
    duree: "24 mois à compter du dernier échange",
  },
  {
    finalite: "Mesure d'audience",
    donnees:
      "pages vues, clics sortants, identifiant technique pseudonyme, pays",
    base: "consentement, refusable et révocable",
    duree: "12 mois",
  },
  {
    finalite: "Diagnostic technique",
    donnees: "URL, navigateur, trace d'erreur",
    base: "intérêt légitime, maintien en condition opérationnelle",
    duree: "90 jours",
  },
  {
    finalite: "Agent conversationnel adama.ai",
    donnees: "texte de la question posée",
    base: "exécution du service demandé",
    duree:
      "aucune conservation par le cockpit, ni compte ni historique côté site",
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Confidentialité"
      intro="Ce site collecte le strict nécessaire. Aucune publicité, aucun revendeur de données, aucun traceur tiers, et rien du tout tant que vous n'avez pas répondu au bandeau de consentement."
    >
      <LegalSection title="Responsable de traitement">
        <LegalDefinitionList
          items={[
            {
              label: "Responsable",
              value: `${EDITEUR.nom}, ${EDITEUR.statut}`,
            },
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
          ]}
        />
      </LegalSection>

      <LegalSection title="Ce qui est traité, et pourquoi">
        <div className="space-y-3">
          {TRAITEMENTS.map((t) => (
            <div
              key={t.finalite}
              className="rounded-[calc(var(--radius)_-_0.125rem)] border border-border bg-surface-raised px-3 py-3"
            >
              <p className="font-mono text-sm font-semibold text-foreground">
                {t.finalite}
              </p>
              <p className="mt-1 font-mono text-xs text-muted">
                <span className="text-faint">données : </span>
                {t.donnees}
              </p>
              <p className="font-mono text-xs text-muted">
                <span className="text-faint">base légale : </span>
                {t.base}
              </p>
              <p className="font-mono text-xs text-muted">
                <span className="text-faint">conservation : </span>
                {t.duree}
              </p>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalSection title="Sous-traitants">
        <p>
          Chaque service listé ci-dessous intervient sur une partie précise du
          site. Aucun autre service tiers n&apos;est chargé par les pages.
        </p>
        <LegalDefinitionList
          items={SOUS_TRAITANTS.map((t) => ({
            label: t.nom,
            value: `${t.donnees}, ${t.region}`,
          }))}
        />
        <p>
          Deux d&apos;entre eux sont établis hors Union européenne : Vercel et
          OpenAI. Les transferts correspondants reposent sur les clauses
          contractuelles types de la Commission européenne. Les données de
          mesure d&apos;audience et la base restent, elles, dans l&apos;Union.
        </p>
      </LegalSection>

      <LegalSection title="Cookies et stockage local">
        <p>
          Aucun cookie de mesure n&apos;est déposé avant votre choix. Tant que
          le bandeau n&apos;a pas reçu de réponse, les événements sont gardés en
          mémoire vive, dans l&apos;onglet, et rien n&apos;est envoyé. En cas de
          refus, cette file est vidée et plus aucune mesure n&apos;est prise.
        </p>
        <p>
          En cas d&apos;acceptation, l&apos;outil de mesure utilise le stockage
          local du navigateur pour un identifiant pseudonyme. Le choix se
          révoque à tout moment par le lien{" "}
          <span className="text-foreground">cookies</span> du pied de page du
          dashboard.
        </p>
      </LegalSection>

      <LegalSection title="Agent conversationnel">
        <p>{AUTOMATED_PROCESSING_NOTICE}</p>
        <p>
          Les questions posées à adama.ai sont transmises au fournisseur de
          modèle pour produire la réponse, puis oubliées par le site : aucun
          historique de conversation n&apos;est stocké ici. N&apos;y saisissez
          pas de donnée personnelle ni de document confidentiel.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits">
        <p>
          Accès, rectification, effacement, limitation, opposition et
          portabilité s&apos;exercent par un simple message à {EDITEUR.contact}.
          Réponse sous quinze jours. En cas de désaccord persistant, un recours
          est ouvert auprès de la CNIL.
        </p>
        <p>
          Voir aussi les{" "}
          <Link
            href="/mentions-legales"
            className="text-emerald underline decoration-dotted hover:text-emerald-bright"
          >
            mentions légales
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}

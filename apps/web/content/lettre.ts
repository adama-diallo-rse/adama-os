// =====================================================================
// EH0, les textes de la lettre SIGNAL.
//
// Ce fichier est relu par un humain et versionne. Il porte tout ce qu'une
// personne lit avant de donner son adresse : le texte de la case, la
// mention courte sous le champ, la mention complete, et les engagements.
//
// Le texte de la case et la mention courte forment une VERSION de
// consentement. Chaque adresse enregistree pointe vers la version exacte
// qu'elle a lue. Changer une virgule de ces deux textes impose donc :
//   1. d'incrementer `version` (EH0-2, EH0-3...) ;
//   2. d'ajouter la nouvelle version par une migration dans
//      packages/db/migrations-lettre ;
//   3. de laisser l'ancienne en base, jamais modifiee.
// Le test tests/lettre-sql.test.ts echoue si ce fichier et le semis SQL
// divergent.
//
// Aucun texte ici n'annonce de date de parution ni de delai : la lettre
// n'a pas commence a paraitre, et un message lu par un inscrit d'aujourd'hui
// comme par celui de l'an prochain ne peut rien promettre de date.
// =====================================================================

export const CONSENTEMENT = {
  version: "EH0-1",
  texteCase:
    "J’accepte de recevoir SIGNAL, la lettre d’ADAMA OS, et en attendant sa parution une note courte par trimestre. Je peux me désinscrire en un clic à tout moment.",
  texteMention:
    "Adama Diallo, entrepreneur individuel, traite cette adresse pour vous envoyer SIGNAL, sur la base de votre consentement. Elle n’est jamais cédée ni versée à une autre liste, et elle est effacée dès votre désinscription. La mention complète, plus bas, donne les durées et vos droits.",
} as const;

/** Responsable de traitement de la liste, distinct de l'editeur du site. */
export const RESPONSABLE_LETTRE = {
  nom: "Adama Diallo",
  statut: "entrepreneur individuel",
  siren: "913518031",
  branche: "ADAMA OS EXPANSION",
} as const;

/** Les cinq blocs d'une lettre, repris du gabarit EH1 et EX1. */
export const BLOCS_LETTRE = [
  {
    code: "01",
    nom: "Signal",
    texte:
      "Un fait extérieur daté : une évolution réglementaire, une publication, une sortie technique.",
  },
  {
    code: "02",
    nom: "Système",
    texte: "Ce que ce fait change dans la conception d’un système de donnée.",
  },
  {
    code: "03",
    nom: "Décision",
    texte: "Comment la question serait tranchée ici, et les options écartées.",
  },
  {
    code: "04",
    nom: "Construction",
    texte:
      "Ce qui a réellement été construit depuis la lettre précédente, avec le lien vers la preuve.",
  },
  {
    code: "05",
    nom: "Idée",
    texte: "Une idée non ouverte, avec la condition qui l’ouvrirait.",
  },
] as const;

/** Ce que la plomberie tient, et que la page affirme. */
export const ENGAGEMENTS = [
  {
    titre: "Double confirmation",
    texte:
      "Une adresse n’entre dans la liste qu’après un clic sur le lien reçu, puis sur le bouton de confirmation. Sans ce geste, elle est supprimée.",
  },
  {
    titre: "Désinscription en un clic",
    texte:
      "Chaque message porte un lien qui désinscrit au premier clic, sans compte ni question. Les messageries qui le proposent l’affichent aussi en tête du message.",
  },
  {
    titre: "Aucun pistage",
    texte:
      "Aucune mesure d’ouverture, aucun lien réécrit pour compter les clics, aucune image de suivi.",
  },
  {
    titre: "Une liste qui ne se mélange pas",
    texte:
      "Aucune adresse ne vient d’une autre liste et aucune n’y part, dans aucun sens. Chaque adresse garde la trace de la page où elle a été donnée.",
  },
] as const;

type LigneMention = { label: string; valeur: string };

/**
 * La mention d'information complete, affichee sur /lettre et reprise sur
 * /confidentialite. Les durees sont celles que la base applique : la purge
 * quotidienne de /api/lettre/sync les tient, elles ne sont pas des voeux.
 */
export const MENTION_COMPLETE: readonly LigneMention[] = [
  {
    label: "Responsable de traitement",
    valeur: `${RESPONSABLE_LETTRE.nom}, ${RESPONSABLE_LETTRE.statut}, SIREN ${RESPONSABLE_LETTRE.siren}, qui porte ${RESPONSABLE_LETTRE.branche}.`,
  },
  {
    label: "Finalité",
    valeur:
      "Envoyer SIGNAL et, tant qu’elle ne paraît pas, une note courte par trimestre. Rien d’autre : aucune prospection, aucun profilage, aucune mesure d’ouverture ni de clic.",
  },
  {
    label: "Base légale",
    valeur:
      "Votre consentement, donné en cochant la case puis confirmé par le lien reçu. Il se retire à tout moment, aussi simplement qu’il a été donné.",
  },
  {
    label: "Données",
    valeur:
      "L’adresse ; la version du texte de consentement affiché ; la page d’inscription, le site d’où vous veniez et les paramètres de campagne du lien s’il y en avait ; les dates de demande, de confirmation et de désinscription ; une empreinte chiffrée et non réversible de l’adresse IP, qui sert à limiter les abus.",
  },
  {
    label: "Destinataires",
    valeur:
      "Adama Diallo seul. Trois sous-traitants interviennent : Resend pour l’envoi, Supabase pour une base dédiée à la lettre, distincte de toute autre base, et Vercel pour l’hébergement du site. Aucune adresse n’est cédée, prêtée ni transmise à STRATA ESG ou à une autre liste.",
  },
  {
    label: "Transfert hors Union européenne",
    valeur:
      "Resend et Vercel sont des sociétés établies aux États-Unis. L’envoi part de la région Union européenne de Resend. Les transferts reposent sur les clauses contractuelles types de la Commission européenne et, pour Resend, sur le cadre de protection des données entre l’Union européenne et les États-Unis.",
  },
  {
    label: "Conservation",
    valeur:
      "Sans confirmation, l’adresse est supprimée 30 jours après la demande. Une fois confirmée, elle est gardée tant que l’inscription dure. À la désinscription, l’adresse est effacée immédiatement ; seules restent son empreinte non réversible et les dates, pendant 3 ans, pour prouver le consentement et son retrait, puis elles sont supprimées.",
  },
  {
    label: "Vos droits",
    valeur:
      "Accès, rectification, effacement, limitation, opposition, portabilité et retrait du consentement, par le lien de chaque message ou par un message à l’adresse de contact. Réponse sous quinze jours. En cas de désaccord, une réclamation est ouverte auprès de la CNIL.",
  },
  {
    label: "Changement de structure",
    valeur:
      "Si la lettre passe un jour à une société détenue par Adama Diallo, l’information vous parvient avant le transfert, avec la possibilité de vous désinscrire avant qu’il ait lieu.",
  },
] as const;

/** Etats affiches par /lettre apres un lien ou une action, jamais un jeton. */
export const ETATS_PAGE = {
  confirme: {
    titre: "Inscription confirmée.",
    texte:
      "Un message de bienvenue part vers votre adresse. Il dit ce qui arrive ensuite, et comment partir en un clic.",
  },
  desinscrit: {
    titre: "Désinscription enregistrée.",
    texte:
      "Votre adresse est effacée de la liste. Aucun autre message ne partira. Pour revenir, il faudra refaire une inscription et la confirmer.",
  },
  "deja-desinscrit": {
    titre: "Cette adresse est déjà désinscrite.",
    texte: "Rien n’a changé : aucun message ne partira vers elle.",
  },
  "lien-expire": {
    titre: "Ce lien a expiré.",
    texte:
      "Un lien de confirmation vit sept jours. Refaites une demande ci-dessous : un nouveau lien part aussitôt.",
  },
  "lien-invalide": {
    titre: "Ce lien n’est plus valable.",
    texte:
      "Il a peut-être déjà servi, ou il a été tronqué par la messagerie. Si vous êtes déjà inscrit, il n’y a rien à refaire.",
  },
  indisponible: {
    titre: "La lettre est momentanément indisponible.",
    texte:
      "La demande n’a pas pu être traitée. Rien n’a été enregistré. Réessayez plus tard.",
  },
} as const;

type EtatPage = keyof typeof ETATS_PAGE;

export function estEtatPage(valeur: string | undefined): valeur is EtatPage {
  return (
    typeof valeur === "string" &&
    Object.prototype.hasOwnProperty.call(ETATS_PAGE, valeur)
  );
}

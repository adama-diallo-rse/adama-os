// =====================================================================
// ER1, AXP-255, la règle de formulation institutionnelle.
//
// Être invité par une institution ne se dit jamais comme être reconnu par
// elle. Pour chacune des neuf voies d'AXP-246 à AXP-254 (neuf et non dix,
// correction qui fait foi), une phrase autorisée en français et en anglais,
// une phrase interdite, et la tournure pivot qui les sépare. La règle tient
// en une ligne : on écrit ce qu'on a fait, jamais ce qu'on serait.
//
// Les phrases entre crochets sont des gabarits : [école], [date] se
// remplacent par des faits datés, et une institution ne se nomme sur une
// surface commerciale qu'avec son accord écrit au dossier (XINV-52).
//
// Le contrôle controlerFormulation ajoute au vocabulaire fermé d'ADEC-19 les
// tournures d'adoubement que la liste ne couvre pas : habilité, agréé,
// partenaire, reconnu par, validé par, labellisé, recommandé par. Il est
// vérifié par tests/formulation-institutionnelle.test.ts, dans les deux
// sens : chaque phrase autorisée passe, chaque phrase interdite est refusée.
// =====================================================================

import { controlerTexte, type Constat } from "../lib/vocabulaire";

type VoieInstitutionnelle = {
  code: `AXP-${number}`;
  voie: string;
  autoriseeFr: string;
  interditeFr: string;
  autoriseeEn: string;
  pivot: string;
  /** Ce que l'accord écrit de XINV-52 doit couvrir avant toute mention. */
  accord: string;
};

export const VOIES_INSTITUTIONNELLES: readonly VoieInstitutionnelle[] = [
  {
    code: "AXP-246",
    voie: "Intervention en école",
    autoriseeFr:
      "J’ai donné une séance sur l’architecture de la preuve dans le master [intitulé] de [école], le [date].",
    interditeFr:
      "Formateur agréé par [école], je délivre un enseignement reconnu par l’établissement.",
    autoriseeEn:
      "I taught a session on evidence architecture in the [programme] master’s at [school] on [date].",
    pivot: "Le verbe dit l’acte daté, jamais une qualité conférée par l’école.",
    accord:
      "Accord écrit de la direction du programme pour citer l’école et l’intitulé de la séance.",
  },
  {
    code: "AXP-247",
    voie: "Direction de mémoire et jury",
    autoriseeFr:
      "J’ai siégé au jury des mémoires du master [intitulé] de [école], session de [date].",
    interditeFr:
      "Membre habilité du jury de [école], je valide les compétences des candidats.",
    autoriseeEn:
      "I sat on the thesis panel of the [programme] master’s at [school], [date] session.",
    pivot:
      "Siéger se dit, noter se tait : ce que le jury délivre appartient à l’école.",
    accord:
      "Accord écrit de l’école pour mentionner la participation au jury, sans nom d’étudiant.",
  },
  {
    code: "AXP-248",
    voie: "Adhésion à une association professionnelle",
    autoriseeFr:
      "Je suis membre de [association] depuis [date], à titre individuel.",
    interditeFr:
      "Labellisé par [association], ma méthode est recommandée par ses membres.",
    autoriseeEn:
      "I have been an individual member of [association] since [date].",
    pivot:
      "Être membre est un fait d’adhésion, pas un jugement de l’association sur le travail.",
    accord:
      "Vérification des règles d’usage du nom de l’association, et accord écrit pour toute surface commerciale.",
  },
  {
    code: "AXP-249",
    voie: "Groupe de travail normatif",
    autoriseeFr:
      "J’ai contribué aux travaux de [commission] sur [sujet], avec le lien vers la consultation, en [date].",
    interditeFr:
      "Ma méthode est validée par [commission] et reconnue par l’État.",
    autoriseeEn:
      "I contributed to the work of [committee] on [topic], with the link to the consultation, in [date].",
    pivot:
      "Contribuer à un texte collectif ne rend pas sa propre méthode conforme à ce texte.",
    accord:
      "Accord écrit du secrétariat de la commission pour citer la contribution nominativement.",
  },
  {
    code: "AXP-250",
    voie: "Bailleurs et agences de développement",
    autoriseeFr:
      "J’ai réalisé une mission de revue d’architecture de donnée dans un programme financé par [bailleur], en [date].",
    interditeFr:
      "Partenaire de [bailleur], je vous ouvre l’accès à ses financements.",
    autoriseeEn:
      "I carried out a data architecture review within a programme funded by [funder] in [date].",
    pivot:
      "Le bailleur finance un programme, il ne devient jamais un partenaire ni une porte vers un financement.",
    accord:
      "Accord écrit du bailleur ou de l’agence d’exécution pour citer la mission, sans donnée du bénéficiaire.",
  },
  {
    code: "AXP-251",
    voie: "Ordres professionnels et fédérations",
    autoriseeFr:
      "J’ai présenté une note de méthode au congrès de [ordre], le [date].",
    interditeFr: "Méthode recommandée par [ordre] à tous ses membres.",
    autoriseeEn: "I presented a methods note at the [body] congress on [date].",
    pivot: "Présenter devant un ordre n’est pas être recommandé par lui.",
    accord:
      "Accord écrit de l’ordre pour toute mention hors du programme du congrès.",
  },
  {
    code: "AXP-252",
    voie: "Distinctions et palmarès",
    autoriseeFr:
      "Le projet [nom] a reçu le prix [nom du prix] de [organisateur] en [date], dans la catégorie [catégorie].",
    interditeFr:
      "Lauréat reconnu par [organisateur], la meilleure méthode du marché.",
    autoriseeEn:
      "The [name] project received the [award] from [organiser] in [date], in the [category] category.",
    pivot: "Une distinction obtenue est un fait daté, jamais un superlatif.",
    accord:
      "Règlement du prix relu : aucune candidature dont le dossier exige une déclaration impossible.",
  },
  {
    code: "AXP-253",
    voie: "Incubateurs et écoles africaines",
    autoriseeFr:
      "J’ai animé un atelier gratuit de trois heures pour les porteurs de projet de [incubateur], le [date].",
    interditeFr:
      "Partenaire de [incubateur], j’accompagne les entreprises en retard sur la durabilité.",
    autoriseeEn:
      "I ran a free three-hour workshop for founders at [incubator] on [date].",
    pivot:
      "L’atelier se décrit par ce qui a été fait, jamais par un retard supposé des participants.",
    accord:
      "Accord écrit de la structure pour la citer, et aucune liste de participants publiée.",
  },
  {
    code: "AXP-254",
    voie: "Chaire ou cours long",
    autoriseeFr:
      "J’enseigne le cours [intitulé] à [établissement] depuis [date], [nombre] heures par an.",
    interditeFr:
      "Titulaire d’une chaire reconnue par l’État, j’habilite mes étudiants.",
    autoriseeEn:
      "I have taught the [course] course at [institution] since [date], [number] hours a year.",
    pivot:
      "Enseigner dans une formation qui délivre, jamais délivrer soi-même.",
    accord:
      "Accord écrit de l’établissement pour citer le cours et son volume.",
  },
];

const ADOUBEMENT: readonly { motif: RegExp; regle: string }[] = [
  {
    motif: /\bhabilit\p{L}*/giu,
    regle: "ER1 : habiliter se dit d’une autorité, jamais de soi.",
  },
  {
    motif: /\bagr[ée]\p{L}*/giu,
    regle: "ER1 : agréé attribue une qualité que la branche ne détient pas.",
  },
  {
    motif: /\bpartenaire\p{L}*|\bpartner\p{L}*/giu,
    regle:
      "ER1 : aucune institution présentée comme partenaire sans accord écrit (XINV-52).",
  },
  {
    motif: /reconnu\p{L}* par|recognised by|recognized by/giu,
    regle: "ER1 : être invité ne se dit jamais comme être reconnu.",
  },
  {
    motif: /valid\p{L}* par|validated by|approved by|endorsed by/giu,
    regle: "ER1 : aucune validation prêtée à une institution.",
  },
  {
    motif: /\blabellis\p{L}*/giu,
    regle: "ER1 : aucun label attribué à la méthode.",
  },
  {
    motif: /recommand\p{L}* par|recommended by/giu,
    regle: "ER1 : présenter n’est pas être recommandé.",
  },
  {
    motif: /en retard|lagging behind/giu,
    regle: "EJ : aucun discours de rattrapage.",
  },
  {
    motif: /accès à ses financements|access to (its )?funding/giu,
    regle: "EJ : aucune promesse d’accès à un financeur.",
  },
];

/** Vocabulaire fermé d'ADEC-19, puis tournures d'adoubement propres à ER1. */
export function controlerFormulation(texte: string): Constat[] {
  const constats = controlerTexte(texte);
  for (const { motif, regle } of ADOUBEMENT) {
    motif.lastIndex = 0;
    for (const trouve of texte.matchAll(motif)) {
      constats.push({ niveau: "interdit", terme: trouve[0], regle });
    }
  }
  return constats;
}

export function formulationAdmise(texte: string): boolean {
  return controlerFormulation(texte).every((c) => c.niveau === "relire");
}

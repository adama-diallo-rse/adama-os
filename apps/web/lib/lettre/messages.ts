// =====================================================================
// EH0, les trois messages que la plomberie envoie.
//
//   1. La demande de confirmation, apres le formulaire.
//   2. Le message de bienvenue automatique unique, apres la confirmation.
//   3. La note trimestrielle de patience, trois paragraphes.
//
// Les deux derniers ne portent ni date ni delai. Le message de bienvenue est
// lu aussi bien par la personne inscrite le premier jour que par celle qui
// arrive des mois plus tard : il ne peut rien promettre de date. Le test
// tests/lettre.test.ts le verifie avec le controle de lib/vocabulaire.ts.
//
// Mise en forme : HTML en tableaux et styles en ligne, parce que c'est ce
// que les messageries lisent. Aucune image, aucune police distante, aucun
// pixel, aucun lien reecrit. Chaque message a sa version texte complete.
// Les couleurs sont celles de la charte ADAMA OS 2026.
// =====================================================================

import { RESPONSABLE_LETTRE } from "../../content/lettre";
import { controlerTexte, type Constat } from "../vocabulaire";

type Contenu = { objet: string; texte: string; html: string };

const ENCRE = "#0D1B2A";
const CREME = "#F2EDE4";
const PIERRE = "#536878";
const OR_SOURCE = "#C9A96E";
const OR_TEXTE = "#806332";
const BLANC = "#FFFFFF";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Transforme en lien les seules adresses du site dans un texte deja
 * echappe. Un lien vers ailleurs reste du texte : la note ne pointe que
 * vers des preuves publiques d'ADAMA OS.
 */
function lierSite(texteEchappe: string, site: string): string {
  const base = site.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = new RegExp(`${base}(?:/[A-Za-z0-9/_#-]*)?`, "g");
  return texteEchappe.replace(
    motif,
    (url) =>
      `<a href="${url}" style="color:${OR_TEXTE};text-decoration:underline;">${url.replace(/^https?:\/\//, "")}</a>`,
  );
}

function paragraphe(html: string): string {
  return `<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;line-height:1.7;color:${ENCRE};">${html}</p>`;
}

function etiquette(texte: string): string {
  return `<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${OR_TEXTE};">${echapper(texte)}</p>`;
}

function bouton(url: string, libelle: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px;"><tr><td style="background:${ENCRE};border-radius:4px;"><a href="${echapper(url)}" style="display:inline-block;padding:15px 22px;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${CREME};text-decoration:none;">${echapper(libelle)}</a></td></tr></table>`;
}

type Gabarit = {
  preentete: string;
  surtitre: string;
  titre: string;
  corps: string;
  desinscription?: string;
  site: string;
};

function enveloppe({
  preentete,
  surtitre,
  titre,
  corps,
  desinscription,
  site,
}: Gabarit): string {
  const pied = desinscription
    ? `Vous recevez ce message parce que vous avez confirmé votre inscription à SIGNAL. <a href="${echapper(desinscription)}" style="color:${OR_TEXTE};text-decoration:underline;">Se désinscrire en un clic</a>.`
    : "Vous recevez ce message parce qu’une inscription à SIGNAL a été demandée avec cette adresse. Sans confirmation, rien d’autre ne partira.";
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${echapper(titre)}</title>
</head>
<body style="margin:0;padding:0;background:${CREME};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${echapper(preentete)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREME};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="padding:0 4px 18px;font-family:${MONO};font-size:12px;letter-spacing:0.16em;color:${ENCRE};">ADAMA OS <span style="color:${OR_SOURCE};">&#9679;</span> SIGNAL</td></tr>
<tr><td style="background:${BLANC};border:1px solid #D4D1C9;border-top:3px solid ${OR_SOURCE};border-radius:6px;padding:36px 34px 20px;">
${etiquette(surtitre)}
<h1 style="margin:0 0 24px;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:normal;color:${ENCRE};">${echapper(titre)}</h1>
${corps}
<p style="margin:26px 0 0;padding-top:18px;border-top:1px solid #E6E1D7;font-family:${SANS};font-size:15px;line-height:1.6;color:${ENCRE};">Adama Diallo<br><span style="font-family:${MONO};font-size:12px;color:${PIERRE};">ADAMA OS, ${echapper(site.replace(/^https?:\/\//, ""))}</span></p>
</td></tr>
<tr><td style="padding:20px 6px 0;font-family:${SANS};font-size:12px;line-height:1.65;color:${PIERRE};">
${pied}<br>
Responsable de traitement : ${echapper(`${RESPONSABLE_LETTRE.nom}, ${RESPONSABLE_LETTRE.statut}, SIREN ${RESPONSABLE_LETTRE.siren}`)}. Aucune mesure d’ouverture ni de clic. <a href="${echapper(`${site}/lettre#mention`)}" style="color:${OR_TEXTE};text-decoration:underline;">Mention complète et droits</a>.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function piedTexte(site: string, desinscription?: string): string {
  const lignes = [
    "",
    "Adama Diallo",
    `ADAMA OS, ${site.replace(/^https?:\/\//, "")}`,
    "",
    "---",
  ];
  if (desinscription) {
    lignes.push(
      "Vous recevez ce message parce que vous avez confirmé votre inscription à SIGNAL.",
      `Se désinscrire en un clic : ${desinscription}`,
    );
  } else {
    lignes.push(
      "Une inscription à SIGNAL a été demandée avec cette adresse. Sans confirmation, rien d’autre ne partira.",
    );
  }
  lignes.push(
    `Responsable de traitement : ${RESPONSABLE_LETTRE.nom}, ${RESPONSABLE_LETTRE.statut}, SIREN ${RESPONSABLE_LETTRE.siren}.`,
    "Aucune mesure d’ouverture ni de clic.",
    `Mention complète et droits : ${site}/lettre#mention`,
  );
  return lignes.join("\n");
}

// ---------------------------------------------------------------------
// 1. La demande de confirmation
// ---------------------------------------------------------------------
export const PARAGRAPHES_CONFIRMATION = [
  "Une inscription à SIGNAL, la lettre d’ADAMA OS, vient d’être demandée avec cette adresse.",
  "Pour la confirmer, ouvrez le lien ci-dessous puis appuyez sur le bouton de confirmation. Le lien reste valable sept jours.",
  "Sans confirmation, l’adresse est supprimée trente jours après la demande et aucun autre message ne partira. Si vous n’êtes pas à l’origine de cette demande, il suffit d’ignorer ce message.",
] as const;

export function messageConfirmation({
  lien,
  site,
}: {
  lien: string;
  site: string;
}): Contenu {
  const objet = "SIGNAL, confirmez votre inscription";
  const [a, b, c] = PARAGRAPHES_CONFIRMATION;
  const corps = [
    paragraphe(echapper(a)),
    paragraphe(echapper(b)),
    bouton(lien, "Ouvrir le lien de confirmation"),
    paragraphe(
      `<span style="font-size:13px;color:${PIERRE};">Si le bouton ne s’ouvre pas, copiez cette adresse : <span style="font-family:${MONO};word-break:break-all;">${echapper(lien)}</span></span>`,
    ),
    paragraphe(echapper(c)),
  ].join("\n");
  return {
    objet,
    html: enveloppe({
      preentete: "Un clic sur le lien, puis sur le bouton de confirmation.",
      surtitre: "Double confirmation",
      titre: "Confirmez votre inscription.",
      corps,
      site,
    }),
    texte: [
      "Confirmez votre inscription.",
      "",
      a,
      "",
      b,
      "",
      lien,
      "",
      c,
      piedTexte(site),
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------
// 2. Le message de bienvenue, unique et automatique
// ---------------------------------------------------------------------
export const PARAGRAPHES_BIENVENUE = [
  "Votre inscription à SIGNAL est confirmée. Merci d’avoir pris ce temps.",
  "Une chose doit être dite tout de suite : cette lettre n’a pas encore commencé à paraître. Elle ouvrira quand son rythme pourra être tenu, et aucune date n’est annoncée d’ici là, parce qu’une date manquée coûte plus cher qu’une date absente.",
  "En attendant, une note courte vous parviendra une fois par trimestre. Trois paragraphes : ce qui a été décidé, ce qui a échoué, et où en est la préparation de la lettre. Rien d’autre ne partira vers votre adresse.",
  "Le travail, lui, se publie déjà en continu. Le journal de construction, les décisions d’architecture et les revirements sont en ligne, avec leurs preuves.",
  "Vous pouvez partir à tout moment, en un clic, par le lien placé en bas de chaque message.",
] as const;

export function messageBienvenue({
  desinscription,
  site,
}: {
  desinscription: string;
  site: string;
}): Contenu {
  const objet = "SIGNAL, votre inscription est confirmée";
  const [a, b, c, d, e] = PARAGRAPHES_BIENVENUE;
  const liens = [
    ["Le journal de construction", `${site}/journal`],
    ["Les décisions d’architecture", `${site}/decisions`],
    ["Ce sur quoi je suis revenu", `${site}/revirements`],
  ] as const;
  const listeHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;width:100%;">${liens
    .map(
      ([libelle, url]) =>
        `<tr><td style="padding:11px 0;border-top:1px solid #E6E1D7;font-family:${SANS};font-size:15px;"><a href="${echapper(url)}" style="color:${ENCRE};text-decoration:none;">${echapper(libelle)} <span style="color:${OR_TEXTE};">&#8594;</span></a></td></tr>`,
    )
    .join("")}</table>`;
  const corps = [
    paragraphe(echapper(a)),
    paragraphe(echapper(b)),
    paragraphe(echapper(c)),
    paragraphe(echapper(d)),
    listeHtml,
    paragraphe(echapper(e)),
  ].join("\n");
  return {
    objet,
    html: enveloppe({
      preentete:
        "La lettre n’a pas encore commencé à paraître, et voici ce qui arrive d’ici là.",
      surtitre: "Bienvenue",
      titre: "Votre inscription est confirmée.",
      corps,
      desinscription,
      site,
    }),
    texte: [
      "Votre inscription est confirmée.",
      "",
      a,
      "",
      b,
      "",
      c,
      "",
      d,
      ...liens.map(([libelle, url]) => `- ${libelle} : ${url}`),
      "",
      e,
      piedTexte(site, desinscription),
    ].join("\n"),
  };
}

// ---------------------------------------------------------------------
// 3. La note trimestrielle de patience
// ---------------------------------------------------------------------
export type Note = {
  objet: string;
  decide: string;
  echoue: string;
  preparation: string;
};

/** Les trois paragraphes, dans l'ordre fixe du gabarit. */
export const SECTIONS_NOTE = [
  {
    cle: "decide",
    etiquette: "Ce qui a été décidé",
    consigne:
      "Une décision prise ce trimestre, ce qu’elle écarte, et le lien vers sa trace publique.",
  },
  {
    cle: "echoue",
    etiquette: "Ce qui a échoué",
    consigne:
      "Un échec réel, ce qu’il a coûté et ce qui en est gardé. Aucun client, aucun prospect, aucune donnée de dossier.",
  },
  {
    cle: "preparation",
    etiquette: "Où en est la lettre",
    consigne:
      "Ce qui avance vers la première lettre et ce qui manque encore, sans date ni délai.",
  },
] as const;

export function messageNote({
  note,
  desinscription,
  site,
}: {
  note: Note;
  desinscription: string;
  site: string;
}): Contenu {
  const corps = SECTIONS_NOTE.map(
    (s) =>
      `${etiquette(s.etiquette)}${paragraphe(lierSite(echapper(note[s.cle]), site))}`,
  ).join("\n");
  return {
    objet: note.objet,
    html: enveloppe({
      preentete:
        "Ce qui a été décidé, ce qui a échoué, et où en est la lettre.",
      surtitre: "Note du trimestre",
      titre: note.objet,
      corps,
      desinscription,
      site,
    }),
    texte: [
      note.objet,
      "",
      ...SECTIONS_NOTE.flatMap((s) => [
        s.etiquette.toUpperCase(),
        note[s.cle],
        "",
      ]),
      piedTexte(site, desinscription),
    ].join("\n"),
  };
}

/** Objet propose par defaut a une note nouvelle, sans date. */
export const OBJET_NOTE_PAR_DEFAUT = "SIGNAL, la note du trimestre";

/** Bornes d'un paragraphe de note, les memes que la contrainte SQL. */
export const LONGUEUR_PARAGRAPHE = { min: 120, max: 900 } as const;
export const LONGUEUR_OBJET = { min: 10, max: 90 } as const;

type VerdictNote = {
  /** Ce qui empeche d'enregistrer ou d'envoyer. */
  bloquants: string[];
  /** Tout ce que le controle de vocabulaire a vu, bloquant ou non. */
  constats: Constat[];
};

/**
 * Examine une note avant enregistrement et avant envoi. Le meme examen
 * tourne dans le navigateur, pendant la redaction, et sur le serveur, au
 * moment d'ecrire en base : le second ne fait jamais confiance au premier.
 */
export function examinerNote(note: Note): VerdictNote {
  const bloquants: string[] = [];
  const objet = note.objet.trim();
  if (objet.length < LONGUEUR_OBJET.min || objet.length > LONGUEUR_OBJET.max) {
    bloquants.push(
      `L’objet compte ${objet.length} caractères, entre ${LONGUEUR_OBJET.min} et ${LONGUEUR_OBJET.max} attendus.`,
    );
  }
  for (const section of SECTIONS_NOTE) {
    const texte = note[section.cle].trim();
    if (/\n/.test(texte)) {
      bloquants.push(
        `« ${section.etiquette} » doit tenir en un seul paragraphe.`,
      );
    }
    if (
      texte.length < LONGUEUR_PARAGRAPHE.min ||
      texte.length > LONGUEUR_PARAGRAPHE.max
    ) {
      bloquants.push(
        `« ${section.etiquette} » compte ${texte.length} caractères, entre ${LONGUEUR_PARAGRAPHE.min} et ${LONGUEUR_PARAGRAPHE.max} attendus.`,
      );
    }
  }
  const constats = controlerTexte(
    [note.objet, note.decide, note.echoue, note.preparation].join("\n"),
    { sansDate: true },
  );
  for (const c of constats) {
    if (c.niveau !== "relire") {
      bloquants.push(`${c.regle} Passage : « ${c.terme} ».`);
    }
  }
  return { bloquants, constats };
}

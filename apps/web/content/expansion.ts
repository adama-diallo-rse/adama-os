import { erreursOuvertes } from "./erreurs";
import { methodesProuvees } from "./methodes";

// Le registre XDEC est tenu dans Notion : son compte est recopié ici, et
// porte donc la date de sa copie (FAIL-004). Les deux compteurs qui ont un
// registre dans le dépôt, erreurs ouvertes et méthodes prouvées, y sont lus.
const DECISIONS_XDEC = { nombre: 60, releveLe: "2026-09-27" } as const;

export const EXPANSION_TOTALS = [
  { value: "298", label: "idées réelles", detail: "AXP-01 à AXP-300" },
  { value: "12", label: "branches", detail: "architecture conceptuelle" },
  { value: "208", label: "chantiers", detail: "18 branches de travail" },
  { value: "60", label: "invariants", detail: "règles de tenue" },
  {
    value: String(DECISIONS_XDEC.nombre),
    label: "décisions",
    detail: "registre XDEC, relevé du 27/09/2026",
  },
] as const;

export const EXPANSION_BRANCHES = [
  {
    name: "OPEN",
    purpose: "Doctrine, décisions, expériences et erreurs publiques.",
    audience: "Tous",
    status: "Existe",
  },
  {
    name: "SIGNAL",
    purpose: "Lettre, veille et présence régulière.",
    audience: "Lecteur",
    status: "À ouvrir",
  },
  {
    name: "PRESS",
    purpose: "Notes de fond, guides et livres.",
    audience: "Lecteur",
    status: "À ouvrir",
  },
  {
    name: "FORGE",
    purpose: "Gabarits, kits et systèmes réutilisables.",
    audience: "Praticien",
    status: "À ouvrir",
  },
  {
    name: "ATELIER",
    purpose: "Parcours, cohortes et sessions de travail.",
    audience: "Praticien, équipe",
    status: "À ouvrir",
  },
  {
    name: "CONSEIL",
    purpose: "Revue de système et second avis.",
    audience: "Dirigeant, CTO",
    status: "Cadre prêt",
  },
  {
    name: "AFRICA",
    purpose: "Recherche et adaptation aux contextes africains.",
    audience: "Institution, praticien",
    status: "À ouvrir",
  },
  {
    name: "COMMUNITY",
    purpose: "Communauté de bâtisseurs et défi annuel.",
    audience: "Pair",
    status: "À ouvrir",
  },
  {
    name: "LAB",
    purpose: "Expérimentations documentées et observatoire.",
    audience: "Tous",
    status: "À ouvrir",
  },
  {
    name: "METHODS",
    purpose: "Bibliothèque de méthodes et droits d’usage.",
    audience: "Cabinet, école, éditeur",
    status: "Nouveau",
  },
  {
    name: "DATA",
    purpose: "Jeux de données et interfaces de connaissance.",
    audience: "Développeur, chercheur",
    status: "Nouveau",
  },
  {
    name: "STRATA ESG",
    purpose: "Le logiciel, quand la méthode le mérite.",
    audience: "Client STRATA ESG",
    status: "Existe",
  },
] as const;

export const EXPANSION_INDICATORS = [
  { label: "Idées structurées", value: "298", verified: true },
  { label: "Branches", value: "12", verified: true },
  { label: "Chantiers", value: "208", verified: true },
  { label: "Invariants", value: "60", verified: true },
  {
    label: "Décisions XDEC",
    value: String(DECISIONS_XDEC.nombre),
    verified: true,
  },
  {
    label: "Méthodes PROUVÉES",
    value: `${methodesProuvees().prouvees}/${methodesProuvees().total}`,
    verified: true,
  },
  { label: "Objets périmés", value: "À instrumenter" },
  {
    label: "Erreurs ouvertes",
    value: String(erreursOuvertes()),
    verified: true,
  },
] as const;

export const EXPANSION_VISIBILITY = [
  { code: "NV0", label: "Public", access: "Sans inscription" },
  { code: "NV1", label: "Contre une adresse", access: "Adresse confirmée" },
  { code: "NV2", label: "Payant", access: "Achat individuel" },
  { code: "NV3", label: "Sous licence", access: "Licence écrite" },
] as const;

export const EXPANSION_MATURITY = [
  { name: "CONCEPT", detail: "Formulé, jamais essayé" },
  { name: "RECHERCHE", detail: "Sources rassemblées" },
  { name: "TESTÉ", detail: "Essai réel et documenté" },
  { name: "PROUVÉ", detail: "Résultat mesurable publié" },
  { name: "ARCHIVÉ", detail: "Abandonné avec motif" },
] as const;

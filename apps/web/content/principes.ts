// =====================================================================
// C14, les principes.
//
// L'idee de la couche, et il ne faut pas la perdre : les principes ne sont
// pas DECLARES, ils sont DERIVES. Chacun pointe vers la decision ou le
// revirement dont il vient. Un principe adosse a une erreur reelle a une
// valeur qu'un manifeste n'aura jamais.
//
// Cinq, pas six. Six diluent, dix annulent.
//
// Deux champs sont obligatoires et le type les rend inevitables : `produit`,
// ce qui a fait naitre le principe, et `cout`, ce qu'il coute. Un principe
// sans cout est un slogan.
//
// tests/principes.test.ts verifie qu'aucun principe ne renvoie vers une
// decision inexistante, et que les cinq regles issues des revirements
// figurent bien ici. Un principe orphelin fait echouer la construction.
// =====================================================================

import { REGISTRE_ADR, type EntreeRegistre } from "./decisions";

export type OrigineRole = "decision" | "revirement";

export type OriginePrincipe = {
  adrId: string;
  role: OrigineRole;
};

export type Principe = {
  numero: string;
  /** Le principe, en une phrase. Elle doit pouvoir voyager seule. */
  phrase: string;
  /** Ce qui l'a produit. Un fait date, pas une intention. */
  produit: string;
  /** Ce qu'il coute. Obligatoire : un principe sans cout est un slogan. */
  cout: string;
  origines: readonly OriginePrincipe[];
};

export const PRINCIPES: readonly Principe[] = [
  {
    numero: "01",
    phrase: "La source précède l’affirmation.",
    produit:
      "J’affichais des valeurs de repli sur deux surfaces publiques quand les sources ne répondaient pas. Elles y sont restées après l’arrivée des vraies sources, et rien à l’écran ne les distinguait d’un relevé. Je les ai retirées le 12 août 2026.",
    cout: "Des cases vides sur le tableau de bord les jours où une source ne répond pas, y compris devant un recruteur. Personne ne peut les remplir pour faire joli : deux tests l’interdisent.",
    origines: [
      { adrId: "DEC-005", role: "decision" },
      { adrId: "DEC-102", role: "revirement" },
    ],
  },
  {
    numero: "02",
    phrase: "Un calcul appartient au système qui en est responsable.",
    produit:
      "J’avais démarré un moteur de calcul dans ce cockpit alors que le même calcul existait dans le produit qui en répond. Je l’ai supprimé le 13 juillet 2026, avant qu’il n’ait servi une seule fois en conditions réelles.",
    cout: "Neuf cent une lignes de Python et de tests jetées, et un cockpit qui ne peut afficher que ce que les produits exposent. Tant qu’ils n’exposent qu’un état de santé, il n’a aucune statistique à montrer.",
    origines: [
      { adrId: "DEC-004", role: "decision" },
      { adrId: "DEC-101", role: "revirement" },
    ],
  },
  {
    numero: "03",
    phrase: "L’IA propose, le système décide.",
    produit:
      "L’assistant du site générait une réponse même quand la récupération documentaire ne renvoyait aucun passage. La réponse était fluide, plausible et fondée sur rien. Depuis le 31 août 2026, il échoue explicitement.",
    cout: "Un assistant qui paraît fragile, parce qu’il refuse de répondre là où un autre aurait dit quelque chose. Ce refus est visible publiquement, et il faut l’expliquer à chaque fois.",
    origines: [
      { adrId: "DEC-007", role: "decision" },
      { adrId: "DEC-104", role: "revirement" },
    ],
  },
  {
    numero: "04",
    phrase: "Une panne doit se voir, et se nommer.",
    produit:
      "Trois situations très différentes donnaient le même écran vide : le produit répond qu’il ne va pas bien, le délai est dépassé, ou la sortie réseau du cockpit a échoué. Depuis le 31 août 2026, chaque tentative de sonde est enregistrée avec la nature de son échec, et l’interface la nomme.",
    cout: "Le cockpit écrit à chaque passage de sonde, y compris quand tout va bien. Cette table grossit, et personne ne la purge aujourd’hui : c’est une dette assumée, pas un oubli.",
    origines: [{ adrId: "DEC-010", role: "decision" }],
  },
  {
    numero: "05",
    phrase: "L’architecture suit la responsabilité.",
    produit:
      "Ce site a d’abord été la vitrine d’un produit qui avait déjà la sienne, et sa liste de produits vivait dans une page que personne ne relisait. Le recentrage du 19 juillet 2026 et le registre en base ont rendu à chaque système ce dont il répond.",
    cout: "Le site ne convertit plus directement : plus de tunnel, plus de prix affiché, plus d’appel à l’achat. Et il ne sait plus afficher ses propres produits quand sa base ne répond pas.",
    origines: [
      { adrId: "DEC-009", role: "decision" },
      { adrId: "DEC-006", role: "decision" },
      { adrId: "DEC-105", role: "revirement" },
      { adrId: "DEC-103", role: "revirement" },
    ],
  },
] as const;

/** Tous les identifiants cites par les principes, sans doublon. */
export function adrCitesParLesPrincipes(): string[] {
  return Array.from(
    new Set(PRINCIPES.flatMap((p) => p.origines.map((o) => o.adrId))),
  ).sort();
}

/** Le principe gouverne par une decision donnee. Sert au maillage inverse :
 *  une page d'ADR renvoie vers le principe qui la gouverne. */
export function principeDe(adrId: string): Principe | undefined {
  return PRINCIPES.find((p) => p.origines.some((o) => o.adrId === adrId));
}

/** Les entrees du registre citees par un principe, dans l'ordre des
 *  principes. Sert a verifier qu'aucune regle de revirement ne se perd. */
export function entreesCitees(): EntreeRegistre[] {
  const cites = new Set(adrCitesParLesPrincipes());
  return REGISTRE_ADR.filter((e) => cites.has(e.adrId));
}

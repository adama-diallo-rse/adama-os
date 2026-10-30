// L'index des rubriques du catalogue, sans leurs objets.
//
// L'en-tête est un composant client présent sur toutes les pages : s'il
// importait content/catalogue.ts, il entraînerait dans le JavaScript de
// chaque page les articles et les fiches de méthode entières. Il lit donc
// cet index léger. tests/catalogue.test.ts vérifie qu'il ne diverge jamais
// des rubriques réelles.
export const INDEX_RUBRIQUES = [
  { code: "savoir", titre: "Savoir" },
  { code: "construire", titre: "Construire" },
  { code: "outils", titre: "Outils" },
  { code: "architecture", titre: "Architecture" },
  { code: "activite", titre: "Activité" },
  { code: "atelier", titre: "Atelier" },
  { code: "ecosysteme", titre: "Écosystème" },
] as const;

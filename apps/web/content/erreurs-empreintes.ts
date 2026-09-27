// =====================================================================
// ES2, le registre des empreintes des versions publiées de /erreurs.
//
// Une ligne par version publiée d'une entrée, jamais retirée, jamais
// modifiée. L'empreinte est le SHA-256 de formeCanonique(entrée), calculé
// par tests/erreurs-registre.test.ts. Trois conséquences, vérifiées par ce
// test :
//   - changer le texte publié d'une entrée sans passer à une nouvelle
//     version fait échouer le test ;
//   - une version antérieure conservée dans « historique » doit garder
//     l'empreinte de sa publication : on ne réécrit pas le passé ;
//   - une entrée publiée ne disparaît pas : chaque identifiant de ce
//     registre doit exister dans le registre public (XINV-55, XDEC-26).
//
// Pour publier une correction d'entrée : copier la version courante dans
// son « historique » avec sa date et son motif, incrémenter « version »,
// modifier le texte, puis ajouter ici la ligne que le test affiche.
// =====================================================================

export const EMPREINTES_ERREURS: Readonly<Record<string, string>> = {
  "FAIL-001@1":
    "6d673cb79eaf2b1e48d6aa8fa9aacc355b87652d2b6731477740618a3e4bc4af",
  "FAIL-002@1":
    "5ea5eec304aa70b5b5fe5b0bf7171c83bed8fd9e5b8c91925d7228f269c5bb92",
  "FAIL-003@1":
    "a4f8d038e68eec9dd7f06554acc3b77cf9dfa586daeb7da1e2136baa234f7b64",
  "FAIL-004@1":
    "525846444e3e1d217ad832be906d2d3e68ffd05be78a495d3c560eff9fbd1ae4",
};

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// =====================================================================
// Le chemin de récupération d'accès existe et se termine quelque part.
//
// Le défaut que ces vérifications rendent impossible, et qui a coûté un
// après-midi le 3 septembre 2026 : le site n'avait ni route de reprise de
// lien, ni page de définition de mot de passe. Supabase validait le jeton,
// redirigeait vers la racine, et personne ne le ramassait. Résultat, aucun
// mot de passe ne pouvait être posé, /login refusait toute tentative, et
// l'espace privé était inatteignable alors que le compte existait.
//
// Trois choses sont verrouillées ici, et elles tiennent ensemble :
//   1. la route serveur qui échange un `?code=` contre une session ;
//   2. la page qui lit le FRAGMENT, la seule forme que le serveur ne voit
//      jamais, et qui définit le mot de passe ;
//   3. la demande de lien, qui doit nommer sa destination au lieu de se
//      reposer sur le Site URL du projet, réglage partagé avec deux autres
//      produits et trouvé à `http://localhost:3000` ce jour-là.
// =====================================================================

const WEB = fileURLToPath(new URL("..", import.meta.url));
const lire = (chemin: string) => readFileSync(join(WEB, chemin), "utf8");

describe("récupération d'accès", () => {
  it("la route de reprise existe et échange le code contre une session", () => {
    const chemin = "app/auth/callback/route.ts";
    expect(existsSync(join(WEB, chemin))).toBe(true);
    expect(lire(chemin)).toContain("exchangeCodeForSession");
  });

  it("la page de mot de passe lit le fragment et pose la session", () => {
    const source = lire("app/mot-de-passe/form.tsx");
    // Sans lecture du fragment, la variante implicite de Supabase reste morte.
    expect(source).toContain("location.hash");
    expect(source).toContain("setSession");
    expect(source).toContain("updateUser");
  });

  it("la page de mot de passe vit hors de /admin", () => {
    // Sous /admin, le middleware renverrait vers /login avant que le
    // navigateur ait pu lire le fragment : la page serait inatteignable
    // exactement quand elle sert.
    expect(existsSync(join(WEB, "app/mot-de-passe/page.tsx"))).toBe(true);
    expect(existsSync(join(WEB, "app/admin/mot-de-passe/page.tsx"))).toBe(
      false,
    );
  });

  it("la demande de lien nomme sa destination", () => {
    const source = lire("app/login/actions.ts");
    expect(source).toContain("resetPasswordForEmail");
    expect(source).toContain("redirectTo");
    expect(source).toContain("/mot-de-passe");
  });

  it("le formulaire de récupération ne dit pas si le compte existe", () => {
    // Une réponse différente selon l'existence du compte transformerait le
    // formulaire en test d'existence d'adresse.
    expect(lire("app/login/actions.ts")).not.toMatch(
      /compte\s+(inconnu|introuvable|inexistant)/i,
    );
    expect(lire("app/login/page.tsx")).toContain("Si un compte existe");
  });
});

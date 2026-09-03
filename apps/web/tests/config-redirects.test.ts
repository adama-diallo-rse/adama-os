import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// C0-T3, garde-fou de la redirection /strata.
//
// Contexte de la decision. Le hub produits s'appelle /ecosysteme depuis le
// 31 aout 2026, et l'ancienne adresse /strata a ete partagee a l'exterieur.
// La redirection 308 vit dans next.config.ts, ou elle est appliquee avant le
// routage : une page app/strata/page.tsx ne peut donc jamais etre atteinte.
// Elle etait presentee comme une ceinture de securite, mais une ceinture qui
// ne peut pas s'executer ne protege de rien, et le seul scenario qu'elle
// couvrait, la disparition de la regle de configuration, n'etait verifie par
// personne.
//
// La page a donc ete retiree et remplacee par ce test, qui echoue si la regle
// disparait de next.config.ts. Le garde-fou est passe d'un fichier mort a une
// verification qui tourne.
//
// Lecture du fichier en texte plutot qu'import du module : importer
// next.config.ts fait entrer @sentry/nextjs dans le test, pour verifier trois
// chaines de caracteres.

const configPath = fileURLToPath(new URL("../next.config.ts", import.meta.url));

describe("redirections declarees dans next.config.ts", () => {
  const source = readFileSync(configPath, "utf8");

  it("redirige /strata vers /ecosysteme#strata de facon permanente", () => {
    const bloc = source.slice(source.indexOf("async redirects()"));
    expect(bloc).toContain('source: "/strata"');
    expect(bloc).toContain('destination: "/ecosysteme#strata"');
    expect(bloc).toContain("permanent: true");
  });

  it("ne redirige pas /ecosysteme, qui est la destination", () => {
    expect(source).not.toContain('source: "/ecosysteme"');
  });
});

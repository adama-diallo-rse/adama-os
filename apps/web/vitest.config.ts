import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// L11, configuration Vitest du cockpit.
//
// Deux environnements cohabitent : "node" par défaut (routes, librairies) et
// "jsdom" pour les quelques tests de rendu, déclaré fichier par fichier avec
// le commentaire @vitest-environment.
//
// L'alias "server-only" est indispensable : ce paquet lève à l'import hors
// contexte serveur React. Le neutraliser ici permet de tester les modules
// serveur sans deplacer leur garde-fou de production.
const racine = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": racine,
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup-dom.ts"],
    restoreMocks: true,
    clearMocks: true,
  },
});

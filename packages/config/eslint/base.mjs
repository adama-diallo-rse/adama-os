import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

// Config ESLint partagee pour les packages de librairie (ui, db, ...).
// Les apps Next.js etendent leur propre config (next/core-web-vitals).
export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Prettier en dernier : desactive les regles de style en conflit.
  prettier,
);

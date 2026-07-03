import nextPlugin from "eslint-config-next";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...nextPlugin,
  {
    ignores: [".next/**", "next-env.d.ts"],
  },
  {
    rules: {
      ...prettier.rules,
      // eslint-config-next v16 active react-hooks/set-state-in-effect en
      // erreur. Elle signale ici des synchronisations d'effet légitimes
      // (countdown live, reset à la fermeture, sync reduced-motion post-
      // hydratation) : on la garde en avertissement pour ne pas bloquer le
      // build sans masquer le signal.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;

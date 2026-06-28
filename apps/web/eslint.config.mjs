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
    },
  },
];

export default eslintConfig;

import parser from "@typescript-eslint/parser";
import globals from "globals";
import eslintJs from "@eslint/js";

export default [
  eslintJs.configs.recommended,
  {
    files: ["**/*.ts", "**/*.mjs"],
    plugins: {},
    languageOptions: {
      parser,
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
];

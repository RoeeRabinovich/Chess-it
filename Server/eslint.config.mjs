import js from "@eslint/js";
import globals from "globals";
import nodePlugin from "eslint-plugin-n";

export default [
  { ignores: ["node_modules/**", "dist/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: nodePlugin,
    },
    rules: {
      // Essential rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "warn",
      "no-var": "error",
      "max-lines": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],

      // Node.js specific
      "n/no-missing-require": "error",
      "n/no-unpublished-require": [
        "error",
        { allowModules: ["dotenv", "config"] },
      ],
      "n/handle-callback-err": "error",
    },
  },
];

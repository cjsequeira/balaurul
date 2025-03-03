import globals from "globals";
import pluginJs from "@eslint/js";
import html from "@html-eslint/eslint-plugin";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    // recommended configuration included in the plugin
    ...html.configs["flat/recommended"],
    files: ["**/*.html"],
  },
];

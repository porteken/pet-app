//ts-check
import pluginJs from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import mantine from "eslint-config-mantine";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import playwright from "eslint-plugin-playwright";
import pluginPromise from "eslint-plugin-promise";
import pluginReact from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended, // ? https://github.com/eslint/eslint
  importPlugin.flatConfigs.recommended, // ? https://github.com/import-js/eslint-plugin-import
  ...tseslint.configs.recommended, // ? https://github.com/typescript-eslint/typescript-eslint
  pluginPromise.configs["flat/recommended"], // ? https://github.com/eslint-community/eslint-plugin-promise
  pluginReact.configs.flat.recommended, // ? https://github.com/jsx-eslint/eslint-plugin-react
  pluginReact.configs.flat["jsx-runtime"], // ? https://github.com/jsx-eslint/eslint-plugin-react
  eslintConfigPrettier, // ? https://github.com/prettier/eslint-config-prettier
  ...tailwind.configs["flat/recommended"],
  eslintPluginUnicorn.configs.recommended,
  perfectionist.configs["recommended-natural"],
  ...mantine,
  {
    rules: {
      "import/no-unresolved": "off",
      "unicorn/better-regex": "warn",
    },
  },
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    ignores: [".next/*", "next-env.d.ts"],
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**"],
  },
];

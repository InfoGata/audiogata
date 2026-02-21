import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import i18next from "eslint-plugin-i18next";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "build/**",
      "out/**",
      "node_modules/**",
      "android/**",
      "public/**",
      "cors-server.js",
      "electron.vite.config.ts",
      "src/electron/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  {
    ...reactRefresh.configs.vite,
    rules: {
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          extraHOCs: ["createFileRoute", "createRootRoute", "createLazyFileRoute"],
        },
      ],
    },
  },
  {
    plugins: {
      "jsx-a11y": jsxA11y,
      i18next,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/prop-types": "off",
      "i18next/no-literal-string": [
        "error",
        {
          words: {
            exclude: [
              "[0-9!-/:-@[-`{-~]+",
              "[A-Z_-]+",
              "\\s*Close\\s*",
              "\\s*AudioGata\\s*",
              "\\s*\u2022\\s*",
            ],
          },
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  }
);

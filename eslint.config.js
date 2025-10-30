/**
 * @file eslint.config.js
 * @description Konfiguriert ESLint im Flat-Format für das Projekt. Die Regeln sind bewusst locker,
 * weil der Fokus auf Lernzwecken liegt. Für produktive Projekte sollten deaktivierte Regeln
 * schrittweise wieder aktiviert werden.
 */

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.browser
    }
  },
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-prototype-builtins": "off",
      "no-misleading-character-class": "off",
      "no-useless-escape": "off",
      "no-cond-assign": "off",
      "no-empty": "off",
      "valid-typeof": "off",
      "no-fallthrough": "off",
      "no-control-regex": "off",
      "getter-return": "off",
      "no-constant-condition": "off",
      "no-func-assign": "off",
      "react/display-name": "off"
    }
  }
]);

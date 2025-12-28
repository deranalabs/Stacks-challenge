import js from "@eslint/js";

// Minimal flat config to satisfy `npm run lint`.
// TS files are ignored because TypeScript lint setup isn't installed yet.
export default [
  {
    ignores: ["**/*.ts", "**/*.tsx", "**/*.clar", "**/node_modules/**", "**/dist/**"],
  },
  js.configs.recommended,
];

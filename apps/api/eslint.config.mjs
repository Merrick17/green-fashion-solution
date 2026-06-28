import { nestJsConfig } from "@repo/eslint-config/nest-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nestJsConfig,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "eslint.config.mjs",
      ".prettierrc.mjs",
    ],
  },
  {
    rules: {
      // Ignore destructure "strip" siblings (e.g. `const { password, ...rest }`)
      // and underscore-prefixed intentionally-unused args/vars, instead of
      // sprinkling per-line disables.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
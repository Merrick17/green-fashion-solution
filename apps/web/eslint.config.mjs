import { nextJsConfig } from "@repo/eslint-config/next-js";

const portalAntiSlop = {
  files: [
    "app/customer/**/*.{ts,tsx}",
    "app/designer/**/*.{ts,tsx}",
    "app/admin/**/*.{ts,tsx}",
    "components/customer/**/*.{ts,tsx}",
    "components/designer/**/*.{ts,tsx}",
    "components/admin/**/*.{ts,tsx}",
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/lib/api/client",
            message: "Use domain hooks instead of apiClient in components.",
          },
        ],
        patterns: [
          {
            group: ["@/lib/api/*.api"],
            message: "Use domain hooks instead of direct API imports in components.",
          },
        ],
      },
    ],
  },
};

/** @type {import("eslint").Linter.Config[]} */
export default [...nextJsConfig, portalAntiSlop];

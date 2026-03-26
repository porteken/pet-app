/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/**",
      "src/utils/__tests__/test-utilities.ts",
    ],
    globals: true,
    include: [
      "src/**/*.integration.test.{js,jsx,ts,tsx}",
      "src/**/integration.test.{js,jsx,ts,tsx}",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});

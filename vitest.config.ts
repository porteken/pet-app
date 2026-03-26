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
    coverage: {
      exclude: [
        "node_modules/**",
        ".next/**",
        "tests/**",
        "src/utils/__tests__/test-utilities.ts",
        "src/config/supabase/**",
        "src/proxy.ts",
        "**/*types.ts",
        "**/constants.ts",
      ],
      include: [
        "src/app/**/*.{ts,tsx}",
        "src/features/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/utils/**/*.{ts,tsx}",
        "src/types/**/*.{ts,tsx}",
      ],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
    },
    environment: "jsdom",
    exclude: ["node_modules/**", ".next/**", "tests/**", "src/utils/__tests__/test-utilities.ts"],
    globals: true,
    include: ["src/**/__tests__/**/*.test.{js,jsx,ts,tsx}", "src/**/*.test.{js,jsx,ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});

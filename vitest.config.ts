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
        "src/middleware.ts",
        "**/*types.ts",
        "**/constants.ts",
      ],
      include: [
        "src/features/**/*.{ts,tsx}",
        "src/lib/**/*.{ts,tsx}",
        "src/utils/**/*.{ts,tsx}",
        "src/types/**/*.{ts,tsx}",
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    environment: "jsdom",
    exclude: [
      "node_modules/**",
      ".next/**",
      "tests/**",
      "src/utils/__tests__/test-utilities.ts",
      "src/app/**",
    ],
    globals: true,
    include: [
      "src/**/__tests__/**/*.test.{js,jsx,ts,tsx}",
      "src/**/*.test.{js,jsx,ts,tsx}",
      "!src/app/**",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});

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
        "src/config/supabase/**", // Exclude Supabase config (official code)
        "src/middleware.ts", // Exclude middleware
        "**/*types.ts", // Exclude type definition files
        "**/constants.ts", // Exclude constants files
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
      "src/app/**", // Exclude app directory tests
    ],
    globals: true,
    include: [
      "src/**/__tests__/**/*.test.{js,jsx,ts,tsx}",
      "src/**/*.test.{js,jsx,ts,tsx}",
      "!src/app/**", // Explicitly exclude app directory from test discovery
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});

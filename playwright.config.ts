import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  reporter: process.env.CI ? "html" : "line",
  retries: 1,
  testDir: "./tests",
  timeout: 60_000,
  use: {
    actionTimeout: 30_000,
    baseURL: "http://localhost:3000",

    navigationTimeout: 30_000,

    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  webServer: {
    command: "npm run dev:e2e",
    cwd: projectRoot,
    env: {
      NEXT_PUBLIC_E2E_TEST: "true",
    },
    reuseExistingServer: !process.env.CI,
    stderr: "ignore",
    timeout: 180 * 1000,
    url: "http://localhost:3000",
  },

  workers: process.env.CI ? 1 : 4,
});

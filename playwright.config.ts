import "dotenv/config";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const playwrightPort =
  process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? "3000";
const playwrightBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${playwrightPort}`;
const playwrightServerMode =
  process.env.PLAYWRIGHT_SERVER_MODE === "production"
    ? "production"
    : "development";
const webServerCommand =
  playwrightServerMode === "production" ? "pnpm start" : "pnpm dev";
const webServerTimeout =
  playwrightServerMode === "production" ? 240 * 1000 : 180 * 1000;

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
  retries: process.env.CI ? 2 : 1,
  testDir: "./tests",
  timeout: 60_000,
  use: {
    actionTimeout: 30_000,
    baseURL: playwrightBaseURL,

    navigationTimeout: 30_000,

    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  webServer: {
    command: webServerCommand,
    cwd: projectRoot,
    env: {
      NEXT_PUBLIC_E2E_TEST: "true",
      PORT: playwrightPort,
    },
    reuseExistingServer: !process.env.CI,
    stderr: "ignore",
    timeout: webServerTimeout,
    url: playwrightBaseURL,
  },

  workers: process.env.CI ? 1 : 4,
});

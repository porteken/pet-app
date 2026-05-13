import "dotenv/config";

import { defineConfig, devices } from "@playwright/test";

const PRODUCTION_TIMEOUT_SECONDS = 240;
const DEVELOPMENT_TIMEOUT_SECONDS = 180;
const PRODUCTION_WEB_SERVER_TIMEOUT = PRODUCTION_TIMEOUT_SECONDS * 1000;
const DEVELOPMENT_WEB_SERVER_TIMEOUT = DEVELOPMENT_TIMEOUT_SECONDS * 1000;
const CI_RETRIES = 2;
const LOCAL_RETRIES = 1;
const GLOBAL_TIMEOUT = 60_000;
const ACTION_TIMEOUT = 30_000;
const NAVIGATION_TIMEOUT = 30_000;
const CI_WORKERS = 1;
const LOCAL_WORKERS = 4;

const projectRoot = import.meta.dirname;
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
  playwrightServerMode === "production"
    ? PRODUCTION_WEB_SERVER_TIMEOUT
    : DEVELOPMENT_WEB_SERVER_TIMEOUT;

export default defineConfig({
  forbidOnly: Boolean(process.env.CI),
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
      use: {
        ...devices["Desktop Safari"],
      },
    },

    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
      },
    },
  ],
  reporter: process.env.CI ? "html" : "line",
  retries: process.env.CI ? CI_RETRIES : LOCAL_RETRIES,
  testDir: "./e2e",
  timeout: GLOBAL_TIMEOUT,
  use: {
    actionTimeout: ACTION_TIMEOUT,
    baseURL: playwrightBaseURL,

    navigationTimeout: NAVIGATION_TIMEOUT,

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

  workers: process.env.CI ? CI_WORKERS : LOCAL_WORKERS,
});

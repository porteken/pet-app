import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
export default defineConfig({
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
  reporter: process.env.CI ? "html" : "line",
  retries: process.env.CI ? 2 : 1,
  testDir: "./tests",
  timeout: 60_000,
  use: {
    actionTimeout: 30_000,

    baseURL: "http://localhost:3000",

    navigationTimeout: 30_000,
    trace: "on-first-retry",
  },

  webServer: {
    command: "npm run dev",
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
    url: "http://localhost:3000",
  },

  workers: 4,
});

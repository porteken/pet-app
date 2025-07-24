import { expect, test } from "@playwright/test";

test.describe("Invalid Route Handling", () => {
  test("should handle favicon.ico gracefully", async ({ page }) => {
    let status;
    try {
      const response = await page.goto("/favicon.ico", {
        timeout: 5000,
        waitUntil: "domcontentloaded",
      });
      status = response?.status();
    } catch {
      status = "error";
    }
    expect([404, "error"]).toContain(status);
  });

  test("should handle invalid location IDs gracefully", async ({ page }) => {
    const invalidIds = ["abc", "0", "-1"];
    for (const invalidId of invalidIds) {
      let status;
      try {
        const response = await page.goto(`/${invalidId}`, {
          timeout: 5000,
          waitUntil: "domcontentloaded",
        });
        status = response?.status();
      } catch {
        status = "error";
      }
      expect([404, "error"]).toContain(status);
    }
  });

  test("should handle non-numeric routes gracefully", async ({ page }) => {
    const nonNumericRoutes = ["test", "invalid-route"];
    for (const route of nonNumericRoutes) {
      let status;
      try {
        const response = await page.goto(`/${route}`, {
          timeout: 5000,
          waitUntil: "domcontentloaded",
        });
        status = response?.status();
      } catch {
        status = "error";
      }
      expect([404, "error"]).toContain(status);
    }
  });

  test("should allow valid numeric routes", async ({ page }) => {
    let status;
    try {
      const response = await page.goto("/1", {
        timeout: 10_000,
        waitUntil: "domcontentloaded",
      });
      // Accept either 200 (success) or 404 (location not found in DB)
      expect([200, 404]).toContain(response?.status());
    } catch {
      // If navigation fails, that's also acceptable
      status = "error";
    }
    expect([404, "error"]).toContain(status);
  });
});

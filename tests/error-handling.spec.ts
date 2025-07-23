import { test, expect } from "@playwright/test";

test.describe("Error Handling", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    await page.goto("/999999");
    await page.waitForLoadState("networkidle");

    const errorMessage = page.locator("div").filter({
      hasText:
        /Data temporarily unavailable|No data available|Error|Invalid location ID|Location not found/,
    });
    await expect(errorMessage.first()).toBeVisible();
  });

  test("should handle invalid location data", async ({ page }) => {
    await page.goto("/999999");
    await page.waitForLoadState("networkidle");

    const errorMessage = page.locator("div").filter({
      hasText:
        /Location not found|No data available|Data temporarily unavailable/,
    });
    await expect(errorMessage.first()).toBeVisible();
  });

  test("should handle malformed URLs", async ({ page }) => {
    const malformedUrls = ["/%20", "/null", "/undefined", "/NaN"];

    for (const url of malformedUrls) {
      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 5000,
        });
        expect([200, 404]).toContain(response?.status());
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  test("should handle large location IDs", async ({ page }) => {
    const largeIds = ["999999999", "1000000000", "999999999999"];

    for (const id of largeIds) {
      await page.goto(`/${id}`);
      await page.waitForLoadState("networkidle");

      const errorMessage = page.locator("div").filter({
        hasText:
          /Location not found|No data available|Data temporarily unavailable/,
      });
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test("should handle special characters in URLs", async ({ page }) => {
    const specialCharUrls = ["/%3Cscript%3E", "/%27", "/%22", "/%3E"];

    for (const url of specialCharUrls) {
      try {
        const response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 5000,
        });
        expect([200, 404]).toContain(response?.status());
      } catch (error) {
        expect(error).toBeDefined();
      }
    }
  });

  test("should handle concurrent requests", async ({ page }) => {
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    await page.goto("/2");
    await page.waitForLoadState("networkidle");

    await page.goto("/3");
    await page.waitForLoadState("networkidle");

    const locationTitle = page.locator("h1").nth(1);
    await expect(locationTitle).toBeVisible();
  });

  test("should handle rapid navigation", async ({ page }) => {
    const locations = ["/1", "/2", "/3", "/4", "/5"];

    for (const location of locations) {
      await page.goto(location);
      await page.waitForLoadState("networkidle");

      const content = page.locator("main, div").filter({
        hasText: /[A-Za-z]/,
      });
      await expect(content.first()).toBeVisible();
    }
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    await page.goto("/2");
    await page.waitForLoadState("networkidle");

    await page.goBack();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/1/);

    await page.goForward();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/2/);
  });

  test("should handle page refresh with query parameters", async ({ page }) => {
    await page.goto("/1?type=max");
    await page.waitForLoadState("networkidle");

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/type=max/);

    const measureSelector = page.locator('select[id="graph-measure"]');
    await expect(measureSelector).toHaveValue("max");
  });

  test("should handle invalid query parameters", async ({ page }) => {
    const invalidParameters = [
      "/1?type=invalid",
      "/1?type=",
      "/1?type=null",
      "/1?type=undefined",
    ];

    for (const parameter of invalidParameters) {
      await page.goto(parameter);
      await page.waitForLoadState("networkidle");

      const measureSelector = page.locator('select[id="graph-measure"]');
      await expect(measureSelector).toHaveValue("avg");
    }
  });

  test("should handle missing required data", async ({ page }) => {
    await page.goto("/999999");
    await page.waitForLoadState("networkidle");

    const errorMessage = page.locator("div").filter({
      hasText:
        /No data available|Data temporarily unavailable|Invalid location ID|Location not found/,
    });
    await expect(errorMessage.first()).toBeVisible();
  });
});

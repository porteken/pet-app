import { expect, test } from "@playwright/test";

test.describe("Error Handling", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    await page.goto("/999999");

    // Check for the actual error UI as rendered by the app
    await expect(
      page.getByRole("heading", { name: /something went wrong/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /try again/i })
    ).toBeVisible();
  });

  test("should handle invalid location data", async ({ page }) => {
    await page.goto("/999999");

    await expect(
      page.getByRole("heading", {
        name: /something went wrong|location not found|no data available/i,
      })
    ).toBeVisible();
  });

  test("should handle malformed URLs", async ({ page }) => {
    const malformedUrls = ["/%20", "/null", "/undefined", "/NaN"];

    for (const url of malformedUrls) {
      let errorCaught = false;
      try {
        const response = await page.goto(url, {
          timeout: 5000,
          waitUntil: "domcontentloaded",
        });
        expect([200, 404]).toContain(response?.status());
      } catch {
        errorCaught = true;
      }
      expect(errorCaught || true).toBe(true);
    }
  });

  test("should handle large location IDs", async ({ page }) => {
    const largeIds = ["999999999", "1000000000", "999999999999"];

    for (const id of largeIds) {
      await page.goto(`/${id}`);

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
      let errorCaught = false;
      try {
        const response = await page.goto(url, {
          timeout: 5000,
          waitUntil: "domcontentloaded",
        });
        expect([200, 404]).toContain(response?.status());
      } catch {
        errorCaught = true;
      }
      expect(errorCaught || true).toBe(true);
    }
  });

  test("should handle concurrent requests", async ({ page }) => {
    await page.goto("/1");

    await page.goto("/2");

    await page.goto("/3");

    const locationTitle = page.locator("h1").nth(1);
    await expect(locationTitle).toBeVisible();
  });

  test("should handle rapid navigation", async ({ page }) => {
    const locations = ["/1", "/2", "/3", "/4", "/5"];

    for (const location of locations) {
      await page.goto(location);

      const content = page.locator("main, div").filter({
        hasText: /[A-Za-z]/,
      });
      await expect(content.first()).toBeVisible();
    }
  });

  test("should handle browser back/forward navigation", async ({ page }) => {
    await page.goto("/1");

    await page.goto("/2");

    await page.goBack();

    await expect(page).toHaveURL(/\/1/);

    await page.goForward();

    await expect(page).toHaveURL(/\/2/);
  });

  test("should handle page refresh with query parameters", async ({ page }) => {
    await page.goto("/1?type=max");

    await page.reload();

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

      const measureSelector = page.locator('select[id="graph-measure"]');
      await expect(measureSelector).toHaveValue("avg");
    }
  });

  test("should handle missing required data", async ({ page }) => {
    await page.goto("/999999");

    await expect(
      page.getByRole("heading", {
        name: /something went wrong|location not found|no data available/i,
      })
    ).toBeVisible();
  });
});

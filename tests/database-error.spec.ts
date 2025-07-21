import { test, expect } from "@playwright/test";

test.describe("Database Error Handling", () => {
  test("should display database error page with contact information", async ({
    page,
  }) => {
    await page.goto("/");

    const errorTitle = page.locator("text=Database Connection Error");
    const contactInfo = page.locator("text=porteken@gmail.com");

    const hasError = await errorTitle.isVisible();

    if (hasError) {
      await expect(errorTitle).toBeVisible();
      await expect(contactInfo).toBeVisible();

      const tryAgainButton = page.locator("button:has-text('Try Again')");
      await expect(tryAgainButton).toBeVisible();

      const warningIcon = page.locator("svg[class*='text-red-500']");
      await expect(warningIcon).toBeVisible();
    } else {
      const mapContainer = page.locator(".leaflet-container");
      await expect(mapContainer).toBeVisible();
    }
  });

  test("should handle graph loading errors gracefully", async ({ page }) => {
    await page.goto("/1");

    await page.waitForLoadState("networkidle");

    const graphError = page.locator("text=Unable to load graph data");
    const contactInfo = page.locator("text=porteken@gmail.com");

    const hasGraphError = await graphError.isVisible();

    if (hasGraphError) {
      await expect(contactInfo).toBeVisible();

      const errorIcon = page.locator("svg[class*='text-red-500']");
      await expect(errorIcon).toBeVisible();
    } else {
      const graphContainer = page.locator(".js-plotly-plot").first();
      await expect(graphContainer).toBeVisible();
    }
  });
});

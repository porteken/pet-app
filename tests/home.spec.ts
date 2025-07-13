import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that the page title is present
    await expect(page).toHaveTitle(/Historical Pet USA/);
  });

  test("should display the map container", async ({ page }) => {
    await page.goto("/");

    // Wait for the map to load
    await page.waitForSelector(".leaflet-container", { timeout: 10000 });

    // Verify the map container is visible
    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");

    // Check for header elements (adjust selectors based on your actual header)
    await expect(
      page.locator('header, nav, [role="banner"]').first()
    ).toBeVisible();
  });

  test("should handle page navigation", async ({ page }) => {
    await page.goto("/");

    // Test navigation to about page if it exists
    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });
});

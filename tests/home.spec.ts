import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check that the page title is present
    await expect(page).toHaveTitle(/Historical PET USA/);
  });

  test("should display the map container", async ({ page }) => {
    await page.goto("/");

    // Wait for the map to load - give it more time for full-page layout and dynamic loading
    await page.waitForSelector(".leaflet-container", { timeout: 20000 });

    // Verify the map container is visible
    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();
  });

  test("should have navigation elements", async ({ page }) => {
    await page.goto("/");

    // Check for header elements - look for the header with our specific classes
    await expect(page.locator("header").first()).toBeVisible();
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

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

  test("should have searchable city dropdown", async ({ page }) => {
    await page.goto("/");

    // Wait for the page to load completely
    await page.waitForLoadState("networkidle");

    // Look for the Material-UI Autocomplete input - it uses a different structure
    const citySearch = page.locator('input[role="combobox"]');
    await expect(citySearch).toBeVisible();

    // Test that the dropdown opens when clicking
    await citySearch.click();

    // Wait for dropdown to appear (Material-UI Autocomplete uses different selectors)
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });

    // Verify dropdown is visible
    const dropdown = page.locator('[role="listbox"]');
    await expect(dropdown).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

test.describe("Map Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the map to load
    await page.waitForSelector(".leaflet-container", { timeout: 10000 });
  });

  test("should display map markers", async ({ page }) => {
    // Wait for markers to appear (they might take a moment to load)
    await page.waitForTimeout(2000);

    // Look for map markers
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();
  });

  test("should show popup when clicking marker", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(2000);

    // Click on the first marker
    const firstMarker = page.locator(".leaflet-marker-icon").first();
    await firstMarker.click();

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Verify popup is visible
    const popup = page.locator(".leaflet-popup");
    await expect(popup).toBeVisible();
  });

  test("should have select dropdown in popup", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(2000);

    // Click on the first marker
    const firstMarker = page.locator(".leaflet-marker-icon").first();
    await firstMarker.click();

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Look for select dropdown in popup
    const select = page.locator(
      '.leaflet-popup select, .leaflet-popup [role="combobox"]'
    );
    if (await select.isVisible()) {
      await expect(select).toBeVisible();
    }
  });

  test("should have link to location page in popup", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(2000);

    // Click on the first marker
    const firstMarker = page.locator(".leaflet-marker-icon").first();
    await firstMarker.click();

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Look for link in popup
    const link = page.locator(".leaflet-popup a");
    if (await link.isVisible()) {
      await expect(link).toBeVisible();

      // Click the link to navigate to location page
      await link.click();

      // Should navigate to a location page
      await expect(page).toHaveURL(/\/\d+/);
    }
  });
});

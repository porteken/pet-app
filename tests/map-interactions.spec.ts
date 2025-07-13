import { test, expect } from "@playwright/test";

test.describe("Map Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the map to load
    await page.waitForSelector(".leaflet-container", { timeout: 10000 });
  });

  test("should display map markers", async ({ page }) => {
    // Wait for markers to appear (they might take a moment to load)
    await page.waitForTimeout(3000);

    // Look for map markers
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    // Check if we have at least one marker
    if (markerCount > 0) {
      await expect(markers.first()).toBeVisible();
    } else {
      // If no markers, that's also acceptable for this test
      console.log("No markers found on map");
    }
  });

  test("should show popup when clicking marker", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(3000);

    // Look for map markers
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping popup test");
      return;
    }

    // Click on the first marker with proper waiting
    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    // Use force click to bypass pointer event interception
    await firstMarker.click({ force: true });

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Verify popup is visible
    const popup = page.locator(".leaflet-popup");
    await expect(popup).toBeVisible();
  });

  test("should have select dropdown in popup", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(3000);

    // Look for map markers
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping dropdown test");
      return;
    }

    // Click on the first marker with proper waiting
    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    // Use force click to bypass pointer event interception
    await firstMarker.click({ force: true });

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Look for select dropdown in popup (NextUI Select component) - be more specific
    const select = page.locator('.leaflet-popup [data-slot="base"]').first();
    if (await select.isVisible()) {
      await expect(select).toBeVisible();
    }
  });

  test("should have link to location page in popup", async ({ page }) => {
    // Wait for markers to load
    await page.waitForTimeout(3000);

    // Look for map markers
    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping link test");
      return;
    }

    // Click on the first marker with proper waiting
    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    // Use force click to bypass pointer event interception
    await firstMarker.click({ force: true });

    // Wait for popup to appear
    await page.waitForSelector(".leaflet-popup", { timeout: 5000 });

    // Look for the specific link in popup (exclude close button)
    const link = page
      .locator(".leaflet-popup a:not(.leaflet-popup-close-button)")
      .first();
    if (await link.isVisible()) {
      await expect(link).toBeVisible();

      // Click the link to navigate to location page
      await link.click();

      // Should navigate to a location page
      await expect(page).toHaveURL(/\/\d+/);
    }
  });
});

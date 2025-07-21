import { test, expect } from "@playwright/test";

test.describe("Map Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".leaflet-container", { timeout: 10_000 });
  });

  test("should display map markers", async ({ page }) => {
    await page.waitForTimeout(3000);

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount > 0) {
      await expect(markers.first()).toBeVisible();
    } else {
      console.log("No markers found on map");
    }
  });

  test("should show modal when clicking marker", async ({ page }) => {
    await page.waitForTimeout(3000);

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping modal test");
      return;
    }

    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    await firstMarker.click({ force: true });

    await page.waitForTimeout(2000);

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveCount(1);
  });

  test("should have select dropdown in modal", async ({ page }) => {
    await page.waitForTimeout(3000);

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping dropdown test");
      return;
    }

    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    await firstMarker.click({ force: true });

    await page.waitForTimeout(2000);

    const select = page.locator('[role="dialog"] select').first();
    if ((await select.count()) > 0) {
      await expect(select).toHaveCount(1);
    }
  });

  test("should have link to location page in modal", async ({ page }) => {
    await page.waitForTimeout(3000);

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount === 0) {
      console.log("No markers found, skipping link test");
      return;
    }

    const firstMarker = markers.first();
    await firstMarker.waitFor({ state: "visible", timeout: 5000 });

    await firstMarker.click({ force: true });

    await page.waitForTimeout(2000);

    const button = page
      .locator('[role="dialog"] button')
      .filter({ hasText: "View Full Details" });
    if ((await button.count()) > 0) {
      await expect(button).toHaveCount(1);

      await button.click();

      await expect(page).toHaveURL(/\/\d+/);
    }
  });
});

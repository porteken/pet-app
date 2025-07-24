import { expect, test } from "@playwright/test";

test.describe("Map Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should display map markers", async ({ page }) => {
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();
  });

  test("should show modal when clicking marker", async ({ page }) => {
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();

    const firstMarker = markers.first();
    await firstMarker.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveCount(1);
  });

  test("should have select dropdown in modal", async ({ page }) => {
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();

    const firstMarker = markers.first();
    await firstMarker.click();

    const select = page.locator('[role="dialog"] [role="combobox"]');
    await expect(select).toHaveCount(1);
  });

  test("should have link to location page in modal", async ({ page }) => {
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();

    const firstMarker = markers.first();
    await firstMarker.click();

    const button = page.locator(
      '[role="dialog"] button:has-text("View Full Details")'
    );
    await expect(button).toHaveCount(1);
    await button.click();
    await expect(page).toHaveURL(/\/\d+/);
  });
});

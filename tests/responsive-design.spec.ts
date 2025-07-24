import { expect, test } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should display correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ height: 1080, width: 1920 });
    await page.goto("/");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should handle mobile navigation", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    const aboutButton = page.locator(
      'a[href="/about"], button:has-text("About")'
    );
    await expect(aboutButton).toBeVisible();
    await aboutButton.click();
    await expect(page).toHaveURL(/.*about/);
  });

  test("should handle tablet navigation", async ({ page }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/");

    const aboutButton = page.locator(
      'a[href="/about"], button:has-text("About")'
    );
    await expect(aboutButton).toBeVisible();
    await aboutButton.click();
    await expect(page).toHaveURL(/.*about/);
  });

  test("should display graphs correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/1");

    const trendSection = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" });
    await expect(trendSection).toBeVisible();

    const referenceSection = page
      .locator("h2")
      .filter({ hasText: "Reference Data" });
    await expect(referenceSection).toBeVisible();
  });

  test("should display graphs correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/1");

    const trendSection = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" });
    await expect(trendSection).toBeVisible();

    const referenceSection = page
      .locator("h2")
      .filter({ hasText: "Reference Data" });
    await expect(referenceSection).toBeVisible();
  });

  test("should display graphs correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ height: 1080, width: 1920 });
    await page.goto("/1");

    const trendSection = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" });
    await expect(trendSection).toBeVisible();

    const referenceSection = page
      .locator("h2")
      .filter({ hasText: "Reference Data" });
    await expect(referenceSection).toBeVisible();
  });

  test("should handle mobile form interactions", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/1");

    const measureSelector = page.locator('select[id="graph-measure"]');
    await expect(measureSelector).toBeVisible();

    await measureSelector.selectOption("max");
    await expect(page).toHaveURL(/type=max/);
  });

  test("should handle tablet form interactions", async ({ page }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/1");

    const yearSelector = page.locator('select[id="reference-year"]');
    await expect(yearSelector).toBeVisible();

    await yearSelector.selectOption("2020");
  });

  test("should handle mobile map interactions", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });
    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10_000,
    });

    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();

    const firstMarker = markers.first();
    await firstMarker.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveCount(1);
  });

  test("should handle tablet map interactions", async ({ page }) => {
    await page.setViewportSize({ height: 1024, width: 768 });
    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10_000,
    });

    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible();

    const firstMarker = markers.first();
    await firstMarker.click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toHaveCount(1);
  });

  test("should maintain functionality across viewport sizes", async ({
    page,
  }) => {
    const viewports = [
      { height: 667, width: 375 },
      { height: 1024, width: 768 },
      { height: 1080, width: 1920 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/1");

      const locationTitle = page.locator("h1").nth(1);
      await expect(locationTitle).toBeVisible();

      const measureSelector = page.locator('select[id="graph-measure"]');
      await expect(measureSelector).toBeVisible();
    }
  });
});

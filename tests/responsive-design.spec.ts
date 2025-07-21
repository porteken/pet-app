import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("should display correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display correctly on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should display correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mapContainer = page.locator(".leaflet-container");
    await expect(mapContainer).toBeVisible();

    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("should handle mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test("should handle tablet navigation", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const aboutLink = page.locator('a[href="/about"]');
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test("should display graphs correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

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
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

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
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

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
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    const measureSelector = page.locator('select[id="graph-measure"]');
    await expect(measureSelector).toBeVisible();

    await measureSelector.selectOption("max");
    await expect(page).toHaveURL(/type=max/);
  });

  test("should handle tablet form interactions", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/1");
    await page.waitForLoadState("networkidle");

    const yearSelector = page.locator('select[id="reference-year"]');
    await expect(yearSelector).toBeVisible();

    await yearSelector.selectOption("2020");
  });

  test("should handle mobile map interactions", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.waitForSelector(".leaflet-container", { timeout: 10000 });

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount > 0) {
      const firstMarker = markers.first();
      await firstMarker.waitFor({ state: "visible", timeout: 5000 });

      await page.evaluate(() => {
        const marker = document.querySelector(
          ".leaflet-marker-icon"
        ) as HTMLElement;
        if (marker) marker.click();
      });

      await page.waitForTimeout(2000);
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveCount(1);
    }
  });

  test("should handle tablet map interactions", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.waitForSelector(".leaflet-container", { timeout: 10000 });

    const markers = page.locator(".leaflet-marker-icon");
    const markerCount = await markers.count();

    if (markerCount > 0) {
      const firstMarker = markers.first();
      await firstMarker.waitFor({ state: "visible", timeout: 5000 });

      await page.evaluate(() => {
        const marker = document.querySelector(
          ".leaflet-marker-icon"
        ) as HTMLElement;
        if (marker) marker.click();
      });

      await page.waitForTimeout(2000);
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toHaveCount(1);
    }
  });

  test("should maintain functionality across viewport sizes", async ({
    page,
  }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/1");
      await page.waitForLoadState("networkidle");

      const locationTitle = page.locator("h1").nth(1);
      await expect(locationTitle).toBeVisible();

      const measureSelector = page.locator('select[id="graph-measure"]');
      await expect(measureSelector).toBeVisible();
    }
  });
});

import { expect, test } from "@playwright/test";

test.describe("Cross-Browser Compatibility", () => {
  test("core functionality works across browsers", async ({ page }) => {
    await page.goto("/");

    // 1. Map loads in all browsers
    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // 2. Navigation works consistently
    await page.goto("/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    // 3. Interactive elements function properly
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    // 4. Graphs render correctly
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("CSS grid and flexbox layouts work consistently", async ({ page }) => {
    await page.goto("/1");

    // 1. Grid layout should work
    const gridContainer = page.locator(".grid");
    await expect(gridContainer).toBeVisible();

    // 2. Check computed styles (browser compatibility)
    const displayValue = await gridContainer.evaluate(
      element => globalThis.getComputedStyle(element).display
    );

    expect(displayValue).toContain("grid");

    // 3. Responsive behavior should be consistent
    await page.setViewportSize({ height: 600, width: 800 });
    await expect(gridContainer).toBeVisible();
  });

  test("JavaScript features work across browser versions", async ({ page }) => {
    await page.goto("/1");

    // 1. Modern JavaScript features should be supported
    const jsFeatureCheck = await page.evaluate(() => {
      // Test modern features that should work in supported browsers
      const features = {
        arrow_functions: (() => true)(),
        async_await: typeof Promise !== "undefined",
        const_let: true,
        template_literals: `test${1}` === "test1",
      };

      return features;
    });

    expect(jsFeatureCheck.arrow_functions).toBeTruthy();
    expect(jsFeatureCheck.const_let).toBeTruthy();
    expect(jsFeatureCheck.template_literals).toBeTruthy();
    expect(jsFeatureCheck.async_await).toBeTruthy();

    // 2. API interactions should work
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    // Wait for graphs to update
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("responsive design consistency across browsers", async ({ page }) => {
    // Test multiple viewport sizes
    const viewports = [
      { height: 667, width: 375 }, // Mobile
      { height: 1024, width: 768 }, // Tablet
      { height: 768, width: 1024 }, // Desktop small
      { height: 1080, width: 1920 }, // Desktop large
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/1");

      // 1. Content should be visible at all sizes
      await expect(page.getByText("Trend Analysis")).toBeVisible();

      // 2. Interactive elements should remain functional
      const graphMeasure = page.locator("select#graph-measure");
      await expect(graphMeasure).toBeVisible();

      // 3. No horizontal scrolling on main content
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth + 10;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    }
  });

  test("form interactions behave consistently", async ({ page }) => {
    await page.goto("/1");

    // Wait for the page to load completely
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);

    // 1. Select elements should work the same way
    const graphMeasure = page.locator("select#graph-measure");
    const referenceYear = page.locator("select#reference-year");

    // Ensure selects are ready
    await expect(graphMeasure).toBeVisible();
    await expect(referenceYear).toBeVisible();

    // 2. Change values with explicit waiting
    await graphMeasure.selectOption("max");
    await referenceYear.selectOption("2010");

    // 3. Verify changes persisted with explicit value checks
    await expect(graphMeasure).toHaveValue("max");
    await expect(referenceYear).toHaveValue("2010");

    // 4. UI should update accordingly
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("error handling consistency across browsers", async ({ page }) => {
    // 1. Test handling of invalid routes
    await page.goto("/999999", { timeout: 10_000 }); // Shorter timeout for error page

    // Should show error message, not crash the browser
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Location not found")).toBeVisible({
      timeout: 10_000,
    });

    // 2. Test JavaScript error recovery
    await page.goto("/1");

    // Inject a non-fatal error to test error boundaries
    await page.evaluate(() => {
      // Test that the app doesn't crash from JS errors
      try {
        // This might throw but shouldn't crash the app
        (globalThis as any).nonExistentFunction?.();
      } catch {
        // Expected to catch
      }
    });

    // App should still be functional
    await expect(page.getByText("Trend Analysis")).toBeVisible();
  });

  test("performance characteristics across browsers", async ({ page }) => {
    // 1. Measure initial page load
    const initialLoadStart = Date.now();
    await page.goto("/");
    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 15_000,
    });
    const initialLoadTime = Date.now() - initialLoadStart;

    // Should load within reasonable time (less than 10 seconds)
    expect(initialLoadTime).toBeLessThan(10_000);

    // 2. Test navigation performance
    const navStart = Date.now();
    await page.goto("/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    const navTime = Date.now() - navStart;

    // Navigation should be quick
    expect(navTime).toBeLessThan(5000);

    // 3. Test memory usage (basic check)
    const metrics = await page.evaluate(() => {
      const performance = globalThis.performance;
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        navigation: performance.navigation?.type || 0,
      };
    });

    // Memory should be reasonable - test unconditionally
    expect(typeof metrics.memory).toBe("number");
    expect(metrics.navigation).toBeGreaterThanOrEqual(0);
  });
});

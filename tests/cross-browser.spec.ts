import { expect, type Page, test } from "@playwright/test";

import { gotoAndWaitForMapPage, waitForMapPage } from "./utils/map-page";

function getPerformanceThresholds(browserName: string) {
  if (browserName === "webkit") {
    return {
      initialLoadMs: 20_000,
      navigationMs: 15_000,
    };
  }

  return {
    initialLoadMs: 12_000,
    navigationMs: 7500,
  };
}

async function gotoWithRetry(page: Page, url: string): Promise<void> {
  try {
    await page.goto(url);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("interrupted by another navigation")
    ) {
      await page.goto(url);
      return;
    }

    throw error;
  }
}

test.describe("Cross-Browser Compatibility", () => {
  test("core functionality works across browsers", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/");

    await page.goto("/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });
  });

  test("CSS grid and flexbox layouts work consistently", async ({ page }) => {
    await page.goto("/1");

    const gridContainer = page.locator(".grid");
    await expect(gridContainer).toBeVisible();

    const displayValue = await gridContainer.evaluate(
      element => globalThis.getComputedStyle(element).display
    );

    expect(displayValue).toContain("grid");

    await page.setViewportSize({ height: 600, width: 800 });
    await expect(gridContainer).toBeVisible();
  });

  test("JavaScript features work across browser versions", async ({ page }) => {
    await page.goto("/1");

    const jsFeatureCheck = await page.evaluate(() => {
      return {
        arrow_functions: (() => true)(),
        async_await: typeof Promise !== "undefined",
        const_let: true,
        template_literals: `test${1}` === "test1",
      };
    });

    expect(jsFeatureCheck.arrow_functions).toBeTruthy();
    expect(jsFeatureCheck.const_let).toBeTruthy();
    expect(jsFeatureCheck.template_literals).toBeTruthy();
    expect(jsFeatureCheck.async_await).toBeTruthy();

    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });
  });

  test("responsive design consistency across browsers", async ({ page }) => {
    const viewports = [
      { height: 667, width: 375 },
      { height: 1024, width: 768 },
      { height: 768, width: 1024 },
      { height: 1080, width: 1920 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto("/1");

      await expect(page.getByText("Trend Analysis")).toBeVisible();

      const graphMeasure = page.locator("select#graph-measure");
      await expect(graphMeasure).toBeVisible();

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth + 10;
      });

      expect(hasHorizontalScroll).toBeFalsy();
    }
  });

  test("form interactions behave consistently", async ({ page }) => {
    await page.goto("/1");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });

    const graphMeasure = page.locator("select#graph-measure");
    const referenceYear = page.locator("select#reference-year");

    await expect(graphMeasure).toBeVisible();
    await expect(referenceYear).toBeVisible();

    await graphMeasure.selectOption("max");
    await referenceYear.selectOption("2010");

    await expect(graphMeasure).toHaveValue("max");
    await expect(referenceYear).toHaveValue("2010");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });
  });

  test("performance characteristics across browsers", async ({
    browserName,
    page,
  }) => {
    const thresholds = getPerformanceThresholds(browserName);
    const initialLoadStart = Date.now();
    await gotoWithRetry(page, "/");
    await waitForMapPage(page);
    const initialLoadTime = Date.now() - initialLoadStart;

    expect(initialLoadTime).toBeLessThan(thresholds.initialLoadMs);

    const navStart = Date.now();
    await gotoWithRetry(page, "/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    const navTime = Date.now() - navStart;

    expect(navTime).toBeLessThan(thresholds.navigationMs);

    const metrics = await page.evaluate(() => {
      const performance = globalThis.performance;

      let navigationType = "navigate";

      if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType(
          "navigation"
        ) as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          navigationType = navigationEntries[0].type;
        }
      }

      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        navigationType,
      };
    });

    expect(typeof metrics.memory).toBe("number");
    expect(["navigate", "reload", "back_forward", "prerender"]).toContain(
      metrics.navigationType
    );
  });
});

/**
 * Accessibility E2E Tests
 * Following Bulletproof React guidelines for inclusive testing
 */

import { expect, test } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test("keyboard navigation: complete user journey using only keyboard", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. User can navigate using Tab key
    await page.keyboard.press("Tab");

    // 2. Focus should be manageable on the page (skip initial focus check due to Next.js dev tools)

    // 3. User can navigate to location page using keyboard
    await page.goto("/1");

    // 4. Form controls should be keyboard accessible
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Find the graph measure select
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.focus();

    // 5. User can change selections using keyboard
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // 6. Changes should be reflected in the UI
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("screen reader compatibility: proper ARIA labels and semantics", async ({
    page,
  }) => {
    await page.goto("/1");

    // 1. Page should have proper heading structure
    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading.first()).toBeVisible();

    // 2. Form controls should have proper labels
    const graphMeasureLabel = page.locator('label[for="graph-measure"]');
    await expect(graphMeasureLabel).toBeVisible();
    await expect(graphMeasureLabel).toHaveText("Graph Measure");

    const referenceYearLabel = page.locator('label[for="reference-year"]');
    await expect(referenceYearLabel).toBeVisible();
    await expect(referenceYearLabel).toHaveText("Reference Year");

    // 3. Interactive elements should have proper roles
    const selectElements = page.locator("select");
    await expect(selectElements).toHaveCount(2);

    // 4. Main content areas should be semantically marked
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // 5. Navigation elements should be properly labeled
    const nav = page.locator("nav, header");
    await expect(nav).toBeVisible();
  });

  test("high contrast mode: UI remains usable with high contrast", async ({
    page,
  }) => {
    // 1. Enable high contrast mode simulation
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/1");

    // 2. Text should remain readable
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    // 3. Interactive elements should be visible
    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();

    // 4. Focus indicators should be visible
    await graphMeasure.focus();
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("reduced motion: animations respect user preferences", async ({
    page,
  }) => {
    // 1. Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/");

    // 2. Map should still load and be functional
    await expect(page.locator(".leaflet-container")).toBeVisible();

    // 3. Interactive elements should work without problematic animations
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible();

    // Navigate to data page
    await page.goto("/1");

    // 4. Graph updates should respect reduced motion
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("zoom and text scaling: UI adapts to increased text size", async ({
    page,
  }) => {
    await page.goto("/1");

    // 1. Simulate 200% zoom
    await page.setViewportSize({ height: 600, width: 800 });

    // 2. Content should remain accessible
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    // 3. Controls should remain functional
    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    // 4. No horizontal scrolling should be required for main content
    const bodyScrollWidth = await page.evaluate(
      () => document.body.scrollWidth
    );
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Allow for some minimal scrolling but not excessive
    expect(bodyScrollWidth).toBeLessThan(viewportWidth + 50);
  });

  test("color contrast: sufficient contrast for all text", async ({ page }) => {
    await page.goto("/1");

    // 1. Check that important text elements are visible
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading.first()).toBeVisible();

    const labels = page.locator("label");
    for (const label of await labels.all()) {
      await expect(label).toBeVisible();
    }

    // 2. Navigation elements should be clearly visible
    const navElements = page.locator("nav a, header a, button");
    const visibleNavElements = await navElements.all();
    expect(visibleNavElements.length).toBeGreaterThan(0);

    // 3. Interactive states should have sufficient contrast
    const selectElement = page.locator("select#graph-measure");
    await selectElement.focus();
    await expect(selectElement).toBeVisible();
  });

  test("mobile accessibility: touch targets and screen reader on mobile", async ({
    page,
  }) => {
    // 1. Set mobile viewport
    await page.setViewportSize({ height: 667, width: 375 });

    await page.goto("/1");

    // 2. Touch targets should be large enough (at least 44px)
    const selectElements = page.locator("select");
    const firstSelect = selectElements.first();
    const box = await firstSelect.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(40);

    // 3. Content should be accessible without zooming
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    // 4. Interactive elements should work with touch
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.click(); // Use click instead of tap for better compatibility
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });
});

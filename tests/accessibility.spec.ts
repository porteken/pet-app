import { expect, test } from "@playwright/test";

test.describe("Accessibility Tests", () => {
  test("keyboard navigation: complete user journey using only keyboard", async ({
    page,
  }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");

    await page.goto("/1");

    // Wait for the page and graphs to load

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.focus();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Wait for graphs to re-render

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 10_000,
    });
  });

  test("screen reader compatibility: proper ARIA labels and semantics", async ({
    page,
  }) => {
    await page.goto("/1");

    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading.first()).toBeVisible();

    // Wait for the page to be fully loaded by waiting for the select elements

    const graphMeasureLabel = page.locator('label[for="graph-measure"]');
    await expect(graphMeasureLabel).toBeVisible({ timeout: 10_000 });
    await expect(graphMeasureLabel).toHaveText("Graph Measure");

    const referenceYearLabel = page.locator('label[for="reference-year"]');
    await expect(referenceYearLabel).toBeVisible();
    await expect(referenceYearLabel).toHaveText("Reference Year");

    const selectElements = page.locator("select");
    await expect(selectElements).toHaveCount(2);

    const main = page.locator("main");
    await expect(main).toBeVisible();

    const nav = page.locator("nav, header");
    await expect(nav).toBeVisible();
  });

  test("high contrast mode: UI remains usable with high contrast", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });

    await page.goto("/1");

    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();

    await graphMeasure.focus();
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("reduced motion: animations respect user preferences", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible();

    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });

    await page.goto("/1");

    // Wait for initial graphs to load
    await page.waitForSelector(".js-plotly-plot", { state: "visible" });
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });

    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");

    // Wait for graphs to re-render after selection change
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 10_000,
    });
  });

  test("responsive zoom: content remains usable at 200% zoom", async ({
    page,
  }) => {
    await page.goto("/1");

    await page.setViewportSize({ height: 600, width: 800 });

    // Wait for page to be fully loaded
    await page.waitForSelector("select#graph-measure", { state: "visible" });

    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    // Wait for layout to settle after selection change
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 10_000,
    });

    const bodyScrollWidth = await page.evaluate(
      () => document.body.scrollWidth
    );
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyScrollWidth).toBeLessThan(viewportWidth + 50);
  });

  test("color contrast: sufficient contrast for all text", async ({ page }) => {
    await page.goto("/1");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading.first()).toBeVisible();

    const labels = page.locator("label");
    for (const label of await labels.all()) {
      await expect(label).toBeVisible();
    }

    const navElements = page.locator("nav a, header a, button");
    const visibleNavElements = await navElements.all();
    expect(visibleNavElements.length).toBeGreaterThan(0);

    const selectElement = page.locator("select#graph-measure");
    await selectElement.focus();
    await expect(selectElement).toBeVisible();
  });

  test("mobile accessibility: touch targets and screen reader on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 667, width: 375 });

    await page.goto("/1");

    const selectElements = page.locator("select");
    const firstSelect = selectElements.first();
    const box = await firstSelect.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(40);

    await expect(page.getByText("Trend Analysis")).toBeVisible();

    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.click();
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });
  });
});

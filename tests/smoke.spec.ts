import { expect, test } from "@playwright/test";

import { clickClickableMarker, MARKER_SELECTOR } from "./utils/map-marker";

test.describe("Smoke Tests", () => {
  test("complete user journey: home → location selection → data analysis", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();

    await clickClickableMarker(page);

    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible({ timeout: 10_000 });

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole("button", { name: "Close" }).click();
    await expect(modal).toBeHidden({ timeout: 10_000 });

    await page.locator("input[data-testid='city-selector']").click();
    const phoenixOption = page
      .getByTestId("searchable-select-option")
      .filter({ hasText: "Phoenix" })
      .first();
    await expect(phoenixOption).toBeVisible({ timeout: 5000 });
    await phoenixOption.click();

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Reference Data")).toBeVisible({
      timeout: 10_000,
    });

    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 10_000,
    });

    await page.goBack();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("navigation workflow: direct URL access → data interaction", async ({
    page,
  }) => {
    await page.goto("/1");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });

    const graphMeasure = page.locator("select#graph-measure");
    const referenceYear = page.locator("select#reference-year");

    await graphMeasure.selectOption("max");
    await referenceYear.selectOption("2010");

    await page.getByText("Map").click();
    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("error handling: invalid location → graceful fallback", async ({
    page,
  }) => {
    await page.goto("/99999");

    await expect(page.locator("body")).toBeVisible();

    await expect(page.locator("h1, .error-message, .not-found")).toBeVisible();
  });

  test("responsive design: mobile user journey", async ({ page }) => {
    await page.setViewportSize({ height: 667, width: 375 });

    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 10_000,
    });

    const marker = page.locator(MARKER_SELECTOR).first();
    await marker.waitFor({ state: "visible", timeout: 10_000 });

    await page.setViewportSize({ height: 1024, width: 768 });

    await clickClickableMarker(page);

    const viewDetailsButton = page.getByRole("button", {
      name: "View Full Details",
    });
    await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });
    await expect(viewDetailsButton).toBeEnabled();

    await page.setViewportSize({ height: 667, width: 375 });
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible({ timeout: 10_000 });
    await modal.getByRole("button", { name: "Close" }).click();
    await expect(modal).toBeHidden({ timeout: 10_000 });
    await page.locator("input[data-testid='city-selector']").click();
    const phoenixOption = page
      .getByTestId("searchable-select-option")
      .filter({ hasText: "Phoenix" })
      .first();
    await expect(phoenixOption).toBeVisible({ timeout: 5000 });
    await phoenixOption.click();

    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2, {
      timeout: 15_000,
    });
  });

  test("performance: page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10_000);

    const errors: string[] = [];
    page.on("console", message => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    const dataStartTime = Date.now();
    await page.goto("/1");
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    const dataLoadTime = Date.now() - dataStartTime;
    expect(dataLoadTime).toBeLessThan(15_000);

    expect(errors.length).toBeLessThan(3);
  });
});

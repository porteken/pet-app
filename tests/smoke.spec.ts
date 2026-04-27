import { expect, test } from "@playwright/test";

import { MARKER_SELECTOR } from "./utils/map-marker";
import {
  gotoAndWaitForMapPage,
  openLocationDetailsModal,
  waitForLocationDetailsPage,
  waitForMapPage,
} from "./utils/map-page";

test.describe("Smoke Tests", () => {
  const locationCharts =
    '[data-testid="trend-chart"], [data-testid="reference-chart"]';

  test("complete user journey: home → location selection → data analysis", async ({
    page,
  }) => {
    await gotoAndWaitForMapPage(page, "/");

    const { modal } = await openLocationDetailsModal(page);
    await modal.getByRole("button", { name: "Close" }).click();
    await expect(modal).toBeHidden({ timeout: 10_000 });

    await page.locator("input[data-testid='city-selector']").click();
    const phoenixOption = page
      .getByTestId("searchable-select-option")
      .filter({ hasText: "Phoenix" })
      .first();
    await expect(phoenixOption).toBeVisible({ timeout: 5000 });
    await phoenixOption.click();
    await waitForLocationDetailsPage(page);

    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    await expect(page.locator(locationCharts)).toHaveCount(2, {
      timeout: 10_000,
    });

    await page.goBack();
    await waitForMapPage(page);
  });

  test("navigation workflow: direct URL access → data interaction", async ({
    page,
  }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/);

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

    await gotoAndWaitForMapPage(page, "/");

    const marker = page.locator(MARKER_SELECTOR).first();
    await marker.waitFor({ state: "visible", timeout: 10_000 });

    await page.setViewportSize({ height: 1024, width: 768 });

    const { modal, viewDetailsButton } = await openLocationDetailsModal(page);
    await expect(viewDetailsButton).toBeEnabled();

    await page.setViewportSize({ height: 667, width: 375 });
    await modal.getByRole("button", { name: "Close" }).click();
    await expect(modal).toBeHidden({ timeout: 10_000 });
    await page.locator("input[data-testid='city-selector']").click();
    const phoenixOption = page
      .getByTestId("searchable-select-option")
      .filter({ hasText: "Phoenix" })
      .first();
    await expect(phoenixOption).toBeVisible({ timeout: 5000 });
    await phoenixOption.click();
    await waitForLocationDetailsPage(page);
  });

  test("performance: page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await gotoAndWaitForMapPage(page, "/");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(10_000);

    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    const dataStartTime = Date.now();
    await page.goto("/1");
    await expect(
      page.getByRole("heading", { name: "Trend Analysis" }),
    ).toBeVisible();

    const dataLoadTime = Date.now() - dataStartTime;
    expect(dataLoadTime).toBeLessThan(15_000);

    expect(errors.length).toBeLessThan(3);
  });
});

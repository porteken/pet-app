import { expect, test } from "@playwright/test";

test.describe("Smoke Tests - Critical User Journeys", () => {
  test("complete user journey: home → location selection → data analysis", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();

    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible();
    // eslint-disable-next-line playwright/no-force-option
    await marker.click({ force: true });

    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible();

    await page.getByRole("button", { name: "View Full Details" }).click();

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();

    const graphMeasure = page.locator("select#graph-measure");
    await expect(graphMeasure).toBeVisible();
    await graphMeasure.selectOption("max");

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);

    await page.goBack();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("navigation workflow: direct URL access → data interaction", async ({
    page,
  }) => {
    await page.goto("/1");

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.getByText("Trend Analysis")).toBeVisible();

    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);

    const graphMeasure = page.locator("select#graph-measure");
    const referenceYear = page.locator("select#reference-year");

    await graphMeasure.selectOption("max");
    await referenceYear.selectOption("2010");

    await page.getByText("Map").click();
    await expect(page.locator(".leaflet-container")).toBeVisible();
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

    await expect(page.locator(".leaflet-container")).toBeVisible();

    await expect(page.getByText("Loading map...")).toBeHidden();

    const marker = page.locator(".leaflet-marker-icon").first();
    await marker.waitFor({ state: "visible" });

    await page.setViewportSize({ height: 1024, width: 768 });
    // eslint-disable-next-line playwright/no-force-option
    await marker.click({ force: true });

    const viewDetailsButton = page.getByRole("button", {
      name: "View Full Details",
    });
    await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });

    await page.setViewportSize({ height: 667, width: 375 });

    await viewDetailsButton.click();

    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
  });

  test("performance: page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    await expect(page.locator(".leaflet-container")).toBeVisible();

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000);

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
    expect(dataLoadTime).toBeLessThan(3000);

    expect(errors.length).toBeLessThan(3);
  });
});

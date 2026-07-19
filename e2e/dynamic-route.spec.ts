import { expect, test } from "./fixtures";
import { waitForDataResponse } from "./utils/api";
import { waitForLocationDetailsPage } from "./utils/map-page";

test.describe("Location Page", () => {
  const locationCharts =
    '[data-testid="trend-chart"], [data-testid="reference-chart"]';

  test("should display location content and graphs", async ({ page }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);
    await expect(page.getByRole("heading", { name: /, /u })).toBeVisible();
  });

  test("should show not found error for non-existent location", async ({
    page,
  }) => {
    await page.goto("/999999", {
      timeout: 20_000,
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Location not found")).toBeVisible();
  });

  test("should change graph measure and reference year", async ({ page }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);

    const graphMeasure = page.locator("select#graph-measure");
    await Promise.all([
      waitForDataResponse(page, "trend", { locationId: "1", option: "max" }),
      graphMeasure.selectOption("max"),
    ]);
    await expect(page.locator(locationCharts)).toHaveCount(2, {
      timeout: 10_000,
    });

    const referenceYear = page.locator("select#reference-year");
    await Promise.all([
      waitForDataResponse(page, "reference", {
        locationId: "1",
        year: "2005",
      }),
      referenceYear.selectOption("2005"),
    ]);
    await expect(page.locator(locationCharts)).toHaveCount(2, {
      timeout: 10_000,
    });
  });

  test("should switch basis and refetch trend data with the new basis", async ({
    page,
  }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);

    const basisToggle = page.getByRole("button", {
      name: /switch to daily (?<basis>average|maximum) pet/iu,
    });
    await expect(basisToggle).toHaveText("Daily Max");

    await Promise.all([
      waitForDataResponse(page, "trend", { basis: "avg", locationId: "1" }),
      basisToggle.click(),
    ]);

    await expect(basisToggle).toHaveText("Daily Avg");
    await expect(page.locator(locationCharts)).toHaveCount(2, {
      timeout: 10_000,
    });
  });

  test("should toggle forecast, adjust years ahead, and load forecast data", async ({
    page,
  }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);

    const showForecast = page.getByLabel("Show Forecast");
    await expect(showForecast).not.toBeChecked();

    await Promise.all([
      waitForDataResponse(page, "forecast", {
        locationId: "1",
        yearsAhead: "10",
      }),
      showForecast.check(),
    ]);

    const yearsSlider = page.locator("#forecast-years");
    await expect(yearsSlider).toBeVisible();
    await expect(page.getByText("Forecast 10 years ahead")).toBeVisible();

    await Promise.all([
      waitForDataResponse(page, "forecast", {
        locationId: "1",
        yearsAhead: "75",
      }),
      yearsSlider.fill("75"),
    ]);

    await expect(page.getByText("Forecast 75 years ahead")).toBeVisible();

    await showForecast.uncheck();
    await expect(yearsSlider).toBeHidden();
  });

  test("should change graph season and update the trend analysis", async ({
    page,
  }) => {
    await page.goto("/1");
    await waitForLocationDetailsPage(page, /\/1(?:\?.*)?$/u);

    await Promise.all([
      waitForDataResponse(page, "trend", {
        locationId: "1",
        season: "Summer",
      }),
      page.locator("select#graph-season").selectOption("Summer"),
    ]);

    await expect(
      page.getByText(/summer average thermal stress is/iu),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(locationCharts)).toHaveCount(2, {
      timeout: 10_000,
    });
  });
});

import { expect, test } from "@playwright/test";

test.describe("Dynamic Location Page", () => {
  test("should display location content and graphs", async ({ page }) => {
    await page.goto("/1");
    await expect(page.getByRole("heading", { name: /, / })).toBeVisible();
    await expect(page.getByText("Trend Analysis")).toBeVisible();
    await expect(page.getByText("Reference Data")).toBeVisible();
    await expect(page.locator("select#graph-measure")).toBeVisible();
    await expect(page.locator("select#reference-year")).toBeVisible();
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
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
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
    const referenceYear = page.locator("select#reference-year");
    await referenceYear.selectOption("2005");
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
  });
  test("should update reference graph when year is changed", async ({
    page,
  }) => {
    await page.goto("/1");
    const referenceYear = page.locator("select#reference-year");
    await referenceYear.selectOption("2005");
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
  });
});

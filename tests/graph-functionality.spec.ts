import { expect, test } from "@playwright/test";

test.describe("Graph Functionality", () => {
  test("should update trend graph when graph measure is changed", async ({
    page,
  }) => {
    await page.goto("/1");
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");
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

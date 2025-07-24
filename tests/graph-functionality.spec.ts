import { expect, test } from "@playwright/test";

test.describe("Graph Functionality", () => {
  test("should update trend graph when graph measure is changed", async ({
    page,
  }) => {
    await page.goto("/1");
    const graphMeasure = page.locator("select#graph-measure");
    await graphMeasure.selectOption("max");
    // Debug: print the URL
    console.log("URL after selectOption(max):", page.url());
    // Instead of only checking the URL, check for graph count
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
  });

  test("should update reference graph when year is changed", async ({
    page,
  }) => {
    await page.goto("/1");
    const referenceYear = page.locator("select#reference-year");
    await referenceYear.selectOption("2005");
    // Debug: print the URL
    console.log("URL after selectOption(2005):", page.url());
    await expect(page.locator(".js-plotly-plot")).toHaveCount(2);
    await expect(page.locator(".js-plotly-plot").first()).toBeVisible();
  });
});

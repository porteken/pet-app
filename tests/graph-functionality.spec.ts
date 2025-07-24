import { expect, test } from "@playwright/test";

test.describe("Graph Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/1");
  });

  test("should display trend analysis graph", async ({ page }) => {
    const trendSection = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" });
    await expect(trendSection).toBeVisible();

    const graphContainer = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" })
      .locator("..")
      .locator("div")
      .last();
    await expect(graphContainer).toBeVisible();
  });

  test("should display reference data graph", async ({ page }) => {
    const referenceSection = page
      .locator("h2")
      .filter({ hasText: "Reference Data" });
    await expect(referenceSection).toBeVisible();

    const graphContainer = page
      .locator("h2")
      .filter({ hasText: "Reference Data" })
      .locator("..")
      .locator("div")
      .last();
    await expect(graphContainer).toBeVisible();
  });

  test("should have graph measure selector", async ({ page }) => {
    const measureSelector = page.locator('select[id="graph-measure"]');
    await expect(measureSelector).toBeVisible();

    const options = measureSelector.locator("option");
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveText("Average");
    await expect(options.nth(1)).toHaveText("Maximum");
  });

  test("should have reference year selector", async ({ page }) => {
    const yearSelector = page.locator('select[id="reference-year"]');
    await expect(yearSelector).toBeVisible();

    const options = yearSelector.locator("option");
    await expect(options).toHaveCount(23);
    await expect(options.first()).toHaveAttribute("value", "2000");
    await expect(options.last()).toHaveAttribute("value", "2023");
  });

  test("should change graph measure when selector changes", async ({
    page,
  }) => {
    const measureSelector = page.locator('select[id="graph-measure"]');

    await measureSelector.selectOption("max");

    await expect(page).toHaveURL(/\?type=max/);
  });

  test("should update URL when graph measure changes", async ({ page }) => {
    const measureSelector = page.locator('select[id="graph-measure"]');

    await measureSelector.selectOption("max");

    await expect(page).toHaveURL(/\?type=max/);

    await measureSelector.selectOption("avg");

    await expect(page).toHaveURL("/");
  });

  test("should maintain graph state on page refresh", async ({ page }) => {
    const measureSelector = page.locator('select[id="graph-measure"]');

    await measureSelector.selectOption("max");
    await expect(page).toHaveURL(/\?type=max/);

    await page.reload();

    await expect(measureSelector).toHaveValue("max");
    await expect(page).toHaveURL(/\?type=max/);
  });

  test("should display location information", async ({ page }) => {
    const locationTitle = page.locator("h1").nth(1);
    await expect(locationTitle).toBeVisible();

    const locationText = await locationTitle.textContent();
    expect(locationText).toMatch(/[\sA-Za-z]+, [\sA-Za-z]+/);
  });

  test("should handle graph loading states", async ({ page }) => {
    const trendSection = page
      .locator("h2")
      .filter({ hasText: "Trend Analysis" });
    await expect(trendSection).toBeVisible();

    const referenceSection = page
      .locator("h2")
      .filter({ hasText: "Reference Data" });
    await expect(referenceSection).toBeVisible();
  });
});

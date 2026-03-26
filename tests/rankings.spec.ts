import { expect, test } from "@playwright/test";

test.describe("Rankings Page", () => {
  test("should display rankings table with data", async ({ page }) => {
    await page.goto("/rankings");

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.locator("table")).toBeVisible();

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });

    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("should display year selector and filter controls", async ({ page }) => {
    await page.goto("/rankings");

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByLabel("Year")).toBeVisible();
    await expect(page.getByLabel("State")).toBeVisible();
    await expect(page.getByLabel("Avg Heat Stress Level")).toBeVisible();
  });

  test("should display heat stress legend", async ({ page }) => {
    await page.goto("/rankings");

    await expect(page.getByText("Heat Stress Levels")).toBeVisible({
      timeout: 10_000,
    });

    const legendSection = page
      .locator("div")
      .filter({ has: page.getByText("Heat Stress Levels") })
      .first();

    await expect(
      legendSection.locator("div.font-semibold.text-green-600"),
    ).toContainText("None to Slight");
    await expect(
      legendSection.locator("div.font-semibold.text-yellow-600"),
    ).toContainText("Moderate");
    await expect(
      legendSection.locator("div.font-semibold.text-orange-600"),
    ).toContainText("Strong");
    await expect(
      legendSection.locator("div.font-semibold.text-red-600"),
    ).toContainText("Extreme");
  });

  test("should change year and update rankings", async ({ page }) => {
    await page.goto("/rankings");

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 10_000,
    });

    const yearSelect = page.getByLabel("Year");
    await expect(yearSelect).toBeVisible({ timeout: 10_000 });

    await yearSelect.selectOption({ label: "2010" });

    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should sort table by clicking header", async ({ page }) => {
    await page.goto("/rankings");

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 10_000,
    });

    const tableHeaders = page.locator("table thead th");
    await expect(tableHeaders.first()).toBeVisible({ timeout: 10_000 });

    const cityHeader = tableHeaders.nth(1);
    await cityHeader.click();

    await expect(page.locator("table tbody tr").first()).toBeVisible();
  });

  test("should navigate to location page when row is clicked", async ({
    page,
  }) => {
    await page.goto("/rankings");

    const firstRow = page.locator("table tbody tr").first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });

    await firstRow.click();

    await expect(page).toHaveURL(/\/\d+$/);
    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("should filter by state", async ({ page }) => {
    await page.goto("/rankings", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 15_000,
    });

    const stateSelect = page.getByLabel("State");
    await expect(stateSelect).toBeVisible({ timeout: 10_000 });

    const firstStateOption = stateSelect.locator("option").nth(1);
    const stateValue = await firstStateOption.getAttribute("value");
    await stateSelect.selectOption(stateValue);

    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("should filter by heat stress level", async ({ page }) => {
    await page.goto("/rankings", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 15_000,
    });

    const heatStressSelect = page.getByLabel("Avg Heat Stress Level");
    await expect(heatStressSelect).toBeVisible({ timeout: 10_000 });

    const firstOption = heatStressSelect.locator("option").nth(1);
    const optionValue = await firstOption.getAttribute("value");
    await heatStressSelect.selectOption(optionValue);

    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

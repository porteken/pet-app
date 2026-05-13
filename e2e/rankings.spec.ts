import { expect, test } from "@playwright/test";

import {
  getOpenCustomSelectOptions,
  openCustomSelect,
  selectCustomOption,
} from "./utils/custom-select";
import { waitForLocationDetailsPage } from "./utils/map-page";

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

    await expect(page.getByTestId("rankings-year-filter")).toBeVisible();
    await expect(page.getByTestId("rankings-state-filter")).toBeVisible();
    await expect(page.getByTestId("rankings-heat-stress-filter")).toBeVisible();
  });

  test("should display thermal stress legend", async ({ page }) => {
    await page.goto("/rankings");

    await expect(page.getByText("Thermal Stress Index")).toBeVisible({
      timeout: 10_000,
    });

    const legendSection = page
      .locator("div")
      .filter({ has: page.getByText("Thermal Stress Index") })
      .first();

    await expect(legendSection).toContainText("Extreme Cold Stress");
    await expect(legendSection).toContainText("No Thermal Stress");
    await expect(legendSection).toContainText("Strong Heat Stress");
    await expect(legendSection).toContainText("Extreme Heat Stress");
  });

  test("should change year and update rankings", async ({ page }) => {
    await page.goto("/rankings");

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 10_000,
    });

    await expect(page.getByTestId("rankings-year-filter")).toBeVisible({
      timeout: 10_000,
    });

    const yearSelect = page.getByTestId("rankings-year-filter");
    await selectCustomOption(page, yearSelect, /^2010$/u);
    await expect(yearSelect).toContainText("2010");

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
    await firstRow.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL(/\/\d+(?:\?.*)?$/u, { timeout: 15_000 }),
      firstRow.locator("td").nth(1).click(),
    ]);

    await waitForLocationDetailsPage(page);
  });

  test("should filter by state", async ({ page }) => {
    await page.goto("/rankings", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByTestId("rankings-state-filter")).toBeVisible({
      timeout: 10_000,
    });

    const stateSelect = page.getByTestId("rankings-state-filter");
    await openCustomSelect(page, stateSelect);
    const firstStateOption = getOpenCustomSelectOptions(page).first();
    const firstStateOptionText = await firstStateOption.textContent();
    const stateLabel = firstStateOptionText?.trim();
    expect(stateLabel).toBeTruthy();
    await firstStateOption.click();

    await expect(stateSelect).toContainText(stateLabel ?? "");

    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.locator("table tbody tr").first().locator("td").nth(2),
    ).toContainText(stateLabel ?? "");
  });

  test("should filter by thermal stress level", async ({ page }) => {
    await page.goto("/rankings", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Cities ranked by Average PET" }),
    ).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.getByTestId("rankings-heat-stress-filter")).toBeVisible({
      timeout: 10_000,
    });

    const heatStressSelect = page.getByTestId("rankings-heat-stress-filter");
    await openCustomSelect(page, heatStressSelect);
    const firstOption = getOpenCustomSelectOptions(page).first();
    const firstOptionText = await firstOption.textContent();
    const optionLabel = firstOptionText?.trim();
    expect(optionLabel).toBeTruthy();
    await firstOption.click();

    await expect(heatStressSelect).toContainText(optionLabel ?? "");

    await expect(page.locator("table tbody tr").first()).toBeVisible({
      timeout: 15_000,
    });
  });
});

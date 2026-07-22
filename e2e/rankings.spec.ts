import { expect, test } from "./fixtures";
import {
  getOpenCustomSelectOptions,
  openCustomSelect,
  selectCustomOption,
  waitForStableSelect,
} from "./utils/custom-select";
import { waitForLocationDetailsPage } from "./utils/map-page";
import {
  expandHeatStressLegend,
  gotoRankingsPage,
  getFirstRow,
} from "./utils/rankings-page";

test.describe("Rankings Page", () => {
  test("should render rankings page with table, filters, and legend", async ({
    page,
  }) => {
    await gotoRankingsPage(page);

    const rows = page.locator("table tbody tr");
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (const filterTestId of [
      "rankings-year-filter",
      "rankings-season-filter",
      "rankings-state-filter",
      "rankings-heat-stress-filter",
    ]) {
      const filter = page.getByTestId(filterTestId);
      await waitForStableSelect(filter);
      await expect(filter).toBeVisible();
    }

    await expect(
      page.getByRole("link", { name: "Historical PET USA" }),
    ).toBeVisible();
    await expect(page.getByTestId("city-selector")).toContainText(
      "Select City",
    );

    await expandHeatStressLegend(page);

    const legendHeading = page.getByRole("heading", {
      name: "Thermal Stress Index",
    });
    await expect(legendHeading).toBeVisible();
    const legendSection = page
      .locator("div")
      .filter({ has: legendHeading })
      .first();
    await expect(legendSection).toContainText("Extreme Cold Stress");
    await expect(legendSection).toContainText("No Thermal Stress");
    await expect(legendSection).toContainText("Strong Heat Stress");
    await expect(legendSection).toContainText("Extreme Heat Stress");
  });

  test("should change year and update rankings", async ({ page }) => {
    await gotoRankingsPage(page);

    const yearSelect = page.getByTestId("rankings-year-filter");
    await selectCustomOption(page, yearSelect, /^2010$/u);
    await waitForStableSelect(yearSelect);
    await expect(yearSelect).toContainText("2010");

    await expect(getFirstRow(page)).toBeVisible({ timeout: 10_000 });
  });

  test("should sort table by clicking header", async ({ page }) => {
    await gotoRankingsPage(page);

    const cityHeader = page.locator("table thead th").nth(1);
    const cityHeaderButton = cityHeader.getByRole("button");
    const firstCityCell = () => getFirstRow(page).locator("td").nth(1);
    const secondCityCell = () =>
      page.locator("table tbody tr").nth(1).locator("td").nth(1);

    await cityHeaderButton.click();
    await expect(cityHeader).toHaveAttribute("aria-sort", "ascending");
    const [ascendingFirst, ascendingSecond] = await Promise.all([
      firstCityCell().textContent(),
      secondCityCell().textContent(),
    ]);
    expect(
      (ascendingFirst ?? "").localeCompare(ascendingSecond ?? ""),
    ).toBeLessThanOrEqual(0);

    await cityHeaderButton.click();
    await expect(cityHeader).toHaveAttribute("aria-sort", "descending");
    const [descendingFirst, descendingSecond] = await Promise.all([
      firstCityCell().textContent(),
      secondCityCell().textContent(),
    ]);
    expect(
      (descendingFirst ?? "").localeCompare(descendingSecond ?? ""),
    ).toBeGreaterThanOrEqual(0);
  });

  test("should navigate to location page when row is clicked", async ({
    page,
  }) => {
    await gotoRankingsPage(page);

    const firstRow = getFirstRow(page);
    await firstRow.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL(/\/\d+(?:\?.*)?$/u, { timeout: 15_000 }),
      firstRow.locator("td").nth(1).click(),
    ]);

    await waitForLocationDetailsPage(page);
  });

  test("should filter by state", async ({ page }) => {
    await gotoRankingsPage(page);

    const stateSelect = page.getByTestId("rankings-state-filter");
    await openCustomSelect(page, stateSelect);
    const firstStateOption = getOpenCustomSelectOptions(page).first();
    const firstStateOptionText = await firstStateOption.textContent();
    const stateLabel = firstStateOptionText?.trim();
    expect(stateLabel).toBeTruthy();
    await firstStateOption.click();

    await waitForStableSelect(stateSelect);
    await expect(stateSelect).toContainText(stateLabel ?? "");

    await expect(getFirstRow(page)).toBeVisible({ timeout: 10_000 });
    await expect(getFirstRow(page).locator("td").nth(2)).toContainText(
      stateLabel ?? "",
    );
  });

  test("should filter by thermal stress level", async ({ page }) => {
    await gotoRankingsPage(page);

    const heatStressSelect = page.getByTestId("rankings-heat-stress-filter");
    await openCustomSelect(page, heatStressSelect);
    const firstOption = getOpenCustomSelectOptions(page).first();
    const firstOptionText = await firstOption.textContent();
    const optionLabel = firstOptionText?.trim();
    expect(optionLabel).toBeTruthy();
    await firstOption.click();

    await waitForStableSelect(heatStressSelect);
    await expect(heatStressSelect).toContainText(optionLabel ?? "");

    await expect(getFirstRow(page)).toBeVisible({ timeout: 15_000 });
  });

  test("should filter by season and update rankings", async ({ page }) => {
    await gotoRankingsPage(page);

    const seasonFilter = page.getByTestId("rankings-season-filter");

    await selectCustomOption(page, seasonFilter, /^Summer$/u);
    await waitForStableSelect(seasonFilter);
    await expect(seasonFilter).toContainText("Summer");
    await expect(getFirstRow(page)).toBeVisible({ timeout: 10_000 });

    // Selecting a season persists it via a fire-and-forget server action that
    // writes the rankings-season cookie. Wait for that write to land before
    // reloading; otherwise the reload can beat the cookie and the server
    // re-renders with the default season.
    await expect(async () => {
      const cookies = await page.context().cookies();
      const seasonCookie = cookies.find(
        (cookie) => cookie.name === "rankings-season",
      );
      expect(seasonCookie?.value).toBe("Summer");
    }).toPass({ timeout: 10_000 });

    await page.reload();
    await waitForStableSelect(seasonFilter);
    await expect(seasonFilter).toContainText("Summer");
  });

  test("should default to daily max and switch basis via the header toggle", async ({
    page,
  }) => {
    await gotoRankingsPage(page);

    const firstRow = getFirstRow(page);

    const basisToggle = page.getByRole("button", {
      name: /switch to daily (?<basis>average|maximum) pet/iu,
    });
    await expect(basisToggle).toHaveText("Daily Max");

    const initialRowText = await firstRow.textContent();

    await basisToggle.click();
    await expect(basisToggle).toHaveText("Daily Avg");

    await expect(async () => {
      expect(await firstRow.textContent()).not.toStrictEqual(initialRowText);
    }).toPass({ timeout: 10_000 });

    const cookies = await page.context().cookies();
    const basisCookie = cookies.find((cookie) => cookie.name === "pet-basis");
    expect(basisCookie?.value).toBe("avg");

    await page.reload();
    await expect(basisToggle).toHaveText("Daily Avg");
  });
});

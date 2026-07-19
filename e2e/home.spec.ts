import { expect, test } from "./fixtures";
import { waitForDataResponse } from "./utils/api";
import { selectCustomOption } from "./utils/custom-select";
import {
  MAP_CONTAINER_SELECTOR,
  gotoAndWaitForMapPage,
  navigateToLocationDetailsFromMap,
  openLocationDetailsModal,
} from "./utils/map-page";

test.describe("Home Page", () => {
  test("should open and close the location modal from a marker", async ({
    page,
  }) => {
    await gotoAndWaitForMapPage(page, "/");
    const { modal, viewDetailsButton } = await openLocationDetailsModal(page);
    await expect(modal).toBeVisible();
    await expect(viewDetailsButton).toBeVisible();

    await modal.getByRole("button", { name: "Close" }).click();

    await expect(modal).toBeHidden();
    await expect(page.locator(MAP_CONTAINER_SELECTOR)).toBeVisible();
  });

  test("should navigate to location details from modal action", async ({
    page,
  }) => {
    await navigateToLocationDetailsFromMap(page, "/");
  });

  test("should apply basis, season, measure, and forecast controls in the home modal", async ({
    page,
  }) => {
    await gotoAndWaitForMapPage(page, "/");

    const basisToggle = page.getByRole("button", {
      name: /switch to daily (?<basis>average|maximum) pet/iu,
    });
    await expect(basisToggle).toHaveText("Daily Max");
    await basisToggle.click();
    await expect(basisToggle).toHaveText("Daily Avg");

    const [, { modal }] = await Promise.all([
      waitForDataResponse(page, "trend", { basis: "avg" }),
      openLocationDetailsModal(page),
    ]);

    const seasonTrigger = modal
      .locator('[data-slot="select-trigger"]')
      .filter({ hasText: "Annual" });
    await Promise.all([
      waitForDataResponse(page, "trend", { basis: "avg", season: "Summer" }),
      selectCustomOption(page, seasonTrigger, /^Summer$/u),
    ]);

    const measureTrigger = modal
      .locator('[data-slot="select-trigger"]')
      .filter({ hasText: "Average" });
    await Promise.all([
      waitForDataResponse(page, "trend", {
        basis: "avg",
        option: "max",
        season: "Summer",
      }),
      selectCustomOption(page, measureTrigger, /^Max$/u),
    ]);

    await Promise.all([
      waitForDataResponse(page, "forecast", {
        basis: "avg",
        yearsAhead: "10",
      }),
      modal.getByLabel("Show Forecast").check(),
    ]);

    await expect(modal.getByText(/by end of 2035/iu)).toBeVisible({
      timeout: 10_000,
    });
  });
});

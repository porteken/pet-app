import { expect, test } from "@playwright/test";

import { MARKER_SELECTOR } from "./utils/map-marker";
import {
  gotoAndWaitForMapPage,
  navigateToLocationDetailsFromMap,
  openLocationDetailsModal,
} from "./utils/map-page";

test.describe("Map Page", () => {
  test("should display the map and markers", async ({ page }) => {
    await gotoAndWaitForMapPage(page, "/map");
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const marker = page.locator(MARKER_SELECTOR).first();
    await expect(marker).toBeVisible({ timeout: 10_000 });
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await gotoAndWaitForMapPage(page, "/map");
    const { modal, viewDetailsButton } = await openLocationDetailsModal(page);
    await expect(modal).toBeVisible();
    await expect(viewDetailsButton).toBeVisible();
  });

  test("should navigate to selected location from map modal", async ({
    page,
  }) => {
    await navigateToLocationDetailsFromMap(page, "/map");
    await expect(page.getByText("Trend Analysis")).toBeVisible();
  });
});

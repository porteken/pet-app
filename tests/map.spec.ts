import { expect, test } from "@playwright/test";

import { clickClickableMarker, MARKER_SELECTOR } from "./utils/map-marker";

test.describe("Map Page", () => {
  test("should display the map and markers", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const marker = page.locator(MARKER_SELECTOR).first();
    await expect(marker).toBeVisible({ timeout: 10_000 });
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await clickClickableMarker(page);
    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should navigate to selected location from map modal", async ({
    page,
  }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await clickClickableMarker(page);
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });

    const viewDetailsButton = page.getByRole("button", {
      name: "View Full Details",
    });
    await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });
    await expect(viewDetailsButton).toBeEnabled({ timeout: 10_000 });
    await viewDetailsButton.click();
    await expect(page).toHaveURL(/\/\d+(?:\?.*)?$/, { timeout: 30_000 });

    await expect(page.getByText("Trend Analysis")).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

import { clickClickableMarker } from "./helpers/map";

test.describe("Map Page", () => {
  test("should display the map and markers", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });

    await marker.dispatchEvent("click");
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
    await Promise.all([
      page.waitForURL(/\/\d+(?:\?.*)?$/),
      viewDetailsButton.click(),
    ]);

    await expect(page.getByText("Trend Analysis")).toBeVisible();
  });
});

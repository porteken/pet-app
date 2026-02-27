import { expect, test } from "@playwright/test";

import { clickClickableMarker } from "./utils/map-marker";

test.describe("Home Page", () => {
  test("should display the map and locations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("Loading map...").first()).toBeHidden({
      timeout: 30_000,
    });
    await clickClickableMarker(page);
    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should navigate to location details from modal action", async ({
    page,
  }) => {
    await page.goto("/");
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

    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 10_000,
    });
  });
});

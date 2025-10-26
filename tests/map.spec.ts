import { expect, test } from "@playwright/test";

test.describe("Map Page", () => {
  test("should display the map and markers", async ({ page }) => {
    await page.goto("/map");
    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await page.goto("/map");
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });

    await marker.click({ force: true });
    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible({ timeout: 10_000 });
  });
});

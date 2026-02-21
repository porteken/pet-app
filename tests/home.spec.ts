import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the map and locations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Loading map...")).toBeHidden({
      timeout: 10_000,
    });
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("should open modal with details when a marker is clicked", async ({
    page,
  }) => {
    await page.goto("/");
    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });

    await marker.click({ force: true });
    await expect(
      page.getByRole("button", { name: "View Full Details" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("should navigate to location details from modal action", async ({
    page,
  }) => {
    await page.goto("/");

    const marker = page.locator(".leaflet-marker-icon").first();
    await expect(marker).toBeVisible({ timeout: 10_000 });

    await marker.click({ force: true });

    const viewDetailsButton = page.getByRole("button", {
      name: "View Full Details",
    });
    await expect(viewDetailsButton).toBeVisible({ timeout: 10_000 });
    await expect(viewDetailsButton).toBeEnabled();
    await viewDetailsButton.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/\d+$/);
    await expect(page.getByText("Trend Analysis")).toBeVisible({
      timeout: 15_000,
    });
  });
});

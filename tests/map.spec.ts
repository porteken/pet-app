import { expect, type Page, test } from "@playwright/test";

const MARKER_SELECTOR = ".leaflet-marker-icon";
const MARKER_VISIBILITY_TIMEOUT = 10_000;

export async function clickClickableMarker(page: Page): Promise<void> {
  const markers = page.locator(MARKER_SELECTOR);
  await expect(markers.first()).toBeVisible({
    timeout: MARKER_VISIBILITY_TIMEOUT,
  });

  const markerCount = await markers.count();
  for (let index = 0; index < markerCount; index += 1) {
    const marker = markers.nth(index);

    try {
      await marker.scrollIntoViewIfNeeded();
      await marker.click({ timeout: 1500, trial: true });
      await marker.click();
      return;
    } catch {
      // Try the next marker if this one is not interactable.
    }
  }

  throw new Error("Unable to click a map marker without using force.");
}

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

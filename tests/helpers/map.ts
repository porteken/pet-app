import { expect, type Page } from "@playwright/test";

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

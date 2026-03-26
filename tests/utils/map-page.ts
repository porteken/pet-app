import { expect, type Locator, type Page } from "@playwright/test";

import { clickClickableMarker } from "./map-marker";

const MAP_LOAD_TIMEOUT = 30_000;
const MODAL_TIMEOUT = 10_000;

export async function gotoAndWaitForMapPage(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await waitForMapPage(page);
}

export async function navigateToLocationDetailsFromMap(page: Page, route: string): Promise<void> {
  await gotoAndWaitForMapPage(page, route);

  const { viewDetailsButton } = await openLocationDetailsModal(page);

  await expect(viewDetailsButton).toBeEnabled({ timeout: MODAL_TIMEOUT });
  await viewDetailsButton.click();
  await expect(page).toHaveURL(/\/\d+(?:\?.*)?$/, {
    timeout: MAP_LOAD_TIMEOUT,
  });
  await expect(page.getByText("Trend Analysis")).toBeVisible({
    timeout: MODAL_TIMEOUT,
  });
}

export async function openLocationDetailsModal(
  page: Page
): Promise<{ modal: Locator; viewDetailsButton: Locator }> {
  await clickClickableMarker(page);

  const modal = page.getByRole("dialog");
  const viewDetailsButton = page.getByRole("button", {
    name: "View Full Details",
  });

  await expect(modal).toBeVisible({ timeout: MODAL_TIMEOUT });
  await expect(viewDetailsButton).toBeVisible({ timeout: MODAL_TIMEOUT });

  return { modal, viewDetailsButton };
}

export async function waitForMapPage(page: Page): Promise<void> {
  await expect(page.getByText("Loading map...").first()).toBeHidden({
    timeout: MAP_LOAD_TIMEOUT,
  });
  await expect(page.locator(".leaflet-container")).toBeVisible();
}
